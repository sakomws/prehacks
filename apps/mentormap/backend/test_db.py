#!/usr/bin/env python3
"""
Test database connection and queries
"""
from app.database import SessionLocal
from app.models import User, Mentor, Session, ChatMessage, SupportTicket

def test_database():
    """Test database connection and basic queries"""
    db = SessionLocal()
    
    try:
        print("Testing database connection...")
        
        # Test basic queries
        users_count = db.query(User).count()
        print(f"Users count: {users_count}")
        
        mentors_count = db.query(Mentor).count()
        print(f"Mentors count: {mentors_count}")
        
        sessions_count = db.query(Session).count()
        print(f"Sessions count: {sessions_count}")
        
        messages_count = db.query(ChatMessage).count()
        print(f"Chat messages count: {messages_count}")
        
        tickets_count = db.query(SupportTicket).count()
        print(f"Support tickets count: {tickets_count}")
        
        # Test a mentor query similar to the API
        mentors = db.query(Mentor).filter(Mentor.is_available == True).all()
        print(f"Available mentors: {len(mentors)}")
        
        for mentor in mentors:
            print(f"  - {mentor.title} (User: {mentor.user.full_name if mentor.user else 'No user'})")
        
        print("Database test completed successfully!")
        
    except Exception as e:
        print(f"Database test failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_database()