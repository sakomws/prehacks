"""Schedule management endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta, time, date
from typing import List, Dict, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models import User, Session, Mentor, MentorAvailability, MentorTimeOff

router = APIRouter()

# Pydantic models
class AvailabilitySlot(BaseModel):
    day_of_week: int  # 0=Monday, 6=Sunday
    start_time: str   # "09:00"
    end_time: str     # "17:00"
    timezone: str = "UTC"

class TimeOffPeriod(BaseModel):
    start_date: str   # ISO format
    end_date: str     # ISO format
    reason: Optional[str] = None
    notes: Optional[str] = None

class ScheduleSessionRequest(BaseModel):
    mentor_id: int
    student_id: int
    title: str
    description: Optional[str] = None
    scheduled_at: str  # ISO format
    duration_minutes: int = 60

# Mentor Availability Management
@router.get("/mentors/{mentor_id}/availability")
def get_mentor_availability(
    mentor_id: int,
    db: DBSession = Depends(get_db)
):
    """Get mentor's weekly availability schedule"""
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    availability = db.query(MentorAvailability).filter(
        MentorAvailability.mentor_id == mentor_id,
        MentorAvailability.is_active == True
    ).order_by(MentorAvailability.day_of_week, MentorAvailability.start_time).all()
    
    # Group by day of week
    weekly_schedule = {}
    for slot in availability:
        day = slot.day_of_week
        if day not in weekly_schedule:
            weekly_schedule[day] = []
        weekly_schedule[day].append({
            "id": slot.id,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "timezone": slot.timezone
        })
    
    return {
        "mentor_id": mentor_id,
        "mentor_name": mentor.user.full_name if mentor.user else "Unknown",
        "weekly_schedule": weekly_schedule,
        "timezone": availability[0].timezone if availability else "UTC"
    }

