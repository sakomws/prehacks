#!/usr/bin/env python3
"""
Populate database with sample data for testing
"""
from datetime import datetime, timedelta
import random
from app.database import SessionLocal
from app.models import (
    User, Mentor, Session, MentorApplication, Event, EventRegistration,
    ChatMessage, Newsletter, NewsletterSubscriber, GiftSession
)

def populate_sample_data():
    """Populate database with sample data"""
    db = SessionLocal()
    
    try:
        print("🌱 Populating database with sample data...")
        
        # Create sample mentor applications
        applications = [
            {
                "email": "sarah.johnson@example.com",
                "full_name": "Sarah Johnson",
                "title": "Senior Software Engineer",
                "bio": "Experienced software engineer with 8 years in the industry, specializing in full-stack development and team leadership.",
                "experience": "5-10",
                "expertise": "Software Development, Product Management, Career Coaching",
                "hourly_rate": 150.0,
                "linkedin_url": "https://linkedin.com/in/sarahjohnson",
                "website_url": "https://sarahjohnson.dev",
                "availability": "weekdays",
                "certifications": "AWS Certified Solutions Architect, Scrum Master",
                "why_mentor": "I want to help others navigate their career transitions and avoid common pitfalls I experienced early in my career.",
                "mentorship_style": "I believe in a collaborative approach where I guide mentees to find their own solutions while providing industry insights.",
                "success_stories": "I've helped 5 junior developers advance to senior roles and 2 career changers successfully transition into tech.",
                "status": "pending"
            },
            {
                "email": "mike.chen@example.com",
                "full_name": "Mike Chen",
                "title": "Product Manager",
                "bio": "Senior Product Manager with 12 years of experience building consumer and enterprise products at scale.",
                "experience": "10-15",
                "expertise": "Product Strategy, Leadership, Data Analysis, User Research",
                "hourly_rate": 200.0,
                "linkedin_url": "https://linkedin.com/in/mikechen",
                "website_url": "https://mikechen.com",
                "availability": "flexible",
                "certifications": "Certified Scrum Product Owner, Google Analytics Certified",
                "why_mentor": "I'm passionate about helping aspiring product managers develop strategic thinking and leadership skills.",
                "mentorship_style": "I focus on practical, hands-on learning with real case studies and actionable frameworks.",
                "success_stories": "Mentored 10+ product managers who now lead teams at major tech companies.",
                "status": "approved"
            },
            {
                "email": "emma.davis@example.com",
                "full_name": "Emma Davis",
                "title": "UX Design Director",
                "bio": "Design leader with 10+ years creating user-centered products for Fortune 500 companies.",
                "experience": "10-15",
                "expertise": "UX Design, Design Systems, User Research, Team Leadership",
                "hourly_rate": 175.0,
                "linkedin_url": "https://linkedin.com/in/emmadavis",
                "availability": "weekends",
                "certifications": "Google UX Design Certificate, Nielsen Norman Group UX Certification",
                "why_mentor": "I want to help designers develop both craft skills and business acumen to advance their careers.",
                "mentorship_style": "I combine design critique with career coaching, focusing on portfolio development and strategic thinking.",
                "success_stories": "Helped 8 designers get promoted to senior roles and 3 transition into design leadership.",
                "status": "pending"
            }
        ]
        
        for app_data in applications:
            existing = db.query(MentorApplication).filter(
                MentorApplication.email == app_data["email"]
            ).first()
            if not existing:
                app = MentorApplication(**app_data)
                db.add(app)
        
        db.commit()
        print("✅ Created mentor applications")
        
        # Create sample newsletter subscribers
        subscribers = [
            {"email": "john.doe@example.com", "full_name": "John Doe", "preferences": "Career Tips,Events"},
            {"email": "jane.smith@example.com", "full_name": "Jane Smith", "preferences": "Technical Skills,Networking"},
            {"email": "alex.wilson@example.com", "full_name": "Alex Wilson", "preferences": "Leadership,Career Tips"},
            {"email": "lisa.brown@example.com", "full_name": "Lisa Brown", "preferences": "Events,Success Stories"},
            {"email": "david.lee@example.com", "full_name": "David Lee", "preferences": "Technical Skills,Career Tips"}
        ]
        
        for sub_data in subscribers:
            existing = db.query(NewsletterSubscriber).filter(
                NewsletterSubscriber.email == sub_data["email"]
            ).first()
            if not existing:
                subscriber = NewsletterSubscriber(**sub_data)
                db.add(subscriber)
        
        db.commit()
        print("✅ Created newsletter subscribers")
        
        # Create sample newsletters
        newsletters = [
            {
                "title": "December Career Development Tips",
                "content": "This month we're focusing on year-end career reflection and planning for 2025...",
                "excerpt": "Top career development strategies for the new year and how to set meaningful professional goals.",
                "topics": "Career,Growth,Planning",
                "is_published": True,
                "published_at": datetime.utcnow() - timedelta(days=15),
                "created_by": 1
            },
            {
                "title": "Mentorship Success Stories",
                "content": "Read inspiring stories from our mentorship community and learn from their journeys...",
                "excerpt": "Inspiring stories from our mentorship community and key lessons learned.",
                "topics": "Success,Community,Inspiration",
                "is_published": True,
                "published_at": datetime.utcnow() - timedelta(days=30),
                "created_by": 1
            }
        ]
        
        for newsletter_data in newsletters:
            existing = db.query(Newsletter).filter(
                Newsletter.title == newsletter_data["title"]
            ).first()
            if not existing:
                newsletter = Newsletter(**newsletter_data)
                db.add(newsletter)
        
        db.commit()
        print("✅ Created newsletters")
        
        # Create sample events
        events = [
            {
                "title": "Mentorship Best Practices Workshop",
                "description": "Learn effective mentorship strategies and techniques from experienced mentors and mentees.",
                "event_type": "workshop",
                "date": (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d"),
                "time": "14:00",
                "duration_minutes": 120,
                "location": "Virtual - Zoom",
                "is_virtual": True,
                "meeting_url": "https://zoom.us/j/123456789",
                "max_attendees": 50,
                "price": 25.0,
                "created_by": 1
            },
            {
                "title": "Career Transition Networking Event",
                "description": "Connect with professionals who have successfully changed careers and learn from their experiences.",
                "event_type": "networking",
                "date": (datetime.now() + timedelta(days=21)).strftime("%Y-%m-%d"),
                "time": "18:00",
                "duration_minutes": 90,
                "location": "Virtual - Google Meet",
                "is_virtual": True,
                "meeting_url": "https://meet.google.com/abc-defg-hij",
                "max_attendees": 30,
                "price": 0.0,
                "created_by": 1
            },
            {
                "title": "Tech Leadership Masterclass",
                "description": "Advanced session for senior professionals looking to develop leadership skills in technology organizations.",
                "event_type": "masterclass",
                "date": (datetime.now() + timedelta(days=28)).strftime("%Y-%m-%d"),
                "time": "10:00",
                "duration_minutes": 180,
                "location": "Virtual - Zoom",
                "is_virtual": True,
                "meeting_url": "https://zoom.us/j/987654321",
                "max_attendees": 25,
                "price": 75.0,
                "created_by": 1
            }
        ]
        
        for event_data in events:
            existing = db.query(Event).filter(
                Event.title == event_data["title"]
            ).first()
            if not existing:
                event = Event(**event_data)
                db.add(event)
        
        db.commit()
        print("✅ Created events")
        
        # Create sample chat messages for existing sessions
        sessions = db.query(Session).all()
        if sessions:
            sample_messages = [
                "Hi! I'm looking forward to our session today.",
                "Thank you for the great advice on career planning.",
                "Can we reschedule our next meeting to next week?",
                "I've been working on the action items we discussed.",
                "Your insights on leadership have been very helpful.",
                "I have some questions about the project we discussed.",
                "The resources you shared were exactly what I needed.",
                "I'd like to focus on technical skills in our next session."
            ]
            
            for session in sessions[:3]:  # Add messages to first 3 sessions
                if session.student and session.mentor and session.mentor.user:
                    # Create 3-5 messages per session
                    num_messages = random.randint(3, 5)
                    for i in range(num_messages):
                        # Alternate between student and mentor
                        is_from_student = i % 2 == 0
                        sender_id = session.student_id if is_from_student else session.mentor.user_id
                        recipient_id = session.mentor.user_id if is_from_student else session.student_id
                        
                        message = ChatMessage(
                            session_id=session.id,
                            sender_id=sender_id,
                            recipient_id=recipient_id,
                            message=random.choice(sample_messages),
                            is_read=random.choice([True, False]),
                            sent_at=datetime.utcnow() - timedelta(hours=random.randint(1, 72))
                        )
                        db.add(message)
            
            db.commit()
            print("✅ Created chat messages")
        
        # Create sample gift sessions
        mentors = db.query(Mentor).all()
        if mentors:
            gift_codes = ["GIFT2024A", "MENTOR123", "HOLIDAY24", "NEWYEAR25"]
            for i, code in enumerate(gift_codes):
                existing = db.query(GiftSession).filter(
                    GiftSession.gift_code == code
                ).first()
                if not existing:
                    gift = GiftSession(
                        gift_code=code,
                        mentor_id=mentors[i % len(mentors)].id,
                        sender_name=f"Gift Sender {i+1}",
                        sender_email=f"sender{i+1}@example.com",
                        recipient_name=f"Gift Recipient {i+1}",
                        recipient_email=f"recipient{i+1}@example.com",
                        message=f"Happy holidays! Enjoy this mentoring session.",
                        status="active" if i < 2 else "redeemed",
                        expires_at=datetime.utcnow() + timedelta(days=365),
                        redeemed_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)) if i >= 2 else None
                    )
                    db.add(gift)
            
            db.commit()
            print("✅ Created gift sessions")
        
        print("\n🎉 Sample data population completed!")
        print("📊 Summary:")
        print(f"   - Mentor Applications: {db.query(MentorApplication).count()}")
        print(f"   - Newsletter Subscribers: {db.query(NewsletterSubscriber).count()}")
        print(f"   - Newsletters: {db.query(Newsletter).count()}")
        print(f"   - Events: {db.query(Event).count()}")
        print(f"   - Chat Messages: {db.query(ChatMessage).count()}")
        print(f"   - Gift Sessions: {db.query(GiftSession).count()}")
        
    except Exception as e:
        print(f"❌ Error populating data: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_sample_data()