#!/usr/bin/env python3
"""
Integration tests for event-based notifications
Tests the actual notification endpoints and functionality
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app
import uuid
import tempfile
import os


def create_test_client():
    """Create a test client with in-memory database"""
    # Create temporary database file
    db_fd, db_path = tempfile.mkstemp()
    database_url = f"sqlite:///{db_path}"
    
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    Base.metadata.create_all(bind=engine)
    
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    client = TestClient(app)
    
    def cleanup():
        app.dependency_overrides.clear()
        os.close(db_fd)
        os.unlink(db_path)
    
    return client, cleanup


def create_test_user(client, email_suffix=""):
    """Helper function to create a test user"""
    unique_id = uuid.uuid4().hex[:8]
    user_data = {
        "email": f"test{email_suffix}_{unique_id}@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User",
        "username": f"testuser{email_suffix}_{unique_id}"
    }
    
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 200
    
    data = response.json()
    return data["access_token"], data["user"]["id"]


def create_test_calendar(client, headers):
    """Helper function to create a test calendar"""
    unique_id = uuid.uuid4().hex[:8]
    calendar_data = {
        "name": f"Test Calendar {unique_id}",
        "description": "A test calendar for events",
        "slug": f"test-calendar-{unique_id}",
        "visibility": "public",
        "timezone": "UTC"
    }
    
    response = client.post("/api/calendars", json=calendar_data, headers=headers)
    assert response.status_code == 200
    
    return response.json()["id"]


def test_registration_confirmation_notification():
    """Test sending registration confirmation notification"""
    client, cleanup = create_test_client()
    
    try:
        # Create test user and calendar
        access_token, user_id = create_test_user(client)
        headers = {"Authorization": f"Bearer {access_token}"}
        calendar_id = create_test_calendar(client, headers)
        
        # Create a mock event (since we don't have full event endpoints yet)
        # We'll test the notification endpoint directly
        event_id = str(uuid.uuid4())
        
        # Test sending registration confirmation
        response = client.post(
            f"/api/events/{event_id}/send-confirmation",
            params={"user_id": user_id},
            headers=headers
        )
        
        # The endpoint should handle the case where event doesn't exist
        assert response.status_code == 404
        assert "Event not found" in response.json()["detail"]
        
        print("✅ Registration confirmation notification test passed")
        
    finally:
        cleanup()


def test_notification_service_functionality():
    """Test the notification service functionality directly"""
    client, cleanup = create_test_client()
    
    try:
        # Create test user
        access_token, user_id = create_test_user(client)
        
        # Test notification service directly
        from notification_service import NotificationService, NotificationType
        from database import get_db
        
        # Use the same database session as the test client
        db_gen = app.dependency_overrides[get_db]()
        db = next(db_gen)
        notification_service = NotificationService(db)
        
        # Test creating a notification
        notification = notification_service.create_notification(
            user_id=user_id,
            notification_type=NotificationType.REGISTRATION_CONFIRMATION,
            subject="Test Registration Confirmation",
            message="<p>This is a test confirmation email.</p>",
            template_data={"event_title": "Test Event", "event_date": "2024-01-15"}
        )
        
        assert notification is not None
        assert notification.user_id == uuid.UUID(user_id)
        assert notification.type == NotificationType.REGISTRATION_CONFIRMATION
        assert notification.subject == "Test Registration Confirmation"
        
        # Test sending the notification (will fail due to no SMTP config, but should create record)
        success = notification_service.send_notification(notification)
        
        # Should fail due to no SMTP configuration, but notification should be marked as failed
        assert not success
        assert notification.status.value == "failed"
        
        db.close()
        
        print("✅ Notification service functionality test passed")
        
    finally:
        cleanup()


def test_process_scheduled_notifications_endpoint():
    """Test the process scheduled notifications endpoint (admin only)"""
    client, cleanup = create_test_client()
    
    try:
        # Create regular user
        access_token, user_id = create_test_user(client)
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Test with regular user (should fail)
        response = client.post("/api/notifications/process-scheduled", headers=headers)
        assert response.status_code == 403
        assert "Admin access required" in response.json()["detail"]
        
        # Create admin user - we need to use the same database session as the test client
        # The test client uses dependency override, so we need to update through the API
        # For now, let's create a new admin user directly
        admin_token, admin_id = create_test_user(client, "_admin")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Manually set admin status using the test database
        from database import get_db
        db_gen = app.dependency_overrides[get_db]()
        db = next(db_gen)
        from auth import get_user_by_id
        admin_user = get_user_by_id(db, admin_id)
        if admin_user:
            admin_user.is_platform_admin = True
            db.commit()
        db.close()
        
        # Test with admin user
        response = client.post("/api/notifications/process-scheduled", headers=admin_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "sent_count" in data
        assert isinstance(data["sent_count"], int)
        
        print("✅ Process scheduled notifications endpoint test passed")
        
    finally:
        cleanup()


def test_retry_failed_notifications_endpoint():
    """Test the retry failed notifications endpoint (admin only)"""
    client, cleanup = create_test_client()
    
    try:
        # Create admin user
        access_token, user_id = create_test_user(client, "_admin2")
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Manually set admin status using the test database
        from database import get_db
        db_gen = app.dependency_overrides[get_db]()
        db = next(db_gen)
        from auth import get_user_by_id
        admin_user = get_user_by_id(db, user_id)
        if admin_user:
            admin_user.is_platform_admin = True
            db.commit()
        db.close()
        
        # Test retry failed notifications
        response = client.post("/api/notifications/retry-failed", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "retried_count" in data
        assert isinstance(data["retried_count"], int)
        
        print("✅ Retry failed notifications endpoint test passed")
        
    finally:
        cleanup()


if __name__ == "__main__":
    test_registration_confirmation_notification()
    test_notification_service_functionality()
    test_process_scheduled_notifications_endpoint()
    test_retry_failed_notifications_endpoint()
    print("🎉 All notification integration tests passed!")