from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List, Dict
from database import get_db, BookingModel, UserModel, ChatMessageModel

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Dashboard Stats
@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    total_bookings = db.query(BookingModel).count()
    active_customers = db.query(UserModel).count()
    
    # Messages today
    today = datetime.utcnow().date()
    messages_today = db.query(ChatMessageModel).filter(
        func.date(ChatMessageModel.timestamp) == today
    ).count()
    
    # Recent bookings (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_bookings = db.query(BookingModel).filter(
        BookingModel.created_at >= week_ago
    ).count()
    
    return {
        "total_bookings": total_bookings,
        "active_customers": active_customers,
        "messages_today": messages_today,
        "recent_bookings": recent_bookings,
        "trainers": 12  # Static for now
    }

# Recent Activity
@router.get("/activity/recent")
def get_recent_activity(limit: int = 10, db: Session = Depends(get_db)):
    """Get recent bookings and messages"""
    recent_bookings = db.query(BookingModel)\
        .order_by(desc(BookingModel.created_at))\
        .limit(limit)\
        .all()
    
    recent_messages = db.query(ChatMessageModel)\
        .order_by(desc(ChatMessageModel.timestamp))\
        .limit(limit)\
        .all()
    
    return {
        "bookings": [
            {
                "id": b.id,
                "customer": b.owner_name,
                "dog": b.dog_name,
                "program": b.program,
                "status": b.status,
                "created_at": b.created_at.isoformat()
            }
            for b in recent_bookings
        ],
        "messages": [
            {
                "id": m.id,
                "booking_id": m.booking_id,
                "sender": m.sender_name,
                "message": m.message[:50] + "..." if len(m.message) > 50 else m.message,
                "timestamp": m.timestamp.isoformat()
            }
            for m in recent_messages
        ]
    }

# Customers Management
@router.get("/customers")
def get_all_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all customers with their booking counts"""
    customers = db.query(UserModel).offset(skip).limit(limit).all()
    
    result = []
    for customer in customers:
        booking_count = db.query(BookingModel).filter(
            BookingModel.email == customer.email
        ).count()
        
        result.append({
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "created_at": customer.created_at.isoformat(),
            "booking_count": booking_count
        })
    
    return result

@router.get("/customers/{customer_id}")
def get_customer_details(customer_id: int, db: Session = Depends(get_db)):
    """Get detailed customer information"""
    customer = db.query(UserModel).filter(UserModel.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    bookings = db.query(BookingModel).filter(
        BookingModel.email == customer.email
    ).all()
    
    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "created_at": customer.created_at.isoformat(),
        "bookings": [
            {
                "id": b.id,
                "dog_name": b.dog_name,
                "program": b.program,
                "date": b.preferred_date.isoformat(),
                "status": b.status
            }
            for b in bookings
        ]
    }

# Bookings Management
@router.get("/bookings/all")
def get_all_bookings_admin(
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all bookings with optional status filter"""
    query = db.query(BookingModel)
    
    if status:
        query = query.filter(BookingModel.status == status)
    
    bookings = query.order_by(desc(BookingModel.created_at))\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return [
        {
            "id": b.id,
            "customer": b.owner_name,
            "email": b.email,
            "dog": b.dog_name,
            "program": b.program,
            "date": b.preferred_date.isoformat(),
            "time": b.preferred_time,
            "location": b.location,
            "status": b.status,
            "created_at": b.created_at.isoformat()
        }
        for b in bookings
    ]

@router.put("/bookings/{booking_id}")
def update_booking_admin(
    booking_id: int,
    status: str = None,
    notes: str = None,
    db: Session = Depends(get_db)
):
    """Update booking details"""
    booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if status:
        booking.status = status
    
    db.commit()
    db.refresh(booking)
    
    return {"success": True, "booking_id": booking_id}

@router.delete("/bookings/{booking_id}")
def delete_booking_admin(booking_id: int, db: Session = Depends(get_db)):
    """Delete a booking"""
    booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db.delete(booking)
    db.commit()
    
    return {"success": True, "message": "Booking deleted"}

# Chat Management
@router.get("/chat/conversations")
def get_all_conversations(db: Session = Depends(get_db)):
    """Get all chat conversations with unread counts"""
    # Get unique booking IDs with messages
    bookings_with_chats = db.query(ChatMessageModel.booking_id)\
        .distinct()\
        .all()
    
    conversations = []
    for (booking_id,) in bookings_with_chats:
        booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
        if not booking:
            continue
        
        # Get last message
        last_message = db.query(ChatMessageModel)\
            .filter(ChatMessageModel.booking_id == booking_id)\
            .order_by(desc(ChatMessageModel.timestamp))\
            .first()
        
        # Count unread messages
        unread_count = db.query(ChatMessageModel)\
            .filter(
                ChatMessageModel.booking_id == booking_id,
                ChatMessageModel.read == False,
                ChatMessageModel.sender_type == "customer"
            )\
            .count()
        
        conversations.append({
            "booking_id": booking_id,
            "customer": booking.owner_name,
            "dog": booking.dog_name,
            "last_message": last_message.message if last_message else "",
            "last_message_time": last_message.timestamp.isoformat() if last_message else "",
            "unread_count": unread_count
        })
    
    return conversations

