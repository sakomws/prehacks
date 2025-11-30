"""Initialize the database with tables and sample data"""
from database import init_db, SessionLocal, BookingModel, UserModel
from chat import ChatMessageModel
from datetime import datetime, date, timedelta

def create_sample_data():
    """Create sample bookings, users, and chat messages for testing"""
    db = SessionLocal()
    
    try:
        # Create sample users
        users = [
            UserModel(
                email="sarah@example.com",
                name="Sarah Martinez",
                google_id="google_123"
            ),
            UserModel(
                email="mike@example.com",
                name="Mike Thompson",
                google_id="google_456"
            ),
            UserModel(
                email="jessica@example.com",
                name="Jessica Lee",
                google_id="google_789"
            ),
            UserModel(
                email="trainer@dogangelenos.com",
                name="Alex Rodriguez",
                google_id="google_trainer"
            )
        ]
        
        for user in users:
            db.add(user)
        
        # Create sample bookings
        bookings = [
            BookingModel(
                dog_name="Max",
                owner_name="Sarah Martinez",
                email="sarah@example.com",
                phone="(310) 555-0101",
                program="Basic Obedience - $249",
                preferred_date=date(2024, 12, 15),
                preferred_time="Morning (9am-12pm)",
                location="West Hollywood",
                status="confirmed"
            ),
            BookingModel(
                dog_name="Luna",
                owner_name="Mike Thompson",
                email="mike@example.com",
                phone="(310) 555-0102",
                program="Puppy Training - $199",
                preferred_date=date(2024, 12, 18),
                preferred_time="Afternoon (12pm-3pm)",
                location="Santa Monica",
                status="pending"
            ),
            BookingModel(
                dog_name="Charlie",
                owner_name="Jessica Lee",
                email="jessica@example.com",
                phone="(310) 555-0103",
                program="Advanced Training - $349",
                preferred_date=date(2024, 12, 20),
                preferred_time="Evening (3pm-6pm)",
                location="Downtown LA",
                status="confirmed"
            )
        ]
        
        for booking in bookings:
            db.add(booking)
        
        db.commit()
        
        # Create sample chat messages
        now = datetime.utcnow()
        chat_messages = [
            # Booking 1 - Sarah & Trainer conversation
            ChatMessageModel(
                booking_id=1,
                sender_email="sarah@example.com",
                sender_name="Sarah Martinez",
                sender_type="customer",
                message="Hi! I'm excited to start training with Max!",
                timestamp=now - timedelta(hours=2),
                read=True
            ),
            ChatMessageModel(
                booking_id=1,
                sender_email="trainer@dogangelenos.com",
                sender_name="Alex Rodriguez",
                sender_type="trainer",
                message="Great to hear! Max is going to do wonderfully. Do you have any specific concerns?",
                timestamp=now - timedelta(hours=1, minutes=50),
                read=True
            ),
            ChatMessageModel(
                booking_id=1,
                sender_email="sarah@example.com",
                sender_name="Sarah Martinez",
                sender_type="customer",
                message="He pulls on the leash a lot. Can we work on that?",
                timestamp=now - timedelta(hours=1, minutes=45),
                read=True
            ),
            ChatMessageModel(
                booking_id=1,
                sender_email="trainer@dogangelenos.com",
                sender_name="Alex Rodriguez",
                sender_type="trainer",
                message="Absolutely! Leash training is part of our basic obedience program. We'll focus on that.",
                timestamp=now - timedelta(hours=1, minutes=40),
                read=False
            ),
        ]
        
        for msg in chat_messages:
            db.add(msg)
        
        db.commit()
        print("✅ Sample data created successfully!")
        print(f"   - {len(users)} users")
        print(f"   - {len(bookings)} bookings")
        print(f"   - {len(chat_messages)} chat messages")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🗄️  Initializing database...")
    init_db()
    print("✅ Database tables created!")
    
    print("\n📊 Creating sample data...")
    create_sample_data()
    
    print("\n✨ Database initialization complete!")
