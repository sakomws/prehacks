#!/usr/bin/env python3
"""
Tests for calendar permissions functionality
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

def test_calendar_permission_creation():
    """Test creating calendar permissions"""
    client, cleanup = create_test_client()
    
    try:
        # Create two users
        user1_data = {
            "email": "owner@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Owner",
            "username": "calowner"
        }
        
        user2_data = {
            "email": "admin@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Admin",
            "username": "caladmin"
        }
        
        # Register users
        register1_response = client.post("/api/auth/register", json=user1_data)
        assert register1_response.status_code == 200
        owner_token = register1_response.json()["access_token"]
        owner_headers = {"Authorization": f"Bearer {owner_token}"}
        
        register2_response = client.post("/api/auth/register", json=user2_data)
        assert register2_response.status_code == 200
        admin_user_id = register2_response.json()["user"]["id"]
        
        # Owner creates a calendar
        calendar_data = {
            "name": "Test Calendar",
            "description": "A test calendar",
            "visibility": "private"
        }
        
        calendar_response = client.post("/api/calendars", json=calendar_data, headers=owner_headers)
        assert calendar_response.status_code == 200
        calendar_id = calendar_response.json()["id"]
        
        # Owner grants admin permission to user2
        permission_data = {
            "user_id": admin_user_id,
            "role": "admin"
        }
        
        permission_response = client.post(
            f"/api/calendars/{calendar_id}/permissions", 
            json=permission_data, 
            headers=owner_headers
        )
        assert permission_response.status_code == 200
        
        permission = permission_response.json()
        assert permission["user_id"] == admin_user_id
        assert permission["role"] == "admin"
        assert permission["calendar_id"] == calendar_id
        
        print("✅ Calendar permission creation test passed")
        
    finally:
        cleanup()

def test_calendar_permission_access_control():
    """Test calendar access with permissions"""
    client, cleanup = create_test_client()
    
    try:
        # Create three users
        user1_data = {
            "email": "owner@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Owner",
            "username": "calowner"
        }
        
        user2_data = {
            "email": "viewer@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Viewer",
            "username": "calviewer"
        }
        
        user3_data = {
            "email": "outsider@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Outsider",
            "username": "calout"
        }
        
        # Register users
        register1_response = client.post("/api/auth/register", json=user1_data)
        assert register1_response.status_code == 200
        owner_token = register1_response.json()["access_token"]
        owner_headers = {"Authorization": f"Bearer {owner_token}"}
        
        register2_response = client.post("/api/auth/register", json=user2_data)
        assert register2_response.status_code == 200
        viewer_token = register2_response.json()["access_token"]
        viewer_headers = {"Authorization": f"Bearer {viewer_token}"}
        viewer_user_id = register2_response.json()["user"]["id"]
        
        register3_response = client.post("/api/auth/register", json=user3_data)
        assert register3_response.status_code == 200
        outsider_token = register3_response.json()["access_token"]
        outsider_headers = {"Authorization": f"Bearer {outsider_token}"}
        
        # Owner creates a private calendar
        calendar_data = {
            "name": "Private Calendar",
            "description": "A private test calendar",
            "visibility": "private"
        }
        
        calendar_response = client.post("/api/calendars", json=calendar_data, headers=owner_headers)
        assert calendar_response.status_code == 200
        calendar_id = calendar_response.json()["id"]
        
        # Initially, only owner can access private calendar
        response = client.get(f"/api/calendars/{calendar_id}", headers=owner_headers)
        assert response.status_code == 200
        
        response = client.get(f"/api/calendars/{calendar_id}", headers=viewer_headers)
        assert response.status_code == 403
        
        response = client.get(f"/api/calendars/{calendar_id}", headers=outsider_headers)
        assert response.status_code == 403
        
        # Owner grants viewer permission to user2
        permission_data = {
            "user_id": viewer_user_id,
            "role": "viewer"
        }
        
        permission_response = client.post(
            f"/api/calendars/{calendar_id}/permissions", 
            json=permission_data, 
            headers=owner_headers
        )
        assert permission_response.status_code == 200
        
        # Now viewer can access the calendar
        response = client.get(f"/api/calendars/{calendar_id}", headers=viewer_headers)
        assert response.status_code == 200
        
        # But outsider still cannot
        response = client.get(f"/api/calendars/{calendar_id}", headers=outsider_headers)
        assert response.status_code == 403
        
        print("✅ Calendar permission access control test passed")
        
    finally:
        cleanup()

def test_calendar_permission_modification_rights():
    """Test calendar modification rights with permissions"""
    client, cleanup = create_test_client()
    
    try:
        # Create three users
        user1_data = {
            "email": "owner@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Owner",
            "username": "calowner"
        }
        
        user2_data = {
            "email": "editor@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Editor",
            "username": "caleditor"
        }
        
        user3_data = {
            "email": "viewer@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Viewer",
            "username": "calviewer"
        }
        
        # Register users
        register1_response = client.post("/api/auth/register", json=user1_data)
        assert register1_response.status_code == 200
        owner_token = register1_response.json()["access_token"]
        owner_headers = {"Authorization": f"Bearer {owner_token}"}
        
        register2_response = client.post("/api/auth/register", json=user2_data)
        assert register2_response.status_code == 200
        editor_token = register2_response.json()["access_token"]
        editor_headers = {"Authorization": f"Bearer {editor_token}"}
        editor_user_id = register2_response.json()["user"]["id"]
        
        register3_response = client.post("/api/auth/register", json=user3_data)
        assert register3_response.status_code == 200
        viewer_token = register3_response.json()["access_token"]
        viewer_headers = {"Authorization": f"Bearer {viewer_token}"}
        viewer_user_id = register3_response.json()["user"]["id"]
        
        # Owner creates a calendar
        calendar_data = {
            "name": "Test Calendar",
            "description": "A test calendar",
            "visibility": "public"
        }
        
        calendar_response = client.post("/api/calendars", json=calendar_data, headers=owner_headers)
        assert calendar_response.status_code == 200
        calendar_id = calendar_response.json()["id"]
        
        # Grant editor permission to user2
        permission_data = {
            "user_id": editor_user_id,
            "role": "editor"
        }
        
        client.post(f"/api/calendars/{calendar_id}/permissions", json=permission_data, headers=owner_headers)
        
        # Grant viewer permission to user3
        permission_data = {
            "user_id": viewer_user_id,
            "role": "viewer"
        }
        
        client.post(f"/api/calendars/{calendar_id}/permissions", json=permission_data, headers=owner_headers)
        
        # Test modification rights
        update_data = {"description": "Updated description"}
        
        # Owner should be able to modify
        response = client.put(f"/api/calendars/{calendar_id}", json=update_data, headers=owner_headers)
        assert response.status_code == 200
        
        # Editor should be able to modify
        update_data = {"description": "Editor updated description"}
        response = client.put(f"/api/calendars/{calendar_id}", json=update_data, headers=editor_headers)
        assert response.status_code == 200
        
        # Viewer should NOT be able to modify
        update_data = {"description": "Viewer attempted update"}
        response = client.put(f"/api/calendars/{calendar_id}", json=update_data, headers=viewer_headers)
        assert response.status_code == 403
        
        print("✅ Calendar permission modification rights test passed")
        
    finally:
        cleanup()

def test_permission_management_rights():
    """Test who can manage calendar permissions"""
    client, cleanup = create_test_client()
    
    try:
        # Create three users
        user1_data = {
            "email": "owner@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Owner",
            "username": "calowner"
        }
        
        user2_data = {
            "email": "admin@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Admin",
            "username": "caladmin"
        }
        
        user3_data = {
            "email": "editor@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Editor",
            "username": "caleditor"
        }
        
        user4_data = {
            "email": "newuser@example.com",
            "password": "testpassword123",
            "first_name": "New",
            "last_name": "User",
            "username": "newuser"
        }
        
        # Register users
        register1_response = client.post("/api/auth/register", json=user1_data)
        assert register1_response.status_code == 200
        owner_token = register1_response.json()["access_token"]
        owner_headers = {"Authorization": f"Bearer {owner_token}"}
        
        register2_response = client.post("/api/auth/register", json=user2_data)
        assert register2_response.status_code == 200
        admin_token = register2_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        admin_user_id = register2_response.json()["user"]["id"]
        
        register3_response = client.post("/api/auth/register", json=user3_data)
        assert register3_response.status_code == 200
        editor_token = register3_response.json()["access_token"]
        editor_headers = {"Authorization": f"Bearer {editor_token}"}
        editor_user_id = register3_response.json()["user"]["id"]
        
        register4_response = client.post("/api/auth/register", json=user4_data)
        assert register4_response.status_code == 200
        new_user_id = register4_response.json()["user"]["id"]
        
        # Owner creates a calendar
        calendar_data = {
            "name": "Test Calendar",
            "description": "A test calendar",
            "visibility": "public"
        }
        
        calendar_response = client.post("/api/calendars", json=calendar_data, headers=owner_headers)
        assert calendar_response.status_code == 200
        calendar_id = calendar_response.json()["id"]
        
        # Owner grants admin permission to user2
        permission_data = {
            "user_id": admin_user_id,
            "role": "admin"
        }
        
        client.post(f"/api/calendars/{calendar_id}/permissions", json=permission_data, headers=owner_headers)
        
        # Owner grants editor permission to user3
        permission_data = {
            "user_id": editor_user_id,
            "role": "editor"
        }
        
        client.post(f"/api/calendars/{calendar_id}/permissions", json=permission_data, headers=owner_headers)
        
        # Test permission management rights
        new_permission_data = {
            "user_id": new_user_id,
            "role": "viewer"
        }
        
        # Owner should be able to manage permissions
        response = client.post(f"/api/calendars/{calendar_id}/permissions", json=new_permission_data, headers=owner_headers)
        assert response.status_code == 200
        
        # Delete the permission for next test
        client.delete(f"/api/calendars/{calendar_id}/permissions/{new_user_id}", headers=owner_headers)
        
        # Admin should be able to manage permissions
        response = client.post(f"/api/calendars/{calendar_id}/permissions", json=new_permission_data, headers=admin_headers)
        assert response.status_code == 200
        
        # Delete the permission for next test
        client.delete(f"/api/calendars/{calendar_id}/permissions/{new_user_id}", headers=admin_headers)
        
        # Editor should NOT be able to manage permissions
        response = client.post(f"/api/calendars/{calendar_id}/permissions", json=new_permission_data, headers=editor_headers)
        assert response.status_code == 403
        
        print("✅ Permission management rights test passed")
        
    finally:
        cleanup()

if __name__ == "__main__":
    test_calendar_permission_creation()
    test_calendar_permission_access_control()
    test_calendar_permission_modification_rights()
    test_permission_management_rights()
    print("✅ All calendar permission tests passed!")