# Calendar
@router.get("/calendar/events")
def get_calendar_events(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db)
):
    """Get calendar events for date range"""
    from datetime import date
    
    start = date.fromisoformat(start_date)
    end = date.fromisoformat(end_date)
    
    bookings = db.query(BookingModel).filter(
        BookingModel.preferred_date >= start,
        BookingModel.preferred_date <= end
    ).all()
    
    return [
        {
            "id": b.id,
            "title": f"{b.dog_name} - {b.program}",
            "customer": b.owner_name,
            "date": b.preferred_date.isoformat(),
            "time": b.preferred_time,
            "location": b.location,
            "status": b.status
        }
        for b in bookings
    ]

# Analytics
@router.get("/analytics/bookings")
def get_booking_analytics(days: int = 30, db: Session = Depends(get_db)):
    """Get booking analytics for the last N days"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    bookings = db.query(BookingModel).filter(
        BookingModel.created_at >= start_date
    ).all()
    
    # Group by status
    status_counts = {}
    for booking in bookings:
        status_counts[booking.status] = status_counts.get(booking.status, 0) + 1
    
    # Group by program
    program_counts = {}
    for booking in bookings:
        program_counts[booking.program] = program_counts.get(booking.program, 0) + 1
    
    return {
        "total": len(bookings),
        "by_status": status_counts,
        "by_program": program_counts
    }

# Trainers Management
@router.get("/trainers")
def get_all_trainers():
    """Get all trainers"""
    # Static data for now - can be moved to database
    return [
        {
            "id": 1,
            "name": "Alex Rodriguez",
            "email": "alex@dogangelenos.com",
            "specialty": "Basic Obedience",
            "experience": "10 years",
            "rating": 4.9,
            "active_clients": 45,
            "certifications": ["CPDT-KA", "AKC CGC Evaluator"]
        },
        {
            "id": 2,
            "name": "Maria Garcia",
            "email": "maria@dogangelenos.com",
            "specialty": "Puppy Training",
            "experience": "8 years",
            "rating": 4.8,
            "active_clients": 38,
            "certifications": ["CPDT-KA", "Fear Free Certified"]
        },
        {
            "id": 3,
            "name": "John Smith",
            "email": "john@dogangelenos.com",
            "specialty": "Advanced Training",
            "experience": "12 years",
            "rating": 5.0,
            "active_clients": 52,
            "certifications": ["CPDT-KA", "KPA CTP", "AKC CGC Evaluator"]
        }
    ]

@router.get("/trainers/{trainer_id}/schedule")
def get_trainer_schedule(
    trainer_id: int,
    date: str = None,
    db: Session = Depends(get_db)
):
    """Get trainer's schedule for a specific date"""
    from datetime import date as date_type
    
    # Parse date or use today
    if date:
        schedule_date = date_type.fromisoformat(date)
    else:
        schedule_date = datetime.utcnow().date()
    
    # Get bookings for this trainer on this date
    bookings = db.query(BookingModel).filter(
        BookingModel.preferred_date == schedule_date
    ).all()
    
    # Create time slots
    time_slots = [
        "9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", 
        "3:00 PM", "4:30 PM", "6:00 PM"
    ]
    
    schedule = []
    for time_slot in time_slots:
        # Find booking for this time slot
        booking = next(
            (b for b in bookings if b.preferred_time.startswith(time_slot.split()[0])),
            None
        )
        
        if booking:
            schedule.append({
                "time": time_slot,
                "booking_id": booking.id,
                "customer": booking.owner_name,
                "dog": booking.dog_name,
                "program": booking.program,
                "location": booking.location,
                "status": booking.status,
                "available": False
            })
        else:
            schedule.append({
                "time": time_slot,
                "booking_id": None,
                "customer": "Available",
                "dog": "-",
                "program": "-",
                "location": "-",
                "status": "available",
                "available": True
            })
    
    return {
        "trainer_id": trainer_id,
        "date": schedule_date.isoformat(),
        "schedule": schedule,
        "total_sessions": len([s for s in schedule if not s["available"]]),
        "available_slots": len([s for s in schedule if s["available"]])
    }
