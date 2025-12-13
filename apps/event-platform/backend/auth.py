from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from jose import JWTError, jwt
import hashlib
import secrets
import json
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator, HttpUrl
import os
import uuid

from database import get_db, UserModel

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def hash_password(password: str) -> str:
    """Hash a password using PBKDF2 with SHA256"""
    salt = secrets.token_hex(32)
    password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}:{password_hash.hex()}"

def verify_password_hash(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    try:
        salt, password_hash = hashed.split(':')
        computed_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return computed_hash.hex() == password_hash
    except ValueError:
        return False

# JWT token bearer
security = HTTPBearer()

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    username: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    username: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    joined_at: datetime
    is_platform_admin: bool

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse

class TokenRefresh(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    email: Optional[str] = None
    token_type: Optional[str] = None

class SocialLink(BaseModel):
    platform: str
    url: HttpUrl
    username: Optional[str] = None

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    social_links: Optional[List[SocialLink]] = None
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if v is not None and (len(v.strip()) < 1 or len(v.strip()) > 50):
            raise ValueError('Name must be between 1 and 50 characters')
        return v.strip() if v else v
    
    @validator('username')
    def validate_username(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) < 3 or len(v) > 30:
                raise ValueError('Username must be between 3 and 30 characters')
            if not v.replace('_', '').replace('-', '').isalnum():
                raise ValueError('Username can only contain letters, numbers, hyphens, and underscores')
        return v
    
    @validator('bio')
    def validate_bio(cls, v):
        if v is not None and len(v.strip()) > 500:
            raise ValueError('Bio must be 500 characters or less')
        return v.strip() if v else v
    
    @validator('social_links')
    def validate_social_links(cls, v):
        if v is not None:
            if len(v) > 10:
                raise ValueError('Maximum 10 social links allowed')
            
            # Check for duplicate platforms
            platforms = [link.platform.lower() for link in v]
            if len(platforms) != len(set(platforms)):
                raise ValueError('Duplicate social media platforms not allowed')
            
            # Validate platform names
            allowed_platforms = {
                'twitter', 'linkedin', 'github', 'instagram', 'facebook', 
                'youtube', 'tiktok', 'website', 'blog', 'portfolio'
            }
            for link in v:
                if link.platform.lower() not in allowed_platforms:
                    raise ValueError(f'Platform "{link.platform}" is not supported')
        
        return v

class UserProfileResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    username: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    social_links: Optional[List[SocialLink]]
    joined_at: datetime
    is_platform_admin: bool
    email_verified: bool

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return verify_password_hash(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return hash_password(password)

# JWT utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "type": "access",
        "jti": str(uuid.uuid4())  # JWT ID for token tracking
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "jti": str(uuid.uuid4())  # JWT ID for token tracking
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, expected_type: str = "access") -> TokenData:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type", "access")
        
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if token_type != expected_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {expected_type}",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token_data = TokenData(email=email, token_type=token_type)
        return token_data
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# User utilities
def get_user_by_email(db: Session, email: str) -> Optional[UserModel]:
    """Get user by email"""
    return db.query(UserModel).filter(UserModel.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[UserModel]:
    """Get user by username"""
    return db.query(UserModel).filter(UserModel.username == username).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[UserModel]:
    """Get user by ID"""
    try:
        # Convert string to UUID if needed
        if isinstance(user_id, str):
            import uuid
            user_uuid = uuid.UUID(user_id)
        else:
            user_uuid = user_id
        return db.query(UserModel).filter(UserModel.id == user_uuid).first()
    except (ValueError, TypeError):
        return None

def create_user(db: Session, user: UserCreate) -> UserModel:
    """Create a new user"""
    # Check if user already exists
    if get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username is taken (if provided)
    if user.username and get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        email=user.email,
        password_hash=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        username=user.username
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[UserModel]:
    """Authenticate a user"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def create_tokens_for_user(user: UserModel) -> Dict[str, str]:
    """Create both access and refresh tokens for a user"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }

# Dependency to get current user
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserModel:
    """Get current authenticated user"""
    token = credentials.credentials
    token_data = verify_token(token)
    user = get_user_by_email(db, email=token_data.email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_current_active_user(current_user: UserModel = Depends(get_current_user)) -> UserModel:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def update_user_profile(db: Session, user: UserModel, profile_data: UserProfileUpdate) -> UserModel:
    """Update user profile information"""
    # Check if username is being changed and if it's available
    if profile_data.username and profile_data.username != user.username:
        existing_user = get_user_by_username(db, profile_data.username)
        if existing_user and existing_user.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Update fields that are provided
    try:
        update_data = profile_data.model_dump(exclude_unset=True)
    except AttributeError:
        update_data = profile_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == 'social_links' and value is not None:
            # Convert social_links to JSON string for storage
            if isinstance(value, list):
                # Convert any HttpUrl objects to strings
                social_links_data = []
                for link in value:
                    if isinstance(link, dict):
                        link_copy = link.copy()
                        if 'url' in link_copy and hasattr(link_copy['url'], '__str__'):
                            link_copy['url'] = str(link_copy['url'])
                        social_links_data.append(link_copy)
                    else:
                        # If it's a SocialLink object
                        link_dict = link.dict() if hasattr(link, 'dict') else link.model_dump()
                        if 'url' in link_dict:
                            link_dict['url'] = str(link_dict['url'])
                        social_links_data.append(link_dict)
                social_links_json = json.dumps(social_links_data)
            else:
                social_links_json = json.dumps(value)
            setattr(user, field, social_links_json)
        else:
            setattr(user, field, value)
    
    # Update the updated_at timestamp
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    return user

def update_user_avatar(db: Session, user: UserModel, avatar_url: str) -> UserModel:
    """Update user avatar URL"""
    user.avatar_url = avatar_url
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

def create_password_reset_token(db: Session, email: str) -> Optional[str]:
    """Create a password reset token for a user"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    
    # Generate a secure random token
    reset_token = secrets.token_urlsafe(32)
    
    # Set token expiration (1 hour from now)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Update user with reset token
    user.password_reset_token = reset_token
    user.password_reset_expires = expires_at
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return reset_token

def verify_password_reset_token(db: Session, token: str) -> Optional[UserModel]:
    """Verify a password reset token and return the user if valid"""
    user = db.query(UserModel).filter(
        UserModel.password_reset_token == token,
        UserModel.password_reset_expires > datetime.utcnow()
    ).first()
    
    return user

def reset_user_password(db: Session, token: str, new_password: str) -> bool:
    """Reset user password using a valid token"""
    user = verify_password_reset_token(db, token)
    if not user:
        return False
    
    # Update password
    user.password_hash = get_password_hash(new_password)
    
    # Clear reset token
    user.password_reset_token = None
    user.password_reset_expires = None
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return True

def parse_social_links(social_links_json: Optional[str]) -> Optional[List[SocialLink]]:
    """Parse social links from JSON string"""
    if not social_links_json:
        return None
    
    try:
        social_links_data = json.loads(social_links_json)
        return [SocialLink(**link) for link in social_links_data]
    except (json.JSONDecodeError, ValueError):
        return None

def user_to_profile_response(user: UserModel) -> UserProfileResponse:
    """Convert UserModel to UserProfileResponse with proper social_links parsing"""
    return UserProfileResponse(
        id=str(user.id),
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        username=user.username,
        bio=user.bio,
        avatar_url=user.avatar_url,
        social_links=parse_social_links(user.social_links),
        joined_at=user.joined_at,
        is_platform_admin=user.is_platform_admin,
        email_verified=user.email_verified
    )