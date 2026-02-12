"""Mentor application endpoints"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.database import get_db
import os

router = APIRouter()


class MentorApplicationRequest(BaseModel):
    title: str
    bio: str
    experience: str
    expertise: str
    hourly_rate: str
    availability: str
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    certifications: Optional[str] = None
    why_mentor: str
    mentorship_style: str
    success_stories: Optional[str] = None


@router.post("/")
async def submit_mentor_application(
    application: MentorApplicationRequest,
    db: DBSession = Depends(get_db)
):
    """Submit a mentor application"""
    try:
        # TODO: Get user info from authentication token
        # For now, using mock user data
        user_name = "Sarah Johnson"
        user_email = "sarah@example.com"
        
        # TODO: Save application to database
        # In production, you would create a MentorApplication model and save to DB
        
        # Mock response for now
        return {
            "success": True,
            "message": "Your mentor application has been submitted successfully! We'll review it within 3-5 business days.",
            "application_id": 123,
            "status": "pending"
        }
        
    except Exception as e:
        print(f"Error processing mentor application: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit application")


@router.post("/upload/profile-image")
async def upload_profile_image():
    """Upload profile image"""
    # TODO: Implement actual file upload to cloud storage
    # For now, return success response
    return {
        "success": True,
        "message": "Profile image uploaded successfully",
        "image_url": "https://example.com/profile-images/user-123.jpg"
    }


@router.get("/status/{user_id}")
async def get_application_status(user_id: int, db: DBSession = Depends(get_db)):
    """Get mentor application status for a user"""
    # TODO: Query actual application status from database
    # For now, return mock status
    return {
        "status": "none",  # none, pending, approved, rejected
        "application_id": None,
        "submitted_at": None,
        "reviewed_at": None,
        "notes": None
    }
