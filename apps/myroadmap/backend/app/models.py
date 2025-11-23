"""Database models"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_mentor = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    mentor_profile = relationship("Mentor", back_populates="user", uselist=False)
    sessions_as_student = relationship("Session", foreign_keys="Session.student_id", back_populates="student")
    roadmaps = relationship("Roadmap", back_populates="user")


class Mentor(Base):
    """Mentor profile model"""
    __tablename__ = "mentors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    title = Column(String, nullable=False)
    bio = Column(Text)
    expertise = Column(String)  # JSON string of expertise areas
    hourly_rate = Column(Float, default=320.0)
    rating = Column(Float, default=5.0)
    total_sessions = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="mentor_profile")
    sessions = relationship("Session", back_populates="mentor")


class Session(Base):
    """Mentorship session model"""
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    mentor_id = Column(Integer, ForeignKey("mentors.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    scheduled_at = Column(DateTime)
    duration_minutes = Column(Integer, default=60)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled
    price = Column(Float)
    payment_status = Column(String, default="pending")  # pending, paid, refunded
    stripe_payment_id = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("User", foreign_keys=[student_id], back_populates="sessions_as_student")
    mentor = relationship("Mentor", back_populates="sessions")


class Roadmap(Base):
    """Learning roadmap model"""
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    target_company = Column(String)
    target_role = Column(String)
    milestones = Column(Text)  # JSON string of milestones
    progress = Column(Integer, default=0)  # 0-100
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="roadmaps")
