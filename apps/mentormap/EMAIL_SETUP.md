# 📧 Email Configuration Guide

## Overview

MentorMap sends confirmation emails with Google Meet links and calendar invites to both mentors and mentees after successful payment.

## Quick Setup with Gmail

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification**

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** and **Other (Custom name)**
3. Enter "MentorMap" as the name
4. Click **Generate**
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File

Edit `apps/mentormap/backend/.env`:

```bash
# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # Your app password (no spaces)
FROM_EMAIL=noreply@mentormap.ai
FROM_NAME=MentorMap
```

### Step 4: Restart Backend

```bash
cd apps/mentormap
./start.sh
```

## What Gets Sent

After a successful payment, the system automatically sends:

### To the Mentee (Student):
- ✅ Confirmation email with session details
- 📅 Calendar invite (.ics file)
- 📹 Google Meet link
- 💰 Payment confirmation

### To the Mentor:
- 📚 New session notification
- 📅 Calendar invite (.ics file)
- 📹 Google Meet link (same as mentee)
- 💵 Earnings information

## Email Features

- **HTML formatted emails** with professional styling
- **Calendar invites** (.ics files) that work with all calendar apps
- **Google Meet links** for video sessions
- **15-minute reminders** built into calendar invites
- **Responsive design** that works on mobile and desktop

## Testing Without Email

If you don't configure SMTP, the system will:
- Print email content to console logs
- Continue working normally
- Not send actual emails

This is useful for development and testing.

## Alternative Email Providers

### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=MentorMap
```

### AWS SES

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=MentorMap
```

### Mailgun

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.com
SMTP_PASSWORD=your-mailgun-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=MentorMap
```

## Google Meet Integration

Currently, the system generates placeholder Google Meet links. For production:

### Option 1: Google Calendar API (Recommended)

1. Enable Google Calendar API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Integrate with the email utility to create actual Meet links

### Option 2: Use Zoom/Other Services

Replace the `generate_google_meet_link()` function to integrate with:
- Zoom API
- Microsoft Teams
- Whereby
- Daily.co

## Troubleshooting

### "Authentication failed" error

- Check that 2FA is enabled on your Google account
- Verify you're using an App Password, not your regular password
- Remove any spaces from the app password

### Emails not sending

- Check SMTP credentials in .env
- Verify SMTP_PORT is 587 (not 465 or 25)
- Check firewall/network settings
- Look at backend logs for error messages

### Calendar invites not working

- Ensure .ics file is properly formatted
- Check that dates are in correct timezone
- Verify email client supports calendar invites

## Production Recommendations

1. **Use a dedicated email service** (SendGrid, AWS SES, Mailgun)
2. **Set up SPF, DKIM, and DMARC** records for your domain
3. **Use a custom domain** for FROM_EMAIL
4. **Monitor email delivery rates** and bounces
5. **Implement email templates** with your branding
6. **Add unsubscribe links** for compliance
7. **Set up email tracking** for opens and clicks

## Security Best Practices

- ✅ Never commit .env files to git
- ✅ Use app passwords, not account passwords
- ✅ Rotate credentials regularly
- ✅ Use environment variables in production
- ✅ Enable rate limiting for email sending
- ✅ Validate email addresses before sending

## Email Template Customization

Email templates are in `apps/mentormap/backend/app/utils/email.py`

To customize:
1. Edit the HTML in `send_session_confirmation_email()`
2. Update colors, fonts, and styling
3. Add your logo and branding
4. Modify the email copy

---

**Need Help?**
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- SMTP Settings: Check your email provider's documentation
- Contact: support@mentormap.ai
