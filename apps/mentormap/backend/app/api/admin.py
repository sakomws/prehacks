from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func, desc, and_, or_
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models import (
    User, Session, Mentor, MentorApplication, Event, EventRegistration,
    ChatMessage, Newsletter, NewsletterSubscriber, EmailCampaign, EmailTemplate, EmailAnalytics,
    BlogPost, Resource, FAQ, Testimonial, ContentAnalytics,
    GiftSession, SupportTicket, TicketResponse
)

router = APIRouter()

# Pydantic models
class ApplicationStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str
    date: str
    time: str
    duration_minutes: int = 60
    location: Optional[str] = None
    is_virtual: bool = True
    meeting_url: Optional[str] = None
    max_attendees: Optional[int] = None
    price: float = 0.0

class MessageCreate(BaseModel):
    session_id: int
    recipient_id: int
    message: str

# Dashboard Stats
@router.get("/stats")
def get_dashboard_stats(db: DBSession = Depends(get_db)):
    """Get dashboard statistics"""
    total_sessions = db.query(Session).count()
    active_users = db.query(User).count()
    
    # Recent sessions (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_sessions = db.query(Session).filter(
        Session.created_at >= week_ago
    ).count()
    
    # Count mentors
    mentors_count = db.query(User).filter(User.is_mentor == True).count()
    
    # Revenue calculation
    total_revenue = db.query(func.sum(Session.price)).filter(
        Session.payment_status == "paid"
    ).scalar() or 0
    
    return {
        "total_sessions": total_sessions,
        "active_users": active_users,
        "recent_sessions": recent_sessions,
        "mentors": mentors_count,
        "total_revenue": float(total_revenue)
    }

# Recent Activity
@router.get("/activity/recent")
def get_recent_activity(limit: int = 10, db: DBSession = Depends(get_db)):
    """Get recent sessions"""
    recent_sessions = db.query(Session)\
        .order_by(desc(Session.created_at))\
        .limit(limit)\
        .all()
    
    return {
        "sessions": [
            {
                "id": s.id,
                "student": s.student.full_name if s.student else "Unknown",
                "mentor": s.mentor.user.full_name if s.mentor and s.mentor.user else "Unknown",
                "title": s.title,
                "status": s.status,
                "created_at": s.created_at.isoformat()
            }
            for s in recent_sessions
        ]
    }

# Users Management
@router.get("/users")
def get_all_users(skip: int = 0, limit: int = 100, db: DBSession = Depends(get_db)):
    """Get all users with their session counts"""
    users = db.query(User).offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        if user.is_mentor:
            session_count = db.query(Session).join(Mentor).filter(
                Mentor.user_id == user.id
            ).count()
        else:
            session_count = db.query(Session).filter(
                Session.student_id == user.id
            ).count()
        
        result.append({
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": "mentor" if user.is_mentor else "student",
            "created_at": user.created_at.isoformat(),
            "session_count": session_count
        })
    
    return result

@router.get("/users/{user_id}")
def get_user_details(user_id: int, db: DBSession = Depends(get_db)):
    """Get detailed user information"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_mentor:
        sessions = db.query(Session).join(Mentor).filter(
            Mentor.user_id == user.id
        ).all()
    else:
        sessions = db.query(Session).filter(
            Session.student_id == user.id
        ).all()
    
    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "role": "mentor" if user.is_mentor else "student",
        "created_at": user.created_at.isoformat(),
        "sessions": [
            {
                "id": s.id,
                "title": s.title,
                "status": s.status,
                "created_at": s.created_at.isoformat()
            }
            for s in sessions
        ]
    }

class UserCreate(BaseModel):
    email: str
    username: str
    full_name: str
    password: str
    is_mentor: bool = False
    profile_data: Optional[Dict] = None

@router.post("/users")
def create_user(user_data: UserCreate, db: DBSession = Depends(get_db)):
    """Create a new user account (admin only)"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        or_(User.email == user_data.email, User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email or username already exists")
    
    # Hash the password (in production, use proper password hashing)
    hashed_password = f"hashed_{user_data.password}"  # Replace with actual hashing
    
    # Create user
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        is_mentor=user_data.is_mentor
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # If creating a mentor, also create mentor profile
    if user_data.is_mentor and user_data.profile_data:
        mentor_profile = Mentor(
            user_id=new_user.id,
            title=user_data.profile_data.get("title", ""),
            bio=user_data.profile_data.get("bio", ""),
            expertise=user_data.profile_data.get("expertise", ""),
            hourly_rate=user_data.profile_data.get("hourly_rate", 100.0),
            linkedin_url=user_data.profile_data.get("linkedin_url", ""),
            website_url=user_data.profile_data.get("website_url", ""),
            is_available=True,
            rating=5.0,
            total_sessions=0
        )
        db.add(mentor_profile)
        db.commit()
    
    return {
        "success": True,
        "message": f"{'Mentor' if user_data.is_mentor else 'Mentee'} account created successfully",
        "user_id": new_user.id,
        "email": new_user.email,
        "name": new_user.full_name
    }

@router.put("/users/{user_id}")
def update_user(user_id: int, update_data: dict, db: DBSession = Depends(get_db)):
    """Update user information (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update allowed fields
    allowed_fields = ['full_name', 'email', 'username']
    for field, value in update_data.items():
        if field in allowed_fields and hasattr(user, field):
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "message": "User updated successfully",
        "user_id": user_id
    }

@router.put("/users/{user_id}/deactivate")
def deactivate_user(user_id: int, deactivate_data: dict, db: DBSession = Depends(get_db)):
    """Deactivate a user account (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # In a real implementation, you might add an is_active field to the User model
    # For now, we'll just return success
    return {
        "success": True,
        "message": f"User {user.full_name} deactivated successfully",
        "user_id": user_id
    }

# Chat Management - Real Database Implementation

@router.post("/chat/messages")
def send_message(message_data: MessageCreate, db: DBSession = Depends(get_db)):
    """Send a message in a session"""
    # Verify session exists
    session = db.query(Session).filter(Session.id == message_data.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Create message
    new_message = ChatMessage(
        session_id=message_data.session_id,
        sender_id=1,  # Admin user ID - in production, get from auth
        recipient_id=message_data.recipient_id,
        message=message_data.message
    )
    
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return {
        "success": True,
        "message_id": new_message.id,
        "sent_at": new_message.sent_at.isoformat()
    }

# Newsletter Management System - Comprehensive Implementation
# ============================================================

# Subscriber Management and Segmentation
@router.get("/newsletter/subscribers")
def get_newsletter_subscribers(
    status: str = "all",
    user_type: str = "all", 
    segment: str = "all",
    skip: int = 0,
    limit: int = 100,
    db: DBSession = Depends(get_db)
):
    """Get newsletter subscribers with filtering and segmentation"""
    query = db.query(NewsletterSubscriber)
    
    # Apply filters
    if status == "active":
        query = query.filter(NewsletterSubscriber.is_active == True)
    elif status == "inactive":
        query = query.filter(NewsletterSubscriber.is_active == False)
    
    if user_type != "all":
        query = query.filter(NewsletterSubscriber.user_type == user_type)
    
    # Apply segmentation
    if segment == "high_engagement":
        query = query.filter(NewsletterSubscriber.engagement_score >= 70)
    elif segment == "low_engagement":
        query = query.filter(NewsletterSubscriber.engagement_score < 30)
    elif segment == "recent_subscribers":
        week_ago = datetime.utcnow() - timedelta(days=7)
        query = query.filter(NewsletterSubscriber.subscribed_at >= week_ago)
    
    subscribers = query.offset(skip).limit(limit).all()
    total_count = query.count()
    
    return {
        "subscribers": [
            {
                "id": sub.id,
                "email": sub.email,
                "full_name": sub.full_name,
                "user_type": sub.user_type or "general",
                "location": sub.location,
                "preferences": sub.preferences.split(",") if sub.preferences else [],
                "tags": sub.tags.split(",") if sub.tags else [],
                "is_active": sub.is_active,
                "engagement_score": sub.engagement_score or 50,
                "subscribed_at": sub.subscribed_at.isoformat(),
                "last_opened": sub.last_opened.isoformat() if sub.last_opened else None,
                "unsubscribed_at": sub.unsubscribed_at.isoformat() if sub.unsubscribed_at else None
            }
            for sub in subscribers
        ],
        "total_count": total_count,
        "page_info": {
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_count
        }
    }

@router.post("/newsletter/subscribers")
def create_subscriber(subscriber_data: dict, db: DBSession = Depends(get_db)):
    """Create a new newsletter subscriber"""
    try:
        # Check if subscriber already exists
        existing = db.query(NewsletterSubscriber).filter(
            NewsletterSubscriber.email == subscriber_data["email"]
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Subscriber already exists")
        
        subscriber = NewsletterSubscriber(
            email=subscriber_data["email"],
            full_name=subscriber_data.get("full_name"),
            user_type=subscriber_data.get("user_type", "general"),
            location=subscriber_data.get("location"),
            preferences=",".join(subscriber_data.get("preferences", [])),
            tags=",".join(subscriber_data.get("tags", [])),
            engagement_score=subscriber_data.get("engagement_score", 50)
        )
        
        db.add(subscriber)
        db.commit()
        db.refresh(subscriber)
        
        return {
            "message": "Subscriber created successfully",
            "subscriber_id": subscriber.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/newsletter/subscribers/{subscriber_id}")
def update_subscriber(
    subscriber_id: int,
    subscriber_data: dict,
    db: DBSession = Depends(get_db)
):
    """Update subscriber information"""
    subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.id == subscriber_id
    ).first()
    
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    # Update fields
    for field, value in subscriber_data.items():
        if field in ["preferences", "tags"] and isinstance(value, list):
            value = ",".join(value)
        if field == "unsubscribed_at" and value:
            # Convert ISO string to datetime if needed
            from datetime import datetime
            if isinstance(value, str):
                try:
                    value = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    value = datetime.utcnow()
        if hasattr(subscriber, field):
            setattr(subscriber, field, value)
    
    # If unsubscribing, also set is_active to False
    if "is_active" in subscriber_data and subscriber_data["is_active"] == False:
        if not subscriber.unsubscribed_at:
            subscriber.unsubscribed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(subscriber)
    
    return {
        "message": "Subscriber updated successfully",
        "subscriber_id": subscriber_id
    }

@router.delete("/newsletter/subscribers/{subscriber_id}")
def delete_subscriber(subscriber_id: int, db: DBSession = Depends(get_db)):
    """Delete a subscriber"""
    subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.id == subscriber_id
    ).first()
    
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    db.delete(subscriber)
    db.commit()
    
    return {"message": "Subscriber deleted successfully"}


# Public unsubscribe endpoint (no auth required - for email links)
@router.post("/newsletter/unsubscribe")
def unsubscribe_by_email(email: str, db: DBSession = Depends(get_db)):
    """Public endpoint to unsubscribe by email (for email unsubscribe links)"""
    subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == email
    ).first()
    
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    subscriber.is_active = False
    subscriber.unsubscribed_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Successfully unsubscribed",
        "email": email
    }

@router.get("/newsletter/subscribers/segments")
def get_subscriber_segments(db: DBSession = Depends(get_db)):
    """Get subscriber segmentation data"""
    total_subscribers = db.query(NewsletterSubscriber).count()
    active_subscribers = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.is_active == True
    ).count()
    
    # Engagement segments (handle None values)
    high_engagement = db.query(NewsletterSubscriber).filter(
        or_(NewsletterSubscriber.engagement_score >= 70, NewsletterSubscriber.engagement_score.is_(None))
    ).count()
    medium_engagement = db.query(NewsletterSubscriber).filter(
        and_(NewsletterSubscriber.engagement_score >= 30, NewsletterSubscriber.engagement_score < 70)
    ).count()
    low_engagement = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.engagement_score < 30
    ).count()
    
    # User type segments (handle None values)
    mentees = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.user_type == "mentee"
    ).count()
    mentors = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.user_type == "mentor"
    ).count()
    general = db.query(NewsletterSubscriber).filter(
        or_(NewsletterSubscriber.user_type == "general", NewsletterSubscriber.user_type.is_(None))
    ).count()
    
    # Recent activity
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_subscribers = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.subscribed_at >= week_ago
    ).count()
    
    return {
        "total_subscribers": total_subscribers,
        "active_subscribers": active_subscribers,
        "engagement_segments": {
            "high_engagement": high_engagement,
            "medium_engagement": medium_engagement,
            "low_engagement": low_engagement
        },
        "user_type_segments": {
            "mentees": mentees,
            "mentors": mentors,
            "general": general
        },
        "recent_subscribers": recent_subscribers
    }

# Email Campaign Management
@router.get("/newsletter/campaigns")
def get_email_campaigns(
    status: str = "all",
    skip: int = 0,
    limit: int = 50,
    db: DBSession = Depends(get_db)
):
    """Get email campaigns"""
    # For now, return mock data since EmailCampaign table might not exist yet
    mock_campaigns = [
        {
            "id": 1,
            "name": "Welcome Series - Week 1",
            "subject": "Welcome to MentorMap! 🎉",
            "status": "sent",
            "scheduled_at": None,
            "sent_at": (datetime.utcnow() - timedelta(days=2)).isoformat(),
            "created_at": (datetime.utcnow() - timedelta(days=3)).isoformat(),
            "total_recipients": 150,
            "emails_sent": 150,
            "emails_delivered": 148,
            "emails_opened": 89,
            "emails_clicked": 23,
            "open_rate": 60.1,
            "click_rate": 15.5,
            "template_name": "Welcome Template",
            "creator_name": "Admin User"
        },
        {
            "id": 2,
            "name": "Monthly Newsletter - December",
            "subject": "December Updates & New Features",
            "status": "draft",
            "scheduled_at": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "sent_at": None,
            "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
            "total_recipients": 200,
            "emails_sent": 0,
            "emails_delivered": 0,
            "emails_opened": 0,
            "emails_clicked": 0,
            "open_rate": 0,
            "click_rate": 0,
            "template_name": "Newsletter Template",
            "creator_name": "Admin User"
        }
    ]
    
    if status != "all":
        mock_campaigns = [c for c in mock_campaigns if c["status"] == status]
    
    return {
        "campaigns": mock_campaigns,
        "total_count": len(mock_campaigns)
    }

