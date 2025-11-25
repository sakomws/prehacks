# Payment & Booking Flow

## Complete User Journey

### 1. Browse Mentors
- Visit: `http://localhost:3002/mentors`
- View mentor profiles with ratings, expertise, and hourly rates

### 2. Book a Session
- Click "Book Session" on any mentor
- Redirects to: `http://localhost:3002/mentors/[id]`
- Fill out booking form:
  - Session title
  - Description
  - Date & time
  - Duration (30, 60, 90, or 120 minutes)
- Price is calculated automatically based on duration

### 3. Payment with Stripe
- Click "Book & Pay with Stripe"
- Redirects to Stripe Checkout (secure hosted page)
- Enter payment details:
  - Test card: `4242 4242 4242 4242`
  - Any future expiry date
  - Any 3-digit CVC
- Complete payment

### 4. Success Confirmation
- After successful payment, redirects to: `http://localhost:3002/sessions/success`
- Shows:
  - ✅ Success message
  - Complete session details
  - Payment confirmation
  - Download calendar invite button
  - Links to view all sessions or book another

### 5. Calendar Invite
- Click "📅 Download Calendar Invite"
- Downloads `.ics` file
- Can be imported to:
  - Google Calendar
  - Apple Calendar
  - Outlook
  - Any calendar app
- Includes:
  - Session title and description
  - Date and time
  - Duration
  - 15-minute reminder

### 6. Email Confirmation
- Automatic email sent after payment (logged to console in development)
- Contains:
  - Session details
  - Mentor information
  - Calendar invite attachment
  - Meeting link (sent 15 minutes before session)

### 7. View Sessions
- Visit: `http://localhost:3002/sessions`
- See all booked sessions with:
  - 📅 Date
  - 🕐 Time
  - ⏱️ Duration
  - 💰 Price
  - 💳 Payment status (Paid/Pending)
  - Status badge (Scheduled/Completed/Cancelled)
- Can cancel scheduled sessions

## Features

### Payment Status Tracking
- **Pending**: Payment not yet completed
- **Paid**: Payment successful (shown with green checkmark)
- **Refunded**: Payment refunded (if applicable)

### Session Status
- **Scheduled**: Upcoming session (blue badge)
- **Completed**: Session finished (green badge)
- **Cancelled**: Session cancelled (red badge)

### Calendar Integration
- Standard iCalendar (.ics) format
- Works with all major calendar applications
- Includes 15-minute reminder
- Contains all session details

### Email Notifications
In production, emails are sent via:
- SendGrid
- AWS SES
- Mailgun
- Or any SMTP service

In development, email content is logged to console.

## Database Schema

### Sessions Table
```sql
- id: INTEGER (Primary Key)
- student_id: INTEGER (Foreign Key to users)
- mentor_id: INTEGER (Foreign Key to mentors)
- title: VARCHAR
- description: TEXT
- scheduled_at: DATETIME
- duration_minutes: INTEGER
- status: VARCHAR (scheduled/completed/cancelled)
- price: FLOAT
- payment_status: VARCHAR (pending/paid/refunded)
- stripe_payment_id: VARCHAR
- notes: TEXT
- created_at: DATETIME
```

## API Endpoints

### Create Checkout Session
```http
POST /api/payments/create-checkout-session
Authorization: Bearer <token>

{
  "mentor_id": 1,
  "title": "System Design Review",
  "description": "Need help with distributed systems",
  "scheduled_at": "2024-01-20T14:00:00",
  "duration_minutes": 60
}
```

### Get Latest Session
```http
GET /api/sessions/latest
Authorization: Bearer <token>
```

### Get All Sessions
```http
GET /api/sessions/
Authorization: Bearer <token>
```

### Cancel Session
```http
PUT /api/sessions/{id}/cancel
Authorization: Bearer <token>
```

## Testing

1. Start backend: `cd apps/mentormap/backend && venv/bin/uvicorn main:app --reload --port 8002`
2. Start frontend: `cd apps/mentormap/frontend && npm run dev`
3. Login at: `http://localhost:3002/login`
4. Browse mentors: `http://localhost:3002/mentors`
5. Book a session with test card: `4242 4242 4242 4242`
6. View success page and download calendar invite
7. Check sessions: `http://localhost:3002/sessions`

## Production Considerations

### Email Service
Replace console logging with actual email service:
```python
# In app/utils/email.py
import sendgrid
# or
import boto3  # for AWS SES
# or
import smtplib
```

### Webhook Security
- Verify Stripe webhook signatures
- Use HTTPS in production
- Set proper CORS origins

### Calendar Invites
- Consider using a service like Calendly or Cal.com
- Or implement video meeting links (Zoom, Google Meet)
- Send meeting links 15 minutes before session

### Notifications
- Email confirmations
- SMS reminders
- Push notifications
- In-app notifications
