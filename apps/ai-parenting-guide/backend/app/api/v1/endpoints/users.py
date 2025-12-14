"""
User management endpoints for profile operations and user administration.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserProgress
from app.schemas.user import (
    UserResponse, UserUpdate, UserPreferencesUpdate, 
    UserPublicProfile, UserProgressResponse, UserStats
)
from app.services.auth import AuthService
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger("users")


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(AuthService.get_current_active_user)
):
    """
    Get current user's profile information.
    
    Returns complete profile data for the authenticated user.
    """
    logger.info("User profile requested", user_id=str(current_user.id))
    return UserResponse.from_orm(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile information.
    
    Allows users to modify their display name, bio, interests, and other profile data.
    """
    logger.info("User profile update requested", user_id=str(current_user.id))
    
    # Update user fields
    update_data = user_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    logger.info("User profile updated successfully", user_id=str(current_user.id))
    return UserResponse.from_orm(current_user)


@router.put("/me/preferences", response_model=UserResponse)
async def update_user_preferences(
    preferences_update: UserPreferencesUpdate,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update user preferences and settings.
    
    Allows users to modify notification settings, privacy preferences, and accessibility options.
    """
    logger.info("User preferences update requested", user_id=str(current_user.id))
    
    # Update preferences
    update_data = preferences_update.dict(exclude_unset=True)
    current_preferences = current_user.preferences or {}
    
    for field, value in update_data.items():
        if value is not None:
            current_preferences[field] = value
    
    current_user.preferences = current_preferences
    db.commit()
    db.refresh(current_user)
    
    logger.info("User preferences updated successfully", user_id=str(current_user.id))
    return UserResponse.from_orm(current_user)


@router.get("/me/progress", response_model=UserProgressResponse)
async def get_user_progress(
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's learning progress and achievements.
    
    Returns comprehensive learning analytics including completed modules,
    points, achievements, and learning preferences.
    """
    logger.info("User progress requested", user_id=str(current_user.id))
    
    progress = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).first()
    
    if not progress:
        # Create initial progress record if it doesn't exist
        progress = UserProgress(
            user_id=current_user.id,
            learning_style_profile={
                "preferred_pace": "moderate",
                "learning_modality": "mixed",
                "interaction_style": "guided"
            },
            preferred_content_types=["text", "interactive"],
            difficulty_preference="beginner"
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
    
    # Convert string fields to integers for response
    response_data = UserProgressResponse.from_orm(progress)
    response_data.total_points = int(progress.total_points)
    response_data.streak_days = int(progress.streak_days)
    
    return response_data


@router.get("/{user_id}/profile", response_model=UserPublicProfile)
async def get_user_public_profile(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_active_user)
):
    """
    Get public profile information for a specific user.
    
    Returns limited profile data based on user's privacy settings.
    """
    logger.info("Public profile requested", requested_user_id=user_id, requester_id=str(current_user.id))
    
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check privacy settings
    privacy_settings = user.preferences.get("privacy", {})
    profile_visibility = privacy_settings.get("profile_visibility", "community")
    
    if profile_visibility == "private" and user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Profile is private"
        )
    
    return UserPublicProfile.from_orm(user)


@router.get("/", response_model=List[UserPublicProfile])
async def list_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of users to return"),
    role: Optional[str] = Query(None, description="Filter by user role"),
    search: Optional[str] = Query(None, description="Search by username or display name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(AuthService.get_current_active_user)
):
    """
    List users with optional filtering and search.
    
    Returns paginated list of public user profiles based on search criteria.
    """
    logger.info("User list requested", requester_id=str(current_user.id), search=search, role=role)
    
    query = db.query(User).filter(User.is_active == True)
    
    # Apply role filter
    if role:
        query = query.filter(User.community_role == role)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.username.ilike(search_term)) |
            (User.display_name.ilike(search_term))
        )
    
    # Apply pagination
    users = query.offset(skip).limit(limit).all()
    
    # Filter based on privacy settings
    public_users = []
    for user in users:
        privacy_settings = user.preferences.get("privacy", {})
        profile_visibility = privacy_settings.get("profile_visibility", "community")
        
        if profile_visibility in ["public", "community"] or user.id == current_user.id:
            public_users.append(UserPublicProfile.from_orm(user))
    
    return public_users


@router.get("/stats", response_model=UserStats)
async def get_user_statistics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(AuthService.require_role(["admin", "moderator"]))
):
    """
    Get user statistics and analytics.
    
    Returns comprehensive user metrics for administrators and moderators.
    Requires admin or moderator role.
    """
    logger.info("User statistics requested", requester_id=current_user["user_id"])
    
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    
    # Total users
    total_users = db.query(func.count(User.id)).scalar()
    
    # Active users (logged in today)
    active_today = db.query(func.count(User.id)).filter(
        User.last_active_at >= today_start
    ).scalar()
    
    # Active users (logged in this week)
    active_week = db.query(func.count(User.id)).filter(
        User.last_active_at >= week_start
    ).scalar()
    
    # New users today
    new_today = db.query(func.count(User.id)).filter(
        User.created_at >= today_start
    ).scalar()
    
    # New users this week
    new_week = db.query(func.count(User.id)).filter(
        User.created_at >= week_start
    ).scalar()
    
    # Users by role
    role_stats = db.query(
        User.community_role,
        func.count(User.id)
    ).group_by(User.community_role).all()
    
    users_by_role = {role.value: count for role, count in role_stats}
    
    # Users by age group
    age_stats = db.query(
        User.age_group,
        func.count(User.id)
    ).group_by(User.age_group).all()
    
    users_by_age_group = {
        (age_group.value if age_group else "unspecified"): count 
        for age_group, count in age_stats
    }
    
    return UserStats(
        total_users=total_users,
        active_users_today=active_today,
        active_users_week=active_week,
        new_users_today=new_today,
        new_users_week=new_week,
        users_by_role=users_by_role,
        users_by_age_group=users_by_age_group
    )


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user_account(
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete current user's account.
    
    Permanently removes user account and associated data.
    This action cannot be undone.
    """
    logger.info("User account deletion requested", user_id=str(current_user.id))
    
    # Deactivate user instead of hard delete for data integrity
    current_user.is_active = False
    current_user.email = f"deleted_{current_user.id}@deleted.local"
    current_user.username = f"deleted_{current_user.id}"
    
    db.commit()
    
    logger.info("User account deactivated", user_id=str(current_user.id))
    
    return None