"""
AI service endpoints for Gemini integration and intelligent features.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.services.auth import AuthService
from app.services.gemini_ai import GeminiAIService
from app.models.user import User, UserProgress
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger("ai")


class ContentGenerationRequest(BaseModel):
    """Request schema for AI content generation."""
    topic: str = Field(..., min_length=1, max_length=200, description="Topic to generate content about")
    content_type: str = Field(default="educational", description="Type of content to generate")
    difficulty_level: str = Field(default="beginner", description="Difficulty level for the content")
    additional_context: Optional[str] = Field(None, description="Additional context or requirements")


class MultimodalAnalysisRequest(BaseModel):
    """Request schema for multimodal content analysis."""
    input_type: str = Field(..., description="Type of input (text, image, audio, mixed)")
    content: str = Field(..., description="Content to analyze")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


class TutoringRequest(BaseModel):
    """Request schema for AI tutoring."""
    question: str = Field(..., min_length=1, max_length=1000, description="User's question")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Learning context")


class ContentModerationRequest(BaseModel):
    """Request schema for content moderation."""
    content: str = Field(..., min_length=1, description="Content to moderate")
    content_type: str = Field(default="text", description="Type of content")


@router.post("/generate-content")
async def generate_personalized_content(
    request: ContentGenerationRequest,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Generate personalized learning content using AI.
    
    Uses Gemini AI to create content adapted to user's learning style and level.
    """
    logger.info("AI content generation requested", 
                user_id=str(current_user.id), 
                topic=request.topic)
    
    try:
        # Get user preferences and progress
        user_progress = db.query(UserProgress).filter(
            UserProgress.user_id == current_user.id
        ).first()
        
        user_preferences = {
            "age_group": current_user.age_group.value if current_user.age_group else "adult",
            "interests": current_user.interest_areas,
            "expertise": current_user.expertise_areas,
            "learning_style": user_progress.learning_style_profile if user_progress else {},
            "difficulty_preference": user_progress.difficulty_preference if user_progress else "beginner"
        }
        
        # Initialize Gemini AI service
        gemini_service = GeminiAIService()
        
        # Generate personalized content
        content_data = await gemini_service.generate_personalized_content(
            topic=request.topic,
            user_preferences=user_preferences,
            content_type=request.content_type,
            difficulty_level=request.difficulty_level
        )
        
        logger.info("AI content generated successfully", 
                    user_id=str(current_user.id), 
                    topic=request.topic)
        
        return {
            "success": True,
            "content": content_data,
            "personalized_for": str(current_user.id),
            "generated_at": content_data.get("generated_at")
        }
        
    except Exception as e:
        logger.error("AI content generation failed", 
                     error=str(e), 
                     user_id=str(current_user.id))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate content: {str(e)}"
        )


@router.post("/analyze-content")
async def analyze_multimodal_content(
    request: MultimodalAnalysisRequest,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Analyze multimodal content using AI.
    
    Processes images, audio, and video content for accessibility and insights.
    """
    logger.info("AI content analysis requested", 
                user_id=str(current_user.id), 
                input_type=request.input_type)
    
    try:
        # Initialize Gemini AI service
        gemini_service = GeminiAIService()
        
        # Prepare input data
        input_data = {
            "type": request.input_type,
            "content": request.content,
            "metadata": request.metadata
        }
        
        # Analyze content
        analysis_result = await gemini_service.analyze_multimodal_input(input_data)
        
        logger.info("AI content analysis completed", 
                    user_id=str(current_user.id), 
                    input_type=request.input_type)
        
        return {
            "success": True,
            "analysis": analysis_result,
            "analyzed_by": str(current_user.id)
        }
        
    except Exception as e:
        logger.error("AI content analysis failed", 
                     error=str(e), 
                     user_id=str(current_user.id))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze content: {str(e)}"
        )


@router.post("/tutoring")
async def get_ai_tutoring_response(
    request: TutoringRequest,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get AI tutoring response to user questions.
    
    Provides personalized explanations using the "AI parenting" metaphor.
    """
    logger.info("AI tutoring requested", 
                user_id=str(current_user.id), 
                question_length=len(request.question))
    
    try:
        # Get user progress for context
        user_progress = db.query(UserProgress).filter(
            UserProgress.user_id == current_user.id
        ).first()
        
        # Build learning context
        learning_context = {
            "current_module": user_progress.current_module_id if user_progress else None,
            "progress_level": user_progress.difficulty_preference if user_progress else "beginner",
            "recent_topics": request.context.get("recent_topics", []),
            **request.context
        }
        
        # Build user profile
        user_profile = {
            "age_group": current_user.age_group.value if current_user.age_group else "adult",
            "experience_level": user_progress.difficulty_preference if user_progress else "beginner",
            "interests": current_user.interest_areas,
            "role": current_user.community_role.value
        }
        
        # Initialize Gemini AI service
        gemini_service = GeminiAIService()
        
        # Get tutoring response
        tutoring_response = await gemini_service.provide_tutoring_response(
            user_question=request.question,
            learning_context=learning_context,
            user_profile=user_profile
        )
        
        logger.info("AI tutoring response generated", 
                    user_id=str(current_user.id))
        
        return {
            "success": True,
            "response": tutoring_response,
            "question": request.question
        }
        
    except Exception as e:
        logger.error("AI tutoring failed", 
                     error=str(e), 
                     user_id=str(current_user.id))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate tutoring response: {str(e)}"
        )


