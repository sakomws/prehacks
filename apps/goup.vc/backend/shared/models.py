from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# User models
class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Conversation models
class ConversationBase(BaseModel):
    title: str
    intent: str
    status: str = 'active'
    needs_action: bool = False
    action_type: Optional[str] = None
    ai_summary: Optional[str] = None
    priority: int = 0

class ConversationCreate(ConversationBase):
    participant_ids: List[int]

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    intent: Optional[str] = None
    status: Optional[str] = None
    needs_action: Optional[bool] = None
    action_type: Optional[str] = None
    ai_summary: Optional[str] = None
    priority: Optional[int] = None

class Conversation(ConversationBase):
    id: int
    participants: List[User]
    unread_count: int = 0
    last_activity: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Message models
class MessageBase(BaseModel):
    content: str
    message_type: str = 'text'

class MessageCreate(MessageBase):
    conversation_id: int
    sender_id: int

class Message(MessageBase):
    id: int
    conversation_id: int
    sender: User
    created_at: datetime
    
    class Config:
        from_attributes = True

# Mute setting models
class MuteSettingBase(BaseModel):
    mute_type: str
    mute_until: Optional[datetime] = None

class MuteSettingCreate(MuteSettingBase):
    conversation_id: int
    user_id: int

class MuteSetting(MuteSettingBase):
    id: int
    conversation_id: int
    user_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Event models
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    is_public: bool = True
    requires_approval: bool = False
    ticket_price: str = "Free"
    cover_image_url: Optional[str] = None

class EventCreate(EventBase):
    organizer_id: int
    cohost_ids: Optional[List[int]] = []

class Event(EventBase):
    id: int
    organizer: User
    cohosts: List[User] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

# RSVP models
class EventRSVPBase(BaseModel):
    status: str
    message: Optional[str] = None

class EventRSVPCreate(EventRSVPBase):
    event_id: int
    user_id: int

class EventRSVPUpdate(BaseModel):
    status: Optional[str] = None
    response_message: Optional[str] = None

class EventRSVP(EventRSVPBase):
    id: int
    event_id: int
    user: User
    response_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Host approval models
class HostApprovalRequestBase(BaseModel):
    request_type: str
    message: Optional[str] = None

class HostApprovalRequestCreate(HostApprovalRequestBase):
    event_id: int
    requester_id: int
    requested_user_id: int

class HostApprovalRequestUpdate(BaseModel):
    status: Optional[str] = None
    response_message: Optional[str] = None

class HostApprovalRequest(HostApprovalRequestBase):
    id: int
    event_id: int
    requester: User
    requested_user: User
    status: str
    response_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# AI models
class AIReplyRequest(BaseModel):
    conversation_id: int
    template_id: Optional[str] = None
    custom_prompt: Optional[str] = None

class AIReplyResponse(BaseModel):
    generated_reply: str
    conversation_context: str

class ConversationSummaryRequest(BaseModel):
    conversation_id: int

class ConversationSummaryResponse(BaseModel):
    summary: str
    key_decisions: List[str]
    open_questions: List[str]
    deadlines: List[str]

# Company page models
class AboutPage(BaseModel):
    title: str
    subtitle: str
    mission: str
    vision: str
    values: List[str]
    team_members: List[dict]
    stats: dict
    story: str

class BlogPost(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: str
    content: str
    author: str
    author_avatar: str
    published_date: str
    read_time: str
    tags: List[str]
    featured_image: str

class BlogPage(BaseModel):
    featured_posts: List[BlogPost]
    recent_posts: List[BlogPost]
    categories: List[str]

class JobPosting(BaseModel):
    id: int
    title: str
    department: str
    location: str
    type: str  # full-time, part-time, contract
    description: str
    requirements: List[str]
    benefits: List[str]
    posted_date: str

class CareersPage(BaseModel):
    company_culture: str
    benefits: List[str]
    open_positions: List[JobPosting]
    values: List[str]
    perks: List[str]

class ContactInfo(BaseModel):
    email: str
    phone: Optional[str]
    address: str
    social_links: dict

class ContactPage(BaseModel):
    contact_info: ContactInfo
    office_locations: List[dict]
    support_options: List[dict]
    faq: List[dict]