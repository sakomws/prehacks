#!/usr/bin/env python3
"""
Migration script to add status column to users table
Run this script to update existing database with the new status field
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.database import DATABASE_URL

def migrate_add_user_status():
    """Add status column to users table and set default values"""
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as connection:
            # Check if status column already exists (SQLite version)
            result = connection.execute(text("""
                PRAGMA table_info(users)
            """))
            
            columns = [row[1] for row in result.fetchall()]
            if 'status' in columns:
                print("✅ Status column already exists in users table")
                return True
            
            # Add status column
            print("📝 Adding status column to users table...")
            connection.execute(text("""
                ALTER TABLE users 
                ADD COLUMN status VARCHAR DEFAULT 'active'
            """))
            
            # Update existing users to have active status
            print("🔄 Setting default status for existing users...")
            connection.execute(text("""
                UPDATE users 
                SET status = 'active' 
                WHERE status IS NULL OR status = ''
            """))
            
            connection.commit()
            print("✅ Migration completed successfully!")
            print("   - Added 'status' column to users table")
            print("   - Set all existing users to 'active' status")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Starting user status migration...")
    success = migrate_add_user_status()
    if success:
        print("🎉 Migration completed successfully!")
    else:
        print("💥 Migration failed!")
        sys.exit(1)