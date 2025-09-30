#!/usr/bin/env python3
"""
Test script to verify the complete JobHax integration is working.
"""

import requests
import json
import time

def test_services():
    """Test all the required services."""
    print("🧪 Testing JobHax Integration")
    print("=" * 40)
    
    # Test 1: Agent Server Health
    print("\n1. Testing Agent Server...")
    try:
        response = requests.get("http://localhost:8080/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ Agent server is healthy")
        else:
            print(f"   ❌ Agent server returned status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Agent server error: {e}")
    
    # Test 2: Monitoring UI
    print("\n2. Testing Monitoring UI...")
    try:
        response = requests.get("http://localhost:3001", timeout=5)
        if response.status_code == 200:
            print("   ✅ Monitoring UI is accessible")
        else:
            print(f"   ❌ Monitoring UI returned status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Monitoring UI error: {e}")
    
    # Test 3: Agent API Endpoint
    print("\n3. Testing Agent API...")
    try:
        test_data = {
            "job_url": "https://apply.appcast.io/jobs/50590620606/applyboard/apply",
            "timeout_seconds": 60,
            "headless": True,
            "user_data_dir": None,
            "profile_directory": None,
            "cv_path": None,
            "site_hint": "test"
        }
        
        response = requests.post(
            "http://localhost:8080/apply",
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("   ✅ Agent API is working")
            print(f"   📊 Response: {result.get('meta', {}).get('candidate', 'Unknown')}")
        else:
            print(f"   ❌ Agent API returned status {response.status_code}")
            print(f"   📝 Response: {response.text[:200]}...")
    except Exception as e:
        print(f"   ❌ Agent API error: {e}")
    
    print("\n🎉 Integration test completed!")
    print("\n📋 Next Steps:")
    print("1. Load the Chrome extension in Chrome")
    print("2. Navigate to a job application page")
    print("3. Click the extension icon")
    print("4. Click '🚀 Auto Apply'")
    print("5. Watch the monitoring dashboard at http://localhost:3001")

if __name__ == "__main__":
    test_services()
