"""Email utilities for sending notifications"""
from datetime import datetime
import os


def generate_calendar_invite(session_data: dict) -> str:
    """Generate iCalendar format string"""
    start_date = datetime.fromisoformat(session_data['scheduled_at'].replace('Z', '+00:00'))
    duration_minutes = session_data['duration_minutes']
    end_date = datetime.fromtimestamp(start_date.timestamp() + duration_minutes * 60)
    
    def format_date(date: datetime) -> str:
        return date.strftime('%Y%m%dT%H%M%SZ')
    
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MyRoadmap//Mentorship Session//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:{session_data['id']}@myroadmap.com
DTSTAMP:{format_date(datetime.utcnow())}
DTSTART:{format_date(start_date)}
DTEND:{format_date(end_date)}
SUMMARY:{session_data['title']}
DESCRIPTION:Mentorship session with {session_data['mentor_title']}\\n\\n{session_data['description']}\\n\\nMeeting link will be sent 15 minutes before the session.
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


def send_session_confirmation_email(user_email: str, session_data: dict):
    """
    Send session confirmation email with calendar invite
    
    In production, this would use a service like SendGrid, AWS SES, or similar.
    For now, we'll just log the email content.
    """
    calendar_invite = generate_calendar_invite(session_data)
    
    email_content = f"""
To: {user_email}
Subject: Session Confirmed - {session_data['title']}

Hi there!

Your mentorship session has been confirmed! 🎉

Session Details:
- Title: {session_data['title']}
- Mentor: {session_data['mentor_title']}
- Date & Time: {session_data['scheduled_at']}
- Duration: {session_data['duration_minutes']} minutes
- Amount Paid: ${session_data['price']}

A calendar invite is attached to this email. The meeting link will be sent to you 15 minutes before the session starts.

If you need to reschedule or have any questions, please contact us.

Best regards,
The MyRoadmap Team

---
Calendar Invite:
{calendar_invite}
"""
    
    # In production, send actual email here
    print("=" * 80)
    print("📧 EMAIL SENT")
    print("=" * 80)
    print(email_content)
    print("=" * 80)
    
    return True
