#!/usr/bin/env python3
"""
Test script specifically for mentee status update functionality
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_status_update():
    """Test mentee status update functionality"""
    print("🧪 Testing Mentee Status Update")
    print("=" * 50)
    
    # First, get a list of mentees to find one to test with
    print("1. Getting list of mentees...")
    response = requests.get(f"{BASE_URL}/api/admin/mentees")
    
    if response.status_code != 200:
        print(f"❌ Failed to fetch mentees: {response.status_code}")
        return False
    
    mentees = response.json()
    if not mentees:
        print("❌ No mentees found to test with")
        return False
    
    test_mentee = mentees[0]
    mentee_id = test_mentee['id']
    current_status = test_mentee['status']
    
    print(f"✅ Found test mentee: {test_mentee['name']} (ID: {mentee_id})")
    print(f"   Current status: {current_status}")
    
    # Test status update to inactive
    print(f"\n2. Testing status update to 'inactive'...")
    new_status = 'inactive' if current_status == 'active' else 'active'
    
    response = requests.put(
        f"{BASE_URL}/api/admin/mentees/{mentee_id}/status",
        headers={"Content-Type": "application/json"},
        json={"status": new_status}
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Status update successful!")
        print(f"   Response: {result}")
        
        # Verify the status was actually updated
        print(f"\n3. Verifying status update...")
        response = requests.get(f"{BASE_URL}/api/admin/mentees")
        if response.status_code == 200:
            updated_mentees = response.json()
            updated_mentee = next((m for m in updated_mentees if m['id'] == mentee_id), None)
            
            if updated_mentee and updated_mentee['status'] == new_status:
                print(f"✅ Status verification successful!")
                print(f"   Mentee status is now: {updated_mentee['status']}")
                
                # Test status update back to original
                print(f"\n4. Testing status update back to '{current_status}'...")
                response = requests.put(
                    f"{BASE_URL}/api/admin/mentees/{mentee_id}/status",
                    headers={"Content-Type": "application/json"},
                    json={"status": current_status}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Status restored successfully!")
                    print(f"   Response: {result}")
                    return True
                else:
                    print(f"❌ Failed to restore status: {response.status_code}")
                    print(f"   Error: {response.text}")
                    return False
            else:
                print(f"❌ Status verification failed!")
                print(f"   Expected: {new_status}, Got: {updated_mentee['status'] if updated_mentee else 'mentee not found'}")
                return False
        else:
            print(f"❌ Failed to verify status update: {response.status_code}")
            return False
    else:
        print(f"❌ Status update failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_invalid_status():
    """Test invalid status handling"""
    print(f"\n5. Testing invalid status handling...")
    
    # Get a mentee to test with
    response = requests.get(f"{BASE_URL}/api/admin/mentees")
    if response.status_code != 200:
        print("❌ Failed to get mentees for invalid status test")
        return False
    
    mentees = response.json()
    if not mentees:
        print("❌ No mentees found for invalid status test")
        return False
    
    mentee_id = mentees[0]['id']
    
    # Test with invalid status
    response = requests.put(
        f"{BASE_URL}/api/admin/mentees/{mentee_id}/status",
        headers={"Content-Type": "application/json"},
        json={"status": "invalid_status"}
    )
    
    if response.status_code == 400:
        print("✅ Invalid status properly rejected!")
        print(f"   Error message: {response.json().get('detail', 'No detail')}")
        return True
    else:
        print(f"❌ Invalid status not properly rejected: {response.status_code}")
        return False

def test_nonexistent_mentee():
    """Test status update for non-existent mentee"""
    print(f"\n6. Testing non-existent mentee handling...")
    
    response = requests.put(
        f"{BASE_URL}/api/admin/mentees/99999/status",
        headers={"Content-Type": "application/json"},
        json={"status": "inactive"}
    )
    
    if response.status_code == 404:
        print("✅ Non-existent mentee properly handled!")
        print(f"   Error message: {response.json().get('detail', 'No detail')}")
        return True
    else:
        print(f"❌ Non-existent mentee not properly handled: {response.status_code}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Mentee Status Update Tests")
    print("=" * 60)
    
    try:
        # Test basic status update functionality
        success1 = test_status_update()
        
        # Test error handling
        success2 = test_invalid_status()
        success3 = test_nonexistent_mentee()
        
        print("\n" + "=" * 60)
        print("📊 Test Results Summary:")
        print(f"✅ Status Update: {'PASS' if success1 else 'FAIL'}")
        print(f"✅ Invalid Status Handling: {'PASS' if success2 else 'FAIL'}")
        print(f"✅ Non-existent Mentee Handling: {'PASS' if success3 else 'FAIL'}")
        
        if all([success1, success2, success3]):
            print("\n🎉 All status update tests passed!")
            print("✨ The mentee status update functionality is working correctly!")
        else:
            print("\n❌ Some tests failed!")
            
    except Exception as e:
        print(f"💥 Test execution failed: {e}")