"""
Event reminder tasks for background job processing
"""

from celery_app import celery_app
from database import get_db_session
from notification_service import NotificationService
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


@celery_app.task
def send_due_reminders():
    """
    Send event reminders that are due
    This task runs every minute via Celery Beat
    """
    try:
        with get_db_session() as db:
            notification_service = NotificationService(db)
            sent_count = notification_service.process_scheduled_notifications()
            
            if sent_count > 0:
                logger.info(f"Sent {sent_count} event reminders")
            
            return {"sent": sent_count, "timestamp": datetime.utcnow().isoformat()}
            
    except Exception as exc:
        logger.error(f"Failed to send due reminders: {str(exc)}")
        raise


@celery_app.task
def schedule_event_reminders(event_id: str):
    """
    Schedule reminder notifications for an event
    Creates reminders at 24 hours, 1 hour, and 15 minutes before the event
    
    Args:
        event_id: Event ID to schedule reminders for
    """
    try:
        from event_service import get_event_by_id
        from auth import get_user_by_id
        
        with get_db_session() as db:
            # Get event
            event = get_event_by_id(db, event_id)
            if not event:
                logger.error(f"Event {event_id} not found")
                return {"status": "error", "message": "Event not found"}
            
            # Get all registered attendees
            from database import EventRegistrationModel, RegistrationStatus
            registrations = db.query(EventRegistrationModel).filter(
                EventRegistrationModel.event_id == event.id,
                EventRegistrationModel.status == RegistrationStatus.CONFIRMED
            ).all()
            
            if not registrations:
                logger.info(f"No confirmed registrations for event {event_id}")
                return {"status": "success", "reminders_scheduled": 0}
            
            notification_service = NotificationService(db)
            reminders_scheduled = 0
            
            # Define reminder times (before event start)
            reminder_intervals = [
                timedelta(days=1),      # 24 hours before
                timedelta(hours=1),     # 1 hour before
                timedelta(minutes=15),  # 15 minutes before
            ]
            
            for registration in registrations:
                user = get_user_by_id(db, str(registration.user_id))
                if not user:
                    continue
                
                for interval in reminder_intervals:
                    reminder_time = event.start_time - interval
                    
                    # Only schedule if reminder time is in the future
                    if reminder_time > datetime.utcnow():
                        success = notification_service.schedule_event_reminder(
                            user_id=str(user.id),
                            event_id=event_id,
                            event_title=event.title,
                            event_date=event.start_time,
                            reminder_time=reminder_time
                        )
                        
                        if success:
                            reminders_scheduled += 1
            
            logger.info(f"Scheduled {reminders_scheduled} reminders for event {event_id}")
            return {
                "status": "success",
                "event_id": event_id,
                "reminders_scheduled": reminders_scheduled,
                "attendees": len(registrations)
            }
            
    except Exception as exc:
        logger.error(f"Failed to schedule reminders for event {event_id}: {str(exc)}")
        raise


