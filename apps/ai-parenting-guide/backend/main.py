"""
AI Parenting Guide Platform - FastAPI Backend
Main application entry point with API routes and middleware configuration.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
import structlog
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from app.core.config import settings
from app.core.database import engine
from app import models
# Base is accessible via models.Base or we can import it directly from app.core.base if needed, 
# but importing 'models' ensures they are registered for create_all.
from app.api.v1 import api_router
from app.core.logging import setup_logging

# Initialize structured logging
setup_logging()
logger = structlog.get_logger()

# Initialize Sentry for error tracking (production)
if settings.ENVIRONMENT == "production":
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[
            FastApiIntegration(auto_enabling=True),
            SqlalchemyIntegration(),
        ],
        traces_sample_rate=0.1,
        environment=settings.ENVIRONMENT,
    )

# Create FastAPI application
app = FastAPI(
    title="AI Parenting Guide API",
    description="Backend API for the AI Parenting Guide educational platform",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

# Security middleware
security = HTTPBearer()

# Import custom middleware
from app.core.middleware import RateLimitMiddleware, RequestLoggingMiddleware, SecurityHeadersMiddleware

# Add custom middleware (order matters - last added is executed first)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL] if settings.ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Trusted host middleware for security
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[settings.BACKEND_HOST, "localhost", "127.0.0.1"]
    )

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    logger.info("Starting AI Parenting Guide API", version="1.0.0")
    
    # Create database tables
    models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    logger.info("Shutting down AI Parenting Guide API")


@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {
        "message": "AI Parenting Guide API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs" if settings.DEBUG else "disabled"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": "connected",  # TODO: Add actual DB health check
        "redis": "connected",     # TODO: Add actual Redis health check
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )