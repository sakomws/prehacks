"""
Covibe.ai Backend - AI-Powered Coding Agent
Main FastAPI application entry point
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import base64

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
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "https://covibe.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request models
class RulesetConfig(BaseModel):
    ethicalFoundation: bool = True
    biasAwareness: bool = True
    safetyFirst: bool = True
    responsibleDesign: bool = True


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    rulesets: Optional[RulesetConfig] = None


class CodeGenerationRequest(BaseModel):
    prompt: str
    language: str = "python"
    rulesets: Optional[RulesetConfig] = None


class CodeAnalysisRequest(BaseModel):
    code: str
    language: str = "python"
    rulesets: Optional[RulesetConfig] = None


class PRGenerateRequest(BaseModel):
    title: str
    description: str
    codeChanges: Optional[str] = None
    rulesets: Optional[RulesetConfig] = None


class PRReviewRequest(BaseModel):
    title: str
    description: str
    codeChanges: Optional[str] = None
    rulesets: Optional[RulesetConfig] = None


class VideoGenerateRequest(BaseModel):
    principle: str  # ethicalFoundation, biasAwareness, safetyFirst, responsibleDesign
    videoType: str = "educational"  # educational, tutorial, demo
    generateMedia: bool = False  # Generate actual images and video
    rulesets: Optional[RulesetConfig] = None


class ImageGenerateRequest(BaseModel):
    principle: str
    style: str = "illustration"  # illustration, storyboard, infographic


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Covibe.ai API - AI Parenting Principles Applied",
        "version": "1.0.0",
        "docs": "/docs",
        "features": {
            "ai_parenting": "Enabled - Ethical AI development guidance",
            "ethical_analysis": "Available - Code analysis with AI parenting perspective"
        },
        "endpoints": {
            "health": "/health",
            "chat": "/api/chat",
            "generate": "/api/code/generate",
            "analyze": "/api/code/analyze",
            "ethical_guidance": "/api/code/ethical-guidance",
            "parenting_score": "/api/code/parenting-score",
            "analyze_image": "/api/code/analyze-image",
            "generate_from_image": "/api/code/generate-from-image",
            "pr_generate": "/api/pr/generate",
            "pr_review": "/api/pr/review",
            "video_generate": "/api/video/generate",
            "image_generate": "/api/image/generate"
        },
        "features": {
            "ai_parenting": "Enabled - Ethical AI development guidance",
            "multimodal": "Enabled - Image-based code analysis",
            "rulesets": "Configurable - Toggle AI Parenting principles",
            "playground": "Available - Real-time code scoring",
            "pr_review": "Available - Generate and review PRs with AI Parenting",
            "video_generation": "Available - Generate video content for all 4 principles"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    google_configured = bool(os.getenv("GOOGLE_API_KEY") or os.getenv("GOOGLE_AI_API_KEY"))
    openai_configured = bool(os.getenv("OPENAI_API_KEY"))
    anthropic_configured = bool(os.getenv("ANTHROPIC_API_KEY"))
    
    return {
        "status": "healthy",
        "service": "covibe-api",
        "ai_parenting": "enabled",
        "ai_services": {
            "google_gemini": "configured" if google_configured else "not configured (primary)",
            "openai": "configured" if openai_configured else "not configured",
            "anthropic": "configured" if anthropic_configured else "not configured",
        }
    }


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """Chat with AI coding assistant"""
    rulesets_dict = None
    if request.rulesets:
        rulesets_dict = {
            "ethicalFoundation": request.rulesets.ethicalFoundation,
            "biasAwareness": request.rulesets.biasAwareness,
            "safetyFirst": request.rulesets.safetyFirst,
            "responsibleDesign": request.rulesets.responsibleDesign,
        }
    result = await ai_service.chat(request.message, request.context, rulesets_dict)
    
    if "error" in result and result.get("response") is None:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result


@app.post("/api/code/generate")
async def generate_code(request: CodeGenerationRequest):
    """Generate code based on prompt"""
    rulesets_dict = None
    if request.rulesets:
        rulesets_dict = {
            "ethicalFoundation": request.rulesets.ethicalFoundation,
            "biasAwareness": request.rulesets.biasAwareness,
            "safetyFirst": request.rulesets.safetyFirst,
            "responsibleDesign": request.rulesets.responsibleDesign,
        }
    result = await ai_service.generate_code(request.prompt, request.language, rulesets_dict)
    
    if "error" in result and result.get("code") is None:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result


@app.post("/api/code/analyze")
async def analyze_code(request: CodeAnalysisRequest):
    """Analyze code for issues and improvements with AI parenting perspective"""
    rulesets_dict = None
    if request.rulesets:
        rulesets_dict = {
            "ethicalFoundation": request.rulesets.ethicalFoundation,
            "biasAwareness": request.rulesets.biasAwareness,
            "safetyFirst": request.rulesets.safetyFirst,
            "responsibleDesign": request.rulesets.responsibleDesign,
        }
    result = await ai_service.analyze_code(request.code, request.language, rulesets_dict)
    
    if "error" in result and result.get("analysis") is None:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result


@app.post("/api/code/ethical-guidance")
async def ethical_guidance(request: CodeAnalysisRequest):
    """Get ethical guidance for code from an AI parenting perspective"""
    result = await ai_service.generate_ethical_guidance(request.code, request.language)
    
    if "error" in result and result.get("guidance") is None:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to generate ethical guidance"))
    
    return result


@app.post("/api/code/parenting-score")
async def parenting_score(request: CodeAnalysisRequest):
    """Calculate AI Parenting Score for code"""
    rulesets_dict = None
    if request.rulesets:
        rulesets_dict = {
            "ethicalFoundation": request.rulesets.ethicalFoundation,
            "biasAwareness": request.rulesets.biasAwareness,
            "safetyFirst": request.rulesets.safetyFirst,
            "responsibleDesign": request.rulesets.responsibleDesign,
        }
    result = await ai_service.calculate_parenting_score(request.code, request.language, rulesets_dict)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to calculate score"))
    
    return result


class ImageAnalysisRequest(BaseModel):
    image: str  # Base64 encoded image
    language: Optional[str] = None
    rulesets: Optional[RulesetConfig] = None


@app.post("/api/code/analyze-image")
async def analyze_code_from_image(request: ImageAnalysisRequest):
    """Extract and analyze code from an image using multimodal AI"""
    rulesets_dict = None
    if request.rulesets:
        rulesets_dict = {
            "ethicalFoundation": request.rulesets.ethicalFoundation,
            "biasAwareness": request.rulesets.biasAwareness,
            "safetyFirst": request.rulesets.safetyFirst,
            "responsibleDesign": request.rulesets.responsibleDesign,
        }
    result = await ai_service.analyze_code_from_image(request.image, request.language, rulesets_dict)
    
    if "error" in result and not result.get("code") and not result.get("analysis"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to analyze image"))
    
    return result


@app.post("/api/code/generate-from-image")
async def generate_code_from_image(request: ImageAnalysisRequest):
    """Extract and generate improved code from an image"""
    rulesets_dict = None
    if request.rulesets:
        rulesets_dict = {
            "ethicalFoundation": request.rulesets.ethicalFoundation,
            "biasAwareness": request.rulesets.biasAwareness,
            "safetyFirst": request.rulesets.safetyFirst,
            "responsibleDesign": request.rulesets.responsibleDesign,
        }
    result = await ai_service.generate_code_from_image(
        request.image,
        "Extract and improve this code following AI parenting principles",
        rulesets_dict
    )
    
    if "error" in result and not result.get("code"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to generate code from image"))
    
    return result


@app.post("/api/pr/generate")
async def generate_pr(request: PRGenerateRequest):
    """Generate an ethical PR description with AI Parenting principles"""
    rulesets_dict = None
    if request.rulesets:
        rulesets_dict = {
            "ethicalFoundation": request.rulesets.ethicalFoundation,
            "biasAwareness": request.rulesets.biasAwareness,
            "safetyFirst": request.rulesets.safetyFirst,
            "responsibleDesign": request.rulesets.responsibleDesign,
        }
    result = await ai_service.generate_pr_description(
        request.title,
        request.description,
        request.codeChanges,
        rulesets_dict
    )
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to generate PR"))
    
    return result


@app.post("/api/pr/review")
async def review_pr(request: PRReviewRequest):
    """Review a PR for AI Parenting compliance"""
    rulesets_dict = None
    if request.rulesets:
        rulesets_dict = {
            "ethicalFoundation": request.rulesets.ethicalFoundation,
            "biasAwareness": request.rulesets.biasAwareness,
            "safetyFirst": request.rulesets.safetyFirst,
            "responsibleDesign": request.rulesets.responsibleDesign,
        }
    result = await ai_service.review_pr(
        request.title,
        request.description,
        request.codeChanges,
        rulesets_dict
    )
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to review PR"))
    
    return result


@app.post("/api/video/generate")
async def generate_video(request: VideoGenerateRequest):
    """Generate video content for AI Parenting principles"""
    rulesets_dict = None
    if request.rulesets:
        rulesets_dict = {
            "ethicalFoundation": request.rulesets.ethicalFoundation,
            "biasAwareness": request.rulesets.biasAwareness,
            "safetyFirst": request.rulesets.safetyFirst,
            "responsibleDesign": request.rulesets.responsibleDesign,
        }
    result = await ai_service.generate_video_content(
        request.principle,
        request.videoType,
        rulesets_dict,
        request.generateMedia
    )
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to generate video content"))
    
    return result


@app.post("/api/image/generate")
async def generate_image(request: ImageGenerateRequest):
    """Generate image for AI Parenting principle"""
    result = await ai_service.generate_image(
        request.principle,
        request.style
    )
    
    if "error" in result and not result.get("imagePrompt"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to generate image"))
    
    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
