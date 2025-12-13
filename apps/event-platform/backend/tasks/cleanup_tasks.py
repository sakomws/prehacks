"""
Data cleanup and maintenance tasks for background job processing
"""

from celery_app import celery_app
from database import get_db_session
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


@celery_app.task
def cleanup_old_notifications():
    """
    Clean up old notifications to prevent database bloat
    Removes notifications older than 30 days
    This task runs daily at 2 AM via Celery Beat
    """
    try:
        from database import NotificationModel
        
        with get_db_session() as db:
            # Delete notifications older than 30 days
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            
            deleted_count = db.query(NotificationModel).filter(
                NotificationModel.created_at < cutoff_date
            ).delete()
            
            db.commit()
            
            logger.info(f"Cleaned up {deleted_count} old notifications")
            return {
                "deleted": deleted_count,
                "cutoff_date": cutoff_date.isoformat(),
                "timestamp": datetime.utcnow().isoformat()
            }
            
    except Exception as exc:
        logger.error(f"Failed to cleanup old notifications: {str(exc)}")
        raise


@celery_app.task
def cleanup_expired_tokens():
    """
    Clean up expired password reset tokens
    This task runs every hour via Celery Beat
    """
    try:
        from database import UserModel
        
        with get_db_session() as db:
            # Clear expired password reset tokens
            now = datetime.utcnow()
            
            updated_count = db.query(UserModel).filter(
                UserModel.password_reset_expires < now,
                UserModel.password_reset_token.isnot(None)
            ).update({
                UserModel.password_reset_token: None,
                UserModel.password_reset_expires: None
            })
            
            db.commit()
            
            logger.info(f"Cleaned up {updated_count} expired password reset tokens")
            return {
                "cleaned": updated_count,
                "timestamp": datetime.utcnow().isoformat()
            }
            
    except Exception as exc:
        logger.error(f"Failed to cleanup expired tokens: {str(exc)}")
        raise


@celery_app.task
def cleanup_old_sessions():
    """
    Clean up old user sessions and tokens
    Removes session data older than 7 days
    """
    try:
        # This would clean up any session storage if implemented
        # For now, JWT tokens are stateless, so no cleanup needed
        
        logger.info("Session cleanup completed (JWT tokens are stateless)")
        return {
            "message": "No session cleanup needed for JWT tokens",
            "timestamp": datetime.utcnow().isoformat()
        }
            
    except Exception as exc:
        logger.error(f"Failed to cleanup old sessions: {str(exc)}")
        raise


@celery_app.task
def update_subscription_metrics():
    """
    Update calendar subscription metrics and analytics
    This task runs daily at 3 AM via Celery Beat
    """
    try:
        from database import CalendarModel, CalendarSubscriptionModel
        
        with get_db_session() as db:
            # Update subscriber counts for all calendars
            calendars = db.query(CalendarModel).all()
            updated_count = 0
            
            for calendar in calendars:
                # Count active subscriptions
                subscriber_count = db.query(CalendarSubscriptionModel).filter(
                    CalendarSubscriptionModel.calendar_id == calendar.id,
                    CalendarSubscriptionModel.is_active == True
                ).count()
                
                # Update calendar with current subscriber count
                # Note: This assumes we add a subscriber_count field to CalendarModel
                # For now, we'll just log the counts
                logger.debug(f"Calendar {calendar.id} has {subscriber_count} subscribers")
                updated_count += 1
            
            logger.info(f"Updated subscription metrics for {updated_count} calendars")
            return {
                "calendars_updated": updated_count,
                "timestamp": datetime.utcnow().isoformat()
            }
            
    except Exception as exc:
        logger.error(f"Failed to update subscription metrics: {str(exc)}")
        raise


@celery_app.task
def cleanup_orphaned_files():
    """
    Clean up orphaned uploaded files that are no longer referenced
    """
    try:
        import os
        from pathlib import Path
        
        # Get upload directories
        upload_dirs = [
            Path("uploads/avatars"),
            Path("uploads/calendar-covers"),
            Path("uploads/event-covers")
        ]
        
        cleaned_files = 0
        
        for upload_dir in upload_dirs:
            if not upload_dir.exists():
                continue
                
            # Get all files in directory
            files = list(upload_dir.glob("*"))
            
            # For each file, check if it's still referenced in the database
            with get_db_session() as db:
                from database import UserModel, CalendarModel, EventModel
                
                for file_path in files:
                    if file_path.is_file():
                        file_url = f"/uploads/{upload_dir.name}/{file_path.name}"
                        
                        # Check if file is referenced
                        is_referenced = False
                        
                        if upload_dir.name == "avatars":
                            is_referenced = db.query(UserModel).filter(
                                UserModel.avatar_url == file_url
                            ).first() is not None
                        elif upload_dir.name == "calendar-covers":
                            is_referenced = db.query(CalendarModel).filter(
                                CalendarModel.cover_image_url == file_url
                            ).first() is not None
                        elif upload_dir.name == "event-covers":
                            is_referenced = db.query(EventModel).filter(
                                EventModel.cover_image_url == file_url
                            ).first() is not None
                        
                        # If not referenced and older than 7 days, delete it
                        if not is_referenced:
                            file_age = datetime.utcnow() - datetime.fromtimestamp(file_path.stat().st_mtime)
                            if file_age > timedelta(days=7):
                                try:
                                    file_path.unlink()
                                    cleaned_files += 1
                                    logger.debug(f"Deleted orphaned file: {file_path}")
                                except Exception as e:
                                    logger.error(f"Failed to delete file {file_path}: {str(e)}")
        
        logger.info(f"Cleaned up {cleaned_files} orphaned files")
        return {
            "files_deleted": cleaned_files,
            "timestamp": datetime.utcnow().isoformat()
        }
            
    except Exception as exc:
        logger.error(f"Failed to cleanup orphaned files: {str(exc)}")
        raise


