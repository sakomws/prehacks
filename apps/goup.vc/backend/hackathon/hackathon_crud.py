from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

import database as db_models
import hackathon_models as models

# Hackathon CRUD Operations
def create_hackathon(db: Session, hackathon: models.HackathonCreate) -> db_models.Hackathon:
    """Create a new hackathon with all related data"""
    
    # Create main hackathon
    db_hackathon = db_models.Hackathon(
        title=hackathon.title,
        description=hackathon.description,
        theme=hackathon.theme,
        hackathon_type=hackathon.hackathon_type,
        format=hackathon.format,
        start_date=hackathon.start_date,
        end_date=hackathon.end_date,
        timezone=hackathon.timezone,
        location=hackathon.location,
        virtual_platform=hackathon.virtual_platform,
        max_participants=hackathon.max_participants,
        team_formation_type=hackathon.team_formation_type,
        min_team_size=hackathon.min_team_size,
        max_team_size=hackathon.max_team_size,
        allow_solo=hackathon.allow_solo,
        registration_deadline=hackathon.registration_deadline,
        submission_deadline=hackathon.submission_deadline,
        judging_deadline=hackathon.judging_deadline,
        cover_image_url=hackathon.cover_image_url,
        rules_url=hackathon.rules_url,
        code_of_conduct_url=hackathon.code_of_conduct_url,
        organizer_id=hackathon.organizer_id
    )
    
    db.add(db_hackathon)
    db.flush()  # Get the ID
    
    # Create tracks
    for track in hackathon.tracks:
        db_track = db_models.HackathonTrack(
            hackathon_id=db_hackathon.id,
            name=track.name,
            description=track.description,
            color=track.color,
            icon=track.icon,
            max_team_size=track.max_team_size,
            submission_requirements=json.dumps(track.submission_requirements),
            judging_criteria=json.dumps(track.judging_criteria)
        )
        db.add(db_track)
    
    # Create prizes
    for prize in hackathon.prizes:
        db_prize = db_models.HackathonPrize(
            hackathon_id=db_hackathon.id,
            track_id=prize.track_id,
            name=prize.name,
            description=prize.description,
            value=prize.value,
            position=prize.position,
            sponsor=prize.sponsor
        )
        db.add(db_prize)
    
    # Create resources
    for resource in hackathon.resources:
        db_resource = db_models.HackathonResource(
            hackathon_id=db_hackathon.id,
            title=resource.title,
            description=resource.description,
            type=resource.type,
            url=resource.url,
            tags=json.dumps(resource.tags),
            track_ids=json.dumps(resource.track_ids)
        )
        db.add(db_resource)
    
    # Create schedule items
    for item in hackathon.schedule:
        db_schedule = db_models.HackathonScheduleItem(
            hackathon_id=db_hackathon.id,
            title=item.title,
            description=item.description,
            start_time=item.start_time,
            end_time=item.end_time,
            type=item.type,
            location=item.location,
            is_mandatory=item.is_mandatory,
            track_ids=json.dumps(item.track_ids)
        )
        db.add(db_schedule)
    
    db.commit()
    db.refresh(db_hackathon)
    return db_hackathon

def get_hackathon(db: Session, hackathon_id: int) -> Optional[db_models.Hackathon]:
    """Get hackathon by ID with all related data"""
    return db.query(db_models.Hackathon).filter(db_models.Hackathon.id == hackathon_id).first()

def get_hackathons(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    hackathon_type: Optional[str] = None,
    organizer_id: Optional[int] = None
) -> List[db_models.Hackathon]:
    """Get hackathons with filters"""
    query = db.query(db_models.Hackathon)
    
    if status:
        query = query.filter(db_models.Hackathon.status == status)
    if hackathon_type:
        query = query.filter(db_models.Hackathon.hackathon_type == hackathon_type)
    if organizer_id:
        query = query.filter(db_models.Hackathon.organizer_id == organizer_id)
    
    return query.order_by(desc(db_models.Hackathon.created_at)).offset(skip).limit(limit).all()