@celery_app.task
def send_event_reminder(user_id: str, event_id: str, reminder_type: str = "general"):
    """
    Send a specific event reminder to a user
    
    Args:
        user_id: User ID to send reminder to
        event_id: Event ID
        reminder_type: Type of reminder (general, last_chance, etc.)
    """
    try:
        from event_service import get_event_by_id
        from auth import get_user_by_id
        
        with get_db_session() as db:
            # Get event and user
            event = get_event_by_id(db, event_id)
            user = get_user_by_id(db, user_id)
            
            if not event or not user:
                logger.error(f"Event {event_id} or user {user_id} not found")
                return {"status": "error", "message": "Event or user not found"}
            
            # Determine location
            location = None
            if event.location_type == "offline" and event.location_address:
                location = event.location_address
            elif event.location_type == "online" and event.location_url:
                location = f"Online: {event.location_url}"
            elif event.location_type == "hybrid":
                location = f"Hybrid - {event.location_address or 'TBD'}"
            
            # Create reminder content based on type
            if reminder_type == "last_chance":
                subject = f"Last Chance to Join: {event.title}"
                time_until = "starting soon"
            else:
                subject = f"Reminder: {event.title}"
                # Calculate time until event
                time_diff = event.start_time - datetime.utcnow()
                if time_diff.days > 0:
                    time_until = f"in {time_diff.days} day{'s' if time_diff.days > 1 else ''}"
                elif time_diff.seconds > 3600:
                    hours = time_diff.seconds // 3600
                    time_until = f"in {hours} hour{'s' if hours > 1 else ''}"
                else:
                    minutes = time_diff.seconds // 60
                    time_until = f"in {minutes} minute{'s' if minutes > 1 else ''}"
            
            # Create HTML content
            html_content = f"""
            <html>
            <body>
                <h2>Event Reminder</h2>
                <p>This is a friendly reminder about your upcoming event {time_until}:</p>
                
                <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                    <p><strong>Date:</strong> {event.start_time.strftime('%B %d, %Y at %I:%M %p')}</p>
                    {f'<p><strong>Location:</strong> {location}</p>' if location else ''}
                </div>
                
                <p>Don't forget to attend!</p>
                
                <p>Best regards,<br>
                The Event Platform Team</p>
            </body>
            </html>
            """
            
            # Send reminder using notification service
            notification_service = NotificationService(db)
            success = notification_service.send_event_reminder_immediate(
                user_id=user_id,
                event_id=event_id,
                subject=subject,
                html_content=html_content
            )
            
            if success:
                logger.info(f"Event reminder sent to user {user_id} for event {event_id}")
                return {"status": "sent", "user_id": user_id, "event_id": event_id}
            else:
                raise Exception("Failed to send reminder")
                
    except Exception as exc:
        logger.error(f"Failed to send event reminder: {str(exc)}")
        raise


@celery_app.task
def send_bulk_event_reminders(event_id: str, reminder_type: str = "general"):
    """
    Send event reminders to all confirmed attendees of an event
    
    Args:
        event_id: Event ID
        reminder_type: Type of reminder to send
    """
    try:
        with get_db_session() as db:
            # Get all confirmed registrations for the event
            from database import EventRegistrationModel, RegistrationStatus
            registrations = db.query(EventRegistrationModel).filter(
                EventRegistrationModel.event_id == event_id,
                EventRegistrationModel.status == RegistrationStatus.CONFIRMED
            ).all()
            
            if not registrations:
                logger.info(f"No confirmed registrations for event {event_id}")
                return {"status": "success", "reminders_sent": 0}
            
            # Queue individual reminder tasks
            results = []
            for registration in registrations:
                try:
                    task = send_event_reminder.delay(
                        user_id=str(registration.user_id),
                        event_id=event_id,
                        reminder_type=reminder_type
                    )
                    results.append({"user_id": str(registration.user_id), "task_id": task.id})
                except Exception as e:
                    logger.error(f"Failed to queue reminder for user {registration.user_id}: {str(e)}")
                    results.append({"user_id": str(registration.user_id), "error": str(e)})
            
            logger.info(f"Queued {len(results)} reminder tasks for event {event_id}")
            return {
                "status": "success",
                "event_id": event_id,
                "reminders_queued": len(results),
                "results": results
            }
            
    except Exception as exc:
        logger.error(f"Failed to send bulk reminders for event {event_id}: {str(exc)}")
        raise


@celery_app.task
def cleanup_old_reminders():
    """
    Clean up old reminder notifications for events that have already passed
    """
    try:
        from database import NotificationModel, NotificationType
        
        with get_db_session() as db:
            # Get current time
            now = datetime.utcnow()
            
            # Delete reminder notifications for events that ended more than 7 days ago
            cutoff_date = now - timedelta(days=7)
            
            # This would require joining with events table to check end times
            # For now, just clean up old scheduled reminders that are past due
            deleted_count = db.query(NotificationModel).filter(
                NotificationModel.type == NotificationType.EVENT_REMINDER,
                NotificationModel.scheduled_for < cutoff_date,
                NotificationModel.status.in_(['pending', 'failed'])
            ).delete()
            
            db.commit()
            
            logger.info(f"Cleaned up {deleted_count} old reminder notifications")
            return {"deleted": deleted_count, "cutoff_date": cutoff_date.isoformat()}
            
    except Exception as exc:
        logger.error(f"Failed to cleanup old reminders: {str(exc)}")
        raise