from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    is_active: Optional[bool] = True
    display_name: Optional[str] = None
    community_role: Optional[UserRole] = UserRole.LEARNER

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    username: str
    password: str
    terms_accepted: bool = True # GDPR/Legal

# Properties to return via API
class User(UserBase):
    id: int
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

UserResponse = User