from sqlalchemy import create_engine, Column, Integer, String, DateTime, Date, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Database URL (use PostgreSQL in production)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dogangelenos.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class BookingModel(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    dog_name = Column(String, nullable=False)
    owner_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    program = Column(String, nullable=False)
    preferred_date = Column(Date, nullable=False)
    preferred_time = Column(String, nullable=False)
    location = Column(String, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to chat messages
    chat_messages = relationship("ChatMessageModel", back_populates="booking")

class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    google_id = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessageModel(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    sender_email = Column(String, nullable=False)
    sender_name = Column(String, nullable=False)
    sender_type = Column(String, nullable=False)  # "customer" or "trainer"
    message = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    read = Column(Boolean, default=False)
    
    # Relationship to booking
    booking = relationship("BookingModel", back_populates="chat_messages")

class AboutContentModel(Base):
    __tablename__ = "about_content"
    
    id = Column(Integer, primary_key=True, index=True)
    hero_title = Column(String, nullable=False)
    hero_subtitle = Column(String, nullable=False)
    introduction = Column(String, nullable=False)
    mission = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ClassModel(Base):
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    color = Column(String, nullable=False)
    featured = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PackageModel(Base):
    __tablename__ = "packages"
    
    id = Column(Integer, primary_key=True, index=True)
    icon = Column(String, nullable=False)
    title = Column(String, nullable=False)
    subtitle = Column(String, nullable=False)
    price = Column(String, nullable=False)
    description = Column(String, nullable=False)
    features = Column(String, nullable=False)  # JSON string
    experience = Column(String, nullable=False)
    color = Column(String, nullable=False)
    featured = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NewsletterSubscriberModel(Base):
    __tablename__ = "newsletter_subscribers"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    preferences = Column(String, nullable=True)  # JSON string
    
class NewsletterModel(Base):
    __tablename__ = "newsletters"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    excerpt = Column(String, nullable=False)
    content = Column(String, nullable=False)
    image = Column(String, nullable=False)
    topics = Column(String, nullable=False)  # JSON string
    published_date = Column(DateTime, default=datetime.utcnow)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EventModel(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    time = Column(String, nullable=False)
    location = Column(String, nullable=False)
    category = Column(String, nullable=False)  # workshop, training, social, competition
    spots_total = Column(Integer, nullable=False)
    spots_available = Column(Integer, nullable=False)
    price = Column(String, nullable=False)
    image = Column(String, nullable=False)  # emoji or image URL
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to registrations
    registrations = relationship("EventRegistrationModel", back_populates="event")

class EventRegistrationModel(Base):
    __tablename__ = "event_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    dog_name = Column(String, nullable=False)
    dog_breed = Column(String, nullable=True)
    special_requirements = Column(String, nullable=True)
    status = Column(String, default="confirmed")  # confirmed, cancelled, waitlist
    registered_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to event
    event = relationship("EventModel", back_populates="registrations")

class TrainerModel(Base):
    __tablename__ = "trainers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    bio = Column(String, nullable=False)
    specialties = Column(String, nullable=False)  # JSON string
    experience = Column(String, nullable=False)
    certifications = Column(String, nullable=False)  # JSON string
    image = Column(String, nullable=False)
    availability = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
