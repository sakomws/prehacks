from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy.orm import Session
import uvicorn
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from database import get_db, init_db, BookingModel, UserModel
from email_service import email_service
from chat import (
    manager,
    save_message_to_db,
    get_chat_history,
    mark_messages_as_read,
    get_unread_count,
    ChatMessageModel
)
from admin import router as admin_router
from content import router as content_router
from newsletter import router as newsletter_router
from events import router as events_router
from trainers import router as trainers_router

app = FastAPI(title="Dog Angelenos API", version="1.0.0")

# Include routers
app.include_router(admin_router)
app.include_router(content_router)
app.include_router(newsletter_router)
app.include_router(events_router)
app.include_router(trainers_router)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    print("✅ Database initialized")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3004", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class BookingCreate(BaseModel):
    dog_name: str
    owner_name: str
    email: EmailStr
    phone: str
    program: str
    preferred_date: date
    preferred_time: str
    location: str

class Booking(BookingCreate):
    id: int
    created_at: datetime
    status: str = "pending"

class User(BaseModel):
    email: EmailStr
    name: str
    google_id: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    token: str

# Routes
@app.get("/")
def read_root():
    return {
        "message": "Dog Angelenos API",
        "version": "1.0.0",
        "endpoints": {
            "bookings": "/api/bookings",
            "auth": "/api/auth/google"
        }
    }

@app.post("/api/bookings", response_model=Booking)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    """Create a new training session booking"""
    db_booking = BookingModel(
        dog_name=booking.dog_name,
        owner_name=booking.owner_name,
        email=booking.email,
        phone=booking.phone,
        program=booking.program,
        preferred_date=booking.preferred_date,
        preferred_time=booking.preferred_time,
        location=booking.location,
        status="pending"
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    # Send confirmation email
    email_service.send_booking_confirmation(booking.dict())
    
    return Booking(
        id=db_booking.id,
        dog_name=db_booking.dog_name,
        owner_name=db_booking.owner_name,
        email=db_booking.email,
        phone=db_booking.phone,
        program=db_booking.program,
        preferred_date=db_booking.preferred_date,
        preferred_time=db_booking.preferred_time,
        location=db_booking.location,
        created_at=db_booking.created_at,
        status=db_booking.status
    )

@app.get("/api/bookings", response_model=List[Booking])
def get_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all bookings"""
    bookings = db.query(BookingModel).offset(skip).limit(limit).all()
    return [
        Booking(
            id=b.id,
            dog_name=b.dog_name,
            owner_name=b.owner_name,
            email=b.email,
            phone=b.phone,
            program=b.program,
            preferred_date=b.preferred_date,
            preferred_time=b.preferred_time,
            location=b.location,
            created_at=b.created_at,
            status=b.status
        )
        for b in bookings
    ]

@app.get("/api/bookings/{booking_id}", response_model=Booking)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    """Get a specific booking by ID"""
    booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return Booking(
        id=booking.id,
        dog_name=booking.dog_name,
        owner_name=booking.owner_name,
        email=booking.email,
        phone=booking.phone,
        program=booking.program,
        preferred_date=booking.preferred_date,
        preferred_time=booking.preferred_time,
        location=booking.location,
        created_at=booking.created_at,
        status=booking.status
    )

@app.put("/api/bookings/{booking_id}/status", response_model=Booking)
def update_booking_status(booking_id: int, status: str, db: Session = Depends(get_db)):
    """Update booking status (pending, confirmed, completed, cancelled)"""
    booking = db.query(BookingModel).filter(BookingModel.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = status
    db.commit()
    db.refresh(booking)
    
    return Booking(
        id=booking.id,
        dog_name=booking.dog_name,
        owner_name=booking.owner_name,
        email=booking.email,
        phone=booking.phone,
        program=booking.program,
        preferred_date=booking.preferred_date,
        preferred_time=booking.preferred_time,
        location=booking.location,
        created_at=booking.created_at,
        status=booking.status
    )

@app.post("/api/auth/google")
def google_auth(auth_request: GoogleAuthRequest):
    """Handle Google OAuth authentication"""
    # In production, verify the token with Google
    # For now, return a mock response
    return {
        "success": True,
        "user": {
            "email": "user@example.com",
            "name": "Demo User",
            "token": "mock_jwt_token"
        }
    }

@app.get("/api/programs")
def get_programs():
    """Get available training programs"""
    return [
        {
            "id": 1,
            "name": "Puppy Training",
            "price": 199,
            "duration": "6 weeks",
            "description": "Ages 8 weeks - 6 months. Foundation skills, socialization, and potty training."
        },
        {
            "id": 2,
            "name": "Basic Obedience",
            "price": 249,
            "duration": "6 weeks",
            "description": "Sit, stay, come, heel, and leash manners. Perfect for all ages.",
            "popular": True
        },
        {
            "id": 3,
            "name": "Advanced Training",
            "price": 349,
            "duration": "8 weeks",
            "description": "Off-leash control, complex commands, and behavioral refinement."
        }
    ]

@app.get("/api/locations")
def get_locations():
    """Get available LA locations"""
    return [
        {"id": 1, "name": "West Hollywood", "address": "123 Santa Monica Blvd"},
        {"id": 2, "name": "Santa Monica", "address": "456 Ocean Ave"},
        {"id": 3, "name": "Downtown LA", "address": "789 Spring St"},
        {"id": 4, "name": "Silver Lake", "address": "321 Sunset Blvd"},
        {"id": 5, "name": "Venice Beach", "address": "654 Abbot Kinney Blvd"}
    ]

# Chat Endpoints
@app.websocket("/ws/chat/{booking_id}")
async def websocket_chat(websocket: WebSocket, booking_id: int):
    """WebSocket endpoint for real-time chat"""
    await manager.connect(websocket, booking_id)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Save message to database
            db_message = save_message_to_db(
                booking_id=booking_id,
                sender_email=message_data["sender_email"],
                sender_name=message_data["sender_name"],
                sender_type=message_data["sender_type"],
                message=message_data["message"]
            )
            
            # Broadcast to all connected clients in this booking
            broadcast_data = {
                "id": db_message.id,
                "booking_id": booking_id,
                "sender_email": db_message.sender_email,
                "sender_name": db_message.sender_name,
                "sender_type": db_message.sender_type,
                "message": db_message.message,
                "timestamp": db_message.timestamp.isoformat(),
                "read": db_message.read
            }
            await manager.broadcast_to_booking(broadcast_data, booking_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, booking_id)

@app.get("/api/chat/{booking_id}/history")
def get_chat_messages(booking_id: int, limit: int = 100):
    """Get chat history for a booking"""
    return get_chat_history(booking_id, limit)

@app.get("/api/chat/{booking_id}/unread")
def get_unread_messages(booking_id: int, user_email: str):
    """Get count of unread messages"""
    count = get_unread_count(booking_id, user_email)
    return {"unread_count": count}

@app.post("/api/chat/{booking_id}/mark-read")
def mark_chat_as_read(booking_id: int, user_email: str):
    """Mark all messages as read for a user"""
    mark_messages_as_read(booking_id, user_email)
    return {"success": True}

@app.get("/api/chat/active-connections/{booking_id}")
def get_active_chat_connections(booking_id: int):
    """Get number of active connections for a booking"""
    count = manager.get_active_connections_count(booking_id)
    return {"active_connections": count, "online": count > 0}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8003))
    uvicorn.run(app, host="0.0.0.0", port=port)
