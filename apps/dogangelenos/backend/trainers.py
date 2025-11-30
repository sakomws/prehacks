from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from database import get_db, TrainerModel
from datetime import datetime
import json

router = APIRouter(prefix="/api/trainers", tags=["trainers"])

class TrainerCreate(BaseModel):
    name: str
    title: str
    bio: str
    specialties: List[str]
    experience: str
    certifications: List[str]
    image: str
    availability: str
    is_active: bool = True
    order: int = 0

class TrainerUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    specialties: Optional[List[str]] = None
    experience: Optional[str] = None
    certifications: Optional[List[str]] = None
    image: Optional[str] = None
    availability: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

class Trainer(BaseModel):
    id: int
    name: str
    title: str
    bio: str
    specialties: List[str]
    experience: str
    certifications: List[str]
    image: str
    availability: str
    is_active: bool
    order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[Trainer])
def get_trainers(active_only: bool = True, db: Session = Depends(get_db)):
    """Get all trainers"""
    query = db.query(TrainerModel)
    if active_only:
        query = query.filter(TrainerModel.is_active == True)
    trainers = query.order_by(TrainerModel.order).all()
    
    return [
        Trainer(
            id=t.id,
            name=t.name,
            title=t.title,
            bio=t.bio,
            specialties=json.loads(t.specialties),
            experience=t.experience,
            certifications=json.loads(t.certifications),
            image=t.image,
            availability=t.availability,
            is_active=t.is_active,
            order=t.order,
            created_at=t.created_at,
            updated_at=t.updated_at
        )
        for t in trainers
    ]

@router.get("/{trainer_id}", response_model=Trainer)
def get_trainer(trainer_id: int, db: Session = Depends(get_db)):
    """Get a specific trainer by ID"""
    trainer = db.query(TrainerModel).filter(TrainerModel.id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    return Trainer(
        id=trainer.id,
        name=trainer.name,
        title=trainer.title,
        bio=trainer.bio,
        specialties=json.loads(trainer.specialties),
        experience=trainer.experience,
        certifications=json.loads(trainer.certifications),
        image=trainer.image,
        availability=trainer.availability,
        is_active=trainer.is_active,
        order=trainer.order,
        created_at=trainer.created_at,
        updated_at=trainer.updated_at
    )

@router.post("", response_model=Trainer)
def create_trainer(trainer: TrainerCreate, db: Session = Depends(get_db)):
    """Create a new trainer"""
    db_trainer = TrainerModel(
        name=trainer.name,
        title=trainer.title,
        bio=trainer.bio,
        specialties=json.dumps(trainer.specialties),
        experience=trainer.experience,
        certifications=json.dumps(trainer.certifications),
        image=trainer.image,
        availability=trainer.availability,
        is_active=trainer.is_active,
        order=trainer.order
    )
    db.add(db_trainer)
    db.commit()
    db.refresh(db_trainer)
    
    return Trainer(
        id=db_trainer.id,
        name=db_trainer.name,
        title=db_trainer.title,
        bio=db_trainer.bio,
        specialties=json.loads(db_trainer.specialties),
        experience=db_trainer.experience,
        certifications=json.loads(db_trainer.certifications),
        image=db_trainer.image,
        availability=db_trainer.availability,
        is_active=db_trainer.is_active,
        order=db_trainer.order,
        created_at=db_trainer.created_at,
        updated_at=db_trainer.updated_at
    )

@router.put("/{trainer_id}", response_model=Trainer)
def update_trainer(trainer_id: int, trainer: TrainerUpdate, db: Session = Depends(get_db)):
    """Update a trainer"""
    db_trainer = db.query(TrainerModel).filter(TrainerModel.id == trainer_id).first()
    if not db_trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    update_data = trainer.dict(exclude_unset=True)
    
    # Convert lists to JSON strings
    if "specialties" in update_data:
        update_data["specialties"] = json.dumps(update_data["specialties"])
    if "certifications" in update_data:
        update_data["certifications"] = json.dumps(update_data["certifications"])
    
    for key, value in update_data.items():
        setattr(db_trainer, key, value)
    
    db_trainer.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_trainer)
    
    return Trainer(
        id=db_trainer.id,
        name=db_trainer.name,
        title=db_trainer.title,
        bio=db_trainer.bio,
        specialties=json.loads(db_trainer.specialties),
        experience=db_trainer.experience,
        certifications=json.loads(db_trainer.certifications),
        image=db_trainer.image,
        availability=db_trainer.availability,
        is_active=db_trainer.is_active,
        order=db_trainer.order,
        created_at=db_trainer.created_at,
        updated_at=db_trainer.updated_at
    )

