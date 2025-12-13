from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Enum, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"


class PaymentMethod(str, enum.Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    BANK_TRANSFER = "bank_transfer"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    stripe_payment_intent_id = Column(String)
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(3), default="USD")
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.STRIPE)
    refunded_amount_cents = Column(Integer, default=0)
    processing_fee_cents = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="payments")
    event = relationship("Event", back_populates="payments")
    registration = relationship("EventRegistration", back_populates="payment", uselist=False)
    
    def __repr__(self):
        return f"<Payment(id={self.id}, amount_cents={self.amount_cents}, status={self.status})>"