"""Roadmap endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.api.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[schemas.Roadmap])
def get_roadmaps(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's roadmaps"""
    roadmaps = db.query(models.Roadmap).filter(
        models.Roadmap.user_id == current_user.id
    ).all()
    return roadmaps


@router.get("/{roadmap_id}", response_model=schemas.Roadmap)
def get_roadmap(
    roadmap_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get roadmap by ID"""
    roadmap = db.query(models.Roadmap).filter(
        models.Roadmap.id == roadmap_id,
        models.Roadmap.user_id == current_user.id
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


@router.post("/", response_model=schemas.Roadmap)
def create_roadmap(
    roadmap: schemas.RoadmapCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new roadmap"""
    db_roadmap = models.Roadmap(
        user_id=current_user.id,
        title=roadmap.title,
        description=roadmap.description,
        target_company=roadmap.target_company,
        target_role=roadmap.target_role,
        milestones=roadmap.milestones
    )
    db.add(db_roadmap)
    db.commit()
    db.refresh(db_roadmap)
    return db_roadmap


@router.put("/{roadmap_id}", response_model=schemas.Roadmap)
def update_roadmap(
    roadmap_id: int,
    roadmap: schemas.RoadmapCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a roadmap"""
    db_roadmap = db.query(models.Roadmap).filter(
        models.Roadmap.id == roadmap_id,
        models.Roadmap.user_id == current_user.id
    ).first()
    
    if not db_roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Update fields
    for key, value in roadmap.dict().items():
        setattr(db_roadmap, key, value)
    
    db.commit()
    db.refresh(db_roadmap)
    return db_roadmap


@router.put("/{roadmap_id}/progress")
def update_progress(
    roadmap_id: int,
    progress: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update roadmap progress"""
    db_roadmap = db.query(models.Roadmap).filter(
        models.Roadmap.id == roadmap_id,
        models.Roadmap.user_id == current_user.id
    ).first()
    
    if not db_roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    if progress < 0 or progress > 100:
        raise HTTPException(status_code=400, detail="Progress must be between 0 and 100")
    
    db_roadmap.progress = progress
    db.commit()
    
    return {"message": "Progress updated successfully", "progress": progress}


@router.put("/{roadmap_id}/milestones")
def update_milestones(
    roadmap_id: int,
    milestones: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update roadmap milestones (checklist)"""
    db_roadmap = db.query(models.Roadmap).filter(
        models.Roadmap.id == roadmap_id,
        models.Roadmap.user_id == current_user.id
    ).first()
    
    if not db_roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    db_roadmap.milestones = milestones
    db.commit()
    
    return {"message": "Milestones updated successfully", "milestones": milestones}


@router.delete("/{roadmap_id}")
def delete_roadmap(
    roadmap_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a roadmap"""
    db_roadmap = db.query(models.Roadmap).filter(
        models.Roadmap.id == roadmap_id,
        models.Roadmap.user_id == current_user.id
    ).first()
    
    if not db_roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    db.delete(db_roadmap)
    db.commit()
    
    return {"message": "Roadmap deleted successfully"}