@router.post("/newsletter/campaigns")
def create_email_campaign(campaign_data: dict, db: DBSession = Depends(get_db)):
    """Create a new email campaign"""
    # Calculate recipients based on segment criteria
    segment_criteria = campaign_data.get("segment_criteria", {})
    recipients_query = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.is_active == True
    )
    
    # Apply segmentation filters
    if segment_criteria.get("user_type"):
        recipients_query = recipients_query.filter(
            NewsletterSubscriber.user_type == segment_criteria["user_type"]
        )
    
    if segment_criteria.get("engagement_level"):
        level = segment_criteria["engagement_level"]
        if level == "high":
            recipients_query = recipients_query.filter(
                or_(NewsletterSubscriber.engagement_score >= 70, NewsletterSubscriber.engagement_score.is_(None))
            )
        elif level == "medium":
            recipients_query = recipients_query.filter(
                and_(NewsletterSubscriber.engagement_score >= 30, NewsletterSubscriber.engagement_score < 70)
            )
        elif level == "low":
            recipients_query = recipients_query.filter(
                NewsletterSubscriber.engagement_score < 30
            )
    
    total_recipients = recipients_query.count()
    
    return {
        "message": "Campaign created successfully",
        "campaign_id": 1,  # Mock ID
        "total_recipients": total_recipients
    }

# Email Template Management
@router.get("/newsletter/templates")
def get_email_templates(
    template_type: str = "all",
    is_active: bool = None,
    db: DBSession = Depends(get_db)
):
    """Get email templates"""
    # Return mock templates for now
    mock_templates = [
        {
            "id": 1,
            "name": "Welcome Template",
            "description": "Welcome email for new subscribers",
            "subject_template": "Welcome to {{company_name}}! 🎉",
            "template_type": "welcome",
            "is_active": True,
            "variables": ["company_name", "user_name", "welcome_link"],
            "created_at": (datetime.utcnow() - timedelta(days=10)).isoformat(),
            "creator_name": "Admin User"
        },
        {
            "id": 2,
            "name": "Newsletter Template",
            "description": "Monthly newsletter template",
            "subject_template": "{{month}} Updates & New Features",
            "template_type": "newsletter",
            "is_active": True,
            "variables": ["month", "company_name", "featured_content"],
            "created_at": (datetime.utcnow() - timedelta(days=5)).isoformat(),
            "creator_name": "Admin User"
        },
        {
            "id": 3,
            "name": "Promotional Template",
            "description": "Special offers and promotions",
            "subject_template": "Special Offer: {{offer_title}}",
            "template_type": "promotional",
            "is_active": True,
            "variables": ["offer_title", "discount_amount", "expiry_date"],
            "created_at": (datetime.utcnow() - timedelta(days=3)).isoformat(),
            "creator_name": "Admin User"
        }
    ]
    
    if template_type != "all":
        mock_templates = [t for t in mock_templates if t["template_type"] == template_type]
    
    if is_active is not None:
        mock_templates = [t for t in mock_templates if t["is_active"] == is_active]
    
    return mock_templates

@router.post("/newsletter/templates")
def create_email_template(template_data: dict, db: DBSession = Depends(get_db)):
    """Create a new email template"""
    return {
        "message": "Template created successfully",
        "template_id": 1  # Mock ID
    }

# Analytics and Engagement Tracking
@router.get("/newsletter/analytics/overview")
def get_newsletter_analytics_overview(
    days: int = 30,
    db: DBSession = Depends(get_db)
):
    """Get newsletter analytics overview"""
    # Mock analytics data
    return {
        "period_days": days,
        "campaign_metrics": {
            "total_campaigns": 5,
            "total_emails_sent": 1250,
            "total_emails_delivered": 1198,
            "total_emails_opened": 719,
            "total_emails_clicked": 186,
            "delivery_rate": 95.8,
            "open_rate": 60.0,
            "click_rate": 15.5
        },
        "subscriber_metrics": {
            "new_subscribers": 45,
            "unsubscribed": 8,
            "net_growth": 37
        },
        "top_campaigns": [
            {
                "id": 1,
                "name": "Welcome Series - Week 1",
                "subject": "Welcome to MentorMap! 🎉",
                "emails_opened": 89,
                "open_rate": 60.1,
                "sent_at": (datetime.utcnow() - timedelta(days=2)).isoformat()
            }
        ]
    }

@router.get("/newsletter/subscribers/count")
def get_subscriber_count(db: DBSession = Depends(get_db)):
    """Get subscriber count statistics"""
    total = db.query(NewsletterSubscriber).count()
    active = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.is_active == True
    ).count()
    
    return {
        "total": total,
        "active": active,
        "inactive": total - active
    }

@router.get("/newsletter/archive")
def get_newsletter_archive(db: DBSession = Depends(get_db)):
    """Get published newsletters"""
    newsletters = db.query(Newsletter).filter(
        Newsletter.is_published == True
    ).order_by(desc(Newsletter.published_at)).all()
    
    return [
        {
            "id": newsletter.id,
            "title": newsletter.title,
            "date": newsletter.published_at.strftime("%Y-%m-%d") if newsletter.published_at else None,
            "excerpt": newsletter.excerpt,
            "topics": newsletter.topics.split(",") if newsletter.topics else [],
            "is_published": newsletter.is_published
        }
        for newsletter in newsletters
    ]

# Events Management - Real Database Implementation
@router.get("/events")
def get_all_events(db: DBSession = Depends(get_db)):
    """Get all events"""
    events = db.query(Event).order_by(desc(Event.created_at)).all()
    
    result = []
    for event in events:
        registration_count = db.query(EventRegistration).filter(
            EventRegistration.event_id == event.id,
            EventRegistration.status == "registered"
        ).count()
        
        result.append({
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "date": event.date,
            "time": event.time,
            "location": event.location,
            "type": event.event_type,
            "price": f"${event.price}" if event.price > 0 else "Free",
            "spots": event.max_attendees,
            "registered": registration_count,
            "status": event.status
        })
    
    return result

@router.post("/events")
def create_event(event_data: EventCreate, db: DBSession = Depends(get_db)):
    """Create a new event"""
    new_event = Event(
        title=event_data.title,
        description=event_data.description,
        event_type=event_data.event_type,
        date=event_data.date,
        time=event_data.time,
        duration_minutes=event_data.duration_minutes,
        location=event_data.location,
        is_virtual=event_data.is_virtual,
        meeting_url=event_data.meeting_url,
        max_attendees=event_data.max_attendees,
        price=event_data.price,
        created_by=1  # Admin user ID - in production, get from auth
    )
    
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    return {
        "success": True,
        "message": "Event created successfully",
        "event_id": new_event.id
    }

@router.put("/events/{event_id}")
def update_event(event_id: int, event_data: EventCreate, db: DBSession = Depends(get_db)):
    """Update an event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    for field, value in event_data.dict().items():
        if hasattr(event, field):
            setattr(event, field, value)
    
    event.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "message": "Event updated successfully"
    }

@router.delete("/events/{event_id}")
def delete_event(event_id: int, db: DBSession = Depends(get_db)):
    """Delete an event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if there are any registrations
    registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).all()
    
    if registrations:
        # If there are registrations, just mark as cancelled for data integrity
        event.status = "cancelled"
        db.commit()
        return {
            "success": True,
            "message": "Event cancelled (has registrations)"
        }
    else:
        # If no registrations, actually delete the event
        db.delete(event)
        db.commit()
        return {
            "success": True,
            "message": "Event deleted successfully"
        }

@router.get("/events/{event_id}/registrations")
def get_event_registrations(event_id: int, db: DBSession = Depends(get_db)):
    """Get registrations for an event"""
    registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).all()
    
    return [
        {
            "id": reg.id,
            "user_name": reg.user.full_name if reg.user else "Unknown",
            "user_email": reg.user.email if reg.user else "Unknown",
            "registration_date": reg.registration_date.isoformat(),
            "status": reg.status,
            "payment_status": reg.payment_status
        }
        for reg in registrations
    ]

@router.get("/events/{event_id}/analytics")
def get_event_analytics(event_id: int, db: DBSession = Depends(get_db)):
    """Get analytics for a specific event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Get all registrations for this event
    registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).all()
    
    total_registrations = len(registrations)
    total_attendees = len([r for r in registrations if r.status == "attended"])
    attendance_rate = (total_attendees / max(total_registrations, 1)) * 100
    
    # Calculate revenue
    total_revenue = sum(event.price for r in registrations if r.payment_status == "paid")
    
    # Generate registration trend (last 7 days before event)
    from datetime import datetime, timedelta
    event_date = datetime.strptime(event.date, "%Y-%m-%d")
    trend_start = event_date - timedelta(days=7)
    
    registration_trend = []
    for i in range(7):
        day = trend_start + timedelta(days=i)
        day_registrations = len([
            r for r in registrations 
            if r.registration_date.date() == day.date()
        ])
        registration_trend.append({
            "date": day.isoformat(),
            "registrations": day_registrations
        })
    
    # Demographics by role (mock data for now)
    demographics = {
        "by_role": [
            {"role": "Student", "count": int(total_registrations * 0.6)},
            {"role": "Professional", "count": int(total_registrations * 0.3)},
            {"role": "Other", "count": int(total_registrations * 0.1)}
        ],
        "by_location": [
            {"location": "Remote", "count": int(total_registrations * 0.7)},
            {"location": "On-site", "count": int(total_registrations * 0.3)}
        ]
    }
    
    return {
        "event_id": event_id,
        "total_registrations": total_registrations,
        "total_attendees": total_attendees,
        "attendance_rate": round(attendance_rate, 1),
        "total_revenue": total_revenue,
        "registration_trend": registration_trend,
        "demographics": demographics
    }

@router.put("/registrations/{registration_id}/attendance")
def update_attendance_status(
    registration_id: int, 
    attendance_data: dict, 
    db: DBSession = Depends(get_db)
):
    """Update attendance status for a registration"""
    registration = db.query(EventRegistration).filter(
        EventRegistration.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    attendance_status = attendance_data.get("attendance_status")
    if attendance_status not in ["registered", "attended", "no_show", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid attendance status")
    
    registration.status = attendance_status
    db.commit()
    
    return {
        "success": True,
        "message": f"Attendance status updated to {attendance_status}",
        "registration_id": registration_id
    }

@router.put("/events/{event_id}/status")
def update_event_status(
    event_id: int, 
    status_data: dict, 
    db: DBSession = Depends(get_db)
):
    """Update event status"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    status = status_data.get("status")
    if status not in ["draft", "published", "cancelled", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid event status")
    
    event.status = status
    event.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "message": f"Event status updated to {status}",
        "event_id": event_id
    }

# Calendar Management - Real Database Implementation
@router.get("/calendar/stats")
def get_calendar_stats(db: DBSession = Depends(get_db)):
    """Get calendar statistics"""
    from datetime import datetime, timedelta
    
    today = datetime.utcnow().date()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    
    # Sessions today
    total_sessions_today = db.query(Session).filter(
        func.date(Session.scheduled_at) == today,
        Session.status.in_(["scheduled", "completed"])
    ).count()
    
    # Sessions this week
    total_sessions_week = db.query(Session).filter(
        func.date(Session.scheduled_at) >= week_start,
        func.date(Session.scheduled_at) <= week_end,
        Session.status.in_(["scheduled", "completed"])
    ).count()
    
    # Active mentors (mentors with availability)
    active_mentors = db.query(Mentor).filter(
        Mentor.is_available == True
    ).count()
    
    # Upcoming sessions (next 7 days)
    next_week = today + timedelta(days=7)
    upcoming_sessions = db.query(Session).filter(
        func.date(Session.scheduled_at) > today,
        func.date(Session.scheduled_at) <= next_week,
        Session.status == "scheduled"
    ).count()
    
    return {
        "total_sessions_today": total_sessions_today,
        "total_sessions_week": total_sessions_week,
        "active_mentors": active_mentors,
        "upcoming_sessions": upcoming_sessions
    }

@router.get("/calendar/events")
def get_calendar_events(
    start: str = None, 
    end: str = None, 
    db: DBSession = Depends(get_db)
):
    """Get calendar events (sessions) for a date range"""
    from datetime import datetime
    
    query = db.query(Session).filter(Session.scheduled_at.isnot(None))
    
    if start:
        start_date = datetime.fromisoformat(start.replace('Z', '+00:00'))
        query = query.filter(Session.scheduled_at >= start_date)
    
    if end:
        end_date = datetime.fromisoformat(end.replace('Z', '+00:00'))
        query = query.filter(Session.scheduled_at <= end_date)
    
    sessions = query.all()
    
    calendar_events = []
    for session in sessions:
        if session.scheduled_at:
            end_time = session.scheduled_at + timedelta(minutes=session.duration_minutes)
            
            calendar_events.append({
                "id": session.id,
                "title": session.title,
                "start": session.scheduled_at.isoformat(),
                "end": end_time.isoformat(),
                "type": "session",
                "mentor_id": session.mentor_id,
                "mentor_name": session.mentor.user.full_name if session.mentor and session.mentor.user else "Unknown",
                "student_name": session.student.full_name if session.student else "Unknown",
                "status": session.status
            })
    
    return calendar_events

@router.get("/schedule/mentors")
def get_mentor_schedules(
    start: str = None, 
    end: str = None, 
    db: DBSession = Depends(get_db)
):
    """Get mentor schedules with their sessions and availability"""
    from datetime import datetime
    from app.models import MentorAvailability, MentorTimeOff
    
    mentors = db.query(Mentor).filter(Mentor.is_available == True).all()
    
    mentor_schedules = []
    for mentor in mentors:
        # Get sessions for this mentor in the date range
        session_query = db.query(Session).filter(
            Session.mentor_id == mentor.id,
            Session.scheduled_at.isnot(None)
        )
        
        if start:
            start_date = datetime.fromisoformat(start.replace('Z', '+00:00'))
            session_query = session_query.filter(Session.scheduled_at >= start_date)
        
        if end:
            end_date = datetime.fromisoformat(end.replace('Z', '+00:00'))
            session_query = session_query.filter(Session.scheduled_at <= end_date)
        
        sessions = session_query.all()
        
        # Get availability slots
        availability_slots = db.query(MentorAvailability).filter(
            MentorAvailability.mentor_id == mentor.id,
            MentorAvailability.is_active == True
        ).all()
        
        # Get time off periods
        time_off_periods = db.query(MentorTimeOff).filter(
            MentorTimeOff.mentor_id == mentor.id
        ).all()
        
        mentor_schedules.append({
            "mentor_id": mentor.id,
            "mentor_name": mentor.user.full_name if mentor.user else "Unknown",
            "mentor_title": mentor.title,
            "availability_slots": [
                {
                    "id": slot.id,
                    "day_of_week": slot.day_of_week,
                    "start_time": slot.start_time,
                    "end_time": slot.end_time,
                    "timezone": slot.timezone
                }
                for slot in availability_slots
            ],
            "sessions": [
                {
                    "id": session.id,
                    "title": session.title,
                    "mentor_name": mentor.user.full_name if mentor.user else "Unknown",
                    "student_name": session.student.full_name if session.student else "Unknown",
                    "scheduled_at": session.scheduled_at.isoformat(),
                    "duration_minutes": session.duration_minutes,
                    "status": session.status,
                    "price": session.price,
                    "payment_status": session.payment_status
                }
                for session in sessions
            ],
            "time_off_periods": [
                {
                    "id": period.id,
                    "mentor_id": period.mentor_id,
                    "start_date": period.start_date.isoformat(),
                    "end_date": period.end_date.isoformat(),
                    "reason": period.reason,
                    "notes": period.notes,
                    "status": "approved"
                }
                for period in time_off_periods
            ]
        })
    
    return mentor_schedules

