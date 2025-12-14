"""
Authentication service for user management and JWT token handling.
Implements secure authentication with role-based access control.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import secrets
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
import structlog

from app.core.config import settings
from app.core.database import get_db, get_redis
from app.models.user import User, UserSession, UserProgress
from app.schemas.auth import Token, TokenData, RegisterRequest
from app.schemas.user import UserCreate, UserResponse

logger = structlog.get_logger("auth")
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Authentication service for user management and JWT operations."""
    
    def __init__(self, db: Session):
        self.db = db
        self.redis = get_redis()
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Generate password hash."""
        return pwd_context.hash(password)
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email address."""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        return self.db.query(User).filter(User.username == username).first()
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()
    
    async def register_user(self, user_data: UserCreate) -> UserResponse:
        """
        Register a new user account.
        
        Args:
            user_data: User registration data
            
        Returns:
            UserResponse: Created user data
            
        Raises:
            ValueError: If email or username already exists
        """
        # Check if email already exists
        if self.get_user_by_email(user_data.email):
            raise ValueError("Email already registered")
        
        # Check if username already exists
        if self.get_user_by_username(user_data.username):
            raise ValueError("Username already taken")
        
        # Create new user
        hashed_password = self.get_password_hash(user_data.password)
        
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            display_name=user_data.display_name,
            hashed_password=hashed_password,
            age_group=user_data.age_group,
            professional_role=user_data.professional_role,
            interest_areas=user_data.interests or [],
            preferences={
                "language": "en",
                "notifications": {
                    "email": True,
                    "push": True,
                    "in_app": True,
                    "frequency": "daily"
                },
                "privacy": {
                    "profile_visibility": "community",
                    "show_progress": True,
                    "allow_direct_messages": True
                },
                "accessibility": {
                    "font_size": "medium",
                    "high_contrast": False,
                    "reduced_motion": False
                }
            }
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        # Create initial progress record
        user_progress = UserProgress(
            user_id=db_user.id,
            learning_style_profile={
                "preferred_pace": "moderate",
                "learning_modality": "mixed",
                "interaction_style": "guided"
            },
            preferred_content_types=["text", "interactive"],
            difficulty_preference="beginner"
        )
        
        self.db.add(user_progress)
        self.db.commit()
        
        logger.info("User registered successfully", user_id=str(db_user.id), email=db_user.email)
        
        return UserResponse.from_orm(db_user)
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Authenticate user with email and password.
        
        Args:
            email: User email
            password: Plain text password
            
        Returns:
            User object if authentication successful, None otherwise
        """
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not user.is_active:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user
    
    def create_access_token(self, user: User, expires_delta: Optional[timedelta] = None) -> Dict[str, Any]:
        """
        Create JWT access token for user.
        
        Args:
            user: User object
            expires_delta: Token expiration time
            
        Returns:
            Dictionary containing token data
        """
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        
        # Generate unique JWT ID for session tracking
        jti = str(uuid.uuid4())
        
        to_encode = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.community_role.value,
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "jti": jti
        }
        
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        
        # Store session in database
        session = UserSession(
            user_id=user.id,
            token_jti=jti,
            expires_at=expire,
            is_active=True
        )
        
        self.db.add(session)
        self.db.commit()
        
        # Cache token in Redis for fast lookup
        self.redis.setex(
            f"token:{jti}",
            int(expires_delta.total_seconds()) if expires_delta else settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            str(user.id)
        )
        
        return {
            "access_token": encoded_jwt,
            "token_type": "bearer",
            "expires_in": int((expire - datetime.now(timezone.utc)).total_seconds()),
            "jti": jti
        }
    
    async def authenticate_user_login(self, email: str, password: str) -> Token:
        """
        Authenticate user and return token response.
        
        Args:
            email: User email
            password: User password
            
        Returns:
            Token response with user data
            
        Raises:
            ValueError: If authentication fails
        """
        user = self.authenticate_user(email, password)
        if not user:
            raise ValueError("Invalid email or password")
        
        # Update last active timestamp
        user.last_active_at = datetime.now(timezone.utc)
        self.db.commit()
        
        # Create access token
        token_data = self.create_access_token(user)
        
        logger.info("User authenticated successfully", user_id=str(user.id), email=user.email)
        
        return Token(
            access_token=token_data["access_token"],
            token_type=token_data["token_type"],
            expires_in=token_data["expires_in"],
            user=UserResponse.from_orm(user)
        )
    
    async def refresh_user_token(self, user_id: str) -> Token:
        """
        Refresh access token for user.
        
        Args:
            user_id: User ID
            
        Returns:
            New token response
            
        Raises:
            ValueError: If user not found or inactive
        """
        user = self.get_user_by_id(user_id)
        if not user or not user.is_active:
            raise ValueError("User not found or inactive")
        
        # Create new access token
        token_data = self.create_access_token(user)
        
        return Token(
            access_token=token_data["access_token"],
            token_type=token_data["token_type"],
            expires_in=token_data["expires_in"],
            user=UserResponse.from_orm(user)
        )
    
    async def logout_user(self, token_jti: str):
        """
        Logout user by revoking token.
        
        Args:
            token_jti: JWT ID to revoke
        """
        # Revoke session in database
        session = self.db.query(UserSession).filter(UserSession.token_jti == token_jti).first()
        if session:
            session.revoke()
            self.db.commit()
        
        # Remove from Redis cache
        self.redis.delete(f"token:{token_jti}")
        
        logger.info("User session revoked", token_jti=token_jti)
    
    def decode_token(self, token: str) -> Optional[TokenData]:
        """
        Decode and validate JWT token.
        
        Args:
            token: JWT token string
            
        Returns:
            TokenData if valid, None otherwise
        """
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            
            # Extract token data
            user_id = payload.get("sub")
            username = payload.get("username")
            email = payload.get("email")
            role = payload.get("role")
            exp = datetime.fromtimestamp(payload.get("exp"), tz=timezone.utc)
            iat = datetime.fromtimestamp(payload.get("iat"), tz=timezone.utc)
            jti = payload.get("jti")
            
            if not all([user_id, username, email, role, jti]):
                return None
            
            # Check if token is blacklisted
            if not self.redis.exists(f"token:{jti}"):
                return None
            
            return TokenData(
                user_id=user_id,
                username=username,
                email=email,
                role=role,
                exp=exp,
                iat=iat,
                jti=jti
            )
        
        except JWTError:
            return None
    
    @staticmethod
    async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
    ) -> Dict[str, Any]:
        """
        Dependency to get current authenticated user.
        
        Args:
            credentials: HTTP authorization credentials
            db: Database session
            
        Returns:
            Dictionary with user data and token info
            
        Raises:
            HTTPException: If authentication fails
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        auth_service = AuthService(db)
        token_data = auth_service.decode_token(credentials.credentials)
        
        if token_data is None:
            raise credentials_exception
        
        user = auth_service.get_user_by_id(token_data.user_id)
        if user is None or not user.is_active:
            raise credentials_exception
        
        return {
            "user_id": token_data.user_id,
            "username": token_data.username,
            "email": token_data.email,
            "role": token_data.role,
            "token": credentials.credentials,
            "jti": token_data.jti,
            "user": user
        }
    
    @staticmethod
    async def get_current_active_user(
        current_user: Dict[str, Any] = Depends(get_current_user)
    ) -> User:
        """
        Dependency to get current active user object.
        
        Args:
            current_user: Current user data from get_current_user
            
        Returns:
            User object
        """
        return current_user["user"]
    
    @staticmethod
    async def get_current_user_optional(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
        db: Session = Depends(get_db)
    ) -> Optional[User]:
        """
        Optional dependency to get current authenticated user.
        Returns None if no credentials provided.
        
        Args:
            credentials: Optional HTTP authorization credentials
            db: Database session
            
        Returns:
            User object if authenticated, None otherwise
        """
        if not credentials:
            return None
        
        try:
            auth_service = AuthService(db)
            token_data = auth_service.decode_token(credentials.credentials)
            
            if token_data is None:
                return None
            
            user = auth_service.get_user_by_id(token_data.user_id)
            if user is None or not user.is_active:
                return None
            
            return user
        except Exception:
            return None
    
    @staticmethod
    async def require_role(required_roles: list):
        """
        Dependency factory to require specific user roles.
        
        Args:
            required_roles: List of required roles
            
        Returns:
            Dependency function
        """
        async def role_checker(current_user: Dict[str, Any] = Depends(AuthService.get_current_user)):
            if current_user["role"] not in required_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            return current_user
        
        return role_checker