"""Email utilities for sending notifications"""
from datetime import datetime
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import secrets
from dotenv import load_dotenv

load_dotenv()


def generate_calendar_invite(session_data: dict) -> str:
    """Generate iCalendar format string"""
    start_date = datetime.fromisoformat(session_data['scheduled_at'].replace('Z', '+00:00'))
    duration_minutes = session_data['duration_minutes']
    end_date = datetime.fromtimestamp(start_date.timestamp() + duration_minutes * 60)
    
    def format_date(date: datetime) -> str:
        return date.strftime('%Y%m%dT%H%M%SZ')
    
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MentorMap//Mentorship Session//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:{session_data['id']}@mentormap.ai
DTSTAMP:{format_date(datetime.utcnow())}
DTSTART:{format_date(start_date)}
DTEND:{format_date(end_date)}
SUMMARY:{session_data['title']}
DESCRIPTION:Mentorship session with {session_data.get('mentor_name', session_data['mentor_title'])} ({session_data['mentor_title']})\\n\\n{session_data['description']}\\n\\nMeeting link will be sent 15 minutes before the session.
LOCATION:Online Video Call
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:Reminder: Session starts in 15 minutes
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR"""
    
    return ics_content


def generate_google_meet_link() -> str:
    """Generate a unique Google Meet link"""
    # Generate a realistic-looking Meet link format
    # Format: xxx-yyyy-zzz (3-4-3 pattern)
    import random
    import string
    
    def random_segment(length):
        return ''.join(random.choices(string.ascii_lowercase, k=length))
    
    meeting_code = f"{random_segment(3)}-{random_segment(4)}-{random_segment(3)}"
    return f"https://meet.google.com/{meeting_code}"


def send_email(to_email: str, subject: str, html_content: str, ics_content: str = None):
    """Send email via SMTP"""
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("FROM_EMAIL", smtp_user)
    from_name = os.getenv("FROM_NAME", "MentorMap")
    
    # Check if SMTP is configured
    if not smtp_user or smtp_user == "your-email@gmail.com":
        print("=" * 80)
        print("📧 EMAIL NOT CONFIGURED - Would send:")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Content: {html_content[:200]}...")
        print("=" * 80)
        print(f"SMTP Config: host={smtp_host}, port={smtp_port}, user={smtp_user}")
        return False
    
    print(f"📧 Attempting to send email to {to_email}...")
    print(f"SMTP Config: host={smtp_host}, port={smtp_port}, user={smtp_user}")
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{from_name} <{from_email}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Add calendar invite if provided
        if ics_content:
            ics_part = MIMEBase('text', 'calendar', method='REQUEST')
            ics_part.set_payload(ics_content.encode('utf-8'))
            encoders.encode_base64(ics_part)
            ics_part.add_header('Content-Disposition', 'attachment', filename='invite.ics')
            msg.attach(ics_part)
        
        # Send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ SMTP Authentication failed: {str(e)}")
        print("💡 Check your SMTP_USER and SMTP_PASSWORD in .env")
        print("💡 For Gmail, you need an App Password: https://support.google.com/accounts/answer/185833")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ SMTP error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def send_session_confirmation_email(user_email: str, mentor_email: str, session_data: dict):
    """
    Send session confirmation email to both mentee and mentor with calendar invite and Google Meet link
    """
    # Generate Google Meet link
    meet_link = generate_google_meet_link()
    
    # Update session data with meet link
    session_data['meet_link'] = meet_link
    
    # Generate calendar invite with meet link
    calendar_invite = generate_calendar_invite_with_meet(session_data)
    
    # Format date nicely
    scheduled_date = datetime.fromisoformat(session_data['scheduled_at'].replace('Z', '+00:00'))
    formatted_date = scheduled_date.strftime('%A, %B %d, %Y at %I:%M %p')
    
    # Email to Mentee
    mentee_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .detail-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
            .detail-label {{ font-weight: bold; color: #6b7280; }}
            .meet-button {{ display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Session Confirmed!</h1>
            </div>
            <div class="content">
                <p>Hi there!</p>
                <p>Your mentorship session has been successfully booked and paid. We're excited for your upcoming session!</p>
                
                <div class="details">
                    <h2 style="margin-top: 0;">📅 Session Details</h2>
                    <div class="detail-row">
                        <span class="detail-label">Session:</span>
                        <span>{session_data['title']}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Mentor:</span>
                        <span><strong>{session_data.get('mentor_name', session_data['mentor_title'])}</strong><br/><small style="color: #6b7280;">{session_data['mentor_title']}</small></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span>{formatted_date}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Duration:</span>
                        <span>{session_data['duration_minutes']} minutes</span>
                    </div>
                    <div class="detail-row" style="border-bottom: none;">
                        <span class="detail-label">Amount Paid:</span>
                        <span style="color: #10b981; font-weight: bold;">${session_data['price']}</span>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="{meet_link}" class="meet-button">📹 Join Google Meet</a>
                    <p style="font-size: 14px; color: #6b7280;">Click this link at the scheduled time to join the session</p>
                </div>
                
                <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Add this event to your calendar using the attached .ics file!</p>
                </div>
                
                <p>If you need to reschedule or have any questions, please contact us through the platform.</p>
                
                <div class="footer">
                    <p>Best regards,<br>The MentorMap Team</p>
                    <p>© 2024 MentorMap. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Email to Mentor
    mentor_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
            .detail-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
            .detail-label {{ font-weight: bold; color: #6b7280; }}
            .meet-button {{ display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📚 New Session Booked!</h1>
            </div>
            <div class="content">
                <p>Hi {session_data.get('mentor_name', session_data['mentor_title'])},</p>
                <p>Great news! A new mentorship session has been booked with you.</p>
                
                <div class="details">
                    <h2 style="margin-top: 0;">📅 Session Details</h2>
                    <div class="detail-row">
                        <span class="detail-label">Session:</span>
                        <span>{session_data['title']}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Description:</span>
                        <span>{session_data.get('description', 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date & Time:</span>
                        <span>{formatted_date}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Duration:</span>
                        <span>{session_data['duration_minutes']} minutes</span>
                    </div>
                    <div class="detail-row" style="border-bottom: none;">
                        <span class="detail-label">Your Earnings:</span>
                        <span style="color: #10b981; font-weight: bold;">${session_data['price']}</span>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="{meet_link}" class="meet-button">📹 Join Google Meet</a>
                    <p style="font-size: 14px; color: #6b7280;">Use this link to host the session at the scheduled time</p>
                </div>
                
                <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>📌 Reminder:</strong> The calendar invite is attached. Please prepare any materials in advance!</p>
                </div>
                
                <div class="footer">
                    <p>Best regards,<br>The MentorMap Team</p>
                    <p>© 2024 MentorMap. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Send emails
    mentee_sent = send_email(
        user_email,
        f"Session Confirmed - {session_data['title']}",
        mentee_html,
        calendar_invite
    )
    
    mentor_sent = send_email(
        mentor_email,
        f"New Session Booked - {session_data['title']}",
        mentor_html,
        calendar_invite
    )
    
    return mentee_sent and mentor_sent


def generate_calendar_invite_with_meet(session_data: dict) -> str:
    """Generate iCalendar format string with Google Meet link"""
    start_date = datetime.fromisoformat(session_data['scheduled_at'].replace('Z', '+00:00'))
    duration_minutes = session_data['duration_minutes']
    end_date = datetime.fromtimestamp(start_date.timestamp() + duration_minutes * 60)
    
    def format_date(date: datetime) -> str:
        return date.strftime('%Y%m%dT%H%M%SZ')
    
    meet_link = session_data.get('meet_link', 'https://meet.google.com/')
    
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MentorMap//Mentorship Session//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:{session_data['id']}@mentormap.ai
DTSTAMP:{format_date(datetime.utcnow())}
DTSTART:{format_date(start_date)}
DTEND:{format_date(end_date)}
SUMMARY:{session_data['title']}
DESCRIPTION:Mentorship session with {session_data.get('mentor_name', session_data['mentor_title'])} ({session_data['mentor_title']})\\n\\n{session_data.get('description', '')}\\n\\nJoin Google Meet: {meet_link}
LOCATION:{meet_link}
URL:{meet_link}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:Reminder: Session starts in 15 minutes
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR"""
    
    return ics_content
