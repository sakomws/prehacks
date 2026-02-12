#!/usr/bin/env python3
"""
Create schedule management tables
"""
from app.database import engine, Base
from app.models import MentorAvailability, MentorTimeOff

def create_tables():
    """Create the new schedule tables"""
    print("Creating schedule management tables...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    print("✅ Schedule tables created successfully!")

if __name__ == "__main__":
    create_tables()