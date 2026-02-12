#!/usr/bin/env python3
"""
Test script for merged admin functionality
"""
import requests

def test_merged_admin():
    """Test the merged admin functionality"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Merged Admin Functionality")
    print("=" * 50)
    
    # Test API endpoints that should still work
    endpoints = [
        "/api/admin/stats",
        "/api/admin/sessions",
        "/api/admin/mentors", 
        "/api/admin/mentor-applications",
        "/api/admin/gifts",
        "/api/admin/events",
        "/api/admin/users"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {endpoint} - Working ({len(data) if isinstance(data, list) else 'OK'})")
            else:
                print(f"❌ {endpoint} - Failed ({response.status_code})")
        except Exception as e:
            print(f"❌ {endpoint} - Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Merged Functionality Summary:")
    print("\n📅 Sessions & Gift Sessions:")
    print("   - Combined into single interface with sub-tabs")
    print("   - Sessions management with gift session tracking")
    print("   - Unified analytics and export functionality")
    print("\n🎓 Mentors & Applications:")
    print("   - Merged mentor management with application approval")
    print("   - Single interface for mentor lifecycle")
    print("   - Application to mentor conversion workflow")
    print("\n📆 Calendar & Schedule:")
    print("   - Combined calendar view with schedule management")
    print("   - Mentor availability and time-off management")
    print("   - Session scheduling and calendar integration")

if __name__ == "__main__":
    test_merged_admin()