#!/usr/bin/env python3
"""
Calendar management functionality for the event platform
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import re
import uuid
import pytz

from database import CalendarModel, UserModel


class CalendarCreate(BaseModel):
    """Schema for creating a new calendar"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    visibility: str = Field(default="public")
    timezone: str = Field(default="UTC")
    
    @validator('visibility')
    def validate_visibility(cls, v):
        if v not in ['public', 'unlisted', 'private']:
            raise ValueError('Visibility must be public, unlisted, or private')
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Calendar name cannot be empty')
        return v.strip()
    
    @validator('timezone')
    def validate_timezone(cls, v):
        if v not in pytz.all_timezones:
            raise ValueError(f'Invalid timezone: {v}. Must be a valid IANA timezone.')
        return v


class CalendarUpdate(BaseModel):
    """Schema for updating calendar information"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    visibility: Optional[str] = None
    timezone: Optional[str] = None
    cover_image_url: Optional[str] = None
    
    @validator('visibility')
    def validate_visibility(cls, v):
        if v is not None and v not in ['public', 'unlisted', 'private']:
            raise ValueError('Visibility must be public, unlisted, or private')
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Calendar name cannot be empty')
        return v.strip() if v else v
    
    @validator('timezone')
    def validate_timezone(cls, v):
        if v is not None and v not in pytz.all_timezones:
            raise ValueError(f'Invalid timezone: {v}. Must be a valid IANA timezone.')
        return v


class CalendarResponse(BaseModel):
    """Schema for calendar response data"""
    id: str
    owner_id: str
    name: str
    slug: str
    description: Optional[str]
    visibility: str
    cover_image_url: Optional[str]
    timezone: str
    is_plus_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


def generate_calendar_slug(name: str, db: Session) -> str:
    """Generate a unique slug for a calendar based on its name"""
    # Convert name to slug format
    base_slug = re.sub(r'[^a-zA-Z0-9\s-]', '', name.lower())
    base_slug = re.sub(r'\s+', '-', base_slug.strip())
    base_slug = re.sub(r'-+', '-', base_slug)
    base_slug = base_slug.strip('-')
    
    if not base_slug:
        base_slug = "calendar"
    
    # Ensure uniqueness
    slug = base_slug
    counter = 1
    
    while db.query(CalendarModel).filter(CalendarModel.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    return slug


def create_calendar(db: Session, calendar_data: CalendarCreate, owner_id: str) -> CalendarModel:
    """Create a new calendar"""
    # Generate unique slug
    slug = generate_calendar_slug(calendar_data.name, db)
    
    # Create calendar
    calendar = CalendarModel(
        owner_id=uuid.UUID(owner_id),
        name=calendar_data.name,
        slug=slug,
        description=calendar_data.description,
        visibility=calendar_data.visibility,
        timezone=calendar_data.timezone
    )
    
    db.add(calendar)
    db.commit()
    db.refresh(calendar)
    
    return calendar


def get_calendar_by_id(db: Session, calendar_id: str) -> Optional[CalendarModel]:
    """Get calendar by ID"""
    try:
        calendar_uuid = uuid.UUID(calendar_id)
        return db.query(CalendarModel).filter(CalendarModel.id == calendar_uuid).first()
    except ValueError:
        return None


def get_calendar_by_slug(db: Session, slug: str) -> Optional[CalendarModel]:
    """Get calendar by slug"""
    return db.query(CalendarModel).filter(CalendarModel.slug == slug).first()


def get_calendars_by_owner(db: Session, owner_id: str, skip: int = 0, limit: int = 100) -> List[CalendarModel]:
    """Get calendars owned by a specific user"""
    try:
        owner_uuid = uuid.UUID(owner_id)
        return db.query(CalendarModel).filter(
            CalendarModel.owner_id == owner_uuid
        ).offset(skip).limit(limit).all()
    except ValueError:
        return []


def get_public_calendars(db: Session, skip: int = 0, limit: int = 100) -> List[CalendarModel]:
    """Get public calendars for discovery"""
    return db.query(CalendarModel).filter(
        CalendarModel.visibility == "public"
    ).offset(skip).limit(limit).all()


def update_calendar(db: Session, calendar: CalendarModel, calendar_data: CalendarUpdate) -> CalendarModel:
    """Update calendar information"""
    update_data = calendar_data.dict(exclude_unset=True)
    
    # If name is being updated, regenerate slug
    if 'name' in update_data:
        new_slug = generate_calendar_slug(update_data['name'], db)
        # Only update slug if it's different from current
        if new_slug != calendar.slug:
            update_data['slug'] = new_slug
    
    # Update fields
    for field, value in update_data.items():
        setattr(calendar, field, value)
    
    calendar.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(calendar)
    
    return calendar


def delete_calendar(db: Session, calendar: CalendarModel) -> bool:
    """Delete a calendar"""
    try:
        db.delete(calendar)
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False


def can_access_calendar(calendar: CalendarModel, user_id: Optional[str] = None) -> bool:
    """Check if a user can access a calendar based on visibility settings"""
    # Import here to avoid circular imports
    from calendar_permissions import can_access_calendar_with_permissions
    return can_access_calendar_with_permissions(calendar, user_id)


def can_modify_calendar(calendar: CalendarModel, user_id: str) -> bool:
    """Check if a user can modify a calendar"""
    # Import here to avoid circular imports
    from calendar_permissions import can_modify_calendar_with_permissions
    return can_modify_calendar_with_permissions(calendar, user_id)