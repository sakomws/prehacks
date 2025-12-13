#!/usr/bin/env python3
"""
Tests for calendar subscription functionality
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import tempfile
import os
import uuid

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

def create_test_users_and_calendar(client):
    """Helper function to create test users and a calendar"""
    # Create first user (calendar owner)
    user1_data = {
        "email": "owner@example.com",
        "password": "testpassword123",
        "first_name": "Calendar",
        "last_name": "Owner",
        "username": "calowner"
    }
    
    register1_response = client.post("/api/auth/register", json=user1_data)
    assert register1_response.status_code == 200
    user1_token = register1_response.json()["access_token"]
    user1_headers = {"Authorization": f"Bearer {user1_token}"}
    
    # Create second user (subscriber)
    user2_data = {
        "email": "subscriber@example.com",
        "password": "testpassword123",
        "first_name": "Calendar",
        "last_name": "Subscriber",
        "username": "subscriber"
    }
    
    register2_response = client.post("/api/auth/register", json=user2_data)
    assert register2_response.status_code == 200
    user2_token = register2_response.json()["access_token"]
    user2_headers = {"Authorization": f"Bearer {user2_token}"}
    
    # Create a public calendar
    calendar_data = {
        "name": "Public Test Calendar",
        "description": "A public calendar for testing subscriptions",
        "visibility": "public",
        "timezone": "UTC"
    }
    
    calendar_response = client.post("/api/calendars", json=calendar_data, headers=user1_headers)
    assert calendar_response.status_code == 200
    calendar_id = calendar_response.json()["id"]
    
    return user1_headers, user2_headers, calendar_id

def test_calendar_subscription_creation():
    """Test basic calendar subscription creation"""
    client, cleanup = create_test_client()
    
    try:
        user1_headers, user2_headers, calendar_id = create_test_users_and_calendar(client)
        
        # Subscribe to the calendar
        subscription_data = {
            "notification_preferences": {
                "new_events": True,
                "event_updates": True,
                "event_reminders": False
            }
        }
        
        response = client.post(
            f"/api/calendars/{calendar_id}/subscribe", 
            json=subscription_data, 
            headers=user2_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["calendar_id"] == calendar_id
        assert data["is_active"] == True
        assert data["notification_preferences"]["new_events"] == True
        assert data["notification_preferences"]["event_updates"] == True
        assert data["notification_preferences"]["event_reminders"] == False
        assert "id" in data
        assert "subscribed_at" in data
        
        print("✅ Calendar subscription creation test passed")
        
    finally:
        cleanup()

def test_calendar_subscription_duplicate_prevention():
    """Test that duplicate subscriptions are prevented"""
    client, cleanup = create_test_client()
    
    try:
        user1_headers, user2_headers, calendar_id = create_test_users_and_calendar(client)
        
        # Subscribe to the calendar
        subscription_data = {
            "notification_preferences": {
                "new_events": True
            }
        }
        
        # First subscription should succeed
        response1 = client.post(
            f"/api/calendars/{calendar_id}/subscribe", 
            json=subscription_data, 
            headers=user2_headers
        )
        assert response1.status_code == 200
        
        # Second subscription should fail
        response2 = client.post(
            f"/api/calendars/{calendar_id}/subscribe", 
            json=subscription_data, 
            headers=user2_headers
        )
        assert response2.status_code == 400
        assert "already subscribed" in response2.json()["detail"]
        
        print("✅ Calendar subscription duplicate prevention test passed")
        
    finally:
        cleanup()

def test_calendar_unsubscription():
    """Test calendar unsubscription"""
    client, cleanup = create_test_client()
    
    try:
        user1_headers, user2_headers, calendar_id = create_test_users_and_calendar(client)
        
        # Subscribe to the calendar
        subscription_data = {
            "notification_preferences": {
                "new_events": True
            }
        }
        
        response = client.post(
            f"/api/calendars/{calendar_id}/subscribe", 
            json=subscription_data, 
            headers=user2_headers
        )
        assert response.status_code == 200
        
        # Unsubscribe from the calendar
        response = client.delete(
            f"/api/calendars/{calendar_id}/subscribe", 
            headers=user2_headers
        )
        assert response.status_code == 200
        assert "Successfully unsubscribed" in response.json()["message"]
        
        # Verify subscription is no longer active
        response = client.get(
            f"/api/calendars/{calendar_id}/subscription", 
            headers=user2_headers
        )
        assert response.status_code == 404
        
        print("✅ Calendar unsubscription test passed")
        
    finally:
        cleanup()

def test_user_subscriptions_list():
    """Test getting user's subscription list"""
    client, cleanup = create_test_client()
    
    try:
        user1_headers, user2_headers, calendar_id = create_test_users_and_calendar(client)
        
        # Subscribe to the calendar
        subscription_data = {
            "notification_preferences": {
                "new_events": True
            }
        }
        
        response = client.post(
            f"/api/calendars/{calendar_id}/subscribe", 
            json=subscription_data, 
            headers=user2_headers
        )
        assert response.status_code == 200
        
        # Get user's subscriptions
        response = client.get("/api/users/subscriptions", headers=user2_headers)
        assert response.status_code == 200
        
        subscriptions = response.json()
        assert len(subscriptions) == 1
        assert subscriptions[0]["calendar_id"] == calendar_id
        assert subscriptions[0]["is_active"] == True
        
        print("✅ User subscriptions list test passed")
        
    finally:
        cleanup()