@router.post("/mentors/{mentor_id}/availability")
def add_mentor_availability(
    mentor_id: int,
    availability: AvailabilitySlot,
    db: DBSession = Depends(get_db)
):
    """Add availability slot for mentor"""
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    # Check for overlapping slots
    existing = db.query(MentorAvailability).filter(
        MentorAvailability.mentor_id == mentor_id,
        MentorAvailability.day_of_week == availability.day_of_week,
        MentorAvailability.is_active == True,
        or_(
            and_(
                MentorAvailability.start_time <= availability.start_time,
                MentorAvailability.end_time > availability.start_time
            ),
            and_(
                MentorAvailability.start_time < availability.end_time,
                MentorAvailability.end_time >= availability.end_time
            )
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Overlapping availability slot exists")
    
    new_slot = MentorAvailability(
        mentor_id=mentor_id,
        day_of_week=availability.day_of_week,
        start_time=availability.start_time,
        end_time=availability.end_time,
        timezone=availability.timezone
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
def remove_mentor_availability(
    mentor_id: int,
    slot_id: int,
    db: DBSession = Depends(get_db)
):
    """Remove availability slot"""
    slot = db.query(MentorAvailability).filter(
        MentorAvailability.id == slot_id,
        MentorAvailability.mentor_id == mentor_id
    ).first()
    
    if not slot:
        raise HTTPException(status_code=404, detail="Availability slot not found")
    
    slot.is_active = False
    db.commit()
    
    return {
        "success": True,
        "message": "Availability slot removed successfully"
    }

# Time Off Management
@router.get("/mentors/{mentor_id}/time-off")
def get_mentor_time_off(
    mentor_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: DBSession = Depends(get_db)
):
    """Get mentor's time off periods"""
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    query = db.query(MentorTimeOff).filter(MentorTimeOff.mentor_id == mentor_id)
    
    if start_date:
        query = query.filter(MentorTimeOff.end_date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(MentorTimeOff.start_date <= datetime.fromisoformat(end_date))
    
    time_off_periods = query.order_by(MentorTimeOff.start_date).all()
    
    return [
        {
            "id": period.id,
            "start_date": period.start_date.isoformat(),
            "end_date": period.end_date.isoformat(),
            "reason": period.reason,
            "notes": period.notes,
            "created_at": period.created_at.isoformat()
        }
        for period in time_off_periods
    ]

@router.post("/mentors/{mentor_id}/time-off")
def add_mentor_time_off(
    mentor_id: int,
    time_off: TimeOffPeriod,
    db: DBSession = Depends(get_db)
):
    """Add time off period for mentor"""
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    start_date = datetime.fromisoformat(time_off.start_date)
    end_date = datetime.fromisoformat(time_off.end_date)
    
    if start_date >= end_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    
    new_time_off = MentorTimeOff(
        mentor_id=mentor_id,
        start_date=start_date,
        end_date=end_date,
        reason=time_off.reason,
        notes=time_off.notes
    )
    
    db.add(new_time_off)
    db.commit()
    db.refresh(new_time_off)
    
    return {
        "success": True,
        "message": "Time off period added successfully",
        "time_off_id": new_time_off.id
    }

@router.delete("/mentors/{mentor_id}/time-off/{time_off_id}")
def remove_mentor_time_off(
    mentor_id: int,
    time_off_id: int,
    db: DBSession = Depends(get_db)
):
    """Remove time off period"""
    time_off = db.query(MentorTimeOff).filter(
        MentorTimeOff.id == time_off_id,
        MentorTimeOff.mentor_id == mentor_id
    ).first()
    
    if not time_off:
        raise HTTPException(status_code=404, detail="Time off period not found")
    
    db.delete(time_off)
    db.commit()
    
    return {
        "success": True,
        "message": "Time off period removed successfully"
    }

# Schedule Management
@router.get("/mentors/{mentor_id}/schedule")
def get_mentor_schedule(
    mentor_id: int,
    date: Optional[str] = None,
    days: int = 7,
    db: DBSession = Depends(get_db)
):
    """Get mentor's schedule for a specific date range"""
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    # Parse date or use today
    if date:
        start_date = datetime.fromisoformat(date).date()
    else:
        start_date = datetime.utcnow().date()
    
    end_date = start_date + timedelta(days=days-1)
    
    # Get sessions in date range
    sessions = db.query(Session).filter(
        Session.mentor_id == mentor_id,
        func.date(Session.scheduled_at) >= start_date,
        func.date(Session.scheduled_at) <= end_date
    ).order_by(Session.scheduled_at).all()
    
    # Get availability for the week
    availability = db.query(MentorAvailability).filter(
        MentorAvailability.mentor_id == mentor_id,
        MentorAvailability.is_active == True
    ).all()
    
    # Get time off periods
    time_off = db.query(MentorTimeOff).filter(
        MentorTimeOff.mentor_id == mentor_id,
        MentorTimeOff.start_date <= datetime.combine(end_date, time.max),
        MentorTimeOff.end_date >= datetime.combine(start_date, time.min)
    ).all()
    
    # Build schedule
    schedule = []
    current_date = start_date
    
    while current_date <= end_date:
        day_of_week = current_date.weekday()  # 0=Monday, 6=Sunday
        
        # Check if mentor is on time off
        is_time_off = any(
            period.start_date.date() <= current_date <= period.end_date.date()
            for period in time_off
        )
        
        # Get availability for this day
        day_availability = [
            slot for slot in availability 
            if slot.day_of_week == day_of_week
        ]
        
        # Get sessions for this day
        day_sessions = [
            session for session in sessions
            if session.scheduled_at and session.scheduled_at.date() == current_date
        ]
        
        schedule.append({
            "date": current_date.isoformat(),
            "day_of_week": day_of_week,
            "is_time_off": is_time_off,
            "availability_slots": [
                {
                    "id": slot.id,
                    "start_time": slot.start_time,
                    "end_time": slot.end_time,
                    "timezone": slot.timezone
                }
                for slot in day_availability
            ],
            "sessions": [
                {
                    "id": session.id,
                    "title": session.title,
                    "student_name": session.student.full_name if session.student else "Unknown",
                    "scheduled_at": session.scheduled_at.isoformat(),
                    "duration_minutes": session.duration_minutes,
                    "status": session.status
                }
                for session in day_sessions
            ],
            "time_off_periods": [
                {
                    "id": period.id,
                    "reason": period.reason,
                    "notes": period.notes
                }
                for period in time_off
                if period.start_date.date() <= current_date <= period.end_date.date()
            ]
        })
        
        current_date += timedelta(days=1)
    
    return {
        "mentor_id": mentor_id,
        "mentor_name": mentor.user.full_name if mentor.user else "Unknown",
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "schedule": schedule
    }

@router.get("/overview")
def get_schedule_overview(
    date: Optional[str] = None,
    days: int = 7,
    db: DBSession = Depends(get_db)
):
    """Get schedule overview for all mentors"""
    # Parse date or use today
    if date:
        start_date = datetime.fromisoformat(date).date()
    else:
        start_date = datetime.utcnow().date()
    
    end_date = start_date + timedelta(days=days-1)
    
    # Get all mentors
    mentors = db.query(Mentor).filter(Mentor.is_available == True).all()
    
    # Get all sessions in date range
    sessions = db.query(Session).filter(
        func.date(Session.scheduled_at) >= start_date,
        func.date(Session.scheduled_at) <= end_date
    ).order_by(Session.scheduled_at).all()
    
    # Group sessions by mentor and date
    mentor_schedules = {}
    for mentor in mentors:
        mentor_sessions = [s for s in sessions if s.mentor_id == mentor.id]
        
        daily_sessions = {}
        current_date = start_date
        while current_date <= end_date:
            day_sessions = [
                s for s in mentor_sessions
                if s.scheduled_at and s.scheduled_at.date() == current_date
            ]
            daily_sessions[current_date.isoformat()] = len(day_sessions)
            current_date += timedelta(days=1)
        
        mentor_schedules[mentor.id] = {
            "mentor_name": mentor.user.full_name if mentor.user else "Unknown",
            "mentor_title": mentor.title,
            "total_sessions": len(mentor_sessions),
            "daily_sessions": daily_sessions
        }
    
    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "mentor_schedules": mentor_schedules,
        "total_sessions": len(sessions)
    }

@router.post("/session")
def schedule_session(
    session_request: ScheduleSessionRequest,
    db: DBSession = Depends(get_db)
):
    """Schedule a new session (admin only)"""
    # Validate mentor exists
    mentor = db.query(Mentor).filter(Mentor.id == session_request.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    # Validate student exists
    student = db.query(User).filter(User.id == session_request.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    scheduled_at = datetime.fromisoformat(session_request.scheduled_at)
    
    # Check for conflicts
    existing_session = db.query(Session).filter(
        Session.mentor_id == session_request.mentor_id,
        Session.scheduled_at == scheduled_at,
        Session.status.in_(["scheduled", "pending"])
    ).first()
    
    if existing_session:
        raise HTTPException(status_code=400, detail="Time slot already booked")
    
    # Create session
    new_session = Session(
        student_id=session_request.student_id,
        mentor_id=session_request.mentor_id,
        title=session_request.title,
        description=session_request.description,
        scheduled_at=scheduled_at,
        duration_minutes=session_request.duration_minutes,
        price=mentor.hourly_rate * (session_request.duration_minutes / 60),
        status="scheduled"
    )
    
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    return {
        "success": True,
        "message": "Session scheduled successfully",
        "session_id": new_session.id,
        "scheduled_at": new_session.scheduled_at.isoformat(),
        "price": new_session.price
    }

@router.get("/conflicts")
def check_schedule_conflicts(
    mentor_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: DBSession = Depends(get_db)
):
    """Check for scheduling conflicts"""
    query = db.query(Session).filter(Session.status.in_(["scheduled", "pending"]))
    
    if mentor_id:
        query = query.filter(Session.mentor_id == mentor_id)
    
    if start_date:
        query = query.filter(Session.scheduled_at >= datetime.fromisoformat(start_date))
    
    if end_date:
        query = query.filter(Session.scheduled_at <= datetime.fromisoformat(end_date))
    
    sessions = query.order_by(Session.scheduled_at).all()
    
    conflicts = []
    for i, session in enumerate(sessions):
        for j, other_session in enumerate(sessions[i+1:], i+1):
            if (session.mentor_id == other_session.mentor_id and
                session.scheduled_at == other_session.scheduled_at):
                conflicts.append({
                    "session1_id": session.id,
                    "session2_id": other_session.id,
                    "mentor_id": session.mentor_id,
                    "scheduled_at": session.scheduled_at.isoformat(),
                    "conflict_type": "same_time_same_mentor"
                })
    
    return {
        "conflicts": conflicts,
        "total_conflicts": len(conflicts)
    }