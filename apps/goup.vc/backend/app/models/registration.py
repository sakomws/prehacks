from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


class RegistrationStatus(str, enum.Enum):
    INVITED = "invited"
    PENDING_APPROVAL = "pending_approval"
    CONFIRMED = "confirmed"
    WAITLISTED = "waitlisted"
    CANCELLED = "cancelled"
    DECLINED = "declined"
    NO_SHOW = "no_show"


class CheckinStatus(str, enum.Enum):
    NOT_CHECKED_IN = "not_checked_in"
    CHECKED_IN = "checked_in"


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    email = Column(String)
    name = Column(String)
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.CONFIRMED)
    ticket_quantity = Column(Integer, default=1)
    checkin_status = Column(Enum(CheckinStatus), default=CheckinStatus.NOT_CHECKED_IN)
    registration_source = Column(String)
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="registrations")
    payment = relationship("Payment", back_populates="registration")
    
    def __repr__(self):
        return f"<EventRegistration(id={self.id}, event_id={self.event_id}, user_id={self.user_id})>"