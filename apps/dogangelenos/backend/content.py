from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import json

from database import (
    get_db,
    AboutContentModel,
    ClassModel,
    PackageModel
)

router = APIRouter(prefix="/api/content", tags=["content"])

# Pydantic Models
class AboutContent(BaseModel):
    heroTitle: str
    heroSubtitle: str
    introduction: str
    mission: str

class ClassItem(BaseModel):
    id: Optional[int] = None
    name: str
    icon: str
    description: str
    price: str
    duration: str
    color: str
    featured: Optional[bool] = False

class PackageItem(BaseModel):
    id: Optional[int] = None
    icon: str
    title: str
    subtitle: str
    price: str
    description: str
    features: List[str]
    experience: str
    color: str
    featured: Optional[bool] = False

# About Content Endpoints
@router.get("/about")
def get_about_content(db: Session = Depends(get_db)):
    """Get about page content"""
    content = db.query(AboutContentModel).first()
    
    if not content:
        # Create default content if none exists
        default_content = AboutContentModel(
            hero_title="🌴🐾 Who We Are",
            hero_subtitle="The Dogangelenos Standard",
            introduction="Welcome to Dogangelenos, where elevated living meets exceptional dog training. In a city known for its lifestyle, culture, and high standards, we believe your dog's training should reflect the same level of intention and quality.",
            mission="Your dog deserves a calm, confident, and joyful life— and you deserve a training experience that feels effortless, personalized, and luxe."
        )
        db.add(default_content)
        db.commit()
        db.refresh(default_content)
        content = default_content
    
    return {
        "heroTitle": content.hero_title,
        "heroSubtitle": content.hero_subtitle,
        "introduction": content.introduction,
        "mission": content.mission
    }

@router.put("/about")
def update_about_content(data: AboutContent, db: Session = Depends(get_db)):
    """Update about page content"""
    content = db.query(AboutContentModel).first()
    
    if not content:
        content = AboutContentModel(
            hero_title=data.heroTitle,
            hero_subtitle=data.heroSubtitle,
            introduction=data.introduction,
            mission=data.mission
        )
        db.add(content)
    else:
        content.hero_title = data.heroTitle
        content.hero_subtitle = data.heroSubtitle
        content.introduction = data.introduction
        content.mission = data.mission
    
    db.commit()
    db.refresh(content)
    
    return {
        "heroTitle": content.hero_title,
        "heroSubtitle": content.hero_subtitle,
        "introduction": content.introduction,
        "mission": content.mission
    }

# Classes Endpoints
@router.get("/classes", response_model=List[ClassItem])
def get_classes(db: Session = Depends(get_db)):
    """Get all training classes"""
    classes = db.query(ClassModel).order_by(ClassModel.order, ClassModel.id).all()
    
    if not classes:
        # Create default classes
        default_classes = [
            ClassModel(
                name="Puppy Training",
                icon="🐶",
                description="Ages 8 weeks - 6 months. Foundation skills, socialization, and potty training.",
                price="$199",
                duration="6 weeks",
                color="from-blue-400 to-blue-600",
                featured=False,
                order=1
            ),
            ClassModel(
                name="Basic Obedience",
                icon="🦮",
                description="Sit, stay, come, heel, and leash manners. Perfect for all ages.",
                price="$249",
                duration="6 weeks",
                color="from-pink-400 to-pink-600",
                featured=True,
                order=2
            ),
            ClassModel(
                name="Advanced Training",
                icon="🏆",
                description="Off-leash control, complex commands, and behavioral refinement.",
                price="$349",
                duration="8 weeks",
                color="from-purple-400 to-purple-600",
                featured=False,
                order=3
            )
        ]
        for cls in default_classes:
            db.add(cls)
        db.commit()
        classes = default_classes
    
    return [
        ClassItem(
            id=cls.id,
            name=cls.name,
            icon=cls.icon,
            description=cls.description,
            price=cls.price,
            duration=cls.duration,
            color=cls.color,
            featured=cls.featured
        )
        for cls in classes
    ]

@router.post("/classes", response_model=ClassItem)
def create_class(data: ClassItem, db: Session = Depends(get_db)):
    """Create a new training class"""
    max_order = db.query(ClassModel).count()
    
    new_class = ClassModel(
        name=data.name,
        icon=data.icon,
        description=data.description,
        price=data.price,
        duration=data.duration,
        color=data.color,
        featured=data.featured or False,
        order=max_order + 1
    )
    
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    
    return ClassItem(
        id=new_class.id,
        name=new_class.name,
        icon=new_class.icon,
        description=new_class.description,
        price=new_class.price,
        duration=new_class.duration,
        color=new_class.color,
        featured=new_class.featured
    )

@router.put("/classes/{class_id}", response_model=ClassItem)
def update_class(class_id: int, data: ClassItem, db: Session = Depends(get_db)):
    """Update a training class"""
    cls = db.query(ClassModel).filter(ClassModel.id == class_id).first()
    
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    
    cls.name = data.name
    cls.icon = data.icon
    cls.description = data.description
    cls.price = data.price
    cls.duration = data.duration
    cls.color = data.color
    cls.featured = data.featured or False
    
    db.commit()
    db.refresh(cls)
    
    return ClassItem(
        id=cls.id,
        name=cls.name,
        icon=cls.icon,
        description=cls.description,
        price=cls.price,
        duration=cls.duration,
        color=cls.color,
        featured=cls.featured
    )

