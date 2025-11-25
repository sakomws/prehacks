#!/usr/bin/env python3
"""Test email configuration"""
import sys
import os
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from app.utils.email import send_email, send_session_confirmation_email

def test_simple_email():
    """Test sending a simple email"""
    print("\n" + "="*80)
    print("Testing Simple Email")
    print("="*80)
    
    html_content = """
    <html>
        <body>
            <h1>Test Email from MentorMap</h1>
            <p>If you're reading this, email configuration is working! 🎉</p>
        </body>
    </html>
    """
    
    result = send_email(
        to_email=os.getenv("SMTP_USER"),  # Send to yourself
        subject="MentorMap Email Test",
        html_content=html_content
    )
    
    if result:
        print("✅ Simple email test PASSED")
    else:
        print("❌ Simple email test FAILED")
    
    return result


def test_session_confirmation():
    """Test sending a session confirmation email"""
    print("\n" + "="*80)
    print("Testing Session Confirmation Email")
    print("="*80)
    
    session_data = {
        'id': 999,
        'title': 'Test Mentorship Session',
        'description': 'This is a test session to verify email functionality',
        'scheduled_at': datetime.utcnow().isoformat() + 'Z',
        'duration_minutes': 60,
        'price': 100.00,
        'mentor_name': 'Test Mentor',
        'mentor_title': 'Senior Software Engineer at Test Company'
    }
    
    user_email = os.getenv("SMTP_USER")  # Send to yourself
    mentor_email = os.getenv("SMTP_USER")  # Send to yourself
    
    result = send_session_confirmation_email(
        user_email=user_email,
        mentor_email=mentor_email,
        session_data=session_data
    )
    
    if result:
        print("✅ Session confirmation email test PASSED")
    else:
        print("❌ Session confirmation email test FAILED")
    
    return result


if __name__ == "__main__":
    print("\n🧪 MentorMap Email Configuration Test")
    print("="*80)
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check configuration
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    
    print(f"\n📧 SMTP Configuration:")
    print(f"   Host: {smtp_host}")
    print(f"   Port: {smtp_port}")
    print(f"   User: {smtp_user}")
    print(f"   Password: {'*' * len(smtp_password) if smtp_password else 'NOT SET'}")
    
    if not smtp_user or not smtp_password:
        print("\n❌ SMTP credentials not configured!")
        print("Please set SMTP_USER and SMTP_PASSWORD in backend/.env")
        sys.exit(1)
    
    # Run tests
    test1 = test_simple_email()
    test2 = test_session_confirmation()
    
    print("\n" + "="*80)
    print("Test Summary:")
    print(f"  Simple Email: {'✅ PASSED' if test1 else '❌ FAILED'}")
    print(f"  Session Confirmation: {'✅ PASSED' if test2 else '❌ FAILED'}")
    print("="*80)
    
    if test1 and test2:
        print("\n🎉 All tests passed! Email is configured correctly.")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed. Check the output above for details.")
        sys.exit(1)
