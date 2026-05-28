"""
Edge-case tests for file upload handling.

Covers: the content upload endpoint stub, simulated multipart uploads,
and multimodal input analysis with file-like data.
"""

import io
from unittest.mock import MagicMock, AsyncMock, patch

import pytest
from fastapi import FastAPI, UploadFile
from fastapi.testclient import TestClient

import app.api.v1.endpoints.content as content
import app.api.v1.endpoints.ai as ai
from app.core.database import get_db
from app.services.auth import AuthService
from app.models.user import User


def _make_mock_user():
    user = MagicMock(spec=User)
    user.id = 1
    user.email = "upload@example.com"
    user.username = "uploaduser"
    user.display_name = "Upload User"
    user.community_role = MagicMock(value="educator")
    user.age_group = MagicMock(value="adult")
    user.interest_areas = []
    user.expertise_areas = []
    user.is_active = True
    return user


def _app():
    app = FastAPI()
    app.include_router(content.router, prefix="/content")
    app.include_router(ai.router, prefix="/ai")

    user = _make_mock_user()
    app.dependency_overrides[AuthService.get_current_active_user] = lambda: user
    app.dependency_overrides[AuthService.get_current_user] = lambda: {
        "user_id": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.community_role.value,
        "token": "fake",
        "jti": "fake-jti",
        "user": user,
    }
    app.dependency_overrides[get_db] = lambda: MagicMock()
    return app


# ---------------------------------------------------------------------------
# Content upload endpoint (stub)
# ---------------------------------------------------------------------------

class TestContentUploadStub:

    def test_upload_without_file(self):
        """POST to upload endpoint without a file body should still return 200 (stub)."""
        client = TestClient(_app())
        resp = client.post("/content/upload")
        assert resp.status_code == 200
        assert "Phase 3" in resp.json()["message"]

    def test_upload_with_unexpected_json(self):
        """Sending JSON to the upload endpoint should still return the stub message."""
        client = TestClient(_app())
        resp = client.post("/content/upload", json={"file": "not_real.pdf"})
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Multimodal analysis with image data
# ---------------------------------------------------------------------------

class TestMultimodalImageUpload:

    @patch("app.api.v1.endpoints.ai.GeminiAIService")
    def test_image_base64_content(self, MockGemini):
        """Simulate sending base64-encoded image data for analysis."""
        instance = MockGemini.return_value
        instance.analyze_multimodal_input = AsyncMock(return_value={
            "type": "image_analysis",
            "description": "An image of a chart",
        })
        client = TestClient(_app())

        import base64
        fake_image = base64.b64encode(b"\x89PNG\r\n\x1a\n" + b"\x00" * 100).decode()

        resp = client.post("/ai/analyze-content", json={
            "input_type": "image",
            "content": fake_image,
            "metadata": {"format": "png", "width": 100, "height": 100},
        })
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    @patch("app.api.v1.endpoints.ai.GeminiAIService")
    def test_empty_image_content(self, MockGemini):
        """Empty image content should still be processable at the API level."""
        instance = MockGemini.return_value
        instance.analyze_multimodal_input = AsyncMock(return_value={
            "type": "image_analysis",
            "description": "Empty",
        })
        client = TestClient(_app())
        resp = client.post("/ai/analyze-content", json={
            "input_type": "image",
            "content": "",
        })
        assert resp.status_code == 200

    @patch("app.api.v1.endpoints.ai.GeminiAIService")
    def test_very_large_content(self, MockGemini):
        """Very large content string should be accepted at API level."""
        instance = MockGemini.return_value
        instance.analyze_multimodal_input = AsyncMock(return_value={
            "type": "text_analysis",
            "insights": [],
        })
        client = TestClient(_app())
        large_content = "x" * 100_000
        resp = client.post("/ai/analyze-content", json={
            "input_type": "text",
            "content": large_content,
        })
        assert resp.status_code == 200

    @patch("app.api.v1.endpoints.ai.GeminiAIService")
    def test_mixed_content_analysis(self, MockGemini):
        """Mixed content type with metadata."""
        instance = MockGemini.return_value
        instance.analyze_multimodal_input = AsyncMock(return_value={
            "type": "mixed_analysis",
            "components": ["text", "image"],
        })
        client = TestClient(_app())
        resp = client.post("/ai/analyze-content", json={
            "input_type": "mixed",
            "content": "text and image data combined",
            "metadata": {"components": ["text", "image"]},
        })
        assert resp.status_code == 200

    @patch("app.api.v1.endpoints.ai.GeminiAIService")
    def test_service_error_on_analysis(self, MockGemini):
        """Service exception should return 500."""
        instance = MockGemini.return_value
        instance.analyze_multimodal_input = AsyncMock(
            side_effect=RuntimeError("processing failed")
        )
        client = TestClient(_app())
        resp = client.post("/ai/analyze-content", json={
            "input_type": "text",
            "content": "trigger error",
        })
        assert resp.status_code == 500


# ---------------------------------------------------------------------------
# Concurrent analysis requests
# ---------------------------------------------------------------------------

class TestConcurrentAnalysis:

    @patch("app.api.v1.endpoints.ai.GeminiAIService")
    def test_concurrent_requests(self, MockGemini):
        """Multiple rapid requests should all succeed."""
        instance = MockGemini.return_value
        instance.analyze_multimodal_input = AsyncMock(return_value={
            "type": "text_analysis", "insights": []
        })
        client = TestClient(_app())

        responses = []
        for i in range(10):
            resp = client.post("/ai/analyze-content", json={
                "input_type": "text",
                "content": f"request {i}",
            })
            responses.append(resp)

        assert all(r.status_code == 200 for r in responses)
