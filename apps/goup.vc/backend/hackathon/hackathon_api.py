from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

import database
import hackathon_models as models
import hackathon_crud as crud

router = APIRouter(prefix="/hackathons", tags=["hackathons"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Hackathon Management Endpoints
@router.post("/")
def create_hackathon(
    hackathon: models.HackathonCreate,
    db: Session = Depends(get_db)
):
    """Create a new hackathon"""
    try:
        h = crud.create_hackathon(db, hackathon)
        return {
            "id": h.id,
            "title": h.title,
            "description": h.description,
            "theme": h.theme,
            "hackathon_type": h.hackathon_type,
            "format": h.format,
            "status": h.status,
            "start_date": h.start_date.isoformat(),
            "end_date": h.end_date.isoformat(),
            "timezone": h.timezone,
            "location": h.location,
            "virtual_platform": h.virtual_platform,
            "max_participants": h.max_participants,
            "team_formation_type": h.team_formation_type,
            "min_team_size": h.min_team_size,
            "max_team_size": h.max_team_size,
            "allow_solo": h.allow_solo,
            "registration_deadline": h.registration_deadline.isoformat(),
            "submission_deadline": h.submission_deadline.isoformat(),
            "judging_deadline": h.judging_deadline.isoformat(),
            "cover_image_url": h.cover_image_url,
            "rules_url": h.rules_url,
            "code_of_conduct_url": h.code_of_conduct_url,
            "organizer_id": h.organizer_id,
            "created_at": h.created_at.isoformat(),
            "updated_at": h.updated_at.isoformat(),
            "tracks": [
                {
                    "id": t.id,
                    "name": t.name,
                    "description": t.description,
                    "color": t.color,
                    "icon": t.icon,
                    "max_team_size": t.max_team_size,
                    "submission_requirements": json.loads(t.submission_requirements or "[]"),
                    "judging_criteria": json.loads(t.judging_criteria or "[]")
                } for t in h.tracks
            ],
            "prizes": [
                {
                    "id": p.id,
                    "track_id": p.track_id,
                    "name": p.name,
                    "description": p.description,
                    "value": p.value,
                    "position": p.position,
                    "sponsor": p.sponsor
                } for p in h.prizes
            ],
            "resources": [
                {
                    "id": r.id,
                    "title": r.title,
                    "description": r.description,
                    "type": r.type,
                    "url": r.url,
                    "tags": json.loads(r.tags or "[]"),
                    "track_ids": json.loads(r.track_ids or "[]")
                } for r in h.resources
            ],
            "schedule": [
                {
                    "id": s.id,
                    "title": s.title,
                    "description": s.description,
                    "start_time": s.start_time.isoformat(),
                    "end_time": s.end_time.isoformat(),
                    "type": s.type,
                    "location": s.location,
                    "is_mandatory": s.is_mandatory,
                    "track_ids": json.loads(s.track_ids or "[]")
                } for s in h.schedule
            ],
            "participant_count": len(h.registrations),
            "team_count": len(h.teams),
            "submission_count": len([s for s in h.submissions if s.status == "submitted"])
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def list_hackathons(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    hackathon_type: Optional[str] = None,
    organizer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """List hackathons with filters"""
    hackathons = crud.get_hackathons(db, skip, limit, status, hackathon_type, organizer_id)
    total = len(hackathons)  # Simplified - in production, use count query
    
    # Convert to dict format for JSON response
    hackathon_list = []
    for h in hackathons:
        hackathon_dict = {
            "id": h.id,
            "title": h.title,
            "description": h.description,
            "theme": h.theme,
            "hackathon_type": h.hackathon_type,
            "format": h.format,
            "status": h.status,
            "start_date": h.start_date.isoformat(),
            "end_date": h.end_date.isoformat(),
            "timezone": h.timezone,
            "location": h.location,
            "virtual_platform": h.virtual_platform,
            "max_participants": h.max_participants,
            "team_formation_type": h.team_formation_type,
            "min_team_size": h.min_team_size,
            "max_team_size": h.max_team_size,
            "allow_solo": h.allow_solo,
            "registration_deadline": h.registration_deadline.isoformat(),
            "submission_deadline": h.submission_deadline.isoformat(),
            "judging_deadline": h.judging_deadline.isoformat(),
            "cover_image_url": h.cover_image_url,
            "rules_url": h.rules_url,
            "code_of_conduct_url": h.code_of_conduct_url,
            "organizer_id": h.organizer_id,
            "created_at": h.created_at.isoformat(),
            "updated_at": h.updated_at.isoformat(),
            "tracks": [
                {
                    "id": t.id,
                    "name": t.name,
                    "description": t.description,
                    "color": t.color,
                    "icon": t.icon,
                    "max_team_size": t.max_team_size,
                    "submission_requirements": json.loads(t.submission_requirements or "[]"),
                    "judging_criteria": json.loads(t.judging_criteria or "[]")
                } for t in h.tracks
            ],
            "prizes": [
                {
                    "id": p.id,
                    "track_id": p.track_id,
                    "name": p.name,
                    "description": p.description,
                    "value": p.value,
                    "position": p.position,
                    "sponsor": p.sponsor
                } for p in h.prizes
            ],
            "resources": [
                {
                    "id": r.id,
                    "title": r.title,
                    "description": r.description,
                    "type": r.type,
                    "url": r.url,
                    "tags": json.loads(r.tags or "[]"),
                    "track_ids": json.loads(r.track_ids or "[]")
                } for r in h.resources
            ],
            "schedule": [
                {
                    "id": s.id,
                    "title": s.title,
                    "description": s.description,
                    "start_time": s.start_time.isoformat(),
                    "end_time": s.end_time.isoformat(),
                    "type": s.type,
                    "location": s.location,
                    "is_mandatory": s.is_mandatory,
                    "track_ids": json.loads(s.track_ids or "[]")
                } for s in h.schedule
            ],
            "participant_count": len(h.registrations),
            "team_count": len(h.teams),
            "submission_count": len([s for s in h.submissions if s.status == "submitted"])
        }
        hackathon_list.append(hackathon_dict)
    
    return {
        "hackathons": hackathon_list,
        "total": total,
        "page": skip // limit + 1,
        "per_page": limit
    }

@router.get("/{hackathon_id}")
def get_hackathon(hackathon_id: int, db: Session = Depends(get_db)):
    """Get hackathon details"""
    h = crud.get_hackathon(db, hackathon_id)
    if not h:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    
    return {
        "id": h.id,
        "title": h.title,
        "description": h.description,
        "theme": h.theme,
        "hackathon_type": h.hackathon_type,
        "format": h.format,
        "status": h.status,
        "start_date": h.start_date.isoformat(),
        "end_date": h.end_date.isoformat(),
        "timezone": h.timezone,
        "location": h.location,
        "virtual_platform": h.virtual_platform,
        "max_participants": h.max_participants,
        "team_formation_type": h.team_formation_type,
        "min_team_size": h.min_team_size,
        "max_team_size": h.max_team_size,
        "allow_solo": h.allow_solo,
        "registration_deadline": h.registration_deadline.isoformat(),
        "submission_deadline": h.submission_deadline.isoformat(),
        "judging_deadline": h.judging_deadline.isoformat(),
        "cover_image_url": h.cover_image_url,
        "rules_url": h.rules_url,
        "code_of_conduct_url": h.code_of_conduct_url,
        "organizer_id": h.organizer_id,
        "created_at": h.created_at.isoformat(),
        "updated_at": h.updated_at.isoformat(),
        "tracks": [
            {
                "id": t.id,
                "name": t.name,
                "description": t.description,
                "color": t.color,
                "icon": t.icon,
                "max_team_size": t.max_team_size,
                "submission_requirements": json.loads(t.submission_requirements or "[]"),
                "judging_criteria": json.loads(t.judging_criteria or "[]")
            } for t in h.tracks
        ],
        "prizes": [
            {
                "id": p.id,
                "track_id": p.track_id,
                "name": p.name,
                "description": p.description,
                "value": p.value,
                "position": p.position,
                "sponsor": p.sponsor
            } for p in h.prizes
        ],
        "resources": [
            {
                "id": r.id,
                "title": r.title,
                "description": r.description,
                "type": r.type,
                "url": r.url,
                "tags": json.loads(r.tags or "[]"),
                "track_ids": json.loads(r.track_ids or "[]")
            } for r in h.resources
        ],
        "schedule": [
            {
                "id": s.id,
                "title": s.title,
                "description": s.description,
                "start_time": s.start_time.isoformat(),
                "end_time": s.end_time.isoformat(),
                "type": s.type,
                "location": s.location,
                "is_mandatory": s.is_mandatory,
                "track_ids": json.loads(s.track_ids or "[]")
            } for s in h.schedule
        ],
        "participant_count": len(h.registrations),
        "team_count": len(h.teams),
        "submission_count": len([s for s in h.submissions if s.status == "submitted"])
    }

@router.put("/{hackathon_id}/status")
def update_hackathon_status(
    hackathon_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update hackathon status"""
    hackathon = crud.update_hackathon_status(db, hackathon_id, status)
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    return {"message": f"Hackathon status updated to {status}"}

# Registration Endpoints
@router.post("/{hackathon_id}/register")
def register_for_hackathon(
    hackathon_id: int,
    registration_data: Dict[str, Any],
    user_id: int = 1,  # Default for demo
    db: Session = Depends(get_db)
):
    """Register a participant for a hackathon"""
    try:
        registration = crud.register_participant(db, hackathon_id, user_id, registration_data)
        return {
            "id": registration.id,
            "hackathon_id": registration.hackathon_id,
            "user_id": registration.user_id,
            "skills": json.loads(registration.skills or "[]"),
            "experience_level": registration.experience_level,
            "interests": json.loads(registration.interests or "[]"),
            "team_preferences": json.loads(registration.team_preferences or "{}"),
            "dietary_restrictions": registration.dietary_restrictions,
            "emergency_contact": registration.emergency_contact,
            "status": registration.status,
            "registered_at": registration.registered_at.isoformat()
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{hackathon_id}/participants", response_model=List[models.ParticipantRegistration])
def get_hackathon_participants(
    hackathon_id: int,
    db: Session = Depends(get_db)
):
    """Get all participants for a hackathon"""
    return crud.get_hackathon_participants(db, hackathon_id)

# Team Management Endpoints
@router.post("/{hackathon_id}/teams")
def create_team(
    hackathon_id: int,
    team_data: Dict[str, Any],
    user_id: int = 1,  # Default for demo
    db: Session = Depends(get_db)
):
    """Create a new team"""
    try:
        team = crud.create_team(
            db,
            hackathon_id,
            team_data["track_id"],
            team_data["name"],
            user_id,
            team_data.get("description")
        )
        return {
            "id": team.id,
            "hackathon_id": team.hackathon_id,
            "name": team.name,
            "description": team.description,
            "track_id": team.track_id,
            "members": [
                {
                    "user_id": m.user_id,
                    "role": m.role,
                    "skills": json.loads(m.skills or "[]"),
                    "joined_at": m.joined_at.isoformat()
                } for m in team.members
            ],
            "is_looking_for_members": team.is_looking_for_members,
            "desired_skills": json.loads(team.desired_skills or "[]"),
            "created_at": team.created_at.isoformat()
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{hackathon_id}/teams")
def get_hackathon_teams(
    hackathon_id: int,
    track_id: Optional[int] = None,
    looking_for_members: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get teams for a hackathon"""
    if looking_for_members:
        teams = crud.get_teams_looking_for_members(db, hackathon_id, track_id)
    else:
        teams = crud.get_hackathon_teams(db, hackathon_id)
    
    return [
        {
            "id": team.id,
            "hackathon_id": team.hackathon_id,
            "name": team.name,
            "description": team.description,
            "track_id": team.track_id,
            "members": [
                {
                    "user_id": m.user_id,
                    "role": m.role,
                    "skills": json.loads(m.skills or "[]"),
                    "joined_at": m.joined_at.isoformat()
                } for m in team.members
            ],
            "is_looking_for_members": team.is_looking_for_members,
            "desired_skills": json.loads(team.desired_skills or "[]"),
            "created_at": team.created_at.isoformat()
        } for team in teams
    ]

@router.post("/teams/{team_id}/join")
def join_team(
    team_id: int,
    user_id: int = 1,  # Default for demo
    db: Session = Depends(get_db)
):
    """Join an existing team"""
    try:
        member = crud.join_team(db, team_id, user_id)
        return {"message": "Successfully joined team", "member_id": member.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# AI Team Suggestions
@router.get("/{hackathon_id}/ai-suggestions", response_model=models.AITeamSuggestion)
def get_ai_team_suggestions(
    hackathon_id: int,
    user_id: int = 1,  # Default for demo
    db: Session = Depends(get_db)
):
    """Get AI-powered team and track suggestions"""
    try:
        return crud.generate_team_suggestions(db, hackathon_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Submission Endpoints
@router.post("/teams/{team_id}/submission", response_model=models.HackathonSubmission)
def create_or_update_submission(
    team_id: int,
    submission_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Create or update a team's submission"""
    try:
        return crud.create_submission(db, team_id, submission_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{hackathon_id}/submissions", response_model=List[models.HackathonSubmission])
def get_hackathon_submissions(
    hackathon_id: int,
    track_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all submissions for a hackathon"""
    return crud.get_hackathon_submissions(db, hackathon_id, track_id)

# File Upload for Submissions
@router.post("/submissions/{submission_id}/upload")
async def upload_submission_file(
    submission_id: int,
    file: UploadFile = File(...),
    artifact_type: str = Form(...),
    db: Session = Depends(get_db)
):
    """Upload a file for a submission"""
    # In production, upload to cloud storage (S3, GCS, etc.)
    # For demo, we'll just return a mock URL
    
    file_url = f"/uploads/submissions/{submission_id}/{file.filename}"
    
    # Update submission with new artifact
    submission = db.query(crud.db_models.HackathonSubmission).filter(
        crud.db_models.HackathonSubmission.id == submission_id
    ).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Add artifact to submission
    artifacts = submission.artifacts or []
    artifacts.append({
        "type": artifact_type,
        "url": file_url,
        "filename": file.filename,
        "file_size": file.size
    })
    
    submission.artifacts = artifacts
    submission.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "File uploaded successfully", "url": file_url}

# Judging Endpoints
@router.post("/{hackathon_id}/judges", response_model=models.JudgeAssignment)
def assign_judge(
    hackathon_id: int,
    judge_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Assign a judge to a hackathon"""
    try:
        return crud.assign_judge(
            db,
            hackathon_id,
            judge_data["judge_user_id"],
            judge_data["role"],
            judge_data["track_ids"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/submissions/{submission_id}/score", response_model=models.SubmissionScore)
def score_submission(
    submission_id: int,
    score_data: Dict[str, Any],
    judge_user_id: int = 1,  # Default for demo
    db: Session = Depends(get_db)
):
    """Score a submission"""
    try:
        return crud.score_submission(
            db,
            submission_id,
            judge_user_id,
            score_data["criteria_scores"],
            score_data.get("comments"),
            score_data.get("feedback")
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/submissions/{submission_id}/scores", response_model=List[models.SubmissionScore])
def get_submission_scores(
    submission_id: int,
    db: Session = Depends(get_db)
):
    """Get all scores for a submission"""
    return crud.get_submission_scores(db, submission_id)

@router.get("/{hackathon_id}/winners")
def get_hackathon_winners(
    hackathon_id: int,
    db: Session = Depends(get_db)
):
    """Calculate and return hackathon winners"""
    try:
        return crud.calculate_hackathon_winners(db, hackathon_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Analytics and Reporting
@router.get("/{hackathon_id}/metrics")
def get_hackathon_metrics(
    hackathon_id: int,
    db: Session = Depends(get_db)
):
    """Get comprehensive metrics for a hackathon"""
    metrics = crud.calculate_hackathon_metrics(db, hackathon_id)
    return {
        "hackathon_id": metrics.hackathon_id,
        "total_registrations": metrics.total_registrations,
        "total_participants": metrics.total_participants,
        "total_teams": metrics.total_teams,
        "total_submissions": metrics.total_submissions,
        "track_distribution": json.loads(metrics.track_distribution or "{}"),
        "skill_distribution": json.loads(metrics.skill_distribution or "{}"),
        "experience_distribution": json.loads(metrics.experience_distribution or "{}"),
        "completion_rate": metrics.completion_rate,
        "average_team_size": metrics.average_team_size
    }

@router.get("/{hackathon_id}/report", response_model=models.HackathonReport)
def generate_hackathon_report(
    hackathon_id: int,
    db: Session = Depends(get_db)
):
    """Generate a comprehensive hackathon report"""
    hackathon = crud.get_hackathon(db, hackathon_id)
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    
    metrics = crud.calculate_hackathon_metrics(db, hackathon_id)
    winners = crud.calculate_hackathon_winners(db, hackathon_id)
    
    # Generate AI insights (mock for demo)
    judge_feedback_summary = "Judges were impressed by the overall quality and innovation of submissions. Technical execution was strong across all tracks."
    participant_feedback_summary = "Participants appreciated the clear guidelines and responsive support. The AI team matching feature was particularly well-received."
    
    # Extract top technologies from submissions
    submissions = crud.get_hackathon_submissions(db, hackathon_id)
    tech_count = {}
    for submission in submissions:
        for tech in submission.tech_stack:
            tech_count[tech] = tech_count.get(tech, 0) + 1
    
    top_technologies = sorted(tech_count.items(), key=lambda x: x[1], reverse=True)[:10]
    top_technologies = [tech[0] for tech in top_technologies]
    
    recommendations = [
        "Consider adding more workshops for beginner participants",
        "Extend submission deadline by 2 hours based on participant feedback",
        "Add more diverse judging criteria for design track",
        "Provide more API documentation and examples"
    ]
    
    return models.HackathonReport(
        hackathon=hackathon,
        metrics=metrics,
        winners=winners,
        judge_feedback_summary=judge_feedback_summary,
        participant_feedback_summary=participant_feedback_summary,
        top_technologies=top_technologies,
        recommendations=recommendations,
        generated_at=datetime.utcnow()
    )

# Template and Helper Endpoints
@router.get("/templates/judging-criteria")
def get_judging_criteria_templates():
    """Get predefined judging criteria templates"""
    return {"templates": models.JUDGING_CRITERIA_TEMPLATES}

@router.get("/{hackathon_id}/schedule")
def get_hackathon_schedule(
    hackathon_id: int,
    track_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get hackathon schedule with timezone-aware times"""
    hackathon = crud.get_hackathon(db, hackathon_id)
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    
    schedule_items = hackathon.schedule
    
    if track_id:
        # Filter for specific track
        schedule_items = [
            item for item in schedule_items
            if not item.track_ids or track_id in item.track_ids
        ]
    
    return {
        "hackathon_timezone": hackathon.timezone,
        "schedule": schedule_items
    }

@router.get("/{hackathon_id}/resources")
def get_hackathon_resources(
    hackathon_id: int,
    track_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get hackathon resources with filters"""
    hackathon = crud.get_hackathon(db, hackathon_id)
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    
    resources = hackathon.resources
    
    # Apply filters
    if track_id:
        resources = [
            resource for resource in resources
            if not resource.track_ids or track_id in resource.track_ids
        ]
    
    if resource_type:
        resources = [
            resource for resource in resources
            if resource.type == resource_type
        ]
    
    # Group by type for better organization
    grouped_resources = {}
    for resource in resources:
        if resource.type not in grouped_resources:
            grouped_resources[resource.type] = []
        grouped_resources[resource.type].append(resource)
    
    return {
        "resources_by_type": grouped_resources,
        "total_resources": len(resources)
    }

# Dashboard Endpoints for Organizers
@router.get("/{hackathon_id}/dashboard")
def get_organizer_dashboard(
    hackathon_id: int,
    db: Session = Depends(get_db)
):
    """Get organizer dashboard data"""
    hackathon = crud.get_hackathon(db, hackathon_id)
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    
    metrics = crud.calculate_hackathon_metrics(db, hackathon_id)
    
    # Recent activity (mock for demo)
    recent_activity = [
        {"type": "registration", "message": "5 new participants registered", "timestamp": datetime.utcnow()},
        {"type": "team_formation", "message": "Team 'AI Innovators' was created", "timestamp": datetime.utcnow()},
        {"type": "submission", "message": "Team 'Code Crushers' submitted their project", "timestamp": datetime.utcnow()},
    ]
    
    # Upcoming deadlines
    now = datetime.utcnow()
    upcoming_deadlines = []
    
    if hackathon.registration_deadline > now:
        upcoming_deadlines.append({
            "type": "registration",
            "deadline": hackathon.registration_deadline,
            "description": "Registration closes"
        })
    
    if hackathon.submission_deadline > now:
        upcoming_deadlines.append({
            "type": "submission",
            "deadline": hackathon.submission_deadline,
            "description": "Submission deadline"
        })
    
    if hackathon.judging_deadline > now:
        upcoming_deadlines.append({
            "type": "judging",
            "deadline": hackathon.judging_deadline,
            "description": "Judging deadline"
        })
    
    return {
        "hackathon": hackathon,
        "metrics": metrics,
        "recent_activity": recent_activity,
        "upcoming_deadlines": upcoming_deadlines,
        "status_summary": {
            "registration_open": hackathon.status in ["published", "registration_open"],
            "in_progress": hackathon.status == "in_progress",
            "judging_phase": hackathon.status == "judging",
            "completed": hackathon.status == "completed"
        }
    }