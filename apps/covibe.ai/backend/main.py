"""
Covibe.ai Backend - AI-Powered Coding Agent
Main FastAPI application entry point
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

# Import AI service
from app.ai_service import ai_service

app = FastAPI(
    title="Covibe.ai API",
    description="AI-powered coding agent for intelligent code generation and analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://covibe.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request models
class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


class CodeGenerationRequest(BaseModel):
    prompt: str
    language: str = "python"


class CodeAnalysisRequest(BaseModel):
    code: str
    language: str = "python"


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Covibe.ai API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "chat": "/api/chat",
            "generate": "/api/code/generate",
            "analyze": "/api/code/analyze",
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    openai_configured = bool(os.getenv("OPENAI_API_KEY"))
    anthropic_configured = bool(os.getenv("ANTHROPIC_API_KEY"))
    
    return {
        "status": "healthy",
        "service": "covibe-api",
        "ai_services": {
            "openai": "configured" if openai_configured else "not configured",
            "anthropic": "configured" if anthropic_configured else "not configured",
        }
    }


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """Chat with AI coding assistant"""
    result = await ai_service.chat(request.message, request.context)
    
    if "error" in result and result.get("response") is None:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result


@app.post("/api/code/generate")
async def generate_code(request: CodeGenerationRequest):
    """Generate code based on prompt"""
    result = await ai_service.generate_code(request.prompt, request.language)
    
    if "error" in result and result.get("code") is None:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result


@app.post("/api/code/analyze")
async def analyze_code(request: CodeAnalysisRequest):
    """Analyze code for issues and improvements"""
    result = await ai_service.analyze_code(request.code, request.language)
    
    if "error" in result and result.get("analysis") is None:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
