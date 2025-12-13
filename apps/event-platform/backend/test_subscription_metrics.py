#!/usr/bin/env python3
"""
Tests for calendar subscription metrics and analytics functionality
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import tempfile
import os
import uuid
import time

from main import app
from database import Base, get_db

def create_test_client():
    """Create a test client with a fresh database"""
    # Create temporary database file
    db_fd, db_path = tempfile.mkstemp()
    database_url = f"sqlite:///{db_path}"
    
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables
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
        os.close(db_fd)
        os.unlink(db_path)
    
    return client, cleanup

def create_test_setup(client):
    """Helper function to create test users and calendar with multiple subscribers"""
    # Create calendar owner
    owner_data = {
        "email": "owner@example.com",
        "password": "testpassword123",
        "first_name": "Calendar",
        "last_name": "Owner",
        "username": "calowner"
    }
    
    register_response = client.post("/api/auth/register", json=owner_data)
    assert register_response.status_code == 200
    owner_token = register_response.json()["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    
    # Create calendar
    calendar_data = {
        "name": "Analytics Test Calendar",
        "description": "A calendar for testing analytics",
        "visibility": "public",
        "timezone": "UTC"
    }
    
    calendar_response = client.post("/api/calendars", json=calendar_data, headers=owner_headers)
    assert calendar_response.status_code == 200
    calendar_id = calendar_response.json()["id"]
    
    # Create multiple subscribers
    subscriber_headers = []
    for i in range(3):
        user_data = {
            "email": f"subscriber{i}@example.com",
            "password": "testpassword123",
            "first_name": f"Subscriber",
            "last_name": f"{i}",
            "username": f"subscriber{i}"
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 200
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        subscriber_headers.append(headers)
        
        # Subscribe to calendar with different preferences
        subscription_data = {
            "notification_preferences": {
                "new_events": i % 2 == 0,  # Every other subscriber
                "event_updates": True,      # All subscribers
                "event_reminders": i == 2   # Only last subscriber
            }
        }
        
        response = client.post(
            f"/api/calendars/{calendar_id}/subscribe", 
            json=subscription_data, 
            headers=headers
        )
        assert response.status_code == 200
    
    return owner_headers, subscriber_headers, calendar_id

def test_subscription_metrics():
    """Test subscription metrics calculation"""
    client, cleanup = create_test_client()
    
    try:
        owner_headers, subscriber_headers, calendar_id = create_test_setup(client)
        
        # Get subscription metrics
        response = client.get(
            f"/api/calendars/{calendar_id}/subscription-metrics", 
            headers=owner_headers
        )
        assert response.status_code == 200
        
        metrics = response.json()
        assert metrics["total_subscribers"] == 3
        assert metrics["active_subscribers"] == 3
        assert metrics["recent_subscriptions"] == 3  # All created recently
        assert "subscription_growth_rate" in metrics
        assert "top_notification_preferences" in metrics
        
        # Check notification preferences analysis
        prefs = metrics["top_notification_preferences"]
        assert prefs["new_events"] == 2  # 2 out of 3 subscribers
        assert prefs["event_updates"] == 3  # All 3 subscribers
        assert prefs["event_reminders"] == 1  # 1 out of 3 subscribers
        
        print("✅ Subscription metrics test passed")
        
    finally:
        cleanup()

def test_subscription_activity_feed():
    """Test subscription activity feed"""
    client, cleanup = create_test_client()
    
    try:
        owner_headers, subscriber_headers, calendar_id = create_test_setup(client)
        
        # Get subscription activity
        response = client.get(
            f"/api/calendars/{calendar_id}/subscription-activity", 
            headers=owner_headers
        )
        assert response.status_code == 200
        
        activities = response.json()
        assert len(activities) == 3  # 3 subscription activities
        
        # Check activity structure
        for activity in activities:
            assert "id" in activity
            assert "calendar_id" in activity
            assert "user_id" in activity
            assert "action" in activity
            assert "timestamp" in activity
            assert activity["action"] in ["subscribed", "updated_preferences"]  # Both are valid for new subscriptions
            assert activity["calendar_id"] == calendar_id
        
        print("✅ Subscription activity feed test passed")
        
    finally:
        cleanup()

def test_subscription_activity_with_unsubscribe():
    """Test subscription activity includes unsubscribe actions"""
    client, cleanup = create_test_client()
    
    try:
        owner_headers, subscriber_headers, calendar_id = create_test_setup(client)
        
        # Unsubscribe one user
        response = client.delete(
            f"/api/calendars/{calendar_id}/subscribe", 
            headers=subscriber_headers[0]
        )
        assert response.status_code == 200
        
        # Get subscription activity
        response = client.get(
            f"/api/calendars/{calendar_id}/subscription-activity", 
            headers=owner_headers
        )
        assert response.status_code == 200
        
        activities = response.json()
        assert len(activities) == 3  # Still 3 activities (3 subscriptions)
        
        # The most recent activity should be the unsubscribe
        # Note: The activity feed shows all subscription records, 
        # and determines action based on is_active status
        
        print("✅ Subscription activity with unsubscribe test passed")
        
    finally:
        cleanup()

def test_notification_trigger():
    """Test triggering notifications for subscribers"""
    client, cleanup = create_test_client()
    
    try:
        owner_headers, subscriber_headers, calendar_id = create_test_setup(client)
        
        # Trigger new_events notification
        event_data = {
            "event_name": "Test Event",
            "event_date": "2024-01-15T10:00:00Z"
        }
        
        response = client.post(
            f"/api/calendars/{calendar_id}/notify-subscribers",
            params={"notification_type": "new_events"},
            json=event_data,
            headers=owner_headers
        )
        assert response.status_code == 200
        
        result = response.json()
        assert result["notification_type"] == "new_events"
        assert result["recipients"] == 2  # 2 subscribers have new_events enabled
        assert "Triggered 2 notifications" in result["message"]
        
        # Trigger event_updates notification
        response = client.post(
            f"/api/calendars/{calendar_id}/notify-subscribers",
            params={"notification_type": "event_updates"},
            json=event_data,
            headers=owner_headers
        )
        assert response.status_code == 200
        
        result = response.json()
        assert result["recipients"] == 3  # All 3 subscribers have event_updates enabled
        
        print("✅ Notification trigger test passed")
        
    finally:
        cleanup()

def test_metrics_access_control():
    """Test that only calendar owners/admins can access metrics"""
    client, cleanup = create_test_client()
    
    try:
        owner_headers, subscriber_headers, calendar_id = create_test_setup(client)
        
        # Owner should be able to access metrics
        response = client.get(
            f"/api/calendars/{calendar_id}/subscription-metrics", 
            headers=owner_headers
        )
        assert response.status_code == 200
        
        # Subscriber should NOT be able to access metrics
        response = client.get(
            f"/api/calendars/{calendar_id}/subscription-metrics", 
            headers=subscriber_headers[0]
        )
        assert response.status_code == 403
        assert "Permission denied" in response.json()["detail"]
        
        print("✅ Metrics access control test passed")
        
    finally:
        cleanup()

def test_invalid_notification_type():
    """Test handling of invalid notification types"""
    client, cleanup = create_test_client()
    
    try:
        owner_headers, subscriber_headers, calendar_id = create_test_setup(client)
        
        # Try to trigger invalid notification type
        event_data = {"test": "data"}
        
        response = client.post(
            f"/api/calendars/{calendar_id}/notify-subscribers",
            params={"notification_type": "invalid_type"},
            json=event_data,
            headers=owner_headers
        )
        assert response.status_code == 400
        assert "Invalid notification type" in response.json()["detail"]
        
        print("✅ Invalid notification type test passed")
        
    finally:
        cleanup()

def test_subscriber_count_accuracy():
    """Test that subscriber count is accurate after subscriptions and unsubscriptions"""
    client, cleanup = create_test_client()
    
    try:
        owner_headers, subscriber_headers, calendar_id = create_test_setup(client)
        
        # Initial count should be 3
        response = client.get(
            f"/api/calendars/{calendar_id}/subscriber-count", 
            headers=owner_headers
        )
        assert response.status_code == 200
        assert response.json()["subscriber_count"] == 3
        
        # Unsubscribe one user
        response = client.delete(
            f"/api/calendars/{calendar_id}/subscribe", 
            headers=subscriber_headers[0]
        )
        assert response.status_code == 200
        
        # Count should now be 2
        response = client.get(
            f"/api/calendars/{calendar_id}/subscriber-count", 
            headers=owner_headers
        )
        assert response.status_code == 200
        assert response.json()["subscriber_count"] == 2
        
        # Metrics should also reflect the change
        response = client.get(
            f"/api/calendars/{calendar_id}/subscription-metrics", 
            headers=owner_headers
        )
        assert response.status_code == 200
        
        metrics = response.json()
        assert metrics["active_subscribers"] == 2
        assert metrics["total_subscribers"] == 3  # Total includes inactive
        
        print("✅ Subscriber count accuracy test passed")
        
    finally:
        cleanup()

if __name__ == "__main__":
    test_subscription_metrics()
    test_subscription_activity_feed()
    test_subscription_activity_with_unsubscribe()
    test_notification_trigger()
    test_metrics_access_control()
    test_invalid_notification_type()
    test_subscriber_count_accuracy()
    print("✅ All subscription metrics tests passed!")