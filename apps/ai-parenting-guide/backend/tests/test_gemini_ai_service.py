"""
Edge-case tests for the GeminiAIService.

Covers: boundary values, empty inputs, error paths, caching behaviour,
and concurrent access patterns.
"""

import asyncio
import json
from datetime import datetime, timezone
from unittest.mock import MagicMock, AsyncMock, patch

import pytest

from app.services.gemini_ai import GeminiAIService


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_service(mock_redis):
    """Instantiate GeminiAIService with mocked externals."""
    with patch("app.services.gemini_ai.genai") as mock_genai, \
         patch("app.services.gemini_ai.get_redis", return_value=mock_redis):
        mock_genai.GenerativeModel.return_value = MagicMock()
        mock_genai.types.GenerationConfig.return_value = MagicMock()
        svc = GeminiAIService()
        # get_redis is async — the service calls it at init,
        # so redis attribute is a coroutine; override it with the mock
        svc.redis = mock_redis
    return svc


def _stub_generate(service, text="AI response text"):
    """Stub _generate_text_async to return a mock response."""
    resp = MagicMock()
    resp.text = text
    service._generate_text_async = AsyncMock(return_value=resp)


# ---------------------------------------------------------------------------
# generate_personalized_content
# ---------------------------------------------------------------------------

class TestGeneratePersonalizedContent:
    """Tests for generate_personalized_content."""

    @pytest.mark.asyncio
    async def test_empty_topic(self, mock_redis):
        """An empty topic should still be forwarded (validation is at API layer)."""
        svc = _make_service(mock_redis)
        _stub_generate(svc)

        result = await svc.generate_personalized_content(
            topic="",
            user_preferences={"age_group": "adult"},
            content_type="educational",
            difficulty_level="beginner",
        )
        assert result["topic"] == ""
        assert result["generated_at"] is not None

    @pytest.mark.asyncio
    async def test_max_length_topic(self, mock_redis):
        """A 200-char topic (boundary) should succeed."""
        svc = _make_service(mock_redis)
        _stub_generate(svc)

        long_topic = "A" * 200
        result = await svc.generate_personalized_content(
            topic=long_topic,
            user_preferences={},
            content_type="educational",
            difficulty_level="advanced",
        )
        assert result["topic"] == long_topic

    @pytest.mark.asyncio
    async def test_cache_hit_returns_cached(self, mock_redis):
        """When cached content exists, the AI model should NOT be called."""
        svc = _make_service(mock_redis)
        _stub_generate(svc)

        cached = json.dumps({"content": "cached", "generated_at": "2024-01-01"})
        # Pre-populate the cache using the same key format as the service
        cache_key = f"content:{hash('test_topic:beginner:educational')}"
        mock_redis._store[cache_key] = cached

        result = await svc.generate_personalized_content(
            topic="test_topic",
            user_preferences={},
            content_type="educational",
            difficulty_level="beginner",
        )
        assert result["content"] == "cached"
        svc._generate_text_async.assert_not_called()

    @pytest.mark.asyncio
    async def test_cache_miss_calls_model(self, mock_redis):
        """When nothing is cached, the AI model must be invoked."""
        svc = _make_service(mock_redis)
        _stub_generate(svc)

        result = await svc.generate_personalized_content(
            topic="unique_topic_xyz",
            user_preferences={"age_group": "teen"},
        )
        svc._generate_text_async.assert_called_once()
        assert result["ai_model"] == "gemini-pro"

    @pytest.mark.asyncio
    async def test_model_error_raises_value_error(self, mock_redis):
        """If the model call fails, a ValueError should propagate."""
        svc = _make_service(mock_redis)
        svc._generate_text_async = AsyncMock(side_effect=RuntimeError("model down"))

        with pytest.raises(ValueError, match="Failed to generate content"):
            await svc.generate_personalized_content(
                topic="error_topic",
                user_preferences={},
            )

    @pytest.mark.asyncio
    async def test_special_characters_in_topic(self, mock_redis):
        """Topics with unicode/special chars should not crash."""
        svc = _make_service(mock_redis)
        _stub_generate(svc)

        result = await svc.generate_personalized_content(
            topic="AI & Ethics <script>alert('xss')</script> \u2603",
            user_preferences={},
        )
        assert "<script>" in result["topic"]

    @pytest.mark.asyncio
    async def test_missing_user_preferences_keys(self, mock_redis):
        """Empty user_preferences dict should use defaults in prompt."""
        svc = _make_service(mock_redis)
        _stub_generate(svc)

        result = await svc.generate_personalized_content(
            topic="defaults",
            user_preferences={},
        )
        assert result["personalized"] is True

    @pytest.mark.asyncio
    async def test_concurrent_generation_requests(self, mock_redis):
        """Multiple concurrent calls should each succeed independently."""
        svc = _make_service(mock_redis)
        _stub_generate(svc)

        tasks = [
            svc.generate_personalized_content(
                topic=f"topic_{i}",
                user_preferences={},
            )
            for i in range(5)
        ]
        results = await asyncio.gather(*tasks)
        assert len(results) == 5
        topics = {r["topic"] for r in results}
        assert len(topics) == 5