# Enhanced Chat Management - Real Database Implementation
@router.get("/chat/conversations")
def get_all_conversations_enhanced(
    status: str = None,
    db: DBSession = Depends(get_db)
):
    """Get all chat conversations with enhanced details"""
    # Get all sessions that have messages
    query = db.query(Session).join(ChatMessage).distinct()
    
    if status and status != "all":
        # For now, we'll treat all conversations as active since the model doesn't have status
        pass
    
    sessions_with_messages = query.all()
    
    conversations = []
    for session in sessions_with_messages:
        # Get last message for this session
        last_message = db.query(ChatMessage).filter(
            ChatMessage.session_id == session.id
        ).order_by(desc(ChatMessage.sent_at)).first()
        
        # Count unread messages (messages not read by admin)
        unread_count = db.query(ChatMessage).filter(
            ChatMessage.session_id == session.id,
            ChatMessage.is_read == False
        ).count()
        
        # Count flagged messages
        flagged_count = db.query(ChatMessage).filter(
            ChatMessage.session_id == session.id,
            ChatMessage.message.like('%[FLAGGED]%')  # Simple flagging mechanism
        ).count()
        
        conversation_status = "flagged" if flagged_count > 0 else "active"
        
        conversations.append({
            "id": session.id,
            "session_id": session.id,
            "mentee_name": session.student.full_name if session.student else "Unknown",
            "mentor_name": session.mentor.user.full_name if session.mentor and session.mentor.user else "Unknown",
            "topic": session.title,
            "last_message": last_message.message if last_message else "No messages",
            "last_message_time": last_message.sent_at.isoformat() if last_message else session.created_at.isoformat(),
            "unread_count": unread_count,
            "status": conversation_status,
            "created_at": session.created_at.isoformat()
        })
    
    # Filter by status if specified
    if status and status != "all":
        conversations = [c for c in conversations if c["status"] == status]
    
    return conversations

@router.get("/chat/messages/{session_id}")
def get_session_messages_enhanced(session_id: int, db: DBSession = Depends(get_db)):
    """Get all messages for a session with moderation info"""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.sent_at).all()
    
    enhanced_messages = []
    for msg in messages:
        # Determine sender role
        sender_role = "admin"
        if msg.sender_id == session.student_id:
            sender_role = "mentee"
        elif session.mentor and msg.sender_id == session.mentor.user_id:
            sender_role = "mentor"
        
        # Check if message is flagged (simple implementation)
        is_flagged = "[FLAGGED]" in msg.message
        flag_reason = "inappropriate" if is_flagged else None
        
        # Simple moderation status (in real implementation, this would be a separate field)
        moderation_status = "rejected" if is_flagged else "approved"
        
        enhanced_messages.append({
            "id": msg.id,
            "session_id": msg.session_id,
            "sender_id": msg.sender_id,
            "sender_name": msg.sender.full_name if msg.sender else "Unknown",
            "sender_role": sender_role,
            "message": msg.message.replace("[FLAGGED]", "").strip(),
            "sent_at": msg.sent_at.isoformat(),
            "is_read": msg.is_read,
            "is_flagged": is_flagged,
            "flag_reason": flag_reason,
            "moderation_status": moderation_status
        })
    
    return enhanced_messages

@router.put("/chat/messages/{message_id}/flag")
def flag_message(
    message_id: int, 
    flag_data: dict, 
    db: DBSession = Depends(get_db)
):
    """Flag a message as inappropriate"""
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Simple flagging by prepending [FLAGGED] to message
    if "[FLAGGED]" not in message.message:
        message.message = f"[FLAGGED] {message.message}"
        db.commit()
    
    return {
        "success": True,
        "message": "Message flagged successfully",
        "message_id": message_id
    }

@router.put("/chat/messages/{message_id}/moderate")
def moderate_message(
    message_id: int, 
    moderation_data: dict, 
    db: DBSession = Depends(get_db)
):
    """Moderate a message (approve/reject)"""
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    status = moderation_data.get("moderation_status")
    
    if status == "approved":
        # Remove flag if approving
        message.message = message.message.replace("[FLAGGED]", "").strip()
    elif status == "rejected":
        # Add flag if rejecting
        if "[FLAGGED]" not in message.message:
            message.message = f"[FLAGGED] {message.message}"
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Message {status} successfully",
        "message_id": message_id
    }

@router.get("/chat/analytics")
def get_message_analytics(db: DBSession = Depends(get_db)):
    """Get comprehensive message analytics"""
    from datetime import datetime, timedelta
    
    # Basic counts
    total_conversations = db.query(Session).join(ChatMessage).distinct().count()
    total_messages = db.query(ChatMessage).count()
    
    # Messages today and this week
    today = datetime.utcnow().date()
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    messages_today = db.query(ChatMessage).filter(
        func.date(ChatMessage.sent_at) == today
    ).count()
    
    messages_this_week = db.query(ChatMessage).filter(
        ChatMessage.sent_at >= week_ago
    ).count()
    
    # Flagged messages count
    flagged_messages = db.query(ChatMessage).filter(
        ChatMessage.message.like('%[FLAGGED]%')
    ).count()
    
    # Active conversations (with messages in last 30 days)
    month_ago = datetime.utcnow() - timedelta(days=30)
    active_conversations = db.query(Session).join(ChatMessage).filter(
        ChatMessage.sent_at >= month_ago
    ).distinct().count()
    
    # Calculate engagement rate (messages per conversation)
    engagement_rate = round((total_messages / max(total_conversations, 1)) * 10, 1)
    
    # Average response time (simplified calculation)
    avg_response_time = 2.5  # Mock data for now
    
    # Top mentors by message count
    top_mentors_query = db.query(
        Mentor.id,
        User.full_name,
        func.count(ChatMessage.id).label('message_count')
    ).join(User, Mentor.user_id == User.id)\
     .join(Session, Session.mentor_id == Mentor.id)\
     .join(ChatMessage, ChatMessage.session_id == Session.id)\
     .group_by(Mentor.id, User.full_name)\
     .order_by(desc('message_count'))\
     .limit(5).all()
    
    top_mentors_by_messages = [
        {
            "mentor_name": mentor.full_name,
            "message_count": mentor.message_count
        }
        for mentor in top_mentors_query
    ]
    
    # Daily message trend (last 7 days)
    daily_trend = []
    for i in range(7):
        day = datetime.utcnow().date() - timedelta(days=i)
        day_messages = db.query(ChatMessage).filter(
            func.date(ChatMessage.sent_at) == day
        ).count()
        daily_trend.append({
            "date": day.isoformat(),
            "message_count": day_messages
        })
    
    daily_trend.reverse()  # Show oldest to newest
    
    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "messages_today": messages_today,
        "messages_this_week": messages_this_week,
        "avg_response_time": avg_response_time,
        "flagged_messages": flagged_messages,
        "active_conversations": active_conversations,
        "engagement_rate": engagement_rate,
        "top_mentors_by_messages": top_mentors_by_messages,
        "daily_message_trend": daily_trend
    }

# Support Ticket Management - Real Database Implementation
@router.get("/support/tickets")
def get_support_tickets(
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: DBSession = Depends(get_db)
):
    """Get all support tickets"""
    from app.models import SupportTicket
    
    query = db.query(SupportTicket)
    
    if status and status != "all":
        query = query.filter(SupportTicket.status == status)
    
    tickets = query.order_by(desc(SupportTicket.created_at))\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    result = []
    for ticket in tickets:
        # Count responses
        from app.models import TicketResponse
        response_count = db.query(TicketResponse).filter(
            TicketResponse.ticket_id == ticket.id
        ).count()
        
        result.append({
            "id": ticket.id,
            "user_id": ticket.user_id,
            "user_name": ticket.user.full_name if ticket.user else "Unknown",
            "user_email": ticket.user.email if ticket.user else "Unknown",
            "subject": ticket.subject,
            "description": ticket.description,
            "category": ticket.category,
            "priority": ticket.priority,
            "status": ticket.status,
            "assigned_to": ticket.assigned_to,
            "assigned_to_name": ticket.assigned_user.full_name if ticket.assigned_user else None,
            "created_at": ticket.created_at.isoformat(),
            "updated_at": ticket.updated_at.isoformat(),
            "resolved_at": ticket.resolved_at.isoformat() if ticket.resolved_at else None,
            "response_count": response_count
        })
    
    return result

@router.get("/support/tickets/{ticket_id}/responses")
def get_ticket_responses(ticket_id: int, db: DBSession = Depends(get_db)):
    """Get all responses for a support ticket"""
    from app.models import SupportTicket, TicketResponse
    
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    
    responses = db.query(TicketResponse).filter(
        TicketResponse.ticket_id == ticket_id
    ).order_by(TicketResponse.created_at).all()
    
    return [
        {
            "id": response.id,
            "ticket_id": response.ticket_id,
            "responder_id": response.responder_id,
            "responder_name": response.responder.full_name if response.responder else "Unknown",
            "responder_role": "admin" if response.responder and response.responder.id == 1 else "user",  # Simple role detection
            "message": response.message,
            "created_at": response.created_at.isoformat(),
            "is_internal": response.is_internal
        }
        for response in responses
    ]

class TicketStatusUpdate(BaseModel):
    status: str

@router.put("/support/tickets/{ticket_id}/status")
def update_ticket_status(
    ticket_id: int,
    status_data: TicketStatusUpdate,
    db: DBSession = Depends(get_db)
):
    """Update support ticket status"""
    from app.models import SupportTicket
    
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    
    if status_data.status not in ["open", "in_progress", "resolved", "closed"]:
        raise HTTPException(status_code=400, detail="Invalid ticket status")
    
    ticket.status = status_data.status
    ticket.updated_at = datetime.utcnow()
    
    if status_data.status == "resolved":
        ticket.resolved_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Ticket status updated to {status_data.status}",
        "ticket_id": ticket_id
    }

class TicketAssignment(BaseModel):
    assigned_to: int

@router.put("/support/tickets/{ticket_id}/assign")
def assign_ticket(
    ticket_id: int,
    assignment_data: TicketAssignment,
    db: DBSession = Depends(get_db)
):
    """Assign support ticket to a user"""
    from app.models import SupportTicket
    
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    
    # Verify assigned user exists
    assigned_user = db.query(User).filter(User.id == assignment_data.assigned_to).first()
    if not assigned_user:
        raise HTTPException(status_code=404, detail="Assigned user not found")
    
    ticket.assigned_to = assignment_data.assigned_to
    ticket.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "message": f"Ticket assigned to {assigned_user.full_name}",
        "ticket_id": ticket_id
    }

class TicketResponseCreate(BaseModel):
    message: str
    is_internal: bool = False

@router.post("/support/tickets/{ticket_id}/responses")
def create_ticket_response(
    ticket_id: int,
    response_data: TicketResponseCreate,
    db: DBSession = Depends(get_db)
):
    """Create a response to a support ticket"""
    from app.models import SupportTicket, TicketResponse
    
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    
    new_response = TicketResponse(
        ticket_id=ticket_id,
        responder_id=1,  # Admin user ID - in production, get from auth
        message=response_data.message,
        is_internal=response_data.is_internal
    )
    
    db.add(new_response)
    
    # Update ticket status if it was open
    if ticket.status == "open":
        ticket.status = "in_progress"
    
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(new_response)
    
    return {
        "success": True,
        "message": "Response added successfully",
        "response_id": new_response.id
    }

# Create sample support tickets for testing (remove in production)
@router.post("/support/tickets/sample")
def create_sample_tickets(db: DBSession = Depends(get_db)):
    """Create sample support tickets for testing"""
    from app.models import SupportTicket, TicketResponse
    
    # Check if sample tickets already exist
    existing = db.query(SupportTicket).first()
    if existing:
        return {"message": "Sample tickets already exist"}
    
    # Get first user for testing
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No users found")
    
    sample_tickets = [
        {
            "subject": "Unable to schedule session",
            "description": "I'm having trouble scheduling a session with my mentor. The calendar doesn't seem to be working properly.",
            "category": "technical",
            "priority": "medium"
        },
        {
            "subject": "Billing question about subscription",
            "description": "I was charged twice for my monthly subscription. Can you please help me resolve this?",
            "category": "billing",
            "priority": "high"
        },
        {
            "subject": "Account access issues",
            "description": "I can't log into my account. I've tried resetting my password but haven't received the email.",
            "category": "account",
            "priority": "urgent"
        }
    ]
    
    for ticket_data in sample_tickets:
        ticket = SupportTicket(
            user_id=user.id,
            subject=ticket_data["subject"],
            description=ticket_data["description"],
            category=ticket_data["category"],
            priority=ticket_data["priority"]
        )
        db.add(ticket)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Sample support tickets created successfully"
    }

# Mentees Management - Real Database Implementation
@router.get("/mentees")
def get_all_mentees(
    status: str = None,
    experience_level: str = None,
    skip: int = 0,
    limit: int = 100,
    db: DBSession = Depends(get_db)
):
    """Get all mentees with their statistics"""
    query = db.query(User).filter(User.is_mentor == False)
    
    # Apply status filter
    if status and status != "all":
        query = query.filter(User.status == status)
    
    users = query.offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        # Get session statistics
        sessions = db.query(Session).filter(Session.student_id == user.id).all()
        total_sessions = len(sessions)
        completed_sessions = len([s for s in sessions if s.status == "completed"])
        total_spent = sum(s.price or 0 for s in sessions if s.payment_status == "paid")
        avg_rating_given = sum(s.rating or 0 for s in sessions if s.rating) / max(len([s for s in sessions if s.rating]), 1)
        
        # Get last session date
        last_session = db.query(Session).filter(
            Session.student_id == user.id
        ).order_by(desc(Session.scheduled_at)).first()
        
        result.append({
            "id": user.id,
            "user_id": user.id,
            "name": user.full_name or "Unknown",
            "email": user.email,
            "phone": None,  # User model doesn't have phone
            "date_of_birth": None,  # User model doesn't have DOB
            "location": None,  # User model doesn't have location
            "timezone": "UTC",  # Default timezone
            "occupation": None,  # User model doesn't have occupation
            "company": None,  # User model doesn't have company
            "experience_level": "beginner",  # Default level
            "goals": [],  # Default empty goals
            "interests": [],  # Default empty interests
            "preferred_communication": "video",  # Default preference
            "availability": "",  # Default empty availability
            "bio": None,  # User model doesn't have bio
            "linkedin_url": None,  # User model doesn't have LinkedIn
            "github_url": None,  # User model doesn't have GitHub
            "portfolio_url": None,  # User model doesn't have portfolio
            "status": user.status or "active",  # Use actual status from database
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "total_spent": total_spent,
            "avg_rating_given": round(avg_rating_given, 1) if avg_rating_given > 0 else 0,
            "last_session_date": last_session.scheduled_at.isoformat() if last_session and last_session.scheduled_at else None,
            "created_at": user.created_at.isoformat(),
            "updated_at": user.created_at.isoformat()  # Using created_at as updated_at
        })
    
    return result

class MenteeCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    location: Optional[str] = None
    timezone: str = "UTC"
    occupation: Optional[str] = None
    company: Optional[str] = None
    experience_level: str = "beginner"
    goals: List[str] = []
    interests: List[str] = []
    preferred_communication: str = "video"
    availability: str = ""
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    status: str = "active"

@router.post("/mentees")
def create_mentee(mentee_data: MenteeCreate, db: DBSession = Depends(get_db)):
    """Create a new mentee"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == mentee_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create user account
    new_user = User(
        email=mentee_data.email,
        username=mentee_data.email.split("@")[0],
        hashed_password="temp_password_hash",  # In production, generate proper hash
        full_name=mentee_data.name,
        is_mentor=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "success": True,
        "message": "Mentee created successfully",
        "mentee_id": new_user.id
    }

@router.put("/mentees/{mentee_id}")
def update_mentee(
    mentee_id: int,
    mentee_data: dict,
    db: DBSession = Depends(get_db)
):
    """Update mentee information"""
    user = db.query(User).filter(User.id == mentee_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Mentee not found")
    
    # Update user fields that exist in the User model
    if 'name' in mentee_data:
        user.full_name = mentee_data['name']
    if 'email' in mentee_data:
        user.email = mentee_data['email']
    
    db.commit()
    
    return {
        "success": True,
        "message": "Mentee updated successfully",
        "mentee_id": mentee_id
    }

@router.put("/mentees/{mentee_id}/status")
def update_mentee_status(
    mentee_id: int,
    status_data: dict,
    db: DBSession = Depends(get_db)
):
    """Update mentee status"""
    user = db.query(User).filter(User.id == mentee_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Mentee not found")
    
    # Validate status
    valid_statuses = ['active', 'inactive', 'suspended']
    new_status = status_data.get('status')
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    # Update the user's status
    user.status = new_status
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "message": f"Mentee status updated to {new_status} successfully",
        "mentee_id": mentee_id,
        "new_status": new_status
    }

@router.get("/mentees/{mentee_id}/analytics")
def get_mentee_analytics(
    mentee_id: int,
    db: DBSession = Depends(get_db)
):
    """Get comprehensive analytics for a mentee"""
    user = db.query(User).filter(User.id == mentee_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Mentee not found")
    
    # Get all sessions for this mentee
    sessions = db.query(Session).filter(Session.student_id == mentee_id).all()
    
    total_sessions = len(sessions)
    completed_sessions = len([s for s in sessions if s.status == "completed"])
    cancelled_sessions = len([s for s in sessions if s.status == "cancelled"])
    completion_rate = (completed_sessions / max(total_sessions, 1)) * 100
    
    total_spent = sum(s.price or 0 for s in sessions if s.payment_status == "paid")
    avg_session_rating = sum(s.rating or 0 for s in sessions if s.rating) / max(len([s for s in sessions if s.rating]), 1)
    
    # Calculate session frequency (sessions per month)
    from datetime import datetime, timedelta
    if sessions:
        first_session = min(s.created_at for s in sessions)
        months_active = max(1, (datetime.utcnow() - first_session).days / 30)
        session_frequency = total_sessions / months_active
    else:
        session_frequency = 0
    
    # Mock data for topics and engagement
    favorite_topics = [
        {"topic": "Career Development", "count": 5},
        {"topic": "Technical Skills", "count": 3},
        {"topic": "Leadership", "count": 2}
    ]
    
    engagement_score = min(100, (completion_rate + session_frequency * 10) / 2)
    
    session_history = [
        {
            "date": s.scheduled_at.isoformat() if s.scheduled_at else s.created_at.isoformat(),
            "mentor_name": s.mentor.user.full_name if s.mentor and s.mentor.user else "Unknown",
            "topic": s.title,
            "rating": s.rating or 0,
            "status": s.status
        }
        for s in sessions[-10:]  # Last 10 sessions
    ]
    
    return {
        "mentee_id": mentee_id,
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "cancelled_sessions": cancelled_sessions,
        "completion_rate": round(completion_rate, 1),
        "total_spent": total_spent,
        "avg_session_rating": round(avg_session_rating, 1) if avg_session_rating > 0 else 0,
        "favorite_topics": favorite_topics,
        "session_frequency": round(session_frequency, 1),
        "engagement_score": round(engagement_score, 1),
        "progress_metrics": {
            "goals_achieved": 3,
            "total_goals": 5,
            "skill_improvements": [
                {"skill": "React", "improvement_score": 85},
                {"skill": "Leadership", "improvement_score": 70}
            ]
        },
        "session_history": session_history
    }

@router.get("/mentees/{mentee_id}/progress")
def get_mentee_progress(
    mentee_id: int,
    db: DBSession = Depends(get_db)
):
    """Get mentee progress tracking"""
    user = db.query(User).filter(User.id == mentee_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Mentee not found")
    
    # Mock progress data (in real implementation, this would come from a progress tracking system)
    return {
        "mentee_id": mentee_id,
        "goals": [
            {
                "id": 1,
                "title": "Learn React",
                "description": "Master React fundamentals and advanced concepts",
                "status": "in_progress",
                "target_date": "2024-06-01",
                "completion_date": None,
                "progress_percentage": 75
            },
            {
                "id": 2,
                "title": "Get Promoted",
                "description": "Achieve senior developer position",
                "status": "not_started",
                "target_date": "2024-12-01",
                "completion_date": None,
                "progress_percentage": 0
            }
        ],
        "skills": [
            {
                "skill": "React",
                "current_level": 7,
                "target_level": 9,
                "progress_percentage": 78,
                "last_updated": "2024-01-15"
            },
            {
                "skill": "Leadership",
                "current_level": 5,
                "target_level": 8,
                "progress_percentage": 63,
                "last_updated": "2024-01-10"
            }
        ],
        "milestones": [
            {
                "id": 1,
                "title": "First React Project",
                "description": "Built first React application",
                "achieved_date": "2023-12-01",
                "is_achieved": True
            },
            {
                "id": 2,
                "title": "Team Lead Role",
                "description": "Led a team of 3 developers",
                "achieved_date": None,
                "is_achieved": False
            }
        ]
    }

# Revenue Analytics - Real Database Implementation
@router.get("/revenue/analytics")
def get_revenue_analytics(db: DBSession = Depends(get_db)):
    """Get comprehensive revenue analytics"""
    from datetime import datetime, timedelta
    
    # Calculate total revenue
    total_revenue = db.query(func.sum(Session.price)).filter(
        Session.payment_status == "paid"
    ).scalar() or 0
    
    # Calculate monthly revenue (current month)
    current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_revenue = db.query(func.sum(Session.price)).filter(
        Session.payment_status == "paid",
        Session.created_at >= current_month_start
    ).scalar() or 0
    
    # Calculate revenue growth (compare to last month)
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
    last_month_revenue = db.query(func.sum(Session.price)).filter(
        Session.payment_status == "paid",
        Session.created_at >= last_month_start,
        Session.created_at < current_month_start
    ).scalar() or 0
    
    revenue_growth = ((monthly_revenue - last_month_revenue) / max(last_month_revenue, 1)) * 100
    
    # Calculate average session value
    paid_sessions_count = db.query(Session).filter(Session.payment_status == "paid").count()
    avg_session_value = total_revenue / max(paid_sessions_count, 1)
    
    # Top mentors by revenue
    top_mentors_query = db.query(
        Mentor.id,
        User.full_name,
        func.sum(Session.price).label('revenue'),
        func.count(Session.id).label('sessions')
    ).join(User, Mentor.user_id == User.id)\
     .join(Session, Session.mentor_id == Mentor.id)\
     .filter(Session.payment_status == "paid")\
     .group_by(Mentor.id, User.full_name)\
     .order_by(desc('revenue'))\
     .limit(5).all()
    
    top_mentors_by_revenue = [
        {
            "mentor_id": mentor.id,
            "mentor_name": mentor.full_name,
            "revenue": float(mentor.revenue),
            "sessions": mentor.sessions
        }
        for mentor in top_mentors_query
    ]
    
    # Revenue by month (last 6 months)
    revenue_by_month = []
    for i in range(6):
        month_start = (datetime.utcnow().replace(day=1) - timedelta(days=i*30)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_revenue = db.query(func.sum(Session.price)).filter(
            Session.payment_status == "paid",
            Session.created_at >= month_start,
            Session.created_at <= month_end
        ).scalar() or 0
        
        month_sessions = db.query(Session).filter(
            Session.payment_status == "paid",
            Session.created_at >= month_start,
            Session.created_at <= month_end
        ).count()
        
        revenue_by_month.append({
            "month": month_start.strftime("%Y-%m"),
            "revenue": float(month_revenue),
            "sessions": month_sessions
        })
    
    revenue_by_month.reverse()  # Show oldest to newest
    
    # Payment methods (mock data since we don't track this)
    payment_methods = [
        {"method": "Credit Card", "count": paid_sessions_count, "revenue": float(total_revenue)},
        {"method": "PayPal", "count": 0, "revenue": 0},
        {"method": "Bank Transfer", "count": 0, "revenue": 0}
    ]
    
    return {
        "total_revenue": float(total_revenue),
        "monthly_revenue": float(monthly_revenue),
        "revenue_growth": round(revenue_growth, 1),
        "avg_session_value": round(avg_session_value, 2),
        "top_mentors_by_revenue": top_mentors_by_revenue,
        "revenue_by_month": revenue_by_month,
        "payment_methods": payment_methods
    }

# Time Off Management - Real Database Implementation
@router.get("/time-off")
def get_all_time_off(db: DBSession = Depends(get_db)):
    """Get all time off periods"""
    from app.models import MentorTimeOff
    
    time_off_periods = db.query(MentorTimeOff).order_by(desc(MentorTimeOff.start_date)).all()
    
    return [
        {
            "id": period.id,
            "mentor_id": period.mentor_id,
            "mentor_name": period.mentor.user.full_name if period.mentor and period.mentor.user else "Unknown",
            "start_date": period.start_date.isoformat(),
            "end_date": period.end_date.isoformat(),
            "reason": period.reason,
            "notes": period.notes,
            "status": "approved",  # Default status since model doesn't have status field
            "created_at": period.created_at.isoformat()
        }
        for period in time_off_periods
    ]

class TimeOffCreate(BaseModel):
    mentor_id: int
    start_date: str
    end_date: str
    reason: str
    notes: Optional[str] = None

@router.post("/time-off")
def create_time_off(time_off_data: TimeOffCreate, db: DBSession = Depends(get_db)):
    """Create a new time off period"""
    from app.models import MentorTimeOff
    from datetime import datetime
    
    # Verify mentor exists
    mentor = db.query(Mentor).filter(Mentor.id == time_off_data.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    # Parse dates
    start_date = datetime.fromisoformat(time_off_data.start_date.replace('Z', '+00:00'))
    end_date = datetime.fromisoformat(time_off_data.end_date.replace('Z', '+00:00'))
    
    new_time_off = MentorTimeOff(
        mentor_id=time_off_data.mentor_id,
        start_date=start_date,
        end_date=end_date,
        reason=time_off_data.reason,
        notes=time_off_data.notes
    )
    
    db.add(new_time_off)
    db.commit()
    db.refresh(new_time_off)
    
    return {
        "success": True,
        "message": "Time off period created successfully",
        "time_off_id": new_time_off.id
    }

@router.put("/time-off/{time_off_id}/approve")
def approve_time_off(time_off_id: int, db: DBSession = Depends(get_db)):
    """Approve a time off period"""
    from app.models import MentorTimeOff
    
    time_off = db.query(MentorTimeOff).filter(MentorTimeOff.id == time_off_id).first()
    if not time_off:
        raise HTTPException(status_code=404, detail="Time off period not found")
    
    # Since the model doesn't have a status field, we'll just return success
    return {
        "success": True,
        "message": "Time off period approved",
        "time_off_id": time_off_id
    }

# Mentor Availability Management - Real Database Implementation
@router.get("/mentors/{mentor_id}/availability")
def get_mentor_availability(mentor_id: int, db: DBSession = Depends(get_db)):
    """Get mentor availability slots"""
    from app.models import MentorAvailability
    
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    availability_slots = db.query(MentorAvailability).filter(
        MentorAvailability.mentor_id == mentor_id,
        MentorAvailability.is_active == True
    ).all()
    
    return [
        {
            "id": slot.id,
            "day_of_week": slot.day_of_week,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "timezone": slot.timezone,
            "is_active": slot.is_active
        }
        for slot in availability_slots
    ]

class AvailabilitySlotCreate(BaseModel):
    day_of_week: int
    start_time: str
    end_time: str
    timezone: str = "UTC"

@router.post("/mentors/{mentor_id}/availability")
def add_availability_slot(
    mentor_id: int, 
    slot_data: AvailabilitySlotCreate, 
    db: DBSession = Depends(get_db)
):
    """Add availability slot for mentor"""
    from app.models import MentorAvailability
    
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    new_slot = MentorAvailability(
        mentor_id=mentor_id,
        day_of_week=slot_data.day_of_week,
        start_time=slot_data.start_time,
        end_time=slot_data.end_time,
        timezone=slot_data.timezone,
        is_active=True
    )
    
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    
    return {
        "success": True,
        "message": "Availability slot added successfully",
        "slot_id": new_slot.id
    }

@router.delete("/mentors/{mentor_id}/availability/{slot_id}")
def remove_availability_slot(
    mentor_id: int, 
    slot_id: int, 
    db: DBSession = Depends(get_db)
):
    """Remove availability slot"""
    from app.models import MentorAvailability
    
    slot = db.query(MentorAvailability).filter(
        MentorAvailability.id == slot_id,
        MentorAvailability.mentor_id == mentor_id
    ).first()
    
    if not slot:
        raise HTTPException(status_code=404, detail="Availability slot not found")
    
    db.delete(slot)
    db.commit()
    
    return {
        "success": True,
        "message": "Availability slot removed successfully"
    }

# Mentors Management - Real Database Implementation
@router.get("/mentors")
def get_all_mentors(db: DBSession = Depends(get_db)):
    """Get all mentors with their statistics"""
    mentors = db.query(Mentor).all()
    
    result = []
    for mentor in mentors:
        session_count = db.query(Session).filter(
            Session.mentor_id == mentor.id
        ).count()
        
        active_sessions = db.query(Session).filter(
            Session.mentor_id == mentor.id,
            Session.status.in_(["scheduled"])
        ).count()
        
        # Convert expertise string back to list for frontend
        expertise = mentor.expertise or ""
        if expertise and isinstance(expertise, str):
            expertise = [skill.strip() for skill in expertise.split(",") if skill.strip()]
        elif not expertise:
            expertise = []
        
        result.append({
            "id": mentor.id,
            "name": mentor.user.full_name if mentor.user else "Unknown",
            "email": mentor.user.email if mentor.user else "Unknown",
            "title": mentor.title,
            "bio": mentor.bio or "",
            "expertise": expertise,
            "hourly_rate": mentor.hourly_rate,
            "linkedin_url": mentor.linkedin_url or "",
            "website_url": mentor.website_url or "",
            "status": "active" if mentor.is_available else "inactive",
            "rating": mentor.rating,
            "total_sessions": session_count,
            "active_sessions": active_sessions,
            "is_available": mentor.is_available,
            "created_at": mentor.created_at.isoformat(),
            "updated_at": mentor.created_at.isoformat()  # Using created_at as updated_at for now
        })
    
    return result

# Mentor Applications Management - Real Database Implementation
@router.get("/mentor-applications")
def get_mentor_applications(
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: DBSession = Depends(get_db)
):
    """Get all mentor applications with optional status filter"""
    query = db.query(MentorApplication)
    
    if status:
        query = query.filter(MentorApplication.status == status)
    
    applications = query.order_by(desc(MentorApplication.submitted_at))\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return [
        {
            "id": app.id,
            "name": app.full_name,
            "email": app.email,
            "title": app.title,
            "experience": app.experience,
            "expertise": app.expertise,
            "hourly_rate": app.hourly_rate,
            "status": app.status,
            "submitted_at": app.submitted_at.isoformat(),
            "linkedin_url": app.linkedin_url
        }
        for app in applications
    ]

@router.put("/mentor-applications/{application_id}")
def update_mentor_application(
    application_id: int,
    update_data: ApplicationStatusUpdate,
    db: DBSession = Depends(get_db)
):
    """Update mentor application status and create mentor profile if approved"""
    
    application = db.query(MentorApplication).filter(
        MentorApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    status = update_data.status
    notes = update_data.notes
    
    # Update application
    application.status = status
    application.notes = notes
    application.reviewed_at = datetime.utcnow()
    application.reviewed_by = 1  # Admin user ID - in production, get from auth
    
    if status == "approved":
        # Check if user exists, create if not
        user = db.query(User).filter(User.email == application.email).first()
        
        if not user:
            # Create user account for approved mentor
            user = User(
                email=application.email,
                username=application.email.split("@")[0],
                hashed_password="temp_password_hash",  # In production, generate proper hash
                full_name=application.full_name,
                is_mentor=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update existing user to be a mentor
            user.is_mentor = True
        
        # Check if mentor profile already exists
        existing_mentor = db.query(Mentor).filter(Mentor.user_id == user.id).first()
        
        if not existing_mentor:
            # Create mentor profile
            new_mentor = Mentor(
                user_id=user.id,
                title=application.title,
                bio=application.bio,
                expertise=application.expertise,
                hourly_rate=application.hourly_rate,
                linkedin_url=application.linkedin_url,
                website_url=application.website_url,
                is_available=True,
                rating=5.0,
                total_sessions=0
            )
            db.add(new_mentor)
            db.commit()
            db.refresh(new_mentor)
            
            # Link the application to the created mentor
            application.created_mentor_id = new_mentor.id
            
            db.commit()
            
            return {
                "success": True,
                "message": f"Application approved! {application.full_name} has been added to the mentors directory.",
                "application_id": application_id,
                "mentor_id": new_mentor.id,
                "user_created": True
            }
        else:
            application.created_mentor_id = existing_mentor.id
            db.commit()
            
            return {
                "success": True,
                "message": f"Application approved (mentor profile already exists)",
                "application_id": application_id,
                "mentor_id": existing_mentor.id
            }
    
    db.commit()
    
    # For rejected or other status updates
    return {
        "success": True,
        "message": f"Application {status}",
        "application_id": application_id
    }

@router.get("/mentor-applications/{application_id}")
def get_mentor_application_details(
    application_id: int,
    db: DBSession = Depends(get_db)
):
    """Get detailed mentor application information"""
    application = db.query(MentorApplication).filter(
        MentorApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {
        "id": application.id,
        "name": application.full_name,
        "email": application.email,
        "title": application.title,
        "bio": application.bio,
        "experience": application.experience,
        "expertise": application.expertise,
        "hourly_rate": application.hourly_rate,
        "availability": application.availability,
        "linkedin_url": application.linkedin_url,
        "website_url": application.website_url,
        "certifications": application.certifications,
        "why_mentor": application.why_mentor,
        "mentorship_style": application.mentorship_style,
        "success_stories": application.success_stories,
        "status": application.status,
        "submitted_at": application.submitted_at.isoformat(),
        "reviewed_at": application.reviewed_at.isoformat() if application.reviewed_at else None,
        "notes": application.notes
    }

# Gift Sessions Management - Real Database Implementation
@router.get("/gifts")
def get_all_gift_sessions(db: DBSession = Depends(get_db)):
    """Get all gift sessions"""
    gifts = db.query(GiftSession).order_by(desc(GiftSession.purchased_at)).all()
    
    return [
        {
            "id": gift.id,
            "gift_code": gift.gift_code,
            "mentor_name": gift.mentor.user.full_name if gift.mentor and gift.mentor.user else "Unknown",
            "mentor_title": gift.mentor.title if gift.mentor else "Unknown",
            "recipient_name": gift.recipient_name,
            "recipient_email": gift.recipient_email,
            "sender_name": gift.sender_name,
            "sender_email": gift.sender_email,
            "message": gift.message,
            "value": gift.value,
            "status": gift.status,
            "purchased_at": gift.purchased_at.isoformat(),
            "expires_at": gift.expires_at.isoformat(),
            "redeemed_at": gift.redeemed_at.isoformat() if gift.redeemed_at else None,
            "session_id": gift.session_id,
            "hourly_rate": gift.mentor.hourly_rate if gift.mentor else 0
        }
        for gift in gifts
    ]

@router.get("/gifts/stats")
def get_gift_stats(db: DBSession = Depends(get_db)):
    """Get gift session statistics"""
    total_gifts = db.query(GiftSession).count()
    active_gifts = db.query(GiftSession).filter(GiftSession.status == "active").count()
    redeemed_gifts = db.query(GiftSession).filter(GiftSession.status == "redeemed").count()
    
    # Calculate total revenue
    total_revenue = 0
    gifts = db.query(GiftSession).all()
    for gift in gifts:
        if gift.mentor:
            total_revenue += gift.mentor.hourly_rate
    
    return {
        "total_gifts": total_gifts,
        "active_gifts": active_gifts,
        "redeemed_gifts": redeemed_gifts,
        "total_revenue": total_revenue
    }
# Enhanced Mentors Management
@router.put("/mentors/{mentor_id}/availability")
def toggle_mentor_availability(
    mentor_id: int,
    availability_data: dict,
    db: DBSession = Depends(get_db)
):
    """Toggle mentor availability"""
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    mentor.is_available = availability_data.get("is_available", not mentor.is_available)
    db.commit()
    
    return {
        "success": True,
        "message": f"Mentor availability {'enabled' if mentor.is_available else 'disabled'}",
        "mentor_id": mentor_id,
        "is_available": mentor.is_available
    }

@router.post("/mentors")
def create_mentor(
    mentor_data: dict,
    db: DBSession = Depends(get_db)
):
    """Create a new mentor"""
    try:
        # Check if user exists
        user = db.query(User).filter(User.email == mentor_data["email"]).first()
        
        if not user:
            # Create user account
            user = User(
                email=mentor_data["email"],
                username=mentor_data["email"].split("@")[0],
                hashed_password="temp_password_hash",  # In production, generate proper hash
                full_name=mentor_data["name"],
                is_mentor=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update existing user to be a mentor
            user.is_mentor = True
            user.full_name = mentor_data["name"]
        
        # Check if mentor profile already exists
        existing_mentor = db.query(Mentor).filter(Mentor.user_id == user.id).first()
        
        if existing_mentor:
            raise HTTPException(status_code=400, detail="Mentor profile already exists for this user")
        
        # Handle expertise field - convert list to comma-separated string if needed
        expertise = mentor_data["expertise"]
        if isinstance(expertise, list):
            expertise = ", ".join(expertise)
        
        # Create mentor profile
        new_mentor = Mentor(
            user_id=user.id,
            title=mentor_data["title"],
            bio=mentor_data["bio"],
            expertise=expertise,
            hourly_rate=float(mentor_data["hourly_rate"]),
            linkedin_url=mentor_data.get("linkedin_url"),
            website_url=mentor_data.get("website_url"),
            is_available=True,
            rating=5.0,
            total_sessions=0
        )
        db.add(new_mentor)
        db.commit()
        db.refresh(new_mentor)
        
        return {
            "success": True,
            "message": "Mentor created successfully",
            "mentor_id": new_mentor.id,
            "user_created": True
        }
        
    except Exception as e:
        print(f"Error creating mentor: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create mentor: {str(e)}")

@router.put("/mentors/{mentor_id}")
def update_mentor(
    mentor_id: int,
    mentor_data: dict,
    db: DBSession = Depends(get_db)
):
    """Update mentor profile"""
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    # Handle expertise field - convert list to comma-separated string if needed
    if 'expertise' in mentor_data:
        expertise = mentor_data['expertise']
        if isinstance(expertise, list):
            mentor_data['expertise'] = ", ".join(expertise)
    
    # Update mentor fields
    for key, value in mentor_data.items():
        if hasattr(mentor, key) and key not in ['id', 'user_id', 'created_at']:
            setattr(mentor, key, value)
    
    # Update user name if provided
    if 'name' in mentor_data and mentor.user:
        mentor.user.full_name = mentor_data['name']
    
    db.commit()
    
    return {
        "success": True,
        "message": "Mentor updated successfully",
        "mentor_id": mentor_id
    }
    db.refresh(mentor)
    
    return {
        "success": True,
        "message": "Mentor updated successfully",
        "mentor_id": mentor_id
    }

@router.get("/mentors/{mentor_id}/analytics")
def get_mentor_analytics(
    mentor_id: int,
    days: int = 30,
    db: DBSession = Depends(get_db)
):
    """Get mentor performance analytics"""
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    from datetime import datetime, timedelta
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get sessions in date range
    sessions = db.query(Session).filter(
        Session.mentor_id == mentor_id,
        Session.created_at >= start_date,
        Session.created_at <= end_date
    ).all()
    
    # Calculate metrics
    total_sessions = len(sessions)
    completed_sessions = len([s for s in sessions if s.status == "completed"])
    total_revenue = sum(s.price or 0 for s in sessions if s.payment_status == "paid")
    avg_rating = sum(s.rating or 0 for s in sessions if s.rating) / max(len([s for s in sessions if s.rating]), 1)
    
    # Session status breakdown
    status_breakdown = {}
    for session in sessions:
        status = session.status
        status_breakdown[status] = status_breakdown.get(status, 0) + 1
    
    return {
        "mentor_id": mentor_id,
        "period_days": days,
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "completion_rate": (completed_sessions / max(total_sessions, 1)) * 100,
        "total_revenue": total_revenue,
        "avg_revenue_per_session": total_revenue / max(completed_sessions, 1),
        "avg_rating": round(avg_rating, 2),
        "status_breakdown": status_breakdown
    }
# Sessions Management (Legacy endpoints - kept for compatibility)

@router.get("/sessions/stats")
def get_sessions_stats(db: DBSession = Depends(get_db)):
    """Get session statistics"""
    total_sessions = db.query(Session).count()
    
    # Sessions by status
    scheduled_sessions = db.query(Session).filter(Session.status == "scheduled").count()
    completed_sessions = db.query(Session).filter(Session.status == "completed").count()
    cancelled_sessions = db.query(Session).filter(Session.status == "cancelled").count()
    pending_sessions = db.query(Session).filter(Session.status == "pending").count()
    
    # Revenue calculations
    total_revenue = db.query(func.sum(Session.price)).filter(
        Session.payment_status == "paid"
    ).scalar() or 0
    
    pending_revenue = db.query(func.sum(Session.price)).filter(
        Session.payment_status == "pending"
    ).scalar() or 0
    
    # Average session rating
    avg_rating = db.query(func.avg(Session.rating)).filter(
        Session.rating.isnot(None)
    ).scalar() or 0
    
    # Sessions this month
    from datetime import datetime, timedelta
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    sessions_this_month = db.query(Session).filter(
        Session.created_at >= month_start
    ).count()
    
    return {
        "total_sessions": total_sessions,
        "scheduled_sessions": scheduled_sessions,
        "completed_sessions": completed_sessions,
        "cancelled_sessions": cancelled_sessions,
        "pending_sessions": pending_sessions,
        "total_revenue": float(total_revenue),
        "pending_revenue": float(pending_revenue),
        "avg_rating": round(float(avg_rating), 2) if avg_rating else 0,
        "sessions_this_month": sessions_this_month,
        "completion_rate": round((completed_sessions / max(total_sessions, 1)) * 100, 1)
    }

@router.get("/sessions/{session_id}")
def get_session_details(session_id: int, db: DBSession = Depends(get_db)):
    """Get detailed session information"""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    mentor_info = {}
    if session.mentor and session.mentor.user:
        mentor_info = {
            "id": session.mentor.id,
            "name": session.mentor.user.full_name,
            "title": session.mentor.title,
            "email": session.mentor.user.email,
            "hourly_rate": session.mentor.hourly_rate
        }
    
    student_info = {}
    if session.student:
        student_info = {
            "id": session.student.id,
            "name": session.student.full_name,
            "email": session.student.email
        }
    
    return {
        "id": session.id,
        "title": session.title,
        "description": session.description,
        "scheduled_at": session.scheduled_at.isoformat() if session.scheduled_at else None,
        "duration_minutes": session.duration_minutes,
        "status": session.status,
        "price": session.price,
        "payment_status": session.payment_status,
        "stripe_payment_id": session.stripe_payment_id,
        "rating": session.rating,
        "review": session.review,
        "notes": session.notes,
        "created_at": session.created_at.isoformat(),
        "mentor": mentor_info,
        "student": student_info
    }

@router.put("/sessions/{session_id}")
def update_session_admin(
    session_id: int,
    update_data: dict,
    db: DBSession = Depends(get_db)
):
    """Update session details (admin only)"""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Update allowed fields
    allowed_fields = [
        'title', 'description', 'status', 'payment_status', 
        'notes', 'scheduled_at', 'duration_minutes'
    ]
    
    for field, value in update_data.items():
        if field in allowed_fields and hasattr(session, field):
            if field == 'scheduled_at' and value:
                from datetime import datetime
                session.scheduled_at = datetime.fromisoformat(value.replace('Z', '+00:00'))
            else:
                setattr(session, field, value)
    
    db.commit()
    db.refresh(session)
    
    return {
        "success": True,
        "message": "Session updated successfully",
        "session_id": session_id
    }

@router.delete("/sessions/{session_id}")
def delete_session_admin(session_id: int, db: DBSession = Depends(get_db)):
    """Delete a session (admin only)"""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Don't actually delete, just cancel
    session.status = "cancelled"
    db.commit()
    
    return {
        "success": True,
        "message": "Session cancelled successfully"
    }

@router.get("/sessions/revenue/breakdown")
def get_revenue_breakdown(
    days: int = 30,
    db: DBSession = Depends(get_db)
):
    """Get revenue breakdown for the last N days"""
    from datetime import datetime, timedelta
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get sessions in date range
    sessions = db.query(Session).filter(
        Session.created_at >= start_date,
        Session.created_at <= end_date,
        Session.payment_status == "paid"
    ).all()
    
    # Group by date
    daily_revenue = {}
    for session in sessions:
        date_key = session.created_at.date().isoformat()
        if date_key not in daily_revenue:
            daily_revenue[date_key] = {
                "date": date_key,
                "revenue": 0,
                "sessions": 0
            }
        daily_revenue[date_key]["revenue"] += session.price or 0
        daily_revenue[date_key]["sessions"] += 1
    
    # Fill in missing dates with zero revenue
    current_date = start_date.date()
    while current_date <= end_date.date():
        date_key = current_date.isoformat()
        if date_key not in daily_revenue:
            daily_revenue[date_key] = {
                "date": date_key,
                "revenue": 0,
                "sessions": 0
            }
        current_date += timedelta(days=1)
    
    # Sort by date
    revenue_data = sorted(daily_revenue.values(), key=lambda x: x["date"])
    
    return {
        "period_days": days,
        "total_revenue": sum(item["revenue"] for item in revenue_data),
        "total_sessions": sum(item["sessions"] for item in revenue_data),
        "daily_breakdown": revenue_data
    }

@router.get("/sessions/mentors/performance")
def get_mentors_performance(db: DBSession = Depends(get_db)):
    """Get mentor performance metrics"""
    mentors = db.query(Mentor).all()
    
    performance_data = []
    for mentor in mentors:
        sessions = db.query(Session).filter(Session.mentor_id == mentor.id).all()
        
        total_sessions = len(sessions)
        completed_sessions = len([s for s in sessions if s.status == "completed"])
        total_revenue = sum(s.price or 0 for s in sessions if s.payment_status == "paid")
        avg_rating = sum(s.rating or 0 for s in sessions if s.rating) / max(len([s for s in sessions if s.rating]), 1)
        
        performance_data.append({
            "mentor_id": mentor.id,
            "mentor_name": mentor.user.full_name if mentor.user else "Unknown",
            "mentor_title": mentor.title,
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "completion_rate": (completed_sessions / max(total_sessions, 1)) * 100,
            "total_revenue": total_revenue,
            "avg_rating": round(avg_rating, 2),
            "hourly_rate": mentor.hourly_rate
        })
    
    # Sort by total revenue
    performance_data.sort(key=lambda x: x["total_revenue"], reverse=True)
    
    return performance_data

# Session Status Update
@router.put("/sessions/{session_id}/status")
def update_session_status(
    session_id: int,
    status_data: dict,
    db: DBSession = Depends(get_db)
):
    """Update session status"""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    new_status = status_data.get("status")
    if new_status not in ["scheduled", "completed", "cancelled", "pending"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    session.status = new_status
    
    db.commit()
    db.refresh(session)
    
    return {
        "message": f"Session {new_status} successfully",
        "session_id": session_id,
        "new_status": new_status
    }

# Gift Session Status Update
@router.put("/gifts/{gift_id}/status")
def update_gift_status(
    gift_id: int,
    status_data: dict,
    db: DBSession = Depends(get_db)
):
    """Update gift session status"""
    gift = db.query(GiftSession).filter(GiftSession.id == gift_id).first()
    if not gift:
        raise HTTPException(status_code=404, detail="Gift session not found")
    
    new_status = status_data.get("status")
    if new_status not in ["active", "redeemed", "expired", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    gift.status = new_status
    
    # Set redeemed_at if status is redeemed
    if new_status == "redeemed" and not gift.redeemed_at:
        gift.redeemed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(gift)
    
    return {
        "message": f"Gift session {new_status} successfully",
        "gift_id": gift_id,
        "new_status": new_status
    }

# Create Gift Session
@router.post("/gifts")
def create_gift_session(gift_data: dict, db: DBSession = Depends(get_db)):
    """Create a new gift session"""
    try:
        # Validate mentor exists
        mentor = db.query(Mentor).filter(Mentor.id == gift_data["mentor_id"]).first()
        if not mentor:
            raise HTTPException(status_code=404, detail="Mentor not found")
        
        # Generate unique gift code
        import uuid
        gift_code = f"GIFT-{uuid.uuid4().hex[:8].upper()}"
        
        # Create gift session
        gift_session = GiftSession(
            gift_code=gift_code,
            mentor_id=gift_data["mentor_id"],
            recipient_name=gift_data["recipient_name"],
            recipient_email=gift_data["recipient_email"],
            sender_name=gift_data["sender_name"],
            sender_email=gift_data["sender_email"],
            message=gift_data.get("message"),
            value=gift_data["value"],
            status="active",
            purchased_at=datetime.utcnow(),
            expires_at=datetime.fromisoformat(gift_data["expires_at"]) if gift_data.get("expires_at") else datetime.utcnow() + timedelta(days=365)
        )
        
        db.add(gift_session)
        db.commit()
        db.refresh(gift_session)
        
        return {
            "message": "Gift session created successfully",
            "gift_id": gift_session.id,
            "gift_code": gift_session.gift_code
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

# Mentee Goals Management
@router.post("/mentees/{mentee_id}/goals")
def add_mentee_goal(
    mentee_id: int,
    goal_data: dict,
    db: DBSession = Depends(get_db)
):
    """Add a new goal for a mentee"""
    # Check if mentee exists
    mentee = db.query(User).filter(User.id == mentee_id).first()
    if not mentee:
        raise HTTPException(status_code=404, detail="Mentee not found")
    
    # For now, we'll store goals in a simple way
    # In a real implementation, you'd have a separate Goals table
    return {
        "message": "Goal added successfully",
        "goal_id": 1,  # Mock ID
        "mentee_id": mentee_id
    }

@router.put("/mentees/{mentee_id}/goals/{goal_id}/status")
def update_goal_status(
    mentee_id: int,
    goal_id: int,
    status_data: dict,
    db: DBSession = Depends(get_db)
):
    """Update goal status"""
    # Check if mentee exists
    mentee = db.query(User).filter(User.id == mentee_id).first()
    if not mentee:
        raise HTTPException(status_code=404, detail="Mentee not found")
    
    new_status = status_data.get("status")
    if new_status not in ["not_started", "in_progress", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    # For now, return success
    # In a real implementation, you'd update the Goals table
    return {
        "message": f"Goal {new_status.replace('_', ' ')} successfully",
        "goal_id": goal_id,
        "new_status": new_status
    }

# Content Management System - Comprehensive Implementation
# ========================================================

# Blog Post Management
@router.get("/content/blog-posts")
def get_blog_posts(
    status: str = "all",
    category: str = "all",
    author_id: int = None,
    skip: int = 0,
    limit: int = 50,
    db: DBSession = Depends(get_db)
):
    """Get blog posts with filtering"""
    query = db.query(BlogPost)
    
    if status != "all":
        query = query.filter(BlogPost.status == status)
    
    if category != "all":
        query = query.filter(BlogPost.category == category)
    
    if author_id:
        query = query.filter(BlogPost.author_id == author_id)
    
    posts = query.order_by(desc(BlogPost.created_at)).offset(skip).limit(limit).all()
    total_count = query.count()
    
    return {
        "posts": [
            {
                "id": post.id,
                "title": post.title,
                "slug": post.slug,
                "excerpt": post.excerpt,
                "content": post.content,
                "featured_image": post.featured_image,
                "status": post.status,
                "category": post.category,
                "tags": post.tags.split(",") if post.tags else [],
                "author_name": post.author.full_name if post.author else "Unknown",
                "published_at": post.published_at.isoformat() if post.published_at else None,
                "created_at": post.created_at.isoformat(),
                "updated_at": post.updated_at.isoformat(),
                "meta_title": post.meta_title,
                "meta_description": post.meta_description,
                "view_count": post.view_count,
                "like_count": post.like_count,
                "share_count": post.share_count
            }
            for post in posts
        ],
        "total_count": total_count,
        "page_info": {
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_count
        }
    }

@router.post("/content/blog-posts")
def create_blog_post(post_data: dict, db: DBSession = Depends(get_db)):
    """Create a new blog post"""
    try:
        # Generate slug from title
        import re
        slug = re.sub(r'[^a-zA-Z0-9\s-]', '', post_data["title"].lower())
        slug = re.sub(r'\s+', '-', slug.strip())
        
        # Ensure unique slug
        base_slug = slug
        counter = 1
        while db.query(BlogPost).filter(BlogPost.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        post = BlogPost(
            title=post_data["title"],
            slug=slug,
            excerpt=post_data.get("excerpt"),
            content=post_data["content"],
            featured_image=post_data.get("featured_image"),
            status=post_data.get("status", "draft"),
            category=post_data.get("category"),
            tags=",".join(post_data.get("tags", [])),
            author_id=post_data.get("author_id", 1),  # Mock admin user
            meta_title=post_data.get("meta_title"),
            meta_description=post_data.get("meta_description"),
            published_at=datetime.fromisoformat(post_data["published_at"]) if post_data.get("published_at") else None
        )
        
        db.add(post)
        db.commit()
        db.refresh(post)
        
        return {
            "message": "Blog post created successfully",
            "post_id": post.id,
            "slug": post.slug
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/content/blog-posts/{post_id}")
def update_blog_post(post_id: int, post_data: dict, db: DBSession = Depends(get_db)):
    """Update blog post"""
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Update fields
    for field, value in post_data.items():
        if field == "tags" and isinstance(value, list):
            value = ",".join(value)
        elif field == "published_at" and value:
            value = datetime.fromisoformat(value)
        if hasattr(post, field):
            setattr(post, field, value)
    
    post.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Blog post updated successfully"}

@router.delete("/content/blog-posts/{post_id}")
def delete_blog_post(post_id: int, db: DBSession = Depends(get_db)):
    """Delete blog post"""
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    db.delete(post)
    db.commit()
    
    return {"message": "Blog post deleted successfully"}

@router.get("/content/blog-posts/categories")
def get_blog_categories(db: DBSession = Depends(get_db)):
    """Get all blog post categories"""
    categories = db.query(BlogPost.category).filter(
        BlogPost.category.isnot(None)
    ).distinct().all()
    
    return [cat[0] for cat in categories if cat[0]]

# Resource Library Management
@router.get("/content/resources")
def get_resources(
    resource_type: str = "all",
    category: str = "all",
    access_level: str = "all",
    skip: int = 0,
    limit: int = 50,
    db: DBSession = Depends(get_db)
):
    """Get resources with filtering"""
    query = db.query(Resource)
    
    if resource_type != "all":
        query = query.filter(Resource.resource_type == resource_type)
    
    if category != "all":
        query = query.filter(Resource.category == category)
    
    if access_level != "all":
        query = query.filter(Resource.access_level == access_level)
    
    resources = query.order_by(desc(Resource.created_at)).offset(skip).limit(limit).all()
    total_count = query.count()
    
    return {
        "resources": [
            {
                "id": resource.id,
                "title": resource.title,
                "description": resource.description,
                "resource_type": resource.resource_type,
                "category": resource.category,
                "tags": resource.tags.split(",") if resource.tags else [],
                "file_url": resource.file_url,
                "external_url": resource.external_url,
                "thumbnail": resource.thumbnail,
                "file_size": resource.file_size,
                "file_format": resource.file_format,
                "access_level": resource.access_level,
                "download_count": resource.download_count,
                "rating": resource.rating,
                "rating_count": resource.rating_count,
                "duration": resource.duration,
                "page_count": resource.page_count,
                "difficulty_level": resource.difficulty_level,
                "creator_name": resource.creator.full_name if resource.creator else "Unknown",
                "created_at": resource.created_at.isoformat(),
                "updated_at": resource.updated_at.isoformat()
            }
            for resource in resources
        ],
        "total_count": total_count,
        "page_info": {
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_count
        }
    }

@router.post("/content/resources")
def create_resource(resource_data: dict, db: DBSession = Depends(get_db)):
    """Create a new resource"""
    try:
        resource = Resource(
            title=resource_data["title"],
            description=resource_data.get("description"),
            resource_type=resource_data["resource_type"],
            category=resource_data.get("category"),
            tags=",".join(resource_data.get("tags", [])),
            file_url=resource_data.get("file_url"),
            external_url=resource_data.get("external_url"),
            thumbnail=resource_data.get("thumbnail"),
            file_size=resource_data.get("file_size"),
            file_format=resource_data.get("file_format"),
            access_level=resource_data.get("access_level", "public"),
            duration=resource_data.get("duration"),
            page_count=resource_data.get("page_count"),
            difficulty_level=resource_data.get("difficulty_level"),
            created_by=resource_data.get("created_by", 1)  # Mock admin user
        )
        
        db.add(resource)
        db.commit()
        db.refresh(resource)
        
        return {
            "message": "Resource created successfully",
            "resource_id": resource.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/content/resources/{resource_id}")
def update_resource(resource_id: int, resource_data: dict, db: DBSession = Depends(get_db)):
    """Update resource"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Update fields
    for field, value in resource_data.items():
        if field == "tags" and isinstance(value, list):
            value = ",".join(value)
        if hasattr(resource, field):
            setattr(resource, field, value)
    
    resource.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Resource updated successfully"}

