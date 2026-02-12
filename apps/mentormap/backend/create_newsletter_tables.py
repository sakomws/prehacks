#!/usr/bin/env python3
"""
Create newsletter management tables and update existing ones
"""
import sqlite3
import os

def create_newsletter_tables():
    """Create newsletter management tables"""
    db_path = "mentormap.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Database file {db_path} not found")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Add new columns to newsletter_subscribers table
        print("📝 Updating newsletter_subscribers table...")
        
        # Check existing columns
        cursor.execute("PRAGMA table_info(newsletter_subscribers)")
        existing_columns = [column[1] for column in cursor.fetchall()]
        
        new_columns = [
            ("location", "TEXT"),
            ("user_type", "TEXT DEFAULT 'general'"),
            ("engagement_score", "INTEGER DEFAULT 50"),
            ("last_opened", "DATETIME"),
            ("tags", "TEXT")
        ]
        
        for column_name, column_def in new_columns:
            if column_name not in existing_columns:
                cursor.execute(f"ALTER TABLE newsletter_subscribers ADD COLUMN {column_name} {column_def}")
                print(f"   ✅ Added column: {column_name}")
            else:
                print(f"   ⚠️  Column already exists: {column_name}")
        
        # Create email_campaigns table
        print("📝 Creating email_campaigns table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS email_campaigns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                subject TEXT NOT NULL,
                content TEXT NOT NULL,
                template_id INTEGER,
                status TEXT DEFAULT 'draft',
                scheduled_at DATETIME,
                sent_at DATETIME,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                segment_criteria TEXT,
                total_recipients INTEGER DEFAULT 0,
                emails_sent INTEGER DEFAULT 0,
                emails_delivered INTEGER DEFAULT 0,
                emails_opened INTEGER DEFAULT 0,
                emails_clicked INTEGER DEFAULT 0,
                emails_bounced INTEGER DEFAULT 0,
                emails_unsubscribed INTEGER DEFAULT 0,
                FOREIGN KEY (template_id) REFERENCES email_templates (id),
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        """)
        print("   ✅ Created email_campaigns table")
        
        # Create email_templates table
        print("📝 Creating email_templates table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS email_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                subject_template TEXT NOT NULL,
                html_content TEXT NOT NULL,
                text_content TEXT,
                template_type TEXT DEFAULT 'newsletter',
                is_active BOOLEAN DEFAULT 1,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                variables TEXT,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        """)
        print("   ✅ Created email_templates table")
        
        # Create email_analytics table
        print("📝 Creating email_analytics table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS email_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                campaign_id INTEGER,
                subscriber_id INTEGER,
                email TEXT NOT NULL,
                sent_at DATETIME,
                delivered_at DATETIME,
                opened_at DATETIME,
                clicked_at DATETIME,
                bounced_at DATETIME,
                unsubscribed_at DATETIME,
                bounce_reason TEXT,
                clicked_links TEXT,
                user_agent TEXT,
                ip_address TEXT,
                FOREIGN KEY (campaign_id) REFERENCES email_campaigns (id),
                FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers (id)
            )
        """)
        print("   ✅ Created email_analytics table")
        
        # Insert sample email templates
        print("📝 Creating sample email templates...")
        sample_templates = [
            (
                "Welcome Template",
                "Welcome email for new subscribers",
                "Welcome to {{company_name}}! 🎉",
                """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2563eb;">Welcome to {{company_name}}!</h1>
                    <p>Hi {{user_name}},</p>
                    <p>Welcome to our mentorship platform! We're excited to have you join our community.</p>
                    <p><a href="{{welcome_link}}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a></p>
                    <p>Best regards,<br>The {{company_name}} Team</p>
                </body>
                </html>
                """,
                "Hi {{user_name}}, Welcome to {{company_name}}! We're excited to have you join our community. Get started: {{welcome_link}}",
                "welcome",
                1,
                "company_name,user_name,welcome_link"
            ),
            (
                "Newsletter Template",
                "Monthly newsletter template",
                "{{month}} Updates & New Features",
                """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2563eb;">{{month}} Newsletter</h1>
                    <p>Hello {{user_name}},</p>
                    <p>Here are the latest updates from {{company_name}}:</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        {{featured_content}}
                    </div>
                    <p>Thank you for being part of our community!</p>
                    <p>Best regards,<br>The {{company_name}} Team</p>
                </body>
                </html>
                """,
                "{{month}} Newsletter from {{company_name}}. {{featured_content}}",
                "newsletter",
                1,
                "month,user_name,company_name,featured_content"
            ),
            (
                "Promotional Template",
                "Special offers and promotions",
                "Special Offer: {{offer_title}}",
                """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #dc2626;">Special Offer: {{offer_title}}</h1>
                    <p>Hi {{user_name}},</p>
                    <p>Don't miss out on this limited-time offer!</p>
                    <div style="background: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h2 style="color: #dc2626; margin: 0;">{{discount_amount}} OFF</h2>
                        <p style="margin: 10px 0;">Valid until {{expiry_date}}</p>
                    </div>
                    <p><a href="{{offer_link}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Claim Offer</a></p>
                    <p>Best regards,<br>The {{company_name}} Team</p>
                </body>
                </html>
                """,
                "Special Offer: {{offer_title}}. {{discount_amount}} OFF until {{expiry_date}}. Claim: {{offer_link}}",
                "promotional",
                1,
                "offer_title,user_name,discount_amount,expiry_date,offer_link,company_name"
            )
        ]
        
        for template in sample_templates:
            cursor.execute("""
                INSERT OR IGNORE INTO email_templates 
                (name, description, subject_template, html_content, text_content, template_type, created_by, variables)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, template)
        
        print("   ✅ Created sample email templates")
        
        # Insert sample email campaigns
        print("📝 Creating sample email campaigns...")
        sample_campaigns = [
            (
                "Welcome Series - Week 1",
                "Welcome to MentorMap! 🎉",
                "<p>Welcome to our platform! We're excited to have you here.</p>",
                1,  # template_id
                "sent",
                None,  # scheduled_at
                "2024-12-20 10:00:00",  # sent_at
                1,  # created_by
                "{}",  # segment_criteria
                150,  # total_recipients
                150,  # emails_sent
                148,  # emails_delivered
                89,   # emails_opened
                23,   # emails_clicked
                2,    # emails_bounced
                1     # emails_unsubscribed
            ),
            (
                "Monthly Newsletter - December",
                "December Updates & New Features",
                "<p>Here are the latest updates and features for December.</p>",
                2,  # template_id
                "draft",
                "2024-12-23 09:00:00",  # scheduled_at
                None,  # sent_at
                1,  # created_by
                '{"user_type": "all"}',  # segment_criteria
                200,  # total_recipients
                0,    # emails_sent
                0,    # emails_delivered
                0,    # emails_opened
                0,    # emails_clicked
                0,    # emails_bounced
                0     # emails_unsubscribed
            )
        ]
        
        for campaign in sample_campaigns:
            cursor.execute("""
                INSERT OR IGNORE INTO email_campaigns 
                (name, subject, content, template_id, status, scheduled_at, sent_at, created_by, 
                 segment_criteria, total_recipients, emails_sent, emails_delivered, emails_opened, 
                 emails_clicked, emails_bounced, emails_unsubscribed)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, campaign)
        
        print("   ✅ Created sample email campaigns")
        
        # Update existing newsletter subscribers with sample data
        print("📝 Updating existing subscribers with sample data...")
        cursor.execute("""
            UPDATE newsletter_subscribers 
            SET user_type = 'general', engagement_score = 50 
            WHERE user_type IS NULL OR engagement_score IS NULL
        """)
        
        # Add some variety to existing subscribers
        cursor.execute("""
            UPDATE newsletter_subscribers 
            SET user_type = 'mentee', engagement_score = 75, location = 'New York', tags = 'career,development'
            WHERE id = 1
        """)
        
        cursor.execute("""
            UPDATE newsletter_subscribers 
            SET user_type = 'mentor', engagement_score = 85, location = 'San Francisco', tags = 'expert,leadership'
            WHERE id = 2
        """)
        
        print("   ✅ Updated existing subscribers")
        
        conn.commit()
        
        # Show summary
        print("\n📊 Newsletter System Summary:")
        cursor.execute("SELECT COUNT(*) FROM newsletter_subscribers")
        subscribers_count = cursor.fetchone()[0]
        print(f"   - Newsletter Subscribers: {subscribers_count}")
        
        cursor.execute("SELECT COUNT(*) FROM email_templates")
        templates_count = cursor.fetchone()[0]
        print(f"   - Email Templates: {templates_count}")
        
        cursor.execute("SELECT COUNT(*) FROM email_campaigns")
        campaigns_count = cursor.fetchone()[0]
        print(f"   - Email Campaigns: {campaigns_count}")
        
        print("\n✅ Newsletter management system created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating newsletter tables: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_newsletter_tables()