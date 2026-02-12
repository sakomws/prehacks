#!/usr/bin/env python3
"""
Add value column to gift_sessions table
"""
import sqlite3
import os

def add_gift_value_column():
    """Add value column to gift_sessions table"""
    db_path = "mentormap.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Database file {db_path} not found")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(gift_sessions)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'value' in columns:
            print("✅ Value column already exists in gift_sessions table")
        else:
            # Add the value column
            cursor.execute("ALTER TABLE gift_sessions ADD COLUMN value REAL DEFAULT 0.0")
            
            # Update existing records with sample values based on mentor hourly rate
            cursor.execute("""
                UPDATE gift_sessions 
                SET value = (
                    SELECT COALESCE(m.hourly_rate, 100.0) 
                    FROM mentors m 
                    WHERE m.id = gift_sessions.mentor_id
                )
                WHERE value = 0.0
            """)
            
            conn.commit()
            print("✅ Successfully added value column to gift_sessions table")
            
            # Show updated records
            cursor.execute("SELECT gift_code, value FROM gift_sessions LIMIT 5")
            records = cursor.fetchall()
            print(f"   Updated {len(records)} gift sessions with values:")
            for gift_code, value in records:
                print(f"   - {gift_code}: ${value}")
        
    except Exception as e:
        print(f"❌ Error adding value column: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_gift_value_column()