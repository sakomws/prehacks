from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Text, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import os
import enum

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/event_platform")

# For development, use SQLite if PostgreSQL is not available
if not os.getenv("DATABASE_URL"):
    DATABASE_URL = "sqlite:///./event_platform.db"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserModel(Base):
    """User model for authentication and profile management"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=True, index=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    social_links = Column(Text, nullable=True)  # JSON string
    joined_at = Column(DateTime, default=datetime.utcnow)
    is_platform_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    password_reset_token = Column(String, nullable=True)
    password_reset_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CalendarModel(Base):
    """Calendar model for organizing events under branded collections"""
    __tablename__ = "calendars"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    visibility = Column(String, nullable=False, default="public")  # public, unlisted, private
    cover_image_url = Column(String, nullable=True)
    timezone = Column(String, nullable=False, default="UTC")
    is_plus_active = Column(Boolean, default=False)
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("UserModel", back_populates="owned_calendars")
    permissions = relationship("CalendarPermissionModel", back_populates="calendar", cascade="all, delete-orphan")
    subscriptions = relationship("CalendarSubscriptionModel", back_populates="calendar", cascade="all, delete-orphan")


class CalendarPermissionModel(Base):
    """Calendar permission model for managing user access to calendars"""
    __tablename__ = "calendar_permissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    calendar_id = Column(UUID(as_uuid=True), ForeignKey("calendars.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String, nullable=False)  # admin, editor, viewer
    granted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    granted_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    calendar = relationship("CalendarModel", back_populates="permissions")
    user = relationship("UserModel", foreign_keys=[user_id])
    granter = relationship("UserModel", foreign_keys=[granted_by])
    
    # Unique constraint to prevent duplicate permissions
    __table_args__ = (
        # One permission per user per calendar
        # If user needs role change, delete old and create new
        # This prevents confusion about which role takes precedence
    )


class CalendarSubscriptionModel(Base):
    """Calendar subscription model for users following calendars"""
    __tablename__ = "calendar_subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    calendar_id = Column(UUID(as_uuid=True), ForeignKey("calendars.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow)
    notification_preferences = Column(Text, nullable=True)  # JSON string for notification settings
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    calendar = relationship("CalendarModel", back_populates="subscriptions")
    user = relationship("UserModel", back_populates="calendar_subscriptions")
    
    # Unique constraint to prevent duplicate subscriptions
    __table_args__ = (
        # One subscription per user per calendar
    )

class NotificationType(str, enum.Enum):
    """Types of notifications that can be sent"""
    REGISTRATION_CONFIRMATION = "registration_confirmation"
    EVENT_INVITATION = "event_invitation"
    EVENT_UPDATE = "event_update"
    EVENT_REMINDER = "event_reminder"
    EVENT_CANCELLATION = "event_cancellation"
    APPROVAL_REQUEST = "approval_request"
    APPROVAL_CONFIRMED = "approval_confirmed"
    APPROVAL_DECLINED = "approval_declined"


class NotificationStatus(str, enum.Enum):
    """Status of notification delivery"""
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    CANCELLED = "cancelled"


class NotificationChannel(str, enum.Enum):
    """Channels through which notifications can be sent"""
    EMAIL = "email"
    PUSH = "push"
    IN_APP = "in_app"


class EventStatus(str, enum.Enum):
    """Status of events"""
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"


class RegistrationStatus(str, enum.Enum):
    """Status of event registrations"""
    INVITED = "invited"
    PENDING_APPROVAL = "pending_approval"
    CONFIRMED = "confirmed"
    WAITLISTED = "waitlisted"
    CANCELLED = "cancelled"
    DECLINED = "declined"
    NO_SHOW = "no_show"


class NotificationModel(Base):
    """Notification model for tracking sent notifications"""
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    type = Column(SQLEnum(NotificationType), nullable=False)
    channel = Column(SQLEnum(NotificationChannel), nullable=False, default=NotificationChannel.EMAIL)
    status = Column(SQLEnum(NotificationStatus), nullable=False, default=NotificationStatus.PENDING)
    
    # Content
    subject = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    template_data = Column(Text, nullable=True)  # JSON string for template variables
    
    # Metadata
    event_id = Column(UUID(as_uuid=True), nullable=True)  # Related event if applicable
    calendar_id = Column(UUID(as_uuid=True), nullable=True)  # Related calendar if applicable
    
    # Delivery tracking
    sent_at = Column(DateTime, nullable=True)
    failed_at = Column(DateTime, nullable=True)
    failure_reason = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Scheduling
    scheduled_for = Column(DateTime, nullable=True)  # For scheduled notifications like reminders
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("UserModel", back_populates="notifications")


# Basic Event and Registration models for notifications
class EventModel(Base):
    """Basic Event model for notification system"""
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    calendar_id = Column(UUID(as_uuid=True), ForeignKey("calendars.id"), nullable=False, index=True)
    host_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    cover_image_url = Column(String, nullable=True)
    location_type = Column(String, nullable=False, default="offline")  # offline, online, hybrid
    location_address = Column(Text, nullable=True)
    location_url = Column(String, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    timezone = Column(String, nullable=False, default="UTC")
    status = Column(String, nullable=False, default="draft")  # draft, published, cancelled
    visibility = Column(String, nullable=False, default="public")  # public, unlisted, private
    capacity = Column(Integer, nullable=True)
    requires_approval = Column(Boolean, default=False)
    ticket_type = Column(String, nullable=False, default="free")  # free, paid, donation
    ticket_price_cents = Column(Integer, nullable=True)
    currency = Column(String(3), nullable=True)
    slug = Column(String, nullable=False)
    category = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    calendar = relationship("CalendarModel", back_populates="events")
    host = relationship("UserModel", back_populates="hosted_events")
    registrations = relationship("EventRegistrationModel", back_populates="event", cascade="all, delete-orphan")


class EventRegistrationModel(Base):
    """Event registration model for tracking attendees"""
    __tablename__ = "event_registrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    email = Column(String, nullable=True)  # For guest registrations
    name = Column(String, nullable=True)   # For guest registrations
    status = Column(String, nullable=False, default="confirmed")  # invited, pending_approval, confirmed, waitlisted, cancelled, declined, no_show
    ticket_quantity = Column(Integer, default=1)
    checkin_status = Column(String, nullable=False, default="not_checked_in")  # not_checked_in, checked_in
    registration_source = Column(String, nullable=True)
    payment_id = Column(UUID(as_uuid=True), nullable=True)  # Reference to payment if paid event
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    event = relationship("EventModel", back_populates="registrations")
    user = relationship("UserModel", back_populates="event_registrations")


# Add relationships to UserModel
UserModel.owned_calendars = relationship("CalendarModel", back_populates="owner")
UserModel.calendar_permissions = relationship("CalendarPermissionModel", foreign_keys="CalendarPermissionModel.user_id")
UserModel.calendar_subscriptions = relationship("CalendarSubscriptionModel", back_populates="user")
UserModel.notifications = relationship("NotificationModel", back_populates="user")
UserModel.hosted_events = relationship("EventModel", back_populates="host")
UserModel.event_registrations = relationship("EventRegistrationModel", back_populates="user")

# Add relationships to CalendarModel
CalendarModel.events = relationship("EventModel", back_populates="calendar", cascade="all, delete-orphan")

# Create tables
def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Context manager for Celery tasks
from contextlib import contextmanager

@contextmanager
def get_db_session():
    """Get database session for Celery tasks"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()