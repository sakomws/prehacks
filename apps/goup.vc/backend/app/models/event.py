from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


class LocationType(str, enum.Enum):
    OFFLINE = "offline"
    ONLINE = "online"
    HYBRID = "hybrid"


class EventStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"


class EventVisibility(str, enum.Enum):
    PUBLIC = "public"
    UNLISTED = "unlisted"
    PRIVATE = "private"


class TicketType(str, enum.Enum):
    FREE = "free"
    PAID = "paid"
    DONATION = "donation"


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    calendar_id = Column(UUID(as_uuid=True), ForeignKey("calendars.id"), nullable=False)
    host_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    cover_image_url = Column(String)
    location_type = Column(Enum(LocationType), default=LocationType.OFFLINE)
    location_address = Column(Text)
    location_url = Column(String)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    timezone = Column(String, default="UTC")
    status = Column(Enum(EventStatus), default=EventStatus.DRAFT)
    visibility = Column(Enum(EventVisibility), default=EventVisibility.PUBLIC)
    capacity = Column(Integer)
    requires_approval = Column(Boolean, default=False)
    ticket_type = Column(Enum(TicketType), default=TicketType.FREE)
    ticket_price_cents = Column(Integer)
    currency = Column(String(3), default="USD")
    slug = Column(String, nullable=False)
    category = Column(String)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    calendar = relationship("Calendar", back_populates="events")
    host = relationship("User", back_populates="hosted_events")
    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="event", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Event(id={self.id}, title={self.title}, slug={self.slug})>"