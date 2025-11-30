from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import json

from database import (
    get_db,
    NewsletterSubscriberModel,
    NewsletterModel
)

router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])

# Pydantic Models
class SubscriberCreate(BaseModel):
    email: EmailStr

class SubscriberPreferences(BaseModel):
    trainingTips: bool = True
    events: bool = True
    specialOffers: bool = True
    communityNews: bool = True
    productReviews: bool = False

class SubscriberUpdate(BaseModel):
    email: EmailStr
    preferences: SubscriberPreferences
    is_active: bool = True

class NewsletterItem(BaseModel):
    id: Optional[int] = None
    title: str
    excerpt: str
    content: str
    image: str
    topics: List[str]
    published_date: Optional[datetime] = None
    is_published: bool = True

class NewsletterResponse(BaseModel):
    id: int
    title: str
    excerpt: str
    content: str
    image: str
    topics: List[str]
    date: str
    is_published: bool

# Subscriber Endpoints
@router.post("/subscribe")
def subscribe(data: SubscriberCreate, db: Session = Depends(get_db)):
    """Subscribe to newsletter"""
    # Check if already subscribed
    existing = db.query(NewsletterSubscriberModel).filter(
        NewsletterSubscriberModel.email == data.email
    ).first()
    
    if existing:
        if existing.is_active:
            return {"message": "Already subscribed", "email": data.email}
        else:
            # Reactivate subscription
            existing.is_active = True
            db.commit()
            return {"message": "Subscription reactivated", "email": data.email}
    
    # Create new subscriber
    subscriber = NewsletterSubscriberModel(
        email=data.email,
        is_active=True,
        preferences=json.dumps({
            "trainingTips": True,
            "events": True,
            "specialOffers": True,
            "communityNews": True,
            "productReviews": False
        })
    )
    
    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)
    
    return {"message": "Successfully subscribed", "email": data.email}

@router.get("/subscribers")
def get_subscribers(db: Session = Depends(get_db)):
    """Get all subscribers (admin only)"""
    subscribers = db.query(NewsletterSubscriberModel).all()
    
    return [
        {
            "id": sub.id,
            "email": sub.email,
            "subscribed_at": sub.subscribed_at.isoformat() if sub.subscribed_at else None,
            "is_active": sub.is_active,
            "preferences": json.loads(sub.preferences) if sub.preferences else {}
        }
        for sub in subscribers
    ]

@router.get("/subscribers/count")
def get_subscriber_count(db: Session = Depends(get_db)):
    """Get total subscriber count"""
    active_count = db.query(NewsletterSubscriberModel).filter(
        NewsletterSubscriberModel.is_active == True
    ).count()
    
    total_count = db.query(NewsletterSubscriberModel).count()
    
    return {
        "active": active_count,
        "total": total_count
    }

@router.put("/preferences")
def update_preferences(data: SubscriberUpdate, db: Session = Depends(get_db)):
    """Update subscriber preferences"""
    subscriber = db.query(NewsletterSubscriberModel).filter(
        NewsletterSubscriberModel.email == data.email
    ).first()
    
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    subscriber.preferences = json.dumps(data.preferences.dict())
    subscriber.is_active = data.is_active
    
    db.commit()
    db.refresh(subscriber)
    
    return {
        "message": "Preferences updated",
        "email": subscriber.email,
        "preferences": json.loads(subscriber.preferences)
    }

@router.delete("/unsubscribe/{email}")
def unsubscribe(email: str, db: Session = Depends(get_db)):
    """Unsubscribe from newsletter"""
    subscriber = db.query(NewsletterSubscriberModel).filter(
        NewsletterSubscriberModel.email == email
    ).first()
    
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    subscriber.is_active = False
    db.commit()
    
    return {"message": "Successfully unsubscribed", "email": email}

