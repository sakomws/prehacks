from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.user import User

# Comment Schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    author_id: int
    discussion_id: int
    created_at: datetime
    author: User

    class Config:
        from_attributes = True

# Discussion Schemas
class DiscussionBase(BaseModel):
    title: str
    content: str
    category: str = "General"

class DiscussionCreate(DiscussionBase):
    pass

class Discussion(DiscussionBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    author: User
    comments: List[Comment] = []

    class Config:
        from_attributes = True
