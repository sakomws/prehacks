"""
MyRoadmap Backend - Mentorship Platform API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import mentors, sessions, roadmaps, auth, payments

app = FastAPI(
    title="MyRoadmap API",
    description="Mentorship and learning roadmap platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3002/blog",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(mentors.router, prefix="/api/mentors", tags=["Mentors"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])
app.include_router(roadmaps.router, prefix="/api/roadmaps", tags=["Roadmaps"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to MyRoadmap API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "myroadmap-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
