#!/usr/bin/env python3
"""
Simple structure test to verify the project setup is correct.
This test doesn't require external dependencies.
"""

import os
import sys

def test_project_structure():
    """Test that all required files and directories exist."""
    
    # Required backend files
    backend_files = [
        'main.py',
        'requirements.txt',
        'alembic.ini',
        'app/__init__.py',
        'app/core/__init__.py',
        'app/core/config.py',
        'app/core/database.py',
        'app/models/__init__.py',
        'app/models/user.py',
        'app/models/calendar.py',
        'app/models/event.py',
        'app/models/registration.py',
        'app/models/notification.py',
        'app/models/payment.py',
        'app/schemas/__init__.py',
        'app/schemas/user.py',
        'alembic/env.py',
        'alembic/script.py.mako',
        'alembic/versions/.gitkeep',
    ]
    
    print("🔍 Testing backend project structure...")
    
    missing_files = []
    for file_path in backend_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing backend files: {missing_files}")
        return False
    else:
        print("✅ All backend files present")
    
    # Test that main.py contains FastAPI app
    with open('main.py', 'r') as f:
        content = f.read()
        if 'FastAPI' in content and 'app = FastAPI' in content:
            print("✅ FastAPI app found in main.py")
        else:
            print("❌ FastAPI app not properly configured in main.py")
            return False
    
    # Test that requirements.txt contains key dependencies
    with open('requirements.txt', 'r') as f:
        requirements = f.read()
        required_deps = ['fastapi', 'sqlalchemy', 'alembic', 'pydantic', 'uvicorn']
        missing_deps = [dep for dep in required_deps if dep not in requirements.lower()]
        
        if missing_deps:
            print(f"❌ Missing required dependencies: {missing_deps}")
            return False
        else:
            print("✅ All required dependencies found in requirements.txt")
    
    return True

def test_frontend_structure():
    """Test that frontend structure exists."""
    
    frontend_files = [
        '../frontend/package.json',
        '../frontend/next.config.js',
        '../frontend/tsconfig.json',
        '../frontend/tailwind.config.js',
        '../frontend/src/app/layout.tsx',
        '../frontend/src/app/page.tsx',
        '../frontend/src/app/globals.css',
        '../frontend/src/components/providers.tsx',
        '../frontend/src/lib/api.ts',
        '../frontend/src/lib/utils.ts',
        '../frontend/src/types/index.ts',
    ]
    
    print("\n🔍 Testing frontend project structure...")
    
    missing_files = []
    for file_path in frontend_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing frontend files: {missing_files}")
        return False
    else:
        print("✅ All frontend files present")
    
    return True

def test_docker_structure():
    """Test that Docker configuration exists."""
    
    docker_files = [
        '../docker-compose.yml',
        'Dockerfile',
        '../frontend/Dockerfile',
    ]
    
    print("\n🔍 Testing Docker configuration...")
    
    missing_files = []
    for file_path in docker_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing Docker files: {missing_files}")
        return False
    else:
        print("✅ All Docker files present")
    
    return True

if __name__ == "__main__":
    print("🚀 Event Management Platform - Structure Test")
    print("=" * 50)
    
    backend_ok = test_project_structure()
    frontend_ok = test_frontend_structure()
    docker_ok = test_docker_structure()
    
    print("\n" + "=" * 50)
    if backend_ok and frontend_ok and docker_ok:
        print("🎉 All structure tests passed!")
        print("\nNext steps:")
        print("1. Install backend dependencies: pip install -r requirements.txt")
        print("2. Install frontend dependencies: cd ../frontend && npm install")
        print("3. Start services: docker-compose up -d")
        sys.exit(0)
    else:
        print("❌ Some structure tests failed!")
        sys.exit(1)