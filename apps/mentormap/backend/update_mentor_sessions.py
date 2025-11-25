#!/usr/bin/env python3
"""
Update mentor's total_sessions count
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import models
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mentormap.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def update_mentor_sessions(mentor_id: int, total_sessions: int):
    """Update a mentor's total_sessions count"""
    db = SessionLocal()
    
    try:
        mentor = db.query(models.Mentor).filter(
            models.Mentor.id == mentor_id
        ).first()
        
        if not mentor:
            print(f"❌ Mentor with ID {mentor_id} not found")
            return False
        
        old_count = mentor.total_sessions
        mentor.total_sessions = total_sessions
        db.commit()
        
        print(f"✅ Updated mentor '{mentor.title}':")
        print(f"   Old sessions: {old_count}")
        print(f"   New sessions: {total_sessions}")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("\n🔧 Mentor Session Count Updater")
    print("=" * 50)
    
    if len(sys.argv) == 3:
        mentor_id = int(sys.argv[1])
        total_sessions = int(sys.argv[2])
        update_mentor_sessions(mentor_id, total_sessions)
    else:
        print("\nUsage: python update_mentor_sessions.py <mentor_id> <total_sessions>")
        print("\nExample:")
        print("  python update_mentor_sessions.py 1 150")
        print("\nThis will set mentor ID 1 to have 150 completed sessions")