def test_calendar_subscriber_count():
    """Test getting calendar subscriber count"""
    client, cleanup = create_test_client()
    
    try:
        user1_headers, user2_headers, calendar_id = create_test_users_and_calendar(client)
        
        # Check initial subscriber count (should be 0)
        response = client.get(
            f"/api/calendars/{calendar_id}/subscriber-count", 
            headers=user1_headers
        )
        assert response.status_code == 200
        assert response.json()["subscriber_count"] == 0
        
        # Subscribe to the calendar
        subscription_data = {
            "notification_preferences": {
                "new_events": True
            }
        }
        
        response = client.post(
            f"/api/calendars/{calendar_id}/subscribe", 
            json=subscription_data, 
            headers=user2_headers
        )
        assert response.status_code == 200
        
        # Check subscriber count after subscription (should be 1)
        response = client.get(
            f"/api/calendars/{calendar_id}/subscriber-count", 
            headers=user1_headers
        )
        assert response.status_code == 200
        assert response.json()["subscriber_count"] == 1
        
        print("✅ Calendar subscriber count test passed")
        
    finally:
        cleanup()

def test_owner_cannot_subscribe_to_own_calendar():
    """Test that calendar owners cannot subscribe to their own calendars"""
    client, cleanup = create_test_client()
    
    try:
        user1_headers, user2_headers, calendar_id = create_test_users_and_calendar(client)
        
        # Owner tries to subscribe to their own calendar
        subscription_data = {
            "notification_preferences": {
                "new_events": True
            }
        }
        
        response = client.post(
            f"/api/calendars/{calendar_id}/subscribe", 
            json=subscription_data, 
            headers=user1_headers
        )
        assert response.status_code == 400
        assert "Cannot subscribe" in response.json()["detail"]
        
        print("✅ Owner cannot subscribe to own calendar test passed")
        
    finally:
        cleanup()

def test_private_calendar_subscription_blocked():
    """Test that users cannot subscribe to private calendars"""
    client, cleanup = create_test_client()
    
    try:
        # Create users
        user1_data = {
            "email": "owner@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Owner",
            "username": "calowner"
        }
        
        register1_response = client.post("/api/auth/register", json=user1_data)
        assert register1_response.status_code == 200
        user1_token = register1_response.json()["access_token"]
        user1_headers = {"Authorization": f"Bearer {user1_token}"}
        
        user2_data = {
            "email": "subscriber@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Subscriber",
            "username": "subscriber"
        }
        
        register2_response = client.post("/api/auth/register", json=user2_data)
        assert register2_response.status_code == 200
        user2_token = register2_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}
        
        # Create a private calendar
        calendar_data = {
            "name": "Private Test Calendar",
            "description": "A private calendar",
            "visibility": "private",
            "timezone": "UTC"
        }
        
        calendar_response = client.post("/api/calendars", json=calendar_data, headers=user1_headers)
        assert calendar_response.status_code == 200
        calendar_id = calendar_response.json()["id"]
        
        # Try to subscribe to the private calendar
        subscription_data = {
            "notification_preferences": {
                "new_events": True
            }
        }
        
        response = client.post(
            f"/api/calendars/{calendar_id}/subscribe", 
            json=subscription_data, 
            headers=user2_headers
        )
        assert response.status_code == 400
        assert "Cannot subscribe" in response.json()["detail"]
        
        print("✅ Private calendar subscription blocked test passed")
        
    finally:
        cleanup()

if __name__ == "__main__":
    test_calendar_subscription_creation()
    test_calendar_subscription_duplicate_prevention()
    test_calendar_unsubscription()
    test_user_subscriptions_list()
    test_calendar_subscriber_count()
    test_owner_cannot_subscribe_to_own_calendar()
    test_private_calendar_subscription_blocked()
    print("✅ All calendar subscription tests passed!")