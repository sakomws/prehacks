"""
Edge-case tests for Pydantic schemas.

Covers: boundary values, empty inputs, validation rules, enum values,
and type coercion edge cases.
"""

import pytest
from pydantic import ValidationError

from app.schemas.learning import (
    LearningModuleCreate,
    LearningModuleUpdate,
    ExerciseCreate,
    ContentCategory,
    DifficultyLevel,
    ExerciseType,
)
from app.schemas.community import DiscussionCreate, CommentCreate
from app.schemas.auth import LoginRequest, RegisterRequest, TokenData
import app.api.v1.endpoints.ai as _ai_mod
ContentGenerationRequest = _ai_mod.ContentGenerationRequest
MultimodalAnalysisRequest = _ai_mod.MultimodalAnalysisRequest
TutoringRequest = _ai_mod.TutoringRequest
ContentModerationRequest = _ai_mod.ContentModerationRequest


# ---------------------------------------------------------------------------
# ContentGenerationRequest
# ---------------------------------------------------------------------------

class TestContentGenerationRequest:

    def test_valid_minimal(self):
        req = ContentGenerationRequest(topic="AI ethics")
        assert req.topic == "AI ethics"
        assert req.content_type == "educational"
        assert req.difficulty_level == "beginner"

    def test_topic_min_length(self):
        req = ContentGenerationRequest(topic="A")
        assert req.topic == "A"

    def test_topic_empty_rejected(self):
        with pytest.raises(ValidationError):
            ContentGenerationRequest(topic="")

    def test_topic_max_length_200(self):
        req = ContentGenerationRequest(topic="B" * 200)
        assert len(req.topic) == 200

    def test_topic_exceeds_max_length(self):
        with pytest.raises(ValidationError):
            ContentGenerationRequest(topic="C" * 201)

    def test_optional_additional_context(self):
        req = ContentGenerationRequest(topic="t", additional_context="extra info")
        assert req.additional_context == "extra info"

    def test_missing_topic_raises(self):
        with pytest.raises(ValidationError):
            ContentGenerationRequest()


# ---------------------------------------------------------------------------
# TutoringRequest
# ---------------------------------------------------------------------------

class TestTutoringRequest:

    def test_question_min_length(self):
        req = TutoringRequest(question="?")
        assert req.question == "?"

    def test_question_empty_rejected(self):
        with pytest.raises(ValidationError):
            TutoringRequest(question="")

    def test_question_max_1000(self):
        req = TutoringRequest(question="x" * 1000)
        assert len(req.question) == 1000

    def test_question_exceeds_1000(self):
        with pytest.raises(ValidationError):
            TutoringRequest(question="y" * 1001)

    def test_context_defaults_to_empty_dict(self):
        req = TutoringRequest(question="q")
        assert req.context == {}


# ---------------------------------------------------------------------------
# ContentModerationRequest
# ---------------------------------------------------------------------------

class TestContentModerationRequest:

    def test_content_min_length(self):
        req = ContentModerationRequest(content="a")
        assert req.content == "a"

    def test_content_empty_rejected(self):
        with pytest.raises(ValidationError):
            ContentModerationRequest(content="")

    def test_content_type_defaults(self):
        req = ContentModerationRequest(content="test")
        assert req.content_type == "text"


# ---------------------------------------------------------------------------
# MultimodalAnalysisRequest
# ---------------------------------------------------------------------------

class TestMultimodalAnalysisRequest:

    def test_valid_request(self):
        req = MultimodalAnalysisRequest(input_type="text", content="hello")
        assert req.metadata == {}

    def test_missing_input_type(self):
        with pytest.raises(ValidationError):
            MultimodalAnalysisRequest(content="hello")

    def test_missing_content(self):
        with pytest.raises(ValidationError):
            MultimodalAnalysisRequest(input_type="text")

    def test_metadata_provided(self):
        req = MultimodalAnalysisRequest(
            input_type="image",
            content="data",
            metadata={"width": 100, "height": 200},
        )
        assert req.metadata["width"] == 100


# ---------------------------------------------------------------------------
# LearningModuleCreate
# ---------------------------------------------------------------------------

