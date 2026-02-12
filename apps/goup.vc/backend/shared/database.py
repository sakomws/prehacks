from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Table, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import datetime

import os
# Get the backend directory (parent of shared)
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(BACKEND_DIR, 'data', 'goup_vc.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Association table for conversation participants
conversation_participants = Table(
    'conversation_participants',
    Base.metadata,
    Column('conversation_id', Integer, ForeignKey('conversations.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

# Association table for event co-hosts
event_cohosts = Table(
    'event_cohosts',
    Base.metadata,
    Column('event_id', Integer, ForeignKey('events.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    avatar_url = Column(String)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    conversations = relationship("Conversation", secondary=conversation_participants, back_populates="participants")
    messages = relationship("Message", back_populates="sender")
    cohosted_events = relationship("Event", secondary=event_cohosts, back_populates="cohosts")
    rsvps = relationship("EventRSVP", back_populates="user", cascade="all, delete-orphan")
    
    # Hackathon relationships
    organized_hackathons = relationship("Hackathon", back_populates="organizer")
    hackathon_registrations = relationship("ParticipantRegistration", back_populates="user")
    team_memberships = relationship("TeamMember", back_populates="user")
    judge_assignments = relationship("JudgeAssignment", back_populates="judge")
    submission_scores = relationship("SubmissionScore", back_populates="judge")
    ai_team_suggestions = relationship("AITeamSuggestion", back_populates="user")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    intent = Column(String)  # '1:1', 'event', 'project', 'community', 'broadcast'
    status = Column(String, default='active')  # 'active', 'dormant', 'expired'
    needs_action = Column(Boolean, default=False)
    action_type = Column(String, nullable=True)
    ai_summary = Column(Text)
    priority = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    participants = relationship("User", secondary=conversation_participants, back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    mute_settings = relationship("MuteSetting", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    message_type = Column(String, default='text')  # 'text', 'system', 'ai_generated'
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", back_populates="messages")

class MuteSetting(Base):
    __tablename__ = "mute_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    mute_type = Column(String)  # 'mention', 'event-day', 'decision', 'custom'
    mute_until = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="mute_settings")
    user = relationship("User")

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    location = Column(String)
    organizer_id = Column(Integer, ForeignKey("users.id"))
    capacity = Column(Integer, nullable=True)
    is_public = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=False)
    ticket_price = Column(String, default="Free")
    cover_image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    organizer = relationship("User", foreign_keys=[organizer_id])
    cohosts = relationship("User", secondary=event_cohosts, back_populates="cohosted_events")
    rsvps = relationship("EventRSVP", back_populates="event", cascade="all, delete-orphan")

class EventRSVP(Base):
    __tablename__ = "event_rsvps"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String)  # 'pending', 'approved', 'declined', 'attending', 'not_attending'
    message = Column(Text, nullable=True)  # Optional message from user
    response_message = Column(Text, nullable=True)  # Response from host
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="rsvps")
    user = relationship("User", back_populates="rsvps")

class HostApprovalRequest(Base):
    __tablename__ = "host_approval_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    requester_id = Column(Integer, ForeignKey("users.id"))
    requested_user_id = Column(Integer, ForeignKey("users.id"))
    request_type = Column(String)  # 'cohost', 'transfer_ownership'
    status = Column(String, default='pending')  # 'pending', 'approved', 'declined'
    message = Column(Text, nullable=True)
    response_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    event = relationship("Event")
    requester = relationship("User", foreign_keys=[requester_id])
    requested_user = relationship("User", foreign_keys=[requested_user_id])

# Hackathon enums - defined here to avoid circular imports
# These can be imported from hackathon_database if needed, but for shared database, we define them as strings
# HackathonTypeEnum, HackathonFormatEnum, HackathonStatusEnum, 
# TeamFormationTypeEnum, SubmissionStatusEnum, JudgeRoleEnum

# Hackathon Models (moved from hackathon_database.py to use same Base)
class Hackathon(Base):
    __tablename__ = "hackathons"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    theme = Column(String(255))
    hackathon_type = Column(String(50), nullable=False)  # Using String instead of Enum for simplicity
    format = Column(String(50), nullable=False)
    status = Column(String(50), default="draft")
    
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
    team_formation_type = Column(String(50), default="open")
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
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    organizer = relationship("User", back_populates="organized_hackathons")
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
    submission_requirements = Column(Text)  # JSON as text for simplicity
    judging_criteria = Column(Text)  # JSON as text for simplicity
    
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
    tags = Column(Text)  # JSON as text
    track_ids = Column(Text)  # JSON as text
    
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
    track_ids = Column(Text)  # JSON as text
    
    # Relationships
    hackathon = relationship("Hackathon", back_populates="schedule")

class ParticipantRegistration(Base):
    __tablename__ = "participant_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skills = Column(Text)  # JSON as text
    experience_level = Column(String(50), nullable=False)
    interests = Column(Text)  # JSON as text
    team_preferences = Column(Text)  # JSON as text
    dietary_restrictions = Column(Text)
    emergency_contact = Column(String(500))
    status = Column(String(50), default="pending")
    registered_at = Column(DateTime, default=func.now())
    
    # Relationships
    hackathon = relationship("Hackathon", back_populates="registrations")
    user = relationship("User", back_populates="hackathon_registrations")

class HackathonTeam(Base):
    __tablename__ = "hackathon_teams"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    track_id = Column(Integer, ForeignKey("hackathon_tracks.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_looking_for_members = Column(Boolean, default=False)
    desired_skills = Column(Text)  # JSON as text
    created_at = Column(DateTime, default=func.now())
    
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
    skills = Column(Text)  # JSON as text
    joined_at = Column(DateTime, default=func.now())
    
    # Relationships
    team = relationship("HackathonTeam", back_populates="members")
    user = relationship("User", back_populates="team_memberships")

class HackathonSubmission(Base):
    __tablename__ = "hackathon_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("hackathon_teams.id"), nullable=False)
    track_id = Column(Integer, ForeignKey("hackathon_tracks.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    tech_stack = Column(Text)  # JSON as text
    artifacts = Column(Text)  # JSON as text
    status = Column(String(50), default="draft")
    submitted_at = Column(DateTime)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
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
    role = Column(String(50), nullable=False)
    track_ids = Column(Text)  # JSON as text
    assigned_at = Column(DateTime, default=func.now())
    
    # Relationships
    hackathon = relationship("Hackathon", back_populates="judge_assignments")
    judge = relationship("User", back_populates="judge_assignments")

class SubmissionScore(Base):
    __tablename__ = "submission_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("hackathon_submissions.id"), nullable=False)
    judge_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    criteria_scores = Column(Text)  # JSON as text
    overall_score = Column(Float, nullable=False)
    comments = Column(Text)  # Private comments for organizers
    feedback = Column(Text)  # Public feedback for participants
    scored_at = Column(DateTime, default=func.now())
    
    # Relationships
    submission = relationship("HackathonSubmission", back_populates="scores")
    judge = relationship("User", back_populates="submission_scores")

class HackathonMetrics(Base):
    __tablename__ = "hackathon_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    total_registrations = Column(Integer, default=0)
    total_participants = Column(Integer, default=0)
    total_teams = Column(Integer, default=0)
    total_submissions = Column(Integer, default=0)
    track_distribution = Column(Text)  # JSON as text
    skill_distribution = Column(Text)  # JSON as text
    experience_distribution = Column(Text)  # JSON as text
    completion_rate = Column(Float, default=0.0)
    average_team_size = Column(Float, default=0.0)
    calculated_at = Column(DateTime, default=func.now())
    
    # Relationships
    hackathon = relationship("Hackathon")

class AITeamSuggestion(Base):
    __tablename__ = "ai_team_suggestions"
    
    id = Column(Integer, primary_key=True, index=True)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    suggested_teammates = Column(Text)  # JSON as text
    suggested_tracks = Column(Text)  # JSON as text
    generated_at = Column(DateTime, default=func.now())
    
    # Relationships
    hackathon = relationship("Hackathon")
    user = relationship("User", back_populates="ai_team_suggestions")

class AISubmissionSummary(Base):
    __tablename__ = "ai_submission_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("hackathon_submissions.id"), nullable=False)
    summary = Column(Text, nullable=False)
    key_features = Column(Text)  # JSON as text
    technical_highlights = Column(Text)  # JSON as text
    innovation_score = Column(Float)
    complexity_score = Column(Float)
    generated_at = Column(DateTime, default=func.now())
    
    # Relationships
    submission = relationship("HackathonSubmission")

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()