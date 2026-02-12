#!/usr/bin/env python3
"""
Create sample data for MentorMap
"""
from app.database import SessionLocal
from app.models import *
from datetime import datetime, timedelta
import json

def create_sample_data():
    """Create sample data for testing"""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_user = db.query(User).first()
        if existing_user:
            print("Sample data already exists!")
            return
        
        print("Creating sample data...")
        
        # Create sample users
        users = [
            User(
                email="john.doe@example.com",
                username="johndoe",
                hashed_password="hashed_password_123",
                full_name="John Doe",
                is_mentor=True
            ),
            User(
                email="jane.smith@example.com",
                username="janesmith",
                hashed_password="hashed_password_456",
                full_name="Jane Smith",
                is_mentor=False
            ),
            User(
                email="admin@mentormap.com",
                username="admin",
                hashed_password="hashed_admin_password",
                full_name="Admin User",
                is_mentor=False
            )
        ]
        
        for user in users:
            db.add(user)
        
        db.commit()
        
        # Get the created users
        john = db.query(User).filter(User.username == "johndoe").first()
        jane = db.query(User).filter(User.username == "janesmith").first()
        admin = db.query(User).filter(User.username == "admin").first()
        
        # Create mentor profile for John
        mentor = Mentor(
            user_id=john.id,
            title="Senior Software Engineer",
            bio="Experienced software engineer with 10+ years in web development",
            expertise=json.dumps(["Python", "JavaScript", "React", "Node.js"]),
            hourly_rate=150.0,
            rating=4.8,
            total_sessions=25,
            is_available=True,
            linkedin_url="https://linkedin.com/in/johndoe",
            website_url="https://johndoe.dev"
        )
        db.add(mentor)
        db.commit()
        
        # Create sample session
        session = Session(
            student_id=jane.id,
            mentor_id=mentor.id,
            title="React Development Mentoring",
            description="Learn React best practices and advanced patterns",
            scheduled_at=datetime.utcnow() + timedelta(days=1),
            duration_minutes=60,
            status="scheduled",
            price=150.0,
            payment_status="paid"
        )
        db.add(session)
        db.commit()
        
        # Create sample chat messages
        messages = [
            ChatMessage(
                session_id=session.id,
                sender_id=jane.id,
                recipient_id=john.id,
                message="Hi John! I'm excited about our session tomorrow. I have some questions about React hooks.",
                sent_at=datetime.utcnow() - timedelta(hours=2)
            ),
            ChatMessage(
                session_id=session.id,
                sender_id=john.id,
                recipient_id=jane.id,
                message="Great! I'm looking forward to it too. Feel free to prepare any specific questions you have.",
                sent_at=datetime.utcnow() - timedelta(hours=1)
            ),
            ChatMessage(
                session_id=session.id,
                sender_id=jane.id,
                recipient_id=john.id,
                message="Perfect! I'll prepare a list of questions about useEffect and custom hooks.",
                sent_at=datetime.utcnow() - timedelta(minutes=30)
            )
        ]
        
        for message in messages:
            db.add(message)
        
        # Create sample support tickets
        tickets = [
            SupportTicket(
                user_id=jane.id,
                subject="Unable to schedule session",
                description="I'm having trouble scheduling a session with my mentor. The calendar doesn't seem to be working properly.",
                category="technical",
                priority="medium",
                status="open"
            ),
            SupportTicket(
                user_id=jane.id,
                subject="Billing question about subscription",
                description="I was charged twice for my monthly subscription. Can you please help me resolve this?",
                category="billing",
                priority="high",
                status="in_progress",
                assigned_to=admin.id
            )
        ]
        
        for ticket in tickets:
            db.add(ticket)
        
        db.commit()
        
        # Create sample ticket responses
        ticket1 = db.query(SupportTicket).filter(SupportTicket.subject.like("%billing%")).first()
        if ticket1:
            response = TicketResponse(
                ticket_id=ticket1.id,
                responder_id=admin.id,
                message="Hi Jane, I've looked into your billing issue. I can see the duplicate charge and I'm processing a refund for you right now. You should see it in 3-5 business days.",
                is_internal=False
            )
            db.add(response)
        
        db.commit()
        
        print("Sample data created successfully!")
        print(f"Created {len(users)} users")
        print(f"Created 1 mentor profile")
        print(f"Created 1 session")
        print(f"Created {len(messages)} chat messages")
        print(f"Created {len(tickets)} support tickets")
        print("You can now test the API endpoints!")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()