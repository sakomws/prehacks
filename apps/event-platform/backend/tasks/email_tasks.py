"""
Email processing tasks for background job processing
"""

from celery import current_task
from celery_app import celery_app
from database import get_db_session
from notification_service import NotificationService, EmailService
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3)
def send_email_task(self, to_email: str, subject: str, html_content: str, text_content: str = None):
    """
    Send an email asynchronously
    """
    try:
        email_service = EmailService()
        success = email_service.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
        
        if not success:
            raise Exception("Email delivery failed")
            
        logger.info(f"Email sent successfully to {to_email}")
        return {"status": "sent", "recipient": to_email}
        
    except Exception as exc:
        logger.error(f"Failed to send email to {to_email}: {str(exc)}")
        
        # Retry with exponential backoff
        retry_delay = 60 * (2 ** self.request.retries)  # 60s, 120s, 240s
        raise self.retry(exc=exc, countdown=retry_delay)


@celery_app.task(bind=True, max_retries=3)
def send_bulk_emails_task(self, email_data: List[Dict[str, Any]]):
    """
    Send multiple emails in bulk
    
    Args:
        email_data: List of dicts with keys: to_email, subject, html_content, text_content
    """
    try:
        email_service = EmailService()
        results = []
        failed_emails = []
        
        for email in email_data:
            try:
                success = email_service.send_email(
                    to_email=email['to_email'],
                    subject=email['subject'],
                    html_content=email['html_content'],
                    text_content=email.get('text_content')
                )
                
                if success:
                    results.append({"status": "sent", "recipient": email['to_email']})
                else:
                    failed_emails.append(email)
                    results.append({"status": "failed", "recipient": email['to_email']})
                    
            except Exception as e:
                logger.error(f"Failed to send email to {email['to_email']}: {str(e)}")
                failed_emails.append(email)
                results.append({"status": "failed", "recipient": email['to_email'], "error": str(e)})
        
        # If some emails failed and we haven't exceeded retries, retry just the failed ones
        if failed_emails and self.request.retries < self.max_retries:
            retry_delay = 60 * (2 ** self.request.retries)
            raise self.retry(exc=Exception(f"{len(failed_emails)} emails failed"), 
                           countdown=retry_delay, 
                           args=[failed_emails])
        
        logger.info(f"Bulk email task completed. Sent: {len([r for r in results if r['status'] == 'sent'])}, Failed: {len(failed_emails)}")
        return {
            "total": len(email_data),
            "sent": len([r for r in results if r['status'] == 'sent']),
            "failed": len(failed_emails),
            "results": results
        }
        
    except Exception as exc:
        logger.error(f"Bulk email task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@celery_app.task
def send_registration_confirmation_email(user_id: str, event_id: str, event_title: str, 
                                       event_date: str, event_location: str = None):
    """
    Send registration confirmation email asynchronously
    """
    try:
        with get_db_session() as db:
            notification_service = NotificationService(db)
            success = notification_service.send_registration_confirmation(
                user_id=user_id,
                event_id=event_id,
                event_title=event_title,
                event_date=event_date,
                event_location=event_location
            )
            
            if success:
                logger.info(f"Registration confirmation sent to user {user_id} for event {event_id}")
                return {"status": "sent", "user_id": user_id, "event_id": event_id}
            else:
                raise Exception("Failed to send registration confirmation")
                
    except Exception as exc:
        logger.error(f"Failed to send registration confirmation: {str(exc)}")
        raise


@celery_app.task
def send_event_update_email(user_id: str, event_id: str, event_title: str, changes: Dict[str, Any]):
    """
    Send event update notification email asynchronously
    """
    try:
        with get_db_session() as db:
            notification_service = NotificationService(db)
            success = notification_service.send_event_update_notification(
                user_id=user_id,
                event_id=event_id,
                event_title=event_title,
                changes=changes
            )
            
            if success:
                logger.info(f"Event update notification sent to user {user_id} for event {event_id}")
                return {"status": "sent", "user_id": user_id, "event_id": event_id}
            else:
                raise Exception("Failed to send event update notification")
                
    except Exception as exc:
        logger.error(f"Failed to send event update notification: {str(exc)}")
        raise


@celery_app.task
def send_event_invitation_email(user_id: str, event_id: str, event_title: str, 
                               event_description: str, event_date: str, 
                               event_location: str = None, invited_by: str = None):
    """
    Send event invitation email asynchronously
    """
    try:
        with get_db_session() as db:
            notification_service = NotificationService(db)
            success = notification_service.send_event_invitation(
                user_id=user_id,
                event_id=event_id,
                event_title=event_title,
                event_description=event_description,
                event_date=event_date,
                event_location=event_location,
                invited_by=invited_by
            )
            
            if success:
                logger.info(f"Event invitation sent to user {user_id} for event {event_id}")
                return {"status": "sent", "user_id": user_id, "event_id": event_id}
            else:
                raise Exception("Failed to send event invitation")
                
    except Exception as exc:
        logger.error(f"Failed to send event invitation: {str(exc)}")
        raise


@celery_app.task
def send_bulk_event_notifications(user_ids: List[str], notification_type: str, 
                                 event_id: str, event_data: Dict[str, Any]):
    """
    Send event notifications to multiple users
    
    Args:
        user_ids: List of user IDs to notify
        notification_type: Type of notification (invitation, update, reminder)
        event_id: Event ID
        event_data: Event data for the notification
    """
    try:
        results = []
        
        for user_id in user_ids:
            try:
                if notification_type == "invitation":
                    result = send_event_invitation_email.delay(
                        user_id=user_id,
                        event_id=event_id,
                        event_title=event_data['title'],
                        event_description=event_data['description'],
                        event_date=event_data['date'],
                        event_location=event_data.get('location'),
                        invited_by=event_data.get('invited_by')
                    )
                elif notification_type == "update":
                    result = send_event_update_email.delay(
                        user_id=user_id,
                        event_id=event_id,
                        event_title=event_data['title'],
                        changes=event_data['changes']
                    )
                elif notification_type == "confirmation":
                    result = send_registration_confirmation_email.delay(
                        user_id=user_id,
                        event_id=event_id,
                        event_title=event_data['title'],
                        event_date=event_data['date'],
                        event_location=event_data.get('location')
                    )
                else:
                    raise ValueError(f"Unknown notification type: {notification_type}")
                
                results.append({"user_id": user_id, "task_id": result.id, "status": "queued"})
                
            except Exception as e:
                logger.error(f"Failed to queue notification for user {user_id}: {str(e)}")
                results.append({"user_id": user_id, "status": "failed", "error": str(e)})
        
        logger.info(f"Bulk notification task completed for {len(user_ids)} users")
        return {
            "total": len(user_ids),
            "queued": len([r for r in results if r['status'] == 'queued']),
            "failed": len([r for r in results if r['status'] == 'failed']),
            "results": results
        }
        
    except Exception as exc:
        logger.error(f"Bulk notification task failed: {str(exc)}")
        raise