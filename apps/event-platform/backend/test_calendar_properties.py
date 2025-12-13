#!/usr/bin/env python3
"""
Property-based tests for calendar functionality
**Feature: event-management**
"""

import pytest
from hypothesis import given, strategies as st, settings, HealthCheck
from hypothesis.strategies import text
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
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

# Property-based test strategies
valid_calendar_name = text(min_size=1, max_size=100, alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -_')
valid_description = text(min_size=0, max_size=1000, alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?-_')
valid_visibility = st.sampled_from(['public', 'unlisted', 'private'])
valid_timezone = st.sampled_from(['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'])

@given(
    name=valid_calendar_name,
    description=valid_description,
    visibility=valid_visibility,
    timezone=valid_timezone
)
@settings(max_examples=100, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_property_29_calendar_creation_completeness(name, description, visibility, timezone):
    """
    **Feature: event-management, Property 29: Calendar creation completeness**
    **Validates: Requirements 7.1**
    
    For any calendar creation with valid data, the calendar should be established 
    with all specified branding and settings
    """
    client, cleanup = create_test_client()
    
    try:
        # Make name unique to avoid conflicts
        unique_id = uuid.uuid4().hex[:8]
        unique_name = f"{name.strip()}_{unique_id}" if name.strip() else f"calendar_{unique_id}"
        
        # First create a user
        user_data = {
            "email": f"test_{unique_id}@example.com",
            "password": "testpassword123",
            "first_name": "Test",
            "last_name": "User",
            "username": f"testuser_{unique_id}"
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 200
        
        register_data = register_response.json()
        access_token = register_data["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        user_id = register_data["user"]["id"]
        
        # Create calendar with provided data
        calendar_data = {
            "name": unique_name,
            "description": description,
            "visibility": visibility,
            "timezone": timezone
        }
        
        response = client.post("/api/calendars", json=calendar_data, headers=headers)
        
        # Should succeed with valid data
        assert response.status_code == 200
        
        data = response.json()
        
        # Calendar should be established with all specified settings
        assert data["name"] == unique_name
        assert data["description"] == description
        assert data["visibility"] == visibility
        assert data["timezone"] == timezone
        assert data["owner_id"] == user_id
        
        # Should have required fields
        assert "id" in data
        assert "slug" in data
        assert "created_at" in data
        assert "updated_at" in data
        assert data["is_plus_active"] == False
        
        # Slug should be generated from name
        assert data["slug"]  # Should not be empty
        
        # Should be retrievable by ID
        calendar_id = data["id"]
        get_response = client.get(f"/api/calendars/{calendar_id}", headers=headers)
        assert get_response.status_code == 200
        
        get_data = get_response.json()
        assert get_data["name"] == unique_name
        assert get_data["description"] == description
        assert get_data["visibility"] == visibility
        assert get_data["timezone"] == timezone
        
        # Should be retrievable by slug
        slug = data["slug"]
        slug_response = client.get(f"/api/calendars/slug/{slug}", headers=headers)
        assert slug_response.status_code == 200
        
        slug_data = slug_response.json()
        assert slug_data["id"] == calendar_id
        assert slug_data["name"] == unique_name
        
    finally:
        cleanup()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
@given(
    name=valid_calendar_name,
    description=valid_description,
    visibility=valid_visibility,
    timezone=valid_timezone
)
@settings(max_examples=100, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_property_31_calendar_visibility_enforcement(name, description, visibility, timezone):
    """
    **Feature: event-management, Property 31: Calendar visibility enforcement**
    **Validates: Requirements 7.3**
    
    For any calendar visibility setting, access controls should be enforced 
    according to the specified level
    """
    client, cleanup = create_test_client()
    
    try:
        # Make name unique to avoid conflicts
        unique_id = uuid.uuid4().hex[:8]
        unique_name = f"{name.strip()}_{unique_id}" if name.strip() else f"calendar_{unique_id}"
        
        # Create two users
        user1_data = {
            "email": f"user1_{unique_id}@example.com",
            "password": "testpassword123",
            "first_name": "User",
            "last_name": "One",
            "username": f"user1_{unique_id}"
        }
        
        register1_response = client.post("/api/auth/register", json=user1_data)
        assert register1_response.status_code == 200
        user1_token = register1_response.json()["access_token"]
        user1_headers = {"Authorization": f"Bearer {user1_token}"}
        
        user2_data = {
            "email": f"user2_{unique_id}@example.com",
            "password": "testpassword123",
            "first_name": "User",
            "last_name": "Two",
            "username": f"user2_{unique_id}"
        }
        
        register2_response = client.post("/api/auth/register", json=user2_data)
        assert register2_response.status_code == 200
        user2_token = register2_response.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}
        
        # User1 creates a calendar with the specified visibility
        calendar_data = {
            "name": unique_name,
            "description": description,
            "visibility": visibility,
            "timezone": timezone
        }
        
        response = client.post("/api/calendars", json=calendar_data, headers=user1_headers)
        assert response.status_code == 200
        calendar_id = response.json()["id"]
        
        # Owner should always be able to access their calendar
        response = client.get(f"/api/calendars/{calendar_id}", headers=user1_headers)
        assert response.status_code == 200
        
        # Test access controls based on visibility
        if visibility == "public":
            # Public calendars should be accessible by anyone
            response = client.get(f"/api/calendars/{calendar_id}", headers=user2_headers)
            assert response.status_code == 200
        elif visibility == "unlisted":
            # Unlisted calendars should be accessible if you have the link
            response = client.get(f"/api/calendars/{calendar_id}", headers=user2_headers)
            assert response.status_code == 200
        elif visibility == "private":
            # Private calendars should only be accessible by owner
            response = client.get(f"/api/calendars/{calendar_id}", headers=user2_headers)
            assert response.status_code == 403
        
        # Test modification permissions - only owner should be able to modify
        update_data = {"description": "Updated description"}
        
        # Owner should be able to modify
        response = client.put(f"/api/calendars/{calendar_id}", json=update_data, headers=user1_headers)
        assert response.status_code == 200
        
        # Other user should NOT be able to modify regardless of visibility
        response = client.put(f"/api/calendars/{calendar_id}", json=update_data, headers=user2_headers)
        assert response.status_code in [403, 404]  # 404 if private and can't access, 403 if can access but can't modify
        
    finally:
        cleanup()

@given(
    name=valid_calendar_name,
    description=valid_description,
    visibility=valid_visibility,
    timezone=valid_timezone
)
@settings(max_examples=100, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_property_30_calendar_image_display(name, description, visibility, timezone):
    """
    **Feature: event-management, Property 30: Calendar image display**
    **Validates: Requirements 7.2**
    
    For any uploaded calendar cover image, the image should be displayed 
    on the calendar profile
    """
    client, cleanup = create_test_client()
    
    try:
        # Make name unique to avoid conflicts
        unique_id = uuid.uuid4().hex[:8]
        unique_name = f"{name.strip()}_{unique_id}" if name.strip() else f"calendar_{unique_id}"
        
        # First create a user
        user_data = {
            "email": f"test_{unique_id}@example.com",
            "password": "testpassword123",
            "first_name": "Test",
            "last_name": "User",
            "username": f"testuser_{unique_id}"
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 200
        
        register_data = register_response.json()
        access_token = register_data["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Create calendar
        calendar_data = {
            "name": unique_name,
            "description": description,
            "visibility": visibility,
            "timezone": timezone
        }
        
        response = client.post("/api/calendars", json=calendar_data, headers=headers)
        assert response.status_code == 200
        calendar_id = response.json()["id"]
        
        # Initially, calendar should have no cover image
        response = client.get(f"/api/calendars/{calendar_id}", headers=headers)
        assert response.status_code == 200
        initial_data = response.json()
        assert initial_data["cover_image_url"] is None
        
        # Upload a cover image
        from io import BytesIO
        fake_image_content = b"fake image content for testing"
        fake_image_file = BytesIO(fake_image_content)
        
        files = {"file": ("test_image.jpg", fake_image_file, "image/jpeg")}
        upload_response = client.post(f"/api/calendars/{calendar_id}/cover-image", files=files, headers=headers)
        
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        
        # Should return the cover image URL
        assert "cover_image_url" in upload_data
        assert upload_data["cover_image_url"] is not None
        assert upload_data["cover_image_url"].startswith("/uploads/calendar-covers/")
        
        # Calendar in response should have the updated cover image
        assert "calendar" in upload_data
        assert upload_data["calendar"]["cover_image_url"] == upload_data["cover_image_url"]
        
        # Retrieving the calendar should show the cover image
        response = client.get(f"/api/calendars/{calendar_id}", headers=headers)
        assert response.status_code == 200
        updated_data = response.json()
        assert updated_data["cover_image_url"] == upload_data["cover_image_url"]
        
        # Cover image should persist across different retrieval methods
        slug = updated_data["slug"]
        slug_response = client.get(f"/api/calendars/slug/{slug}", headers=headers)
        assert slug_response.status_code == 200
        slug_data = slug_response.json()
        assert slug_data["cover_image_url"] == upload_data["cover_image_url"]
        
    finally:
        cleanup()