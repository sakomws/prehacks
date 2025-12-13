from app.core.database import Base

# Import all models here to ensure they are registered with SQLAlchemy
from .user import User
from .calendar import Calendar
from .event import Event
from .registration import EventRegistration
from .notification import Notification
from .payment import Payment

__all__ = [
    "Base",
    "User", 
    "Calendar",
    "Event",
    "EventRegistration", 
    "Notification",
    "Payment"
]