@router.post("/moderate-content")
async def moderate_content_with_ai(
    request: ContentModerationRequest,
    current_user: dict = Depends(AuthService.require_role(["moderator", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Moderate content using AI assistance.
    
    Uses AI to detect inappropriate content and provide moderation recommendations.
    """
    logger.info("AI content moderation requested", 
                user_id=current_user["user_id"], 
                content_length=len(request.content))
    
    try:
        # Initialize Gemini AI service
        gemini_service = GeminiAIService()
        
        # Moderate content
        moderation_result = await gemini_service.moderate_content(
            content=request.content,
            content_type=request.content_type
        )
        
        logger.info("AI content moderation completed", 
                    user_id=current_user["user_id"], 
                    safety_score=moderation_result.get("safety_score"))
        
        return {
            "success": True,
            "moderation": moderation_result,
            "moderated_by": current_user["user_id"]
        }
        
    except Exception as e:
        logger.error("AI content moderation failed", 
                     error=str(e), 
                     user_id=current_user["user_id"])
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to moderate content: {str(e)}"
        )


@router.post("/translate")
async def translate_content(
    content: str = Body(..., description="Content to translate"),
    target_language: str = Body(..., description="Target language code"),
    preserve_metaphors: bool = Body(True, description="Preserve AI parenting metaphors"),
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Translate content while preserving AI parenting metaphors.
    
    Provides culturally appropriate translations that maintain the educational intent.
    """
    logger.info("AI translation requested", 
                user_id=str(current_user.id), 
                target_language=target_language)
    
    try:
        # Initialize Gemini AI service
        gemini_service = GeminiAIService()
        
        # Translate content
        translation_result = await gemini_service.translate_content(
            content=content,
            target_language=target_language,
            preserve_metaphors=preserve_metaphors
        )
        
        logger.info("AI translation completed", 
                    user_id=str(current_user.id), 
                    target_language=target_language)
        
        return {
            "success": True,
            "translation": translation_result,
            "requested_by": str(current_user.id)
        }
        
    except Exception as e:
        logger.error("AI translation failed", 
                     error=str(e), 
                     user_id=str(current_user.id))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to translate content: {str(e)}"
        )


@router.get("/health")
async def check_ai_service_health():
    """
    Check the health of AI services.
    
    Verifies that Gemini AI integration is working properly.
    """
    try:
        # Initialize Gemini AI service
        gemini_service = GeminiAIService()
        
        # Test basic functionality
        test_response = await gemini_service.generate_personalized_content(
            topic="AI ethics test",
            user_preferences={"age_group": "adult", "interests": []},
            content_type="test",
            difficulty_level="beginner"
        )
        
        return {
            "status": "healthy",
            "gemini_ai": "connected",
            "test_generation": "successful",
            "timestamp": test_response.get("generated_at")
        }
        
    except Exception as e:
        logger.error("AI service health check failed", error=str(e))
        return {
            "status": "unhealthy",
            "gemini_ai": "error",
            "error": str(e)
        }