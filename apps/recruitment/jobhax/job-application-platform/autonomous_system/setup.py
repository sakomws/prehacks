#!/usr/bin/env python3
"""
Setup script for the Autonomous Job Application System
"""

import subprocess
import sys
import os
from pathlib import Path

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    print("📁 Creating directories...")
    directories = ["logs", "output", "screenshots"]
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    print("✅ Directories created")

def check_py_interaction():
    """Check if py_interaction library is available"""
    print("🔍 Checking for py_interaction library...")
    try:
        import py_interaction
        print("✅ py_interaction library found")
        return True
    except ImportError:
        print("⚠️  py_interaction library not found")
        print("   This library needs to be installed separately")
        print("   The system will use a mock implementation for testing")
        return False

def create_mock_implementation():
    """Create mock implementation for testing without py_interaction"""
    print("🔧 Creating mock implementation...")
    
    mock_code = '''
"""
Mock implementation of py_interaction for testing
"""

class HostDevice:
    """Mock HostDevice class"""
    
    def __init__(self):
        self.current_url = ""
        self.page_content = ""
    
    def navigate_to(self, url):
        """Mock navigation"""
        self.current_url = url
        print(f"Mock: Navigated to {url}")
    
    def fill_field(self, field_id, value):
        """Mock field filling"""
        print(f"Mock: Filled {field_id} with {value}")
        return True
    
    def click_element(self, element_id):
        """Mock element clicking"""
        print(f"Mock: Clicked {element_id}")
        return True
    
    def upload_file(self, field_id, file_path):
        """Mock file upload"""
        print(f"Mock: Uploaded {file_path} to {field_id}")
        return True
    
    def get_page_content(self):
        """Mock page content retrieval"""
        return self.page_content
    
    def take_screenshot(self, filename):
        """Mock screenshot"""
        print(f"Mock: Screenshot saved as {filename}")
        return True

class VNCClient:
    """Mock VNCClient class"""
    
    def __init__(self, host, port):
        self.host = host
        self.port = port
    
    def connect(self):
        """Mock VNC connection"""
        print(f"Mock: Connected to VNC at {self.host}:{self.port}")
        return True
    
    def disconnect(self):
        """Mock VNC disconnection"""
        print("Mock: Disconnected from VNC")
        return True
'''
    
    with open("mock_py_interaction.py", "w") as f:
        f.write(mock_code)
    
    print("✅ Mock implementation created")

def main():
    """Main setup function"""
    print("🚀 Setting up Autonomous Job Application System")
    print("=" * 50)
    
    # Install requirements
    if not install_requirements():
        print("❌ Setup failed at requirements installation")
        return False
    
    # Create directories
    create_directories()
    
    # Check for py_interaction
    has_py_interaction = check_py_interaction()
    
    # Create mock if needed
    if not has_py_interaction:
        create_mock_implementation()
    
    print("\n✅ Setup completed successfully!")
    print("\nNext steps:")
    print("1. If you have py_interaction library, place it in the project directory")
    print("2. Run: python autonomous_job_applicant.py <job_url>")
    print("3. Check the output files in the 'output' directory")
    
    return True

if __name__ == "__main__":
    main()
