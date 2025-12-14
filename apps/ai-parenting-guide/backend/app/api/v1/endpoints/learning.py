"""
Learning module endpoints for educational content and progress tracking.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from app.core.database import get_db
from app.services.auth import AuthService
from app.models.user import User
from app.models.learning import LearningModule, Exercise, ModuleProgress, ExerciseResponse
from app.schemas.learning import (
    LearningModuleResponse, LearningModuleSummary, ModuleSearchRequest, ModuleSearchResponse,
    ExerciseResponse as ExerciseResponseSchema, ProgressUpdate, ModuleProgressResponse,
    ExerciseSubmission, ExerciseResponseResult, UserLearningStats
)
from app.services.gemini_ai import GeminiAIService
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger("learning")


@router.get("/modules", response_model=ModuleSearchResponse)
async def list_learning_modules(
    query: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    featured_only: bool = Query(False, description="Show only featured modules"),
    skip: int = Query(0, ge=0, description="Number of modules to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of modules to return"),
    current_user: Optional[User] = Depends(AuthService.get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    List available learning modules.
    
    Returns paginated list of learning modules based on search criteria and user preferences.
    Public endpoint - authentication optional.
    """
    user_id = str(current_user.id) if current_user else None
    logger.info("Learning modules requested", 
                user_id=user_id, 
                query=query, 
                category=category)
    
    # Build query
    query_filter = db.query(LearningModule).filter(LearningModule.is_published == True)
    
    # Apply filters
    if query:
        search_term = f"%{query}%"
        query_filter = query_filter.filter(
            or_(
                LearningModule.title.ilike(search_term),
                LearningModule.description.ilike(search_term),
                func.array_to_string(LearningModule.tags, ' ').ilike(search_term)
            )
        )
    
    if category:
        query_filter = query_filter.filter(LearningModule.category == category)
    
    if difficulty:
        query_filter = query_filter.filter(LearningModule.difficulty == difficulty)
    
    if featured_only:
        query_filter = query_filter.filter(LearningModule.is_featured == True)
    
    # Get total count
    total = query_filter.count()
    
    # Apply pagination and ordering
    modules = query_filter.order_by(
        LearningModule.is_featured.desc(),
        LearningModule.average_rating.desc(),
        LearningModule.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    # Convert to response format
    module_summaries = [LearningModuleSummary.from_orm(module) for module in modules]
    
    return ModuleSearchResponse(
        modules=module_summaries,
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + limit) < total
    )


