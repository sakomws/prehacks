"""Event management endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User

router = APIRouter()

# Pydantic models
class EventCreate(BaseModel):
    title: str
    description: str
    event_type: str  # workshop, webinar, networking, conference
    date: str
    time: str
    duration_minutes: int
    location: str
    is_virtual: bool
    max_attendees: Optional[int] = None
    price: float
    image_url: Optional[str] = None
    tags: Optional[str] = None
    requirements: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    is_virtual: Optional[bool] = None
    max_attendees: Optional[int] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    tags: Optional[str] = None
    requirements: Optional[str] = None
    status: Optional[str] = None

class EventRegistration(BaseModel):
    event_id: int
    attendee_name: str
    attendee_email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    dietary_requirements: Optional[str] = None

# Mock events storage (in production, use database)
events = {
    1: {
        "id": 1,
        "title": "Mentorship Best Practices Workshop",
        "description": "Learn effective mentorship strategies and techniques from industry experts. This interactive workshop covers communication skills, goal setting, and building lasting mentor-mentee relationships.",
        "event_type": "workshop",
        "date": "2024-12-28",
        "time": "14:00",
        "duration_minutes": 120,
        "location": "Virtual - Zoom",
        "is_virtual": True,
        "max_attendees": 50,
        "price": 25.0,
        "image_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500",
        "tags": "mentorship, workshop, professional development",
        "requirements": "Basic understanding of mentorship concepts",
        "status": "active",
        "created_at": "2024-12-20T10:00:00",
        "updated_at": "2024-12-20T10:00:00",
        "registrations": []
    },
    2: {
        "id": 2,
        "title": "Career Transition Strategies Webinar",
        "description": "Navigate career changes successfully with expert guidance. Topics include resume optimization, interview preparation, and networking strategies for career pivots.",
        "event_type": "webinar",
        "date": "2024-12-30",
        "time": "18:00",
        "duration_minutes": 90,
        "location": "Virtual - Google Meet",
        "is_virtual": True,
        "max_attendees": 100,
        "price": 0.0,
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
        "tags": "career, transition, webinar, free",
        "requirements": "None",
        "status": "active",
        "created_at": "2024-12-20T11:00:00",
        "updated_at": "2024-12-20T11:00:00",
        "registrations": []
    }
}

registrations = {}
registration_counter = 1

@router.get("/")
async def get_events(
    status: str = None,
    event_type: str = None,
    upcoming_only: bool = True,
    db: DBSession = Depends(get_db)
):
    """Get all events with optional filters"""
    filtered_events = list(events.values())
    
    # Filter by status
    if status:
        filtered_events = [e for e in filtered_events if e["status"] == status]
    
    # Filter by event type
    if event_type:
        filtered_events = [e for e in filtered_events if e["event_type"] == event_type]
    
    # Filter upcoming events only
    if upcoming_only:
        current_date = datetime.now().date()
        filtered_events = [
            e for e in filtered_events 
            if datetime.fromisoformat(e["date"]).date() >= current_date
        ]
    
    # Add registration count to each event
    for event in filtered_events:
        event["registration_count"] = len(event.get("registrations", []))
        event["spots_remaining"] = (
            event["max_attendees"] - event["registration_count"] 
            if event["max_attendees"] else None
        )
    
    return filtered_events

@router.get("/{event_id}")
async def get_event(event_id: int, db: DBSession = Depends(get_db)):
    """Get event by ID"""
    event = events.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Add registration count
    event["registration_count"] = len(event.get("registrations", []))
    event["spots_remaining"] = (
        event["max_attendees"] - event["registration_count"] 
        if event["max_attendees"] else None
    )
    
    return event

@router.post("/")
async def create_event(event_data: EventCreate, db: DBSession = Depends(get_db)):
    """Create a new event"""
    try:
        # Generate new event ID
        new_id = max(events.keys()) + 1 if events else 1
        
        # Create event
        new_event = {
            "id": new_id,
            "title": event_data.title,
            "description": event_data.description,
            "event_type": event_data.event_type,
            "date": event_data.date,
            "time": event_data.time,
            "duration_minutes": event_data.duration_minutes,
            "location": event_data.location,
            "is_virtual": event_data.is_virtual,
            "max_attendees": event_data.max_attendees,
            "price": event_data.price,
            "image_url": event_data.image_url,
            "tags": event_data.tags,
            "requirements": event_data.requirements,
            "status": "active",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "registrations": []
        }
        
        events[new_id] = new_event
        
        return {
            "success": True,
            "message": "Event created successfully",
            "event_id": new_id,
            "event": new_event
        }
        
    except Exception as e:
        print(f"Error creating event: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create event")

@router.put("/{event_id}")
async def update_event(
    event_id: int, 
    event_data: EventUpdate, 
    db: DBSession = Depends(get_db)
):
    """Update an event"""
    event = events.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Update fields
    update_data = event_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            event[key] = value
    
    event["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "success": True,
        "message": "Event updated successfully",
        "event": event
    }

@router.delete("/{event_id}")
async def delete_event(event_id: int, db: DBSession = Depends(get_db)):
    """Delete an event (soft delete - set status to cancelled)"""
    event = events.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event["status"] = "cancelled"
    event["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "success": True,
        "message": "Event cancelled successfully"
    }

@router.post("/{event_id}/register")
async def register_for_event(
    event_id: int,
    registration_data: EventRegistration,
    db: DBSession = Depends(get_db)
):
    """Register for an event"""
    global registration_counter
    
    event = events.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event["status"] != "active":
        raise HTTPException(status_code=400, detail="Event is not available for registration")
    
    # Check if event is full
    if event["max_attendees"] and len(event["registrations"]) >= event["max_attendees"]:
        raise HTTPException(status_code=400, detail="Event is full")
    
    # Check if user already registered
    existing_registration = next(
        (r for r in event["registrations"] if r["attendee_email"] == registration_data.attendee_email),
        None
    )
    if existing_registration:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # Create registration
    registration = {
        "id": registration_counter,
        "event_id": event_id,
        "attendee_name": registration_data.attendee_name,
        "attendee_email": registration_data.attendee_email,
        "phone": registration_data.phone,
        "company": registration_data.company,
        "dietary_requirements": registration_data.dietary_requirements,
        "registered_at": datetime.utcnow().isoformat(),
        "status": "confirmed"
    }
    
    event["registrations"].append(registration)
    registrations[registration_counter] = registration
    registration_counter += 1
    
    return {
        "success": True,
        "message": "Registration successful",
        "registration": registration
    }

@router.get("/{event_id}/registrations")
async def get_event_registrations(event_id: int, db: DBSession = Depends(get_db)):
    """Get all registrations for an event"""
    event = events.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {
        "event_id": event_id,
        "event_title": event["title"],
        "registrations": event["registrations"],
        "total_registrations": len(event["registrations"]),
        "max_attendees": event["max_attendees"],
        "spots_remaining": (
            event["max_attendees"] - len(event["registrations"]) 
            if event["max_attendees"] else None
        )
    }

@router.get("/stats/overview")
async def get_events_stats(db: DBSession = Depends(get_db)):
    """Get events statistics"""
    total_events = len(events)
    active_events = len([e for e in events.values() if e["status"] == "active"])
    total_registrations = sum(len(e["registrations"]) for e in events.values())
    upcoming_events = len([
        e for e in events.values() 
        if datetime.fromisoformat(e["date"]).date() >= datetime.now().date()
        and e["status"] == "active"
    ])
    
    # Revenue calculation
    total_revenue = 0
    for event in events.values():
        event_revenue = event["price"] * len(event["registrations"])
        total_revenue += event_revenue
    
    return {
        "total_events": total_events,
        "active_events": active_events,
        "upcoming_events": upcoming_events,
        "total_registrations": total_registrations,
        "total_revenue": total_revenue,
        "avg_registrations_per_event": total_registrations / max(total_events, 1)
    }