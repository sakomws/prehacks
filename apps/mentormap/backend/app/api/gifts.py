"""Gift session endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
import uuid
import secrets
from app.database import get_db
from app.models import User, Mentor, Session

router = APIRouter()

# Pydantic models
class GiftSessionCreate(BaseModel):
    mentor_id: int
    recipient_email: EmailStr
    recipient_name: str
    message: Optional[str] = None
    sender_name: str
    sender_email: EmailStr

class GiftSessionRedeem(BaseModel):
    gift_code: str
    session_title: str
    session_description: Optional[str] = None
    preferred_date: str
    preferred_time: str

# Mock gift sessions storage (in production, use database)
gift_sessions = {}

@router.post("/purchase")
async def purchase_gift_session(
    gift_data: GiftSessionCreate,
    db: DBSession = Depends(get_db)
):
    """Purchase a gift session"""
    try:
        # Verify mentor exists
        mentor = db.query(Mentor).filter(Mentor.id == gift_data.mentor_id).first()
        if not mentor:
            raise HTTPException(status_code=404, detail="Mentor not found")
        
        # Generate unique gift code
        gift_code = secrets.token_urlsafe(16)
        
        # Calculate expiry date (1 year from purchase)
        expiry_date = datetime.utcnow() + timedelta(days=365)
        
        # Store gift session (in production, save to database)
        gift_session = {
            "id": len(gift_sessions) + 1,
            "gift_code": gift_code,
            "mentor_id": gift_data.mentor_id,
            "mentor_name": mentor.user.full_name if mentor.user else "Unknown",
            "mentor_title": mentor.title,
            "hourly_rate": mentor.hourly_rate,
            "recipient_email": gift_data.recipient_email,
            "recipient_name": gift_data.recipient_name,
            "sender_name": gift_data.sender_name,
            "sender_email": gift_data.sender_email,
            "message": gift_data.message,
            "status": "active",  # active, redeemed, expired
            "purchased_at": datetime.utcnow().isoformat(),
            "expires_at": expiry_date.isoformat(),
            "redeemed_at": None,
            "session_id": None
        }
        
        gift_sessions[gift_code] = gift_session
        
        # TODO: Process payment with Stripe
        # TODO: Send gift email to recipient
        
        return {
            "success": True,
            "message": "Gift session purchased successfully!",
            "gift_code": gift_code,
            "gift_id": gift_session["id"],
            "expires_at": expiry_date.isoformat()
        }
        
    except Exception as e:
        print(f"Error purchasing gift session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to purchase gift session")

@router.get("/verify/{gift_code}")
async def verify_gift_code(gift_code: str):
    """Verify a gift code and return gift details"""
    gift_session = gift_sessions.get(gift_code)
    
    if not gift_session:
        raise HTTPException(status_code=404, detail="Invalid gift code")
    
    if gift_session["status"] != "active":
        raise HTTPException(status_code=400, detail="Gift code has already been used or expired")
    
    # Check if expired
    expiry_date = datetime.fromisoformat(gift_session["expires_at"])
    if datetime.utcnow() > expiry_date:
        gift_session["status"] = "expired"
        raise HTTPException(status_code=400, detail="Gift code has expired")
    
    return {
        "valid": True,
        "gift_details": {
            "mentor_name": gift_session["mentor_name"],
            "mentor_title": gift_session["mentor_title"],
            "sender_name": gift_session["sender_name"],
            "message": gift_session["message"],
            "expires_at": gift_session["expires_at"]
        }
    }

@router.post("/redeem")
async def redeem_gift_session(
    redeem_data: GiftSessionRedeem,
    db: DBSession = Depends(get_db)
):
    """Redeem a gift session"""
    try:
        gift_session = gift_sessions.get(redeem_data.gift_code)
        
        if not gift_session:
            raise HTTPException(status_code=404, detail="Invalid gift code")
        
        if gift_session["status"] != "active":
            raise HTTPException(status_code=400, detail="Gift code has already been used or expired")
        
        # Check if expired
        expiry_date = datetime.fromisoformat(gift_session["expires_at"])
        if datetime.utcnow() > expiry_date:
            gift_session["status"] = "expired"
            raise HTTPException(status_code=400, detail="Gift code has expired")
        
        # Get or create recipient user
        recipient_user = db.query(User).filter(User.email == gift_session["recipient_email"]).first()
        if not recipient_user:
            # Create user account for gift recipient
            recipient_user = User(
                email=gift_session["recipient_email"],
                username=gift_session["recipient_email"].split("@")[0],
                hashed_password="temp_password_hash",  # In production, generate proper hash
                full_name=gift_session["recipient_name"],
                is_mentor=False
            )
            db.add(recipient_user)
            db.commit()
            db.refresh(recipient_user)
        
        # Create session
        new_session = Session(
            student_id=recipient_user.id,
            mentor_id=gift_session["mentor_id"],
            title=redeem_data.session_title,
            description=redeem_data.session_description,
            scheduled_at=datetime.fromisoformat(f"{redeem_data.preferred_date}T{redeem_data.preferred_time}:00"),
            duration_minutes=60,
            status="scheduled",
            price=gift_session["hourly_rate"],
            payment_status="paid"  # Already paid via gift
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        # Mark gift as redeemed
        gift_session["status"] = "redeemed"
        gift_session["redeemed_at"] = datetime.utcnow().isoformat()
        gift_session["session_id"] = new_session.id
        
        return {
            "success": True,
            "message": "Gift session redeemed successfully!",
            "session_id": new_session.id,
            "session_details": {
                "title": new_session.title,
                "scheduled_at": new_session.scheduled_at.isoformat(),
                "mentor_name": gift_session["mentor_name"]
            }
        }
        
    except Exception as e:
        print(f"Error redeeming gift session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to redeem gift session")

@router.get("/")
async def get_all_gifts(db: DBSession = Depends(get_db)):
    """Get all gift sessions (admin endpoint)"""
    return list(gift_sessions.values())

@router.get("/sent/{sender_email}")
async def get_sent_gifts(sender_email: str):
    """Get gifts sent by a specific email"""
    sent_gifts = [gift for gift in gift_sessions.values() if gift["sender_email"] == sender_email]
    return sent_gifts

@router.get("/received/{recipient_email}")
async def get_received_gifts(recipient_email: str):
    """Get gifts received by a specific email"""
    received_gifts = [gift for gift in gift_sessions.values() if gift["recipient_email"] == recipient_email]
    return received_gifts

@router.post("/send-email/{gift_code}")
async def send_gift_email(gift_code: str):
    """Send gift email to recipient"""
    gift_session = gift_sessions.get(gift_code)
    
    if not gift_session:
        raise HTTPException(status_code=404, detail="Gift not found")
    
    # TODO: Implement actual email sending
    # For now, return email content that would be sent
    
    email_content = f"""
    🎁 You've received a mentoring session gift!
    
    Hi {gift_session['recipient_name']},
    
    {gift_session['sender_name']} has gifted you a mentoring session with {gift_session['mentor_name']} ({gift_session['mentor_title']}).
    
    {gift_session['message'] if gift_session['message'] else ''}
    
    To redeem your gift session:
    1. Visit: http://localhost:3000/gifts/redeem/{gift_code}
    2. Schedule your session
    3. Enjoy your mentoring experience!
    
    This gift expires on {gift_session['expires_at'][:10]}.
    
    Happy learning!
    The MentorMap Team
    """
    
    return {
        "success": True,
        "message": "Gift email sent successfully",
        "email_content": email_content
    }