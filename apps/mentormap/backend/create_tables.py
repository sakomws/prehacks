#!/usr/bin/env python3
"""
Create database tables for MentorMap
"""
from app.database import engine, Base
from app.models import *  # Import all models

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    create_tables()