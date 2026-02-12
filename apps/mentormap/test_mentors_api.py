#!/usr/bin/env python3
"""
Test script for mentor API endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_fetch_mentors():
    """Test fetching mentors"""
    print("1. Testing mentor fetching...")
    response = requests.get(f"{BASE_URL}/api/admin/mentors")
    
    if response.status_code == 200:
        mentors = response.json()
        print(f"✅ Successfully fetched {len(mentors)} mentors")
        
        if mentors:
            mentor = mentors[0]
            print(f"   Sample mentor: {mentor['name']} ({mentor['email']})")
            print(f"   Title: {mentor['title']}")
            print(f"   Expertise: {mentor['expertise']}")
            print(f"   Hourly Rate: ${mentor['hourly_rate']}")
        
        return True
    else:
        print(f"❌ Failed to fetch mentors: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_create_mentor():
    """Test creating a mentor"""
    print("\n2. Testing mentor creation...")
    
    mentor_data = {
        "name": "Test Mentor",
        "email": f"test.mentor.{hash('test')}@example.com",  # Unique email
        "title": "Senior Software Engineer",
        "bio": "Experienced software engineer with 10+ years in web development",
        "expertise": ["JavaScript", "React", "Node.js", "Python"],
        "hourly_rate": 150.0,
        "linkedin_url": "https://linkedin.com/in/testmentor",
        "website_url": "https://testmentor.dev"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/admin/mentors",
        headers={"Content-Type": "application/json"},
        json=mentor_data
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Mentor created successfully!")
        print(f"   Response: {result}")
        return result.get("mentor_id")
    else:
        print(f"❌ Failed to create mentor: {response.status_code}")
        print(f"   Error: {response.text}")
        return None

def test_update_mentor(mentor_id):
    """Test updating a mentor"""
    print(f"\n3. Testing mentor update (ID: {mentor_id})...")
    
    update_data = {
        "title": "Lead Software Engineer",
        "expertise": ["JavaScript", "React", "Node.js", "Python", "TypeScript"],
        "hourly_rate": 175.0
    }
    
    response = requests.put(
        f"{BASE_URL}/api/admin/mentors/{mentor_id}",
        headers={"Content-Type": "application/json"},
        json=update_data
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Mentor updated successfully!")
        print(f"   Response: {result}")
        return True
    else:
        print(f"❌ Failed to update mentor: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def test_mentor_expertise_handling():
    """Test that expertise is properly handled as both list and string"""
    print("\n4. Testing expertise field handling...")
    
    # Test with list expertise
    mentor_data_list = {
        "name": "Test Mentor List",
        "email": f"test.mentor.list.{hash('testlist')}@example.com",
        "title": "Frontend Developer",
        "bio": "Frontend specialist",
        "expertise": ["React", "Vue.js", "Angular"],
        "hourly_rate": 120.0
    }
    
    response = requests.post(
        f"{BASE_URL}/api/admin/mentors",
        headers={"Content-Type": "application/json"},
        json=mentor_data_list
    )
    
    if response.status_code == 200:
        print("✅ Mentor with list expertise created successfully!")
        mentor_id = response.json().get("mentor_id")
        
        # Fetch the mentor to verify expertise is returned as list
        response = requests.get(f"{BASE_URL}/api/admin/mentors")
        if response.status_code == 200:
            mentors = response.json()
            created_mentor = next((m for m in mentors if m['id'] == mentor_id), None)
            
            if created_mentor:
                expertise = created_mentor['expertise']
                print(f"   Expertise returned as: {expertise} (type: {type(expertise)})")
                
                if isinstance(expertise, list):
                    print("✅ Expertise properly returned as list!")
                    return True
                else:
                    print("❌ Expertise not returned as list!")
                    return False
            else:
                print("❌ Created mentor not found in list!")
                return False
        else:
            print("❌ Failed to fetch mentors for verification!")
            return False
    else:
        print(f"❌ Failed to create mentor with list expertise: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Mentor API Endpoints")
    print("=" * 50)
    
    try:
        # Test fetching mentors
        fetch_success = test_fetch_mentors()
        
        # Test creating mentor
        mentor_id = test_create_mentor()
        
        # Test updating mentor if creation was successful
        update_success = False
        if mentor_id:
            update_success = test_update_mentor(mentor_id)
        
        # Test expertise handling
        expertise_success = test_mentor_expertise_handling()
        
        print("\n" + "=" * 50)
        print("📊 Test Results Summary:")
        print(f"✅ Fetch Mentors: {'PASS' if fetch_success else 'FAIL'}")
        print(f"✅ Create Mentor: {'PASS' if mentor_id else 'FAIL'}")
        print(f"✅ Update Mentor: {'PASS' if update_success else 'FAIL'}")
        print(f"✅ Expertise Handling: {'PASS' if expertise_success else 'FAIL'}")
        
        if all([fetch_success, mentor_id, update_success, expertise_success]):
            print("\n🎉 All mentor API tests passed!")
            print("✨ Mentor functionality is working correctly!")
        else:
            print("\n❌ Some tests failed!")
            
    except Exception as e:
        print(f"💥 Test execution failed: {e}")