def update_hackathon_status(db: Session, hackathon_id: int, status: str) -> Optional[db_models.Hackathon]:
    """Update hackathon status"""
    hackathon = get_hackathon(db, hackathon_id)
    if hackathon:
        hackathon.status = status
        hackathon.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(hackathon)
    return hackathon

# Registration CRUD Operations
def register_participant(
    db: Session,
    hackathon_id: int,
    user_id: int,
    registration_data: Dict[str, Any]
) -> db_models.ParticipantRegistration:
    """Register a participant for a hackathon"""
    
    # Check if already registered
    existing = db.query(db_models.ParticipantRegistration).filter(
        and_(
            db_models.ParticipantRegistration.hackathon_id == hackathon_id,
            db_models.ParticipantRegistration.user_id == user_id
        )
    ).first()
    
    if existing:
        raise ValueError("User already registered for this hackathon")
    
    registration = db_models.ParticipantRegistration(
        hackathon_id=hackathon_id,
        user_id=user_id,
        skills=json.dumps(registration_data.get("skills", [])),
        experience_level=registration_data.get("experience_level", "intermediate"),
        interests=json.dumps(registration_data.get("interests", [])),
        team_preferences=json.dumps(registration_data.get("team_preferences", {})),
        dietary_restrictions=registration_data.get("dietary_restrictions"),
        emergency_contact=registration_data.get("emergency_contact"),
        status="approved"  # Auto-approve for now
    )
    
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration

def get_hackathon_participants(db: Session, hackathon_id: int) -> List[db_models.ParticipantRegistration]:
    """Get all participants for a hackathon"""
    return db.query(db_models.ParticipantRegistration).filter(
        db_models.ParticipantRegistration.hackathon_id == hackathon_id
    ).all()

# Team CRUD Operations
def create_team(
    db: Session,
    hackathon_id: int,
    track_id: int,
    team_name: str,
    leader_user_id: int,
    description: Optional[str] = None
) -> db_models.HackathonTeam:
    """Create a new team"""
    
    # Verify user is registered
    registration = db.query(db_models.ParticipantRegistration).filter(
        and_(
            db_models.ParticipantRegistration.hackathon_id == hackathon_id,
            db_models.ParticipantRegistration.user_id == leader_user_id,
            db_models.ParticipantRegistration.status == "approved"
        )
    ).first()
    
    if not registration:
        raise ValueError("User must be registered and approved to create a team")
    
    # Create team
    team = db_models.HackathonTeam(
        hackathon_id=hackathon_id,
        track_id=track_id,
        name=team_name,
        description=description
    )
    
    db.add(team)
    db.flush()
    
    # Add leader as team member
    leader_member = db_models.TeamMember(
        team_id=team.id,
        user_id=leader_user_id,
        role="leader",
        skills=registration.skills  # Already JSON string from registration
    )
    
    db.add(leader_member)
    db.commit()
    db.refresh(team)
    return team

def join_team(db: Session, team_id: int, user_id: int) -> db_models.TeamMember:
    """Add a user to an existing team"""
    
    team = db.query(db_models.HackathonTeam).filter(db_models.HackathonTeam.id == team_id).first()
    if not team:
        raise ValueError("Team not found")
    
    # Check team size limits
    current_members = len(team.members)
    hackathon = team.hackathon
    if current_members >= hackathon.max_team_size:
        raise ValueError("Team is full")
    
    # Verify user is registered
    registration = db.query(db_models.ParticipantRegistration).filter(
        and_(
            db_models.ParticipantRegistration.hackathon_id == team.hackathon_id,
            db_models.ParticipantRegistration.user_id == user_id,
            db_models.ParticipantRegistration.status == "approved"
        )
    ).first()
    
    if not registration:
        raise ValueError("User must be registered and approved to join a team")
    
    # Check if user is already on a team for this hackathon
    existing_membership = db.query(db_models.TeamMember).join(db_models.HackathonTeam).filter(
        and_(
            db_models.HackathonTeam.hackathon_id == team.hackathon_id,
            db_models.TeamMember.user_id == user_id
        )
    ).first()
    
    if existing_membership:
        raise ValueError("User is already on a team for this hackathon")
    
    # Add to team
    member = db_models.TeamMember(
        team_id=team_id,
        user_id=user_id,
        role="member",
        skills=registration.skills  # Already JSON string from registration
    )
    
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

