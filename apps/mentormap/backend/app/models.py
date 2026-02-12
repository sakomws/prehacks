"""Database models"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_mentor = Column(Boolean, default=False)
    status = Column(String, default="active")  # active, inactive, suspended
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    mentor_profile = relationship("Mentor", back_populates="user", uselist=False)
    sessions_as_student = relationship("Session", foreign_keys="Session.student_id", back_populates="student")
    roadmaps = relationship("Roadmap", back_populates="user")
    sent_messages = relationship("ChatMessage", foreign_keys="ChatMessage.sender_id", back_populates="sender")
    received_messages = relationship("ChatMessage", foreign_keys="ChatMessage.recipient_id", back_populates="recipient")


class Mentor(Base):
    """Mentor profile model"""
    __tablename__ = "mentors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    title = Column(String, nullable=False)
    bio = Column(Text)
    expertise = Column(String)  # JSON string of expertise areas
    hourly_rate = Column(Float, default=100.0)
    rating = Column(Float, default=5.0)
    total_sessions = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    linkedin_url = Column(String)
    website_url = Column(String)
    profile_image_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="mentor_profile")
    sessions = relationship("Session", back_populates="mentor")
    packages = relationship("Package", back_populates="mentor")


class Session(Base):
    """Mentorship session model"""
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    mentor_id = Column(Integer, ForeignKey("mentors.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    scheduled_at = Column(DateTime)
    duration_minutes = Column(Integer, default=60)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled
    price = Column(Float)
    payment_status = Column(String, default="pending")  # pending, paid, refunded
    stripe_payment_id = Column(String)
    notes = Column(Text)
    rating = Column(Float)  # 1-5 star rating
    review = Column(Text)  # Optional review text
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("User", foreign_keys=[student_id], back_populates="sessions_as_student")
    mentor = relationship("Mentor", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session")


class Roadmap(Base):
    """Learning roadmap model"""
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    target_company = Column(String)
    target_role = Column(String)
    milestones = Column(Text)  # JSON string of milestones
    progress = Column(Integer, default=0)  # 0-100
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="roadmaps")


class PromoCode(Base):
    """Promo code model"""
    __tablename__ = "promo_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    discount_percent = Column(Float, nullable=False)
    description = Column(String)
    is_active = Column(Boolean, default=True)
    max_uses = Column(Integer)  # None for unlimited
    current_uses = Column(Integer, default=0)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class MentorAvailability(Base):
    """Mentor availability schedule model"""
    __tablename__ = "mentor_availability"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("mentors.id"))
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(String, nullable=False)  # Format: "09:00"
    end_time = Column(String, nullable=False)    # Format: "17:00"
    timezone = Column(String, default="UTC")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    mentor = relationship("Mentor", backref="availability_slots")


class MentorTimeOff(Base):
    """Mentor time off/unavailable periods model"""
    __tablename__ = "mentor_time_off"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("mentors.id"))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    reason = Column(String)  # vacation, sick, personal, etc.
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    mentor = relationship("Mentor", backref="time_off_periods")


class MentorApplication(Base):
    """Mentor application model"""
    __tablename__ = "mentor_applications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    bio = Column(Text)
    experience = Column(String)  # e.g., "5-10", "10-15"
    expertise = Column(Text)  # Areas of expertise
    hourly_rate = Column(Float, nullable=False)
    linkedin_url = Column(String)
    website_url = Column(String)
    availability = Column(String)  # e.g., "weekdays", "weekends", "flexible"
    certifications = Column(Text)
    why_mentor = Column(Text)  # Why they want to mentor
    mentorship_style = Column(Text)  # Their mentorship approach
    success_stories = Column(Text)  # Previous mentoring success stories
    status = Column(String, default="pending")  # pending, approved, rejected
    notes = Column(Text)  # Admin notes
    submitted_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    created_mentor_id = Column(Integer, ForeignKey("mentors.id"))  # If approved

    # Relationships
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    created_mentor = relationship("Mentor", foreign_keys=[created_mentor_id])


class Event(Base):
    """Event model"""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    event_type = Column(String, nullable=False)  # workshop, meetup, webinar, etc.
    date = Column(String, nullable=False)  # YYYY-MM-DD format
    time = Column(String, nullable=False)  # HH:MM format
    duration_minutes = Column(Integer, default=60)
    location = Column(String)
    is_virtual = Column(Boolean, default=True)
    meeting_url = Column(String)
    max_attendees = Column(Integer)
    price = Column(Float, default=0.0)
    status = Column(String, default="active")  # active, cancelled, completed
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    registrations = relationship("EventRegistration", back_populates="event")


class EventRegistration(Base):
    """Event registration model"""
    __tablename__ = "event_registrations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    registration_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="registered")  # registered, cancelled, attended
    payment_status = Column(String, default="pending")  # pending, paid, refunded
    stripe_payment_id = Column(String)

    # Relationships
    event = relationship("Event", back_populates="registrations")
    user = relationship("User")


class ChatMessage(Base):
    """Chat message model"""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    recipient_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("Session", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_messages")


class Newsletter(Base):
    """Newsletter model"""
    __tablename__ = "newsletters"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(Text)
    topics = Column(String)  # JSON string of topics
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])


class NewsletterSubscriber(Base):
    """Newsletter subscriber model"""
    __tablename__ = "newsletter_subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    preferences = Column(String)  # JSON string of preferences
    is_active = Column(Boolean, default=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow)
    unsubscribed_at = Column(DateTime)
    # Segmentation fields
    location = Column(String)
    user_type = Column(String)  # mentee, mentor, general
    engagement_score = Column(Integer, default=0)
    last_opened = Column(DateTime)
    tags = Column(String)  # JSON string of tags


class EmailCampaign(Base):
    """Email campaign model"""
    __tablename__ = "email_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    template_id = Column(Integer, ForeignKey("email_templates.id"))
    status = Column(String, default="draft")  # draft, scheduled, sending, sent, cancelled
    scheduled_at = Column(DateTime)
    sent_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Campaign settings
    segment_criteria = Column(Text)  # JSON string of segmentation criteria
    total_recipients = Column(Integer, default=0)
    emails_sent = Column(Integer, default=0)
    emails_delivered = Column(Integer, default=0)
    emails_opened = Column(Integer, default=0)
    emails_clicked = Column(Integer, default=0)
    emails_bounced = Column(Integer, default=0)
    emails_unsubscribed = Column(Integer, default=0)

    # Relationships
    template = relationship("EmailTemplate", foreign_keys=[template_id])
    creator = relationship("User", foreign_keys=[created_by])


class EmailTemplate(Base):
    """Email template model"""
    __tablename__ = "email_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    subject_template = Column(String, nullable=False)
    html_content = Column(Text, nullable=False)
    text_content = Column(Text)
    template_type = Column(String, default="newsletter")  # newsletter, welcome, promotional, transactional
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Template variables (JSON string)
    variables = Column(Text)  # Available variables for this template

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])


class EmailAnalytics(Base):
    """Email analytics model"""
    __tablename__ = "email_analytics"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("email_campaigns.id"))
    subscriber_id = Column(Integer, ForeignKey("newsletter_subscribers.id"))
    email = Column(String, nullable=False)
    
    # Tracking events
    sent_at = Column(DateTime)
    delivered_at = Column(DateTime)
    opened_at = Column(DateTime)
    clicked_at = Column(DateTime)
    bounced_at = Column(DateTime)
    unsubscribed_at = Column(DateTime)
    
    # Event details
    bounce_reason = Column(String)
    clicked_links = Column(Text)  # JSON array of clicked links
    user_agent = Column(String)
    ip_address = Column(String)

    # Relationships
    campaign = relationship("EmailCampaign", foreign_keys=[campaign_id])
    subscriber = relationship("NewsletterSubscriber", foreign_keys=[subscriber_id])


class BlogPost(Base):
    """Blog post model"""
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    excerpt = Column(Text)
    content = Column(Text, nullable=False)
    featured_image = Column(String)
    status = Column(String, default="draft")  # draft, published, archived
    category = Column(String)
    tags = Column(String)  # JSON string of tags
    author_id = Column(Integer, ForeignKey("users.id"))
    published_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # SEO fields
    meta_title = Column(String)
    meta_description = Column(Text)
    
    # Analytics
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)

    # Relationships
    author = relationship("User", foreign_keys=[author_id])


class Resource(Base):
    """Resource library model"""
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    resource_type = Column(String, nullable=False)  # document, video, link, tool, template
    category = Column(String)
    tags = Column(String)  # JSON string of tags
    file_url = Column(String)
    external_url = Column(String)
    thumbnail = Column(String)
    file_size = Column(Integer)  # in bytes
    file_format = Column(String)  # pdf, docx, mp4, etc.
    access_level = Column(String, default="public")  # public, premium, members_only
    download_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Content metadata
    duration = Column(Integer)  # for videos, in seconds
    page_count = Column(Integer)  # for documents
    difficulty_level = Column(String)  # beginner, intermediate, advanced

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])


class FAQ(Base):
    """FAQ model"""
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    subcategory = Column(String)
    tags = Column(String)  # JSON string of tags
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    status = Column(String, default="published")  # draft, published, archived
    helpful_count = Column(Integer, default=0)
    not_helpful_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])


class Testimonial(Base):
    """Testimonial model"""
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    title = Column(String)
    company = Column(String)
    email = Column(String)
    content = Column(Text, nullable=False)
    rating = Column(Integer)  # 1-5 stars
    avatar = Column(String)
    status = Column(String, default="pending")  # pending, approved, rejected
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    category = Column(String)  # general, mentorship, platform, etc.
    source = Column(String)  # website, email, survey, etc.
    location = Column(String)
    linkedin_url = Column(String)
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    approver = relationship("User", foreign_keys=[approved_by])


class ContentAnalytics(Base):
    """Content analytics model"""
    __tablename__ = "content_analytics"

    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String, nullable=False)  # blog_post, resource, faq, testimonial
    content_id = Column(Integer, nullable=False)
    event_type = Column(String, nullable=False)  # view, like, share, download, helpful, etc.
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(String)
    ip_address = Column(String)
    user_agent = Column(String)
    referrer = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])


class GiftSession(Base):
    """Gift session model"""
    __tablename__ = "gift_sessions"

    id = Column(Integer, primary_key=True, index=True)
    gift_code = Column(String, unique=True, index=True, nullable=False)
    mentor_id = Column(Integer, ForeignKey("mentors.id"))
    sender_name = Column(String, nullable=False)
    sender_email = Column(String, nullable=False)
    recipient_name = Column(String, nullable=False)
    recipient_email = Column(String, nullable=False)
    message = Column(Text)
    value = Column(Float, nullable=False, default=0.0)  # Gift session value
    status = Column(String, default="active")  # active, redeemed, expired
    purchased_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    redeemed_at = Column(DateTime)
    redeemed_by = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"))  # Created session when redeemed
    stripe_payment_id = Column(String)

    # Relationships
    mentor = relationship("Mentor")
    redeemer = relationship("User", foreign_keys=[redeemed_by])
    created_session = relationship("Session", foreign_keys=[session_id])


class Package(Base):
    """Session package model"""
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=True)  # None for global packages
    name = Column(String, nullable=False)
    description = Column(Text)
    sessions_count = Column(Integer, nullable=False)  # Number of sessions in package
    price = Column(Float, nullable=False)
    features = Column(Text)  # JSON string of features
    is_popular = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    chat_weeks = Column(Integer, default=0)  # Weeks of chat access
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    mentor = relationship("Mentor", back_populates="packages")


class SupportTicket(Base):
    """Support ticket model"""
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, default="general")  # technical, billing, account, general, report
    priority = Column(String, default="medium")  # low, medium, high, urgent
    status = Column(String, default="open")  # open, in_progress, resolved, closed
    assigned_to = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    responses = relationship("TicketResponse", back_populates="ticket")


class TicketResponse(Base):
    """Support ticket response model"""
    __tablename__ = "ticket_responses"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"))
    responder_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)  # Internal notes vs customer-facing responses
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    ticket = relationship("SupportTicket", back_populates="responses")
    responder = relationship("User")