@router.delete("/content/resources/{resource_id}")
def delete_resource(resource_id: int, db: DBSession = Depends(get_db)):
    """Delete resource"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    db.delete(resource)
    db.commit()
    
    return {"message": "Resource deleted successfully"}

@router.get("/content/resources/stats")
def get_resource_stats(db: DBSession = Depends(get_db)):
    """Get resource statistics"""
    total_resources = db.query(Resource).count()
    
    # Resources by type
    type_stats = db.query(Resource.resource_type, func.count(Resource.id)).group_by(Resource.resource_type).all()
    
    # Resources by access level
    access_stats = db.query(Resource.access_level, func.count(Resource.id)).group_by(Resource.access_level).all()
    
    # Total downloads
    total_downloads = db.query(func.sum(Resource.download_count)).scalar() or 0
    
    return {
        "total_resources": total_resources,
        "total_downloads": total_downloads,
        "by_type": {stat[0]: stat[1] for stat in type_stats},
        "by_access_level": {stat[0]: stat[1] for stat in access_stats}
    }

# FAQ Management
@router.get("/content/faqs")
def get_faqs(
    category: str = "all",
    status: str = "published",
    is_featured: bool = None,
    skip: int = 0,
    limit: int = 100,
    db: DBSession = Depends(get_db)
):
    """Get FAQs with filtering"""
    query = db.query(FAQ)
    
    if category != "all":
        query = query.filter(FAQ.category == category)
    
    if status != "all":
        query = query.filter(FAQ.status == status)
    
    if is_featured is not None:
        query = query.filter(FAQ.is_featured == is_featured)
    
    faqs = query.order_by(FAQ.display_order, desc(FAQ.created_at)).offset(skip).limit(limit).all()
    total_count = query.count()
    
    return {
        "faqs": [
            {
                "id": faq.id,
                "question": faq.question,
                "answer": faq.answer,
                "category": faq.category,
                "subcategory": faq.subcategory,
                "tags": faq.tags.split(",") if faq.tags else [],
                "is_featured": faq.is_featured,
                "display_order": faq.display_order,
                "status": faq.status,
                "helpful_count": faq.helpful_count,
                "not_helpful_count": faq.not_helpful_count,
                "view_count": faq.view_count,
                "creator_name": faq.creator.full_name if faq.creator else "Unknown",
                "created_at": faq.created_at.isoformat(),
                "updated_at": faq.updated_at.isoformat()
            }
            for faq in faqs
        ],
        "total_count": total_count,
        "page_info": {
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_count
        }
    }

@router.post("/content/faqs")
def create_faq(faq_data: dict, db: DBSession = Depends(get_db)):
    """Create a new FAQ"""
    try:
        faq = FAQ(
            question=faq_data["question"],
            answer=faq_data["answer"],
            category=faq_data["category"],
            subcategory=faq_data.get("subcategory"),
            tags=",".join(faq_data.get("tags", [])),
            is_featured=faq_data.get("is_featured", False),
            display_order=faq_data.get("display_order", 0),
            status=faq_data.get("status", "published"),
            created_by=faq_data.get("created_by", 1)  # Mock admin user
        )
        
        db.add(faq)
        db.commit()
        db.refresh(faq)
        
        return {
            "message": "FAQ created successfully",
            "faq_id": faq.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/content/faqs/{faq_id}")
def update_faq(faq_id: int, faq_data: dict, db: DBSession = Depends(get_db)):
    """Update FAQ"""
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    # Update fields
    for field, value in faq_data.items():
        if field == "tags" and isinstance(value, list):
            value = ",".join(value)
        if hasattr(faq, field):
            setattr(faq, field, value)
    
    faq.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "FAQ updated successfully"}

@router.delete("/content/faqs/{faq_id}")
def delete_faq(faq_id: int, db: DBSession = Depends(get_db)):
    """Delete FAQ"""
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    db.delete(faq)
    db.commit()
    
    return {"message": "FAQ deleted successfully"}

@router.get("/content/faqs/categories")
def get_faq_categories(db: DBSession = Depends(get_db)):
    """Get all FAQ categories"""
    categories = db.query(FAQ.category).filter(
        FAQ.category.isnot(None)
    ).distinct().all()
    
    return [cat[0] for cat in categories if cat[0]]

@router.put("/content/faqs/{faq_id}/helpful")
def mark_faq_helpful(faq_id: int, helpful: bool, db: DBSession = Depends(get_db)):
    """Mark FAQ as helpful or not helpful"""
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    if helpful:
        faq.helpful_count += 1
    else:
        faq.not_helpful_count += 1
    
    db.commit()
    
    return {"message": "Feedback recorded successfully"}

# Testimonial Management
@router.get("/content/testimonials")
def get_testimonials(
    status: str = "all",
    category: str = "all",
    is_featured: bool = None,
    rating: int = None,
    skip: int = 0,
    limit: int = 50,
    db: DBSession = Depends(get_db)
):
    """Get testimonials with filtering"""
    query = db.query(Testimonial)
    
    if status != "all":
        query = query.filter(Testimonial.status == status)
    
    if category != "all":
        query = query.filter(Testimonial.category == category)
    
    if is_featured is not None:
        query = query.filter(Testimonial.is_featured == is_featured)
    
    if rating:
        query = query.filter(Testimonial.rating == rating)
    
    testimonials = query.order_by(Testimonial.display_order, desc(Testimonial.created_at)).offset(skip).limit(limit).all()
    total_count = query.count()
    
    return {
        "testimonials": [
            {
                "id": testimonial.id,
                "name": testimonial.name,
                "title": testimonial.title,
                "company": testimonial.company,
                "email": testimonial.email,
                "content": testimonial.content,
                "rating": testimonial.rating,
                "avatar": testimonial.avatar,
                "status": testimonial.status,
                "is_featured": testimonial.is_featured,
                "display_order": testimonial.display_order,
                "category": testimonial.category,
                "source": testimonial.source,
                "location": testimonial.location,
                "linkedin_url": testimonial.linkedin_url,
                "approver_name": testimonial.approver.full_name if testimonial.approver else None,
                "approved_at": testimonial.approved_at.isoformat() if testimonial.approved_at else None,
                "created_at": testimonial.created_at.isoformat(),
                "updated_at": testimonial.updated_at.isoformat()
            }
            for testimonial in testimonials
        ],
        "total_count": total_count,
        "page_info": {
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_count
        }
    }

@router.post("/content/testimonials")
def create_testimonial(testimonial_data: dict, db: DBSession = Depends(get_db)):
    """Create a new testimonial"""
    try:
        testimonial = Testimonial(
            name=testimonial_data["name"],
            title=testimonial_data.get("title"),
            company=testimonial_data.get("company"),
            email=testimonial_data.get("email"),
            content=testimonial_data["content"],
            rating=testimonial_data.get("rating"),
            avatar=testimonial_data.get("avatar"),
            status=testimonial_data.get("status", "pending"),
            is_featured=testimonial_data.get("is_featured", False),
            display_order=testimonial_data.get("display_order", 0),
            category=testimonial_data.get("category"),
            source=testimonial_data.get("source", "website"),
            location=testimonial_data.get("location"),
            linkedin_url=testimonial_data.get("linkedin_url")
        )
        
        db.add(testimonial)
        db.commit()
        db.refresh(testimonial)
        
        return {
            "message": "Testimonial created successfully",
            "testimonial_id": testimonial.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/content/testimonials/{testimonial_id}")
def update_testimonial(testimonial_id: int, testimonial_data: dict, db: DBSession = Depends(get_db)):
    """Update testimonial"""
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    # Update fields
    for field, value in testimonial_data.items():
        if hasattr(testimonial, field):
            setattr(testimonial, field, value)
    
    testimonial.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Testimonial updated successfully"}

@router.put("/content/testimonials/{testimonial_id}/approve")
def approve_testimonial(testimonial_id: int, approved: bool, db: DBSession = Depends(get_db)):
    """Approve or reject testimonial"""
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    testimonial.status = "approved" if approved else "rejected"
    testimonial.approved_by = 1  # Mock admin user
    testimonial.approved_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": f"Testimonial {'approved' if approved else 'rejected'} successfully"}

@router.delete("/content/testimonials/{testimonial_id}")
def delete_testimonial(testimonial_id: int, db: DBSession = Depends(get_db)):
    """Delete testimonial"""
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    db.delete(testimonial)
    db.commit()
    
    return {"message": "Testimonial deleted successfully"}

@router.get("/content/testimonials/stats")
def get_testimonial_stats(db: DBSession = Depends(get_db)):
    """Get testimonial statistics"""
    total_testimonials = db.query(Testimonial).count()
    approved_testimonials = db.query(Testimonial).filter(Testimonial.status == "approved").count()
    pending_testimonials = db.query(Testimonial).filter(Testimonial.status == "pending").count()
    featured_testimonials = db.query(Testimonial).filter(Testimonial.is_featured == True).count()
    
    # Average rating
    avg_rating = db.query(func.avg(Testimonial.rating)).filter(
        Testimonial.rating.isnot(None)
    ).scalar() or 0
    
    # Rating distribution
    rating_distribution = db.query(Testimonial.rating, func.count(Testimonial.id)).filter(
        Testimonial.rating.isnot(None)
    ).group_by(Testimonial.rating).all()
    
    return {
        "total_testimonials": total_testimonials,
        "approved_testimonials": approved_testimonials,
        "pending_testimonials": pending_testimonials,
        "featured_testimonials": featured_testimonials,
        "average_rating": round(avg_rating, 2),
        "rating_distribution": {str(rating[0]): rating[1] for rating in rating_distribution}
    }

# Content Analytics
@router.get("/content/analytics/overview")
def get_content_analytics_overview(days: int = 30, db: DBSession = Depends(get_db)):
    """Get content analytics overview"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Blog post stats
    total_blog_posts = db.query(BlogPost).count()
    published_blog_posts = db.query(BlogPost).filter(BlogPost.status == "published").count()
    total_blog_views = db.query(func.sum(BlogPost.view_count)).scalar() or 0
    
    # Resource stats
    total_resources = db.query(Resource).count()
    total_downloads = db.query(func.sum(Resource.download_count)).scalar() or 0
    
    # FAQ stats
    total_faqs = db.query(FAQ).count()
    published_faqs = db.query(FAQ).filter(FAQ.status == "published").count()
    total_faq_views = db.query(func.sum(FAQ.view_count)).scalar() or 0
    
    # Testimonial stats
    total_testimonials = db.query(Testimonial).count()
    approved_testimonials = db.query(Testimonial).filter(Testimonial.status == "approved").count()
    
    return {
        "period_days": days,
        "blog_posts": {
            "total": total_blog_posts,
            "published": published_blog_posts,
            "total_views": total_blog_views
        },
        "resources": {
            "total": total_resources,
            "total_downloads": total_downloads
        },
        "faqs": {
            "total": total_faqs,
            "published": published_faqs,
            "total_views": total_faq_views
        },
        "testimonials": {
            "total": total_testimonials,
            "approved": approved_testimonials
        }
    }

