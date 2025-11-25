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
                email="vurgunh@gmail.com",
                username="vurghun_mentor",
                full_name="Vurghun Hajiyev",
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
                user_id=1,  # Vurghun
                title="Technology Executive",
                bio="With over 15+ years of experience at the intersection of product, technology, and digital transformation, I am a results-driven Technology Executive with a strong technical background. I have successfully led and delivered high-impact initiatives across the banking, telecommunications, and public sector digitalisation sectors.",
                expertise="Product Management, Technology Leadership, Digital Transformation, Banking, Telecommunications, Public Sector",
                hourly_rate=100.0,
                rating=5.0,
                total_sessions=0,
                is_available=True,
                linkedin_url="https://www.linkedin.com/in/vurgun",
                website_url="https://vurghun.substack.com",
                profile_image_url="https://media.licdn.com/dms/image/v2/D5603AQEj3-bN6f-pVA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1731048352332?e=1765411200&v=beta&t=Xll9S_3nTbYH5hg4C3EcXQaVLFa0mz3DrkGGWCyLwso"
            ),
        ]
        
        for mentor in mentors:
            db.add(mentor)
        
        db.commit()
        
        # Create promo codes
        promo_codes = [
            models.PromoCode(
                code="STUDENT50",
                discount_percent=50.0,
                description="50% discount for students",
                is_active=True,
                max_uses=None,  # Unlimited uses
                current_uses=0
            ),
        ]
        
        for promo in promo_codes:
            db.add(promo)
        
        db.commit()
        
        print("✅ Database initialized successfully!")
        print("\nMentor credentials:")
        print("Username: vurghun_mentor, Password: password123")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
