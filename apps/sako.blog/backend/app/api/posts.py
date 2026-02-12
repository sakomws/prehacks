"""Blog posts API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.Post])
def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    published: Optional[bool] = None,
    category_id: Optional[int] = None,
    tag_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all posts with optional filtering"""
    query = db.query(models.Post)
    
    if published is not None:
        query = query.filter(models.Post.published == published)
    
    if category_id:
        query = query.filter(models.Post.category_id == category_id)
    
    if tag_id:
        query = query.join(models.post_tags).filter(models.post_tags.c.tag_id == tag_id)
    
    posts = query.order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts


@router.get("/{post_id}", response_model=schemas.Post)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get a single post by ID"""
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("/slug/{slug}", response_model=schemas.Post)
def get_post_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get a post by slug"""
    post = db.query(models.Post).filter(models.Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/", response_model=schemas.Post, status_code=201)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db)):
    """Create a new post"""
    # Check if slug already exists
    existing = db.query(models.Post).filter(models.Post.slug == post.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Post with this slug already exists")
    
    # Create post
    db_post = models.Post(**post.dict(exclude={"tag_ids"}))
    db.add(db_post)
    db.flush()
    
    # Add tags
    if post.tag_ids:
        for tag_id in post.tag_ids:
            db_tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
            if db_tag:
                db_post.tags.append(db_tag)
    
    db.commit()
    db.refresh(db_post)
    return db_post


@router.put("/{post_id}", response_model=schemas.Post)
def update_post(post_id: int, post: schemas.PostUpdate, db: Session = Depends(get_db)):
    """Update a post"""
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Update fields
    update_data = post.dict(exclude_unset=True, exclude={"tag_ids"})
    for field, value in update_data.items():
        setattr(db_post, field, value)
    
    # Update tags if provided
    if post.tag_ids is not None:
        db_post.tags.clear()
        for tag_id in post.tag_ids:
            db_tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
            if db_tag:
                db_post.tags.append(db_tag)
    
    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/{post_id}", status_code=204)
def delete_post(post_id: int, db: Session = Depends(get_db)):
    """Delete a post"""
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db.delete(db_post)
    db.commit()
    return None

