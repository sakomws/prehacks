from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.auth import AuthService
from app.models.user import User
from app.models.community import Discussion, Comment
from app.schemas.community import Discussion as DiscussionSchema, DiscussionCreate, Comment as CommentSchema, CommentCreate
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger("community")

@router.get("/threads")
async def get_threads(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve discussion threads.
    Public endpoint - no authentication required.
    """
    threads = db.query(Discussion).order_by(Discussion.created_at.desc()).offset(skip).limit(limit).all()
    # Convert to response format
    result = []
    for thread in threads:
        thread_dict = {
            "id": str(thread.id),
            "title": thread.title,
            "content": thread.content,
            "category": thread.category,
            "created_at": thread.created_at.isoformat() if thread.created_at else None,
            "author": {
                "id": str(thread.author_id),
                "display_name": thread.author.display_name if thread.author else "Anonymous",
            } if thread.author else None,
            "comments": [
                {
                    "id": str(c.id),
                    "content": c.content,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                    "author": {
                        "id": str(c.author_id),
                        "display_name": c.author.display_name if c.author else "Anonymous",
                    } if c.author else None,
                }
                for c in (thread.comments or [])
            ] if hasattr(thread, 'comments') else [],
        }
        result.append(thread_dict)
    return result

@router.post("/threads")
async def create_thread(
    thread_data: DiscussionCreate,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Create new discussion thread.
    Requires authentication.
    """
    thread = Discussion(
        title=thread_data.title,
        content=thread_data.content,
        author_id=current_user.id,
        category=getattr(thread_data, 'category', 'general'),
    )
    db.add(thread)
    db.commit()
    db.refresh(thread)
    logger.info("Thread created", thread_id=str(thread.id), user_id=str(current_user.id))
    return {
        "id": str(thread.id),
        "title": thread.title,
        "content": thread.content,
        "category": thread.category,
        "created_at": thread.created_at.isoformat() if thread.created_at else None,
        "author": {
            "id": str(current_user.id),
            "display_name": current_user.display_name,
        },
    }

@router.get("/threads/{thread_id}")
async def get_thread(
    thread_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get discussion thread by ID.
    Public endpoint - no authentication required.
    """
    thread = db.query(Discussion).filter(Discussion.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")
    
    return {
        "id": str(thread.id),
        "title": thread.title,
        "content": thread.content,
        "category": thread.category,
        "created_at": thread.created_at.isoformat() if thread.created_at else None,
        "author": {
            "id": str(thread.author_id),
            "display_name": thread.author.display_name if thread.author else "Anonymous",
        } if thread.author else None,
        "comments": [
            {
                "id": str(c.id),
                "content": c.content,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "author": {
                    "id": str(c.author_id),
                    "display_name": c.author.display_name if c.author else "Anonymous",
                } if c.author else None,
            }
            for c in (thread.comments or [])
        ] if hasattr(thread, 'comments') else [],
    }

@router.post("/threads/{thread_id}/comments")
async def create_comment(
    thread_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Create new comment on a thread.
    Requires authentication.
    """
    thread = db.query(Discussion).filter(Discussion.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")
        
    comment = Comment(
        content=comment_data.content,
        discussion_id=thread_id,
        author_id=current_user.id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    logger.info("Comment created", comment_id=str(comment.id), thread_id=thread_id, user_id=str(current_user.id))
    return {
        "id": str(comment.id),
        "content": comment.content,
        "created_at": comment.created_at.isoformat() if comment.created_at else None,
        "author": {
            "id": str(current_user.id),
            "display_name": current_user.display_name,
        },
    }