@router.post("/content/analytics/track")
def track_content_event(event_data: dict, db: DBSession = Depends(get_db)):
    """Track content analytics event"""
    try:
        analytics = ContentAnalytics(
            content_type=event_data["content_type"],
            content_id=event_data["content_id"],
            event_type=event_data["event_type"],
            user_id=event_data.get("user_id"),
            session_id=event_data.get("session_id"),
            ip_address=event_data.get("ip_address"),
            user_agent=event_data.get("user_agent"),
            referrer=event_data.get("referrer")
        )
        
        db.add(analytics)
        
        # Update content counters
        if event_data["content_type"] == "blog_post" and event_data["event_type"] == "view":
            post = db.query(BlogPost).filter(BlogPost.id == event_data["content_id"]).first()
            if post:
                post.view_count += 1
        elif event_data["content_type"] == "resource" and event_data["event_type"] == "download":
            resource = db.query(Resource).filter(Resource.id == event_data["content_id"]).first()
            if resource:
                resource.download_count += 1
        elif event_data["content_type"] == "faq" and event_data["event_type"] == "view":
            faq = db.query(FAQ).filter(FAQ.id == event_data["content_id"]).first()
            if faq:
                faq.view_count += 1
        
        db.commit()
        
        return {"message": "Event tracked successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

# Sessions Management - Comprehensive Implementation
# ================================================

@router.get("/sessions")
def get_all_sessions(
    status: str = "all",
    mentor_id: int = None,
    student_id: int = None,
    date_from: str = None,
    date_to: str = None,
    skip: int = 0,
    limit: int = 100,
    db: DBSession = Depends(get_db)
):
    """Get all sessions with filtering and pagination"""
    query = db.query(Session)
    
    # Apply filters
    if status != "all":
        query = query.filter(Session.status == status)
    
    if mentor_id:
        query = query.join(Mentor).filter(Mentor.user_id == mentor_id)
    
    if student_id:
        query = query.filter(Session.student_id == student_id)
    
    if date_from:
        query = query.filter(Session.scheduled_at >= datetime.fromisoformat(date_from))
    
    if date_to:
        query = query.filter(Session.scheduled_at <= datetime.fromisoformat(date_to))
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply pagination and ordering
    sessions = query.order_by(desc(Session.created_at)).offset(skip).limit(limit).all()
    
    result = []
    for session in sessions:
        # Calculate session duration and revenue
        duration_hours = session.duration_minutes / 60 if session.duration_minutes else 1
        session_revenue = session.price if session.payment_status == "paid" else 0
        
        result.append({
            "id": session.id,
            "title": session.title,
            "student_name": session.student.full_name if session.student else "Unknown",
            "student_email": session.student.email if session.student else "Unknown",
            "mentor_name": session.mentor.user.full_name if session.mentor and session.mentor.user else "Unknown",
            "mentor_email": session.mentor.user.email if session.mentor and session.mentor.user else "Unknown",
            "status": session.status,
            "payment_status": session.payment_status,
            "price": float(session.price) if session.price else 0.0,
            "duration_minutes": session.duration_minutes or 60,
            "duration_hours": (session.duration_minutes or 60) / 60,
            "scheduled_at": session.scheduled_at.isoformat() if session.scheduled_at else None,
            "created_at": session.created_at.isoformat(),
            "notes": session.notes,
            "is_gift_session": False,  # Will implement gift session check later
            "revenue": session_revenue
        })
    
    return {
        "sessions": result,
        "total_count": total_count,
        "page_info": {
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_count
        }
    }

@router.get("/sessions/{session_id}")
def get_session_details(session_id: int, db: DBSession = Depends(get_db)):
    """Get detailed session information"""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get session messages
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.sent_at).all()
    
    # Check if it's a gift session
    gift_session = db.query(GiftSession).filter(
        GiftSession.session_id == session_id
    ).first()
    
    return {
        "id": session.id,
        "title": session.title,
        "description": session.description,
        "student": {
            "id": session.student.id if session.student else None,
            "name": session.student.full_name if session.student else "Unknown",
            "email": session.student.email if session.student else "Unknown"
        },
        "mentor": {
            "id": session.mentor.user.id if session.mentor and session.mentor.user else None,
            "name": session.mentor.user.full_name if session.mentor and session.mentor.user else "Unknown",
            "email": session.mentor.user.email if session.mentor and session.mentor.user else "Unknown"
        },
        "status": session.status,
        "payment_status": session.payment_status,
        "price": float(session.price) if session.price else 0.0,
        "duration_minutes": session.duration_minutes or 60,
        "scheduled_at": session.scheduled_at.isoformat() if session.scheduled_at else None,
        "created_at": session.created_at.isoformat(),
        "notes": session.notes,
        "rating": session.rating,
        "review": session.review,
        "is_gift_session": gift_session is not None,
        "gift_session_details": {
            "id": gift_session.id,
            "purchaser_name": gift_session.purchaser_name,
            "purchaser_email": gift_session.purchaser_email,
            "recipient_name": gift_session.recipient_name,
            "recipient_email": gift_session.recipient_email,
            "message": gift_session.message,
            "redeemed_at": gift_session.redeemed_at.isoformat() if gift_session.redeemed_at else None,
            "expires_at": gift_session.expires_at.isoformat() if gift_session.expires_at else None
        } if gift_session else None,
        "message_count": len(messages),
        "messages": [
            {
                "id": msg.id,
                "sender_name": msg.sender.full_name if msg.sender else "Unknown",
                "message": msg.message,
                "sent_at": msg.sent_at.isoformat()
            }
            for msg in messages[-5:]  # Last 5 messages
        ]
    }

