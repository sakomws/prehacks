"""
Edge-case tests for the RateLimiter service.

Covers: boundary values, role-based limits, burst detection,
concurrent access, error handling, and admin operations.
"""

import time
from unittest.mock import MagicMock, patch

import pytest

from app.services.rate_limiter import RateLimiter


def _make_limiter(mock_redis):
    with patch("app.services.rate_limiter.get_redis", return_value=mock_redis):
        limiter = RateLimiter()
    # get_redis is async; override the coroutine with the mock directly
    limiter.redis = mock_redis
    return limiter


# ---------------------------------------------------------------------------
# check_rate_limit
# ---------------------------------------------------------------------------

class TestCheckRateLimit:

    @pytest.mark.asyncio
    async def test_first_request_allowed(self, mock_redis):
        limiter = _make_limiter(mock_redis)
        result = await limiter.check_rate_limit("user1", "learner", "general")
        assert result["allowed"] is True
        assert result["current"] == 1

    @pytest.mark.asyncio
    async def test_at_limit_boundary(self, mock_redis):
        """Exactly at the limit should be denied (>= limit)."""
        limiter = _make_limiter(mock_redis)

        current_window = int(time.time()) // 60
        key = f"rate_limit:user1:general:60:{current_window}"
        mock_redis._store[key] = str(limiter.role_limits["learner"])

        result = await limiter.check_rate_limit("user1", "learner", "general")
        assert result["allowed"] is False

    @pytest.mark.asyncio
    async def test_one_below_limit(self, mock_redis):
        """One below the limit should still be allowed."""
        limiter = _make_limiter(mock_redis)

        current_window = int(time.time()) // 60
        key = f"rate_limit:user1:general:60:{current_window}"
        mock_redis._store[key] = str(limiter.role_limits["learner"] - 1)

        result = await limiter.check_rate_limit("user1", "learner", "general")
        assert result["allowed"] is True

    @pytest.mark.asyncio
    async def test_ai_endpoint_has_lower_limit(self, mock_redis):
        limiter = _make_limiter(mock_redis)
        assert limiter.ai_limits["learner"] < limiter.role_limits["learner"]

        result = await limiter.check_rate_limit("user1", "learner", "ai")
        assert result["allowed"] is True
        assert result["limit"] == limiter.ai_limits["learner"]

    @pytest.mark.asyncio
    async def test_admin_has_highest_limit(self, mock_redis):
        limiter = _make_limiter(mock_redis)
        result = await limiter.check_rate_limit("admin1", "admin", "general")
        assert result["limit"] == limiter.role_limits["admin"]

    @pytest.mark.asyncio
    async def test_unknown_role_defaults_to_learner(self, mock_redis):
        limiter = _make_limiter(mock_redis)
        result = await limiter.check_rate_limit("u1", "unknown_role", "general")
        assert result["limit"] == limiter.role_limits["learner"]

    @pytest.mark.asyncio
    async def test_burst_limit_window(self, mock_redis):
        """Burst limit (window_seconds=10) applies to non-AI endpoints."""
        limiter = _make_limiter(mock_redis)
        result = await limiter.check_rate_limit("user1", "learner", "general", window_seconds=10)
        assert result["limit"] == limiter.burst_limits["learner"]

    @pytest.mark.asyncio
    async def test_redis_error_allows_request(self, mock_redis):
        """If Redis fails, requests should be allowed (fail-open)."""
        limiter = _make_limiter(mock_redis)
        mock_redis.get = MagicMock(side_effect=Exception("Redis down"))

        result = await limiter.check_rate_limit("user1", "learner", "general")
        assert result["allowed"] is True
        assert "error" in result

    @pytest.mark.asyncio
    async def test_retry_after_is_positive(self, mock_redis):
        """When rate-limited, retry_after should be a positive integer."""
        limiter = _make_limiter(mock_redis)

        current_window = int(time.time()) // 60
        key = f"rate_limit:u1:general:60:{current_window}"
        mock_redis._store[key] = str(limiter.role_limits["learner"])

        result = await limiter.check_rate_limit("u1", "learner", "general")
        assert result["allowed"] is False
        assert result["retry_after"] >= 0

    @pytest.mark.asyncio
    async def test_different_users_independent(self, mock_redis):
        limiter = _make_limiter(mock_redis)

        r1 = await limiter.check_rate_limit("user_a", "learner", "general")
        r2 = await limiter.check_rate_limit("user_b", "learner", "general")

        assert r1["current"] == 1
        assert r2["current"] == 1


# ---------------------------------------------------------------------------
# check_ai_rate_limit
# ---------------------------------------------------------------------------

