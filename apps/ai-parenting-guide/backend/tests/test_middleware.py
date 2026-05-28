"""
Edge-case tests for middleware components.

Covers: security headers, rate-limit middleware, request logging,
and endpoint-type detection.
"""

from unittest.mock import MagicMock, AsyncMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.middleware import (
    SecurityHeadersMiddleware,
    RateLimitMiddleware,
    RequestLoggingMiddleware,
)


# ---------------------------------------------------------------------------
# SecurityHeadersMiddleware
# ---------------------------------------------------------------------------

class TestSecurityHeadersMiddleware:

    def _app(self):
        app = FastAPI()

        @app.get("/test")
        async def test_endpoint():
            return {"ok": True}

        app.add_middleware(SecurityHeadersMiddleware)
        return app

    def test_security_headers_present(self):
        client = TestClient(self._app())
        resp = client.get("/test")
        assert resp.status_code == 200
        assert resp.headers.get("x-content-type-options") == "nosniff"
        assert resp.headers.get("x-frame-options") == "DENY"
        assert resp.headers.get("x-xss-protection") == "1; mode=block"
        assert "strict-origin" in resp.headers.get("referrer-policy", "")

    def test_headers_on_404(self):
        client = TestClient(self._app())
        resp = client.get("/nonexistent")
        assert resp.status_code == 404
        assert resp.headers.get("x-content-type-options") == "nosniff"


# ---------------------------------------------------------------------------
# RequestLoggingMiddleware
# ---------------------------------------------------------------------------

class TestRequestLoggingMiddleware:

    def _app(self):
        app = FastAPI()

        @app.get("/ok")
        async def ok_endpoint():
            return {"status": "ok"}

        @app.get("/error")
        async def error_endpoint():
            raise RuntimeError("test error")

        app.add_middleware(RequestLoggingMiddleware)
        return app

    def test_successful_request_logged(self):
        client = TestClient(self._app())
        resp = client.get("/ok")
        assert resp.status_code == 200

    def test_error_request_logged(self):
        client = TestClient(self._app(), raise_server_exceptions=False)
        resp = client.get("/error")
        assert resp.status_code == 500


# ---------------------------------------------------------------------------
# RateLimitMiddleware — endpoint type detection
# ---------------------------------------------------------------------------

class TestRateLimitEndpointDetection:

    def test_ai_endpoint_detection(self):
        with patch("app.core.middleware.RateLimiter"), \
             patch("app.core.middleware.get_db"):
            middleware = RateLimitMiddleware(MagicMock())
            assert middleware._determine_endpoint_type("/api/v1/ai/generate") == "ai"
            assert middleware._determine_endpoint_type("/api/v1/ai/tutoring") == "ai"

    def test_upload_endpoint_detection(self):
        with patch("app.core.middleware.RateLimiter"), \
             patch("app.core.middleware.get_db"):
            middleware = RateLimitMiddleware(MagicMock())
            assert middleware._determine_endpoint_type("/api/v1/content/upload") == "upload"

    def test_general_endpoint_detection(self):
        with patch("app.core.middleware.RateLimiter"), \
             patch("app.core.middleware.get_db"):
            middleware = RateLimitMiddleware(MagicMock())
            assert middleware._determine_endpoint_type("/api/v1/users/me") == "general"
            assert middleware._determine_endpoint_type("/api/v1/forum/threads") == "general"

    def test_public_endpoints_list(self):
        with patch("app.core.middleware.RateLimiter"), \
             patch("app.core.middleware.get_db"):
            middleware = RateLimitMiddleware(MagicMock())
            assert "/" in middleware.public_endpoints
            assert "/health" in middleware.public_endpoints
            assert "/docs" in middleware.public_endpoints


# ---------------------------------------------------------------------------
# RateLimitMiddleware — integration with app
# ---------------------------------------------------------------------------

class TestRateLimitMiddlewareIntegration:

    def _app(self):
        app = FastAPI()

        @app.get("/")
        async def root():
            return {"healthy": True}

        @app.get("/health")
        async def health():
            return {"status": "ok"}

        with patch("app.core.middleware.RateLimiter"), \
             patch("app.core.middleware.get_db"):
            app.add_middleware(RateLimitMiddleware)
        return app

    def test_public_endpoint_skips_rate_limit(self):
        """Public endpoints should not be rate limited."""
        client = TestClient(self._app())
        resp = client.get("/")
        assert resp.status_code == 200

    def test_health_skips_rate_limit(self):
        client = TestClient(self._app())
        resp = client.get("/health")
        assert resp.status_code == 200
