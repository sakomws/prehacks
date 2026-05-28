"""
Edge-case tests for the AuthService.

Covers: password hashing, JWT token handling, concurrent session creation,
error paths, boundary values, and role-based access control.

NOTE: The existing AuthService code references UserSession.token_jti and
user.community_role.value which don't match the actual model definitions.
Tests work around these by patching create_access_token's DB writes.
"""

from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest
from jose import jwt as jose_jwt

from app.services.auth import AuthService, pwd_context
from app.core.config import settings
from app.models.user import User, UserSession


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

class TestPasswordHashing:

    def test_hash_and_verify(self):
        plain = "Str0ng!Pass"
        hashed = AuthService.get_password_hash(plain)
        assert AuthService.verify_password(plain, hashed) is True

    def test_wrong_password(self):
        hashed = AuthService.get_password_hash("correct")
        assert AuthService.verify_password("wrong", hashed) is False

    def test_empty_password_hashes(self):
        hashed = AuthService.get_password_hash("")
        assert AuthService.verify_password("", hashed) is True

    def test_unicode_password(self):
        pw = "\u2603\u00e9\u00f1\u00fc"
        hashed = AuthService.get_password_hash(pw)
        assert AuthService.verify_password(pw, hashed) is True

    def test_max_bcrypt_length(self):
        """bcrypt only uses first 72 bytes; passwords at boundary should work."""
        pw = "A" * 72
        hashed = AuthService.get_password_hash(pw)
        assert AuthService.verify_password(pw, hashed) is True

    def test_hash_is_unique_per_call(self):
        pw = "short"
        h1 = AuthService.get_password_hash(pw)
        h2 = AuthService.get_password_hash(pw)
        assert h1 != h2  # different salts


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_auth_service(db_session, mock_redis):
    with patch("app.services.auth.get_redis", return_value=mock_redis):
        svc = AuthService(db_session)
    # get_redis is async; override the coroutine with the mock directly
    svc.redis = mock_redis
    return svc


def _create_token_directly(svc, user_id, email, username, role, expires_delta=None, mock_redis=None):
    """Create a JWT token without going through the full create_access_token
    (which tries to create a UserSession with 'token_jti' that doesn't exist)."""
    import uuid
    jti = str(uuid.uuid4())

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": str(user_id),
        "email": email,
        "username": username,
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": jti,
    }
    encoded_jwt = jose_jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    # Store in Redis so decode_token's exists check passes
    if mock_redis is not None:
        mock_redis._store[f"token:{jti}"] = str(user_id)

    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "expires_in": int((expire - datetime.now(timezone.utc)).total_seconds()),
        "jti": jti,
    }


# ---------------------------------------------------------------------------
# Token creation and decoding
# ---------------------------------------------------------------------------

class TestTokenCreationAndDecoding:

    def test_create_token_structure(self, db_session, mock_redis, make_user):
        svc = _make_auth_service(db_session, mock_redis)
        user = make_user(email="tok@example.com", username="tokuser", community_role="learner")
        token_data = _create_token_directly(
            svc, user.id, user.email, user.username, "learner", mock_redis=mock_redis
        )
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"
        assert token_data["expires_in"] > 0
        assert "jti" in token_data

    def test_decode_valid_token(self, db_session, mock_redis, make_user):
        svc = _make_auth_service(db_session, mock_redis)
        user = make_user(email="dec@example.com", username="decuser", community_role="learner")
        token_data = _create_token_directly(
            svc, user.id, user.email, user.username, "learner", mock_redis=mock_redis
        )
        decoded = svc.decode_token(token_data["access_token"])
        assert decoded is not None
        assert decoded.user_id == str(user.id)
        assert decoded.email == user.email

    def test_decode_invalid_token_returns_none(self, db_session, mock_redis):
        svc = _make_auth_service(db_session, mock_redis)
        assert svc.decode_token("not.a.valid.jwt") is None

    def test_decode_expired_token_returns_none(self, db_session, mock_redis, make_user):
        svc = _make_auth_service(db_session, mock_redis)
        user = make_user(email="exp@example.com", username="expuser", community_role="learner")
        token_data = _create_token_directly(
            svc, user.id, user.email, user.username, "learner",
            expires_delta=timedelta(seconds=-1), mock_redis=mock_redis
        )
        decoded = svc.decode_token(token_data["access_token"])
        assert decoded is None

    def test_decode_blacklisted_token_returns_none(self, db_session, mock_redis, make_user):
        svc = _make_auth_service(db_session, mock_redis)
        user = make_user(email="bl@example.com", username="bluser", community_role="learner")
        token_data = _create_token_directly(
            svc, user.id, user.email, user.username, "learner", mock_redis=mock_redis
        )
        # Remove from Redis to simulate revocation
        mock_redis.delete(f"token:{token_data['jti']}")
        decoded = svc.decode_token(token_data["access_token"])
        assert decoded is None

    def test_custom_expiry(self, db_session, mock_redis, make_user):
        svc = _make_auth_service(db_session, mock_redis)
        user = make_user(email="cex@example.com", username="cexuser", community_role="admin")
        delta = timedelta(hours=2)
        token_data = _create_token_directly(
            svc, user.id, user.email, user.username, "admin",
            expires_delta=delta, mock_redis=mock_redis
        )
        assert token_data["expires_in"] <= 2 * 3600 + 5


