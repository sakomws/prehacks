"""Initialize database with tables and sample data"""
from app.database import engine, SessionLocal
from app import models
from app.api.auth import get_password_hash
from datetime import datetime, timedelta

def init_database():
    """Create all tables and add sample data"""
    print("Creating database tables...")
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(models.User).count()
        if existing_users > 0:
            print("Database already initialized!")
            return
        
        print("Adding sample data...")
        
        # Create sample users
        password = "password123"
        users = [
            models.User(
                email="john@example.com",
                username="john_doe",
                full_name="John Doe",
                hashed_password=get_password_hash(password),
                is_mentor=False
            ),
            models.User(
                email="sarah@example.com",
                username="sarah_mentor",
                full_name="Sarah Johnson",
                hashed_password=get_password_hash(password),
                is_mentor=True
            ),
            models.User(
                email="mike@example.com",
                username="mike_mentor",
                full_name="Mike Chen",
                hashed_password=get_password_hash(password),
                is_mentor=True
            ),
        ]
        
        for user in users:
            db.add(user)
        
        db.commit()
        
        # Create mentor profiles
        mentors = [
            models.Mentor(
                user_id=2,  # Sarah
                title="Senior Software Engineer at Google",
                bio="10+ years of experience in system design and algorithms. Helped 100+ candidates land jobs at FAANG companies.",
                expertise="System Design, Algorithms, Behavioral Interviews",
                hourly_rate=320.0,
                rating=4.9,
                total_sessions=150,
                is_available=True
            ),
            models.Mentor(
                user_id=3,  # Mike
                title="Engineering Manager at Meta",
                bio="Former interviewer at Meta and Amazon. Specialized in leadership and technical interviews.",
                expertise="Leadership, System Design, Career Growth",
                hourly_rate=400.0,
                rating=5.0,
                total_sessions=200,
                is_available=True
            ),
        ]
        
        for mentor in mentors:
            db.add(mentor)
        
        db.commit()
        
        # Create sample roadmap
        roadmap = models.Roadmap(
            user_id=1,  # John
            title="Prepare for Google SWE Interview",
            description="6-month preparation plan for Google Software Engineer position",
            target_company="Google",
            target_role="Software Engineer",
            milestones='["Master data structures", "Practice system design", "Mock interviews", "Behavioral prep"]',
            progress=25
        )
        db.add(roadmap)
        
        # Create sample session
        session = models.Session(
            student_id=1,  # John
            mentor_id=1,  # Sarah
            title="System Design Mock Interview",
            description="Practice designing a URL shortener service",
            scheduled_at=datetime.utcnow() + timedelta(days=7),
            duration_minutes=60,
            status="scheduled",
            price=320.0
        )
        db.add(session)
        
        db.commit()
        
        print("✅ Database initialized successfully!")
        print("\nSample credentials:")
        print("Student - Username: john_doe, Password: password123")
        print("Mentor - Username: sarah_mentor, Password: password123")
        print("Mentor - Username: mike_mentor, Password: password123")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
