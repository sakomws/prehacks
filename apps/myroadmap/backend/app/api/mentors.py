"""Mentor endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.api.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[schemas.Mentor])
def get_mentors(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """Get list of mentors"""
    mentors = db.query(models.Mentor).filter(models.Mentor.is_available == True).offset(skip).limit(limit).all()
    return mentors


@router.get("/{mentor_id}", response_model=schemas.Mentor)
def get_mentor(mentor_id: int, db: Session = Depends(get_db)):
    """Get mentor by ID"""
    mentor = db.query(models.Mentor).filter(models.Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    return mentor


@router.post("/", response_model=schemas.Mentor)
def create_mentor_profile(
    mentor: schemas.MentorCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create mentor profile"""
    # Check if user already has a mentor profile
    existing = db.query(models.Mentor).filter(models.Mentor.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mentor profile already exists")
    
    # Create mentor profile
    db_mentor = models.Mentor(
        user_id=current_user.id,
        title=mentor.title,
        bio=mentor.bio,
        expertise=mentor.expertise,
        hourly_rate=mentor.hourly_rate
    )
    db.add(db_mentor)
    
    # Update user to be a mentor
    current_user.is_mentor = True
    
    db.commit()
    db.refresh(db_mentor)
    return db_mentor


@router.put("/{mentor_id}", response_model=schemas.Mentor)
def update_mentor_profile(
    mentor_id: int,
    mentor: schemas.MentorCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update mentor profile"""
    db_mentor = db.query(models.Mentor).filter(
        models.Mentor.id == mentor_id,
        models.Mentor.user_id == current_user.id
    ).first()
    
    if not db_mentor:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    
    # Update fields
    for key, value in mentor.dict().items():
        setattr(db_mentor, key, value)
    
    db.commit()
    db.refresh(db_mentor)
    return db_mentor
