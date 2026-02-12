import sys
import os

# Add parent directory to path to access shared modules
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(parent_dir, 'shared'))
sys.path.insert(0, parent_dir)

from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import database
import models


class EventAgent:
    """Independent agent for event management."""
    
    def __init__(self, db: Session):
        """Initialize the event agent with a database session."""
        self.db = db
    
    def get_events(
        self, 
        event_type: str = "upcoming",
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get events with optional filtering."""
        try:
            db_events = self.db.query(database.Event).offset(skip).limit(limit).all()
            
            events = []
            now = datetime.utcnow()
            
            for event in db_events:
                is_upcoming = event.start_time > now if event.start_time else False
                
                # Filter based on type
                if (event_type == "upcoming" and is_upcoming) or \
                   (event_type == "past" and not is_upcoming):
                    
                    time_str = event.start_time.strftime("%I:%M %p").lstrip('0') if event.start_time else "TBD"
                    date_label = event.start_time.strftime("%b %d") if event.start_time else "TBD"
                    
                    # Get attendee count
                    attendee_count = len([rsvp for rsvp in event.rsvps if rsvp.status == 'attending'])
                    
                    events.append({
                        "id": str(event.id),
                        "title": event.title,
                        "time": time_str,
                        "dateLabel": date_label,
                        "organizer": event.organizer.full_name if event.organizer else "Unknown",
                        "location": event.location or "Virtual",
                        "attendeeCount": attendee_count,
                        "image": event.cover_image_url or "/events/default.jpg",
                        "start_time": event.start_time.isoformat() if event.start_time else None,
                        "end_time": event.end_time.isoformat() if event.end_time else None
                    })
            
            return {"events": events}
        except Exception as e:
            return {"events": [], "error": str(e)}
    
    def get_event(self, event_id: int, user_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific event."""
        try:
            event_id_int = int(event_id)
        except ValueError:
            return None
        
        event = self.db.query(database.Event).filter(
            database.Event.id == event_id_int
        ).first()
        
        if not event:
            return None
        
        # Get user's RSVP status if user_id provided
        user_status = "not_attending"
        if user_id:
            rsvp = self.db.query(database.EventRSVP).filter(
                database.EventRSVP.event_id == event_id_int,
                database.EventRSVP.user_id == user_id
            ).first()
            if rsvp:
                user_status = rsvp.status
        
        attendee_count = len([rsvp for rsvp in event.rsvps if rsvp.status == 'attending'])
        
        return {
            "id": str(event.id),
            "title": event.title,
            "description": event.description or f"Join us for {event.title}.",
            "tldr": f"An engaging {event.title.lower()} event at {event.location or 'virtual location'}.",
            "startTime": event.start_time.isoformat() + "Z" if event.start_time else None,
            "endTime": event.end_time.isoformat() + "Z" if event.end_time else None,
            "location": event.location or "Virtual",
            "organizer": {
                "name": event.organizer.full_name if event.organizer else "Event Organizer",
                "bio": f"Experienced event organizer passionate about bringing people together.",
                "avatar": event.organizer.avatar_url if event.organizer else "/avatars/organizer.jpg",
                "expertise": ["Event Planning", "Community Building", "Networking"],
                "hostingStyle": "Engaging, inclusive, and professional"
            },
            "attendeeCount": attendee_count,
            "capacity": event.capacity or 100,
            "userStatus": user_status,
            "aiInsights": self._generate_ai_insights(event),
            "agenda": self._generate_agenda(event),
            "locationTips": self._generate_location_tips(event),
            "preparation": self._generate_preparation_tips(event)
        }
    
    def create_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new event."""
        try:
            # Validate organizer exists
            organizer = self.db.query(database.User).filter(
                database.User.id == event_data.get("organizer_id")
            ).first()
            
            if not organizer:
                return {"error": "Organizer not found"}
            
            # Parse datetime strings to datetime objects if needed
            start_time = event_data.get("start_time")
            end_time = event_data.get("end_time")
            
            if isinstance(start_time, str):
                try:
                    # Try parsing ISO format
                    start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    # Fallback to other formats if needed
                    from dateutil import parser
                    start_time = parser.parse(start_time)
            
            if isinstance(end_time, str):
                try:
                    # Try parsing ISO format
                    end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    # Fallback to other formats if needed
                    from dateutil import parser
                    end_time = parser.parse(end_time)
            
            # Create event
            event = database.Event(
                title=event_data.get("title"),
                description=event_data.get("description"),
                start_time=event_data.get("start_time"),
                end_time=event_data.get("end_time"),
                location=event_data.get("location"),
                organizer_id=event_data.get("organizer_id"),
                capacity=event_data.get("capacity", 100),
                cover_image_url=event_data.get("cover_image_url"),
                is_public=event_data.get("is_public", True),
                requires_approval=event_data.get("requires_approval", False),
                ticket_price=event_data.get("ticket_price", 0.0)
            )
            
            self.db.add(event)
            self.db.commit()
            self.db.refresh(event)
            
            # Add co-hosts if provided
            if event_data.get("cohost_ids"):
                for cohost_id in event_data.get("cohost_ids", []):
                    cohost = self.db.query(database.User).filter(
                        database.User.id == cohost_id
                    ).first()
                    if cohost:
                        event.cohosts.append(cohost)
            
            self.db.commit()
            
            return {
                "id": event.id,
                "title": event.title,
                "message": "Event created successfully"
            }
        except Exception as e:
            self.db.rollback()
            return {"error": str(e)}
    
    def update_event(self, event_id: int, event_data: Dict[str, Any]) -> bool:
        """Update an existing event."""
        event = self.db.query(database.Event).filter(
            database.Event.id == event_id
        ).first()
        
        if not event:
            return False
        
        try:
            for key, value in event_data.items():
                if hasattr(event, key) and value is not None:
                    setattr(event, key, value)
            
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            return False
    
    def delete_event(self, event_id: int, user_id: int) -> bool:
        """Delete an event (only by organizer)."""
        event = self.db.query(database.Event).filter(
            database.Event.id == event_id
        ).first()
        
        if not event:
            return False
        
        if event.organizer_id != user_id:
            return False  # Only organizer can delete
        
        try:
            self.db.delete(event)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            return False
    
    def create_rsvp(
        self, 
        event_id: int, 
        user_id: int, 
        status: str,
        message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create or update an RSVP for an event."""
        event = self.db.query(database.Event).filter(
            database.Event.id == event_id
        ).first()
        
        if not event:
            return {"error": "Event not found"}
        
        # Check if RSVP already exists
        existing_rsvp = self.db.query(database.EventRSVP).filter(
            database.EventRSVP.event_id == event_id,
            database.EventRSVP.user_id == user_id
        ).first()
        
        if existing_rsvp:
            existing_rsvp.status = status
            if message:
                existing_rsvp.message = message
            self.db.commit()
            return {
                "id": existing_rsvp.id,
                "status": existing_rsvp.status,
                "message": "RSVP updated"
            }
        else:
            rsvp = database.EventRSVP(
                event_id=event_id,
                user_id=user_id,
                status=status,
                message=message
            )
            self.db.add(rsvp)
            self.db.commit()
            self.db.refresh(rsvp)
            
            return {
                "id": rsvp.id,
                "status": rsvp.status,
                "message": "RSVP created"
            }
    
    def get_event_rsvps(
        self, 
        event_id: int, 
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get RSVPs for an event."""
        query = self.db.query(database.EventRSVP).filter(
            database.EventRSVP.event_id == event_id
        )
        
        if status:
            query = query.filter(database.EventRSVP.status == status)
        
        rsvps = query.all()
        
        return [{
            "id": rsvp.id,
            "user_id": rsvp.user_id,
            "user_name": rsvp.user.full_name if rsvp.user else "Unknown",
            "status": rsvp.status,
            "message": rsvp.message,
            "created_at": rsvp.created_at.isoformat() if rsvp.created_at else None
        } for rsvp in rsvps]
    
    def add_cohost(self, event_id: int, user_id: int, current_user_id: int) -> bool:
        """Add a co-host to an event."""
        event = self.db.query(database.Event).filter(
            database.Event.id == event_id
        ).first()
        
        if not event:
            return False
        
        # Check permissions
        if event.organizer_id != current_user_id and \
           current_user_id not in [cohost.id for cohost in event.cohosts]:
            return False
        
        cohost = self.db.query(database.User).filter(
            database.User.id == user_id
        ).first()
        
        if not cohost:
            return False
        
        if cohost not in event.cohosts:
            event.cohosts.append(cohost)
            self.db.commit()
        
        return True
    
    def get_ai_insights(self, event_id: int, user_id: int) -> Dict[str, Any]:
        """Generate AI insights for an event."""
        event = self.db.query(database.Event).filter(
            database.Event.id == event_id
        ).first()
        
        if not event:
            return {"error": "Event not found"}
        
        return {
            "personalizedRecommendation": f"This event is recommended for you based on your interests.",
            "audienceGuidance": {
                "forYou": [
                    "Prepare your introduction",
                    "Check the location in advance",
                    "Set a reminder"
                ],
                "forFirstTime": [
                    "No prior knowledge needed",
                    "Casual dress",
                    "You can leave early if needed"
                ]
            },
            "shouldAttend": {
                "pros": ["Matches your interests", "Good networking opportunity"],
                "cons": ["Time commitment required"],
                "recommendation": "Worth attending if you have time"
            }
        }
    
    def _generate_ai_insights(self, event: database.Event) -> Dict[str, Any]:
        """Generate AI insights for event display."""
        return {
            "matchesInterests": ["Community", "Networking"],
            "expectedFormat": "Interactive session with networking opportunities",
            "avgDuration": "~2h",
            "recommendation": "Great opportunity to meet like-minded people",
            "fitScore": 85,
            "warnings": []
        }
    
    def _generate_agenda(self, event: database.Event) -> List[Dict[str, str]]:
        """Generate agenda for event."""
        return [
            {"time": "Start", "activity": "Welcome & introductions"},
            {"time": "+15min", "activity": "Main presentation/discussion"},
            {"time": "+60min", "activity": "Interactive session"},
            {"time": "+90min", "activity": "Networking & wrap-up"}
        ]
    
    def _generate_location_tips(self, event: database.Event) -> Dict[str, str]:
        """Generate location tips."""
        return {
            "bestArrivalTime": "15 minutes before start time",
            "parkingInfo": "Street parking usually available",
            "venueNotes": "Please be respectful of the venue and other attendees"
        }
    
    def _generate_preparation_tips(self, event: database.Event) -> List[Dict[str, str]]:
        """Generate preparation tips."""
        return [
            {
                "title": "Prepare your introduction",
                "description": "Think about how you'd like to introduce yourself",
                "timeNeeded": "2 min"
            },
            {
                "title": "Check the location",
                "description": "Get directions and plan your route",
                "timeNeeded": "1 min"
            },
            {
                "title": "Set a reminder",
                "description": "Get notified before the event starts",
                "timeNeeded": "30 sec"
            }
        ]


# Standalone functions for easy import
def create_event_agent(db: Session) -> EventAgent:
    """Factory function to create an event agent."""
    return EventAgent(db)



# Standalone execution
if __name__ == "__main__":
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
    
    app = FastAPI(title="Event Agent API", version="1.0.0")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    from database import SessionLocal, create_tables
    
    # Initialize database
    create_tables()
    
    @app.get("/")
    async def root():
        return {"agent": "event", "status": "running"}
    
    @app.get("/events")
    async def get_events(event_type: str = "upcoming", skip: int = 0, limit: int = 100):
        db = SessionLocal()
        try:
            agent = create_event_agent(db)
            return agent.get_events(event_type, skip, limit)
        finally:
            db.close()
    
    @app.get("/events/{event_id}")
    async def get_event(event_id: int):
        db = SessionLocal()
        try:
            agent = create_event_agent(db)
            return agent.get_event(event_id)
        finally:
            db.close()
    
    @app.post("/events/{event_id}/rsvp")
    async def create_rsvp(event_id: int, user_id: int, status: str):
        db = SessionLocal()
        try:
            agent = create_event_agent(db)
            return agent.create_rsvp(event_id, user_id, status)
        finally:
            db.close()
    
    uvicorn.run(app, host="0.0.0.0", port=8002)
