#!/usr/bin/env python3
"""
Simple test script to verify the AI Parenting Guide backend setup.
Tests basic functionality without requiring full environment setup.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all required modules can be imported."""
    try:
        from app.core.config import settings
        from app.models.user import User, UserRole, AgeGroup
        from app.schemas.user import UserCreate, UserResponse
        from app.services.auth import AuthService
        from app.services.gemini_ai import GeminiAIService
        from app.services.rate_limiter import RateLimiter
        print("✅ All imports successful")
        return True
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

def test_config():
    """Test configuration loading."""
    try:
        from app.core.config import settings
        
        # Check that required settings exist
        required_settings = [
            'DATABASE_URL', 'REDIS_URL', 'JWT_SECRET_KEY', 
            'JWT_ALGORITHM', 'BACKEND_HOST', 'BACKEND_PORT'
        ]
        
        for setting in required_settings:
            if not hasattr(settings, setting):
                print(f"❌ Missing required setting: {setting}")
                return False
        
        print("✅ Configuration loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

def test_models():
    """Test SQLAlchemy models."""
    try:
        from app.models.user import User, UserRole, AgeGroup
        
        # Test enum values
        assert UserRole.LEARNER == "learner"
        assert UserRole.ADMIN == "admin"
        assert AgeGroup.ADULT == "adult"
        
        print("✅ Models test successful")
        return True
    except Exception as e:
        print(f"❌ Models test failed: {e}")
        return False

def test_schemas():
    """Test Pydantic schemas."""
    try:
        from app.schemas.user import UserCreate, UserResponse
        from app.schemas.auth import Token, LoginRequest
        
        # Test schema creation
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "display_name": "Test User",
            "password": "TestPass123"
        }
        
        user_create = UserCreate(**user_data)
        assert user_create.email == "test@example.com"
        
        print("✅ Schemas test successful")
        return True
    except Exception as e:
        print(f"❌ Schemas test failed: {e}")
        return False

def test_password_hashing():
    """Test password hashing functionality."""
    try:
        # Simple test to verify the auth service can be imported
        from app.services.auth import AuthService
        
        # Test that the class exists and has the required methods
        assert hasattr(AuthService, 'get_password_hash'), "Missing get_password_hash method"
        assert hasattr(AuthService, 'verify_password'), "Missing verify_password method"
        
        print("✅ Password hashing test successful (auth service structure verified)")
        return True
    except Exception as e:
        print(f"❌ Password hashing test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Testing AI Parenting Guide Backend Setup")
    print("=" * 50)
    
    tests = [
        ("Imports", test_imports),
        ("Configuration", test_config),
        ("Models", test_models),
        ("Schemas", test_schemas),
        ("Password Hashing", test_password_hashing),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        if test_func():
            passed += 1
        else:
            print(f"   Test failed: {test_name}")
    
    print("\n" + "=" * 50)
    print(f"📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend setup is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Please check the setup.")
        return 1

if __name__ == "__main__":
    sys.exit(main())