def get_hackathon_teams(db: Session, hackathon_id: int) -> List[db_models.HackathonTeam]:
    """Get all teams for a hackathon"""
    return db.query(db_models.HackathonTeam).filter(
        db_models.HackathonTeam.hackathon_id == hackathon_id
    ).all()

def get_teams_looking_for_members(db: Session, hackathon_id: int, track_id: Optional[int] = None) -> List[db_models.HackathonTeam]:
    """Get teams that are looking for members"""
    query = db.query(db_models.HackathonTeam).filter(
        and_(
            db_models.HackathonTeam.hackathon_id == hackathon_id,
            db_models.HackathonTeam.is_looking_for_members == True
        )
    )
    
    if track_id:
        query = query.filter(db_models.HackathonTeam.track_id == track_id)
    
    return query.all()

# Submission CRUD Operations
def create_submission(
    db: Session,
    team_id: int,
    submission_data: Dict[str, Any]
) -> db_models.HackathonSubmission:
    """Create or update a team's submission"""
    
    team = db.query(db_models.HackathonTeam).filter(db_models.HackathonTeam.id == team_id).first()
    if not team:
        raise ValueError("Team not found")
    
    # Check if submission already exists
    existing = db.query(db_models.HackathonSubmission).filter(
        db_models.HackathonSubmission.team_id == team_id
    ).first()
    
    if existing:
        # Update existing submission
        existing.title = submission_data.get("title", existing.title)
        existing.description = submission_data.get("description", existing.description)
        existing.tech_stack = json.dumps(submission_data.get("tech_stack", json.loads(existing.tech_stack or "[]")))
        existing.artifacts = json.dumps(submission_data.get("artifacts", json.loads(existing.artifacts or "[]")))
        existing.version += 1
        existing.updated_at = datetime.utcnow()
        
        if submission_data.get("submit", False):
            existing.status = "submitted"
            existing.submitted_at = datetime.utcnow()
        
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new submission
        submission = db_models.HackathonSubmission(
            hackathon_id=team.hackathon_id,
            team_id=team_id,
            track_id=team.track_id,
            title=submission_data["title"],
            description=submission_data["description"],
            tech_stack=json.dumps(submission_data.get("tech_stack", [])),
            artifacts=json.dumps(submission_data.get("artifacts", [])),
            status="submitted" if submission_data.get("submit", False) else "draft"
        )
        
        if submission_data.get("submit", False):
            submission.submitted_at = datetime.utcnow()
        
        db.add(submission)
        db.commit()
        db.refresh(submission)
        return submission

def get_hackathon_submissions(db: Session, hackathon_id: int, track_id: Optional[int] = None) -> List[db_models.HackathonSubmission]:
    """Get all submissions for a hackathon"""
    query = db.query(db_models.HackathonSubmission).filter(
        db_models.HackathonSubmission.hackathon_id == hackathon_id
    )
    
    if track_id:
        query = query.filter(db_models.HackathonSubmission.track_id == track_id)
    
    return query.filter(db_models.HackathonSubmission.status == "submitted").all()

# Judging CRUD Operations
def assign_judge(
    db: Session,
    hackathon_id: int,
    judge_user_id: int,
    role: str,
    track_ids: List[int]
) -> db_models.JudgeAssignment:
    """Assign a judge to a hackathon"""
    
    assignment = db_models.JudgeAssignment(
        hackathon_id=hackathon_id,
        judge_user_id=judge_user_id,
        role=role,
        track_ids=json.dumps(track_ids)
    )
    
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