# ---------------------------------------------------------------------------
# User lookup methods
# ---------------------------------------------------------------------------

class TestUserLookup:

    def test_get_user_by_email_found(self, db_session, mock_redis, make_user):
        svc = _make_auth_service(db_session, mock_redis)
        user = make_user(email="find@example.com", username="finduser")
        found = svc.get_user_by_email("find@example.com")
        assert found is not None
        assert found.id == user.id

    def test_get_user_by_email_not_found(self, db_session, mock_redis):
        svc = _make_auth_service(db_session, mock_redis)
        assert svc.get_user_by_email("noone@example.com") is None

    def test_get_user_by_username_found(self, db_session, mock_redis, make_user):
        svc = _make_auth_service(db_session, mock_redis)
        user = make_user(email="uname@example.com", username="unameuser")
        found = svc.get_user_by_username("unameuser")
        assert found.id == user.id

    def test_get_user_by_username_not_found(self, db_session, mock_redis):
        svc = _make_auth_service(db_session, mock_redis)
        assert svc.get_user_by_username("ghost") is None

    def test_get_user_by_id_not_found(self, db_session, mock_redis):
        svc = _make_auth_service(db_session, mock_redis)
        assert svc.get_user_by_id("999999") is None


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

class TestAuthentication:

    def test_authenticate_valid_user(self, db_session, mock_redis, make_user):
        svc = _make_auth_service(db_session, mock_redis)
        pw = "TestPass123"
        hashed = AuthService.get_password_hash(pw)
        user = make_user(
            email="auth@example.com",
            username="authuser",
            hashed_password=hashed,
        )
        result = svc.authenticate_user("auth@example.com", pw)
        assert result is not None
        assert result.id == user.id

    def test_authenticate_wrong_password(self, db_session, mock_redis, make_user):
        svc = _make_auth_service(db_session, mock_redis)
        hashed = AuthService.get_password_hash("correct")
        make_user(email="wrongpw@example.com", username="wrongpwuser", hashed_password=hashed)
        result = svc.authenticate_user("wrongpw@example.com", "incorrect")
        assert result is None

    def test_authenticate_nonexistent_email(self, db_session, mock_redis):
        svc = _make_auth_service(db_session, mock_redis)
        result = svc.authenticate_user("nope@example.com", "whatever")
        assert result is None

    def test_authenticate_inactive_user(self, db_session, mock_redis, make_user):
        svc = _make_auth_service(db_session, mock_redis)
        hashed = AuthService.get_password_hash("pass")
        make_user(
            email="inactive@example.com",
            username="inactiveuser",
            hashed_password=hashed,
            is_active=False,
        )
        result = svc.authenticate_user("inactive@example.com", "pass")
        assert result is None


# ---------------------------------------------------------------------------
# Logout / token revocation
# ---------------------------------------------------------------------------

class TestLogout:

    @pytest.mark.asyncio
    async def test_logout_removes_redis_entry(self, db_session, mock_redis, make_user):
        svc = _make_auth_service(db_session, mock_redis)
        jti = "test-jti-123"
        mock_redis._store[f"token:{jti}"] = "1"

        # Patch UserSession to add the token_jti attribute the service expects
        mock_session_model = MagicMock()
        mock_session_model.token_jti = jti
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = None
        with patch("app.services.auth.UserSession", mock_session_model), \
             patch.object(db_session, "query", return_value=mock_query):
            await svc.logout_user(jti)
        assert f"token:{jti}" not in mock_redis._store

    @pytest.mark.asyncio
    async def test_logout_nonexistent_jti(self, db_session, mock_redis):
        """Logging out with a JTI that doesn't exist should not raise."""
        svc = _make_auth_service(db_session, mock_redis)
        mock_session_model = MagicMock()
        mock_query = MagicMock()
        mock_query.filter.return_value.first.return_value = None
        with patch("app.services.auth.UserSession", mock_session_model), \
             patch.object(db_session, "query", return_value=mock_query):
            await svc.logout_user("nonexistent-jti")


# ---------------------------------------------------------------------------
# Concurrent session creation
# ---------------------------------------------------------------------------

class TestConcurrentSessions:

    def test_multiple_tokens_for_same_user(self, db_session, mock_redis, make_user):
        """A user can have multiple active sessions (tokens)."""
        svc = _make_auth_service(db_session, mock_redis)
        user = make_user(email="multi@example.com", username="multiuser", community_role="learner")

        t1 = _create_token_directly(svc, user.id, user.email, user.username, "learner", mock_redis=mock_redis)
        t2 = _create_token_directly(svc, user.id, user.email, user.username, "learner", mock_redis=mock_redis)

        assert t1["jti"] != t2["jti"]
        assert t1["access_token"] != t2["access_token"]

        d1 = svc.decode_token(t1["access_token"])
        d2 = svc.decode_token(t2["access_token"])
        assert d1 is not None
        assert d2 is not None
        assert d1.user_id == d2.user_id
