#!/usr/bin/env python3
"""
Simple test script to verify authentication functionality
"""
import requests
import json

BASE_URL = "http://localhost:8002"

def test_user_registration():
    """Test user registration"""
    print("🧪 Testing user registration...")
    
    user_data = {
        "email": "test@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "username": "testuser"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Registration successful!")
        print(f"   User ID: {data['user']['id']}")
        print(f"   Email: {data['user']['email']}")
        print(f"   Token: {data['access_token'][:20]}...")
        return data['access_token']
    else:
        print(f"❌ Registration failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return None

def test_user_login():
    """Test user login"""
    print("\n🧪 Testing user login...")
    
    login_data = {
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Login successful!")
        print(f"   User: {data['user']['first_name']} {data['user']['last_name']}")
        print(f"   Token: {data['access_token'][:20]}...")
        return data['access_token']
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return None

def test_protected_route(token):
    """Test accessing protected route"""
    print("\n🧪 Testing protected route...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Protected route access successful!")
        print(f"   User: {data['first_name']} {data['last_name']}")
        print(f"   Email: {data['email']}")
        print(f"   Joined: {data['joined_at']}")
    else:
        print(f"❌ Protected route access failed: {response.status_code}")
        print(f"   Error: {response.text}")

def test_health_check():
    """Test health check endpoint"""
    print("🧪 Testing health check...")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed!")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on port 8000")
        return False

if __name__ == "__main__":
    print("🚀 Starting Event Management Platform Authentication Tests\n")
    
    # Test health check first
    if not test_health_check():
        print("\n💡 To start the server, run: python main.py")
        exit(1)
    
    # Test registration
    token = test_user_registration()
    
    if token:
        # Test protected route with registration token
        test_protected_route(token)
        
        # Test login
        login_token = test_user_login()
        
        if login_token:
            # Test protected route with login token
            test_protected_route(login_token)
    
    print("\n🎉 Authentication tests completed!")