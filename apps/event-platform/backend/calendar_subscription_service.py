#!/usr/bin/env python3
"""
Calendar subscription functionality for the event platform
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import json

from database import CalendarSubscriptionModel, CalendarModel, UserModel


class CalendarSubscriptionCreate(BaseModel):
    """Schema for creating a new calendar subscription"""
    notification_preferences: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    @validator('notification_preferences')
    def validate_notification_preferences(cls, v):
        if v is None:
            return {}
        # Validate notification preferences structure
        allowed_keys = ['new_events', 'event_updates', 'event_reminders']
        if not isinstance(v, dict):
            raise ValueError('Notification preferences must be a dictionary')
        for key in v.keys():
            if key not in allowed_keys:
                raise ValueError(f'Invalid notification preference key: {key}')
        return v


class CalendarSubscriptionUpdate(BaseModel):
    """Schema for updating calendar subscription"""
    notification_preferences: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    
    @validator('notification_preferences')
    def validate_notification_preferences(cls, v):
        if v is None:
            return v
        # Validate notification preferences structure
        allowed_keys = ['new_events', 'event_updates', 'event_reminders']
        if not isinstance(v, dict):
            raise ValueError('Notification preferences must be a dictionary')
        for key in v.keys():
            if key not in allowed_keys:
                raise ValueError(f'Invalid notification preference key: {key}')
        return v


class CalendarSubscriptionResponse(BaseModel):
    """Schema for calendar subscription response data"""
    id: str
    calendar_id: str
    user_id: str
    subscribed_at: datetime
    notification_preferences: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CalendarWithSubscriptionInfo(BaseModel):
    """Schema for calendar with subscription information"""
    id: str
    owner_id: str
    name: str
    slug: str
    description: Optional[str]
    visibility: str
    cover_image_url: Optional[str]
    timezone: str
    is_plus_active: bool
    subscriber_count: int
    is_subscribed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


def create_calendar_subscription(
    db: Session, 
    calendar: CalendarModel, 
    user_id: str, 
    subscription_data: CalendarSubscriptionCreate
) -> CalendarSubscriptionModel:
    """Create a new calendar subscription"""
    user_uuid = uuid.UUID(user_id)
    
    # Check if subscription already exists
    existing_subscription = db.query(CalendarSubscriptionModel).filter(
        and_(
            CalendarSubscriptionModel.calendar_id == calendar.id,
            CalendarSubscriptionModel.user_id == user_uuid
        )
    ).first()
    
    if existing_subscription:
        if existing_subscription.is_active:
            raise ValueError("User is already subscribed to this calendar")
        else:
            # Reactivate existing subscription
            existing_subscription.is_active = True
            existing_subscription.notification_preferences = json.dumps(subscription_data.notification_preferences)
            existing_subscription.subscribed_at = datetime.utcnow()
            existing_subscription.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_subscription)
            return existing_subscription
    
    # Create new subscription
    subscription = CalendarSubscriptionModel(
        calendar_id=calendar.id,
        user_id=user_uuid,
        notification_preferences=json.dumps(subscription_data.notification_preferences),
        is_active=True
    )
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    return subscription


def get_calendar_subscription(
    db: Session, 
    calendar: CalendarModel, 
    user_id: str
) -> Optional[CalendarSubscriptionModel]:
    """Get a user's subscription to a calendar"""
    try:
        user_uuid = uuid.UUID(user_id)
        return db.query(CalendarSubscriptionModel).filter(
            and_(
                CalendarSubscriptionModel.calendar_id == calendar.id,
                CalendarSubscriptionModel.user_id == user_uuid,
                CalendarSubscriptionModel.is_active == True
            )
        ).first()
    except ValueError:
        return None


def get_user_subscriptions(
    db: Session, 
    user_id: str, 
    skip: int = 0, 
    limit: int = 100
) -> List[CalendarSubscriptionModel]:
    """Get all active subscriptions for a user"""
    try:
        user_uuid = uuid.UUID(user_id)
        return db.query(CalendarSubscriptionModel).filter(
            and_(
                CalendarSubscriptionModel.user_id == user_uuid,
                CalendarSubscriptionModel.is_active == True
            )
        ).offset(skip).limit(limit).all()
    except ValueError:
        return []


def get_calendar_subscribers(
    db: Session, 
    calendar: CalendarModel, 
    skip: int = 0, 
    limit: int = 100
) -> List[CalendarSubscriptionModel]:
    """Get all active subscribers for a calendar"""
    return db.query(CalendarSubscriptionModel).filter(
        and_(
            CalendarSubscriptionModel.calendar_id == calendar.id,
            CalendarSubscriptionModel.is_active == True
        )
    ).offset(skip).limit(limit).all()