def score_submission(
    db: Session,
    submission_id: int,
    judge_user_id: int,
    criteria_scores: Dict[str, float],
    comments: Optional[str] = None,
    feedback: Optional[str] = None
) -> db_models.SubmissionScore:
    """Score a submission"""
    
    # Calculate overall score (weighted average)
    submission = db.query(db_models.HackathonSubmission).filter(
        db_models.HackathonSubmission.id == submission_id
    ).first()
    
    if not submission:
        raise ValueError("Submission not found")
    
    # Get judging criteria for the track
    track = submission.track
    criteria = json.loads(track.judging_criteria or "[]")
    
    overall_score = 0.0
    total_weight = 0.0
    
    for criterion in criteria:
        criterion_name = criterion["name"].lower().replace(" ", "_")
        if criterion_name in criteria_scores:
            weight = criterion.get("weight", 1.0)
            overall_score += criteria_scores[criterion_name] * weight
            total_weight += weight
    
    if total_weight > 0:
        overall_score = overall_score / total_weight
    
    # Check if score already exists
    existing = db.query(db_models.SubmissionScore).filter(
        and_(
            db_models.SubmissionScore.submission_id == submission_id,
            db_models.SubmissionScore.judge_user_id == judge_user_id
        )
    ).first()
    
    if existing:
        existing.criteria_scores = json.dumps(criteria_scores)
        existing.overall_score = overall_score
        existing.comments = comments
        existing.feedback = feedback
        existing.scored_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        score = db_models.SubmissionScore(
            submission_id=submission_id,
            judge_user_id=judge_user_id,
            criteria_scores=json.dumps(criteria_scores),
            overall_score=overall_score,
            comments=comments,
            feedback=feedback
        )
        
        db.add(score)
        db.commit()
        db.refresh(score)
        return score

def get_submission_scores(db: Session, submission_id: int) -> List[db_models.SubmissionScore]:
    """Get all scores for a submission"""
    return db.query(db_models.SubmissionScore).filter(
        db_models.SubmissionScore.submission_id == submission_id
    ).all()

def calculate_hackathon_winners(db: Session, hackathon_id: int) -> Dict[str, Any]:
    """Calculate winners for each track and overall"""
    
    hackathon = get_hackathon(db, hackathon_id)
    if not hackathon:
        raise ValueError("Hackathon not found")
    
    winners = {}
    
    # Calculate winners for each track
    for track in hackathon.tracks:
        track_submissions = db.query(db_models.HackathonSubmission).filter(
            and_(
                db_models.HackathonSubmission.hackathon_id == hackathon_id,
                db_models.HackathonSubmission.track_id == track.id,
                db_models.HackathonSubmission.status == "submitted"
            )
        ).all()
        
        # Calculate average scores for each submission
        submission_scores = []
        for submission in track_submissions:
            scores = get_submission_scores(db, submission.id)
            if scores:
                avg_score = sum(score.overall_score for score in scores) / len(scores)
                submission_scores.append({
                    "submission": submission,
                    "average_score": avg_score,
                    "judge_count": len(scores)
                })
        
        # Sort by average score
        submission_scores.sort(key=lambda x: x["average_score"], reverse=True)
        
        winners[f"track_{track.id}"] = {
            "track_name": track.name,
            "submissions": submission_scores[:3]  # Top 3
        }
    
    # Calculate overall winners (across all tracks)
    all_submissions = db.query(db_models.HackathonSubmission).filter(
        and_(
            db_models.HackathonSubmission.hackathon_id == hackathon_id,
            db_models.HackathonSubmission.status == "submitted"
        )
    ).all()
    
    overall_scores = []
    for submission in all_submissions:
        scores = get_submission_scores(db, submission.id)
        if scores:
            avg_score = sum(score.overall_score for score in scores) / len(scores)
            overall_scores.append({
                "submission": submission,
                "average_score": avg_score,
                "judge_count": len(scores)
            })
    
    overall_scores.sort(key=lambda x: x["average_score"], reverse=True)
    winners["overall"] = overall_scores[:3]
    
    return winners

