from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date
import json

from database import (
    get_db,
    EventModel,
    EventRegistrationModel
)

router = APIRouter(prefix="/api/events", tags=["events"])

# Pydantic Models
class EventCreate(BaseModel):
    title: str
    description: str
    date: date
    time: str
    location: str
    category: str
    spots_total: int
    price: str
    image: str
    is_featured: bool = False

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    time: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    spots_total: Optional[int] = None
    price: Optional[str] = None
    image: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None

class EventResponse(BaseModel):
    id: int
    title: str
    description: str
    date: str
    time: str
    location: str
    category: str
    spots_total: int
    spots_available: int
    price: str
    image: str
    is_featured: bool
    is_active: bool
    registrations_count: int

class RegistrationCreate(BaseModel):
    event_id: int
    name: str
    email: EmailStr
    phone: str
    dog_name: str
    dog_breed: Optional[str] = None
    special_requirements: Optional[str] = None

class RegistrationResponse(BaseModel):
    id: int
    event_id: int
    name: str
    email: str
    phone: str
    dog_name: str
    dog_breed: Optional[str]
    special_requirements: Optional[str]
    status: str
    registered_at: str

# Event Endpoints
@router.get("/", response_model=List[EventResponse])
def get_events(
    category: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all events, optionally filtered by category"""
    query = db.query(EventModel)
    
    if active_only:
        query = query.filter(EventModel.is_active == True)
    
    if category:
        query = query.filter(EventModel.category == category)
    
    events = query.order_by(EventModel.date.asc()).all()
    
    # Create default events if none exist
    if not events and not category:
        default_events = [
            EventModel(
                title="Puppy Socialization Workshop",
                description="Help your puppy develop essential social skills in a safe, controlled environment. Perfect for puppies 8 weeks to 6 months old.",
                date=date(2024, 12, 15),
                time="10:00 AM - 12:00 PM",
                location="Griffith Park Dog Area",
                category="workshop",
                spots_total=15,
                spots_available=15,
                price="$45",
                image="🐶",
                is_featured=True,
                is_active=True
            ),
            EventModel(
                title="Advanced Obedience Training",
                description="Take your dog's training to the next level with off-leash commands, distance control, and advanced behavioral techniques.",
                date=date(2024, 12, 20),
                time="2:00 PM - 4:00 PM",
                location="Silver Lake Dog Park",
                category="training",
                spots_total=10,
                spots_available=10,
                price="$65",
                image="🎓",
                is_featured=False,
                is_active=True
            ),
            EventModel(
                title="Holiday Dog Social & Meetup",
                description="Celebrate the season with fellow dog lovers! Festive activities, treats, and socialization for dogs of all ages.",
                date=date(2024, 12, 22),
                time="4:00 PM - 6:00 PM",
                location="West Hollywood Park",
                category="social",
                spots_total=30,
                spots_available=30,
                price="Free",
                image="🎄",
                is_featured=True,
                is_active=True
            ),
            EventModel(
                title="Agility Training Basics",
                description="Introduction to dog agility training. Learn jumps, tunnels, and weave poles in a fun, supportive environment.",
                date=date(2025, 1, 5),
                time="11:00 AM - 1:00 PM",
                location="Santa Monica Beach",
                category="training",
                spots_total=12,
                spots_available=12,
                price="$55",
                image="🏃",
                is_featured=False,
                is_active=True
            ),
            EventModel(
                title="Reactive Dog Management Workshop",
                description="Learn techniques to manage and improve reactive behavior. Small group setting with certified behavior specialists.",
                date=date(2025, 1, 10),
                time="9:00 AM - 11:00 AM",
                location="Downtown LA Training Center",
                category="workshop",
                spots_total=8,
                spots_available=8,
                price="$75",
                image="🔧",
                is_featured=False,
                is_active=True
            ),
            EventModel(
                title="LA Dog Show & Competition",
                description="Showcase your dog's skills! Categories include obedience, tricks, and best dressed. Prizes and awards for winners.",
                date=date(2025, 1, 15),
                time="1:00 PM - 5:00 PM",
                location="Venice Beach Boardwalk",
                category="competition",
                spots_total=50,
                spots_available=50,
                price="$35",
                image="🏆",
                is_featured=True,
                is_active=True
            )
        ]
        
        for event in default_events:
            db.add(event)
        db.commit()
        events = default_events
    
    return [
        EventResponse(
            id=event.id,
            title=event.title,
            description=event.description,
            date=event.date.strftime("%Y-%m-%d"),
            time=event.time,
            location=event.location,
            category=event.category,
            spots_total=event.spots_total,
            spots_available=event.spots_available,
            price=event.price,
            image=event.image,
            is_featured=event.is_featured,
            is_active=event.is_active,
            registrations_count=len(event.registrations)
        )
        for event in events
    ]

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Get a specific event by ID"""
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return EventResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        date=event.date.strftime("%Y-%m-%d"),
        time=event.time,
        location=event.location,
        category=event.category,
        spots_total=event.spots_total,
        spots_available=event.spots_available,
        price=event.price,
        image=event.image,
        is_featured=event.is_featured,
        is_active=event.is_active,
        registrations_count=len(event.registrations)
    )

