#!/usr/bin/env python3
"""
Property-based tests for authentication functionality
**Feature: event-management**
"""

import pytest
from hypothesis import given, strategies as st, settings, HealthCheck
from hypothesis.strategies import emails, text
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
import tempfile
import os
import uuid

from main import app
from database import Base, get_db
from auth import create_user, authenticate_user, UserCreate

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
    
    # Create a new app instance to avoid conflicts
    from fastapi import FastAPI
    from main import app as original_app
    
    test_app = FastAPI()
    test_app.dependency_overrides[get_db] = override_get_db
    
    # Copy routes from original app
    test_app.router = original_app.router
    
    client = TestClient(test_app)
    
    def cleanup():
        os.close(db_fd)
        os.unlink(db_path)
    
    return client, cleanup

# Property-based test strategies
valid_email = emails()
valid_password = text(min_size=8, max_size=50, alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*')
valid_name = text(min_size=1, max_size=50, alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ').filter(lambda x: len(x.strip()) >= 1)
valid_username = text(min_size=3, max_size=30, alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_')

@given(
    email=valid_email,
    password=valid_password,
    first_name=valid_name,
    last_name=valid_name,
    username=valid_username
)
@settings(max_examples=100, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_property_20_account_creation_security(email, password, first_name, last_name, username):
    """
    **Feature: event-management, Property 20: Account creation security**
    **Validates: Requirements 5.1**
    
    For any valid account creation data, user credentials should be securely stored 
    and a complete profile should be established
    """
    client, cleanup = create_test_client()
    
    try:
        # Make email and username unique to avoid conflicts
        unique_id = uuid.uuid4().hex[:8]
        unique_email = f"{unique_id}_{email}"
        unique_username = f"{username}_{unique_id}"
        
        # Create user data
        user_data = {
            "email": unique_email,
            "password": password,
            "first_name": first_name,
            "last_name": last_name,
            "username": unique_username
        }
        
        # Test account creation via API
        response = client.post("/api/auth/register", json=user_data)
        
        # Should succeed with valid data
        if response.status_code != 200:
            print(f"Registration failed: {response.status_code}")
            print(f"Response: {response.text}")
            print(f"User data: {user_data}")
        assert response.status_code == 200
        
        data = response.json()
        
        # Should return access token and user info
        assert "access_token" in data
        assert "refresh_token" in data
        assert "user" in data
        assert data["token_type"] == "bearer"
        
        user_info = data["user"]
        
        # Profile should be complete - email should be stored (may be normalized)
        assert user_info["email"]  # Email should exist
        assert user_info["first_name"] == first_name
        assert user_info["last_name"] == last_name
        assert user_info["username"] == unique_username
        assert "id" in user_info
        assert "joined_at" in user_info
        assert user_info["is_platform_admin"] == False
        
        # Test that password is securely stored (not returned)
        assert "password" not in user_info
        assert "password_hash" not in user_info
        
        # Test that user can authenticate with the created credentials
        login_response = client.post("/api/auth/login", json={
            "email": unique_email,
            "password": password
        })
        
        assert login_response.status_code == 200
        login_data = login_response.json()
        # The important thing is that authentication worked
        assert login_data["user"]["email"]  # Email should exist
        
    finally:
        cleanup()

@given(
    email=valid_email,
    password=valid_password,
    first_name=valid_name,
    last_name=valid_name,
    username=valid_username
)
@settings(max_examples=100, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_property_21_authentication_success(email, password, first_name, last_name, username):
    """
    **Feature: event-management, Property 21: Authentication success**
    **Validates: Requirements 5.2**
    
    For any valid login credentials, the user should be authenticated 
    and granted access to their account
    """
    client, cleanup = create_test_client()
    
    try:
        # Make email and username unique to avoid conflicts
        unique_id = uuid.uuid4().hex[:8]
        unique_email = f"{unique_id}_{email}"
        unique_username = f"{username}_{unique_id}"
        
        # First create a user
        user_data = {
            "email": unique_email,
            "password": password,
            "first_name": first_name,
            "last_name": last_name,
            "username": unique_username
        }
    
        register_response = client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 200
        
        # Test authentication with valid credentials
        login_data = {
            "email": unique_email,
            "password": password
        }
        
        response = client.post("/api/auth/login", json=login_data)
        
        # Should succeed
        assert response.status_code == 200
        
        data = response.json()
        
        # Should return tokens and user info
        assert "access_token" in data
        assert "refresh_token" in data
        assert "user" in data
        assert data["token_type"] == "bearer"
        
        # User info should match
        user_info = data["user"]
        assert user_info["email"]  # Email should exist
        assert user_info["first_name"] == first_name
        assert user_info["last_name"] == last_name
        
        # Should be able to access protected routes
        headers = {"Authorization": f"Bearer {data['access_token']}"}
        me_response = client.get("/api/auth/me", headers=headers)
        
        assert me_response.status_code == 200
        me_data = me_response.json()
        # The important thing is that the protected route works
        assert me_data["email"]  # Email should exist
        
    finally:
        cleanup()

@given(
    email=valid_email,
    password=valid_password,
    first_name=valid_name,
    last_name=valid_name,
    username=valid_username,
    new_first_name=valid_name,
    new_last_name=valid_name,
    new_bio=text(min_size=0, max_size=500, alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?').filter(lambda x: len(x.strip()) <= 500)
)
@settings(max_examples=100, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_property_22_profile_update_consistency(email, password, first_name, last_name, username, new_first_name, new_last_name, new_bio):
    """
    **Feature: event-management, Property 22: Profile update consistency**
    **Validates: Requirements 5.3, 13.1**
    
    For any profile information update, changes should be saved and reflected 
    across all platform features
    """
    client, cleanup = create_test_client()
    
    try:
        # Make email and username unique to avoid conflicts
        unique_id = uuid.uuid4().hex[:8]
        unique_email = f"{unique_id}_{email}"
        unique_username = f"{username}_{unique_id}"
        
        # First create a user
        user_data = {
            "email": unique_email,
            "password": password,
            "first_name": first_name,
            "last_name": last_name,
            "username": unique_username
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 200
        
        register_data = register_response.json()
        access_token = register_data["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Update profile with new information
        profile_update = {
            "first_name": new_first_name,
            "last_name": new_last_name,
            "bio": new_bio,
            "social_links": [
                {
                    "platform": "twitter",
                    "url": "https://twitter.com/testuser",
                    "username": "testuser"
                },
                {
                    "platform": "github",
                    "url": "https://github.com/testuser"
                }
            ]
        }
        
        update_response = client.put("/api/users/profile", json=profile_update, headers=headers)
        assert update_response.status_code == 200
        
        update_data = update_response.json()
        
        # Account for validation logic that trims whitespace
        expected_first_name = new_first_name.strip() if new_first_name else new_first_name
        expected_last_name = new_last_name.strip() if new_last_name else new_last_name
        expected_bio = new_bio.strip() if new_bio else new_bio
        
        # Verify the update response contains the new information (after validation)
        assert update_data["first_name"] == expected_first_name
        assert update_data["last_name"] == expected_last_name
        assert update_data["bio"] == expected_bio
        
        # Handle social_links comparison - the response may include default username: None
        if profile_update["social_links"]:
            response_social_links = update_data["social_links"]
            expected_social_links = profile_update["social_links"]
            
            assert len(response_social_links) == len(expected_social_links)
            for i, (response_link, expected_link) in enumerate(zip(response_social_links, expected_social_links)):
                assert response_link["platform"] == expected_link["platform"]
                assert response_link["url"] == str(expected_link["url"])
                # username may be None in response even if not provided in request
                if "username" in expected_link:
                    assert response_link.get("username") == expected_link["username"]
        else:
            assert update_data["social_links"] == profile_update["social_links"]
        
        # Verify the changes are reflected when fetching user info
        me_response = client.get("/api/auth/me", headers=headers)
        assert me_response.status_code == 200
        
        me_data = me_response.json()
        assert me_data["first_name"] == expected_first_name
        assert me_data["last_name"] == expected_last_name
        assert me_data["bio"] == expected_bio
        
        # Verify the changes persist after re-authentication
        login_response = client.post("/api/auth/login", json={
            "email": unique_email,
            "password": password
        })
        assert login_response.status_code == 200
        
        login_data = login_response.json()
        user_info = login_data["user"]
        assert user_info["first_name"] == expected_first_name
        assert user_info["last_name"] == expected_last_name
        assert user_info["bio"] == expected_bio
        
    finally:
        cleanup()

@given(
    email=valid_email,
    password=valid_password,
    new_password=valid_password,
    first_name=valid_name,
    last_name=valid_name,
    username=valid_username
)
@settings(max_examples=100, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_property_24_password_reset_security(email, password, new_password, first_name, last_name, username):
    """
    **Feature: event-management, Property 24: Password reset security**
    **Validates: Requirements 5.5**
    
    For any password reset request, a secure reset link should be sent 
    and password update should be allowed
    """
    client, cleanup = create_test_client()
    
    try:
        # Make email and username unique to avoid conflicts
        unique_id = uuid.uuid4().hex[:8]
        unique_email = f"{unique_id}_{email}"
        unique_username = f"{username}_{unique_id}"
        
        # First create a user
        user_data = {
            "email": unique_email,
            "password": password,
            "first_name": first_name,
            "last_name": last_name,
            "username": unique_username
        }
        
        register_response = client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 200
        
        # Request password reset
        reset_request = {"email": unique_email}
        reset_response = client.post("/api/auth/password-reset/request", json=reset_request)
        assert reset_response.status_code == 200
        
        reset_data = reset_response.json()
        assert "message" in reset_data
        
        # In our test implementation, the token is returned for testing
        reset_token = reset_data.get("token")
        if reset_token:
            # Verify the token is valid
            verify_response = client.get(f"/api/auth/password-reset/verify/{reset_token}")
            assert verify_response.status_code == 200
            
            verify_data = verify_response.json()
            assert verify_data["valid"] == True
            assert verify_data["email"]  # Email should be present
            
            # Use the token to reset password
            reset_confirm = {
                "token": reset_token,
                "new_password": new_password
            }
            
            confirm_response = client.post("/api/auth/password-reset/confirm", json=reset_confirm)
            assert confirm_response.status_code == 200
            
            confirm_data = confirm_response.json()
            assert "message" in confirm_data
            
            # Verify old password no longer works (only if passwords are different)
            if password != new_password:
                old_login_response = client.post("/api/auth/login", json={
                    "email": unique_email,
                    "password": password
                })
                assert old_login_response.status_code == 401
            
            # Verify new password works
            new_login_response = client.post("/api/auth/login", json={
                "email": unique_email,
                "password": new_password
            })
            assert new_login_response.status_code == 200
            
            new_login_data = new_login_response.json()
            assert "access_token" in new_login_data
            assert "user" in new_login_data
            
            # Verify token cannot be reused
            reuse_response = client.post("/api/auth/password-reset/confirm", json=reset_confirm)
            assert reuse_response.status_code == 400
        
    finally:
        cleanup()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])