class TestLearningModuleCreate:

    def test_valid_module(self):
        mod = LearningModuleCreate(
            title="AI Ethics 101",
            description="Introduction to AI ethics",
            category=ContentCategory.AI_ETHICS_BASICS,
            difficulty=DifficultyLevel.BEGINNER,
            estimated_duration=30,
        )
        assert mod.estimated_duration == 30

    def test_title_empty_rejected(self):
        with pytest.raises(ValidationError):
            LearningModuleCreate(
                title="",
                description="desc",
                category=ContentCategory.AI_ETHICS_BASICS,
                difficulty=DifficultyLevel.BEGINNER,
                estimated_duration=30,
            )

    def test_title_max_200(self):
        mod = LearningModuleCreate(
            title="T" * 200,
            description="desc",
            category=ContentCategory.AI_ETHICS_BASICS,
            difficulty=DifficultyLevel.BEGINNER,
            estimated_duration=30,
        )
        assert len(mod.title) == 200

    def test_title_exceeds_200(self):
        with pytest.raises(ValidationError):
            LearningModuleCreate(
                title="T" * 201,
                description="desc",
                category=ContentCategory.AI_ETHICS_BASICS,
                difficulty=DifficultyLevel.BEGINNER,
                estimated_duration=30,
            )

    def test_duration_zero_rejected(self):
        with pytest.raises(ValidationError):
            LearningModuleCreate(
                title="T",
                description="d",
                category=ContentCategory.AI_ETHICS_BASICS,
                difficulty=DifficultyLevel.BEGINNER,
                estimated_duration=0,
            )

    def test_negative_duration_rejected(self):
        with pytest.raises(ValidationError):
            LearningModuleCreate(
                title="T",
                description="d",
                category=ContentCategory.AI_ETHICS_BASICS,
                difficulty=DifficultyLevel.BEGINNER,
                estimated_duration=-5,
            )

    def test_tags_deduplicated(self):
        mod = LearningModuleCreate(
            title="T",
            description="d",
            category=ContentCategory.AI_ETHICS_BASICS,
            difficulty=DifficultyLevel.BEGINNER,
            estimated_duration=10,
            tags=["ai", "ai", "ethics"],
        )
        assert len(set(mod.tags)) == len(mod.tags)

    def test_tag_too_long_rejected(self):
        with pytest.raises(ValidationError):
            LearningModuleCreate(
                title="T",
                description="d",
                category=ContentCategory.AI_ETHICS_BASICS,
                difficulty=DifficultyLevel.BEGINNER,
                estimated_duration=10,
                tags=["x" * 31],
            )

    def test_invalid_category_rejected(self):
        with pytest.raises(ValidationError):
            LearningModuleCreate(
                title="T",
                description="d",
                category="not-a-category",
                difficulty=DifficultyLevel.BEGINNER,
                estimated_duration=10,
            )

    def test_invalid_difficulty_rejected(self):
        with pytest.raises(ValidationError):
            LearningModuleCreate(
                title="T",
                description="d",
                category=ContentCategory.AI_ETHICS_BASICS,
                difficulty="expert",  # not a valid enum value
                estimated_duration=10,
            )


# ---------------------------------------------------------------------------
# ExerciseCreate
# ---------------------------------------------------------------------------

class TestExerciseCreate:

    def test_valid_exercise(self):
        ex = ExerciseCreate(
            title="Quiz 1",
            instructions="Answer the following",
            exercise_type=ExerciseType.QUIZ,
            difficulty=DifficultyLevel.BEGINNER,
            content={"questions": []},
        )
        assert ex.points == 10  # default

    def test_points_zero(self):
        ex = ExerciseCreate(
            title="T",
            instructions="I",
            exercise_type=ExerciseType.QUIZ,
            difficulty=DifficultyLevel.BEGINNER,
            content={},
            points=0,
        )
        assert ex.points == 0

    def test_points_max_100(self):
        ex = ExerciseCreate(
            title="T",
            instructions="I",
            exercise_type=ExerciseType.QUIZ,
            difficulty=DifficultyLevel.BEGINNER,
            content={},
            points=100,
        )
        assert ex.points == 100

    def test_points_exceeds_100(self):
        with pytest.raises(ValidationError):
            ExerciseCreate(
                title="T",
                instructions="I",
                exercise_type=ExerciseType.QUIZ,
                difficulty=DifficultyLevel.BEGINNER,
                content={},
                points=101,
            )

    def test_negative_points_rejected(self):
        with pytest.raises(ValidationError):
            ExerciseCreate(
                title="T",
                instructions="I",
                exercise_type=ExerciseType.QUIZ,
                difficulty=DifficultyLevel.BEGINNER,
                content={},
                points=-1,
            )

    def test_time_limit_zero_rejected(self):
        with pytest.raises(ValidationError):
            ExerciseCreate(
                title="T",
                instructions="I",
                exercise_type=ExerciseType.QUIZ,
                difficulty=DifficultyLevel.BEGINNER,
                content={},
                time_limit=0,
            )

    def test_time_limit_none_allowed(self):
        ex = ExerciseCreate(
            title="T",
            instructions="I",
            exercise_type=ExerciseType.QUIZ,
            difficulty=DifficultyLevel.BEGINNER,
            content={},
            time_limit=None,
        )
        assert ex.time_limit is None


# ---------------------------------------------------------------------------
# Community schemas
# ---------------------------------------------------------------------------

class TestCommunitySchemas:

    def test_discussion_create_valid(self):
        d = DiscussionCreate(title="Hello", content="World")
        assert d.category == "General"

    def test_discussion_create_custom_category(self):
        d = DiscussionCreate(title="Hello", content="World", category="AI")
        assert d.category == "AI"

    def test_comment_create_valid(self):
        c = CommentCreate(content="Nice post!")
        assert c.content == "Nice post!"


# ---------------------------------------------------------------------------
# Auth schemas
# ---------------------------------------------------------------------------

class TestAuthSchemas:

    def test_login_request_valid(self):
        lr = LoginRequest(email="a@b.com", password="pass")
        assert lr.remember_me is False

    def test_login_empty_email_rejected(self):
        with pytest.raises(ValidationError):
            LoginRequest(email="", password="pass")

    def test_login_empty_password_rejected(self):
        with pytest.raises(ValidationError):
            LoginRequest(email="a@b.com", password="")


# ---------------------------------------------------------------------------
# Enum coverage
# ---------------------------------------------------------------------------

class TestEnums:

    def test_all_content_categories(self):
        expected = [
            "ai-ethics-basics", "bias-and-fairness",
            "transparency-accountability", "privacy-security",
            "human-ai-interaction", "philosophical-questions",
            "practical-implementation", "case-studies",
        ]
        values = [c.value for c in ContentCategory]
        for e in expected:
            assert e in values

    def test_all_difficulty_levels(self):
        assert set(d.value for d in DifficultyLevel) == {"beginner", "intermediate", "advanced"}

    def test_all_exercise_types(self):
        expected = {"quiz", "simulation", "case_study", "reflection",
                    "interactive_tool", "multimodal_analysis"}
        assert set(e.value for e in ExerciseType) == expected
