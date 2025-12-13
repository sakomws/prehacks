from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    username = Column(String, unique=True, index=True)
    bio = Column(Text)
    avatar_url = Column(String)
    social_links = Column(JSON)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    is_platform_admin = Column(Boolean, default=False)
    
    # Relationships
    owned_calendars = relationship("Calendar", back_populates="owner", cascade="all, delete-orphan")
    hosted_events = relationship("Event", back_populates="host", cascade="all, delete-orphan")
    registrations = relationship("EventRegistration", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"