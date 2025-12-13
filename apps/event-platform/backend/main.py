from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Request
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import uvicorn
import os
import uuid
import shutil
from pathlib import Path
import time
import logging

# Performance optimization imports
from cache_service import cache, cached, CacheTTL, invalidate_user_cache, invalidate_calendar_cache
from rate_limiter import (
    rate_limit, RateLimitConfig, RateLimitMiddleware, 
    check_auth_rate_limit, check_upload_rate_limit
)
from image_optimizer import (
    image_optimizer, process_avatar_image, process_calendar_cover, 
    process_event_cover, get_optimized_image_url
)
from query_optimizer import OptimizedQueries, QueryOptimizer, monitor_query_performance

from database import get_db, init_db
from auth import (
    UserCreate, UserLogin, UserResponse, Token, TokenRefresh,
    UserProfileUpdate, UserProfileResponse, PasswordResetRequest, PasswordResetConfirm,
    create_user, authenticate_user, create_tokens_for_user,
    get_current_active_user, verify_token, get_user_by_email,
    update_user_profile, update_user_avatar,
    create_password_reset_token, verify_password_reset_token, reset_user_password,
    user_to_profile_response
)
from calendar_service import (
    CalendarCreate, CalendarUpdate, CalendarResponse,
    create_calendar, get_calendar_by_id, get_calendar_by_slug,
    get_calendars_by_owner, get_public_calendars,
    update_calendar, delete_calendar,
    can_access_calendar, can_modify_calendar
)
from calendar_permissions import (
    CalendarPermissionCreate, CalendarPermissionUpdate, CalendarPermissionResponse,
    create_calendar_permission, get_calendar_permissions, get_user_calendar_permission,
    update_calendar_permission, delete_calendar_permission,
    can_manage_calendar_permissions, permission_to_response
)
from calendar_subscription_service import (
    CalendarSubscriptionCreate, CalendarSubscriptionUpdate, CalendarSubscriptionResponse,
    CalendarWithSubscriptionInfo, SubscriptionMetrics, SubscriptionActivity,
    create_calendar_subscription, get_calendar_subscription,
    get_user_subscriptions, get_calendar_subscribers, get_calendar_subscriber_count,
    unsubscribe_from_calendar, update_subscription_preferences, can_subscribe_to_calendar,
    subscription_to_response, get_calendars_with_subscription_info,
    get_subscription_metrics, get_subscription_activity_feed, trigger_subscription_notifications
)
from event_service import (
    EventCreate, EventUpdate, EventRegistrationCreate,
    create_event, update_event, register_for_event,
    get_event_by_id, get_events_by_calendar, get_user_registrations,
    send_registration_confirmation, send_event_update_notifications,
    send_event_invitations, schedule_event_reminders
)

# Celery task imports for background processing
try:
    from tasks.email_tasks import (
        send_registration_confirmation_email, send_event_update_email,
        send_event_invitation_email, send_bulk_event_notifications
    )
    from tasks.reminder_tasks import schedule_event_reminders, send_bulk_event_reminders
    from tasks.notification_tasks import queue_notification
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    print("Warning: Celery tasks not available. Background processing disabled.")

app = FastAPI(
    title="Event Management Platform API",
    description="A comprehensive event and community calendar platform",
    version="1.0.0"
)

