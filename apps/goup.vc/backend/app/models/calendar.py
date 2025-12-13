from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


class CalendarVisibility(str, enum.Enum):
    PUBLIC = "public"
    UNLISTED = "unlisted"
    PRIVATE = "private"


class Calendar(Base):
    __tablename__ = "calendars"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text)
    visibility = Column(Enum(CalendarVisibility), default=CalendarVisibility.PUBLIC)
    cover_image_url = Column(String)
    timezone = Column(String, default="UTC")
    is_plus_active = Column(Boolean, default=False)
    stripe_customer_id = Column(String)
    stripe_subscription_id = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="owned_calendars")
    events = relationship("Event", back_populates="calendar", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Calendar(id={self.id}, name={self.name}, slug={self.slug})>"