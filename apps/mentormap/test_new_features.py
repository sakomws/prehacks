#!/usr/bin/env python3
"""
Test script for new admin features:
1. Content Management interface
2. Add Mentee functionality
"""
import requests
import json

def test_admin_features():
    """Test the new admin features"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing New Admin Features")
    print("=" * 50)
    
    # Test 1: Create a new mentee via API
    print("\n1. Testing Add Mentee API...")
    
    mentee_data = {
        "email": "new.mentee@example.com",
        "username": "newmentee",
        "full_name": "New Test Mentee",
        "password": "securepass123",
        "is_mentor": False,
        "profile_data": {
            "phone": "+1-555-987-6543",
            "linkedin_url": "https://linkedin.com/in/newmentee",
            "goals": "Transition into product management and develop leadership skills"
        }
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/admin/users",
            json=mentee_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Mentee created successfully!")
            print(f"   - User ID: {result['user_id']}")
            print(f"   - Name: {result['name']}")
            print(f"   - Email: {result['email']}")
        else:
            print(f"❌ Failed to create mentee: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing mentee creation: {str(e)}")
    
    # Test 2: Verify the mentee was added to the users list
    print("\n2. Testing User List API...")
    
    try:
        response = requests.get(f"{base_url}/api/admin/users")
        
        if response.status_code == 200:
            users = response.json()
            mentees = [u for u in users if u['role'] == 'student']
            print(f"✅ Found {len(mentees)} mentees in the system")
            
            # Check if our new mentee is in the list
            new_mentee = next((u for u in mentees if u['email'] == mentee_data['email']), None)
            if new_mentee:
                print(f"✅ New mentee found in user list: {new_mentee['name']}")
            else:
                print("⚠️  New mentee not found in user list")
        else:
            print(f"❌ Failed to fetch users: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing user list: {str(e)}")
    
    # Test 3: Test admin page accessibility
    print("\n3. Testing Admin Page Accessibility...")
    
    try:
        response = requests.get("http://localhost:3000/admin")
        
        if response.status_code == 200:
            print("✅ Admin page is accessible")
            
            # Check if the page contains our new features
            content = response.text
            if "Content Management" in content:
                print("✅ Content Management interface is present")
            else:
                print("⚠️  Content Management interface not found")
                
            if "Add New Mentee" in content or "Add Mentee" in content:
                print("✅ Add Mentee functionality is present")
            else:
                print("⚠️  Add Mentee functionality not found")
        else:
            print(f"❌ Admin page not accessible: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing admin page: {str(e)}")
    
    # Test 4: Test other admin endpoints to ensure they still work
    print("\n4. Testing Other Admin Endpoints...")
    
    endpoints = [
        "/api/admin/stats",
        "/api/admin/mentor-applications",
        "/api/admin/events",
        "/api/admin/newsletter/subscribers"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                print(f"✅ {endpoint} - Working")
            else:
                print(f"❌ {endpoint} - Failed ({response.status_code})")
        except Exception as e:
            print(f"❌ {endpoint} - Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Feature Testing Complete!")
    print("\nNew Features Summary:")
    print("📝 Content Management Interface:")
    print("   - Blog posts management")
    print("   - Resources management") 
    print("   - FAQs management")
    print("   - Testimonials management")
    print("   - Add/Edit/Delete functionality")
    print("\n👥 Add Mentee Functionality:")
    print("   - Complete form with validation")
    print("   - API integration for user creation")
    print("   - Profile data collection")
    print("   - Success/error handling")
    print("   - Toast notifications")

if __name__ == "__main__":
    test_admin_features()