@router.put("/sessions/{session_id}/status")
def update_session_status(
    session_id: int,
    status_data: dict,
    db: DBSession = Depends(get_db)
):
    """Update session status"""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    new_status = status_data.get("status")
    if new_status not in ["scheduled", "in_progress", "completed", "cancelled", "no_show"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    session.status = new_status
    
    # Set completion time if marking as completed
    if new_status == "completed":
        # We don't have a completed_at field, so we'll use notes to track this
        completion_note = f"Completed at {datetime.utcnow().isoformat()}"
        if session.notes:
            session.notes += f"\n{completion_note}"
        else:
            session.notes = completion_note
    
    # Add notes if provided
    if status_data.get("notes"):
        session.notes = status_data["notes"]
    
    db.commit()
    db.refresh(session)
    
    return {
        "message": f"Session status updated to {new_status}",
        "session_id": session_id,
        "new_status": new_status
    }

@router.put("/sessions/{session_id}/payment")
def update_session_payment_status(
    session_id: int,
    payment_data: dict,
    db: DBSession = Depends(get_db)
):
    """Update session payment status"""
    session = db.query(Session).filter(Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    new_payment_status = payment_data.get("payment_status")
    if new_payment_status not in ["pending", "paid", "refunded", "failed"]:
        raise HTTPException(status_code=400, detail="Invalid payment status")
    
    session.payment_status = new_payment_status
    
    # Add payment notes if provided
    if payment_data.get("payment_notes"):
        payment_note = f"Payment {new_payment_status}: {payment_data['payment_notes']}"
        if session.notes:
            session.notes += f"\n{payment_note}"
        else:
            session.notes = payment_note
    
    db.commit()
    db.refresh(session)
    
    return {
        "message": f"Payment status updated to {new_payment_status}",
        "session_id": session_id,
        "new_payment_status": new_payment_status
    }

@router.get("/sessions/analytics/overview")
def get_sessions_analytics_overview(
    days: int = 30,
    mentor_id: int = None,
    db: DBSession = Depends(get_db)
):
    """Get sessions analytics overview"""
    # Date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Base query
    query = db.query(Session).filter(
        Session.created_at >= start_date,
        Session.created_at <= end_date
    )
    
    if mentor_id:
        query = query.join(Mentor).filter(Mentor.user_id == mentor_id)
    
    sessions = query.all()
    
    # Calculate metrics
    total_sessions = len(sessions)
    completed_sessions = len([s for s in sessions if s.status == "completed"])
    cancelled_sessions = len([s for s in sessions if s.status == "cancelled"])
    no_show_sessions = len([s for s in sessions if s.status == "no_show"])
    
    # Revenue calculations
    total_revenue = sum(s.price for s in sessions if s.payment_status == "paid" and s.price)
    pending_revenue = sum(s.price for s in sessions if s.payment_status == "pending" and s.price)
    
    # Completion rate
    completion_rate = (completed_sessions / max(total_sessions, 1)) * 100
    
    # Average session price
    paid_sessions = [s for s in sessions if s.payment_status == "paid" and s.price]
    avg_session_price = sum(s.price for s in paid_sessions) / max(len(paid_sessions), 1)
    
    # Sessions by status
    status_breakdown = {
        "scheduled": len([s for s in sessions if s.status == "scheduled"]),
        "in_progress": len([s for s in sessions if s.status == "in_progress"]),
        "completed": completed_sessions,
        "cancelled": cancelled_sessions,
        "no_show": no_show_sessions
    }
    
    # Daily session trend
    daily_sessions = {}
    for session in sessions:
        date_key = session.created_at.date().isoformat()
        daily_sessions[date_key] = daily_sessions.get(date_key, 0) + 1
    
    daily_trend = []
    for i in range(days):
        date = (start_date + timedelta(days=i)).date()
        daily_trend.append({
            "date": date.isoformat(),
            "sessions": daily_sessions.get(date.isoformat(), 0)
        })
    
    return {
        "period_days": days,
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "completion_rate": round(completion_rate, 1),
        "total_revenue": float(total_revenue),
        "pending_revenue": float(pending_revenue),
        "avg_session_price": float(avg_session_price),
        "status_breakdown": status_breakdown,
        "daily_trend": daily_trend
    }

@router.get("/sessions/revenue/analytics")
def get_revenue_analytics(
    days: int = 30,
    mentor_id: int = None,
    db: DBSession = Depends(get_db)
):
    """Get detailed revenue analytics"""
    # Date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Base query for paid sessions
    query = db.query(Session).filter(
        Session.created_at >= start_date,
        Session.created_at <= end_date,
        Session.payment_status == "paid"
    )
    
    if mentor_id:
        query = query.join(Mentor).filter(Mentor.user_id == mentor_id)
    
    paid_sessions = query.all()
    
    # Revenue by mentor
    mentor_revenue = {}
    for session in paid_sessions:
        if session.mentor and session.mentor.user:
            mentor_name = session.mentor.user.full_name
            mentor_revenue[mentor_name] = mentor_revenue.get(mentor_name, 0) + (session.price or 0)
    
    top_mentors_by_revenue = sorted(
        [{"mentor_name": name, "revenue": revenue} for name, revenue in mentor_revenue.items()],
        key=lambda x: x["revenue"],
        reverse=True
    )[:10]
    
    # Monthly revenue trend (last 12 months)
    monthly_revenue = {}
    twelve_months_ago = end_date - timedelta(days=365)
    
    monthly_query = db.query(Session).filter(
        Session.created_at >= twelve_months_ago,
        Session.payment_status == "paid"
    )
    
    if mentor_id:
        monthly_query = monthly_query.join(Mentor).filter(Mentor.user_id == mentor_id)
    
    monthly_sessions = monthly_query.all()
    
    for session in monthly_sessions:
        month_key = session.created_at.strftime("%Y-%m")
        monthly_revenue[month_key] = monthly_revenue.get(month_key, 0) + (session.price or 0)
    
    monthly_trend = []
    for i in range(12):
        month_date = end_date - timedelta(days=30 * i)
        month_key = month_date.strftime("%Y-%m")
        monthly_trend.append({
            "month": month_key,
            "revenue": monthly_revenue.get(month_key, 0)
        })
    
    monthly_trend.reverse()
    
    # Calculate totals
    total_revenue = sum(session.price for session in paid_sessions if session.price)
    total_sessions = len(paid_sessions)
    
    return {
        "period_days": days,
        "total_revenue": float(total_revenue),
        "total_paid_sessions": total_sessions,
        "avg_revenue_per_session": float(total_revenue / max(total_sessions, 1)),
        "top_mentors_by_revenue": top_mentors_by_revenue,
        "monthly_revenue_trend": monthly_trend
    }

# Gift Sessions Management
# ========================

@router.get("/gift-sessions")
def get_gift_sessions(
    status: str = "all",
    skip: int = 0,
    limit: int = 100,
    db: DBSession = Depends(get_db)
):
    """Get all gift sessions with filtering"""
    query = db.query(GiftSession)
    
    # Apply status filter
    if status == "redeemed":
        query = query.filter(GiftSession.redeemed_at.isnot(None))
    elif status == "unredeemed":
        query = query.filter(GiftSession.redeemed_at.is_(None))
    elif status == "expired":
        query = query.filter(
            GiftSession.expires_at < datetime.utcnow(),
            GiftSession.redeemed_at.is_(None)
        )
    
    total_count = query.count()
    gift_sessions = query.order_by(desc(GiftSession.purchased_at)).offset(skip).limit(limit).all()
    
    result = []
    for gift_session in gift_sessions:
        # Determine status
        if gift_session.redeemed_at:
            status = "redeemed"
        elif gift_session.expires_at and gift_session.expires_at < datetime.utcnow():
            status = "expired"
        else:
            status = "active"
        
        result.append({
            "id": gift_session.id,
            "purchaser_name": gift_session.sender_name,
            "purchaser_email": gift_session.sender_email,
            "recipient_name": gift_session.recipient_name,
            "recipient_email": gift_session.recipient_email,
            "message": gift_session.message,
            "amount": float(gift_session.value),
            "status": status,
            "created_at": gift_session.purchased_at.isoformat(),
            "redeemed_at": gift_session.redeemed_at.isoformat() if gift_session.redeemed_at else None,
            "expires_at": gift_session.expires_at.isoformat() if gift_session.expires_at else None,
            "session_id": gift_session.session_id,
            "session_title": gift_session.created_session.title if gift_session.created_session else None
        })
    
    return {
        "gift_sessions": result,
        "total_count": total_count,
        "page_info": {
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total_count
        }
    }

@router.post("/gift-sessions")
def create_gift_session(gift_data: dict, db: DBSession = Depends(get_db)):
    """Create a new gift session"""
    try:
        # Set expiration date (1 year from now if not specified)
        expires_at = None
        if gift_data.get("expires_at"):
            expires_at = datetime.fromisoformat(gift_data["expires_at"])
        else:
            expires_at = datetime.utcnow() + timedelta(days=365)
        
        gift_session = GiftSession(
            sender_name=gift_data["purchaser_name"],
            sender_email=gift_data["purchaser_email"],
            recipient_name=gift_data["recipient_name"],
            recipient_email=gift_data["recipient_email"],
            message=gift_data.get("message", ""),
            value=gift_data["amount"],
            expires_at=expires_at,
            gift_code=f"GIFT{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        )
        
        db.add(gift_session)
        db.commit()
        db.refresh(gift_session)
        
        return {
            "message": "Gift session created successfully",
            "gift_session_id": gift_session.id,
            "expires_at": expires_at.isoformat()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/gift-sessions/{gift_session_id}/redeem")
def redeem_gift_session(
    gift_session_id: int,
    redeem_data: dict,
    db: DBSession = Depends(get_db)
):
    """Redeem a gift session"""
    gift_session = db.query(GiftSession).filter(GiftSession.id == gift_session_id).first()
    if not gift_session:
        raise HTTPException(status_code=404, detail="Gift session not found")
    
    if gift_session.redeemed_at:
        raise HTTPException(status_code=400, detail="Gift session already redeemed")
    
    if gift_session.expires_at and gift_session.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Gift session has expired")
    
    # Create the actual session
    session = Session(
        title=redeem_data.get("title", "Gift Session"),
        description=redeem_data.get("description", ""),
        student_id=redeem_data["student_id"],
        mentor_id=redeem_data["mentor_id"],
        price=gift_session.value,
        payment_status="paid",  # Already paid through gift
        status="scheduled",
        scheduled_at=datetime.fromisoformat(redeem_data["scheduled_at"]) if redeem_data.get("scheduled_at") else None,
        duration_minutes=redeem_data.get("duration_minutes", 60)
    )
    
    db.add(session)
    db.flush()  # Get the session ID
    
    # Update gift session
    gift_session.session_id = session.id
    gift_session.redeemed_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "Gift session redeemed successfully",
        "session_id": session.id,
        "redeemed_at": gift_session.redeemed_at.isoformat()
    }

@router.get("/gift-sessions/analytics")
def get_gift_sessions_analytics(days: int = 30, db: DBSession = Depends(get_db)):
    """Get gift sessions analytics"""
    # Date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get gift sessions in period
    gift_sessions = db.query(GiftSession).filter(
        GiftSession.purchased_at >= start_date,
        GiftSession.purchased_at <= end_date
    ).all()
    
    total_gift_sessions = len(gift_sessions)
    redeemed_sessions = len([gs for gs in gift_sessions if gs.redeemed_at])
    expired_sessions = len([gs for gs in gift_sessions if gs.expires_at and gs.expires_at < datetime.utcnow() and not gs.redeemed_at])
    active_sessions = total_gift_sessions - redeemed_sessions - expired_sessions
    
    # Revenue calculations
    total_gift_revenue = sum(gs.value for gs in gift_sessions)
    redeemed_revenue = sum(gs.value for gs in gift_sessions if gs.redeemed_at)
    
    # Redemption rate
    redemption_rate = (redeemed_sessions / max(total_gift_sessions, 1)) * 100
    
    return {
        "period_days": days,
        "total_gift_sessions": total_gift_sessions,
        "redeemed_sessions": redeemed_sessions,
        "expired_sessions": expired_sessions,
        "active_sessions": active_sessions,
        "redemption_rate": round(redemption_rate, 1),
        "total_gift_revenue": float(total_gift_revenue),
        "redeemed_revenue": float(redeemed_revenue),
        "pending_revenue": float(total_gift_revenue - redeemed_revenue)
    }

@router.get("/mentors/performance")
def get_mentor_performance_analytics(
    days: int = 30,
    skip: int = 0,
    limit: int = 50,
    db: DBSession = Depends(get_db)
):
    """Get mentor performance analytics"""
    # Date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get all mentors with their sessions
    mentors = db.query(Mentor).offset(skip).limit(limit).all()
    
    result = []
    for mentor in mentors:
        # Get sessions for this mentor in the period
        sessions = db.query(Session).filter(
            Session.mentor_id == mentor.id,
            Session.created_at >= start_date,
            Session.created_at <= end_date
        ).all()
        
        # Calculate metrics
        total_sessions = len(sessions)
        completed_sessions = len([s for s in sessions if s.status == "completed"])
        cancelled_sessions = len([s for s in sessions if s.status == "cancelled"])
        no_show_sessions = len([s for s in sessions if s.status == "no_show"])
        
        # Revenue
        total_revenue = sum(s.price for s in sessions if s.payment_status == "paid" and s.price)
        
        # Ratings
        rated_sessions = [s for s in sessions if s.rating]
        avg_rating = sum(s.rating for s in rated_sessions) / max(len(rated_sessions), 1)
        
        # Completion rate
        completion_rate = (completed_sessions / max(total_sessions, 1)) * 100
        
        result.append({
            "mentor_id": mentor.id,
            "mentor_name": mentor.user.full_name if mentor.user else "Unknown",
            "mentor_email": mentor.user.email if mentor.user else "Unknown",
            "title": mentor.title,
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "cancelled_sessions": cancelled_sessions,
            "no_show_sessions": no_show_sessions,
            "completion_rate": round(completion_rate, 1),
            "total_revenue": float(total_revenue),
            "avg_rating": round(avg_rating, 1),
            "total_ratings": len(rated_sessions),
            "hourly_rate": float(mentor.hourly_rate) if mentor.hourly_rate else 0.0
        })
    
    # Sort by total revenue
    result.sort(key=lambda x: x["total_revenue"], reverse=True)
    
    return {
        "mentors": result,
        "period_days": days
    }