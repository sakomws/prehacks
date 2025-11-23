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
    """Get user's sessions"""
    sessions = db.query(models.Session).filter(
        models.Session.student_id == current_user.id
    ).all()
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
    
    return {
        **session.__dict__,
        "mentor": {
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
    
    session.status = "completed"
    if notes:
        session.notes = notes
    
    db.commit()
    
    return {"message": "Session completed successfully"}
