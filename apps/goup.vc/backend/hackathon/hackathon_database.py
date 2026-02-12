from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

# Enums
class HackathonTypeEnum(enum.Enum):
    INTERNAL = "internal"
    PUBLIC = "public"

class HackathonFormatEnum(enum.Enum):
    IN_PERSON = "in_person"
    VIRTUAL = "virtual"
    HYBRID = "hybrid"

class HackathonStatusEnum(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    REGISTRATION_OPEN = "registration_open"
    REGISTRATION_CLOSED = "registration_closed"
    IN_PROGRESS = "in_progress"
    JUDGING = "judging"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TeamFormationTypeEnum(enum.Enum):
    OPEN = "open"
    INVITE_ONLY = "invite_only"
    AI_MATCHMAKING = "ai_matchmaking"

class SubmissionStatusEnum(enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    LATE = "late"
    DISQUALIFIED = "disqualified"

class JudgeRoleEnum(enum.Enum):
    LEAD_JUDGE = "lead_judge"
    TRACK_JUDGE = "track_judge"
    TECHNICAL_JUDGE = "technical_judge"

# Database Models
class Hackathon(Base):
    __tablename__ = "hackathons"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    theme = Column(String(255))
    hackathon_type = Column(SQLEnum(HackathonTypeEnum), nullable=False)
    format = Column(SQLEnum(HackathonFormatEnum), nullable=False)
    status = Column(SQLEnum(HackathonStatusEnum), default=HackathonStatusEnum.DRAFT)
    
    # Dates and timing
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    timezone = Column(String(50), nullable=False)
    registration_deadline = Column(DateTime, nullable=False)
    submission_deadline = Column(DateTime, nullable=False)
    judging_deadline = Column(DateTime, nullable=False)
    
    # Location and platform
    location = Column(String(500))
    virtual_platform = Column(String(255))
    
    # Team configuration
    team_formation_type = Column(SQLEnum(TeamFormationTypeEnum), default=TeamFormationTypeEnum.OPEN)
    min_team_size = Column(Integer, default=1)
    max_team_size = Column(Integer, default=4)
    allow_solo = Column(Boolean, default=True)
    max_participants = Column(Integer)
    
    # Media and resources
    cover_image_url = Column(String(500))
    rules_url = Column(String(500))
    code_of_conduct_url = Column(String(500))
    
    # Organizer
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - Note: User relationships are defined in database.py
    # organizer = relationship("User", back_populates="organized_hackathons")
    tracks = relationship("HackathonTrack", back_populates="hackathon", cascade="all, delete-orphan")
    prizes = relationship("HackathonPrize", back_populates="hackathon", cascade="all, delete-orphan")
    resources = relationship("HackathonResource", back_populates="hackathon", cascade="all, delete-orphan")
    schedule = relationship("HackathonScheduleItem", back_populates="hackathon", cascade="all, delete-orphan")
    registrations = relationship("ParticipantRegistration", back_populates="hackathon")
    teams = relationship("HackathonTeam", back_populates="hackathon")
    submissions = relationship("HackathonSubmission", back_populates="hackathon")
    judge_assignments = relationship("JudgeAssignment", back_populates="hackathon")

class HackathonTrack(Base):
    __tablename__ = "hackathon_tracks"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    color = Column(String(7))  # Hex color
    icon = Column(String(50))
    max_team_size = Column(Integer, default=4)
    submission_requirements = Column(JSON)  # List of required artifacts
    judging_criteria = Column(JSON)  # Criteria with weights
    
    # Relationships
    hackathon = relationship("Hackathon", back_populates="tracks")
    teams = relationship("HackathonTeam", back_populates="track")
    submissions = relationship("HackathonSubmission", back_populates="track")
    prizes = relationship("HackathonPrize", back_populates="track")

class HackathonPrize(Base):
    __tablename__ = "hackathon_prizes"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    track_id = Column(Integer, ForeignKey("hackathon_tracks.id"))  # None for overall prizes
    name = Column(String(255), nullable=False)
    description = Column(Text)
    value = Column(String(255))  # "$5000" or "AWS Credits"
    position = Column(Integer, nullable=False)  # 1st, 2nd, 3rd place
    sponsor = Column(String(255))
    
    # Relationships
    hackathon = relationship("Hackathon", back_populates="prizes")
    track = relationship("HackathonTrack", back_populates="prizes")

class HackathonResource(Base):
    __tablename__ = "hackathon_resources"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(String(50), nullable=False)  # "dataset", "api", "repo", "guide", "tool"
    url = Column(String(500), nullable=False)
    tags = Column(JSON)  # List of tags
    track_ids = Column(JSON)  # List of track IDs, empty means all tracks
    
    # Relationships
    hackathon = relationship("Hackathon", back_populates="resources")

class HackathonScheduleItem(Base):
    __tablename__ = "hackathon_schedule"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    type = Column(String(50), nullable=False)  # "kickoff", "workshop", "deadline", "judging", "presentation"
    location = Column(String(500))
    is_mandatory = Column(Boolean, default=False)
    track_ids = Column(JSON)  # List of track IDs, empty means all tracks
    
    # Relationships
    hackathon = relationship("Hackathon", back_populates="schedule")

class ParticipantRegistration(Base):
    __tablename__ = "participant_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skills = Column(JSON)  # List of skills
    experience_level = Column(String(50), nullable=False)
    interests = Column(JSON)  # List of interests
    team_preferences = Column(JSON)  # Preferences for team formation
    dietary_restrictions = Column(Text)
    emergency_contact = Column(String(500))
    status = Column(String(50), default="pending")
    registered_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    hackathon = relationship("Hackathon", back_populates="registrations")
    # user = relationship("User")  # Defined in database.py

class HackathonTeam(Base):
    __tablename__ = "hackathon_teams"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    track_id = Column(Integer, ForeignKey("hackathon_tracks.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_looking_for_members = Column(Boolean, default=False)
    desired_skills = Column(JSON)  # List of desired skills
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    hackathon = relationship("Hackathon", back_populates="teams")
    track = relationship("HackathonTrack", back_populates="teams")
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    submissions = relationship("HackathonSubmission", back_populates="team")

class TeamMember(Base):
    __tablename__ = "team_members"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("hackathon_teams.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(50), nullable=False)  # "leader", "member"
    skills = Column(JSON)  # List of skills this member brings
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    team = relationship("HackathonTeam", back_populates="members")
    # user = relationship("User")  # Defined in database.py

class HackathonSubmission(Base):
    __tablename__ = "hackathon_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("hackathon_teams.id"), nullable=False)
    track_id = Column(Integer, ForeignKey("hackathon_tracks.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    tech_stack = Column(JSON)  # List of technologies used
    artifacts = Column(JSON)  # List of submission artifacts (files, links)
    status = Column(SQLEnum(SubmissionStatusEnum), default=SubmissionStatusEnum.DRAFT)
    submitted_at = Column(DateTime)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hackathon = relationship("Hackathon", back_populates="submissions")
    team = relationship("HackathonTeam", back_populates="submissions")
    track = relationship("HackathonTrack", back_populates="submissions")
    scores = relationship("SubmissionScore", back_populates="submission", cascade="all, delete-orphan")

class JudgeAssignment(Base):
    __tablename__ = "judge_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    judge_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(SQLEnum(JudgeRoleEnum), nullable=False)
    track_ids = Column(JSON)  # List of track IDs this judge evaluates
    assigned_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    hackathon = relationship("Hackathon", back_populates="judge_assignments")
    # judge = relationship("User")  # Defined in database.py

class SubmissionScore(Base):
    __tablename__ = "submission_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("hackathon_submissions.id"), nullable=False)
    judge_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    criteria_scores = Column(JSON)  # Dict of criteria scores
    overall_score = Column(Float, nullable=False)
    comments = Column(Text)  # Private comments for organizers
    feedback = Column(Text)  # Public feedback for participants
    scored_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    submission = relationship("HackathonSubmission", back_populates="scores")
    # judge = relationship("User")  # Defined in database.py

class HackathonMetrics(Base):
    __tablename__ = "hackathon_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    total_registrations = Column(Integer, default=0)
    total_participants = Column(Integer, default=0)
    total_teams = Column(Integer, default=0)
    total_submissions = Column(Integer, default=0)
    track_distribution = Column(JSON)  # Distribution across tracks
    skill_distribution = Column(JSON)  # Distribution of skills
    experience_distribution = Column(JSON)  # Distribution of experience levels
    completion_rate = Column(Float, default=0.0)
    average_team_size = Column(Float, default=0.0)
    calculated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    hackathon = relationship("Hackathon")

class AITeamSuggestion(Base):
    __tablename__ = "ai_team_suggestions"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    suggested_teammates = Column(JSON)  # List of suggested teammates with scores
    suggested_tracks = Column(JSON)  # List of suggested tracks with fit scores
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    hackathon = relationship("Hackathon")
    # user = relationship("User")  # Defined in database.py

class AISubmissionSummary(Base):
    __tablename__ = "ai_submission_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("hackathon_submissions.id"), nullable=False)
    summary = Column(Text, nullable=False)
    key_features = Column(JSON)  # List of key features
    technical_highlights = Column(JSON)  # List of technical highlights
    innovation_score = Column(Float)
    complexity_score = Column(Float)
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    submission = relationship("HackathonSubmission")

# Add hackathon relationships to existing User model
# This would be added to the existing User class in database.py
"""
# Add these relationships to the existing User class:
organized_hackathons = relationship("Hackathon", back_populates="organizer")
hackathon_registrations = relationship("ParticipantRegistration", back_populates="user")
team_memberships = relationship("TeamMember", back_populates="user")
judge_assignments = relationship("JudgeAssignment", back_populates="judge")
submission_scores = relationship("SubmissionScore", back_populates="judge")
ai_team_suggestions = relationship("AITeamSuggestion", back_populates="user")
"""