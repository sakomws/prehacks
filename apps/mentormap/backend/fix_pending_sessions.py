#!/usr/bin/env python3
"""
Fix pending sessions by updating them to paid/scheduled status
This is useful for local development when Stripe webhooks aren't configured
"""
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import models
from dotenv import load_dotenv

load_dotenv()

# Create database connection
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mentormap.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def fix_pending_sessions():
    """Update all pending sessions to paid/scheduled status"""
    db = SessionLocal()
    
    try:
        # Find all pending sessions
        pending_sessions = db.query(models.Session).filter(
            models.Session.payment_status == 'pending'
        ).all()
        
        if not pending_sessions:
            print("✅ No pending sessions found!")
            return
        
        print(f"\n📋 Found {len(pending_sessions)} pending session(s):\n")
        
        for session in pending_sessions:
            print(f"Session #{session.id}:")
            print(f"  Title: {session.title}")
            print(f"  Student ID: {session.student_id}")
            print(f"  Mentor ID: {session.mentor_id}")
            print(f"  Price: ${session.price}")
            print(f"  Status: {session.payment_status} -> paid")
            print()
            
            # Update to paid/scheduled
            session.payment_status = 'paid'
            session.status = 'scheduled'
        
        # Commit changes
        db.commit()
        
        print(f"✅ Successfully updated {len(pending_sessions)} session(s) to paid/scheduled status!")
        print("\n💡 Tip: To avoid this in the future, set up Stripe CLI for local webhooks:")
        print("   stripe listen --forward-to localhost:8000/api/payments/webhook")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        db.rollback()
    finally:
        db.close()


def list_all_sessions():
    """List all sessions with their status"""
    db = SessionLocal()
    
    try:
        sessions = db.query(models.Session).all()
        
        if not sessions:
            print("No sessions found in database")
            return
        
        print(f"\n📋 All Sessions ({len(sessions)} total):\n")
        print(f"{'ID':<5} {'Title':<30} {'Payment':<10} {'Status':<12} {'Price':<10}")
        print("-" * 80)
        
        for session in sessions:
            print(f"{session.id:<5} {session.title[:28]:<30} {session.payment_status:<10} {session.status:<12} ${session.price:<9.2f}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    print("\n🔧 MentorMap Session Status Fixer")
    print("=" * 80)
    
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        list_all_sessions()
    else:
        list_all_sessions()
        print("\n" + "=" * 80)
        
        response = input("\nDo you want to update pending sessions to paid? (yes/no): ")
        
        if response.lower() in ['yes', 'y']:
            fix_pending_sessions()
        else:
            print("❌ Cancelled")
