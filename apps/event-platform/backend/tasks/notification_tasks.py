"""
Notification processing tasks for background job processing
"""

from celery_app import celery_app
from database import get_db_session, NotificationModel, NotificationStatus
from notification_service import NotificationService
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


@celery_app.task
def process_scheduled_notifications():
    """
    Process and send scheduled notifications that are due
    This task runs every minute via Celery Beat
    """
    try:
        with get_db_session() as db:
            notification_service = NotificationService(db)
            sent_count = notification_service.process_scheduled_notifications()
            
            if sent_count > 0:
                logger.info(f"Processed {sent_count} scheduled notifications")
            
            return {"processed": sent_count, "timestamp": datetime.utcnow().isoformat()}
            
    except Exception as exc:
        logger.error(f"Failed to process scheduled notifications: {str(exc)}")
        raise


@celery_app.task
def retry_failed_notifications():
    """
    Retry failed notifications that haven't exceeded max retries
    This task runs every 5 minutes via Celery Beat
    """
    try:
        with get_db_session() as db:
            notification_service = NotificationService(db)
            retried_count = notification_service.retry_failed_notifications()
            
            if retried_count > 0:
                logger.info(f"Retried {retried_count} failed notifications")
            
            return {"retried": retried_count, "timestamp": datetime.utcnow().isoformat()}
            
    except Exception as exc:
        logger.error(f"Failed to retry notifications: {str(exc)}")
        raise


@celery_app.task(bind=True, max_retries=3)
def send_notification_task(self, notification_id: str):
    """
    Send a specific notification by ID
    """
    try:
        with get_db_session() as db:
            # Get notification
            notification = db.query(NotificationModel).filter(
                NotificationModel.id == notification_id
            ).first()
            
            if not notification:
                logger.error(f"Notification {notification_id} not found")
                return {"status": "error", "message": "Notification not found"}
            
            # Send notification
            notification_service = NotificationService(db)
            success = notification_service.send_notification(notification)
            
            if success:
                logger.info(f"Notification {notification_id} sent successfully")
                return {"status": "sent", "notification_id": notification_id}
            else:
                raise Exception("Failed to send notification")
                
    except Exception as exc:
        logger.error(f"Failed to send notification {notification_id}: {str(exc)}")
        
        # Retry with exponential backoff
        retry_delay = 60 * (2 ** self.request.retries)  # 60s, 120s, 240s
        raise self.retry(exc=exc, countdown=retry_delay)


@celery_app.task
def queue_notification(user_id: str, notification_type: str, subject: str, 
                      message: str, event_id: str = None, calendar_id: str = None,
                      template_data: dict = None, scheduled_for: str = None):
    """
    Queue a notification for processing
    
    Args:
        user_id: User ID to send notification to
        notification_type: Type of notification
        subject: Email subject
        message: Email message/content
        event_id: Optional event ID
        calendar_id: Optional calendar ID
        template_data: Optional template data
        scheduled_for: Optional ISO datetime string for scheduling
    """
    try:
        from database import NotificationType, NotificationChannel
        
        # Parse scheduled_for if provided
        scheduled_datetime = None
        if scheduled_for:
            scheduled_datetime = datetime.fromisoformat(scheduled_for.replace('Z', '+00:00'))
        
        # Map string to enum
        notification_type_enum = getattr(NotificationType, notification_type.upper())
        
        with get_db_session() as db:
            notification_service = NotificationService(db)
            
            # Create notification
            notification = notification_service.create_notification(
                user_id=user_id,
                notification_type=notification_type_enum,
                subject=subject,
                message=message,
                event_id=event_id,
                calendar_id=calendar_id,
                template_data=template_data,
                scheduled_for=scheduled_datetime
            )
            
            # If not scheduled, send immediately
            if not scheduled_datetime:
                send_notification_task.delay(str(notification.id))
            
            logger.info(f"Notification queued for user {user_id}: {notification.id}")
            return {
                "notification_id": str(notification.id),
                "status": "scheduled" if scheduled_datetime else "queued",
                "scheduled_for": scheduled_for
            }
            
    except Exception as exc:
        logger.error(f"Failed to queue notification: {str(exc)}")
        raise


@celery_app.task
def cleanup_old_notifications_task():
    """
    Clean up old notifications to prevent database bloat
    Removes notifications older than 30 days
    """
    try:
        with get_db_session() as db:
            # Delete notifications older than 30 days
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            
            deleted_count = db.query(NotificationModel).filter(
                NotificationModel.created_at < cutoff_date
            ).delete()
            
            db.commit()
            
            logger.info(f"Cleaned up {deleted_count} old notifications")
            return {"deleted": deleted_count, "cutoff_date": cutoff_date.isoformat()}
            
    except Exception as exc:
        logger.error(f"Failed to cleanup old notifications: {str(exc)}")
        raise


@celery_app.task
def update_notification_metrics():
    """
    Update notification delivery metrics and statistics
    """
    try:
        with get_db_session() as db:
            # Calculate metrics for the last 24 hours
            since = datetime.utcnow() - timedelta(hours=24)
            
            # Count notifications by status
            total_sent = db.query(NotificationModel).filter(
                NotificationModel.sent_at >= since,
                NotificationModel.status == NotificationStatus.SENT
            ).count()
            
            total_failed = db.query(NotificationModel).filter(
                NotificationModel.failed_at >= since,
                NotificationModel.status == NotificationStatus.FAILED
            ).count()
            
            total_pending = db.query(NotificationModel).filter(
                NotificationModel.created_at >= since,
                NotificationModel.status == NotificationStatus.PENDING
            ).count()
            
            metrics = {
                "period": "24h",
                "sent": total_sent,
                "failed": total_failed,
                "pending": total_pending,
                "success_rate": (total_sent / (total_sent + total_failed)) * 100 if (total_sent + total_failed) > 0 else 0,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            logger.info(f"Notification metrics updated: {metrics}")
            return metrics
            
    except Exception as exc:
        logger.error(f"Failed to update notification metrics: {str(exc)}")
        raise