@router.delete("/{trainer_id}")
def delete_trainer(trainer_id: int, db: Session = Depends(get_db)):
    """Delete a trainer"""
    db_trainer = db.query(TrainerModel).filter(TrainerModel.id == trainer_id).first()
    if not db_trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    db.delete(db_trainer)
    db.commit()
    
    return {"success": True, "message": "Trainer deleted successfully"}

@router.post("/seed")
def seed_trainers(db: Session = Depends(get_db)):
    """Seed database with default trainers"""
    default_trainers = [
        {
            "name": "Sarah Martinez",
            "title": "Lead Trainer & Behavior Specialist",
            "bio": "With over 15 years of experience, Sarah specializes in positive reinforcement training and behavioral modification. She's worked with hundreds of Los Angeles families to transform their dogs into well-mannered companions.",
            "specialties": ["Puppy Training", "Behavioral Issues", "Obedience", "Socialization"],
            "experience": "15+ years",
            "certifications": ["CPDT-KA", "CBCC-KA", "AKC CGC Evaluator"],
            "image": "👩‍🏫",
            "availability": "Mon-Fri",
            "is_active": True,
            "order": 1
        },
        {
            "name": "Michael Chen",
            "title": "Advanced Obedience Trainer",
            "bio": "Michael brings a unique blend of traditional and modern training techniques. His expertise in off-leash training and advanced commands has made him a favorite among Los Angeles dog owners seeking elite results.",
            "specialties": ["Advanced Training", "Off-Leash Control", "Competition Prep", "Agility"],
            "experience": "12+ years",
            "certifications": ["CPDT-KA", "KPA CTP", "AKC Canine Good Citizen"],
            "image": "👨‍🏫",
            "availability": "Tue-Sat",
            "is_active": True,
            "order": 2
        },
        {
            "name": "Jessica Rodriguez",
            "title": "Puppy Development Specialist",
            "bio": "Jessica's passion for early development training has helped countless puppies in Los Angeles get the perfect start. Her gentle, patient approach creates confident, well-adjusted adult dogs.",
            "specialties": ["Puppy Training", "Early Socialization", "Potty Training", "Basic Manners"],
            "experience": "10+ years",
            "certifications": ["CPDT-KA", "Fear Free Certified", "Puppy Start Right Instructor"],
            "image": "👩‍⚕️",
            "availability": "Mon-Thu",
            "is_active": True,
            "order": 3
        },
        {
            "name": "David Thompson",
            "title": "Reactive Dog Specialist",
            "bio": "David specializes in helping reactive and fearful dogs overcome their challenges. His calm, methodical approach has transformed even the most difficult cases into confident, happy companions.",
            "specialties": ["Reactive Dogs", "Fear & Anxiety", "Aggression", "Behavior Modification"],
            "experience": "18+ years",
            "certifications": ["CPDT-KA", "CBCC-KA", "IAABC Certified"],
            "image": "👨‍⚕️",
            "availability": "Wed-Sun",
            "is_active": True,
            "order": 4
        }
    ]
    
    # Clear existing trainers
    db.query(TrainerModel).delete()
    
    # Add default trainers
    for trainer_data in default_trainers:
        db_trainer = TrainerModel(
            name=trainer_data["name"],
            title=trainer_data["title"],
            bio=trainer_data["bio"],
            specialties=json.dumps(trainer_data["specialties"]),
            experience=trainer_data["experience"],
            certifications=json.dumps(trainer_data["certifications"]),
            image=trainer_data["image"],
            availability=trainer_data["availability"],
            is_active=trainer_data["is_active"],
            order=trainer_data["order"]
        )
        db.add(db_trainer)
    
    db.commit()
    
    return {"success": True, "message": f"Seeded {len(default_trainers)} trainers"}
