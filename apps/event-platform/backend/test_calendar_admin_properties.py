#!/usr/bin/env python3
"""
Property-based tests for calendar admin permissions functionality
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
valid_role = st.sampled_from(['admin', 'editor', 'viewer'])

@given(
    calendar_name=valid_calendar_name,
    description=valid_description,
    visibility=valid_visibility,
    role=valid_role
)
@settings(max_examples=100, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_property_32_admin_permission_assignment(calendar_name, description, visibility, role):
    """
    **Feature: event-management, Property 32: Admin permission assignment**
    **Validates: Requirements 7.4**
    
    For any admin permission assignment, the specified user should receive 
    administrative access to the calendar
    """
    client, cleanup = create_test_client()
    
    try:
        # Make names unique to avoid conflicts
        unique_id = uuid.uuid4().hex[:8]
        unique_calendar_name = f"{calendar_name.strip()}_{unique_id}" if calendar_name.strip() else f"calendar_{unique_id}"
        
        # Create two users - owner and admin
        owner_data = {
            "email": f"owner_{unique_id}@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Owner",
            "username": f"owner_{unique_id}"
        }
        
        admin_data = {
            "email": f"admin_{unique_id}@example.com",
            "password": "testpassword123",
            "first_name": "Calendar",
            "last_name": "Admin",
            "username": f"admin_{unique_id}"
        }
        
        # Register users
        register_owner_response = client.post("/api/auth/register", json=owner_data)
        assert register_owner_response.status_code == 200
        owner_token = register_owner_response.json()["access_token"]
        owner_headers = {"Authorization": f"Bearer {owner_token}"}
        
        register_admin_response = client.post("/api/auth/register", json=admin_data)
        assert register_admin_response.status_code == 200
        admin_token = register_admin_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        admin_user_id = register_admin_response.json()["user"]["id"]
        
        # Owner creates a calendar
        calendar_data = {
            "name": unique_calendar_name,
            "description": description,
            "visibility": visibility
        }
        
        calendar_response = client.post("/api/calendars", json=calendar_data, headers=owner_headers)
        assert calendar_response.status_code == 200
        calendar_id = calendar_response.json()["id"]
        
        # Owner assigns permission to admin user
        permission_data = {
            "user_id": admin_user_id,
            "role": role
        }
        
        permission_response = client.post(
            f"/api/calendars/{calendar_id}/permissions", 
            json=permission_data, 
            headers=owner_headers
        )
        assert permission_response.status_code == 200
        
        # Verify permission was assigned correctly
        permission = permission_response.json()
        assert permission["user_id"] == admin_user_id
        assert permission["role"] == role
        assert permission["calendar_id"] == calendar_id
        
        # Verify admin user can access the calendar (regardless of visibility)
        access_response = client.get(f"/api/calendars/{calendar_id}", headers=admin_headers)
        assert access_response.status_code == 200
        
        # Verify permission can be retrieved
        get_permission_response = client.get(
            f"/api/calendars/{calendar_id}/permissions/{admin_user_id}", 
            headers=owner_headers
        )
        assert get_permission_response.status_code == 200
        retrieved_permission = get_permission_response.json()
        assert retrieved_permission["user_id"] == admin_user_id
        assert retrieved_permission["role"] == role
        
        # Test role-specific capabilities
        if role in ['admin', 'editor']:
            # Admin and editor should be able to modify calendar
            update_data = {"description": f"Updated by {role}"}
            update_response = client.put(f"/api/calendars/{calendar_id}", json=update_data, headers=admin_headers)
            assert update_response.status_code == 200
        else:
            # Viewer should NOT be able to modify calendar
            update_data = {"description": "Updated by viewer"}
            update_response = client.put(f"/api/calendars/{calendar_id}", json=update_data, headers=admin_headers)
            assert update_response.status_code == 403
        
        if role == 'admin':
            # Only admin should be able to manage permissions
            new_user_data = {
                "email": f"newuser_{unique_id}@example.com",
                "password": "testpassword123",
                "first_name": "New",
                "last_name": "User",
                "username": f"newuser_{unique_id}"
            }
            
            register_new_response = client.post("/api/auth/register", json=new_user_data)
            assert register_new_response.status_code == 200
            new_user_id = register_new_response.json()["user"]["id"]
            
            new_permission_data = {
                "user_id": new_user_id,
                "role": "viewer"
            }
            
            # Admin should be able to create permissions
            create_perm_response = client.post(
                f"/api/calendars/{calendar_id}/permissions", 
                json=new_permission_data, 
                headers=admin_headers
            )
            assert create_perm_response.status_code == 200
            
            # Admin should be able to list permissions
            list_perms_response = client.get(f"/api/calendars/{calendar_id}/permissions", headers=admin_headers)
            assert list_perms_response.status_code == 200
            permissions_list = list_perms_response.json()
            assert len(permissions_list) >= 2  # At least admin and new user
            
        else:
            # Editor and viewer should NOT be able to manage permissions
            new_user_data = {
                "email": f"newuser_{unique_id}@example.com",
                "password": "testpassword123",
                "first_name": "New",
                "last_name": "User",
                "username": f"newuser_{unique_id}"
            }
            
            register_new_response = client.post("/api/auth/register", json=new_user_data)
            assert register_new_response.status_code == 200
            new_user_id = register_new_response.json()["user"]["id"]
            
            new_permission_data = {
                "user_id": new_user_id,
                "role": "viewer"
            }
            
            # Non-admin should NOT be able to create permissions
            create_perm_response = client.post(
                f"/api/calendars/{calendar_id}/permissions", 
                json=new_permission_data, 
                headers=admin_headers
            )
            assert create_perm_response.status_code == 403
            
            # Non-admin should NOT be able to list permissions
            list_perms_response = client.get(f"/api/calendars/{calendar_id}/permissions", headers=admin_headers)
            assert list_perms_response.status_code == 403
        
        # Verify permission persists across different API calls
        # Get calendar again to ensure permission is still valid
        final_access_response = client.get(f"/api/calendars/{calendar_id}", headers=admin_headers)
        assert final_access_response.status_code == 200
        
        # Verify permission can be updated
        if role != 'admin':  # Don't downgrade admin to avoid permission issues
            update_permission_data = {"role": "admin"}
            update_perm_response = client.put(
                f"/api/calendars/{calendar_id}/permissions/{admin_user_id}", 
                json=update_permission_data, 
                headers=owner_headers
            )
            assert update_perm_response.status_code == 200
            updated_permission = update_perm_response.json()
            assert updated_permission["role"] == "admin"
        
        # Verify permission can be deleted
        delete_response = client.delete(f"/api/calendars/{calendar_id}/permissions/{admin_user_id}", headers=owner_headers)
        assert delete_response.status_code == 200
        
        # After deletion, user should lose access to private calendars
        if visibility == "private":
            no_access_response = client.get(f"/api/calendars/{calendar_id}", headers=admin_headers)
            assert no_access_response.status_code == 403
        
    finally:
        cleanup()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])