# ---------------------------------------------------------------------------
# analyze_multimodal_input
# ---------------------------------------------------------------------------

class TestAnalyzeMultimodalInput:
    """Tests for analyze_multimodal_input."""

    @pytest.mark.asyncio
    async def test_text_type(self, mock_redis):
        svc = _make_service(mock_redis)
        result = await svc.analyze_multimodal_input({"type": "text", "content": "hello"})
        assert result["type"] == "text_analysis"

    @pytest.mark.asyncio
    async def test_image_type(self, mock_redis):
        svc = _make_service(mock_redis)
        result = await svc.analyze_multimodal_input({"type": "image", "content": "base64data"})
        assert result["type"] == "image_analysis"

    @pytest.mark.asyncio
    async def test_mixed_type(self, mock_redis):
        svc = _make_service(mock_redis)
        result = await svc.analyze_multimodal_input({"type": "mixed", "content": "data"})
        assert result["type"] == "mixed_analysis"

    @pytest.mark.asyncio
    async def test_unsupported_type_raises(self, mock_redis):
        svc = _make_service(mock_redis)
        with pytest.raises(ValueError, match="Unsupported input type"):
            await svc.analyze_multimodal_input({"type": "video", "content": ""})

    @pytest.mark.asyncio
    async def test_missing_type_defaults_text(self, mock_redis):
        svc = _make_service(mock_redis)
        result = await svc.analyze_multimodal_input({"content": "no type"})
        assert result["type"] == "text_analysis"

    @pytest.mark.asyncio
    async def test_empty_content(self, mock_redis):
        svc = _make_service(mock_redis)
        result = await svc.analyze_multimodal_input({"type": "text", "content": ""})
        assert result["type"] == "text_analysis"

    @pytest.mark.asyncio
    async def test_missing_content_key(self, mock_redis):
        """Missing 'content' key should raise (KeyError wrapped in ValueError)."""
        svc = _make_service(mock_redis)
        with pytest.raises(ValueError, match="Failed to analyze input"):
            await svc.analyze_multimodal_input({"type": "text"})


# ---------------------------------------------------------------------------
# provide_tutoring_response
# ---------------------------------------------------------------------------

class TestProvideTutoringResponse:
    """Tests for provide_tutoring_response."""

    @pytest.mark.asyncio
    async def test_basic_response_structure(self, mock_redis):
        svc = _make_service(mock_redis)
        _stub_generate(svc)

        result = await svc.provide_tutoring_response(
            user_question="What is AI bias?",
            learning_context={"progress_level": "beginner"},
            user_profile={"age_group": "adult"},
        )
        assert "response" in result
        assert "follow_up_questions" in result
        assert "suggested_actions" in result
        assert result["explanation_style"] == "ai_parenting_metaphor"

    @pytest.mark.asyncio
    async def test_empty_question(self, mock_redis):
        svc = _make_service(mock_redis)
        _stub_generate(svc)

        result = await svc.provide_tutoring_response(
            user_question="",
            learning_context={},
            user_profile={},
        )
        assert result["response"] is not None

    @pytest.mark.asyncio
    async def test_very_long_question(self, mock_redis):
        svc = _make_service(mock_redis)
        _stub_generate(svc)

        long_q = "Why? " * 500  # 2500 chars
        result = await svc.provide_tutoring_response(
            user_question=long_q,
            learning_context={},
            user_profile={},
        )
        assert result["response"] is not None

    @pytest.mark.asyncio
    async def test_model_failure(self, mock_redis):
        svc = _make_service(mock_redis)
        svc._generate_text_async = AsyncMock(side_effect=Exception("timeout"))

        with pytest.raises(ValueError, match="Failed to generate tutoring response"):
            await svc.provide_tutoring_response(
                user_question="question",
                learning_context={},
                user_profile={},
            )


# ---------------------------------------------------------------------------
# generate_exercise_feedback
# ---------------------------------------------------------------------------

class TestGenerateExerciseFeedback:
    """Tests for generate_exercise_feedback."""

    @pytest.mark.asyncio
    async def test_correct_answer(self, mock_redis):
        svc = _make_service(mock_redis)
        _stub_generate(svc, text="Great job!")

        result = await svc.generate_exercise_feedback(
            exercise_response={"answer": "A"},
            correct_answer="A",
            learning_objectives=["Understand bias"],
        )
        assert result["feedback"] == "Great job!"
        assert result["generated_at"] is not None

    @pytest.mark.asyncio
    async def test_empty_learning_objectives(self, mock_redis):
        svc = _make_service(mock_redis)
        _stub_generate(svc)

        result = await svc.generate_exercise_feedback(
            exercise_response={"answer": "A"},
            correct_answer="B",
            learning_objectives=[],
        )
        assert "feedback" in result

    @pytest.mark.asyncio
    async def test_model_error_propagates(self, mock_redis):
        svc = _make_service(mock_redis)
        svc._generate_text_async = AsyncMock(side_effect=Exception("GPU OOM"))

        with pytest.raises(ValueError, match="Failed to generate feedback"):
            await svc.generate_exercise_feedback(
                exercise_response={},
                correct_answer="X",
                learning_objectives=["obj"],
            )


