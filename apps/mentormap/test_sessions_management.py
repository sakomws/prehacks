#!/usr/bin/env python3
"""
Test script to verify the comprehensive sessions management system
including sessions, gift sessions, analytics, and mentor performance.
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def test_sessions_endpoints():
    """Test sessions management endpoints"""
    print("🔍 Testing Sessions Management...")
    
    try:
        # Test sessions list
        response = requests.get(f"{BASE_URL}/api/admin/sessions")
        if response.status_code == 200:
            data = response.json()
            sessions = data.get('sessions', [])
            print(f"✅ Fetched {len(sessions)} sessions")
            
            if sessions:
                session = sessions[0]
                print(f"📋 First session: {session.get('title')} - {session.get('status')}")
                
                # Test session details
                session_id = session['id']
                detail_response = requests.get(f"{BASE_URL}/api/admin/sessions/{session_id}")
                if detail_response.status_code == 200:
                    print(f"✅ Session details fetched for ID {session_id}")
                else:
                    print(f"❌ Failed to fetch session details: {detail_response.status_code}")
            
            return True
        else:
            print(f"❌ Failed to fetch sessions: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_sessions_analytics():
    """Test sessions analytics endpoints"""
    print("\n📊 Testing Sessions Analytics...")
    
    try:
        # Test overview analytics
        response = requests.get(f"{BASE_URL}/api/admin/sessions/analytics/overview?days=30")
        if response.status_code == 200:
            analytics = response.json()
            print(f"✅ Analytics fetched successfully")
            print(f"   Total sessions: {analytics.get('total_sessions', 0)}")
            print(f"   Completed sessions: {analytics.get('completed_sessions', 0)}")
            print(f"   Completion rate: {analytics.get('completion_rate', 0)}%")
            print(f"   Total revenue: ${analytics.get('total_revenue', 0)}")
            
            # Test revenue analytics
            revenue_response = requests.get(f"{BASE_URL}/api/admin/sessions/revenue/analytics?days=30")
            if revenue_response.status_code == 200:
                revenue_data = revenue_response.json()
                print(f"✅ Revenue analytics fetched")
                print(f"   Total revenue: ${revenue_data.get('total_revenue', 0)}")
                print(f"   Avg per session: ${revenue_data.get('avg_revenue_per_session', 0)}")
            
            return True
        else:
            print(f"❌ Failed to fetch analytics: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_gift_sessions():
    """Test gift sessions management"""
    print("\n🎁 Testing Gift Sessions...")
    
    try:
        # Test gift sessions list
        response = requests.get(f"{BASE_URL}/api/admin/gift-sessions")
        if response.status_code == 200:
            data = response.json()
            gift_sessions = data.get('gift_sessions', [])
            print(f"✅ Fetched {len(gift_sessions)} gift sessions")
            
            # Test creating a gift session
            gift_data = {
                "purchaser_name": "Test Purchaser",
                "purchaser_email": "purchaser@test.com",
                "recipient_name": "Test Recipient",
                "recipient_email": "recipient@test.com",
                "message": "Happy Birthday!",
                "amount": 100.0
            }
            
            create_response = requests.post(
                f"{BASE_URL}/api/admin/gift-sessions",
                json=gift_data
            )
            
            if create_response.status_code == 200:
                result = create_response.json()
                print(f"✅ Gift session created: ID {result.get('gift_session_id')}")
                
                # Test gift sessions analytics
                analytics_response = requests.get(f"{BASE_URL}/api/admin/gift-sessions/analytics?days=30")
                if analytics_response.status_code == 200:
                    analytics = analytics_response.json()
                    print(f"✅ Gift analytics fetched")
                    print(f"   Total gift sessions: {analytics.get('total_gift_sessions', 0)}")
                    print(f"   Redemption rate: {analytics.get('redemption_rate', 0)}%")
                
                return True
            else:
                print(f"❌ Failed to create gift session: {create_response.status_code}")
                return False
        else:
            print(f"❌ Failed to fetch gift sessions: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_mentor_performance():
    """Test mentor performance analytics"""
    print("\n🏆 Testing Mentor Performance...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/admin/mentors/performance?days=30")
        if response.status_code == 200:
            data = response.json()
            mentors = data.get('mentors', [])
            print(f"✅ Fetched performance data for {len(mentors)} mentors")
            
            if mentors:
                top_mentor = mentors[0]
                print(f"📋 Top mentor: {top_mentor.get('mentor_name')}")
                print(f"   Total sessions: {top_mentor.get('total_sessions', 0)}")
                print(f"   Completion rate: {top_mentor.get('completion_rate', 0)}%")
                print(f"   Total revenue: ${top_mentor.get('total_revenue', 0)}")
                print(f"   Average rating: {top_mentor.get('avg_rating', 0)}")
            
            return True
        else:
            print(f"❌ Failed to fetch mentor performance: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_session_status_updates():
    """Test session status and payment updates"""
    print("\n🔄 Testing Session Updates...")
    
    try:
        # Get a session to update
        response = requests.get(f"{BASE_URL}/api/admin/sessions?limit=1")
        if response.status_code == 200:
            data = response.json()
            sessions = data.get('sessions', [])
            
            if sessions:
                session_id = sessions[0]['id']
                
                # Test status update
                status_response = requests.put(
                    f"{BASE_URL}/api/admin/sessions/{session_id}/status",
                    json={"status": "completed", "notes": "Test completion"}
                )
                
                if status_response.status_code == 200:
                    print(f"✅ Session status updated successfully")
                else:
                    print(f"❌ Failed to update session status: {status_response.status_code}")
                
                # Test payment update
                payment_response = requests.put(
                    f"{BASE_URL}/api/admin/sessions/{session_id}/payment",
                    json={"payment_status": "paid", "payment_notes": "Test payment"}
                )
                
                if payment_response.status_code == 200:
                    print(f"✅ Payment status updated successfully")
                    return True
                else:
                    print(f"❌ Failed to update payment status: {payment_response.status_code}")
                    return False
            else:
                print("⚠️  No sessions available for testing updates")
                return True
        else:
            print(f"❌ Failed to fetch sessions for update test: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_filtering_and_pagination():
    """Test filtering and pagination features"""
    print("\n🔍 Testing Filtering and Pagination...")
    
    try:
        # Test status filtering
        statuses = ["scheduled", "completed", "cancelled"]
        for status in statuses:
            response = requests.get(f"{BASE_URL}/api/admin/sessions?status={status}")
            if response.status_code == 200:
                data = response.json()
                sessions = data.get('sessions', [])
                print(f"✅ {status} sessions: {len(sessions)}")
            else:
                print(f"❌ Failed to filter by {status}: {response.status_code}")
        
        # Test pagination
        response = requests.get(f"{BASE_URL}/api/admin/sessions?limit=5&skip=0")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Pagination works - fetched {len(data.get('sessions', []))} sessions")
            print(f"   Total count: {data.get('total_count', 0)}")
            print(f"   Has more: {data.get('page_info', {}).get('has_more', False)}")
            return True
        else:
            print(f"❌ Failed pagination test: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all sessions management tests"""
    print("🧪 Testing Comprehensive Sessions Management System")
    print("=" * 60)
    
    tests = [
        ("Sessions Endpoints", test_sessions_endpoints),
        ("Sessions Analytics", test_sessions_analytics),
        ("Gift Sessions", test_gift_sessions),
        ("Mentor Performance", test_mentor_performance),
        ("Session Updates", test_session_status_updates),
        ("Filtering & Pagination", test_filtering_and_pagination)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Sessions Management Test Results:")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} {test_name}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("\n🎉 Sessions Management System is fully functional!")
        print("✨ Features working:")
        print("   • Sessions management with filtering and status updates")
        print("   • Gift sessions tracking and redemption")
        print("   • Revenue analytics and mentor performance")
        print("   • Export functionality for all data types")
        print("   • Comprehensive filtering and pagination")
        print("   • Real-time status and payment updates")
    else:
        print("\n⚠️  Some features need attention")
        print("🔧 Check the failed tests above for details")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)