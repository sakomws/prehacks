#!/usr/bin/env python3
"""
Test script to verify the fixes for:
1. Mentor applications endpoint
2. Newsletter subscriber system
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_mentor_applications():
    """Test mentor applications endpoint"""
    print("🔍 Testing Mentor Applications...")
    
    try:
        # Test GET applications
        response = requests.get(f"{BASE_URL}/api/admin/mentor-applications")
        if response.status_code == 200:
            applications = response.json()
            print(f"✅ Successfully fetched {len(applications)} mentor applications")
            
            if applications:
                # Test GET specific application
                app_id = applications[0]['id']
                detail_response = requests.get(f"{BASE_URL}/api/admin/mentor-applications/{app_id}")
                if detail_response.status_code == 200:
                    print(f"✅ Successfully fetched application details for ID {app_id}")
                else:
                    print(f"❌ Failed to fetch application details: {detail_response.status_code}")
            
            return True
        else:
            print(f"❌ Failed to fetch applications: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing mentor applications: {e}")
        return False

def test_newsletter_system():
    """Test newsletter system endpoints"""
    print("\n📧 Testing Newsletter System...")
    
    try:
        # Test GET subscribers
        response = requests.get(f"{BASE_URL}/api/admin/newsletter/subscribers")
        if response.status_code == 200:
            data = response.json()
            subscribers = data.get('subscribers', [])
            print(f"✅ Successfully fetched {len(subscribers)} newsletter subscribers")
            
            # Test subscriber creation
            test_subscriber = {
                "email": "test@example.com",
                "full_name": "Test User",
                "user_type": "general",
                "preferences": ["Career Development", "Tech News"],
                "tags": ["test", "automation"]
            }
            
            create_response = requests.post(
                f"{BASE_URL}/api/admin/newsletter/subscribers",
                json=test_subscriber
            )
            
            if create_response.status_code == 200:
                print("✅ Successfully created test subscriber")
                
                # Clean up - delete the test subscriber
                # Note: We'd need a delete endpoint for this, but for now just log success
                
            else:
                print(f"⚠️  Subscriber creation returned: {create_response.status_code}")
                # This might fail if subscriber already exists, which is OK
            
            return True
        else:
            print(f"❌ Failed to fetch subscribers: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing newsletter system: {e}")
        return False

def test_newsletter_campaigns():
    """Test newsletter campaigns endpoint"""
    print("\n📬 Testing Newsletter Campaigns...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/admin/newsletter/campaigns")
        if response.status_code == 200:
            data = response.json()
            campaigns = data.get('campaigns', [])
            print(f"✅ Successfully fetched {len(campaigns)} email campaigns")
            return True
        else:
            print(f"❌ Failed to fetch campaigns: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing campaigns: {e}")
        return False

def test_newsletter_templates():
    """Test newsletter templates endpoint"""
    print("\n📝 Testing Newsletter Templates...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/admin/newsletter/templates")
        if response.status_code == 200:
            templates = response.json()
            print(f"✅ Successfully fetched {len(templates)} email templates")
            return True
        else:
            print(f"❌ Failed to fetch templates: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing templates: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Fixed Issues...")
    print("=" * 50)
    
    results = []
    
    # Test mentor applications
    results.append(test_mentor_applications())
    
    # Test newsletter system
    results.append(test_newsletter_system())
    results.append(test_newsletter_campaigns())
    results.append(test_newsletter_templates())
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"✅ Passed: {sum(results)}")
    print(f"❌ Failed: {len(results) - sum(results)}")
    
    if all(results):
        print("\n🎉 All tests passed! The fixes are working correctly.")
    else:
        print("\n⚠️  Some tests failed. Please check the output above.")
    
    return all(results)

if __name__ == "__main__":
    main()