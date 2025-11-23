"""Pydantic schemas for request/response validation"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_mentor: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Mentor schemas
class MentorBase(BaseModel):
    title: str
    bio: Optional[str] = None
    expertise: Optional[str] = None
    hourly_rate: float = 320.0


class MentorCreate(MentorBase):
    pass


class Mentor(MentorBase):
    id: int
    user_id: int
    rating: float
    total_sessions: int
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Session schemas
class SessionBase(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int = 60


class SessionCreate(SessionBase):
    mentor_id: int


class Session(SessionBase):
    id: int
    student_id: int
    mentor_id: int
    status: str
    price: float
    payment_status: Optional[str] = "pending"
    stripe_payment_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SessionWithMentor(Session):
    mentor: dict


# Roadmap schemas
class RoadmapBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_company: Optional[str] = None
    target_role: Optional[str] = None


class RoadmapCreate(RoadmapBase):
    milestones: Optional[str] = None


class Roadmap(RoadmapBase):
    id: int
    user_id: int
    milestones: Optional[str] = None
    progress: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