# ---------------------------------------------------------------------------
# moderate_content
# ---------------------------------------------------------------------------

class TestModerateContent:
    """Tests for moderate_content."""

    @pytest.mark.asyncio
    async def test_safe_content(self, mock_redis):
        svc = _make_service(mock_redis)
        _stub_generate(svc, text="Content is appropriate.")

        result = await svc.moderate_content(content="Hello world", content_type="text")
        assert result["content_safe"] is True
        assert 0 <= result["safety_score"] <= 1

    @pytest.mark.asyncio
    async def test_empty_content(self, mock_redis):
        svc = _make_service(mock_redis)
        _stub_generate(svc)

        result = await svc.moderate_content(content="", content_type="text")
        assert result["moderated_at"] is not None

    @pytest.mark.asyncio
    async def test_model_error(self, mock_redis):
        svc = _make_service(mock_redis)
        svc._generate_text_async = AsyncMock(side_effect=RuntimeError("blocked"))

        with pytest.raises(ValueError, match="Failed to moderate content"):
            await svc.moderate_content(content="test", content_type="text")


# ---------------------------------------------------------------------------
# translate_content
# ---------------------------------------------------------------------------

class TestTranslateContent:
    """Tests for translate_content."""

    @pytest.mark.asyncio
    async def test_basic_translation(self, mock_redis):
        svc = _make_service(mock_redis)
        _stub_generate(svc, text="Translated content")

        result = await svc.translate_content(
            content="Hello",
            target_language="es",
        )
        assert result["translated_content"] == "Translated content"
        assert result["target_language"] == "es"
        assert result["metaphors_preserved"] is True

    @pytest.mark.asyncio
    async def test_no_preserve_metaphors(self, mock_redis):
        svc = _make_service(mock_redis)
        _stub_generate(svc, text="Direct translation")

        result = await svc.translate_content(
            content="Hello",
            target_language="fr",
            preserve_metaphors=False,
        )
        assert result["metaphors_preserved"] is False

    @pytest.mark.asyncio
    async def test_empty_content_translation(self, mock_redis):
        svc = _make_service(mock_redis)
        _stub_generate(svc, text="")

        result = await svc.translate_content(content="", target_language="de")
        assert result["translated_content"] == ""

    @pytest.mark.asyncio
    async def test_model_error(self, mock_redis):
        svc = _make_service(mock_redis)
        svc._generate_text_async = AsyncMock(side_effect=Exception("quota"))

        with pytest.raises(ValueError, match="Failed to translate content"):
            await svc.translate_content(content="hi", target_language="ja")


# ---------------------------------------------------------------------------
# Private helper method edge cases
# ---------------------------------------------------------------------------

class TestHelperMethods:

    def test_parse_generated_content_returns_structured_false(self, mock_redis):
        svc = _make_service(mock_redis)
        result = svc._parse_generated_content("some text", "educational")
        assert result["structured"] is False
        assert result["content"] == "some text"

    def test_parse_generated_content_empty_text(self, mock_redis):
        svc = _make_service(mock_redis)
        result = svc._parse_generated_content("", "quiz")
        assert result["content"] == ""

    def test_extract_follow_up_questions_empty(self, mock_redis):
        svc = _make_service(mock_redis)
        assert svc._extract_follow_up_questions("no questions here") == []

    def test_extract_suggested_actions_empty(self, mock_redis):
        svc = _make_service(mock_redis)
        assert svc._extract_suggested_actions("no actions") == []

    def test_extract_encouragement(self, mock_redis):
        svc = _make_service(mock_redis)
        msg = svc._extract_encouragement("any text")
        assert "AI parent" in msg

    def test_evaluate_correctness_always_true(self, mock_redis):
        svc = _make_service(mock_redis)
        assert svc._evaluate_correctness({"answer": "wrong"}, "right") is True

    def test_build_content_generation_prompt_uses_defaults(self, mock_redis):
        svc = _make_service(mock_redis)
        prompt = svc._build_content_generation_prompt(
            topic="ethics",
            user_preferences={},
            content_type="educational",
            difficulty_level="beginner",
        )
        assert "ethics" in prompt
        assert "beginner" in prompt

    def test_build_tutoring_prompt_includes_question(self, mock_redis):
        svc = _make_service(mock_redis)
        prompt = svc._build_tutoring_prompt(
            question="What is fairness?",
            context={},
            profile={},
        )
        assert "What is fairness?" in prompt

    def test_build_feedback_prompt_includes_objectives(self, mock_redis):
        svc = _make_service(mock_redis)
        prompt = svc._build_feedback_prompt(
            response={"answer": "A"},
            correct_answer="B",
            objectives=["Learn bias", "Understand fairness"],
        )
        assert "Learn bias" in prompt
        assert "Understand fairness" in prompt
