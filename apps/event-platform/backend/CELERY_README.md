# Celery Background Job Processing

This document explains how to set up and use Celery for background job processing in the Event Management Platform.

## Overview

Celery is used for:
- **Email Queue Processing**: Asynchronous email sending for notifications
- **Scheduled Reminder Jobs**: Event reminders sent at specific times
- **Data Cleanup Tasks**: Maintenance tasks like cleaning old notifications
- **Bulk Operations**: Processing large numbers of notifications efficiently

## Prerequisites

1. **Redis Server**: Celery uses Redis as both message broker and result backend
   ```bash
   # Install Redis (macOS)
   brew install redis
   
   # Start Redis
   redis-server
   ```

2. **Python Dependencies**: Already included in requirements.txt
   - celery==5.4.0
   - redis==5.2.1

## Configuration

1. **Environment Variables**: Update your `.env` file:
   ```env
   REDIS_URL=redis://localhost:6379
   CELERY_BROKER_URL=redis://localhost:6379/0
   CELERY_RESULT_BACKEND=redis://localhost:6379/0
   
   # Email settings for notifications
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   FROM_EMAIL=noreply@eventplatform.com
   FROM_NAME=Event Platform
   ```

## Running Celery Services

### Option 1: Using the Management Script (Recommended)

```bash
# Run worker only
python run_celery.py worker

# Run beat scheduler only
python run_celery.py beat

# Run Flower monitoring tool only
python run_celery.py flower

# Run all services (worker + beat + flower)
python run_celery.py all

# Run worker with specific queues
python run_celery.py worker --queues email notifications

# Run worker with custom concurrency
python run_celery.py worker --concurrency 8
```

### Option 2: Manual Commands

```bash
# Start Celery worker
celery -A celery_app worker --loglevel=info

# Start Celery beat scheduler (for periodic tasks)
celery -A celery_app beat --loglevel=info

# Start Flower monitoring (optional)
celery -A celery_app flower --port=5555
```

## Queue Structure

The system uses multiple queues for different types of tasks:

- **email**: Email sending tasks
- **notifications**: General notification processing
- **reminders**: Event reminder tasks
- **cleanup**: Data maintenance and cleanup tasks

## Scheduled Tasks (Celery Beat)

The following tasks run automatically:

| Task | Schedule | Description |
|------|----------|-------------|
| `process-scheduled-notifications` | Every minute | Send due notifications |
| `retry-failed-notifications` | Every 5 minutes | Retry failed notifications |
| `send-event-reminders` | Every minute | Send due event reminders |
| `cleanup-old-notifications` | Daily at 2 AM | Remove old notifications |
| `cleanup-expired-tokens` | Every hour | Clean expired password reset tokens |
| `update-subscription-metrics` | Daily at 3 AM | Update calendar subscription metrics |

## API Endpoints

### Queue Notifications
```http
POST /api/jobs/queue-notification
Content-Type: application/json

{
  "user_id": "user-uuid",
  "notification_type": "event_reminder",
  "subject": "Event Reminder",
  "message": "<html>...</html>",
  "event_id": "event-uuid",
  "scheduled_for": "2024-01-01T10:00:00Z"
}
```

### Schedule Event Reminders
```http
POST /api/jobs/schedule-event-reminders/{event_id}
```

### Send Bulk Notifications
```http
POST /api/jobs/send-bulk-notifications
Content-Type: application/json

{
  "user_ids": ["user1-uuid", "user2-uuid"],
  "notification_type": "invitation",
  "event_id": "event-uuid",
  "event_data": {
    "title": "Event Title",
    "description": "Event Description",
    "date": "January 1, 2024 at 10:00 AM",
    "location": "Event Location"
  }
}
```

### Check Job Status
```http
GET /api/jobs/status/{task_id}
```

### Health Check
```http
GET /api/jobs/health
```

## Task Types

### Email Tasks (`tasks/email_tasks.py`)
- `send_email_task`: Send individual emails
- `send_bulk_emails_task`: Send multiple emails
- `send_registration_confirmation_email`: Registration confirmations
- `send_event_update_email`: Event update notifications
- `send_event_invitation_email`: Event invitations

### Notification Tasks (`tasks/notification_tasks.py`)
- `process_scheduled_notifications`: Process due notifications
- `retry_failed_notifications`: Retry failed notifications
- `send_notification_task`: Send specific notification
- `queue_notification`: Queue new notification

### Reminder Tasks (`tasks/reminder_tasks.py`)
- `send_due_reminders`: Send due event reminders
- `schedule_event_reminders`: Schedule reminders for an event
- `send_event_reminder`: Send specific reminder
- `send_bulk_event_reminders`: Send reminders to all attendees

### Cleanup Tasks (`tasks/cleanup_tasks.py`)
- `cleanup_old_notifications`: Remove old notifications
- `cleanup_expired_tokens`: Clean expired tokens
- `update_subscription_metrics`: Update metrics
- `cleanup_orphaned_files`: Remove unused files
- `generate_analytics_reports`: Generate usage reports

## Monitoring

### Flower Web UI
Access Flower at `http://localhost:5555` to monitor:
- Active workers and tasks
- Task history and results
- Queue lengths and processing rates
- Worker statistics

### Logs
Celery logs include:
- Task execution status
- Error messages and tracebacks
- Performance metrics
- Worker health information

## Error Handling

### Automatic Retries
Tasks automatically retry on failure with exponential backoff:
- Email tasks: 3 retries with 60s, 120s, 240s delays
- Notification tasks: 3 retries with exponential backoff
- Failed tasks are logged with error details

### Manual Retry
Use the API endpoint to manually retry failed notifications:
```http
POST /api/notifications/retry-failed
```

## Development Tips

1. **Testing Tasks**: Run tasks synchronously during development:
   ```python
   # In settings, set:
   CELERY_TASK_ALWAYS_EAGER = True
   ```

2. **Debugging**: Use Flower to inspect task results and errors

3. **Queue Management**: Monitor queue lengths to ensure workers keep up with load

4. **Resource Usage**: Adjust worker concurrency based on server resources

## Production Deployment

1. **Process Management**: Use supervisord or systemd to manage Celery processes
2. **Monitoring**: Set up alerts for failed tasks and queue backlogs
3. **Scaling**: Add more workers or use multiple servers for high load
4. **Persistence**: Configure Redis persistence for task durability

## Troubleshooting

### Common Issues

1. **Redis Connection Error**:
   - Ensure Redis server is running
   - Check REDIS_URL configuration

2. **Tasks Not Processing**:
   - Verify worker is running
   - Check queue names match task routing

3. **Email Sending Fails**:
   - Verify SMTP configuration
   - Check email credentials and permissions

4. **High Memory Usage**:
   - Reduce worker concurrency
   - Enable task result expiration

### Useful Commands

```bash
# Check Redis connection
redis-cli ping

# Monitor Redis queues
redis-cli monitor

# Purge all queues
celery -A celery_app purge

# Inspect active tasks
celery -A celery_app inspect active

# Get worker statistics
celery -A celery_app inspect stats
```