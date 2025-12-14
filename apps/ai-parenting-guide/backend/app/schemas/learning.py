"""
Pydantic schemas for Learning-related API requests and responses.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum


class ContentCategory(str, Enum):
    """Content categories for learning modules."""
    AI_ETHICS_BASICS = "ai-ethics-basics"
    BIAS_AND_FAIRNESS = "bias-and-fairness"
    TRANSPARENCY_ACCOUNTABILITY = "transparency-accountability"
    PRIVACY_SECURITY = "privacy-security"
    HUMAN_AI_INTERACTION = "human-ai-interaction"
    PHILOSOPHICAL_QUESTIONS = "philosophical-questions"
    PRACTICAL_IMPLEMENTATION = "practical-implementation"
    CASE_STUDIES = "case-studies"


class DifficultyLevel(str, Enum):
    """Difficulty levels for content."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ExerciseType(str, Enum):
    """Types of exercises."""
    QUIZ = "quiz"
    SIMULATION = "simulation"
    CASE_STUDY = "case_study"
    REFLECTION = "reflection"
    INTERACTIVE_TOOL = "interactive_tool"
    MULTIMODAL_ANALYSIS = "multimodal_analysis"


# Learning Module Schemas

class LearningModuleBase(BaseModel):
    """Base schema for learning modules."""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    category: ContentCategory
    difficulty: DifficultyLevel
    estimated_duration: int = Field(..., gt=0, description="Duration in minutes")
    learning_objectives: List[str] = Field(default_factory=list, max_items=10)
    prerequisites: List[str] = Field(default_factory=list, max_items=5)
    tags: List[str] = Field(default_factory=list, max_items=20)


class LearningModuleCreate(LearningModuleBase):
    """Schema for creating learning modules."""
    content_sections: List[Dict[str, Any]] = Field(default_factory=list)
    
    @validator('tags')
    def validate_tags(cls, v):
        """Validate tags format."""
        if v:
            # Remove duplicates and empty strings
            v = list(set(filter(None, v)))
            # Validate each tag
            for tag in v:
                if len(tag) > 30:
                    raise ValueError('Each tag must be 30 characters or less')
        return v


class LearningModuleUpdate(BaseModel):
    """Schema for updating learning modules."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    category: Optional[ContentCategory] = None
    difficulty: Optional[DifficultyLevel] = None
    estimated_duration: Optional[int] = Field(None, gt=0)
    learning_objectives: Optional[List[str]] = Field(None, max_items=10)
    prerequisites: Optional[List[str]] = Field(None, max_items=5)
    tags: Optional[List[str]] = Field(None, max_items=20)
    content_sections: Optional[List[Dict[str, Any]]] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None


class LearningModuleResponse(LearningModuleBase):
    """Schema for learning module responses."""
    id: str
    slug: str
    created_by: str
    ai_generated: bool
    is_published: bool
    is_featured: bool
    view_count: int
    completion_count: int
    average_rating: float
    completion_rate: float
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class LearningModuleSummary(BaseModel):
    """Simplified schema for module listings."""
    id: str
    title: str
    description: str
    category: ContentCategory
    difficulty: DifficultyLevel
    estimated_duration: int
    average_rating: float
    completion_rate: float
    is_featured: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Exercise Schemas

class ExerciseBase(BaseModel):
    """Base schema for exercises."""
    title: str = Field(..., min_length=1, max_length=200)
    instructions: str = Field(..., min_length=1)
    exercise_type: ExerciseType
    difficulty: DifficultyLevel
    points: int = Field(default=10, ge=0, le=100)
    time_limit: Optional[int] = Field(None, gt=0, description="Time limit in seconds")


class ExerciseCreate(ExerciseBase):
    """Schema for creating exercises."""
    content: Dict[str, Any] = Field(..., description="Exercise-specific content")
    correct_answers: Optional[List[Any]] = Field(None, description="Correct answers for auto-grading")
    feedback_rules: List[Dict[str, Any]] = Field(default_factory=list)
    adaptive_settings: Dict[str, Any] = Field(default_factory=dict)
    order_index: int = Field(default=0, ge=0)


class ExerciseUpdate(BaseModel):
    """Schema for updating exercises."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    instructions: Optional[str] = Field(None, min_length=1)
    exercise_type: Optional[ExerciseType] = None
    difficulty: Optional[DifficultyLevel] = None
    content: Optional[Dict[str, Any]] = None
    correct_answers: Optional[List[Any]] = None
    feedback_rules: Optional[List[Dict[str, Any]]] = None
    points: Optional[int] = Field(None, ge=0, le=100)
    time_limit: Optional[int] = Field(None, gt=0)
    adaptive_settings: Optional[Dict[str, Any]] = None
    order_index: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ExerciseResponse(ExerciseBase):
    """Schema for exercise responses."""
    id: str
    module_id: str
    content: Dict[str, Any]
    correct_answers: Optional[List[Any]] = None
    feedback_rules: List[Dict[str, Any]]
    adaptive_settings: Dict[str, Any]
    order_index: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Progress Tracking Schemas

