"""Create packages table"""
from app.database import engine, SessionLocal
from app import models

def create_packages_table():
    """Create packages table"""
    print("Creating packages table...")
    models.Base.metadata.create_all(bind=engine)
    print("✅ Packages table created successfully!")

if __name__ == "__main__":
    create_packages_table()


