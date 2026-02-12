"""
Calendar Agent - Independent agent for managing calendars, scheduling, and time management.
Handles calendar operations, event scheduling, availability management, and calendar analytics.
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import database
import models


class CalendarAgent:
    """Independent agent for calendar management."""
    
    def __init__(self, db: Session):
        """Initialize the calendar agent with a database session."""
        self.db = db
    
    def get_user_calendars(self, user_id: int) -> Dict[str, Any]:
        """Get calendars for a user."""
        # Get user's events
        user_events = self.db.query(database.Event).join(
            database.EventRSVP
        ).filter(
            database.EventRSVP.user_id == user_id,
            database.EventRSVP.status == "attending"
        ).all()
        
        # Get events user is organizing
        organized_events = self.db.query(database.Event).filter(
            database.Event.organizer_id == user_id
        ).all()
        
        # Get events user is co-hosting
        cohosted_events = self.db.query(database.Event).join(
            database.event_cohosts
        ).filter(
            database.event_cohosts.c.user_id == user_id
        ).all()
        
        all_events = list(set(user_events + organized_events + cohosted_events))
        
        # Group by date
        calendars = {
            "myCalendars": [
                {
                    "name": "My Events",
                    "subscribers": 0,
                    "avatar": "/avatars/calendar.jpg",
                    "event_count": len(all_events)
                }
            ],
            "upcomingEvents": self._format_upcoming_events(all_events[:5])
        }
        
        return calendars
    
    def get_calendar_events(
        self,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Get calendar events for a date range."""
        if not start_date:
            start_date = datetime.utcnow()
        if not end_date:
            end_date = start_date + timedelta(days=30)
        
        # Get attending events
        attending_events = self.db.query(database.Event).join(
            database.EventRSVP
        ).filter(
            database.EventRSVP.user_id == user_id,
            database.EventRSVP.status == "attending",
            database.Event.start_time >= start_date,
            database.Event.start_time <= end_date
        ).all()
        
        # Get organizing events
        organizing_events = self.db.query(database.Event).filter(
            database.Event.organizer_id == user_id,
            database.Event.start_time >= start_date,
            database.Event.start_time <= end_date
        ).all()
        
        # Get co-hosting events
        cohosting_events = self.db.query(database.Event).join(
            database.event_cohosts
        ).filter(
            database.event_cohosts.c.user_id == user_id,
            database.Event.start_time >= start_date,
            database.Event.start_time <= end_date
        ).all()
        
        all_events = list(set(attending_events + organizing_events + cohosting_events))
        
        return [self._format_calendar_event(event, user_id) for event in all_events]
    
    def get_availability(
        self,
        user_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get user's availability for a date range."""
        # Get all events user is committed to
        committed_events = self.db.query(database.Event).join(
            database.EventRSVP
        ).filter(
            database.EventRSVP.user_id == user_id,
            database.EventRSVP.status == "attending",
            database.Event.start_time >= start_date,
            database.Event.end_time <= end_date
        ).all()
        
        # Also include events user is organizing/co-hosting
        organizing_events = self.db.query(database.Event).filter(
            database.Event.organizer_id == user_id,
            database.Event.start_time >= start_date,
            database.Event.end_time <= end_date
        ).all()
        
        all_events = list(set(committed_events + organizing_events))
        
        # Calculate busy times
        busy_slots = []
        for event in all_events:
            if event.start_time and event.end_time:
                busy_slots.append({
                    "start": event.start_time.isoformat(),
                    "end": event.end_time.isoformat(),
                    "title": event.title,
                    "type": "busy"
                })
        
        return {
            "user_id": user_id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "busy_slots": busy_slots,
            "available_slots": self._calculate_available_slots(start_date, end_date, busy_slots)
        }
    
    def suggest_event_time(
        self,
        organizer_id: int,
        duration_minutes: int = 60,
        preferred_times: Optional[List[str]] = None,
        participant_ids: Optional[List[int]] = None
    ) -> List[Dict[str, Any]]:
        """Suggest optimal event times based on availability."""
        # Get organizer's availability
        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=14)
        
        organizer_availability = self.get_availability(organizer_id, start_date, end_date)
        
        # If participants specified, check their availability too
        if participant_ids:
            participant_availabilities = []
            for participant_id in participant_ids:
                avail = self.get_availability(participant_id, start_date, end_date)
                participant_availabilities.append(avail)
            
            # Find common available slots
            suggestions = self._find_common_slots(
                organizer_availability,
                participant_availabilities,
                duration_minutes
            )
        else:
            # Just use organizer's availability
            suggestions = self._generate_time_suggestions(
                organizer_availability,
                duration_minutes
            )
        
        return suggestions[:5]  # Return top 5 suggestions
    
    def get_calendar_analytics(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get calendar analytics for a user."""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get events statistics
        attending_count = self.db.query(database.EventRSVP).join(
            database.Event
        ).filter(
            database.EventRSVP.user_id == user_id,
            database.EventRSVP.status == "attending",
            database.Event.start_time >= start_date
        ).count()
        
        organizing_count = self.db.query(database.Event).filter(
            database.Event.organizer_id == user_id,
            database.Event.start_time >= start_date
        ).count()
        
        cohosting_count = self.db.query(database.Event).join(
            database.event_cohosts
        ).filter(
            database.event_cohosts.c.user_id == user_id,
            database.Event.start_time >= start_date
        ).count()
        
        # Calculate time spent in events
        events = self.db.query(database.Event).join(
            database.EventRSVP
        ).filter(
            database.EventRSVP.user_id == user_id,
            database.EventRSVP.status == "attending",
            database.Event.start_time >= start_date,
            database.Event.end_time <= datetime.utcnow()
        ).all()
        
        total_hours = sum([
            (event.end_time - event.start_time).total_seconds() / 3600
            for event in events
            if event.start_time and event.end_time
        ])
        
        return {
            "user_id": user_id,
            "period_days": days,
            "attending_count": attending_count,
            "organizing_count": organizing_count,
            "cohosting_count": cohosting_count,
            "total_events": attending_count + organizing_count + cohosting_count,
            "total_hours": round(total_hours, 2),
            "avg_hours_per_week": round(total_hours / (days / 7), 2),
            "busy_days": self._count_busy_days(user_id, start_date)
        }
    
    def check_conflicts(
        self,
        user_id: int,
        start_time: datetime,
        end_time: datetime
    ) -> List[Dict[str, Any]]:
        """Check for scheduling conflicts."""
        conflicts = self.db.query(database.Event).join(
            database.EventRSVP
        ).filter(
            database.EventRSVP.user_id == user_id,
            database.EventRSVP.status == "attending",
            or_(
                and_(
                    database.Event.start_time <= start_time,
                    database.Event.end_time > start_time
                ),
                and_(
                    database.Event.start_time < end_time,
                    database.Event.end_time >= end_time
                ),
                and_(
                    database.Event.start_time >= start_time,
                    database.Event.end_time <= end_time
                )
            )
        ).all()
        
        return [{
            "id": event.id,
            "title": event.title,
            "start_time": event.start_time.isoformat() if event.start_time else None,
            "end_time": event.end_time.isoformat() if event.end_time else None,
            "conflict_type": "overlap"
        } for event in conflicts]
    
    def _format_upcoming_events(self, events: List[database.Event]) -> List[Dict[str, Any]]:
        """Format events for upcoming display."""
        formatted = []
        for event in events:
            if event.start_time:
                formatted.append({
                    "title": event.title,
                    "date": event.start_time.strftime("%b %d"),
                    "time": event.start_time.strftime("%I:%M %p").lstrip('0')
                })
        return formatted
    
    def _format_calendar_event(self, event: database.Event, user_id: int) -> Dict[str, Any]:
        """Format event for calendar display."""
        role = "organizer" if event.organizer_id == user_id else "attendee"
        
        return {
            "id": event.id,
            "title": event.title,
            "start": event.start_time.isoformat() if event.start_time else None,
            "end": event.end_time.isoformat() if event.end_time else None,
            "location": event.location,
            "role": role,
            "attendee_count": len([rsvp for rsvp in event.rsvps if rsvp.status == 'attending'])
        }
    
    def _calculate_available_slots(
        self,
        start_date: datetime,
        end_date: datetime,
        busy_slots: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Calculate available time slots."""
        # Simplified: return time blocks that don't overlap with busy slots
        # In production, this would be more sophisticated
        available = []
        current = start_date
        
        while current < end_date:
            # Check if this time slot conflicts with any busy slot
            conflicts = False
            for busy in busy_slots:
                busy_start = datetime.fromisoformat(busy["start"].replace("Z", "+00:00"))
                busy_end = datetime.fromisoformat(busy["end"].replace("Z", "+00:00"))
                
                if busy_start <= current < busy_end:
                    conflicts = True
                    current = busy_end
                    break
            
            if not conflicts:
                slot_end = current + timedelta(hours=1)
                if slot_end <= end_date:
                    available.append({
                        "start": current.isoformat(),
                        "end": slot_end.isoformat(),
                        "type": "available"
                    })
                current += timedelta(hours=1)
            else:
                current += timedelta(hours=1)
        
        return available[:10]  # Return first 10 available slots
    
    def _find_common_slots(
        self,
        organizer_availability: Dict[str, Any],
        participant_availabilities: List[Dict[str, Any]],
        duration_minutes: int
    ) -> List[Dict[str, Any]]:
        """Find common available slots across multiple users."""
        # Simplified implementation
        # In production, this would do proper intersection of availability
        suggestions = []
        duration = timedelta(minutes=duration_minutes)
        
        # Use organizer's available slots as base
        for slot in organizer_availability.get("available_slots", [])[:5]:
            suggestions.append({
                "start": slot["start"],
                "end": (datetime.fromisoformat(slot["start"]) + duration).isoformat(),
                "confidence": "high" if len(participant_availabilities) == 0 else "medium"
            })
        
        return suggestions
    
    def _generate_time_suggestions(
        self,
        availability: Dict[str, Any],
        duration_minutes: int
    ) -> List[Dict[str, Any]]:
        """Generate time suggestions from availability."""
        suggestions = []
        duration = timedelta(minutes=duration_minutes)
        
        for slot in availability.get("available_slots", [])[:5]:
            suggestions.append({
                "start": slot["start"],
                "end": (datetime.fromisoformat(slot["start"]) + duration).isoformat(),
                "confidence": "high"
            })
        
        return suggestions
    
    def _count_busy_days(self, user_id: int, start_date: datetime) -> int:
        """Count days with at least one event."""
        events = self.db.query(database.Event).join(
            database.EventRSVP
        ).filter(
            database.EventRSVP.user_id == user_id,
            database.EventRSVP.status == "attending",
            database.Event.start_time >= start_date
        ).all()
        
        busy_days = set()
        for event in events:
            if event.start_time:
                busy_days.add(event.start_time.date())
        
        return len(busy_days)


# Standalone functions for easy import
def create_calendar_agent(db: Session) -> CalendarAgent:
    """Factory function to create a calendar agent."""
    return CalendarAgent(db)