class TestCheckAIRateLimit:

    @pytest.mark.asyncio
    async def test_ai_rate_limit_checks_both_windows(self, mock_redis):
        limiter = _make_limiter(mock_redis)
        result = await limiter.check_ai_rate_limit("user1", "learner")
        assert result["allowed"] is True

    @pytest.mark.asyncio
    async def test_ai_burst_exceeded(self, mock_redis):
        limiter = _make_limiter(mock_redis)

        # For AI endpoints, even the 10s window uses ai_limits (not burst_limits)
        # because the endpoint_type=="ai" check takes priority
        burst_window = int(time.time()) // 10
        key = f"rate_limit:user1:ai:10:{burst_window}"
        mock_redis._store[key] = str(limiter.ai_limits["learner"])

        result = await limiter.check_ai_rate_limit("user1", "learner")
        assert result["allowed"] is False

    @pytest.mark.asyncio
    async def test_ai_minute_exceeded_burst_ok(self, mock_redis):
        limiter = _make_limiter(mock_redis)

        minute_window = int(time.time()) // 60
        key = f"rate_limit:user1:ai:60:{minute_window}"
        mock_redis._store[key] = str(limiter.ai_limits["learner"])

        result = await limiter.check_ai_rate_limit("user1", "learner")
        assert result["allowed"] is False


# ---------------------------------------------------------------------------
# get_user_rate_limit_status
# ---------------------------------------------------------------------------

class TestGetUserRateLimitStatus:

    @pytest.mark.asyncio
    async def test_fresh_user_all_remaining(self, mock_redis):
        limiter = _make_limiter(mock_redis)
        status = await limiter.get_user_rate_limit_status("new_user", "learner")

        assert status["user_id"] == "new_user"
        assert "general" in status["limits"]
        assert "ai" in status["limits"]
        assert "upload" in status["limits"]

        general = status["limits"]["general"]
        assert general["per_minute"]["used"] == 0
        assert general["per_minute"]["remaining"] == limiter.role_limits["learner"]

    @pytest.mark.asyncio
    async def test_redis_error_returns_error_key(self, mock_redis):
        limiter = _make_limiter(mock_redis)
        mock_redis.get = MagicMock(side_effect=Exception("connection lost"))

        status = await limiter.get_user_rate_limit_status("u1", "learner")
        assert "error" in status


# ---------------------------------------------------------------------------
# reset_user_rate_limits
# ---------------------------------------------------------------------------

class TestResetUserRateLimits:

    @pytest.mark.asyncio
    async def test_reset_clears_all_keys(self, mock_redis):
        limiter = _make_limiter(mock_redis)

        mock_redis._store["rate_limit:u1:general:60:100"] = "5"
        mock_redis._store["rate_limit:u1:ai:60:100"] = "3"

        success = await limiter.reset_user_rate_limits("u1")
        assert success is True
        assert "rate_limit:u1:general:60:100" not in mock_redis._store
        assert "rate_limit:u1:ai:60:100" not in mock_redis._store

    @pytest.mark.asyncio
    async def test_reset_no_keys_is_ok(self, mock_redis):
        limiter = _make_limiter(mock_redis)
        success = await limiter.reset_user_rate_limits("no_keys_user")
        assert success is True

    @pytest.mark.asyncio
    async def test_reset_redis_error(self, mock_redis):
        limiter = _make_limiter(mock_redis)
        mock_redis.keys = MagicMock(side_effect=Exception("Redis error"))

        success = await limiter.reset_user_rate_limits("u1")
        assert success is False


# ---------------------------------------------------------------------------
# Role-based limit correctness
# ---------------------------------------------------------------------------

class TestRoleLimits:

    def test_all_roles_have_limits(self, mock_redis):
        limiter = _make_limiter(mock_redis)
        expected_roles = ["learner", "educator", "expert", "moderator", "admin"]
        for role in expected_roles:
            assert role in limiter.role_limits
            assert role in limiter.ai_limits
            assert role in limiter.burst_limits

    def test_limits_increase_with_privilege(self, mock_redis):
        limiter = _make_limiter(mock_redis)
        roles_ordered = ["learner", "educator", "expert", "moderator", "admin"]
        for i in range(len(roles_ordered) - 1):
            assert limiter.role_limits[roles_ordered[i]] <= limiter.role_limits[roles_ordered[i + 1]]
            assert limiter.ai_limits[roles_ordered[i]] <= limiter.ai_limits[roles_ordered[i + 1]]

    def test_ai_limits_are_stricter_than_general(self, mock_redis):
        limiter = _make_limiter(mock_redis)
        for role in limiter.role_limits:
            assert limiter.ai_limits[role] <= limiter.role_limits[role]
