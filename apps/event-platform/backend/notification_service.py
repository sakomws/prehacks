"""
Notification service for event-based notifications
Handles registration confirmations, event updates, and reminders
"""

from sqlalchemy.orm import Session
from database import (
    NotificationModel, NotificationType, NotificationStatus, NotificationChannel
)
from datetime import datetime, timedelta
import json
from typing import List, Dict, Any, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


class EmailService:
    """Email service for sending notifications"""
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "localhost")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@eventplatform.com")
        self.from_name = os.getenv("FROM_NAME", "Event Platform")
    
    def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send an email notification"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add text content if provided
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                if self.smtp_username and self.smtp_password:
                    server.starttls()
                    server.login(self.smtp_username, self.smtp_password)
                
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            print(f"Failed to send email to {to_email}: {str(e)}")
            return False


class NotificationService:
    """Service for managing event-based notifications"""
    
    def __init__(self, db: Session):
        self.db = db
        self.email_service = EmailService()
    
    def create_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        subject: str,
        message: str,
        channel: NotificationChannel = NotificationChannel.EMAIL,
        event_id: str = None,
        calendar_id: str = None,
        template_data: Dict[str, Any] = None,
        scheduled_for: datetime = None
    ) -> NotificationModel:
        """Create a new notification record"""
        
        # Convert string UUIDs to UUID objects
        import uuid
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        event_uuid = uuid.UUID(event_id) if event_id and isinstance(event_id, str) else event_id
        calendar_uuid = uuid.UUID(calendar_id) if calendar_id and isinstance(calendar_id, str) else calendar_id
        
        notification = NotificationModel(
            user_id=user_uuid,
            type=notification_type,
            channel=channel,
            subject=subject,
            message=message,
            event_id=event_uuid,
            calendar_id=calendar_uuid,
            template_data=json.dumps(template_data) if template_data else None,
            scheduled_for=scheduled_for
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        return notification
    
    def send_notification(self, notification: NotificationModel) -> bool:
        """Send a notification"""
        try:
            if notification.channel == NotificationChannel.EMAIL:
                # Get user email
                from auth import get_user_by_id
                user = get_user_by_id(self.db, str(notification.user_id))
                if not user:
                    raise ValueError("User not found")
                
                # Send email
                success = self.email_service.send_email(
                    to_email=user.email,
                    subject=notification.subject,
                    html_content=notification.message
                )
                
                if success:
                    notification.status = NotificationStatus.SENT
                    notification.sent_at = datetime.utcnow()
                else:
                    notification.status = NotificationStatus.FAILED
                    notification.failed_at = datetime.utcnow()
                    notification.failure_reason = "Email delivery failed"
                    notification.retry_count += 1
            
            else:
                # For now, only email is implemented
                notification.status = NotificationStatus.FAILED
                notification.failed_at = datetime.utcnow()
                notification.failure_reason = f"Channel {notification.channel} not implemented"
            
            self.db.commit()
            return notification.status == NotificationStatus.SENT
            
        except Exception as e:
            notification.status = NotificationStatus.FAILED
            notification.failed_at = datetime.utcnow()
            notification.failure_reason = str(e)
            notification.retry_count += 1
            self.db.commit()
            return False
    
    def send_registration_confirmation(
        self,
        user_id: str,
        event_id: str,
        event_title: str,
        event_date: str,
        event_location: str = None
    ) -> bool:
        """Send registration confirmation email"""
        
        # Create email content
        subject = f"Registration Confirmed: {event_title}"
        
        html_content = f"""
        <html>
        <body>
            <h2>Registration Confirmed!</h2>
            <p>You have successfully registered for the following event:</p>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
                <h3>{event_title}</h3>
                <p><strong>Date:</strong> {event_date}</p>
                {f'<p><strong>Location:</strong> {event_location}</p>' if event_location else ''}
            </div>
            
            <p>We look forward to seeing you at the event!</p>
            
            <p>Best regards,<br>
            The Event Platform Team</p>
        </body>
        </html>
        """
        
        # Create notification
        notification = self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.REGISTRATION_CONFIRMATION,
            subject=subject,
            message=html_content,
            event_id=event_id,
            template_data={
                "event_title": event_title,
                "event_date": event_date,
                "event_location": event_location
            }
        )
        
        # Send immediately
        return self.send_notification(notification)
    
    def send_event_update_notification(
        self,
        user_id: str,
        event_id: str,
        event_title: str,
        changes: Dict[str, Any]
    ) -> bool:
        """Send event update notification"""
        
        # Create email content
        subject = f"Event Update: {event_title}"
        
        changes_html = ""
        for field, change in changes.items():
            if isinstance(change, dict) and 'old' in change and 'new' in change:
                changes_html += f"<li><strong>{field.replace('_', ' ').title()}:</strong> {change['old']} → {change['new']}</li>"
            else:
                changes_html += f"<li><strong>{field.replace('_', ' ').title()}:</strong> {change}</li>"
        
        html_content = f"""
        <html>
        <body>
            <h2>Event Update</h2>
            <p>The following event has been updated:</p>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
                <h3>{event_title}</h3>
                <p><strong>Changes made:</strong></p>
                <ul>
                    {changes_html}
                </ul>
            </div>
            
            <p>Please make note of these changes for your attendance.</p>
            
            <p>Best regards,<br>
            The Event Platform Team</p>
        </body>
        </html>
        """
        
        # Create notification
        notification = self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.EVENT_UPDATE,
            subject=subject,
            message=html_content,
            event_id=event_id,
            template_data={
                "event_title": event_title,
                "changes": changes
            }
        )
        
        # Send immediately
        return self.send_notification(notification)
    
    def schedule_event_reminder(
        self,
        user_id: str,
        event_id: str,
        event_title: str,
        event_date: datetime,
        reminder_time: datetime
    ) -> bool:
        """Schedule an event reminder notification"""
        
        # Create email content
        subject = f"Reminder: {event_title} is coming up!"
        
        html_content = f"""
        <html>
        <body>
            <h2>Event Reminder</h2>
            <p>This is a friendly reminder about your upcoming event:</p>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
                <h3>{event_title}</h3>
                <p><strong>Date:</strong> {event_date.strftime('%B %d, %Y at %I:%M %p')}</p>
            </div>
            
            <p>Don't forget to attend!</p>
            
            <p>Best regards,<br>
            The Event Platform Team</p>
        </body>
        </html>
        """
        
        # Create scheduled notification
        notification = self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.EVENT_REMINDER,
            subject=subject,
            message=html_content,
            event_id=event_id,
            scheduled_for=reminder_time,
            template_data={
                "event_title": event_title,
                "event_date": event_date.isoformat(),
                "reminder_time": reminder_time.isoformat()
            }
        )
        
        return True  # Scheduled successfully
    
    def send_event_invitation(
        self,
        user_id: str,
        event_id: str,
        event_title: str,
        event_description: str,
        event_date: str,
        event_location: str = None,
        invited_by: str = None
    ) -> bool:
        """Send event invitation"""
        
        # Create email content
        subject = f"You're Invited: {event_title}"
        
        html_content = f"""
        <html>
        <body>
            <h2>You're Invited!</h2>
            {f'<p>{invited_by} has invited you to the following event:</p>' if invited_by else '<p>You have been invited to the following event:</p>'}
            
            <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
                <h3>{event_title}</h3>
                <p>{event_description}</p>
                <p><strong>Date:</strong> {event_date}</p>
                {f'<p><strong>Location:</strong> {event_location}</p>' if event_location else ''}
            </div>
            
            <p>Click here to register for this event!</p>
            
            <p>Best regards,<br>
            The Event Platform Team</p>
        </body>
        </html>
        """
        
        # Create notification
        notification = self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.EVENT_INVITATION,
            subject=subject,
            message=html_content,
            event_id=event_id,
            template_data={
                "event_title": event_title,
                "event_description": event_description,
                "event_date": event_date,
                "event_location": event_location,
                "invited_by": invited_by
            }
        )
        
        # Send immediately
        return self.send_notification(notification)
    
    def process_scheduled_notifications(self) -> int:
        """Process and send scheduled notifications that are due"""
        
        # Get notifications that are scheduled and due
        now = datetime.utcnow()
        due_notifications = self.db.query(NotificationModel).filter(
            NotificationModel.status == NotificationStatus.PENDING,
            NotificationModel.scheduled_for <= now
        ).all()
        
        sent_count = 0
        for notification in due_notifications:
            if self.send_notification(notification):
                sent_count += 1
        
        return sent_count
    
    def retry_failed_notifications(self) -> int:
        """Retry failed notifications that haven't exceeded max retries"""
        
        # Get failed notifications that can be retried
        failed_notifications = self.db.query(NotificationModel).filter(
            NotificationModel.status == NotificationStatus.FAILED,
            NotificationModel.retry_count < NotificationModel.max_retries
        ).all()
        
        retried_count = 0
        for notification in failed_notifications:
            if self.send_notification(notification):
                retried_count += 1
        
        return retried_count
    
    def send_event_reminder_immediate(
        self,
        user_id: str,
        event_id: str,
        subject: str,
        html_content: str
    ) -> bool:
        """Send an immediate event reminder (used by Celery tasks)"""
        
        # Create notification
        notification = self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.EVENT_REMINDER,
            subject=subject,
            message=html_content,
            event_id=event_id
        )
        
        # Send immediately
        return self.send_notification(notification)


def get_notification_service(db: Session) -> NotificationService:
    """Get notification service instance"""
    return NotificationService(db)