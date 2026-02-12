"""
Hackathon Agent - Independent agent for managing hackathons, teams, and submissions.
Handles hackathon creation, team formation, submission management, and judging.
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import database
import hackathon_database
import hackathon_models
import hackathon_crud


class HackathonAgent:
    """Independent agent for hackathon management."""
    
    def __init__(self, db: Session):
        """Initialize the hackathon agent with a database session."""
        self.db = db
    
    def get_hackathons(
        self,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get list of hackathons with optional status filter."""
        query = self.db.query(database.Hackathon)
        
        if status:
            query = query.filter(database.Hackathon.status == status)
        
        hackathons = query.order_by(desc(database.Hackathon.start_date)).offset(skip).limit(limit).all()
        
        result = []
        for hackathon in hackathons:
            result.append({
                "id": hackathon.id,
                "title": hackathon.title,
                "description": hackathon.description,
                "theme": hackathon.theme,
                "hackathon_type": hackathon.hackathon_type,
                "format": hackathon.format,
                "status": hackathon.status,
                "start_date": hackathon.start_date.isoformat() if hackathon.start_date else None,
                "end_date": hackathon.end_date.isoformat() if hackathon.end_date else None,
                "location": hackathon.location,
                "virtual_platform": hackathon.virtual_platform,
                "organizer": {
                    "id": hackathon.organizer_id,
                    "name": hackathon.organizer.full_name if hackathon.organizer else "Unknown"
                },
                "cover_image_url": hackathon.cover_image_url,
                "registration_deadline": hackathon.registration_deadline.isoformat() if hackathon.registration_deadline else None,
                "submission_deadline": hackathon.submission_deadline.isoformat() if hackathon.submission_deadline else None
            })
        
        return result
    
    def get_hackathon(self, hackathon_id: int) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific hackathon."""
        hackathon = self.db.query(database.Hackathon).filter(
            database.Hackathon.id == hackathon_id
        ).first()
        
        if not hackathon:
            return None
        
        # Get registration count
        registration_count = self.db.query(database.ParticipantRegistration).filter(
            database.ParticipantRegistration.hackathon_id == hackathon_id
        ).count()
        
        # Get team count
        team_count = self.db.query(database.HackathonTeam).filter(
            database.HackathonTeam.hackathon_id == hackathon_id
        ).count()
        
        return {
            "id": hackathon.id,
            "title": hackathon.title,
            "description": hackathon.description,
            "theme": hackathon.theme,
            "hackathon_type": hackathon.hackathon_type,
            "format": hackathon.format,
            "status": hackathon.status,
            "start_date": hackathon.start_date.isoformat() if hackathon.start_date else None,
            "end_date": hackathon.end_date.isoformat() if hackathon.end_date else None,
            "timezone": hackathon.timezone,
            "location": hackathon.location,
            "virtual_platform": hackathon.virtual_platform,
            "team_formation_type": hackathon.team_formation_type,
            "min_team_size": hackathon.min_team_size,
            "max_team_size": hackathon.max_team_size,
            "allow_solo": hackathon.allow_solo,
            "max_participants": hackathon.max_participants,
            "registration_deadline": hackathon.registration_deadline.isoformat() if hackathon.registration_deadline else None,
            "submission_deadline": hackathon.submission_deadline.isoformat() if hackathon.submission_deadline else None,
            "judging_deadline": hackathon.judging_deadline.isoformat() if hackathon.judging_deadline else None,
            "organizer": {
                "id": hackathon.organizer_id,
                "name": hackathon.organizer.full_name if hackathon.organizer else "Unknown"
            },
            "cover_image_url": hackathon.cover_image_url,
            "rules_url": hackathon.rules_url,
            "code_of_conduct_url": hackathon.code_of_conduct_url,
            "registration_count": registration_count,
            "team_count": team_count,
            "tracks": [{"id": track.id, "name": track.name} for track in hackathon.tracks] if hasattr(hackathon, 'tracks') else []
        }
    
    def create_hackathon(self, hackathon_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new hackathon."""
        try:
            # Validate organizer exists
            organizer = self.db.query(database.User).filter(
                database.User.id == hackathon_data.get("organizer_id")
            ).first()
            
            if not organizer:
                return {"error": "Organizer not found"}
            
            # Create hackathon
            hackathon = database.Hackathon(
                title=hackathon_data.get("title"),
                description=hackathon_data.get("description"),
                theme=hackathon_data.get("theme"),
                hackathon_type=hackathon_data.get("hackathon_type", "general"),
                format=hackathon_data.get("format", "hybrid"),
                status=hackathon_data.get("status", "draft"),
                start_date=hackathon_data.get("start_date"),
                end_date=hackathon_data.get("end_date"),
                timezone=hackathon_data.get("timezone", "UTC"),
                location=hackathon_data.get("location"),
                virtual_platform=hackathon_data.get("virtual_platform"),
                team_formation_type=hackathon_data.get("team_formation_type", "open"),
                min_team_size=hackathon_data.get("min_team_size", 1),
                max_team_size=hackathon_data.get("max_team_size", 4),
                allow_solo=hackathon_data.get("allow_solo", True),
                max_participants=hackathon_data.get("max_participants"),
                registration_deadline=hackathon_data.get("registration_deadline"),
                submission_deadline=hackathon_data.get("submission_deadline"),
                judging_deadline=hackathon_data.get("judging_deadline"),
                organizer_id=hackathon_data.get("organizer_id"),
                cover_image_url=hackathon_data.get("cover_image_url"),
                rules_url=hackathon_data.get("rules_url"),
                code_of_conduct_url=hackathon_data.get("code_of_conduct_url")
            )
            
            self.db.add(hackathon)
            self.db.commit()
            self.db.refresh(hackathon)
            
            return {
                "id": hackathon.id,
                "title": hackathon.title,
                "message": "Hackathon created successfully"
            }
        except Exception as e:
            self.db.rollback()
            return {"error": str(e)}
    
    def register_participant(
        self, 
        hackathon_id: int, 
        user_id: int,
        skills: Optional[List[str]] = None,
        interests: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Register a user as a participant in a hackathon."""
        # Check if hackathon exists
        hackathon = self.db.query(database.Hackathon).filter(
            database.Hackathon.id == hackathon_id
        ).first()
        
        if not hackathon:
            return {"error": "Hackathon not found"}
        
        # Check if already registered
        existing = self.db.query(database.ParticipantRegistration).filter(
            database.ParticipantRegistration.hackathon_id == hackathon_id,
            database.ParticipantRegistration.user_id == user_id
        ).first()
        
        if existing:
            return {"error": "Already registered", "registration_id": existing.id}
        
        # Check registration deadline
        if hackathon.registration_deadline and datetime.utcnow() > hackathon.registration_deadline:
            return {"error": "Registration deadline has passed"}
        
        try:
            import json
            registration = database.ParticipantRegistration(
                hackathon_id=hackathon_id,
                user_id=user_id,
                skills=json.dumps(skills) if skills else None,
                interests=json.dumps(interests) if interests else None,
                experience_level="intermediate",  # Default, should be passed as parameter
                status="registered"
            )
            
            self.db.add(registration)
            self.db.commit()
            self.db.refresh(registration)
            
            return {
                "id": registration.id,
                "hackathon_id": hackathon_id,
                "user_id": user_id,
                "status": registration.status,
                "message": "Successfully registered"
            }
        except Exception as e:
            self.db.rollback()
            return {"error": str(e)}
    
    def create_team(
        self,
        hackathon_id: int,
        team_name: str,
        leader_id: int,
        member_ids: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """Create a team for a hackathon."""
        hackathon = self.db.query(database.Hackathon).filter(
            database.Hackathon.id == hackathon_id
        ).first()
        
        if not hackathon:
            return {"error": "Hackathon not found"}
        
        # Validate team size
        total_members = 1 + (len(member_ids) if member_ids else 0)
        if total_members < hackathon.min_team_size:
            return {"error": f"Team must have at least {hackathon.min_team_size} members"}
        if total_members > hackathon.max_team_size:
            return {"error": f"Team cannot have more than {hackathon.max_team_size} members"}
        
        try:
            # Get first track for the hackathon (required field)
            track = self.db.query(database.HackathonTrack).filter(
                database.HackathonTrack.hackathon_id == hackathon_id
            ).first()
            
            if not track:
                return {"error": "Hackathon must have at least one track"}
            
            # Create team
            team = database.HackathonTeam(
                hackathon_id=hackathon_id,
                track_id=track.id,
                name=team_name,
                is_looking_for_members=False
            )
            
            self.db.add(team)
            self.db.flush()
            
            # Add leader as team member
            leader_member = database.TeamMember(
                team_id=team.id,
                user_id=leader_id,
                role="leader"
            )
            self.db.add(leader_member)
            
            # Add other members
            if member_ids:
                for member_id in member_ids:
                    if member_id != leader_id:
                        member = database.TeamMember(
                            team_id=team.id,
                            user_id=member_id,
                            role="member"
                        )
                        self.db.add(member)
            
            self.db.commit()
            self.db.refresh(team)
            
            return {
                "id": team.id,
                "name": team.name,
                "hackathon_id": hackathon_id,
                "leader_id": leader_id,
                "message": "Team created successfully"
            }
        except Exception as e:
            self.db.rollback()
            return {"error": str(e)}
    
    def submit_project(
        self,
        hackathon_id: int,
        team_id: int,
        track_id: int,
        project_name: str,
        description: str,
        tech_stack: Optional[List[str]] = None,
        artifacts: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Submit a project for a hackathon."""
        hackathon = self.db.query(database.Hackathon).filter(
            database.Hackathon.id == hackathon_id
        ).first()
        
        if not hackathon:
            return {"error": "Hackathon not found"}
        
        # Check submission deadline
        if hackathon.submission_deadline and datetime.utcnow() > hackathon.submission_deadline:
            return {"error": "Submission deadline has passed"}
        
        try:
            import json
            submission = database.HackathonSubmission(
                hackathon_id=hackathon_id,
                team_id=team_id,
                track_id=track_id,
                title=project_name,
                description=description,
                tech_stack=json.dumps(tech_stack) if tech_stack else None,
                artifacts=json.dumps(artifacts) if artifacts else None,
                status="submitted",
                submitted_at=datetime.utcnow()
            )
            
            self.db.add(submission)
            self.db.commit()
            self.db.refresh(submission)
            
            return {
                "id": submission.id,
                "title": submission.title,
                "status": submission.status,
                "message": "Project submitted successfully"
            }
        except Exception as e:
            self.db.rollback()
            return {"error": str(e)}
    
    def get_teams(self, hackathon_id: int) -> List[Dict[str, Any]]:
        """Get all teams for a hackathon."""
        teams = self.db.query(database.HackathonTeam).filter(
            database.HackathonTeam.hackathon_id == hackathon_id
        ).all()
        
        result = []
        for team in teams:
            members = self.db.query(database.TeamMember).filter(
                database.TeamMember.team_id == team.id
            ).all()
            
            # Find leader (member with role="leader")
            leader = next((m for m in members if m.role == "leader"), None)
            
            result.append({
                "id": team.id,
                "name": team.name,
                "leader_id": leader.user_id if leader else None,
                "leader_name": leader.user.full_name if leader and leader.user else "Unknown",
                "members": [{
                    "id": member.user_id,
                    "name": member.user.full_name if member.user else "Unknown",
                    "role": member.role
                } for member in members]
            })
        
        return result
    
    def get_submissions(self, hackathon_id: int) -> List[Dict[str, Any]]:
        """Get all submissions for a hackathon."""
        submissions = self.db.query(database.HackathonSubmission).filter(
            database.HackathonSubmission.hackathon_id == hackathon_id
        ).all()
        
        result = []
        for submission in submissions:
            import json
            result.append({
                "id": submission.id,
                "title": submission.title,
                "description": submission.description,
                "status": submission.status,
                "tech_stack": json.loads(submission.tech_stack) if submission.tech_stack else [],
                "artifacts": json.loads(submission.artifacts) if submission.artifacts else {},
                "team_id": submission.team_id,
                "team_name": submission.team.name if submission.team else "Unknown",
                "track_id": submission.track_id,
                "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None
            })
        
        return result
    
    def get_ai_team_suggestions(
        self,
        hackathon_id: int,
        user_id: int
    ) -> List[Dict[str, Any]]:
        """Get AI-powered team formation suggestions."""
        # This would use AI to match users based on skills and interests
        # For now, return mock suggestions
        suggestions = self.db.query(database.AITeamSuggestion).filter(
            database.AITeamSuggestion.hackathon_id == hackathon_id,
            database.AITeamSuggestion.user_id == user_id
        ).all()
        
        return [{
            "id": sug.id,
            "suggested_user_id": sug.suggested_user_id,
            "suggested_user_name": sug.suggested_user.full_name if sug.suggested_user else "Unknown",
            "match_score": sug.match_score,
            "reason": sug.reason
        } for sug in suggestions]


# Standalone functions for easy import
def create_hackathon_agent(db: Session) -> HackathonAgent:
    """Factory function to create a hackathon agent."""
    return HackathonAgent(db)

