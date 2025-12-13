#!/usr/bin/env python3
"""
Calendar permissions management functionality for the event platform
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import uuid
from enum import Enum

from database import CalendarModel, CalendarPermissionModel, UserModel


class CalendarRole(str, Enum):
    """Calendar permission roles"""
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


class CalendarPermissionCreate(BaseModel):
    """Schema for creating a calendar permission"""
    user_id: str = Field(..., description="ID of the user to grant permission to")
    role: CalendarRole = Field(..., description="Role to assign to the user")
    
    @validator('user_id')
    def validate_user_id(cls, v):
        try:
            uuid.UUID(v)
            return v
        except ValueError:
            raise ValueError('Invalid user ID format')


class CalendarPermissionUpdate(BaseModel):
    """Schema for updating a calendar permission"""
    role: CalendarRole = Field(..., description="New role to assign to the user")


class CalendarPermissionResponse(BaseModel):
    """Schema for calendar permission response data"""
    id: str
    calendar_id: str
    user_id: str
    role: str
    granted_by: str
    granted_at: datetime
    created_at: datetime
    updated_at: datetime
    
    # Include user information for convenience
    user_email: Optional[str] = None
    user_first_name: Optional[str] = None
    user_last_name: Optional[str] = None
    
    class Config:
        from_attributes = True


def create_calendar_permission(
    db: Session, 
    calendar: CalendarModel, 
    permission_data: CalendarPermissionCreate, 
    granted_by_user_id: str
) -> CalendarPermissionModel:
    """Create a new calendar permission"""
    # Check if user exists
    user = db.query(UserModel).filter(UserModel.id == uuid.UUID(permission_data.user_id)).first()
    if not user:
        raise ValueError("User not found")
    
    # Check if permission already exists
    existing_permission = db.query(CalendarPermissionModel).filter(
        and_(
            CalendarPermissionModel.calendar_id == calendar.id,
            CalendarPermissionModel.user_id == uuid.UUID(permission_data.user_id)
        )
    ).first()
    
    if existing_permission:
        raise ValueError("User already has permission for this calendar")
    
    # Create permission
    permission = CalendarPermissionModel(
        calendar_id=calendar.id,
        user_id=uuid.UUID(permission_data.user_id),
        role=permission_data.role.value,
        granted_by=uuid.UUID(granted_by_user_id)
    )
    
    db.add(permission)
    db.commit()
    db.refresh(permission)
    
    return permission


def get_calendar_permissions(db: Session, calendar: CalendarModel) -> List[CalendarPermissionModel]:
    """Get all permissions for a calendar"""
    return db.query(CalendarPermissionModel).filter(
        CalendarPermissionModel.calendar_id == calendar.id
    ).all()


def get_user_calendar_permission(
    db: Session, 
    calendar: CalendarModel, 
    user_id: str
) -> Optional[CalendarPermissionModel]:
    """Get a specific user's permission for a calendar"""
    try:
        user_uuid = uuid.UUID(user_id)
        return db.query(CalendarPermissionModel).filter(
            and_(
                CalendarPermissionModel.calendar_id == calendar.id,
                CalendarPermissionModel.user_id == user_uuid
            )
        ).first()
    except ValueError:
        return None


def update_calendar_permission(
    db: Session, 
    permission: CalendarPermissionModel, 
    permission_data: CalendarPermissionUpdate
) -> CalendarPermissionModel:
    """Update a calendar permission"""
    permission.role = permission_data.role.value
    permission.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(permission)
    
    return permission


def delete_calendar_permission(db: Session, permission: CalendarPermissionModel) -> bool:
    """Delete a calendar permission"""
    try:
        db.delete(permission)
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False


def get_user_calendars_with_permission(
    db: Session, 
    user_id: str, 
    role: Optional[CalendarRole] = None
) -> List[CalendarModel]:
    """Get calendars where user has specific permission"""
    try:
        user_uuid = uuid.UUID(user_id)
        query = db.query(CalendarModel).join(CalendarPermissionModel).filter(
            CalendarPermissionModel.user_id == user_uuid
        )
        
        if role:
            query = query.filter(CalendarPermissionModel.role == role.value)
        
        return query.all()
    except ValueError:
        return []


def can_access_calendar_with_permissions(calendar: CalendarModel, user_id: Optional[str] = None) -> bool:
    """Check if a user can access a calendar based on visibility and permissions"""
    if calendar.visibility == "public":
        return True
    elif calendar.visibility == "unlisted":
        return True  # Unlisted calendars are accessible if you have the link
    elif calendar.visibility == "private":
        if user_id:
            try:
                user_uuid = uuid.UUID(user_id)
                # Owner can always access
                if calendar.owner_id == user_uuid:
                    return True
                # Check if user has any permission
                for permission in calendar.permissions:
                    if permission.user_id == user_uuid:
                        return True
            except ValueError:
                return False
        return False
    
    return False


def can_modify_calendar_with_permissions(calendar: CalendarModel, user_id: str) -> bool:
    """Check if a user can modify a calendar based on ownership and permissions"""
    try:
        user_uuid = uuid.UUID(user_id)
        
        # Owner can always modify
        if calendar.owner_id == user_uuid:
            return True
        
        # Check if user has admin or editor permission
        for permission in calendar.permissions:
            if permission.user_id == user_uuid and permission.role in ['admin', 'editor']:
                return True
        
        return False
    except ValueError:
        return False


def can_manage_calendar_permissions(calendar: CalendarModel, user_id: str) -> bool:
    """Check if a user can manage permissions for a calendar"""
    try:
        user_uuid = uuid.UUID(user_id)
        
        # Owner can always manage permissions
        if calendar.owner_id == user_uuid:
            return True
        
        # Check if user has admin permission
        for permission in calendar.permissions:
            if permission.user_id == user_uuid and permission.role == 'admin':
                return True
        
        return False
    except ValueError:
        return False


def get_user_role_in_calendar(calendar: CalendarModel, user_id: str) -> Optional[str]:
    """Get the user's role in a calendar"""
    try:
        user_uuid = uuid.UUID(user_id)
        
        # Owner has implicit owner role
        if calendar.owner_id == user_uuid:
            return "owner"
        
        # Check permissions
        for permission in calendar.permissions:
            if permission.user_id == user_uuid:
                return permission.role
        
        return None
    except ValueError:
        return None


def permission_to_response(permission: CalendarPermissionModel) -> CalendarPermissionResponse:
    """Convert permission model to response schema"""
    return CalendarPermissionResponse(
        id=str(permission.id),
        calendar_id=str(permission.calendar_id),
        user_id=str(permission.user_id),
        role=permission.role,
        granted_by=str(permission.granted_by),
        granted_at=permission.granted_at,
        created_at=permission.created_at,
        updated_at=permission.updated_at,
        user_email=permission.user.email if permission.user else None,
        user_first_name=permission.user.first_name if permission.user else None,
        user_last_name=permission.user.last_name if permission.user else None
    )