# Newsletter Content Endpoints
@router.get("/archive", response_model=List[NewsletterResponse])
def get_newsletters(db: Session = Depends(get_db)):
    """Get all published newsletters"""
    newsletters = db.query(NewsletterModel).filter(
        NewsletterModel.is_published == True
    ).order_by(NewsletterModel.published_date.desc()).all()
    
    if not newsletters:
        # Create default newsletters
        default_newsletters = [
            NewsletterModel(
                title="Top 5 Training Tips for LA Dog Owners",
                excerpt="Discover the most effective training techniques specifically designed for urban dogs in Los Angeles...",
                content="Full content of the newsletter goes here...",
                image="🎓",
                topics=json.dumps(["Training", "Tips", "Urban Dogs"]),
                published_date=datetime(2024, 12, 1),
                is_published=True
            ),
            NewsletterModel(
                title="Holiday Safety Guide for Your Pup",
                excerpt="Keep your furry friend safe during the holiday season with these essential tips and precautions...",
                content="Full content of the newsletter goes here...",
                image="🎄",
                topics=json.dumps(["Safety", "Holidays", "Health"]),
                published_date=datetime(2024, 11, 15),
                is_published=True
            ),
            NewsletterModel(
                title="Best Dog Parks in Los Angeles 2024",
                excerpt="Explore the top-rated dog parks across LA, from Griffith Park to Santa Monica Beach...",
                content="Full content of the newsletter goes here...",
                image="🏞️",
                topics=json.dumps(["Parks", "LA Guide", "Recreation"]),
                published_date=datetime(2024, 11, 1),
                is_published=True
            ),
            NewsletterModel(
                title="Puppy Socialization Success Stories",
                excerpt="Read inspiring stories from our community about successful puppy socialization journeys...",
                content="Full content of the newsletter goes here...",
                image="🐶",
                topics=json.dumps(["Puppies", "Success Stories", "Community"]),
                published_date=datetime(2024, 10, 15),
                is_published=True
            )
        ]
        
        for newsletter in default_newsletters:
            db.add(newsletter)
        db.commit()
        newsletters = default_newsletters
    
    return [
        NewsletterResponse(
            id=n.id,
            title=n.title,
            excerpt=n.excerpt,
            content=n.content,
            image=n.image,
            topics=json.loads(n.topics),
            date=n.published_date.strftime("%B %d, %Y") if n.published_date else "",
            is_published=n.is_published
        )
        for n in newsletters
    ]

@router.get("/{newsletter_id}")
def get_newsletter(newsletter_id: int, db: Session = Depends(get_db)):
    """Get a specific newsletter"""
    newsletter = db.query(NewsletterModel).filter(
        NewsletterModel.id == newsletter_id
    ).first()
    
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    
    return NewsletterResponse(
        id=newsletter.id,
        title=newsletter.title,
        excerpt=newsletter.excerpt,
        content=newsletter.content,
        image=newsletter.image,
        topics=json.loads(newsletter.topics),
        date=newsletter.published_date.strftime("%B %d, %Y") if newsletter.published_date else "",
        is_published=newsletter.is_published
    )

@router.post("/create")
def create_newsletter(data: NewsletterItem, db: Session = Depends(get_db)):
    """Create a new newsletter (admin only)"""
    newsletter = NewsletterModel(
        title=data.title,
        excerpt=data.excerpt,
        content=data.content,
        image=data.image,
        topics=json.dumps(data.topics),
        published_date=data.published_date or datetime.utcnow(),
        is_published=data.is_published
    )
    
    db.add(newsletter)
    db.commit()
    db.refresh(newsletter)
    
    return NewsletterResponse(
        id=newsletter.id,
        title=newsletter.title,
        excerpt=newsletter.excerpt,
        content=newsletter.content,
        image=newsletter.image,
        topics=json.loads(newsletter.topics),
        date=newsletter.published_date.strftime("%B %d, %Y") if newsletter.published_date else "",
        is_published=newsletter.is_published
    )

@router.put("/{newsletter_id}")
def update_newsletter(newsletter_id: int, data: NewsletterItem, db: Session = Depends(get_db)):
    """Update a newsletter (admin only)"""
    newsletter = db.query(NewsletterModel).filter(
        NewsletterModel.id == newsletter_id
    ).first()
    
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    
    newsletter.title = data.title
    newsletter.excerpt = data.excerpt
    newsletter.content = data.content
    newsletter.image = data.image
    newsletter.topics = json.dumps(data.topics)
    newsletter.is_published = data.is_published
    
    if data.published_date:
        newsletter.published_date = data.published_date
    
    db.commit()
    db.refresh(newsletter)
    
    return NewsletterResponse(
        id=newsletter.id,
        title=newsletter.title,
        excerpt=newsletter.excerpt,
        content=newsletter.content,
        image=newsletter.image,
        topics=json.loads(newsletter.topics),
        date=newsletter.published_date.strftime("%B %d, %Y") if newsletter.published_date else "",
        is_published=newsletter.is_published
    )

@router.delete("/{newsletter_id}")
def delete_newsletter(newsletter_id: int, db: Session = Depends(get_db)):
    """Delete a newsletter (admin only)"""
    newsletter = db.query(NewsletterModel).filter(
        NewsletterModel.id == newsletter_id
    ).first()
    
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    
    db.delete(newsletter)
    db.commit()
    
    return {"message": "Newsletter deleted successfully"}
