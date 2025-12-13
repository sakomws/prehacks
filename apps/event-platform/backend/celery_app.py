"""
Celery application configuration for background job processing
"""

from celery import Celery
from celery.schedules import crontab
import os
from decouple import config

# Redis configuration for Celery broker and result backend
REDIS_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default=REDIS_URL)
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default=REDIS_URL)

# Create Celery app
celery_app = Celery(
    'event_platform',
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=[
        'tasks.email_tasks',
        'tasks.notification_tasks', 
        'tasks.reminder_tasks',
        'tasks.cleanup_tasks'
    ]
)

# Celery configuration
celery_app.conf.update(
    # Task serialization
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Task routing
    task_routes={
        'tasks.email_tasks.*': {'queue': 'email'},
        'tasks.notification_tasks.*': {'queue': 'notifications'},
        'tasks.reminder_tasks.*': {'queue': 'reminders'},
        'tasks.cleanup_tasks.*': {'queue': 'cleanup'},
    },
    
    # Task execution settings
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_reject_on_worker_lost=True,
    
    # Result backend settings
    result_expires=3600,  # 1 hour
    
    # Retry settings
    task_default_retry_delay=60,  # 1 minute
    task_max_retries=3,
    
    # Beat schedule for periodic tasks
    beat_schedule={
        # Process scheduled notifications every minute
        'process-scheduled-notifications': {
            'task': 'tasks.notification_tasks.process_scheduled_notifications',
            'schedule': crontab(minute='*'),  # Every minute
        },
        
        # Retry failed notifications every 5 minutes
        'retry-failed-notifications': {
            'task': 'tasks.notification_tasks.retry_failed_notifications',
            'schedule': crontab(minute='*/5'),  # Every 5 minutes
        },
        
        # Send event reminders every minute
        'send-event-reminders': {
            'task': 'tasks.reminder_tasks.send_due_reminders',
            'schedule': crontab(minute='*'),  # Every minute
        },
        
        # Clean up old notifications daily at 2 AM
        'cleanup-old-notifications': {
            'task': 'tasks.cleanup_tasks.cleanup_old_notifications',
            'schedule': crontab(hour=2, minute=0),  # Daily at 2:00 AM
        },
        
        # Clean up expired password reset tokens every hour
        'cleanup-expired-tokens': {
            'task': 'tasks.cleanup_tasks.cleanup_expired_tokens',
            'schedule': crontab(minute=0),  # Every hour
        },
        
        # Update subscription metrics daily at 3 AM
        'update-subscription-metrics': {
            'task': 'tasks.cleanup_tasks.update_subscription_metrics',
            'schedule': crontab(hour=3, minute=0),  # Daily at 3:00 AM
        },
    },
)

# Configure logging
celery_app.conf.worker_log_format = '[%(asctime)s: %(levelname)s/%(processName)s] %(message)s'
celery_app.conf.worker_task_log_format = '[%(asctime)s: %(levelname)s/%(processName)s][%(task_name)s(%(task_id)s)] %(message)s'

# Import tasks to register them
from tasks import email_tasks, notification_tasks, reminder_tasks, cleanup_tasks

if __name__ == '__main__':
    celery_app.start()