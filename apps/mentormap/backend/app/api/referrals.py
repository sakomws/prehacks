"""Referral endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.api.auth import get_current_user

router = APIRouter()


@router.get("/")
def get_referral_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's referral information"""
    # Generate a simple referral code based on user ID
    referral_code = f"REF{current_user.id:06d}"
    
    # In a real implementation, you'd track referrals in the database
    return {
        "referral_code": referral_code,
        "referral_link": f"https://mentormap.ai/register?ref={referral_code}",
        "total_referrals": 0,  # Mock data
        "successful_referrals": 0,  # Mock data
        "earnings": 0.0  # Mock data
    }


@router.get("/stats")
def get_referral_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get referral statistics"""
    return {
        "total_clicks": 0,
        "total_signups": 0,
        "conversion_rate": 0.0,
        "total_earnings": 0.0,
        "pending_earnings": 0.0
    }