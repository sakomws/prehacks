"""Session endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.api.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[schemas.Session])
def get_sessions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's sessions (as student)"""
    sessions = db.query(models.Session).filter(
        models.Session.student_id == current_user.id
    ).all()
    return sessions


@router.get("/mentor", response_model=List[schemas.Session])
def get_mentor_sessions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sessions where current user is the mentor"""
    # Find mentor profile for current user
    mentor = db.query(models.Mentor).filter(
        models.Mentor.user_id == current_user.id
    ).first()
    
    if not mentor:
        return []
    
    # Get all sessions for this mentor
    sessions = db.query(models.Session).filter(
        models.Session.mentor_id == mentor.id
    ).order_by(models.Session.scheduled_at.desc()).all()
    
    return sessions


@router.get("/latest", response_model=schemas.SessionWithMentor)
def get_latest_session(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's most recent session"""
    session = db.query(models.Session).filter(
        models.Session.student_id == current_user.id
    ).order_by(models.Session.created_at.desc()).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="No sessions found")
    
    # Get mentor details
    mentor = db.query(models.Mentor).filter(models.Mentor.id == session.mentor_id).first()
    mentor_user = db.query(models.User).filter(models.User.id == mentor.user_id).first() if mentor else None
    
    return {
        **session.__dict__,
        "mentor": {
            "name": mentor_user.full_name if mentor_user else None,
            "title": mentor.title,
            "expertise": mentor.expertise
        }
    }


@router.get("/{session_id}", response_model=schemas.Session)
def get_session(
    session_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get session by ID"""
    session = db.query(models.Session).filter(
        models.Session.id == session_id,
        models.Session.student_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/", response_model=schemas.Session)
def create_session(
    session: schemas.SessionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Book a session with a mentor"""
    # Get mentor
    mentor = db.query(models.Mentor).filter(models.Mentor.id == session.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    if not mentor.is_available:
        raise HTTPException(status_code=400, detail="Mentor is not available")
    
    # Create session
    db_session = models.Session(
        student_id=current_user.id,
        mentor_id=session.mentor_id,
        title=session.title,
        description=session.description,
        scheduled_at=session.scheduled_at,
        duration_minutes=session.duration_minutes,
        price=mentor.hourly_rate * (session.duration_minutes / 60)
    )
    db.add(db_session)
    
    # Update mentor stats
    mentor.total_sessions += 1
    
    db.commit()
    db.refresh(db_session)
    return db_session


@router.put("/{session_id}/cancel")
def cancel_session(
    session_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a session"""
    session = db.query(models.Session).filter(
        models.Session.id == session_id,
        models.Session.student_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status == "completed":
        raise HTTPException(status_code=400, detail="Cannot cancel completed session")
    
    session.status = "cancelled"
    db.commit()
    
    return {"message": "Session cancelled successfully"}


@router.put("/{session_id}/complete")
def complete_session(
    session_id: int,
    notes: str = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark session as completed"""
    session = db.query(models.Session).filter(
        models.Session.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if user is the mentor
    mentor = db.query(models.Mentor).filter(
        models.Mentor.id == session.mentor_id,
        models.Mentor.user_id == current_user.id
    ).first()
    
    if not mentor:
        raise HTTPException(status_code=403, detail="Only the mentor can complete the session")
    
    if session.status == "completed":
        raise HTTPException(status_code=400, detail="Session already completed")
    
    session.status = "completed"
    if notes:
        session.notes = notes
    
    # Increment mentor's total_sessions count
    mentor.total_sessions += 1
    
    db.commit()
    
    return {
        "message": "Session completed successfully",
        "total_sessions": mentor.total_sessions
    }


@router.put("/{session_id}/rate")
def rate_session(
    session_id: int,
    rating: float,
    review: str = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rate a completed session"""
    # Validate rating
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Get session
    session = db.query(models.Session).filter(
        models.Session.id == session_id,
        models.Session.student_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status != "completed":
        raise HTTPException(status_code=400, detail="Can only rate completed sessions")
    
    if session.rating is not None:
        raise HTTPException(status_code=400, detail="Session already rated")
    
    # Update session rating
    session.rating = rating
    session.review = review
    
    # Update mentor's average rating
    mentor = db.query(models.Mentor).filter(
        models.Mentor.id == session.mentor_id
    ).first()
    
    if mentor:
        # Calculate new average rating
        rated_sessions = db.query(models.Session).filter(
            models.Session.mentor_id == mentor.id,
            models.Session.rating.isnot(None)
        ).all()
        
        total_rating = sum(s.rating for s in rated_sessions) + rating
        total_count = len(rated_sessions) + 1
        mentor.rating = round(total_rating / total_count, 1)
    
    db.commit()
    
    return {
        "message": "Rating submitted successfully",
        "rating": rating,
        "mentor_rating": mentor.rating if mentor else None
    }
