from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class HackathonType(str, Enum):
    INTERNAL = "internal"
    PUBLIC = "public"

class HackathonFormat(str, Enum):
    IN_PERSON = "in_person"
    VIRTUAL = "virtual"
    HYBRID = "hybrid"

class HackathonStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    REGISTRATION_OPEN = "registration_open"
    REGISTRATION_CLOSED = "registration_closed"
    IN_PROGRESS = "in_progress"
    JUDGING = "judging"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TeamFormationType(str, Enum):
    OPEN = "open"
    INVITE_ONLY = "invite_only"
    AI_MATCHMAKING = "ai_matchmaking"

class SubmissionStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    LATE = "late"
    DISQUALIFIED = "disqualified"

class JudgeRole(str, Enum):
    LEAD_JUDGE = "lead_judge"
    TRACK_JUDGE = "track_judge"
    TECHNICAL_JUDGE = "technical_judge"

# Base Models
class HackathonTrack(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    color: str
    icon: str
    max_team_size: int = 4
    submission_requirements: List[str]
    judging_criteria: List[Dict[str, Any]]  # [{"name": "Impact", "weight": 0.3, "description": "..."}]

class HackathonPrize(BaseModel):
    id: Optional[int] = None
    track_id: Optional[int] = None  # None for overall prizes
    name: str
    description: str
    value: Optional[str] = None  # "$5000" or "AWS Credits"
    position: int  # 1st, 2nd, 3rd place
    sponsor: Optional[str] = None

class HackathonResource(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    type: str  # "dataset", "api", "repo", "guide", "tool"
    url: str
    tags: List[str]
    track_ids: List[int] = []  # Empty means available to all tracks

class HackathonScheduleItem(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    type: str  # "kickoff", "workshop", "deadline", "judging", "presentation"
    location: Optional[str] = None
    is_mandatory: bool = False
    track_ids: List[int] = []  # Empty means for all tracks

# Main Hackathon Model
class HackathonBase(BaseModel):
    title: str
    description: str
    theme: Optional[str] = None
    hackathon_type: HackathonType
    format: HackathonFormat
    start_date: datetime
    end_date: datetime
    timezone: str
    location: Optional[str] = None
    virtual_platform: Optional[str] = None  # Zoom, Discord, etc.
    max_participants: Optional[int] = None
    team_formation_type: TeamFormationType
    min_team_size: int = 1
    max_team_size: int = 4
    allow_solo: bool = True
    registration_deadline: datetime
    submission_deadline: datetime
    judging_deadline: datetime
    cover_image_url: Optional[str] = None
    rules_url: Optional[str] = None
    code_of_conduct_url: Optional[str] = None

class HackathonCreate(HackathonBase):
    organizer_id: int
    tracks: List[HackathonTrack]
    prizes: List[HackathonPrize]
    resources: List[HackathonResource] = []
    schedule: List[HackathonScheduleItem] = []

class Hackathon(HackathonBase):
    id: int
    organizer_id: int
    status: HackathonStatus
    tracks: List[HackathonTrack]
    prizes: List[HackathonPrize]
    resources: List[HackathonResource]
    schedule: List[HackathonScheduleItem]
    participant_count: int = 0
    team_count: int = 0
    submission_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Team Models
class TeamMember(BaseModel):
    user_id: int
    role: str  # "leader", "member"
    skills: List[str]
    joined_at: datetime

class HackathonTeam(BaseModel):
    id: int
    hackathon_id: int
    name: str
    description: Optional[str] = None
    track_id: int
    members: List[TeamMember]
    is_looking_for_members: bool = False
    desired_skills: List[str] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

# Registration Models
class ParticipantRegistration(BaseModel):
    id: int
    hackathon_id: int
    user_id: int
    skills: List[str]
    experience_level: str  # "beginner", "intermediate", "advanced"
    interests: List[str]
    team_preferences: Dict[str, Any]  # {"preferred_size": 3, "looking_for": ["backend", "design"]}
    dietary_restrictions: Optional[str] = None
    emergency_contact: Optional[str] = None
    status: str  # "pending", "approved", "rejected"
    registered_at: datetime
    
    class Config:
        from_attributes = True

# Submission Models
class SubmissionArtifact(BaseModel):
    type: str  # "presentation", "repo", "demo_video", "demo_link"
    url: str
    filename: Optional[str] = None
    file_size: Optional[int] = None

class HackathonSubmission(BaseModel):
    id: int
    hackathon_id: int
    team_id: int
    track_id: int
    title: str
    description: str
    tech_stack: List[str]
    artifacts: List[SubmissionArtifact]
    status: SubmissionStatus
    submitted_at: Optional[datetime] = None
    version: int = 1
    
    class Config:
        from_attributes = True

# Judging Models
class JudgeAssignment(BaseModel):
    id: int
    hackathon_id: int
    judge_user_id: int
    role: JudgeRole
    track_ids: List[int]  # Tracks this judge evaluates
    assigned_at: datetime
    
    class Config:
        from_attributes = True

class SubmissionScore(BaseModel):
    id: int
    submission_id: int
    judge_user_id: int
    criteria_scores: Dict[str, float]  # {"impact": 4.5, "technical": 3.8, "design": 4.2}
    overall_score: float
    comments: Optional[str] = None
    feedback: Optional[str] = None  # Public feedback for participants
    scored_at: datetime
    
    class Config:
        from_attributes = True

# Analytics Models
class HackathonMetrics(BaseModel):
    hackathon_id: int
    total_registrations: int
    total_participants: int
    total_teams: int
    total_submissions: int
    track_distribution: Dict[str, int]
    skill_distribution: Dict[str, int]
    experience_distribution: Dict[str, int]
    completion_rate: float
    average_team_size: float
    
class HackathonReport(BaseModel):
    hackathon: Hackathon
    metrics: HackathonMetrics
    winners: List[Dict[str, Any]]  # Winners per track and overall
    judge_feedback_summary: str
    participant_feedback_summary: str
    top_technologies: List[str]
    recommendations: List[str]
    generated_at: datetime

# AI Enhancement Models
class AITeamSuggestion(BaseModel):
    user_id: int
    suggested_teammates: List[Dict[str, Any]]  # [{"user_id": 123, "match_score": 0.85, "reasons": [...]}]
    suggested_tracks: List[Dict[str, Any]]  # [{"track_id": 1, "fit_score": 0.92, "reasons": [...]}]

class AISubmissionSummary(BaseModel):
    submission_id: int
    summary: str
    key_features: List[str]
    technical_highlights: List[str]
    innovation_score: float
    complexity_score: float
    generated_at: datetime

# Request/Response Models
class HackathonListResponse(BaseModel):
    hackathons: List[Hackathon]
    total: int
    page: int
    per_page: int

class TeamFormationRequest(BaseModel):
    hackathon_id: int
    user_id: int
    preferred_track_id: Optional[int] = None
    team_name: Optional[str] = None
    looking_for_team: bool = True

class JudgingCriteriaTemplate(BaseModel):
    name: str
    criteria: List[Dict[str, Any]]
    description: str
    suitable_for: List[str]  # ["technical", "design", "business"]

# Common templates for judging criteria
JUDGING_CRITERIA_TEMPLATES = [
    {
        "name": "Technical Innovation",
        "criteria": [
            {"name": "Technical Complexity", "weight": 0.25, "description": "Sophistication of implementation"},
            {"name": "Innovation", "weight": 0.25, "description": "Novelty and creativity of approach"},
            {"name": "Code Quality", "weight": 0.20, "description": "Clean, maintainable, well-documented code"},
            {"name": "Functionality", "weight": 0.30, "description": "Does it work as intended?"}
        ],
        "suitable_for": ["technical", "ai", "blockchain"]
    },
    {
        "name": "Product & Design",
        "criteria": [
            {"name": "User Experience", "weight": 0.30, "description": "Intuitive and engaging user interface"},
            {"name": "Market Potential", "weight": 0.25, "description": "Commercial viability and market fit"},
            {"name": "Design Quality", "weight": 0.25, "description": "Visual design and usability"},
            {"name": "Problem Solving", "weight": 0.20, "description": "How well does it solve the problem?"}
        ],
        "suitable_for": ["design", "product", "business"]
    },
    {
        "name": "Social Impact",
        "criteria": [
            {"name": "Impact Potential", "weight": 0.35, "description": "Potential to create positive change"},
            {"name": "Feasibility", "weight": 0.25, "description": "Realistic implementation and scaling"},
            {"name": "Innovation", "weight": 0.20, "description": "Creative approach to social challenges"},
            {"name": "Presentation", "weight": 0.20, "description": "Clear communication of impact"}
        ],
        "suitable_for": ["social", "sustainability", "healthcare"]
    }
]