@router.get("/modules/{module_id}", response_model=LearningModuleResponse)
async def get_learning_module(
    module_id: str,
    current_user: Optional[User] = Depends(AuthService.get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get specific learning module content.
    
    Returns module content and tracks user view for analytics.
    Public endpoint - authentication optional.
    """
    user_id = str(current_user.id) if current_user else None
    logger.info("Learning module requested", 
                module_id=module_id, 
                user_id=user_id)
    
    # Get module
    module = db.query(LearningModule).filter(
        LearningModule.id == module_id,
        LearningModule.is_published == True
    ).first()
    
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning module not found"
        )
    
    # Increment view count
    module.view_count += 1
    
    # Track user progress if authenticated
    if current_user:
        progress = db.query(ModuleProgress).filter(
            ModuleProgress.user_id == current_user.id,
            ModuleProgress.module_id == module.id
        ).first()
        
        if not progress:
            progress = ModuleProgress(
                user_id=current_user.id,
                module_id=module.id,
                is_started=True
            )
            db.add(progress)
        elif not progress.is_started:
            progress.is_started = True
            progress.started_at = func.now()
        
        progress.last_accessed_at = func.now()
    
    db.commit()
    db.refresh(module)
    
    logger.info("Learning module retrieved", 
                module_id=module_id, 
                user_id=user_id)
    
    return LearningModuleResponse.from_orm(module)


@router.post("/modules/{module_id}/progress", response_model=ModuleProgressResponse)
async def update_module_progress(
    module_id: str,
    progress_update: ProgressUpdate,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update user progress for a learning module.
    
    Tracks completion status, time spent, and performance metrics.
    """
    logger.info("Module progress update", 
                module_id=module_id, 
                user_id=str(current_user.id))
    
    # Verify module exists
    module = db.query(LearningModule).filter(
        LearningModule.id == module_id,
        LearningModule.is_published == True
    ).first()
    
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning module not found"
        )
    
    # Get or create progress record
    progress = db.query(ModuleProgress).filter(
        ModuleProgress.user_id == current_user.id,
        ModuleProgress.module_id == module.id
    ).first()
    
    if not progress:
        progress = ModuleProgress(
            user_id=current_user.id,
            module_id=module.id,
            is_started=True,
            started_at=func.now()
        )
        db.add(progress)
    
    # Update progress
    progress.time_spent += progress_update.time_spent
    progress.last_accessed_at = func.now()
    
    if progress_update.current_section:
        progress.last_accessed_section = progress_update.current_section
    
    # Calculate completion percentage based on completed sections
    if progress_update.completed_sections:
        total_sections = len(module.content_sections) if module.content_sections else 1
        completed_count = len(progress_update.completed_sections)
        progress.completion_percentage = min((completed_count / total_sections) * 100, 100.0)
        
        # Mark as completed if 100%
        if progress.completion_percentage >= 100.0 and not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = func.now()
            
            # Increment module completion count
            module.completion_count += 1
    
    db.commit()
    db.refresh(progress)
    
    logger.info("Module progress updated", 
                module_id=module_id, 
                user_id=str(current_user.id),
                completion_percentage=progress.completion_percentage)
    
    return ModuleProgressResponse.from_orm(progress)


@router.get("/modules/{module_id}/exercises", response_model=List[ExerciseResponseSchema])
async def get_module_exercises(
    module_id: str,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get exercises for a specific learning module.
    
    Returns all active exercises ordered by their sequence.
    """
    logger.info("Module exercises requested", 
                module_id=module_id, 
                user_id=str(current_user.id))
    
    # Verify module exists and user has access
    module = db.query(LearningModule).filter(
        LearningModule.id == module_id,
        LearningModule.is_published == True
    ).first()
    
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning module not found"
        )
    
    # Get exercises
    exercises = db.query(Exercise).filter(
        Exercise.module_id == module.id,
        Exercise.is_active == True
    ).order_by(Exercise.order_index).all()
    
    return [ExerciseResponseSchema.from_orm(exercise) for exercise in exercises]


@router.post("/exercises/{exercise_id}/submit", response_model=ExerciseResponseResult)
async def submit_exercise_response(
    exercise_id: str,
    submission: ExerciseSubmission,
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Submit response to an exercise and get AI-generated feedback.
    
    Processes user response, provides scoring, and generates personalized feedback.
    """
    logger.info("Exercise submission", 
                exercise_id=exercise_id, 
                user_id=str(current_user.id))
    
    # Get exercise
    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.is_active == True
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    # Evaluate response (basic implementation)
    is_correct = None
    points_earned = 0
    
    if exercise.correct_answers:
        # Simple correctness check (can be enhanced)
        user_answer = submission.user_response.get("answer")
        is_correct = user_answer in exercise.correct_answers
        points_earned = exercise.points if is_correct else 0
    else:
        # For open-ended exercises, award partial points
        points_earned = exercise.points // 2
    
    # Create response record
    response = ExerciseResponse(
        user_id=current_user.id,
        exercise_id=exercise.id,
        user_response=submission.user_response,
        is_correct=is_correct,
        points_earned=points_earned,
        points_possible=exercise.points,
        attempt_number=submission.attempt_number,
        time_taken=submission.time_taken
    )
    
    db.add(response)
    db.commit()
    db.refresh(response)
    
    # Generate AI feedback
    try:
        gemini_service = GeminiAIService()
        feedback_data = await gemini_service.generate_exercise_feedback(
            exercise_response=submission.user_response,
            correct_answer=exercise.correct_answers,
            learning_objectives=exercise.module.learning_objectives
        )
        
        # Update response with AI feedback
        response.ai_feedback = feedback_data.get("feedback")
        response.encouragement = feedback_data.get("encouragement")
        response.suggestions = feedback_data.get("improvement_suggestions", [])
        response.next_steps = feedback_data.get("next_steps", [])
        response.feedback_generated_at = func.now()
        
        db.commit()
        db.refresh(response)
        
    except Exception as e:
        logger.error("Failed to generate AI feedback", 
                     error=str(e), 
                     exercise_id=exercise_id)
        # Continue without AI feedback
    
    logger.info("Exercise response submitted", 
                exercise_id=exercise_id, 
                user_id=str(current_user.id),
                points_earned=points_earned)
    
    return ExerciseResponseResult.from_orm(response)


@router.get("/progress", response_model=List[ModuleProgressResponse])
async def get_user_learning_progress(
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user's learning progress across all modules.
    
    Returns comprehensive progress tracking for the authenticated user.
    """
    logger.info("User learning progress requested", user_id=str(current_user.id))
    
    progress_records = db.query(ModuleProgress).filter(
        ModuleProgress.user_id == current_user.id
    ).order_by(ModuleProgress.last_accessed_at.desc()).all()
    
    return [ModuleProgressResponse.from_orm(progress) for progress in progress_records]


@router.get("/stats", response_model=UserLearningStats)
async def get_user_learning_stats(
    current_user: User = Depends(AuthService.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive learning statistics for the user.
    
    Returns analytics about user's learning journey and achievements.
    """
    logger.info("User learning stats requested", user_id=str(current_user.id))
    
    # Get basic progress stats
    progress_query = db.query(ModuleProgress).filter(
        ModuleProgress.user_id == current_user.id
    )
    
    modules_started = progress_query.filter(ModuleProgress.is_started == True).count()
    modules_completed = progress_query.filter(ModuleProgress.is_completed == True).count()
    
    # Get total time and points
    total_time = db.query(func.sum(ModuleProgress.time_spent)).filter(
        ModuleProgress.user_id == current_user.id
    ).scalar() or 0
    
    total_points = db.query(func.sum(ModuleProgress.total_points_earned)).filter(
        ModuleProgress.user_id == current_user.id
    ).scalar() or 0
    
    # Get recent modules
    recent_progress = progress_query.order_by(
        ModuleProgress.last_accessed_at.desc()
    ).limit(5).all()
    
    recent_modules = []
    for progress in recent_progress:
        module = db.query(LearningModule).filter(
            LearningModule.id == progress.module_id
        ).first()
        if module:
            recent_modules.append(LearningModuleSummary.from_orm(module))
    
    return UserLearningStats(
        modules_started=modules_started,
        modules_completed=modules_completed,
        total_time_spent=total_time,
        total_points_earned=total_points,
        achievements_unlocked=0,  # TODO: Implement achievements
        current_streak=0,  # TODO: Implement streak tracking
        favorite_categories=[],  # TODO: Calculate from user activity
        recent_modules=recent_modules
    )