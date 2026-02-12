"""Package endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app import models
from app.api.auth import get_current_user
from pydantic import BaseModel, ValidationError
import json
import traceback

router = APIRouter()


class PackageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    sessions_count: int
    price: float
    features: Optional[List[str]] = None
    is_popular: bool = False
    chat_weeks: int = 0
    mentor_id: Optional[int] = None  # None for global packages


class PackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sessions_count: Optional[int] = None
    price: Optional[float] = None
    features: Optional[List[str]] = None
    is_popular: Optional[bool] = None
    is_active: Optional[bool] = None
    chat_weeks: Optional[int] = None


class PackageResponse(BaseModel):
    id: int
    mentor_id: Optional[int]
    name: str
    description: Optional[str]
    sessions_count: int
    price: float
    features: List[str]
    is_popular: bool
    is_active: bool
    chat_weeks: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[PackageResponse])
def get_packages(
    mentor_id: Optional[int] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all packages, optionally filtered by mentor"""
    query = db.query(models.Package)
    
    if active_only:
        query = query.filter(models.Package.is_active == True)
    
    if mentor_id is not None:
        # Get packages for specific mentor or global packages (mentor_id is None)
        query = query.filter(
            (models.Package.mentor_id == mentor_id) | (models.Package.mentor_id.is_(None))
        )
    else:
        # Get all packages (both mentor-specific and global)
        pass
    
    packages = query.all()
    
    result = []
    for pkg in packages:
        try:
            features = json.loads(pkg.features) if pkg.features else []
        except (json.JSONDecodeError, TypeError):
            features = []
        result.append({
            "id": pkg.id,
            "mentor_id": pkg.mentor_id,
            "name": pkg.name,
            "description": pkg.description,
            "sessions_count": pkg.sessions_count,
            "price": pkg.price,
            "features": features,
            "is_popular": pkg.is_popular,
            "is_active": pkg.is_active,
            "chat_weeks": pkg.chat_weeks,
            "created_at": pkg.created_at.isoformat() if pkg.created_at else datetime.utcnow().isoformat(),
            "updated_at": pkg.updated_at.isoformat() if pkg.updated_at else datetime.utcnow().isoformat()
        })
    
    return result