# Performance middleware
app.add_middleware(RateLimitMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Static files for uploads
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    
    # Initialize performance optimizations
    logger.info("🚀 Initializing performance optimizations...")
    
    # Test cache connection
    if cache.available:
        logger.info("✅ Redis cache service ready")
    else:
        logger.warning("⚠️ Redis cache not available - caching disabled")
    
    # Test image optimizer
    logger.info("✅ Image optimization service ready")
    
    logger.info("✅ Event Management Platform initialized with performance optimizations")

# Health check
@app.get("/")
def read_root():
    return {
        "message": "Event Management Platform API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/performance/metrics")
def get_performance_metrics(current_user = Depends(get_current_active_user)):
    """Get performance metrics (admin only)"""
    if not current_user.is_platform_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    metrics = {
        "cache": {
            "available": cache.available,
            "redis_url": cache.redis_client.connection_pool.connection_kwargs.get('host') if cache.available else None
        },
        "rate_limiter": {
            "available": rate_limiter.available
        },
        "image_optimizer": {
            "enabled": image_optimizer.enable_optimization,
            "upload_dir": str(image_optimizer.upload_dir),
            "cdn_base_url": image_optimizer.cdn_base_url or "Local storage"
        },
        "timestamp": time.time()
    }
    
    return metrics

@app.post("/api/performance/cache/flush")
def flush_cache(current_user = Depends(get_current_active_user)):
    """Flush all cache entries (admin only)"""
    if not current_user.is_platform_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    success = cache.flush_all()
    return {
        "message": "Cache flushed successfully" if success else "Cache flush failed",
        "success": success
    }

# Authentication endpoints
@app.post("/api/auth/register", response_model=Token)
@rate_limit(config=RateLimitConfig.REGISTER)
def register_user(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        db_user = create_user(db, user)
        
        # Create tokens
        tokens = create_tokens_for_user(db_user)
        
        # Return tokens and user info
        user_response = UserResponse(
            id=str(db_user.id),
            email=db_user.email,
            first_name=db_user.first_name,
            last_name=db_user.last_name,
            username=db_user.username,
            bio=db_user.bio,
            avatar_url=db_user.avatar_url,
            joined_at=db_user.joined_at,
            is_platform_admin=db_user.is_platform_admin
        )
        
        return Token(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type="bearer",
            user=user_response
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@app.post("/api/auth/login", response_model=Token)
@rate_limit(config=RateLimitConfig.LOGIN)
def login_user(user_credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Login user"""
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    tokens = create_tokens_for_user(user)
    
    # Return tokens and user info
    user_response = UserResponse(
        id=str(user.id),
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        username=user.username,
        bio=user.bio,
        avatar_url=user.avatar_url,
        joined_at=user.joined_at,
        is_platform_admin=user.is_platform_admin
    )
    
    return Token(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
        user=user_response
    )

@app.post("/api/auth/refresh", response_model=Token)
def refresh_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token
        token_payload = verify_token(token_data.refresh_token, expected_type="refresh")
        
        # Get user
        user = get_user_by_email(db, token_payload.email)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Create new tokens
        tokens = create_tokens_for_user(user)
        
        # Return new tokens and user info
        user_response = UserResponse(
            id=str(user.id),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            username=user.username,
            bio=user.bio,
            avatar_url=user.avatar_url,
            joined_at=user.joined_at,
            is_platform_admin=user.is_platform_admin
        )
        
        return Token(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type="bearer",
            user=user_response
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@app.post("/api/auth/logout")
def logout_user(current_user = Depends(get_current_active_user)):
    """Logout user (client should discard tokens)"""
    return {"message": "Successfully logged out"}

@app.get("/api/auth/me", response_model=UserProfileResponse)
def get_current_user_info(current_user = Depends(get_current_active_user)):
    """Get current user information"""
    return user_to_profile_response(current_user)

@app.put("/api/users/profile", response_model=UserProfileResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    try:
        updated_user = update_user_profile(db, current_user, profile_data)
        return user_to_profile_response(updated_user)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@app.post("/api/users/avatar")
@rate_limit(config=RateLimitConfig.FILE_UPLOAD)
def upload_avatar(
    file: UploadFile = File(...),
    request: Request = None,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload user avatar with optimization"""
    try:
        # Process image with optimization
        image_urls = process_avatar_image(file, str(current_user.id))
        
        # Use medium size as primary avatar URL
        avatar_url = image_urls.get('medium', image_urls.get('small', ''))
        
        # Update user avatar URL
        updated_user = update_user_avatar(db, current_user, avatar_url)
        
        # Invalidate user cache
        invalidate_user_cache(str(current_user.id))
        
        return {
            "message": "Avatar uploaded and optimized successfully",
            "avatar_url": avatar_url,
            "responsive_urls": image_urls,
            "user": user_to_profile_response(updated_user)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload avatar: {str(e)}"
        )

@app.post("/api/auth/password-reset/request")
@rate_limit(config=RateLimitConfig.PASSWORD_RESET)
def request_password_reset(reset_request: PasswordResetRequest, request: Request, db: Session = Depends(get_db)):
    """Request a password reset token"""
    try:
        reset_token = create_password_reset_token(db, reset_request.email)
        
        if reset_token:
            # In a real application, you would send this token via email
            # For testing purposes, we'll return it in the response
            print(f"Password reset token for {reset_request.email}: {reset_token}")
            
            return {
                "message": "If an account with that email exists, a password reset link has been sent.",
                "token": reset_token  # Remove this in production!
            }
        else:
            # Don't reveal whether the email exists or not for security
            return {
                "message": "If an account with that email exists, a password reset link has been sent."
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process password reset request: {str(e)}"
        )

@app.post("/api/auth/password-reset/confirm")
def confirm_password_reset(reset_confirm: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Confirm password reset with token"""
    try:
        # Verify token and reset password
        success = reset_user_password(db, reset_confirm.token, reset_confirm.new_password)
        
        if success:
            return {"message": "Password has been reset successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset password: {str(e)}"
        )

@app.get("/api/auth/password-reset/verify/{token}")
def verify_reset_token(token: str, db: Session = Depends(get_db)):
    """Verify if a password reset token is valid"""
    try:
        user = verify_password_reset_token(db, token)
        
        if user:
            return {
                "valid": True,
                "email": user.email,
                "expires_at": user.password_reset_expires
            }
        else:
            return {"valid": False}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify reset token: {str(e)}"
        )

@app.get("/api/users/social-platforms")
def get_supported_social_platforms():
    """Get list of supported social media platforms"""
    return {
        "platforms": [
            {"name": "twitter", "display_name": "Twitter", "icon": "twitter"},
            {"name": "linkedin", "display_name": "LinkedIn", "icon": "linkedin"},
            {"name": "github", "display_name": "GitHub", "icon": "github"},
            {"name": "instagram", "display_name": "Instagram", "icon": "instagram"},
            {"name": "facebook", "display_name": "Facebook", "icon": "facebook"},
            {"name": "youtube", "display_name": "YouTube", "icon": "youtube"},
            {"name": "tiktok", "display_name": "TikTok", "icon": "tiktok"},
            {"name": "website", "display_name": "Website", "icon": "globe"},
            {"name": "blog", "display_name": "Blog", "icon": "edit"},
            {"name": "portfolio", "display_name": "Portfolio", "icon": "briefcase"}
        ]
    }

# Calendar permission endpoints
@app.post("/api/calendars/{calendar_id}/permissions", response_model=CalendarPermissionResponse)
def create_calendar_permission_endpoint(
    calendar_id: str,
    permission_data: CalendarPermissionCreate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new calendar permission"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check if user can manage permissions
    if not can_manage_calendar_permissions(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to manage calendar permissions"
        )
    
    try:
        permission = create_calendar_permission(db, calendar, permission_data, str(current_user.id))
        return permission_to_response(permission)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create permission: {str(e)}"
        )

@app.get("/api/calendars/{calendar_id}/permissions", response_model=List[CalendarPermissionResponse])
def list_calendar_permissions(
    calendar_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all permissions for a calendar"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check if user can manage permissions
    if not can_manage_calendar_permissions(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to view calendar permissions"
        )
    
    try:
        permissions = get_calendar_permissions(db, calendar)
        return [permission_to_response(permission) for permission in permissions]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list permissions: {str(e)}"
        )

@app.put("/api/calendars/{calendar_id}/permissions/{user_id}", response_model=CalendarPermissionResponse)
def update_calendar_permission_endpoint(
    calendar_id: str,
    user_id: str,
    permission_data: CalendarPermissionUpdate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a calendar permission"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check if user can manage permissions
    if not can_manage_calendar_permissions(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to manage calendar permissions"
        )
    
    permission = get_user_calendar_permission(db, calendar, user_id)
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    
    try:
        updated_permission = update_calendar_permission(db, permission, permission_data)
        return permission_to_response(updated_permission)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update permission: {str(e)}"
        )

@app.delete("/api/calendars/{calendar_id}/permissions/{user_id}")
def delete_calendar_permission_endpoint(
    calendar_id: str,
    user_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a calendar permission"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check if user can manage permissions
    if not can_manage_calendar_permissions(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to manage calendar permissions"
        )
    
    permission = get_user_calendar_permission(db, calendar, user_id)
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    
    try:
        success = delete_calendar_permission(db, permission)
        if success:
            return {"message": "Permission deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete permission"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete permission: {str(e)}"
        )

@app.get("/api/calendars/{calendar_id}/permissions/{user_id}", response_model=CalendarPermissionResponse)
def get_calendar_permission(
    calendar_id: str,
    user_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific user's permission for a calendar"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check if user can manage permissions or is requesting their own permission
    if not (can_manage_calendar_permissions(calendar, str(current_user.id)) or str(current_user.id) == user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to view this permission"
        )
    
    permission = get_user_calendar_permission(db, calendar, user_id)
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    
    return permission_to_response(permission)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
# Calendar endpoints
@app.post("/api/calendars", response_model=CalendarResponse)
@rate_limit(config=RateLimitConfig.CALENDAR_CREATE)
def create_new_calendar(
    calendar_data: CalendarCreate,
    request: Request,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new calendar"""
    try:
        calendar = create_calendar(db, calendar_data, str(current_user.id))
        return CalendarResponse(
            id=str(calendar.id),
            owner_id=str(calendar.owner_id),
            name=calendar.name,
            slug=calendar.slug,
            description=calendar.description,
            visibility=calendar.visibility,
            cover_image_url=calendar.cover_image_url,
            timezone=calendar.timezone,
            is_plus_active=calendar.is_plus_active,
            created_at=calendar.created_at,
            updated_at=calendar.updated_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create calendar: {str(e)}"
        )

@app.get("/api/calendars/{calendar_id}", response_model=CalendarResponse)
def get_calendar(
    calendar_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get calendar by ID"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check access permissions
    if not can_access_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this calendar"
        )
    
    return CalendarResponse(
        id=str(calendar.id),
        owner_id=str(calendar.owner_id),
        name=calendar.name,
        slug=calendar.slug,
        description=calendar.description,
        visibility=calendar.visibility,
        cover_image_url=calendar.cover_image_url,
        timezone=calendar.timezone,
        is_plus_active=calendar.is_plus_active,
        created_at=calendar.created_at,
        updated_at=calendar.updated_at
    )

@app.get("/api/calendars/slug/{slug}", response_model=CalendarResponse)
def get_calendar_by_slug_endpoint(
    slug: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get calendar by slug"""
    calendar = get_calendar_by_slug(db, slug)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check access permissions
    if not can_access_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this calendar"
        )
    
    return CalendarResponse(
        id=str(calendar.id),
        owner_id=str(calendar.owner_id),
        name=calendar.name,
        slug=calendar.slug,
        description=calendar.description,
        visibility=calendar.visibility,
        cover_image_url=calendar.cover_image_url,
        timezone=calendar.timezone,
        is_plus_active=calendar.is_plus_active,
        created_at=calendar.created_at,
        updated_at=calendar.updated_at
    )

@app.get("/api/calendars", response_model=list[CalendarResponse])
@cached(ttl=CacheTTL.PUBLIC_CALENDARS, key_prefix="calendar_list")
def list_calendars(
    owner_id: str = None,
    public_only: bool = False,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List calendars with optional filtering"""
    try:
        if owner_id:
            # Get calendars by specific owner
            calendars = get_calendars_by_owner(db, owner_id, skip, limit)
            # Filter based on access permissions
            accessible_calendars = [
                cal for cal in calendars 
                if can_access_calendar(cal, str(current_user.id))
            ]
        elif public_only:
            # Get only public calendars
            accessible_calendars = get_public_calendars(db, skip, limit)
        else:
            # Get user's own calendars
            accessible_calendars = get_calendars_by_owner(db, str(current_user.id), skip, limit)
        
        return [
            CalendarResponse(
                id=str(calendar.id),
                owner_id=str(calendar.owner_id),
                name=calendar.name,
                slug=calendar.slug,
                description=calendar.description,
                visibility=calendar.visibility,
                cover_image_url=calendar.cover_image_url,
                timezone=calendar.timezone,
                is_plus_active=calendar.is_plus_active,
                created_at=calendar.created_at,
                updated_at=calendar.updated_at
            )
            for calendar in accessible_calendars
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list calendars: {str(e)}"
        )

@app.put("/api/calendars/{calendar_id}", response_model=CalendarResponse)
def update_calendar_endpoint(
    calendar_id: str,
    calendar_data: CalendarUpdate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update calendar information"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check modification permissions
    if not can_modify_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to modify this calendar"
        )
    
    try:
        updated_calendar = update_calendar(db, calendar, calendar_data)
        return CalendarResponse(
            id=str(updated_calendar.id),
            owner_id=str(updated_calendar.owner_id),
            name=updated_calendar.name,
            slug=updated_calendar.slug,
            description=updated_calendar.description,
            visibility=updated_calendar.visibility,
            cover_image_url=updated_calendar.cover_image_url,
            timezone=updated_calendar.timezone,
            is_plus_active=updated_calendar.is_plus_active,
            created_at=updated_calendar.created_at,
            updated_at=updated_calendar.updated_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update calendar: {str(e)}"
        )

@app.delete("/api/calendars/{calendar_id}")
def delete_calendar_endpoint(
    calendar_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a calendar"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check modification permissions
    if not can_modify_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to delete this calendar"
        )
    
    try:
        success = delete_calendar(db, calendar)
        if success:
            return {"message": "Calendar deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete calendar"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete calendar: {str(e)}"
        )
@app.post("/api/calendars/{calendar_id}/cover-image")
@rate_limit(config=RateLimitConfig.FILE_UPLOAD)
def upload_calendar_cover_image(
    calendar_id: str,
    file: UploadFile = File(...),
    request: Request = None,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload calendar cover image with optimization"""
    # Get calendar and check permissions
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    if not can_modify_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to modify this calendar"
        )
    
    try:
        # Process image with optimization
        image_urls = process_calendar_cover(file, calendar_id)
        
        # Use large size as primary cover URL
        cover_image_url = image_urls.get('large', image_urls.get('medium', ''))
        
        # Update calendar in database
        calendar_update = CalendarUpdate(cover_image_url=cover_image_url)
        updated_calendar = update_calendar(db, calendar, calendar_update)
        
        # Invalidate calendar cache
        invalidate_calendar_cache(calendar_id)
        
        return {
            "message": "Cover image uploaded and optimized successfully",
            "cover_image_url": cover_image_url,
            "responsive_urls": image_urls,
            "calendar": CalendarResponse(
                id=str(updated_calendar.id),
                owner_id=str(updated_calendar.owner_id),
                name=updated_calendar.name,
                slug=updated_calendar.slug,
                description=updated_calendar.description,
                visibility=updated_calendar.visibility,
                cover_image_url=updated_calendar.cover_image_url,
                timezone=updated_calendar.timezone,
                is_plus_active=updated_calendar.is_plus_active,
                created_at=updated_calendar.created_at,
                updated_at=updated_calendar.updated_at
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload cover image: {str(e)}"
        )

# Calendar subscription endpoints
@app.post("/api/calendars/{calendar_id}/subscribe", response_model=CalendarSubscriptionResponse)
def subscribe_to_calendar(
    calendar_id: str,
    subscription_data: CalendarSubscriptionCreate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Subscribe to a calendar"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check if user can subscribe to this calendar
    if not can_subscribe_to_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot subscribe to this calendar"
        )
    
    try:
        subscription = create_calendar_subscription(db, calendar, str(current_user.id), subscription_data)
        return subscription_to_response(subscription)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create subscription: {str(e)}"
        )

@app.delete("/api/calendars/{calendar_id}/subscribe")
def unsubscribe_from_calendar_endpoint(
    calendar_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Unsubscribe from a calendar"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    try:
        success = unsubscribe_from_calendar(db, calendar, str(current_user.id))
        if success:
            return {"message": "Successfully unsubscribed from calendar"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unsubscribe: {str(e)}"
        )

@app.get("/api/calendars/{calendar_id}/subscription", response_model=CalendarSubscriptionResponse)
def get_calendar_subscription_endpoint(
    calendar_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's subscription to a calendar"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    subscription = get_calendar_subscription(db, calendar, str(current_user.id))
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    return subscription_to_response(subscription)

@app.put("/api/calendars/{calendar_id}/subscription", response_model=CalendarSubscriptionResponse)
def update_calendar_subscription(
    calendar_id: str,
    update_data: CalendarSubscriptionUpdate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update subscription preferences"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    subscription = get_calendar_subscription(db, calendar, str(current_user.id))
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    try:
        updated_subscription = update_subscription_preferences(db, subscription, update_data)
        return subscription_to_response(updated_subscription)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update subscription: {str(e)}"
        )

@app.get("/api/users/subscriptions", response_model=List[CalendarSubscriptionResponse])
def get_user_subscriptions_endpoint(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's calendar subscriptions"""
    try:
        subscriptions = get_user_subscriptions(db, str(current_user.id), skip, limit)
        return [subscription_to_response(subscription) for subscription in subscriptions]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get subscriptions: {str(e)}"
        )

@app.get("/api/calendars/{calendar_id}/subscribers", response_model=List[CalendarSubscriptionResponse])
def get_calendar_subscribers_endpoint(
    calendar_id: str,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get calendar subscribers (only for calendar owners/admins)"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check if user can view subscribers (owner or admin)
    if not can_modify_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to view calendar subscribers"
        )
    
    try:
        subscribers = get_calendar_subscribers(db, calendar, skip, limit)
        return [subscription_to_response(subscription) for subscription in subscribers]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get subscribers: {str(e)}"
        )

@app.get("/api/calendars/{calendar_id}/subscriber-count")
def get_calendar_subscriber_count_endpoint(
    calendar_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get calendar subscriber count"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check access permissions
    if not can_access_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this calendar"
        )
    
    try:
        count = get_calendar_subscriber_count(db, calendar)
        return {"subscriber_count": count}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get subscriber count: {str(e)}"
        )

@app.get("/api/discover/calendars", response_model=List[CalendarWithSubscriptionInfo])
def discover_calendars_with_subscription_info(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Discover public calendars with subscription information"""
    try:
        # Get public calendars
        calendars = get_public_calendars(db, skip, limit)
        
        # Add subscription information
        calendars_with_info = get_calendars_with_subscription_info(db, str(current_user.id), calendars)
        
        return calendars_with_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to discover calendars: {str(e)}"
        )

# Calendar subscription analytics endpoints
@app.get("/api/calendars/{calendar_id}/subscription-metrics", response_model=SubscriptionMetrics)
def get_calendar_subscription_metrics(
    calendar_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get subscription metrics and analytics for a calendar (owner/admin only)"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check if user can view analytics (owner or admin)
    if not can_modify_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to view calendar analytics"
        )
    
    try:
        metrics = get_subscription_metrics(db, calendar)
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get subscription metrics: {str(e)}"
        )

@app.get("/api/calendars/{calendar_id}/subscription-activity", response_model=List[SubscriptionActivity])
def get_calendar_subscription_activity(
    calendar_id: str,
    skip: int = 0,
    limit: int = 50,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get subscription activity feed for a calendar (owner/admin only)"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check if user can view activity (owner or admin)
    if not can_modify_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to view calendar activity"
        )
    
    try:
        activity = get_subscription_activity_feed(db, calendar, skip, limit)
        return activity
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get subscription activity: {str(e)}"
        )

@app.post("/api/calendars/{calendar_id}/notify-subscribers")
def notify_calendar_subscribers(
    calendar_id: str,
    notification_type: str,
    event_data: dict,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Trigger notifications for calendar subscribers (owner/admin only)"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check if user can send notifications (owner or admin)
    if not can_modify_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to send notifications"
        )
    
    # Validate notification type
    valid_types = ['new_events', 'event_updates', 'event_reminders']
    if notification_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid notification type. Must be one of: {', '.join(valid_types)}"
        )
    
    try:
        notification_count = trigger_subscription_notifications(db, calendar, notification_type, event_data)
        return {
            "message": f"Triggered {notification_count} notifications",
            "notification_type": notification_type,
            "recipients": notification_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to trigger notifications: {str(e)}"
        )

# Event-based notification endpoints
@app.post("/api/events/{event_id}/send-confirmation")
def send_registration_confirmation_endpoint(
    event_id: str,
    user_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send registration confirmation notification"""
    from event_service import get_event_by_id
    from notification_service import NotificationService
    
    # Get event
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    try:
        notification_service = NotificationService(db)
        
        # Format event date
        event_date = event.start_time.strftime('%B %d, %Y at %I:%M %p')
        
        # Determine location
        location = None
        if event.location_type == "offline" and event.location_address:
            location = event.location_address
        elif event.location_type == "online" and event.location_url:
            location = f"Online: {event.location_url}"
        elif event.location_type == "hybrid":
            location = f"Hybrid - {event.location_address or 'TBD'}"
        
        # Send confirmation
        success = notification_service.send_registration_confirmation(
            user_id=user_id,
            event_id=event_id,
            event_title=event.title,
            event_date=event_date,
            event_location=location
        )
        
        if success:
            return {"message": "Registration confirmation sent successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send confirmation notification"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send confirmation: {str(e)}"
        )

@app.post("/api/events/{event_id}/send-update-notification")
def send_event_update_notification_endpoint(
    event_id: str,
    changes: Dict[str, Any],
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send event update notification to all attendees"""
    from event_service import get_event_by_id, send_event_update_notifications
    
    # Get event
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if user can send notifications (event host or calendar owner/admin)
    if str(current_user.id) != str(event.host_user_id):
        # Check if user is calendar owner or admin
        from calendar_service import can_modify_calendar
        if not can_modify_calendar(event.calendar, str(current_user.id)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied to send event notifications"
            )
    
    try:
        send_event_update_notifications(db, event, changes)
        return {"message": "Event update notifications sent successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send update notifications: {str(e)}"
        )

@app.post("/api/events/{event_id}/send-invitations")
def send_event_invitations_endpoint(
    event_id: str,
    user_ids: List[str],
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send event invitations to specified users"""
    from event_service import get_event_by_id, send_event_invitations
    
    # Get event
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if user can send invitations (event host or calendar owner/admin)
    if str(current_user.id) != str(event.host_user_id):
        # Check if user is calendar owner or admin
        from calendar_service import can_modify_calendar
        if not can_modify_calendar(event.calendar, str(current_user.id)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied to send event invitations"
            )
    
    try:
        send_event_invitations(db, event_id, user_ids, str(current_user.id))
        return {
            "message": f"Event invitations sent to {len(user_ids)} users",
            "recipients": len(user_ids)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send invitations: {str(e)}"
        )

@app.post("/api/events/{event_id}/schedule-reminders")
def schedule_event_reminders_endpoint(
    event_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Schedule reminder notifications for an event"""
    from event_service import get_event_by_id, schedule_event_reminders
    
    # Get event
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if user can schedule reminders (event host or calendar owner/admin)
    if str(current_user.id) != str(event.host_user_id):
        # Check if user is calendar owner or admin
        from calendar_service import can_modify_calendar
        if not can_modify_calendar(event.calendar, str(current_user.id)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied to schedule event reminders"
            )
    
    try:
        schedule_event_reminders(db, event_id)
        return {"message": "Event reminders scheduled successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to schedule reminders: {str(e)}"
        )

@app.post("/api/notifications/process-scheduled")
def process_scheduled_notifications_endpoint(
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Process and send scheduled notifications (admin only)"""
    if not current_user.is_platform_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        from notification_service import NotificationService
        notification_service = NotificationService(db)
        sent_count = notification_service.process_scheduled_notifications()
        
        return {
            "message": f"Processed {sent_count} scheduled notifications",
            "sent_count": sent_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process notifications: {str(e)}"
        )

@app.post("/api/notifications/retry-failed")
def retry_failed_notifications_endpoint(
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Retry failed notifications (admin only)"""
    if not current_user.is_platform_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        from notification_service import NotificationService
        notification_service = NotificationService(db)
        retried_count = notification_service.retry_failed_notifications()
        
        return {
            "message": f"Retried {retried_count} failed notifications",
            "retried_count": retried_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retry notifications: {str(e)}"
        )

# Background job management endpoints
@app.post("/api/jobs/queue-notification")
def queue_notification_job(
    notification_data: Dict[str, Any],
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Queue a notification for background processing"""
    if not CELERY_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Background job processing not available"
        )
    
    try:
        # Validate required fields
        required_fields = ['user_id', 'notification_type', 'subject', 'message']
        for field in required_fields:
            if field not in notification_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        # Queue the notification
        task = queue_notification.delay(
            user_id=notification_data['user_id'],
            notification_type=notification_data['notification_type'],
            subject=notification_data['subject'],
            message=notification_data['message'],
            event_id=notification_data.get('event_id'),
            calendar_id=notification_data.get('calendar_id'),
            template_data=notification_data.get('template_data'),
            scheduled_for=notification_data.get('scheduled_for')
        )
        
        return {
            "message": "Notification queued successfully",
            "task_id": task.id,
            "status": "queued"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue notification: {str(e)}"
        )

@app.post("/api/jobs/schedule-event-reminders/{event_id}")
def schedule_event_reminders_job(
    event_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Schedule reminder notifications for an event"""
    if not CELERY_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Background job processing not available"
        )
    
    from event_service import get_event_by_id
    
    # Get event and check permissions
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if user can schedule reminders (event host or calendar owner/admin)
    if str(current_user.id) != str(event.host_user_id):
        from calendar_service import can_modify_calendar
        if not can_modify_calendar(event.calendar, str(current_user.id)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied to schedule event reminders"
            )
    
    try:
        # Schedule reminders
        task = schedule_event_reminders.delay(event_id)
        
        return {
            "message": "Event reminders scheduled successfully",
            "task_id": task.id,
            "event_id": event_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to schedule reminders: {str(e)}"
        )

@app.post("/api/jobs/send-bulk-notifications")
def send_bulk_notifications_job(
    notification_data: Dict[str, Any],
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send bulk notifications to multiple users"""
    if not CELERY_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Background job processing not available"
        )
    
    try:
        # Validate required fields
        required_fields = ['user_ids', 'notification_type', 'event_id', 'event_data']
        for field in required_fields:
            if field not in notification_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        
        # Queue bulk notifications
        task = send_bulk_event_notifications.delay(
            user_ids=notification_data['user_ids'],
            notification_type=notification_data['notification_type'],
            event_id=notification_data['event_id'],
            event_data=notification_data['event_data']
        )
        
        return {
            "message": f"Bulk notifications queued for {len(notification_data['user_ids'])} users",
            "task_id": task.id,
            "recipient_count": len(notification_data['user_ids'])
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to queue bulk notifications: {str(e)}"
        )

@app.get("/api/jobs/status/{task_id}")
def get_job_status(
    task_id: str,
    current_user = Depends(get_current_active_user)
):
    """Get the status of a background job"""
    if not CELERY_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Background job processing not available"
        )
    
    try:
        from celery_app import celery_app
        
        # Get task result
        result = celery_app.AsyncResult(task_id)
        
        return {
            "task_id": task_id,
            "status": result.status,
            "result": result.result if result.ready() else None,
            "traceback": result.traceback if result.failed() else None
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get job status: {str(e)}"
        )

@app.get("/api/jobs/health")
def get_celery_health(
    current_user = Depends(get_current_active_user)
):
    """Get Celery system health status (admin only)"""
    if not current_user.is_platform_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    if not CELERY_AVAILABLE:
        return {
            "status": "unavailable",
            "message": "Celery not configured"
        }
    
    try:
        from celery_app import celery_app
        
        # Check if workers are available
        inspect = celery_app.control.inspect()
        active_workers = inspect.active()
        
        if not active_workers:
            return {
                "status": "unhealthy",
                "message": "No active workers found",
                "workers": {}
            }
        
        # Get worker stats
        stats = inspect.stats()
        
        return {
            "status": "healthy",
            "workers": active_workers,
            "stats": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# Event Response Models
class EventResponse(BaseModel):
    """Response model for events"""
    id: str
    calendar_id: str
    host_user_id: str
    title: str
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    location_type: str
    location_address: Optional[str] = None
    location_url: Optional[str] = None
    start_time: datetime
    end_time: datetime
    timezone: str
    status: str
    visibility: str
    capacity: Optional[int] = None
    requires_approval: bool
    ticket_type: str
    ticket_price_cents: Optional[int] = None
    currency: Optional[str] = None
    slug: str
    category: Optional[str] = None
    is_featured: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class EventRegistrationResponse(BaseModel):
    """Response model for event registrations"""
    id: str
    event_id: str
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    status: str
    ticket_quantity: int
    checkin_status: str
    registration_source: Optional[str] = None
    payment_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Event endpoints
@app.post("/api/calendars/{calendar_id}/events", response_model=EventResponse)
@rate_limit(config=RateLimitConfig.CALENDAR_CREATE)
def create_event_endpoint(
    calendar_id: str,
    event_data: EventCreate,
    request: Request,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new event in a calendar"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check if user can create events in this calendar
    if not can_modify_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to create events in this calendar"
        )
    
    try:
        event = create_event(db, calendar_id, str(current_user.id), event_data)
        
        # Trigger subscription notifications for new event
        if event.status == "published":
            trigger_subscription_notifications(db, calendar, "new_events", {"event_id": str(event.id)})
        
        return EventResponse(
            id=str(event.id),
            calendar_id=str(event.calendar_id),
            host_user_id=str(event.host_user_id),
            title=event.title,
            description=event.description,
            cover_image_url=event.cover_image_url,
            location_type=event.location_type,
            location_address=event.location_address,
            location_url=event.location_url,
            start_time=event.start_time,
            end_time=event.end_time,
            timezone=event.timezone,
            status=event.status,
            visibility=event.visibility,
            capacity=event.capacity,
            requires_approval=event.requires_approval,
            ticket_type=event.ticket_type,
            ticket_price_cents=event.ticket_price_cents,
            currency=event.currency,
            slug=event.slug,
            category=event.category,
            is_featured=event.is_featured,
            created_at=event.created_at,
            updated_at=event.updated_at
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create event: {str(e)}"
        )

@app.get("/api/events/{event_id}", response_model=EventResponse)
def get_event_endpoint(
    event_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get event by ID"""
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check access permissions
    calendar = get_calendar_by_id(db, str(event.calendar_id))
    if not can_access_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this event"
        )
    
    return EventResponse(
        id=str(event.id),
        calendar_id=str(event.calendar_id),
        host_user_id=str(event.host_user_id),
        title=event.title,
        description=event.description,
        cover_image_url=event.cover_image_url,
        location_type=event.location_type,
        location_address=event.location_address,
        location_url=event.location_url,
        start_time=event.start_time,
        end_time=event.end_time,
        timezone=event.timezone,
        status=event.status,
        visibility=event.visibility,
        capacity=event.capacity,
        requires_approval=event.requires_approval,
        ticket_type=event.ticket_type,
        ticket_price_cents=event.ticket_price_cents,
        currency=event.currency,
        slug=event.slug,
        category=event.category,
        is_featured=event.is_featured,
        created_at=event.created_at,
        updated_at=event.updated_at
    )

@app.get("/api/calendars/{calendar_id}/events", response_model=List[EventResponse])
def list_calendar_events(
    calendar_id: str,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List events for a calendar"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Check access permissions
    if not can_access_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this calendar"
        )
    
    events = get_events_by_calendar(db, calendar_id, skip, limit)
    return [
        EventResponse(
            id=str(event.id),
            calendar_id=str(event.calendar_id),
            host_user_id=str(event.host_user_id),
            title=event.title,
            description=event.description,
            cover_image_url=event.cover_image_url,
            location_type=event.location_type,
            location_address=event.location_address,
            location_url=event.location_url,
            start_time=event.start_time,
            end_time=event.end_time,
            timezone=event.timezone,
            status=event.status,
            visibility=event.visibility,
            capacity=event.capacity,
            requires_approval=event.requires_approval,
            ticket_type=event.ticket_type,
            ticket_price_cents=event.ticket_price_cents,
            currency=event.currency,
            slug=event.slug,
            category=event.category,
            is_featured=event.is_featured,
            created_at=event.created_at,
            updated_at=event.updated_at
        )
        for event in events
    ]

@app.put("/api/events/{event_id}", response_model=EventResponse)
def update_event_endpoint(
    event_id: str,
    event_data: EventUpdate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an event"""
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if user can modify this event
    calendar = get_calendar_by_id(db, str(event.calendar_id))
    if not can_modify_calendar(calendar, str(current_user.id)) and str(current_user.id) != str(event.host_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to modify this event"
        )
    
    try:
        updated_event = update_event(db, event, event_data)
        return EventResponse(
            id=str(updated_event.id),
            calendar_id=str(updated_event.calendar_id),
            host_user_id=str(updated_event.host_user_id),
            title=updated_event.title,
            description=updated_event.description,
            cover_image_url=updated_event.cover_image_url,
            location_type=updated_event.location_type,
            location_address=updated_event.location_address,
            location_url=updated_event.location_url,
            start_time=updated_event.start_time,
            end_time=updated_event.end_time,
            timezone=updated_event.timezone,
            status=updated_event.status,
            visibility=updated_event.visibility,
            capacity=updated_event.capacity,
            requires_approval=updated_event.requires_approval,
            ticket_type=updated_event.ticket_type,
            ticket_price_cents=updated_event.ticket_price_cents,
            currency=updated_event.currency,
            slug=updated_event.slug,
            category=updated_event.category,
            is_featured=updated_event.is_featured,
            created_at=updated_event.created_at,
            updated_at=updated_event.updated_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update event: {str(e)}"
        )

@app.delete("/api/events/{event_id}")
def delete_event_endpoint(
    event_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an event"""
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if user can delete this event
    calendar = get_calendar_by_id(db, str(event.calendar_id))
    if not can_modify_calendar(calendar, str(current_user.id)) and str(current_user.id) != str(event.host_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to delete this event"
        )
    
    try:
        db.delete(event)
        db.commit()
        return {"message": "Event deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete event: {str(e)}"
        )

@app.post("/api/events/{event_id}/cover-image")
@rate_limit(config=RateLimitConfig.FILE_UPLOAD)
def upload_event_cover_image(
    event_id: str,
    file: UploadFile = File(...),
    request: Request = None,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload event cover image with optimization"""
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check permissions
    calendar = get_calendar_by_id(db, str(event.calendar_id))
    if not can_modify_calendar(calendar, str(current_user.id)) and str(current_user.id) != str(event.host_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to modify this event"
        )
    
    try:
        # Process image with optimization
        image_urls = process_event_cover(file, event_id)
        
        # Use large size as primary cover URL
        cover_image_url = image_urls.get('large', image_urls.get('medium', ''))
        
        # Update event in database
        event_update = EventUpdate(cover_image_url=cover_image_url)
        updated_event = update_event(db, event, event_update)
        
        return {
            "message": "Cover image uploaded and optimized successfully",
            "cover_image_url": cover_image_url,
            "responsive_urls": image_urls,
            "event": EventResponse(
                id=str(updated_event.id),
                calendar_id=str(updated_event.calendar_id),
                host_user_id=str(updated_event.host_user_id),
                title=updated_event.title,
                description=updated_event.description,
                cover_image_url=updated_event.cover_image_url,
                location_type=updated_event.location_type,
                location_address=updated_event.location_address,
                location_url=updated_event.location_url,
                start_time=updated_event.start_time,
                end_time=updated_event.end_time,
                timezone=updated_event.timezone,
                status=updated_event.status,
                visibility=updated_event.visibility,
                capacity=updated_event.capacity,
                requires_approval=updated_event.requires_approval,
                ticket_type=updated_event.ticket_type,
                ticket_price_cents=updated_event.ticket_price_cents,
                currency=updated_event.currency,
                slug=updated_event.slug,
                category=updated_event.category,
                is_featured=updated_event.is_featured,
                created_at=updated_event.created_at,
                updated_at=updated_event.updated_at
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload cover image: {str(e)}"
        )

# Event registration endpoints
@app.post("/api/events/{event_id}/register", response_model=EventRegistrationResponse)
def register_for_event_endpoint(
    event_id: str,
    registration_data: EventRegistrationCreate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Register for an event"""
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if event is published
    if event.status != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is not published"
        )
    
    try:
        registration = register_for_event(db, event_id, str(current_user.id), registration_data)
        return EventRegistrationResponse(
            id=str(registration.id),
            event_id=str(registration.event_id),
            user_id=str(registration.user_id),
            email=registration.email,
            name=registration.name,
            status=registration.status,
            ticket_quantity=registration.ticket_quantity,
            checkin_status=registration.checkin_status,
            registration_source=registration.registration_source,
            payment_id=str(registration.payment_id) if registration.payment_id else None,
            created_at=registration.created_at,
            updated_at=registration.updated_at
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register for event: {str(e)}"
        )

@app.delete("/api/events/{event_id}/register")
def cancel_registration_endpoint(
    event_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel event registration"""
    from database import EventRegistrationModel
    
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    registration = db.query(EventRegistrationModel).filter(
        EventRegistrationModel.event_id == event_id,
        EventRegistrationModel.user_id == str(current_user.id)
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    try:
        registration.status = "cancelled"
        db.commit()
        return {"message": "Registration cancelled successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel registration: {str(e)}"
        )

@app.get("/api/events/{event_id}/registrations", response_model=List[EventRegistrationResponse])
def get_event_registrations(
    event_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get registrations for an event (host/admin only)"""
    from database import EventRegistrationModel
    
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if user can view registrations
    calendar = get_calendar_by_id(db, str(event.calendar_id))
    if not can_modify_calendar(calendar, str(current_user.id)) and str(current_user.id) != str(event.host_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to view registrations"
        )
    
    registrations = db.query(EventRegistrationModel).filter(
        EventRegistrationModel.event_id == event_id
    ).all()
    
    return [
        EventRegistrationResponse(
            id=str(reg.id),
            event_id=str(reg.event_id),
            user_id=str(reg.user_id),
            email=reg.email,
            name=reg.name,
            status=reg.status,
            ticket_quantity=reg.ticket_quantity,
            checkin_status=reg.checkin_status,
            registration_source=reg.registration_source,
            payment_id=str(reg.payment_id) if reg.payment_id else None,
            created_at=reg.created_at,
            updated_at=reg.updated_at
        )
        for reg in registrations
    ]

@app.get("/api/users/registrations", response_model=List[EventRegistrationResponse])
def get_user_registrations_endpoint(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's event registrations"""
    registrations = get_user_registrations(db, str(current_user.id), skip, limit)
    return [
        EventRegistrationResponse(
            id=str(reg.id),
            event_id=str(reg.event_id),
            user_id=str(reg.user_id),
            email=reg.email,
            name=reg.name,
            status=reg.status,
            ticket_quantity=reg.ticket_quantity,
            checkin_status=reg.checkin_status,
            registration_source=reg.registration_source,
            payment_id=str(reg.payment_id) if reg.payment_id else None,
            created_at=reg.created_at,
            updated_at=reg.updated_at
        )
        for reg in registrations
    ]

# Search and discovery endpoints
@app.get("/api/discover/events", response_model=List[EventResponse])
def discover_events(
    search: Optional[str] = None,
    category: Optional[str] = None,
    location_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Discover and search for events"""
    from database import EventModel
    from sqlalchemy import and_, or_
    
    # Base query for published, public events
    query = db.query(EventModel).filter(
        EventModel.status == "published",
        EventModel.visibility == "public"
    )
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                EventModel.title.ilike(search_term),
                EventModel.description.ilike(search_term),
                EventModel.category.ilike(search_term)
            )
        )
    
    # Apply category filter
    if category:
        query = query.filter(EventModel.category == category)
    
    # Apply location type filter
    if location_type:
        query = query.filter(EventModel.location_type == location_type)
    
    # Apply date range filter
    if start_date:
        query = query.filter(EventModel.start_time >= start_date)
    if end_date:
        query = query.filter(EventModel.start_time <= end_date)
    
    # Order by start time
    query = query.order_by(EventModel.start_time.asc())
    
    events = query.offset(skip).limit(limit).all()
    
    return [
        EventResponse(
            id=str(event.id),
            calendar_id=str(event.calendar_id),
            host_user_id=str(event.host_user_id),
            title=event.title,
            description=event.description,
            cover_image_url=event.cover_image_url,
            location_type=event.location_type,
            location_address=event.location_address,
            location_url=event.location_url,
            start_time=event.start_time,
            end_time=event.end_time,
            timezone=event.timezone,
            status=event.status,
            visibility=event.visibility,
            capacity=event.capacity,
            requires_approval=event.requires_approval,
            ticket_type=event.ticket_type,
            ticket_price_cents=event.ticket_price_cents,
            currency=event.currency,
            slug=event.slug,
            category=event.category,
            is_featured=event.is_featured,
            created_at=event.created_at,
            updated_at=event.updated_at
        )
        for event in events
    ]

@app.get("/api/discover/events/popular", response_model=List[EventResponse])
def get_popular_events(
    skip: int = 0,
    limit: int = 20,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get popular events ranked by registration count"""
    from database import EventModel, EventRegistrationModel
    from sqlalchemy import func
    
    # Get events with registration counts
    events = db.query(
        EventModel,
        func.count(EventRegistrationModel.id).label('registration_count')
    ).outerjoin(
        EventRegistrationModel,
        and_(
            EventRegistrationModel.event_id == EventModel.id,
            EventRegistrationModel.status.in_(["confirmed", "pending_approval"])
        )
    ).filter(
        EventModel.status == "published",
        EventModel.visibility == "public"
    ).group_by(EventModel.id).order_by(
        func.count(EventRegistrationModel.id).desc(),
        EventModel.start_time.asc()
    ).offset(skip).limit(limit).all()
    
    return [
        EventResponse(
            id=str(event.id),
            calendar_id=str(event.calendar_id),
            host_user_id=str(event.host_user_id),
            title=event.title,
            description=event.description,
            cover_image_url=event.cover_image_url,
            location_type=event.location_type,
            location_address=event.location_address,
            location_url=event.location_url,
            start_time=event.start_time,
            end_time=event.end_time,
            timezone=event.timezone,
            status=event.status,
            visibility=event.visibility,
            capacity=event.capacity,
            requires_approval=event.requires_approval,
            ticket_type=event.ticket_type,
            ticket_price_cents=event.ticket_price_cents,
            currency=event.currency,
            slug=event.slug,
            category=event.category,
            is_featured=event.is_featured,
            created_at=event.created_at,
            updated_at=event.updated_at
        )
        for event, _ in events
    ]

@app.get("/api/discover/events/featured", response_model=List[EventResponse])
def get_featured_events(
    skip: int = 0,
    limit: int = 20,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get featured events"""
    from database import EventModel
    
    events = db.query(EventModel).filter(
        EventModel.status == "published",
        EventModel.visibility == "public",
        EventModel.is_featured == True
    ).order_by(EventModel.start_time.asc()).offset(skip).limit(limit).all()
    
    return [
        EventResponse(
            id=str(event.id),
            calendar_id=str(event.calendar_id),
            host_user_id=str(event.host_user_id),
            title=event.title,
            description=event.description,
            cover_image_url=event.cover_image_url,
            location_type=event.location_type,
            location_address=event.location_address,
            location_url=event.location_url,
            start_time=event.start_time,
            end_time=event.end_time,
            timezone=event.timezone,
            status=event.status,
            visibility=event.visibility,
            capacity=event.capacity,
            requires_approval=event.requires_approval,
            ticket_type=event.ticket_type,
            ticket_price_cents=event.ticket_price_cents,
            currency=event.currency,
            slug=event.slug,
            category=event.category,
            is_featured=event.is_featured,
            created_at=event.created_at,
            updated_at=event.updated_at
        )
        for event in events
    ]
# Payment endpoints
from payment_service import PaymentService

payment_service = PaymentService()

@app.post("/api/events/{event_id}/create-payment-intent")
def create_payment_intent_endpoint(
    event_id: str,
    ticket_quantity: int = 1,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a payment intent for event registration"""
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if event.ticket_type != "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event does not require payment"
        )
    
    if not event.ticket_price_cents or not event.currency:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event pricing not configured"
        )
    
    try:
        total_amount = event.ticket_price_cents * ticket_quantity
        result = payment_service.create_payment_intent(
            amount_cents=total_amount,
            currency=event.currency,
            event_id=event_id,
            user_id=str(current_user.id),
            metadata={'ticket_quantity': ticket_quantity}
        )
        
        return {
            "client_secret": result['client_secret'],
            "payment_intent_id": result['payment_intent_id'],
            "amount_cents": total_amount,
            "currency": event.currency,
            "ticket_quantity": ticket_quantity
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.post("/api/events/{event_id}/confirm-payment")
def confirm_payment_endpoint(
    event_id: str,
    payment_intent_id: str,
    ticket_quantity: int = 1,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Confirm payment and complete registration"""
    from database import EventRegistrationModel
    
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    try:
        # Confirm payment with Stripe
        payment_result = payment_service.confirm_payment(payment_intent_id)
        
        if payment_result['status'] != 'succeeded':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment not succeeded. Status: {payment_result['status']}"
            )
        
        # Create registration
        registration_data = EventRegistrationCreate(ticket_quantity=ticket_quantity)
        registration = register_for_event(db, event_id, str(current_user.id), registration_data)
        
        # Update registration with payment ID
        registration.payment_id = uuid.UUID(payment_result['id'])
        db.commit()
        db.refresh(registration)
        
        return {
            "message": "Payment confirmed and registration completed",
            "registration": EventRegistrationResponse(
                id=str(registration.id),
                event_id=str(registration.event_id),
                user_id=str(registration.user_id),
                email=registration.email,
                name=registration.name,
                status=registration.status,
                ticket_quantity=registration.ticket_quantity,
                checkin_status=registration.checkin_status,
                registration_source=registration.registration_source,
                payment_id=str(registration.payment_id),
                created_at=registration.created_at,
                updated_at=registration.updated_at
            )
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to confirm payment: {str(e)}"
        )

@app.post("/api/events/{event_id}/refund")
def create_refund_endpoint(
    event_id: str,
    registration_id: str,
    amount_cents: Optional[int] = None,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a refund for an event registration"""
    from database import EventRegistrationModel
    
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check permissions
    calendar = get_calendar_by_id(db, str(event.calendar_id))
    if not can_modify_calendar(calendar, str(current_user.id)) and str(current_user.id) != str(event.host_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to issue refunds"
        )
    
    registration = db.query(EventRegistrationModel).filter(
        EventRegistrationModel.id == registration_id,
        EventRegistrationModel.event_id == event_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    if not registration.payment_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration has no payment to refund"
        )
    
    try:
        # Create refund
        refund_result = payment_service.create_refund(
            payment_intent_id=str(registration.payment_id),
            amount_cents=amount_cents
        )
        
        # Update registration status
        registration.status = "cancelled"
        db.commit()
        
        return {
            "message": "Refund processed successfully",
            "refund": refund_result
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process refund: {str(e)}"
        )

@app.get("/api/events/{event_id}/revenue")
def get_event_revenue(
    event_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get revenue analytics for an event"""
    from database import EventRegistrationModel
    
    event = get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check permissions
    calendar = get_calendar_by_id(db, str(event.calendar_id))
    if not can_modify_calendar(calendar, str(current_user.id)) and str(current_user.id) != str(event.host_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to view revenue"
        )
    
    # Get revenue statistics
    paid_registrations = db.query(EventRegistrationModel).filter(
        EventRegistrationModel.event_id == event_id,
        EventRegistrationModel.payment_id.isnot(None),
        EventRegistrationModel.status == "confirmed"
    ).all()
    
    total_revenue_cents = sum(
        reg.ticket_quantity * (event.ticket_price_cents or 0)
        for reg in paid_registrations
    )
    
    total_tickets_sold = sum(reg.ticket_quantity for reg in paid_registrations)
    
    return {
        "event_id": event_id,
        "total_revenue_cents": total_revenue_cents,
        "total_revenue_formatted": f"{total_revenue_cents / 100:.2f} {event.currency or 'USD'}",
        "total_tickets_sold": total_tickets_sold,
        "ticket_price_cents": event.ticket_price_cents,
        "currency": event.currency,
        "paid_registrations_count": len(paid_registrations)
    }

# Calendar Plus endpoints
@app.post("/api/calendars/{calendar_id}/plus/subscribe")
def subscribe_to_calendar_plus(
    calendar_id: str,
    price_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Subscribe to Calendar Plus"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    if not can_modify_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to manage Calendar Plus subscription"
        )
    
    try:
        # Create or get Stripe customer
        import stripe
        if not calendar.stripe_customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={'calendar_id': calendar_id, 'user_id': str(current_user.id)}
            )
            calendar.stripe_customer_id = customer.id
        
        # Create subscription
        subscription_result = payment_service.create_calendar_plus_subscription(
            customer_id=calendar.stripe_customer_id,
            price_id=price_id,
            calendar_id=calendar_id
        )
        
        # Update calendar
        calendar.stripe_subscription_id = subscription_result['subscription_id']
        calendar.is_plus_active = True
        db.commit()
        db.refresh(calendar)
        
        return {
            "message": "Calendar Plus subscription created successfully",
            "subscription_id": subscription_result['subscription_id'],
            "status": subscription_result['status'],
            "calendar": CalendarResponse(
                id=str(calendar.id),
                owner_id=str(calendar.owner_id),
                name=calendar.name,
                slug=calendar.slug,
                description=calendar.description,
                visibility=calendar.visibility,
                cover_image_url=calendar.cover_image_url,
                timezone=calendar.timezone,
                is_plus_active=calendar.is_plus_active,
                created_at=calendar.created_at,
                updated_at=calendar.updated_at
            )
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create subscription: {str(e)}"
        )

@app.post("/api/calendars/{calendar_id}/plus/cancel")
def cancel_calendar_plus(
    calendar_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel Calendar Plus subscription"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    if not can_modify_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to manage Calendar Plus subscription"
        )
    
    if not calendar.stripe_subscription_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Calendar does not have an active subscription"
        )
    
    try:
        # Cancel subscription
        subscription_result = payment_service.cancel_subscription(calendar.stripe_subscription_id)
        
        return {
            "message": "Calendar Plus subscription cancelled",
            "subscription_id": subscription_result['subscription_id'],
            "status": subscription_result['status'],
            "cancel_at_period_end": subscription_result['cancel_at_period_end']
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel subscription: {str(e)}"
        )

@app.get("/api/calendars/{calendar_id}/plus/status")
def get_calendar_plus_status(
    calendar_id: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get Calendar Plus subscription status"""
    calendar = get_calendar_by_id(db, calendar_id)
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    if not can_modify_calendar(calendar, str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to view subscription status"
        )
    
    if not calendar.stripe_subscription_id:
        return {
            "is_plus_active": False,
            "subscription_id": None,
            "status": "inactive"
        }
    
    try:
        subscription_result = payment_service.get_subscription(calendar.stripe_subscription_id)
        return {
            "is_plus_active": calendar.is_plus_active,
            "subscription_id": subscription_result['subscription_id'],
            "status": subscription_result['status'],
            "current_period_end": subscription_result['current_period_end'],
            "cancel_at_period_end": subscription_result['cancel_at_period_end']
        }
    except ValueError as e:
        return {
            "is_plus_active": calendar.is_plus_active,
            "subscription_id": calendar.stripe_subscription_id,
            "status": "unknown",
            "error": str(e)
        }
