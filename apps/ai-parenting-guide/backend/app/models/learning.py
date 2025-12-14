"""
SQLAlchemy models for Learning entities.
Implements learning modules, exercises, progress tracking, and achievements.
"""

from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class ContentCategory(str, enum.Enum):
    """Content categories for learning modules."""
    AI_ETHICS_BASICS = "ai-ethics-basics"
    BIAS_AND_FAIRNESS = "bias-and-fairness"
    TRANSPARENCY_ACCOUNTABILITY = "transparency-accountability"
    PRIVACY_SECURITY = "privacy-security"
    HUMAN_AI_INTERACTION = "human-ai-interaction"
    PHILOSOPHICAL_QUESTIONS = "philosophical-questions"
    PRACTICAL_IMPLEMENTATION = "practical-implementation"
    CASE_STUDIES = "case-studies"


class DifficultyLevel(str, enum.Enum):
    """Difficulty levels for content."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ContentType(str, enum.Enum):
    """Types of content sections."""
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    INTERACTIVE = "interactive"
    MIXED = "mixed"


class LearningModule(Base):
    """
    Learning module containing educational content and exercises.
    
    Represents a complete learning unit with objectives, content, and assessments.
    """
    __tablename__ = "learning_modules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    
    # Categorization
    category = Column(String(50), nullable=False, index=True)
    difficulty = Column(String(20), nullable=False, index=True)
    estimated_duration = Column(Integer, nullable=False)  # in minutes
    
    # Content structure
    learning_objectives = Column(JSON, default=list, nullable=False)
    prerequisites = Column(JSON, default=list, nullable=False)
    tags = Column(JSON, default=list, nullable=False)
    
    # Content sections (stored as JSON for flexibility)
    content_sections = Column(JSON, default=list, nullable=False)
    
    # Metadata
    created_by = Column(UUID(as_uuid=True), nullable=False)
    ai_generated = Column(Boolean, default=False, nullable=False)
    personalized_for = Column(JSON, default=list, nullable=False)  # User IDs
    
    # Status and visibility
    is_published = Column(Boolean, default=False, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    
    # Analytics
    view_count = Column(Integer, default=0, nullable=False)
    completion_count = Column(Integer, default=0, nullable=False)
    average_rating = Column(Float, default=0.0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    exercises = relationship("Exercise", back_populates="module", cascade="all, delete-orphan")
    user_progress = relationship("ModuleProgress", back_populates="module")
    
    def __repr__(self):
        return f"<LearningModule(id={self.id}, title={self.title}, category={self.category})>"
    
    @property
    def completion_rate(self) -> float:
        """Calculate completion rate as percentage."""
        if self.view_count == 0:
            return 0.0
        return (self.completion_count / self.view_count) * 100


class Exercise(Base):
    """
    Interactive exercises within learning modules.
    
    Supports various exercise types including quizzes, simulations, and case studies.
    """
    __tablename__ = "exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    module_id = Column(UUID(as_uuid=True), ForeignKey("learning_modules.id"), nullable=False)
    
    title = Column(String(200), nullable=False)
    instructions = Column(Text, nullable=False)
    exercise_type = Column(String(50), nullable=False)  # quiz, simulation, case_study, etc.
    
    # Exercise content and configuration
    content = Column(JSON, nullable=False)  # Exercise-specific content
    correct_answers = Column(JSON, nullable=True)  # For automated grading
    feedback_rules = Column(JSON, default=list, nullable=False)
    
    # Scoring and difficulty
    points = Column(Integer, default=10, nullable=False)
    difficulty = Column(String(20), nullable=False)
    time_limit = Column(Integer, nullable=True)  # in seconds
    
    # Adaptive settings
    adaptive_settings = Column(JSON, default=dict, nullable=False)
    
    # Order within module
    order_index = Column(Integer, nullable=False, default=0)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    module = relationship("LearningModule", back_populates="exercises")
    user_responses = relationship("ExerciseResponse", back_populates="exercise")
    
    def __repr__(self):
        return f"<Exercise(id={self.id}, title={self.title}, type={self.exercise_type})>"


class ModuleProgress(Base):
    """
    User progress tracking for learning modules.
    
    Tracks completion status, time spent, and performance metrics.
    """
    __tablename__ = "module_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    module_id = Column(UUID(as_uuid=True), ForeignKey("learning_modules.id"), nullable=False)
    
    # Progress status
    is_started = Column(Boolean, default=False, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    completion_percentage = Column(Float, default=0.0, nullable=False)
    
    # Time tracking
    time_spent = Column(Integer, default=0, nullable=False)  # in seconds
    last_accessed_section = Column(String(100), nullable=True)
    
    # Performance metrics
    total_points_earned = Column(Integer, default=0, nullable=False)
    total_points_possible = Column(Integer, default=0, nullable=False)
    attempts_count = Column(Integer, default=0, nullable=False)
    
    # User feedback
    user_rating = Column(Integer, nullable=True)  # 1-5 stars
    user_feedback = Column(Text, nullable=True)
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    last_accessed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    module = relationship("LearningModule", back_populates="user_progress")
    
    def __repr__(self):
        return f"<ModuleProgress(user_id={self.user_id}, module_id={self.module_id}, completed={self.is_completed})>"
    
    @property
    def score_percentage(self) -> float:
        """Calculate score as percentage."""
        if self.total_points_possible == 0:
            return 0.0
        return (self.total_points_earned / self.total_points_possible) * 100


class ExerciseResponse(Base):
    """
    User responses to exercises with AI-generated feedback.
    
    Stores user answers and provides personalized feedback and scoring.
    """
    __tablename__ = "exercise_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False)
    
    # Response data
    user_response = Column(JSON, nullable=False)  # User's answer/response
    is_correct = Column(Boolean, nullable=True)  # For auto-gradable exercises
    
    # Scoring
    points_earned = Column(Integer, default=0, nullable=False)
    points_possible = Column(Integer, nullable=False)
    
    # AI-generated feedback
    ai_feedback = Column(Text, nullable=True)
    encouragement = Column(Text, nullable=True)
    suggestions = Column(JSON, default=list, nullable=False)
    next_steps = Column(JSON, default=list, nullable=False)
    
    # Attempt tracking
    attempt_number = Column(Integer, default=1, nullable=False)
    time_taken = Column(Integer, nullable=True)  # in seconds
    
    # Timestamps
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    feedback_generated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    exercise = relationship("Exercise", back_populates="user_responses")
    
    def __repr__(self):
        return f"<ExerciseResponse(user_id={self.user_id}, exercise_id={self.exercise_id}, correct={self.is_correct})>"
    
    @property
    def score_percentage(self) -> float:
        """Calculate score as percentage."""
        if self.points_possible == 0:
            return 0.0
        return (self.points_earned / self.points_possible) * 100


class Achievement(Base):
    """
    User achievements and badges for learning milestones.
    
    Gamification elements to encourage continued learning and engagement.
    """
    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(100), nullable=False)  # Icon identifier or URL
    
    # Achievement criteria
    category = Column(String(50), nullable=False)  # learning, community, special
    criteria = Column(JSON, nullable=False)  # Conditions to unlock
    points_value = Column(Integer, default=0, nullable=False)
    
    # Rarity and visibility
    rarity = Column(String(20), default="common", nullable=False)  # common, rare, epic, legendary
    is_hidden = Column(Boolean, default=False, nullable=False)  # Hidden until unlocked
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Achievement(id={self.id}, name={self.name}, category={self.category})>"


class UserAchievement(Base):
    """
    Junction table for user achievements with unlock timestamps.
    
    Tracks when users unlock specific achievements.
    """
    __tablename__ = "user_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id"), nullable=False)
    
    # Unlock details
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    progress_when_unlocked = Column(JSON, default=dict, nullable=False)  # User's progress snapshot
    
    # Relationships
    achievement = relationship("Achievement")
    
    def __repr__(self):
        return f"<UserAchievement(user_id={self.user_id}, achievement_id={self.achievement_id})>"