@router.get("/{package_id}", response_model=PackageResponse)
def get_package(package_id: int, db: Session = Depends(get_db)):
    """Get a specific package"""
    pkg = db.query(models.Package).filter(models.Package.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    
    try:
        features = json.loads(pkg.features) if pkg.features else []
    except (json.JSONDecodeError, TypeError):
        features = []
    return {
        "id": pkg.id,
        "mentor_id": pkg.mentor_id,
        "name": pkg.name,
        "description": pkg.description,
        "sessions_count": pkg.sessions_count,
        "price": pkg.price,
        "features": features,
        "is_popular": pkg.is_popular,
        "is_active": pkg.is_active,
        "chat_weeks": pkg.chat_weeks,
        "created_at": pkg.created_at.isoformat() if pkg.created_at else datetime.utcnow().isoformat(),
        "updated_at": pkg.updated_at.isoformat() if pkg.updated_at else datetime.utcnow().isoformat()
    }


@router.post("/", response_model=PackageResponse)
def create_package(
    package: PackageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new package"""
    try:
        print(f"Creating package for user: {current_user.username} (ID: {current_user.id})")
        try:
            package_dict = package.model_dump() if hasattr(package, 'model_dump') else package.dict()
        except:
            package_dict = str(package)
        print(f"Package data: {package_dict}")
        # Determine the mentor_id to use
        mentor_id = package.mentor_id
        
        # If mentor_id is provided, verify the user is that mentor or is admin
        if mentor_id:
            mentor = db.query(models.Mentor).filter(models.Mentor.id == mentor_id).first()
            if not mentor:
                raise HTTPException(status_code=404, detail="Mentor not found")
            
            # Check if current user is the mentor or admin
            if mentor.user_id != current_user.id:
                # Check if user is admin (you may need to add admin check)
                # For now, allow if user is mentor
                pass
        
        # If creating a mentor-specific package and no mentor_id provided, get from current user
        if mentor_id is None:
            # Check if user has a mentor profile
            mentor_profile = db.query(models.Mentor).filter(models.Mentor.user_id == current_user.id).first()
            if mentor_profile:
                mentor_id = mentor_profile.id
                print(f"Using mentor_id from user profile: {mentor_id}")
            else:
                print("No mentor_id provided and user has no mentor profile - creating global package")
        
        print(f"Final mentor_id: {mentor_id}")
        
        new_package = models.Package(
            mentor_id=mentor_id,
            name=package.name,
            description=package.description if package.description else None,
            sessions_count=package.sessions_count,
            price=package.price,
            features=json.dumps(package.features) if package.features else None,
            is_popular=package.is_popular,
            chat_weeks=package.chat_weeks
        )
        
        print(f"About to create package: name={new_package.name}, mentor_id={new_package.mentor_id}")
        db.add(new_package)
        db.commit()
        db.refresh(new_package)
        print(f"Package created successfully with ID: {new_package.id}")
        
        try:
            features = json.loads(new_package.features) if new_package.features else []
        except (json.JSONDecodeError, TypeError):
            features = []
        
        response_data = {
            "id": new_package.id,
            "mentor_id": new_package.mentor_id,
            "name": new_package.name,
            "description": new_package.description,
            "sessions_count": new_package.sessions_count,
            "price": new_package.price,
            "features": features,
            "is_popular": new_package.is_popular,
            "is_active": new_package.is_active,
            "chat_weeks": new_package.chat_weeks,
            "created_at": new_package.created_at.isoformat() if new_package.created_at else datetime.utcnow().isoformat(),
            "updated_at": new_package.updated_at.isoformat() if new_package.updated_at else datetime.utcnow().isoformat()
        }
        
        print(f"Returning response: {response_data}")
        return response_data
    except HTTPException:
        raise
    except ValidationError as e:
        db.rollback()
        error_msg = f"Validation error: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=422, detail=error_msg)
    except Exception as e:
        db.rollback()
        error_msg = f"Failed to create package: {str(e)}"
        print(error_msg)
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


@router.put("/{package_id}", response_model=PackageResponse)
def update_package(
    package_id: int,
    package_update: PackageUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a package"""
    try:
        pkg = db.query(models.Package).filter(models.Package.id == package_id).first()
        if not pkg:
            raise HTTPException(status_code=404, detail="Package not found")
        
        # Check if user has permission (is the mentor or admin)
        if pkg.mentor_id:
            mentor = db.query(models.Mentor).filter(models.Mentor.id == pkg.mentor_id).first()
            if mentor and mentor.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to update this package")
        
        # Update fields
        if package_update.name is not None:
            pkg.name = package_update.name
        if package_update.description is not None:
            pkg.description = package_update.description
        if package_update.sessions_count is not None:
            pkg.sessions_count = package_update.sessions_count
        if package_update.price is not None:
            pkg.price = package_update.price
        if package_update.features is not None:
            pkg.features = json.dumps(package_update.features)
        if package_update.is_popular is not None:
            pkg.is_popular = package_update.is_popular
        if package_update.is_active is not None:
            pkg.is_active = package_update.is_active
        if package_update.chat_weeks is not None:
            pkg.chat_weeks = package_update.chat_weeks
        
        db.commit()
        db.refresh(pkg)
        
        try:
            features = json.loads(pkg.features) if pkg.features else []
        except (json.JSONDecodeError, TypeError):
            features = []
        return {
            "id": pkg.id,
            "mentor_id": pkg.mentor_id,
            "name": pkg.name,
            "description": pkg.description,
            "sessions_count": pkg.sessions_count,
            "price": pkg.price,
            "features": features,
            "is_popular": pkg.is_popular,
            "is_active": pkg.is_active,
            "chat_weeks": pkg.chat_weeks,
            "created_at": pkg.created_at.isoformat() if pkg.created_at else datetime.utcnow().isoformat(),
            "updated_at": pkg.updated_at.isoformat() if pkg.updated_at else datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        error_msg = f"Failed to update package: {str(e)}"
        print(error_msg)
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_msg)


@router.delete("/{package_id}")
def delete_package(
    package_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a package (soft delete by setting is_active=False)"""
    try:
        pkg = db.query(models.Package).filter(models.Package.id == package_id).first()
        if not pkg:
            raise HTTPException(status_code=404, detail="Package not found")
        
        # Check if user has permission
        if pkg.mentor_id:
            mentor = db.query(models.Mentor).filter(models.Mentor.id == pkg.mentor_id).first()
            if mentor and mentor.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized to delete this package")
        
        # Soft delete
        pkg.is_active = False
        db.commit()
        
        return {"message": "Package deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        error_msg = f"Failed to delete package: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


@router.get("/mentor/{mentor_id}", response_model=List[PackageResponse])
def get_mentor_packages(mentor_id: int, db: Session = Depends(get_db)):
    """Get all packages for a specific mentor (including global packages)"""
    # Get mentor-specific packages
    mentor_packages = db.query(models.Package).filter(
        models.Package.mentor_id == mentor_id,
        models.Package.is_active == True
    ).all()
    
    # Get global packages (mentor_id is None)
    global_packages = db.query(models.Package).filter(
        models.Package.mentor_id.is_(None),
        models.Package.is_active == True
    ).all()
    
    all_packages = list(mentor_packages) + list(global_packages)
    
    result = []
    for pkg in all_packages:
        try:
            features = json.loads(pkg.features) if pkg.features else []
        except (json.JSONDecodeError, TypeError):
            features = []
        result.append({
            "id": pkg.id,
            "mentor_id": pkg.mentor_id,
            "name": pkg.name,
            "description": pkg.description,
            "sessions_count": pkg.sessions_count,
            "price": pkg.price,
            "features": features,
            "is_popular": pkg.is_popular,
            "is_active": pkg.is_active,
            "chat_weeks": pkg.chat_weeks,
            "created_at": pkg.created_at.isoformat() if pkg.created_at else datetime.utcnow().isoformat(),
            "updated_at": pkg.updated_at.isoformat() if pkg.updated_at else datetime.utcnow().isoformat()
        })
    
    return result