def get_calendar_subscriber_count(db: Session, calendar: CalendarModel) -> int:
    """Get the number of active subscribers for a calendar"""
    return db.query(CalendarSubscriptionModel).filter(
        and_(
            CalendarSubscriptionModel.calendar_id == calendar.id,
            CalendarSubscriptionModel.is_active == True
        )
    ).count()


def unsubscribe_from_calendar(
    db: Session, 
    calendar: CalendarModel, 
    user_id: str
) -> bool:
    """Unsubscribe a user from a calendar"""
    subscription = get_calendar_subscription(db, calendar, user_id)
    
    if not subscription:
        return False
    
    # Soft delete - set is_active to False
    subscription.is_active = False
    subscription.updated_at = datetime.utcnow()
    
    db.commit()
    return True


def update_subscription_preferences(
    db: Session, 
    subscription: CalendarSubscriptionModel, 
    update_data: CalendarSubscriptionUpdate
) -> CalendarSubscriptionModel:
    """Update subscription notification preferences"""
    update_dict = update_data.dict(exclude_unset=True)
    
    for field, value in update_dict.items():
        if field == 'notification_preferences':
            setattr(subscription, field, json.dumps(value))
        else:
            setattr(subscription, field, value)
    
    subscription.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(subscription)
    
    return subscription


def can_subscribe_to_calendar(calendar: CalendarModel, user_id: str) -> bool:
    """Check if a user can subscribe to a calendar"""
    # Users cannot subscribe to their own calendars
    if str(calendar.owner_id) == user_id:
        return False
    
    # Users can only subscribe to public or unlisted calendars
    if calendar.visibility == 'private':
        return False
    
    return True


def subscription_to_response(subscription: CalendarSubscriptionModel) -> CalendarSubscriptionResponse:
    """Convert subscription model to response schema"""
    notification_prefs = {}
    if subscription.notification_preferences:
        try:
            notification_prefs = json.loads(subscription.notification_preferences)
        except json.JSONDecodeError:
            notification_prefs = {}
    
    return CalendarSubscriptionResponse(
        id=str(subscription.id),
        calendar_id=str(subscription.calendar_id),
        user_id=str(subscription.user_id),
        subscribed_at=subscription.subscribed_at,
        notification_preferences=notification_prefs,
        is_active=subscription.is_active,
        created_at=subscription.created_at,
        updated_at=subscription.updated_at
    )


def get_calendars_with_subscription_info(
    db: Session, 
    user_id: str, 
    calendars: List[CalendarModel]
) -> List[CalendarWithSubscriptionInfo]:
    """Get calendars with subscription information for a user"""
    result = []
    
    for calendar in calendars:
        # Get subscriber count
        subscriber_count = get_calendar_subscriber_count(db, calendar)
        
        # Check if user is subscribed
        is_subscribed = get_calendar_subscription(db, calendar, user_id) is not None
        
        calendar_info = CalendarWithSubscriptionInfo(
            id=str(calendar.id),
            owner_id=str(calendar.owner_id),
            name=calendar.name,
            slug=calendar.slug,
            description=calendar.description,
            visibility=calendar.visibility,
            cover_image_url=calendar.cover_image_url,
            timezone=calendar.timezone,
            is_plus_active=calendar.is_plus_active,
            subscriber_count=subscriber_count,
            is_subscribed=is_subscribed,
            created_at=calendar.created_at,
            updated_at=calendar.updated_at
        )
        
        result.append(calendar_info)
    
    return result


class SubscriptionMetrics(BaseModel):
    """Schema for subscription metrics and analytics"""
    total_subscribers: int
    active_subscribers: int
    recent_subscriptions: int  # Last 30 days
    subscription_growth_rate: float  # Percentage change from previous period
    top_notification_preferences: Dict[str, int]
    
    class Config:
        from_attributes = True


class SubscriptionActivity(BaseModel):
    """Schema for subscription activity feed"""
    id: str
    calendar_id: str
    user_id: str
    action: str  # 'subscribed', 'unsubscribed', 'updated_preferences'
    timestamp: datetime
    details: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