# Analytics and Metrics
def calculate_hackathon_metrics(db: Session, hackathon_id: int) -> db_models.HackathonMetrics:
    """Calculate comprehensive metrics for a hackathon"""
    
    # Get basic counts
    total_registrations = db.query(db_models.ParticipantRegistration).filter(
        db_models.ParticipantRegistration.hackathon_id == hackathon_id
    ).count()
    
    total_participants = db.query(db_models.ParticipantRegistration).filter(
        and_(
            db_models.ParticipantRegistration.hackathon_id == hackathon_id,
            db_models.ParticipantRegistration.status == "approved"
        )
    ).count()
    
    total_teams = db.query(db_models.HackathonTeam).filter(
        db_models.HackathonTeam.hackathon_id == hackathon_id
    ).count()
    
    total_submissions = db.query(db_models.HackathonSubmission).filter(
        and_(
            db_models.HackathonSubmission.hackathon_id == hackathon_id,
            db_models.HackathonSubmission.status == "submitted"
        )
    ).count()
    
    # Calculate distributions
    registrations = get_hackathon_participants(db, hackathon_id)
    
    track_distribution = {}
    skill_distribution = {}
    experience_distribution = {}
    
    for reg in registrations:
        # Experience distribution
        exp_level = reg.experience_level
        experience_distribution[exp_level] = experience_distribution.get(exp_level, 0) + 1
        
        # Skill distribution
        skills = json.loads(reg.skills or "[]")
        for skill in skills:
            skill_distribution[skill] = skill_distribution.get(skill, 0) + 1
    
    # Track distribution (from teams)
    teams = get_hackathon_teams(db, hackathon_id)
    for team in teams:
        track_name = team.track.name
        track_distribution[track_name] = track_distribution.get(track_name, 0) + 1
    
    # Calculate completion rate
    completion_rate = (total_submissions / total_teams) if total_teams > 0 else 0.0
    
    # Calculate average team size
    total_members = sum(len(team.members) for team in teams)
    average_team_size = (total_members / total_teams) if total_teams > 0 else 0.0
    
    # Save or update metrics
    existing_metrics = db.query(db_models.HackathonMetrics).filter(
        db_models.HackathonMetrics.hackathon_id == hackathon_id
    ).first()
    
    if existing_metrics:
        existing_metrics.total_registrations = total_registrations
        existing_metrics.total_participants = total_participants
        existing_metrics.total_teams = total_teams
        existing_metrics.total_submissions = total_submissions
        existing_metrics.track_distribution = json.dumps(track_distribution)
        existing_metrics.skill_distribution = json.dumps(skill_distribution)
        existing_metrics.experience_distribution = json.dumps(experience_distribution)
        existing_metrics.completion_rate = completion_rate
        existing_metrics.average_team_size = average_team_size
        existing_metrics.calculated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(existing_metrics)
        return existing_metrics
    else:
        metrics = db_models.HackathonMetrics(
            hackathon_id=hackathon_id,
            total_registrations=total_registrations,
            total_participants=total_participants,
            total_teams=total_teams,
            total_submissions=total_submissions,
            track_distribution=json.dumps(track_distribution),
            skill_distribution=json.dumps(skill_distribution),
            experience_distribution=json.dumps(experience_distribution),
            completion_rate=completion_rate,
            average_team_size=average_team_size
        )
        
        db.add(metrics)
        db.commit()
        db.refresh(metrics)
        return metrics