class ProgressUpdate(BaseModel):
    """Schema for updating user progress."""
    section_id: Optional[str] = None
    time_spent: int = Field(..., ge=0, description="Time spent in seconds")
    completed_sections: List[str] = Field(default_factory=list)
    current_section: Optional[str] = None


class ModuleProgressResponse(BaseModel):
    """Schema for module progress responses."""
    id: str
    user_id: str
    module_id: str
    is_started: bool
    is_completed: bool
    completion_percentage: float
    time_spent: int
    last_accessed_section: Optional[str] = None
    total_points_earned: int
    total_points_possible: int
    score_percentage: float
    attempts_count: int
    user_rating: Optional[int] = None
    user_feedback: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    last_accessed_at: datetime
    
    class Config:
        from_attributes = True


# Exercise Response Schemas

class ExerciseSubmission(BaseModel):
    """Schema for submitting exercise responses."""
    user_response: Dict[str, Any] = Field(..., description="User's answer or response")
    time_taken: Optional[int] = Field(None, ge=0, description="Time taken in seconds")
    attempt_number: int = Field(default=1, ge=1)


class ExerciseResponseResult(BaseModel):
    """Schema for exercise response results."""
    id: str
    user_id: str
    exercise_id: str
    user_response: Dict[str, Any]
    is_correct: Optional[bool] = None
    points_earned: int
    points_possible: int
    score_percentage: float
    ai_feedback: Optional[str] = None
    encouragement: Optional[str] = None
    suggestions: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    attempt_number: int
    time_taken: Optional[int] = None
    submitted_at: datetime
    feedback_generated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Achievement Schemas

class AchievementBase(BaseModel):
    """Base schema for achievements."""
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    icon: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., regex="^(learning|community|special)$")
    points_value: int = Field(default=0, ge=0)
    rarity: str = Field(default="common", regex="^(common|rare|epic|legendary)$")


class AchievementCreate(AchievementBase):
    """Schema for creating achievements."""
    criteria: Dict[str, Any] = Field(..., description="Conditions to unlock achievement")
    is_hidden: bool = Field(default=False)


class AchievementResponse(AchievementBase):
    """Schema for achievement responses."""
    id: str
    criteria: Dict[str, Any]
    is_hidden: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserAchievementResponse(BaseModel):
    """Schema for user achievement responses."""
    id: str
    user_id: str
    achievement: AchievementResponse
    unlocked_at: datetime
    progress_when_unlocked: Dict[str, Any]
    
    class Config:
        from_attributes = True


# Search and Filter Schemas

class ModuleSearchRequest(BaseModel):
    """Schema for module search requests."""
    query: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[ContentCategory] = None
    difficulty: Optional[DifficultyLevel] = None
    tags: Optional[List[str]] = Field(None, max_items=10)
    min_duration: Optional[int] = Field(None, ge=0)
    max_duration: Optional[int] = Field(None, ge=0)
    featured_only: bool = Field(default=False)
    sort_by: str = Field(default="created_at", regex="^(created_at|title|rating|popularity|duration)$")
    sort_order: str = Field(default="desc", regex="^(asc|desc)$")
    skip: int = Field(default=0, ge=0)
    limit: int = Field(default=20, ge=1, le=100)


class ModuleSearchResponse(BaseModel):
    """Schema for module search responses."""
    modules: List[LearningModuleSummary]
    total: int
    skip: int
    limit: int
    has_more: bool


# Analytics Schemas

class LearningAnalytics(BaseModel):
    """Schema for learning analytics."""
    total_modules: int
    total_exercises: int
    total_completions: int
    average_completion_rate: float
    popular_categories: List[Dict[str, Union[str, int]]]
    difficulty_distribution: Dict[str, int]
    recent_activity: List[Dict[str, Any]]


class UserLearningStats(BaseModel):
    """Schema for user learning statistics."""
    modules_started: int
    modules_completed: int
    total_time_spent: int  # in seconds
    total_points_earned: int
    achievements_unlocked: int
    current_streak: int
    favorite_categories: List[str]
    recent_modules: List[LearningModuleSummary]