#!/usr/bin/env python3
"""
Test script for Celery background job processing
"""

import sys
import os
from datetime import datetime, timedelta

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_celery_configuration():
    """Test Celery app configuration"""
    print("Testing Celery configuration...")
    
    try:
        from celery_app import celery_app
        print(f"✅ Celery app created: {celery_app.main}")
        print(f"✅ Broker URL: {celery_app.conf.broker_url}")
        print(f"✅ Result backend: {celery_app.conf.result_backend}")
        print(f"✅ Task routes: {celery_app.conf.task_routes}")
        return True
    except Exception as e:
        print(f"❌ Celery configuration failed: {e}")
        return False

def test_task_imports():
    """Test task module imports"""
    print("\nTesting task imports...")
    
    tasks_to_test = [
        ('tasks.email_tasks', 'send_email_task'),
        ('tasks.notification_tasks', 'process_scheduled_notifications'),
        ('tasks.reminder_tasks', 'schedule_event_reminders'),
        ('tasks.cleanup_tasks', 'cleanup_old_notifications'),
    ]
    
    success_count = 0
    for module, task in tasks_to_test:
        try:
            exec(f"from {module} import {task}")
            print(f"✅ {module}.{task}")
            success_count += 1
        except Exception as e:
            print(f"❌ {module}.{task}: {e}")
    
    print(f"\nTask imports: {success_count}/{len(tasks_to_test)} successful")
    return success_count == len(tasks_to_test)

def test_database_session():
    """Test database session for Celery tasks"""
    print("\nTesting database session...")
    
    try:
        from database import get_db_session
        
        with get_db_session() as db:
            # Test basic database operation
            from sqlalchemy import text
            result = db.execute(text("SELECT 1 as test")).fetchone()
            if result and result[0] == 1:
                print("✅ Database session working")
                return True
            else:
                print("❌ Database query failed")
                return False
    except Exception as e:
        print(f"❌ Database session failed: {e}")
        return False

def test_notification_service():
    """Test notification service integration"""
    print("\nTesting notification service...")
    
    try:
        from database import get_db_session
        from notification_service import NotificationService
        
        with get_db_session() as db:
            service = NotificationService(db)
            print("✅ NotificationService created successfully")
            return True
    except Exception as e:
        print(f"❌ NotificationService failed: {e}")
        return False

def test_beat_schedule():
    """Test Celery Beat schedule configuration"""
    print("\nTesting Celery Beat schedule...")
    
    try:
        from celery_app import celery_app
        
        schedule = celery_app.conf.beat_schedule
        expected_tasks = [
            'process-scheduled-notifications',
            'retry-failed-notifications', 
            'send-event-reminders',
            'cleanup-old-notifications',
            'cleanup-expired-tokens',
            'update-subscription-metrics'
        ]
        
        missing_tasks = []
        for task in expected_tasks:
            if task in schedule:
                print(f"✅ {task}: {schedule[task]['schedule']}")
            else:
                missing_tasks.append(task)
                print(f"❌ {task}: Missing")
        
        if not missing_tasks:
            print("✅ All scheduled tasks configured")
            return True
        else:
            print(f"❌ Missing tasks: {missing_tasks}")
            return False
            
    except Exception as e:
        print(f"❌ Beat schedule test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing Celery Background Job Processing Setup\n")
    
    tests = [
        test_celery_configuration,
        test_task_imports,
        test_database_session,
        test_notification_service,
        test_beat_schedule
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()  # Add spacing between tests
    
    print("=" * 50)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Celery setup is ready.")
        print("\nNext steps:")
        print("1. Start Redis server: redis-server")
        print("2. Start Celery worker: python run_celery.py worker")
        print("3. Start Celery beat: python run_celery.py beat")
        print("4. Optional - Start Flower: python run_celery.py flower")
    else:
        print("⚠️  Some tests failed. Please check the configuration.")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())