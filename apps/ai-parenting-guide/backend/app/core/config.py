"""
Configuration settings for the AI Parenting Guide backend.
Uses Pydantic Settings for environment variable management.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default="sqlite:///./ai_parenting_guide.db",
        description="Database connection URL (defaults to SQLite for local dev)"
    )
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL for caching"
    )
    
    # Google AI / Gemini Configuration
    GOOGLE_AI_API_KEY: str = Field(
        default="mock_ai_key",
        description="Google AI Studio API key for Gemini integration"
    )
    GOOGLE_AI_PROJECT_ID: Optional[str] = Field(
        default=None,
        description="Google Cloud project ID"
    )
    
    # JWT Authentication
    JWT_SECRET_KEY: str = Field(
        default="supersecret",
        description="Secret key for JWT token signing"
    )
    JWT_ALGORITHM: str = Field(
        default="HS256",
        description="JWT signing algorithm"
    )
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        description="JWT access token expiration time in minutes"
    )
    
    # FastAPI Configuration
    BACKEND_HOST: str = Field(
        default="0.0.0.0",
        description="Backend server host"
    )
    BACKEND_PORT: int = Field(
        default=8000,
        description="Backend server port"
    )
    FRONTEND_URL: str = Field(
        default="http://localhost:3000",
        description="Frontend application URL for CORS"
    )
    
    # File Storage Configuration
    STORAGE_PROVIDER: str = Field(
        default="local",
        description="Storage provider: local, s3, or gcs"
    )
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    AWS_REGION: str = Field(default="us-east-1")
    
    GOOGLE_CLOUD_PROJECT: Optional[str] = None
    GOOGLE_CLOUD_STORAGE_BUCKET: Optional[str] = None
    
    # Email Configuration
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = Field(default=587)
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Environment Configuration
    ENVIRONMENT: str = Field(
        default="development",
        description="Application environment: development, staging, production"
    )
    DEBUG: bool = Field(
        default=True,
        description="Enable debug mode"
    )
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level"
    )
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(
        default=60,
        description="Rate limit requests per minute per user"
    )
    RATE_LIMIT_BURST: int = Field(
        default=10,
        description="Rate limit burst capacity"
    )
    
    # Content Moderation
    ENABLE_AI_MODERATION: bool = Field(
        default=True,
        description="Enable AI-powered content moderation"
    )
    MODERATION_CONFIDENCE_THRESHOLD: float = Field(
        default=0.8,
        description="Confidence threshold for AI moderation decisions"
    )
    
    # Sentry Configuration (for production error tracking)
    SENTRY_DSN: Optional[str] = Field(
        default=None,
        description="Sentry DSN for error tracking"
    )
    
    class Config:
        # env_file = "../.env"  # Look for .env in parent directory
        # env_file_encoding = 'utf-8'
        case_sensitive = True


# Global settings instance
settings = Settings()