def get_subscription_metrics(db: Session, calendar: CalendarModel) -> SubscriptionMetrics:
    """Get comprehensive subscription metrics for a calendar"""
    from datetime import datetime, timedelta
    
    # Total subscribers (all time)
    total_subscribers = db.query(CalendarSubscriptionModel).filter(
        CalendarSubscriptionModel.calendar_id == calendar.id
    ).count()
    
    # Active subscribers (currently subscribed)
    active_subscribers = db.query(CalendarSubscriptionModel).filter(
        and_(
            CalendarSubscriptionModel.calendar_id == calendar.id,
            CalendarSubscriptionModel.is_active == True
        )
    ).count()
    
    # Recent subscriptions (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_subscriptions = db.query(CalendarSubscriptionModel).filter(
        and_(
            CalendarSubscriptionModel.calendar_id == calendar.id,
            CalendarSubscriptionModel.subscribed_at >= thirty_days_ago,
            CalendarSubscriptionModel.is_active == True
        )
    ).count()
    
    # Calculate growth rate (compare last 30 days to previous 30 days)
    sixty_days_ago = datetime.utcnow() - timedelta(days=60)
    previous_period_subscriptions = db.query(CalendarSubscriptionModel).filter(
        and_(
            CalendarSubscriptionModel.calendar_id == calendar.id,
            CalendarSubscriptionModel.subscribed_at >= sixty_days_ago,
            CalendarSubscriptionModel.subscribed_at < thirty_days_ago,
            CalendarSubscriptionModel.is_active == True
        )
    ).count()
    
    # Calculate growth rate
    if previous_period_subscriptions > 0:
        growth_rate = ((recent_subscriptions - previous_period_subscriptions) / previous_period_subscriptions) * 100
    else:
        growth_rate = 100.0 if recent_subscriptions > 0 else 0.0
    
    # Analyze notification preferences
    active_subscriptions = db.query(CalendarSubscriptionModel).filter(
        and_(
            CalendarSubscriptionModel.calendar_id == calendar.id,
            CalendarSubscriptionModel.is_active == True
        )
    ).all()
    
    notification_stats = {
        'new_events': 0,
        'event_updates': 0,
        'event_reminders': 0
    }
    
    for subscription in active_subscriptions:
        if subscription.notification_preferences:
            try:
                prefs = json.loads(subscription.notification_preferences)
                for key in notification_stats.keys():
                    if prefs.get(key, False):
                        notification_stats[key] += 1
            except json.JSONDecodeError:
                continue
    
    return SubscriptionMetrics(
        total_subscribers=total_subscribers,
        active_subscribers=active_subscribers,
        recent_subscriptions=recent_subscriptions,
        subscription_growth_rate=round(growth_rate, 2),
        top_notification_preferences=notification_stats
    )


def get_subscription_activity_feed(
    db: Session, 
    calendar: CalendarModel, 
    skip: int = 0, 
    limit: int = 50
) -> List[SubscriptionActivity]:
    """Get subscription activity feed for a calendar"""
    # Get recent subscription activities
    recent_subscriptions = db.query(CalendarSubscriptionModel).filter(
        CalendarSubscriptionModel.calendar_id == calendar.id
    ).order_by(CalendarSubscriptionModel.updated_at.desc()).offset(skip).limit(limit).all()
    
    activities = []
    for subscription in recent_subscriptions:
        # Determine action based on subscription state and timestamps
        if subscription.is_active:
            if subscription.created_at == subscription.updated_at:
                action = "subscribed"
            else:
                action = "updated_preferences"
        else:
            action = "unsubscribed"
        
        activity = SubscriptionActivity(
            id=str(subscription.id),
            calendar_id=str(subscription.calendar_id),
            user_id=str(subscription.user_id),
            action=action,
            timestamp=subscription.updated_at,
            details={
                "notification_preferences": json.loads(subscription.notification_preferences) if subscription.notification_preferences else {}
            }
        )
        activities.append(activity)
    
    return activities


def get_subscribers_with_notification_preferences(
    db: Session, 
    calendar: CalendarModel, 
    notification_type: str
) -> List[CalendarSubscriptionModel]:
    """Get subscribers who have enabled a specific notification type"""
    active_subscriptions = db.query(CalendarSubscriptionModel).filter(
        and_(
            CalendarSubscriptionModel.calendar_id == calendar.id,
            CalendarSubscriptionModel.is_active == True
        )
    ).all()
    
    filtered_subscriptions = []
    for subscription in active_subscriptions:
        if subscription.notification_preferences:
            try:
                prefs = json.loads(subscription.notification_preferences)
                if prefs.get(notification_type, False):
                    filtered_subscriptions.append(subscription)
            except json.JSONDecodeError:
                continue
    
    return filtered_subscriptions


def trigger_subscription_notifications(
    db: Session, 
    calendar: CalendarModel, 
    notification_type: str, 
    event_data: Dict[str, Any]
) -> int:
    """Trigger notifications for subscribers based on their preferences"""
    # Get subscribers who want this type of notification
    subscribers = get_subscribers_with_notification_preferences(db, calendar, notification_type)
    
    # In a real implementation, this would integrate with an email service
    # For now, we'll just return the count of notifications that would be sent
    notification_count = len(subscribers)
    
    # Log the notification trigger (in a real app, this would go to a proper logging system)
    print(f"Triggered {notification_count} notifications of type '{notification_type}' for calendar {calendar.name}")
    
    return notification_count