@router.delete("/classes/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db)):
    """Delete a training class"""
    cls = db.query(ClassModel).filter(ClassModel.id == class_id).first()
    
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    
    db.delete(cls)
    db.commit()
    
    return {"message": "Class deleted successfully"}

# Packages Endpoints
@router.get("/packages", response_model=List[PackageItem])
def get_packages(db: Session = Depends(get_db)):
    """Get all training packages"""
    packages = db.query(PackageModel).order_by(PackageModel.order, PackageModel.id).all()
    
    if not packages:
        # Create default packages
        default_packages = [
            PackageModel(
                icon="🐾",
                title="Puppy Training Package",
                subtitle="6 Sessions — First Session Complimentary",
                price="$1,199",
                description="A curated, foundational program designed to give your puppy the strongest start in life. Perfect for LA families who want confidence, structure, and early socialization in a calm, luxury-level experience.",
                features=json.dumps([
                    "Foundational Obedience - Sit, stay, come, down",
                    "Premium Socialization Experiences",
                    "Potty Training Mastery",
                    "Early Leash Manners",
                    "Puppy Behavior Solutions",
                    "Owner Coaching & Lifestyle Alignment"
                ]),
                experience="A luxury onboarding into dog parenthood — building the foundation for a well-balanced, well-mannered future adult dog.",
                color="from-blue-500 to-cyan-500",
                featured=False,
                order=1
            ),
            PackageModel(
                icon="🐶",
                title="Basic Obedience Training",
                subtitle="8 Sessions — First Session Complimentary",
                price="$1,599",
                description="Our signature obedience program for dogs ready to elevate their manners and master the fundamentals. Ideal for busy LA households seeking clarity, structure, and predictable behavior.",
                features=json.dumps([
                    "Core Obedience Commands",
                    "Refined Leash Walking",
                    "Focus & Engagement Training",
                    "Behavioral Corrections",
                    "Stay, Wait & Patience Work",
                    "Reliable Recall",
                    "Owner Training & Reinforcement Systems"
                ]),
                experience="A polished obedience foundation — perfect for dogs aspiring toward advanced work or simply better everyday manners.",
                color="from-pink-500 to-purple-500",
                featured=True,
                order=2
            ),
            PackageModel(
                icon="🔧",
                title="Behavior Modification Program",
                subtitle="Fully Customized • Duration Varies by Complexity",
                price="Starting at $2,499",
                description="A high-touch, expert-led program designed for dogs experiencing anxiety, reactivity, fear, or more complex behavioral challenges. Ideal for owners seeking deep transformation guided by our elite behavior specialists.",
                features=json.dumps([
                    "Comprehensive Behavioral Assessment",
                    "Personalized Behavior Plan",
                    "Desensitization & Counterconditioning",
                    "Positive Reinforcement Strategies",
                    "Targeted Behavioral Exercises",
                    "Owner Coaching & Home Protocols",
                    "Ongoing Adjustments & Follow-Up"
                ]),
                experience="A premium, concierge-level transformation program rooted in behavioral science and delivered with exceptional care.",
                color="from-purple-500 to-indigo-500",
                featured=False,
                order=3
            )
        ]
        for pkg in default_packages:
            db.add(pkg)
        db.commit()
        packages = default_packages
    
    return [
        PackageItem(
            id=pkg.id,
            icon=pkg.icon,
            title=pkg.title,
            subtitle=pkg.subtitle,
            price=pkg.price,
            description=pkg.description,
            features=json.loads(pkg.features),
            experience=pkg.experience,
            color=pkg.color,
            featured=pkg.featured
        )
        for pkg in packages
    ]

@router.post("/packages", response_model=PackageItem)
def create_package(data: PackageItem, db: Session = Depends(get_db)):
    """Create a new training package"""
    max_order = db.query(PackageModel).count()
    
    new_package = PackageModel(
        icon=data.icon,
        title=data.title,
        subtitle=data.subtitle,
        price=data.price,
        description=data.description,
        features=json.dumps(data.features),
        experience=data.experience,
        color=data.color,
        featured=data.featured or False,
        order=max_order + 1
    )
    
    db.add(new_package)
    db.commit()
    db.refresh(new_package)
    
    return PackageItem(
        id=new_package.id,
        icon=new_package.icon,
        title=new_package.title,
        subtitle=new_package.subtitle,
        price=new_package.price,
        description=new_package.description,
        features=json.loads(new_package.features),
        experience=new_package.experience,
        color=new_package.color,
        featured=new_package.featured
    )

@router.put("/packages/{package_id}", response_model=PackageItem)
def update_package(package_id: int, data: PackageItem, db: Session = Depends(get_db)):
    """Update a training package"""
    pkg = db.query(PackageModel).filter(PackageModel.id == package_id).first()
    
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    
    pkg.icon = data.icon
    pkg.title = data.title
    pkg.subtitle = data.subtitle
    pkg.price = data.price
    pkg.description = data.description
    pkg.features = json.dumps(data.features)
    pkg.experience = data.experience
    pkg.color = data.color
    pkg.featured = data.featured or False
    
    db.commit()
    db.refresh(pkg)
    
    return PackageItem(
        id=pkg.id,
        icon=pkg.icon,
        title=pkg.title,
        subtitle=pkg.subtitle,
        price=pkg.price,
        description=pkg.description,
        features=json.loads(pkg.features),
        experience=pkg.experience,
        color=pkg.color,
        featured=pkg.featured
    )

@router.delete("/packages/{package_id}")
def delete_package(package_id: int, db: Session = Depends(get_db)):
    """Delete a training package"""
    pkg = db.query(PackageModel).filter(PackageModel.id == package_id).first()
    
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    
    db.delete(pkg)
    db.commit()
    
    return {"message": "Package deleted successfully"}
