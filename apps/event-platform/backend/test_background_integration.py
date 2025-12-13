#!/usr/bin/env python3
"""
Integration test for background job processing with existing notification system
"""

import sys
import os
import uuid
from datetime import datetime, timedelta

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_notification_creation():
    """Test creating notifications through the service"""
    print("Testing notification creation...")
    
    try:
        from database import get_db_session, NotificationType, NotificationChannel
        from notification_service import NotificationService
        
        with get_db_session() as db:
            service = NotificationService(db)
            
            # Create a test notification
            notification = service.create_notification(
                user_id=str(uuid.uuid4()),
                notification_type=NotificationType.EVENT_REMINDER,
                subject="Test Notification",
                message="This is a test notification",
                template_data={"test": "data"}
            )
            
            print(f"✅ Notification created: {notification.id}")
            print(f"   Type: {notification.type}")
            print(f"   Status: {notification.status}")
            return True
            
    except Exception as e:
        print(f"❌ Notification creation failed: {e}")
        return False

def test_scheduled_notification():
    """Test creating scheduled notifications"""
    print("\nTesting scheduled notification creation...")
    
    try:
        from database import get_db_session, NotificationType
        from notification_service import NotificationService
        
        with get_db_session() as db:
            service = NotificationService(db)
            
            # Create a scheduled notification (5 minutes from now)
            scheduled_time = datetime.utcnow() + timedelta(minutes=5)
            
            notification = service.create_notification(
                user_id=str(uuid.uuid4()),
                notification_type=NotificationType.EVENT_REMINDER,
                subject="Scheduled Test Notification",
                message="This is a scheduled test notification",
                scheduled_for=scheduled_time
            )
            
            print(f"✅ Scheduled notification created: {notification.id}")
            print(f"   Scheduled for: {notification.scheduled_for}")
            return True
            
    except Exception as e:
        print(f"❌ Scheduled notification creation failed: {e}")
        return False

def test_celery_task_registration():
    """Test that Celery tasks are properly registered"""
    print("\nTesting Celery task registration...")
    
    try:
        from celery_app import celery_app
        
        # Get registered tasks
        registered_tasks = list(celery_app.tasks.keys())
        
        expected_tasks = [
            'tasks.email_tasks.send_email_task',
            'tasks.notification_tasks.process_scheduled_notifications',
            'tasks.reminder_tasks.schedule_event_reminders',
            'tasks.cleanup_tasks.cleanup_old_notifications'
        ]
        
        missing_tasks = []
        for task in expected_tasks:
            if task in registered_tasks:
                print(f"✅ {task}")
            else:
                missing_tasks.append(task)
                print(f"❌ {task}: Not registered")
        
        if not missing_tasks:
            print("✅ All expected tasks are registered")
            return True
        else:
            print(f"❌ Missing tasks: {missing_tasks}")
            return False
            
    except Exception as e:
        print(f"❌ Task registration test failed: {e}")
        return False

def test_email_service():
    """Test email service configuration"""
    print("\nTesting email service...")
    
    try:
        from notification_service import EmailService
        
        email_service = EmailService()
        print(f"✅ Email service created")
        print(f"   SMTP Server: {email_service.smtp_server}")
        print(f"   SMTP Port: {email_service.smtp_port}")
        print(f"   From Email: {email_service.from_email}")
        return True
        
    except Exception as e:
        print(f"❌ Email service test failed: {e}")
        return False

def test_task_delay_simulation():
    """Test task delay (simulation without actually running)"""
    print("\nTesting task delay simulation...")
    
    try:
        from tasks.email_tasks import send_email_task
        
        # This would normally queue the task, but we're just testing the interface
        # In a real test with Redis running, this would return an AsyncResult
        print("✅ Task delay interface available")
        print("   Note: Actual task execution requires Redis and Celery worker")
        return True
        
    except Exception as e:
        print(f"❌ Task delay simulation failed: {e}")
        return False

def main():
    """Run integration tests"""
    print("🔧 Testing Background Job Integration\n")
    
    tests = [
        test_notification_creation,
        test_scheduled_notification,
        test_celery_task_registration,
        test_email_service,
        test_task_delay_simulation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 60)
    print(f"Integration Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Integration tests passed! Background job system is ready.")
        print("\nTo test with actual job execution:")
        print("1. Start Redis: redis-server")
        print("2. Start worker: python run_celery.py worker")
        print("3. Use API endpoints to queue jobs")
    else:
        print("⚠️  Some integration tests failed.")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())