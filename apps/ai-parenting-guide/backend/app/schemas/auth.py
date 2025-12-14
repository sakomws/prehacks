"""
Pydantic schemas for authentication-related API requests and responses.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.schemas.user import UserCreate, UserResponse


class Token(BaseModel):
    """JWT token response schema."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    refresh_token: Optional[str] = None
    user: UserResponse


class TokenData(BaseModel):
    """Token payload data schema."""
    user_id: str
    username: str
    email: str
    role: str
    exp: datetime
    iat: datetime
    jti: str  # JWT ID for session tracking


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""
    refresh_token: str = Field(..., min_length=1)


class LoginRequest(BaseModel):
    """Login request schema."""
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)
    remember_me: bool = Field(default=False)


class RegisterRequest(UserCreate):
    """Registration request schema (extends UserCreate)."""
    terms_accepted: bool = Field(..., description="User must accept terms and conditions")
    privacy_accepted: bool = Field(..., description="User must accept privacy policy")
    
    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "username": "ailearner123",
                "display_name": "AI Learner",
                "password": "SecurePass123",
                "age_group": "adult",
                "interests": ["ai-ethics", "machine-learning"],
                "professional_role": "Software Developer",
                "terms_accepted": True,
                "privacy_accepted": True
            }
        }


class LogoutRequest(BaseModel):
    """Logout request schema."""
    revoke_all_sessions: bool = Field(default=False, description="Revoke all user sessions")


class SessionInfo(BaseModel):
    """User session information schema."""
    id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_info: dict = Field(default_factory=dict)
    is_active: bool
    created_at: datetime
    last_used_at: datetime
    expires_at: datetime
    is_current: bool = Field(default=False, description="Whether this is the current session")
    
    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Generic authentication response schema."""
    success: bool
    message: str
    data: Optional[dict] = None