@router.post("/", response_model=EventResponse)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    """Create a new event (admin only)"""
    new_event = EventModel(
        title=event.title,
        description=event.description,
        date=event.date,
        time=event.time,
        location=event.location,
        category=event.category,
        spots_total=event.spots_total,
        spots_available=event.spots_total,  # Initially all spots available
        price=event.price,
        image=event.image,
        is_featured=event.is_featured,
        is_active=True
    )
    
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    return EventResponse(
        id=new_event.id,
        title=new_event.title,
        description=new_event.description,
        date=new_event.date.strftime("%Y-%m-%d"),
        time=new_event.time,
        location=new_event.location,
        category=new_event.category,
        spots_total=new_event.spots_total,
        spots_available=new_event.spots_available,
        price=new_event.price,
        image=new_event.image,
        is_featured=new_event.is_featured,
        is_active=new_event.is_active,
        registrations_count=0
    )

@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: int, event_update: EventUpdate, db: Session = Depends(get_db)):
    """Update an event (admin only)"""
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Update fields if provided
    if event_update.title is not None:
        event.title = event_update.title
    if event_update.description is not None:
        event.description = event_update.description
    if event_update.date is not None:
        event.date = event_update.date
    if event_update.time is not None:
        event.time = event_update.time
    if event_update.location is not None:
        event.location = event_update.location
    if event_update.category is not None:
        event.category = event_update.category
    if event_update.spots_total is not None:
        # Adjust available spots proportionally
        diff = event_update.spots_total - event.spots_total
        event.spots_total = event_update.spots_total
        event.spots_available = max(0, event.spots_available + diff)
    if event_update.price is not None:
        event.price = event_update.price
    if event_update.image is not None:
        event.image = event_update.image
    if event_update.is_featured is not None:
        event.is_featured = event_update.is_featured
    if event_update.is_active is not None:
        event.is_active = event_update.is_active
    
    db.commit()
    db.refresh(event)
    
    return EventResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        date=event.date.strftime("%Y-%m-%d"),
        time=event.time,
        location=event.location,
        category=event.category,
        spots_total=event.spots_total,
        spots_available=event.spots_available,
        price=event.price,
        image=event.image,
        is_featured=event.is_featured,
        is_active=event.is_active,
        registrations_count=len(event.registrations)
    )

@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Delete an event (admin only)"""
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(event)
    db.commit()
    
    return {"message": "Event deleted successfully"}

# Registration Endpoints
@router.post("/register", response_model=RegistrationResponse)
def register_for_event(registration: RegistrationCreate, db: Session = Depends(get_db)):
    """Register for an event"""
    event = db.query(EventModel).filter(EventModel.id == registration.event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if not event.is_active:
        raise HTTPException(status_code=400, detail="Event is not active")
    
    if event.spots_available <= 0:
        raise HTTPException(status_code=400, detail="Event is full")
    
    # Check if already registered
    existing = db.query(EventRegistrationModel).filter(
        EventRegistrationModel.event_id == registration.event_id,
        EventRegistrationModel.email == registration.email
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # Create registration
    new_registration = EventRegistrationModel(
        event_id=registration.event_id,
        name=registration.name,
        email=registration.email,
        phone=registration.phone,
        dog_name=registration.dog_name,
        dog_breed=registration.dog_breed,
        special_requirements=registration.special_requirements,
        status="confirmed"
    )
    
    # Decrease available spots
    event.spots_available -= 1
    
    db.add(new_registration)
    db.commit()
    db.refresh(new_registration)
    
    return RegistrationResponse(
        id=new_registration.id,
        event_id=new_registration.event_id,
        name=new_registration.name,
        email=new_registration.email,
        phone=new_registration.phone,
        dog_name=new_registration.dog_name,
        dog_breed=new_registration.dog_breed,
        special_requirements=new_registration.special_requirements,
        status=new_registration.status,
        registered_at=new_registration.registered_at.isoformat()
    )

@router.get("/{event_id}/registrations", response_model=List[RegistrationResponse])
def get_event_registrations(event_id: int, db: Session = Depends(get_db)):
    """Get all registrations for an event (admin only)"""
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    registrations = db.query(EventRegistrationModel).filter(
        EventRegistrationModel.event_id == event_id
    ).order_by(EventRegistrationModel.registered_at.desc()).all()
    
    return [
        RegistrationResponse(
            id=reg.id,
            event_id=reg.event_id,
            name=reg.name,
            email=reg.email,
            phone=reg.phone,
            dog_name=reg.dog_name,
            dog_breed=reg.dog_breed,
            special_requirements=reg.special_requirements,
            status=reg.status,
            registered_at=reg.registered_at.isoformat()
        )
        for reg in registrations
    ]

@router.delete("/registrations/{registration_id}")
def cancel_registration(registration_id: int, db: Session = Depends(get_db)):
    """Cancel a registration"""
    registration = db.query(EventRegistrationModel).filter(
        EventRegistrationModel.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    event = db.query(EventModel).filter(EventModel.id == registration.event_id).first()
    
    # Increase available spots
    if event:
        event.spots_available += 1
    
    db.delete(registration)
    db.commit()
    
    return {"message": "Registration cancelled successfully"}

@router.get("/stats/summary")
def get_events_stats(db: Session = Depends(get_db)):
    """Get event statistics"""
    total_events = db.query(EventModel).filter(EventModel.is_active == True).count()
    total_registrations = db.query(EventRegistrationModel).count()
    
    upcoming_events = db.query(EventModel).filter(
        EventModel.is_active == True,
        EventModel.date >= date.today()
    ).count()
    
    return {
        "total_events": total_events,
        "upcoming_events": upcoming_events,
        "total_registrations": total_registrations
    }
