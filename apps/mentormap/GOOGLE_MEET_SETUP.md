# 📹 Google Meet Integration Guide

## Overview

This guide shows how to integrate real Google Meet links using Google Calendar API.

## Current Implementation

Currently, the system generates placeholder Meet links in the format:
```
https://meet.google.com/abc-defg-hij
```

These are realistic-looking but not actual Google Meet rooms.

## Option 1: Google Calendar API (Recommended)

### Step 1: Set Up Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a new project**
   - Click "Select a project" → "New Project"
   - Name: "MentorMap"
   - Click "Create"

3. **Enable Google Calendar API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### Step 2: Create Service Account

1. **Go to "APIs & Services" → "Credentials"**

2. **Create Service Account**
   - Click "Create Credentials" → "Service Account"
   - Name: "mentormap-calendar"
   - Click "Create and Continue"
   - Skip optional steps
   - Click "Done"

3. **Create Key**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON"
   - Download the key file

4. **Save the key file**
   ```bash
   mv ~/Downloads/mentormap-*.json apps/mentormap/backend/google-credentials.json
   ```

### Step 3: Update .env File

Add to `apps/mentormap/backend/.env`:

```bash
# Google Calendar API
GOOGLE_CREDENTIALS_FILE=google-credentials.json
GOOGLE_CALENDAR_ID=primary
```

### Step 4: Install Google Client Library

Add to `apps/mentormap/backend/requirements.txt`:

```
google-auth==2.23.0
google-auth-oauthlib==1.1.0
google-auth-httplib2==0.1.1
google-api-python-client==2.100.0
```

Install:
```bash
cd apps/mentormap/backend
source venv/bin/activate
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### Step 5: Update Email Utility

Replace the `generate_google_meet_link()` function in `apps/mentormap/backend/app/utils/email.py`:

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime, timedelta

def generate_google_meet_link(session_data: dict) -> str:
    """Generate a real Google Meet link using Google Calendar API"""
    try:
        # Load credentials
        credentials_file = os.getenv('GOOGLE_CREDENTIALS_FILE', 'google-credentials.json')
        credentials = service_account.Credentials.from_service_account_file(
            credentials_file,
            scopes=['https://www.googleapis.com/auth/calendar']
        )
        
        # Build Calendar API service
        service = build('calendar', 'v3', credentials=credentials)
        
        # Parse session date
        start_date = datetime.fromisoformat(session_data['scheduled_at'].replace('Z', '+00:00'))
        end_date = start_date + timedelta(minutes=session_data['duration_minutes'])
        
        # Create calendar event with Google Meet
        event = {
            'summary': session_data['title'],
            'description': f"Mentorship session with {session_data['mentor_title']}\\n\\n{session_data.get('description', '')}",
            'start': {
                'dateTime': start_date.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_date.isoformat(),
                'timeZone': 'UTC',
            },
            'conferenceData': {
                'createRequest': {
                    'requestId': f"mentormap-{session_data['id']}",
                    'conferenceSolutionKey': {
                        'type': 'hangoutsMeet'
                    }
                }
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 15},
                ],
            },
        }
        
        # Create event
        calendar_id = os.getenv('GOOGLE_CALENDAR_ID', 'primary')
        event = service.events().insert(
            calendarId=calendar_id,
            body=event,
            conferenceDataVersion=1
        ).execute()
        
        # Extract Meet link
        meet_link = event.get('hangoutLink', 'https://meet.google.com/')
        print(f"✅ Created Google Meet link: {meet_link}")
        
        return meet_link
        
    except Exception as e:
        print(f"❌ Error creating Google Meet link: {str(e)}")
        # Fallback to placeholder
        import random
        import string
        def random_segment(length):
            return ''.join(random.choices(string.ascii_lowercase, k=length))
        meeting_code = f"{random_segment(3)}-{random_segment(4)}-{random_segment(3)}"
        return f"https://meet.google.com/{meeting_code}"
```

### Step 6: Update Email Function

Update the `send_session_confirmation_email()` function to pass session_data:

```python
def send_session_confirmation_email(user_email: str, mentor_email: str, session_data: dict):
    """Send session confirmation email to both mentee and mentor with calendar invite and Google Meet link"""
    # Generate Google Meet link with session data
    meet_link = generate_google_meet_link(session_data)
    
    # Rest of the function remains the same...
```

## Option 2: Use Zoom Instead

If you prefer Zoom over Google Meet:

### Install Zoom SDK

```bash
pip install zoomus
```

### Update .env

```bash
ZOOM_API_KEY=your-zoom-api-key
ZOOM_API_SECRET=your-zoom-api-secret
```

### Generate Zoom Link

```python
from zoomus import ZoomClient

def generate_zoom_link(session_data: dict) -> str:
    """Generate a Zoom meeting link"""
    client = ZoomClient(
        os.getenv('ZOOM_API_KEY'),
        os.getenv('ZOOM_API_SECRET')
    )
    
    start_time = datetime.fromisoformat(session_data['scheduled_at'].replace('Z', '+00:00'))
    
    meeting = client.meeting.create(
        user_id='me',
        topic=session_data['title'],
        type=2,  # Scheduled meeting
        start_time=start_time.isoformat(),
        duration=session_data['duration_minutes'],
        timezone='UTC',
        settings={
            'host_video': True,
            'participant_video': True,
            'join_before_host': False,
            'mute_upon_entry': True,
            'waiting_room': True,
        }
    )
    
    return meeting['join_url']
```

## Option 3: Use Whereby

Whereby offers simple API for video rooms:

```bash
pip install requests
```

```python
import requests

def generate_whereby_link(session_data: dict) -> str:
    """Generate a Whereby room link"""
    api_key = os.getenv('WHEREBY_API_KEY')
    
    response = requests.post(
        'https://api.whereby.dev/v1/meetings',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'endDate': (datetime.utcnow() + timedelta(hours=2)).isoformat() + 'Z',
            'fields': ['hostRoomUrl']
        }
    )
    
    data = response.json()
    return data['roomUrl']
```

## Testing

After implementing real Meet links:

1. **Book a test session**
2. **Check the email** - Should contain a real Meet link
3. **Click the link** - Should open a Google Meet room
4. **Verify calendar invite** - Should have the Meet link embedded

## Security Considerations

1. **Never commit credentials** to git
   - Add `google-credentials.json` to `.gitignore`
   - Use environment variables in production

2. **Rotate API keys** regularly

3. **Use service accounts** for server-to-server communication

4. **Limit API scopes** to only what's needed

5. **Monitor API usage** and set quotas

## Troubleshooting

### "Credentials not found" error
- Check that `google-credentials.json` exists in backend folder
- Verify GOOGLE_CREDENTIALS_FILE path in .env

### "Insufficient permissions" error
- Ensure Calendar API is enabled
- Check service account has calendar access
- Verify OAuth scopes include calendar

### Meet link not generated
- Check Google Workspace settings allow Meet
- Verify conferenceDataVersion=1 in API call
- Check API quotas haven't been exceeded

## Production Recommendations

1. **Use Google Workspace** for better Meet integration
2. **Set up domain-wide delegation** for service accounts
3. **Implement retry logic** for API failures
4. **Cache credentials** to avoid repeated file reads
5. **Monitor API usage** and costs
6. **Add webhook handlers** for calendar event updates
7. **Implement meeting recording** if needed

---

**Resources:**
- Google Calendar API: https://developers.google.com/calendar
- Google Meet API: https://developers.google.com/meet
- Zoom API: https://marketplace.zoom.us/docs/api-reference
- Whereby API: https://docs.whereby.com/
