#!/usr/bin/env python3
"""
Tests for calendar branding and customization functionality
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import tempfile
import os
import uuid
from io import BytesIO

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

def test_timezone_validation():
    """Test timezone validation with IANA timezones"""
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
        
        # Test valid timezone
        valid_calendar_data = {
            "name": "Valid Timezone Calendar",
            "description": "Testing valid timezone",
            "visibility": "public",
            "timezone": "America/New_York"
        }
        
        response = client.post("/api/calendars", json=valid_calendar_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["timezone"] == "America/New_York"
        
        # Test invalid timezone
        invalid_calendar_data = {
            "name": "Invalid Timezone Calendar",
            "description": "Testing invalid timezone",
            "visibility": "public",
            "timezone": "Invalid/Timezone"
        }
        
        response = client.post("/api/calendars", json=invalid_calendar_data, headers=headers)
        assert response.status_code == 422  # Validation error
        
        print("✅ Timezone validation test passed")
        
    finally:
        cleanup()

def test_calendar_visibility_controls():
    """Test calendar visibility controls"""
    client, cleanup = create_test_client()
    
    try:
        # Create two users
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
        
        # Test public calendar visibility
        public_calendar_data = {
            "name": "Public Calendar",
            "description": "This is public",
            "visibility": "public"
        }
        
        response = client.post("/api/calendars", json=public_calendar_data, headers=user1_headers)
        assert response.status_code == 200
        public_calendar_id = response.json()["id"]
        
        # Both users should be able to access public calendar
        response = client.get(f"/api/calendars/{public_calendar_id}", headers=user1_headers)
        assert response.status_code == 200
        
        response = client.get(f"/api/calendars/{public_calendar_id}", headers=user2_headers)
        assert response.status_code == 200
        
        # Test unlisted calendar visibility
        unlisted_calendar_data = {
            "name": "Unlisted Calendar",
            "description": "This is unlisted",
            "visibility": "unlisted"
        }
        
        response = client.post("/api/calendars", json=unlisted_calendar_data, headers=user1_headers)
        assert response.status_code == 200
        unlisted_calendar_id = response.json()["id"]
        
        # Both users should be able to access unlisted calendar (if they have the link)
        response = client.get(f"/api/calendars/{unlisted_calendar_id}", headers=user1_headers)
        assert response.status_code == 200
        
        response = client.get(f"/api/calendars/{unlisted_calendar_id}", headers=user2_headers)
        assert response.status_code == 200
        
        # Test private calendar visibility
        private_calendar_data = {
            "name": "Private Calendar",
            "description": "This is private",
            "visibility": "private"
        }
        
        response = client.post("/api/calendars", json=private_calendar_data, headers=user1_headers)
        assert response.status_code == 200
        private_calendar_id = response.json()["id"]
        
        # Owner should be able to access private calendar
        response = client.get(f"/api/calendars/{private_calendar_id}", headers=user1_headers)
        assert response.status_code == 200
        
        # Other user should NOT be able to access private calendar
        response = client.get(f"/api/calendars/{private_calendar_id}", headers=user2_headers)
        assert response.status_code == 403
        
        print("✅ Calendar visibility controls test passed")
        
    finally:
        cleanup()

def test_cover_image_upload():
    """Test calendar cover image upload functionality"""
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
            "name": "Test Calendar",
            "description": "Testing cover image upload",
            "visibility": "public"
        }
        
        response = client.post("/api/calendars", json=calendar_data, headers=headers)
        assert response.status_code == 200
        calendar_id = response.json()["id"]
        
        # Create a fake image file
        fake_image_content = b"fake image content for testing"
        fake_image_file = BytesIO(fake_image_content)
        
        # Test cover image upload
        files = {"file": ("test_image.jpg", fake_image_file, "image/jpeg")}
        response = client.post(f"/api/calendars/{calendar_id}/cover-image", files=files, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "cover_image_url" in data
        assert data["cover_image_url"].startswith("/uploads/calendar-covers/")
        assert "calendar" in data
        assert data["calendar"]["cover_image_url"] == data["cover_image_url"]
        
        print("✅ Cover image upload test passed")
        
    finally:
        cleanup()

if __name__ == "__main__":
    test_timezone_validation()
    test_calendar_visibility_controls()
    test_cover_image_upload()
    print("✅ All calendar branding tests passed!")