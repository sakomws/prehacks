from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, ChatMessageModel
import json

class ConnectionManager:
    """Manage WebSocket connections for real-time chat"""
    
    def __init__(self):
        # Store active connections: {booking_id: [websocket1, websocket2, ...]}
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, booking_id: int):
        """Accept new WebSocket connection"""
        await websocket.accept()
        if booking_id not in self.active_connections:
            self.active_connections[booking_id] = []
        self.active_connections[booking_id].append(websocket)
        print(f"✅ Client connected to booking {booking_id}")
    
    def disconnect(self, websocket: WebSocket, booking_id: int):
        """Remove WebSocket connection"""
        if booking_id in self.active_connections:
            self.active_connections[booking_id].remove(websocket)
            if not self.active_connections[booking_id]:
                del self.active_connections[booking_id]
        print(f"❌ Client disconnected from booking {booking_id}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send message to specific client"""
        await websocket.send_text(message)
    
    async def broadcast_to_booking(self, message: dict, booking_id: int):
        """Broadcast message to all clients in a booking chat"""
        if booking_id in self.active_connections:
            message_json = json.dumps(message)
            for connection in self.active_connections[booking_id]:
                try:
                    await connection.send_text(message_json)
                except Exception as e:
                    print(f"Error sending message: {e}")
    
    def get_active_connections_count(self, booking_id: int) -> int:
        """Get number of active connections for a booking"""
        return len(self.active_connections.get(booking_id, []))

# Global connection manager
manager = ConnectionManager()

def save_message_to_db(
    booking_id: int,
    sender_email: str,
    sender_name: str,
    sender_type: str,
    message: str
) -> ChatMessageModel:
    """Save chat message to database"""
    db = SessionLocal()
    try:
        db_message = ChatMessageModel(
            booking_id=booking_id,
            sender_email=sender_email,
            sender_name=sender_name,
            sender_type=sender_type,
            message=message,
            timestamp=datetime.utcnow(),
            read=False
        )
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        return db_message
    finally:
        db.close()

def get_chat_history(booking_id: int, limit: int = 100) -> List[dict]:
    """Get chat history for a booking"""
    db = SessionLocal()
    try:
        messages = db.query(ChatMessageModel)\
            .filter(ChatMessageModel.booking_id == booking_id)\
            .order_by(ChatMessageModel.timestamp.asc())\
            .limit(limit)\
            .all()
        
        return [
            {
                "id": msg.id,
                "booking_id": msg.booking_id,
                "sender_email": msg.sender_email,
                "sender_name": msg.sender_name,
                "sender_type": msg.sender_type,
                "message": msg.message,
                "timestamp": msg.timestamp.isoformat(),
                "read": msg.read
            }
            for msg in messages
        ]
    finally:
        db.close()

def mark_messages_as_read(booking_id: int, user_email: str):
    """Mark all messages as read for a user"""
    db = SessionLocal()
    try:
        db.query(ChatMessageModel)\
            .filter(
                ChatMessageModel.booking_id == booking_id,
                ChatMessageModel.sender_email != user_email
            )\
            .update({"read": True})
        db.commit()
    finally:
        db.close()

def get_unread_count(booking_id: int, user_email: str) -> int:
    """Get count of unread messages for a user"""
    db = SessionLocal()
    try:
        count = db.query(ChatMessageModel)\
            .filter(
                ChatMessageModel.booking_id == booking_id,
                ChatMessageModel.sender_email != user_email,
                ChatMessageModel.read == False
            )\
            .count()
        return count
    finally:
        db.close()