# AI Enhancement Functions
def generate_team_suggestions(db: Session, hackathon_id: int, user_id: int) -> models.AITeamSuggestion:
    """Generate AI-powered team suggestions for a user"""
    
    # Get user's registration
    registration = db.query(db_models.ParticipantRegistration).filter(
        and_(
            db_models.ParticipantRegistration.hackathon_id == hackathon_id,
            db_models.ParticipantRegistration.user_id == user_id
        )
    ).first()
    
    if not registration:
        raise ValueError("User not registered for this hackathon")
    
    # Get all other participants
    other_participants = db.query(db_models.ParticipantRegistration).filter(
        and_(
            db_models.ParticipantRegistration.hackathon_id == hackathon_id,
            db_models.ParticipantRegistration.user_id != user_id,
            db_models.ParticipantRegistration.status == "approved"
        )
    ).all()
    
    # Simple matching algorithm (can be enhanced with ML)
    user_skills = set(json.loads(registration.skills or "[]"))
    user_interests = set(json.loads(registration.interests or "[]"))
    
    suggested_teammates = []
    for participant in other_participants:
        # Check if they're already on a team
        existing_team = db.query(db_models.TeamMember).join(db_models.HackathonTeam).filter(
            and_(
                db_models.HackathonTeam.hackathon_id == hackathon_id,
                db_models.TeamMember.user_id == participant.user_id
            )
        ).first()
        
        if existing_team:
            continue
        
        participant_skills = set(json.loads(participant.skills or "[]"))
        participant_interests = set(json.loads(participant.interests or "[]"))
        
        # Calculate compatibility score
        skill_overlap = len(user_skills.intersection(participant_skills))
        skill_complement = len(participant_skills - user_skills)
        interest_overlap = len(user_interests.intersection(participant_interests))
        
        match_score = (skill_complement * 0.4 + skill_overlap * 0.3 + interest_overlap * 0.3) / 10
        match_score = min(match_score, 1.0)
        
        if match_score > 0.3:  # Threshold for suggestions
            reasons = []
            if skill_complement > 0:
                reasons.append(f"Brings complementary skills: {', '.join(list(participant_skills - user_skills)[:3])}")
            if skill_overlap > 0:
                reasons.append(f"Shares skills: {', '.join(list(user_skills.intersection(participant_skills))[:2])}")
            if interest_overlap > 0:
                reasons.append(f"Common interests: {', '.join(list(user_interests.intersection(participant_interests))[:2])}")
            
            suggested_teammates.append({
                "user_id": participant.user_id,
                "match_score": round(match_score, 2),
                "reasons": reasons,
                "skills": json.loads(participant.skills or "[]"),
                "experience_level": participant.experience_level
            })
    
    # Sort by match score
    suggested_teammates.sort(key=lambda x: x["match_score"], reverse=True)
    suggested_teammates = suggested_teammates[:10]  # Top 10 suggestions
    
    # Track suggestions (simple heuristic based on skills)
    hackathon = get_hackathon(db, hackathon_id)
    suggested_tracks = []
    
    for track in hackathon.tracks:
        # Simple scoring based on track name and user skills/interests
        track_keywords = track.name.lower().split() + (track.description or "").lower().split()
        user_skills_list = json.loads(registration.skills or "[]")
        user_interests_list = json.loads(registration.interests or "[]")
        user_keywords = [skill.lower() for skill in user_skills_list] + [interest.lower() for interest in user_interests_list]
        
        keyword_matches = sum(1 for keyword in user_keywords if any(track_word in keyword or keyword in track_word for track_word in track_keywords))
        fit_score = min(keyword_matches / 5, 1.0)  # Normalize to 0-1
        
        if fit_score > 0.2:
            reasons = [f"Matches your skills/interests: {', '.join(user_keywords[:3])}"]
            suggested_tracks.append({
                "track_id": track.id,
                "track_name": track.name,
                "fit_score": round(fit_score, 2),
                "reasons": reasons
            })
    
    suggested_tracks.sort(key=lambda x: x["fit_score"], reverse=True)
    
    # Save suggestions
    existing = db.query(db_models.AITeamSuggestion).filter(
        and_(
            db_models.AITeamSuggestion.hackathon_id == hackathon_id,
            db_models.AITeamSuggestion.user_id == user_id
        )
    ).first()
    
    if existing:
        existing.suggested_teammates = json.dumps(suggested_teammates)
        existing.suggested_tracks = json.dumps(suggested_tracks)
        existing.generated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return models.AITeamSuggestion(
            user_id=user_id,
            suggested_teammates=suggested_teammates,
            suggested_tracks=suggested_tracks
        )
    else:
        suggestion = db_models.AITeamSuggestion(
            hackathon_id=hackathon_id,
            user_id=user_id,
            suggested_teammates=json.dumps(suggested_teammates),
            suggested_tracks=json.dumps(suggested_tracks)
        )
        
        db.add(suggestion)
        db.commit()
        db.refresh(suggestion)
        return models.AITeamSuggestion(
            user_id=user_id,
            suggested_teammates=suggested_teammates,
            suggested_tracks=suggested_tracks
        )