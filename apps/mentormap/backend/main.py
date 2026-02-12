"""
MentorMap Backend - Mentorship Platform API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import mentors, sessions, roadmaps, auth, payments, mentor_applications, admin, gifts, events, schedule, referrals, packages

app = FastAPI(
    title="MentorMap API",
    description="Mentorship and learning roadmap platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
import os

# Determine allowed origins based on environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

if ENVIRONMENT == "development":
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
    ]
else:
    # Production - allow both production and development for testing
    allowed_origins = [
        "https://mentormap.ai",
        "https://www.mentormap.ai",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(mentors.router, prefix="/api/mentors", tags=["Mentors"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])
app.include_router(roadmaps.router, prefix="/api/roadmaps", tags=["Roadmaps"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(mentor_applications.router, prefix="/api/mentor-applications", tags=["Mentor Applications"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(gifts.router, prefix="/api/gifts", tags=["Gift Sessions"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(schedule.router, prefix="/api/schedule", tags=["Schedule Management"])
app.include_router(referrals.router, prefix="/api/referrals", tags=["Referrals"])
app.include_router(packages.router, prefix="/api/packages", tags=["Packages"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to MentorMap API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "mentormap-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
