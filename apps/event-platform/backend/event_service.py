"""
Event service for basic event management
Supports the notification system requirements
"""

from sqlalchemy.orm import Session
from database import EventModel, EventRegistrationModel, CalendarModel, UserModel
from notification_service import NotificationService, NotificationType
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid
from pydantic import BaseModel


class EventCreate(BaseModel):
    """Schema for creating events"""
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location_type: str = "offline"
    location_address: Optional[str] = None
    location_url: Optional[str] = None
    timezone: str = "UTC"
    capacity: Optional[int] = None
    requires_approval: bool = False
    ticket_type: str = "free"
    ticket_price_cents: Optional[int] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    slug: str


class EventUpdate(BaseModel):
    """Schema for updating events"""
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location_type: Optional[str] = None
    location_address: Optional[str] = None
    location_url: Optional[str] = None
    timezone: Optional[str] = None
    capacity: Optional[int] = None
    requires_approval: Optional[bool] = None
    ticket_type: Optional[str] = None
    ticket_price_cents: Optional[int] = None
    currency: Optional[str] = None
    category: Optional[str] = None


class EventRegistrationCreate(BaseModel):
    """Schema for creating event registrations"""
    email: Optional[str] = None
    name: Optional[str] = None
    ticket_quantity: int = 1


def create_event(db: Session, calendar_id: str, host_user_id: str, event_data: EventCreate) -> EventModel:
    """Create a new event"""
    
    # Verify calendar exists and user has permission
    calendar = db.query(CalendarModel).filter(CalendarModel.id == calendar_id).first()
    if not calendar:
        raise ValueError("Calendar not found")
    
    # Create event
    event = EventModel(
        calendar_id=calendar_id,
        host_user_id=host_user_id,
        title=event_data.title,
        description=event_data.description,
        start_time=event_data.start_time,
        end_time=event_data.end_time,
        location_type=event_data.location_type,
        location_address=event_data.location_address,
        location_url=event_data.location_url,
        timezone=event_data.timezone,
        capacity=event_data.capacity,
        requires_approval=event_data.requires_approval,
        ticket_type=event_data.ticket_type,
        ticket_price_cents=event_data.ticket_price_cents,
        currency=event_data.currency,
        slug=event_data.slug,
        category=event_data.category,
        status="published"  # Auto-publish for now
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    return event


def update_event(db: Session, event: EventModel, event_data: EventUpdate) -> EventModel:
    """Update an event and send notifications for significant changes"""
    
    # Track changes for notifications
    changes = {}
    significant_changes = False
    
    # Check for significant changes that require notifications
    significant_fields = ['title', 'start_time', 'end_time', 'location_address', 'location_url']
    
    for field, value in event_data.dict(exclude_unset=True).items():
        if value is not None:
            old_value = getattr(event, field)
            if old_value != value:
                changes[field] = {"old": str(old_value), "new": str(value)}
                if field in significant_fields:
                    significant_changes = True
                setattr(event, field, value)
    
    if changes:
        event.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(event)
        
        # Send notifications for significant changes
        if significant_changes:
            send_event_update_notifications(db, event, changes)
    
    return event


def register_for_event(db: Session, event_id: str, user_id: str, registration_data: EventRegistrationCreate) -> EventRegistrationModel:
    """Register a user for an event"""
    
    # Get event
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not event:
        raise ValueError("Event not found")
    
    # Check if user is already registered
    existing_registration = db.query(EventRegistrationModel).filter(
        EventRegistrationModel.event_id == event_id,
        EventRegistrationModel.user_id == user_id
    ).first()
    
    if existing_registration:
        raise ValueError("User already registered for this event")
    
    # Check capacity
    if event.capacity:
        current_registrations = db.query(EventRegistrationModel).filter(
            EventRegistrationModel.event_id == event_id,
            EventRegistrationModel.status.in_(["confirmed", "pending_approval"])
        ).count()
        
        if current_registrations >= event.capacity:
            raise ValueError("Event is at capacity")
    
    # Create registration
    status = "pending_approval" if event.requires_approval else "confirmed"
    
    registration = EventRegistrationModel(
        event_id=event_id,
        user_id=user_id,
        email=registration_data.email,
        name=registration_data.name,
        ticket_quantity=registration_data.ticket_quantity,
        status=status
    )
    
    db.add(registration)
    db.commit()
    db.refresh(registration)
    
    # Send confirmation notification if confirmed
    if status == "confirmed":
        send_registration_confirmation(db, registration)
    
    return registration


def send_registration_confirmation(db: Session, registration: EventRegistrationModel):
    """Send registration confirmation notification"""
    
    notification_service = NotificationService(db)
    
    # Get event details
    event = registration.event
    
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
    notification_service.send_registration_confirmation(
        user_id=str(registration.user_id),
        event_id=str(event.id),
        event_title=event.title,
        event_date=event_date,
        event_location=location
    )


def send_event_update_notifications(db: Session, event: EventModel, changes: Dict[str, Any]):
    """Send event update notifications to all registered attendees"""
    
    notification_service = NotificationService(db)
    
    # Get all confirmed registrations
    registrations = db.query(EventRegistrationModel).filter(
        EventRegistrationModel.event_id == event.id,
        EventRegistrationModel.status == "confirmed"
    ).all()
    
    # Send notification to each attendee
    for registration in registrations:
        notification_service.send_event_update_notification(
            user_id=str(registration.user_id),
            event_id=str(event.id),
            event_title=event.title,
            changes=changes
        )


def send_event_invitations(db: Session, event_id: str, user_ids: List[str], invited_by_user_id: str):
    """Send event invitations to specified users"""
    
    notification_service = NotificationService(db)
    
    # Get event
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not event:
        raise ValueError("Event not found")
    
    # Get inviter name
    inviter = db.query(UserModel).filter(UserModel.id == invited_by_user_id).first()
    invited_by_name = f"{inviter.first_name} {inviter.last_name}" if inviter else "Someone"
    
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
    
    # Send invitations
    for user_id in user_ids:
        notification_service.send_event_invitation(
            user_id=user_id,
            event_id=str(event.id),
            event_title=event.title,
            event_description=event.description or "",
            event_date=event_date,
            event_location=location,
            invited_by=invited_by_name
        )


def schedule_event_reminders(db: Session, event_id: str):
    """Schedule reminder notifications for an event"""
    
    notification_service = NotificationService(db)
    
    # Get event
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not event:
        raise ValueError("Event not found")
    
    # Get all confirmed registrations
    registrations = db.query(EventRegistrationModel).filter(
        EventRegistrationModel.event_id == event.id,
        EventRegistrationModel.status == "confirmed"
    ).all()
    
    # Schedule reminders (24 hours before event)
    reminder_time = event.start_time - timedelta(hours=24)
    
    # Only schedule if reminder time is in the future
    if reminder_time > datetime.utcnow():
        for registration in registrations:
            notification_service.schedule_event_reminder(
                user_id=str(registration.user_id),
                event_id=str(event.id),
                event_title=event.title,
                event_date=event.start_time,
                reminder_time=reminder_time
            )


def get_event_by_id(db: Session, event_id: str) -> Optional[EventModel]:
    """Get event by ID"""
    # Convert string to UUID if needed
    if isinstance(event_id, str):
        try:
            event_uuid = uuid.UUID(event_id)
        except ValueError:
            return None
    else:
        event_uuid = event_id
    return db.query(EventModel).filter(EventModel.id == event_uuid).first()


def get_events_by_calendar(db: Session, calendar_id: str, skip: int = 0, limit: int = 100) -> List[EventModel]:
    """Get events for a calendar"""
    return db.query(EventModel).filter(
        EventModel.calendar_id == calendar_id
    ).offset(skip).limit(limit).all()


def get_user_registrations(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[EventRegistrationModel]:
    """Get user's event registrations"""
    return db.query(EventRegistrationModel).filter(
        EventRegistrationModel.user_id == user_id
    ).offset(skip).limit(limit).all()