@celery_app.task
def cleanup_cancelled_events():
    """
    Clean up data related to cancelled events
    Removes registrations and notifications for events cancelled more than 30 days ago
    """
    try:
        from database import EventModel, EventRegistrationModel, NotificationModel, EventStatus
        
        with get_db_session() as db:
            # Find cancelled events older than 30 days
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            
            cancelled_events = db.query(EventModel).filter(
                EventModel.status == EventStatus.CANCELLED,
                EventModel.updated_at < cutoff_date
            ).all()
            
            cleaned_registrations = 0
            cleaned_notifications = 0
            
            for event in cancelled_events:
                # Delete registrations for cancelled events
                reg_count = db.query(EventRegistrationModel).filter(
                    EventRegistrationModel.event_id == event.id
                ).delete()
                cleaned_registrations += reg_count
                
                # Delete notifications for cancelled events
                notif_count = db.query(NotificationModel).filter(
                    NotificationModel.event_id == event.id
                ).delete()
                cleaned_notifications += notif_count
            
            db.commit()
            
            logger.info(f"Cleaned up {cleaned_registrations} registrations and {cleaned_notifications} notifications for {len(cancelled_events)} cancelled events")
            return {
                "cancelled_events": len(cancelled_events),
                "registrations_deleted": cleaned_registrations,
                "notifications_deleted": cleaned_notifications,
                "timestamp": datetime.utcnow().isoformat()
            }
            
    except Exception as exc:
        logger.error(f"Failed to cleanup cancelled events: {str(exc)}")
        raise


@celery_app.task
def generate_analytics_reports():
    """
    Generate daily analytics reports for platform usage
    """
    try:
        from database import (
            UserModel, CalendarModel, EventModel, EventRegistrationModel,
            NotificationModel, CalendarSubscriptionModel
        )
        
        with get_db_session() as db:
            # Calculate metrics for the last 24 hours
            since = datetime.utcnow() - timedelta(hours=24)
            
            # User metrics
            new_users = db.query(UserModel).filter(
                UserModel.joined_at >= since
            ).count()
            
            # Calendar metrics
            new_calendars = db.query(CalendarModel).filter(
                CalendarModel.created_at >= since
            ).count()
            
            # Event metrics
            new_events = db.query(EventModel).filter(
                EventModel.created_at >= since
            ).count()
            
            # Registration metrics
            new_registrations = db.query(EventRegistrationModel).filter(
                EventRegistrationModel.created_at >= since
            ).count()
            
            # Subscription metrics
            new_subscriptions = db.query(CalendarSubscriptionModel).filter(
                CalendarSubscriptionModel.created_at >= since
            ).count()
            
            # Notification metrics
            notifications_sent = db.query(NotificationModel).filter(
                NotificationModel.sent_at >= since
            ).count()
            
            analytics = {
                "period": "24h",
                "new_users": new_users,
                "new_calendars": new_calendars,
                "new_events": new_events,
                "new_registrations": new_registrations,
                "new_subscriptions": new_subscriptions,
                "notifications_sent": notifications_sent,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            logger.info(f"Generated analytics report: {analytics}")
            return analytics
            
    except Exception as exc:
        logger.error(f"Failed to generate analytics reports: {str(exc)}")
        raise


@celery_app.task
def health_check():
    """
    Perform health checks on the system
    """
    try:
        with get_db_session() as db:
            # Test database connection
            db.execute("SELECT 1")
            
            # Check for any critical issues
            issues = []
            
            # Check for too many failed notifications
            from database import NotificationModel, NotificationStatus
            failed_count = db.query(NotificationModel).filter(
                NotificationModel.status == NotificationStatus.FAILED,
                NotificationModel.created_at >= datetime.utcnow() - timedelta(hours=1)
            ).count()
            
            if failed_count > 100:  # More than 100 failed notifications in the last hour
                issues.append(f"High notification failure rate: {failed_count} failures in last hour")
            
            # Check for old pending notifications
            old_pending = db.query(NotificationModel).filter(
                NotificationModel.status == NotificationStatus.PENDING,
                NotificationModel.created_at < datetime.utcnow() - timedelta(hours=24)
            ).count()
            
            if old_pending > 0:
                issues.append(f"Old pending notifications: {old_pending} notifications pending for >24h")
            
            health_status = {
                "status": "healthy" if not issues else "warning",
                "issues": issues,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            if issues:
                logger.warning(f"Health check found issues: {issues}")
            else:
                logger.info("Health check passed")
            
            return health_status
            
    except Exception as exc:
        logger.error(f"Health check failed: {str(exc)}")
        return {
            "status": "unhealthy",
            "error": str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }