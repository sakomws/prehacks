#!/usr/bin/env python3
"""
Test script to debug the messages function issue
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_conversations():
    """Test conversations endpoint"""
    print("🔍 Testing Conversations...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/admin/chat/conversations")
        if response.status_code == 200:
            conversations = response.json()
            print(f"✅ Fetched {len(conversations)} conversations")
            
            if conversations:
                # Show first conversation structure
                first_conv = conversations[0]
                print(f"📋 First conversation structure:")
                for key, value in first_conv.items():
                    print(f"   {key}: {value}")
                
                return conversations[0]['session_id']
            else:
                print("❌ No conversations found")
                return None
        else:
            print(f"❌ Failed to fetch conversations: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_messages(session_id):
    """Test messages endpoint for a specific session"""
    print(f"\n💬 Testing Messages for Session {session_id}...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/admin/chat/messages/{session_id}")
        if response.status_code == 200:
            messages = response.json()
            print(f"✅ Fetched {len(messages)} messages")
            
            if messages:
                # Show first message structure
                first_msg = messages[0]
                print(f"📋 First message structure:")
                for key, value in first_msg.items():
                    print(f"   {key}: {value}")
                
                # Check for required fields
                required_fields = ['id', 'session_id', 'sender_id', 'sender_name', 'sender_role', 
                                 'message', 'sent_at', 'is_read', 'is_flagged', 'moderation_status']
                
                missing_fields = []
                for field in required_fields:
                    if field not in first_msg:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"❌ Missing required fields: {missing_fields}")
                else:
                    print("✅ All required fields present")
                
                return True
            else:
                print("❌ No messages found")
                return False
        else:
            print(f"❌ Failed to fetch messages: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_message_actions(session_id):
    """Test message flagging and moderation"""
    print(f"\n🚩 Testing Message Actions...")
    
    try:
        # Get messages first
        response = requests.get(f"{BASE_URL}/api/admin/chat/messages/{session_id}")
        if response.status_code == 200:
            messages = response.json()
            if messages:
                message_id = messages[0]['id']
                
                # Test flagging
                flag_response = requests.put(
                    f"{BASE_URL}/api/admin/chat/messages/{message_id}/flag",
                    json={"flag_reason": "test"}
                )
                
                if flag_response.status_code == 200:
                    print("✅ Message flagging works")
                else:
                    print(f"❌ Message flagging failed: {flag_response.status_code}")
                
                # Test moderation
                moderate_response = requests.put(
                    f"{BASE_URL}/api/admin/chat/messages/{message_id}/moderate",
                    json={"moderation_status": "approved"}
                )
                
                if moderate_response.status_code == 200:
                    print("✅ Message moderation works")
                else:
                    print(f"❌ Message moderation failed: {moderate_response.status_code}")
                
                return True
        
        return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_chat_analytics():
    """Test chat analytics endpoint"""
    print(f"\n📊 Testing Chat Analytics...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/admin/chat/analytics")
        if response.status_code == 200:
            analytics = response.json()
            print(f"✅ Analytics fetched successfully")
            print(f"   Total conversations: {analytics.get('total_conversations', 0)}")
            print(f"   Total messages: {analytics.get('total_messages', 0)}")
            print(f"   Flagged messages: {analytics.get('flagged_messages', 0)}")
            return True
        else:
            print(f"❌ Analytics failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all message function tests"""
    print("🧪 Testing Messages Function")
    print("=" * 50)
    
    # Test conversations
    session_id = test_conversations()
    if not session_id:
        print("❌ Cannot proceed without a valid session ID")
        return False
    
    # Test messages
    messages_work = test_messages(session_id)
    
    # Test message actions
    actions_work = test_message_actions(session_id)
    
    # Test analytics
    analytics_work = test_chat_analytics()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"✅ Conversations: Working")
    print(f"{'✅' if messages_work else '❌'} Messages: {'Working' if messages_work else 'Failed'}")
    print(f"{'✅' if actions_work else '❌'} Message Actions: {'Working' if actions_work else 'Failed'}")
    print(f"{'✅' if analytics_work else '❌'} Analytics: {'Working' if analytics_work else 'Failed'}")
    
    if messages_work and actions_work and analytics_work:
        print("\n🎉 All message functions are working!")
        print("💡 If the frontend isn't working, the issue might be:")
        print("   • JavaScript console errors")
        print("   • Network connectivity issues")
        print("   • Frontend state management problems")
        print("   • Modal display issues")
    else:
        print("\n⚠️  Some message functions have issues")
        print("🔧 Check the failed tests above for details")
    
    return messages_work and actions_work and analytics_work

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)