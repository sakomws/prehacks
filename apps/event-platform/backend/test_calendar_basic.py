#!/usr/bin/env python3
"""
Basic tests for calendar functionality
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

def test_calendar_creation():
    """Test basic calendar creation"""
    client, cleanup = create_test_client()
    
    try:
        # First create a user
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "first_name": "Test",
            "last_name": "User",
            "username": "testuser"
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 200
        
        register_data = register_response.json()
        access_token = register_data["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Create a calendar
        calendar_data = {
            "name": "My Test Calendar",
            "description": "A test calendar for events",
            "visibility": "public",
            "timezone": "UTC"
        }
        
        response = client.post("/api/calendars", json=calendar_data, headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "My Test Calendar"
        assert data["description"] == "A test calendar for events"
        assert data["visibility"] == "public"
        assert data["timezone"] == "UTC"
        assert data["slug"] == "my-test-calendar"
        assert "id" in data
        assert "owner_id" in data
        assert "created_at" in data
        assert "updated_at" in data
        
        print("✅ Calendar creation test passed")
        
    finally:
        cleanup()

def test_calendar_slug_generation():
    """Test calendar slug generation and uniqueness"""
    client, cleanup = create_test_client()
    
    try:
        # First create a user
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "first_name": "Test",
            "last_name": "User",
            "username": "testuser"
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 200
        
        register_data = register_response.json()
        access_token = register_data["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Create first calendar
        calendar_data1 = {
            "name": "My Test Calendar",
            "description": "First calendar",
            "visibility": "public"
        }
        
        response1 = client.post("/api/calendars", json=calendar_data1, headers=headers)
        assert response1.status_code == 200
        data1 = response1.json()
        assert data1["slug"] == "my-test-calendar"
        
        # Create second calendar with same name
        calendar_data2 = {
            "name": "My Test Calendar",
            "description": "Second calendar",
            "visibility": "public"
        }
        
        response2 = client.post("/api/calendars", json=calendar_data2, headers=headers)
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2["slug"] == "my-test-calendar-1"  # Should have suffix
        
        print("✅ Calendar slug uniqueness test passed")
        
    finally:
        cleanup()

def test_calendar_access_permissions():
    """Test calendar access permissions based on visibility"""
    client, cleanup = create_test_client()
    
    try:
        # Create first user
        user1_data = {
            "email": "user1@example.com",
            "password": "testpassword123",
            "first_name": "User",
            "last_name": "One",
            "username": "user1"
        }
        
        register1_response = client.post("/api/auth/register", json=user1_data)
        assert register1_response.status_code == 200
        user1_token = register1_response.json()["access_token"]
        user1_headers = {"Authorization": f"Bearer {user1_token}"}
        
        # Create second user
        user2_data = {
            "email": "user2@example.com",
            "password": "testpassword123",
            "first_name": "User",
            "last_name": "Two",
            "username": "user2"
        }
        
        register2_response = client.post("/api/auth/register", json=user2_data)
        assert register2_response.status_code == 200
        user2_token = register2_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}
        
        # User1 creates a private calendar
        private_calendar_data = {
            "name": "Private Calendar",
            "description": "This is private",
            "visibility": "private"
        }
        
        response = client.post("/api/calendars", json=private_calendar_data, headers=user1_headers)
        assert response.status_code == 200
        calendar_id = response.json()["id"]
        
        # User1 should be able to access their own private calendar
        response = client.get(f"/api/calendars/{calendar_id}", headers=user1_headers)
        assert response.status_code == 200
        
        # User2 should NOT be able to access user1's private calendar
        response = client.get(f"/api/calendars/{calendar_id}", headers=user2_headers)
        assert response.status_code == 403
        
        print("✅ Calendar access permissions test passed")
        
    finally:
        cleanup()

if __name__ == "__main__":
    test_calendar_creation()
    test_calendar_slug_generation()
    test_calendar_access_permissions()
    print("✅ All calendar tests passed!")