#!/usr/bin/env python3
"""
Test the comprehensive mentees management system
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_mentees_system():
    """Test the complete mentees management functionality"""
    print("🧪 Testing Mentees Management System")
    print("=" * 50)
    
    # Test 1: Get all mentees
    print("\n1. Testing mentees list...")
    response = requests.get(f"{BASE_URL}/api/admin/mentees")
    if response.status_code == 200:
        mentees = response.json()
        print(f"✅ Found {len(mentees)} mentees")
        if mentees:
            mentee = mentees[0]
            print(f"   Sample mentee: {mentee['name']} ({mentee['email']})")
            print(f"   Status: {mentee['status']}, Experience: {mentee['experience_level']}")
            print(f"   Sessions: {mentee['total_sessions']}, Spent: ${mentee['total_spent']}")
    else:
        print(f"❌ Failed to fetch mentees: {response.status_code}")
        return
    
    # Test 2: Get sessions
    print("\n2. Testing sessions management...")
    response = requests.get(f"{BASE_URL}/api/admin/sessions")
    if response.status_code == 200:
        sessions = response.json()
        print(f"✅ Found {len(sessions)} sessions")
        if sessions:
            session = sessions[0]
            print(f"   Sample session: {session['title']}")
            print(f"   Status: {session['status']}, Payment: {session['payment_status']}")
            print(f"   Price: ${session['price']}")
    else:
        print(f"❌ Failed to fetch sessions: {response.status_code}")
    
    # Test 3: Get gift sessions
    print("\n3. Testing gift sessions...")
    response = requests.get(f"{BASE_URL}/api/admin/gifts")
    if response.status_code == 200:
        gifts = response.json()
        print(f"✅ Found {len(gifts)} gift sessions")
        if gifts:
            gift = gifts[0]
            print(f"   Sample gift: {gift['gift_code']}")
            print(f"   From: {gift['sender_name']} → To: {gift['recipient_name']}")
            print(f"   Status: {gift['status']}, Value: ${gift['value']}")
    else:
        print(f"❌ Failed to fetch gifts: {response.status_code}")
    
    # Test 4: Get revenue analytics
    print("\n4. Testing revenue analytics...")
    response = requests.get(f"{BASE_URL}/api/admin/revenue/analytics")
    if response.status_code == 200:
        analytics = response.json()
        print(f"✅ Revenue analytics loaded")
        print(f"   Total Revenue: ${analytics['total_revenue']:,.2f}")
        print(f"   Monthly Revenue: ${analytics['monthly_revenue']:,.2f}")
        print(f"   Growth: {analytics['revenue_growth']:.1f}%")
        print(f"   Avg Session Value: ${analytics['avg_session_value']:.2f}")
        print(f"   Top mentors: {len(analytics['top_mentors_by_revenue'])}")
    else:
        print(f"❌ Failed to fetch revenue analytics: {response.status_code}")
    
    # Test 5: Test mentee analytics (if we have mentees)
    if mentees:
        print(f"\n5. Testing mentee analytics for {mentee['name']}...")
        response = requests.get(f"{BASE_URL}/api/admin/mentees/{mentee['id']}/analytics")
        if response.status_code == 200:
            analytics = response.json()
            print(f"✅ Mentee analytics loaded")
            print(f"   Total Sessions: {analytics['total_sessions']}")
            print(f"   Completion Rate: {analytics['completion_rate']:.1f}%")
            print(f"   Engagement Score: {analytics['engagement_score']}")
            print(f"   Favorite Topics: {len(analytics['favorite_topics'])}")
        else:
            print(f"❌ Failed to fetch mentee analytics: {response.status_code}")
        
        # Test 6: Test mentee progress
        print(f"\n6. Testing mentee progress for {mentee['name']}...")
        response = requests.get(f"{BASE_URL}/api/admin/mentees/{mentee['id']}/progress")
        if response.status_code == 200:
            progress = response.json()
            print(f"✅ Mentee progress loaded")
            print(f"   Goals: {len(progress['goals'])}")
            print(f"   Skills: {len(progress['skills'])}")
            print(f"   Milestones: {len(progress['milestones'])}")
        else:
            print(f"❌ Failed to fetch mentee progress: {response.status_code}")
    
    print("\n" + "=" * 50)
    print("🎉 Mentees Management System Test Complete!")

if __name__ == "__main__":
    test_mentees_system()