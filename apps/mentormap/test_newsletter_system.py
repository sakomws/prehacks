#!/usr/bin/env python3
"""
Test the comprehensive newsletter management system
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_newsletter_system():
    """Test the complete newsletter management functionality"""
    print("🧪 Testing Newsletter Management System")
    print("=" * 50)
    
    # Test 1: Get subscribers with segmentation
    print("\n1. Testing subscriber management...")
    response = requests.get(f"{BASE_URL}/api/admin/newsletter/subscribers")
    if response.status_code == 200:
        data = response.json()
        subscribers = data.get('subscribers', [])
        print(f"✅ Found {len(subscribers)} subscribers")
        if subscribers:
            subscriber = subscribers[0]
            print(f"   Sample subscriber: {subscriber['email']}")
            print(f"   User type: {subscriber['user_type']}, Engagement: {subscriber['engagement_score']}%")
            print(f"   Location: {subscriber.get('location', 'N/A')}")
            print(f"   Tags: {subscriber.get('tags', [])}")
    else:
        print(f"❌ Failed to fetch subscribers: {response.status_code}")
        return
    
    # Test 2: Get subscriber segments
    print("\n2. Testing subscriber segmentation...")
    response = requests.get(f"{BASE_URL}/api/admin/newsletter/subscribers/segments")
    if response.status_code == 200:
        segments = response.json()
        print(f"✅ Segmentation data loaded")
        print(f"   Total subscribers: {segments['total_subscribers']}")
        print(f"   Active subscribers: {segments['active_subscribers']}")
        print(f"   Engagement segments:")
        print(f"     - High: {segments['engagement_segments']['high_engagement']}")
        print(f"     - Medium: {segments['engagement_segments']['medium_engagement']}")
        print(f"     - Low: {segments['engagement_segments']['low_engagement']}")
        print(f"   User type segments:")
        print(f"     - Mentees: {segments['user_type_segments']['mentees']}")
        print(f"     - Mentors: {segments['user_type_segments']['mentors']}")
        print(f"     - General: {segments['user_type_segments']['general']}")
    else:
        print(f"❌ Failed to fetch segments: {response.status_code}")
    
    # Test 3: Get email campaigns
    print("\n3. Testing email campaigns...")
    response = requests.get(f"{BASE_URL}/api/admin/newsletter/campaigns")
    if response.status_code == 200:
        data = response.json()
        campaigns = data.get('campaigns', [])
        print(f"✅ Found {len(campaigns)} campaigns")
        if campaigns:
            campaign = campaigns[0]
            print(f"   Sample campaign: {campaign['name']}")
            print(f"   Subject: {campaign['subject']}")
            print(f"   Status: {campaign['status']}")
            print(f"   Recipients: {campaign['total_recipients']}")
            print(f"   Open rate: {campaign['open_rate']}%")
            print(f"   Click rate: {campaign['click_rate']}%")
    else:
        print(f"❌ Failed to fetch campaigns: {response.status_code}")
    
    # Test 4: Get email templates
    print("\n4. Testing email templates...")
    response = requests.get(f"{BASE_URL}/api/admin/newsletter/templates")
    if response.status_code == 200:
        templates = response.json()
        print(f"✅ Found {len(templates)} templates")
        if templates:
            template = templates[0]
            print(f"   Sample template: {template['name']}")
            print(f"   Type: {template['template_type']}")
            print(f"   Subject: {template['subject_template']}")
            print(f"   Variables: {template['variables']}")
            print(f"   Active: {template['is_active']}")
    else:
        print(f"❌ Failed to fetch templates: {response.status_code}")
    
    # Test 5: Get analytics overview
    print("\n5. Testing newsletter analytics...")
    response = requests.get(f"{BASE_URL}/api/admin/newsletter/analytics/overview")
    if response.status_code == 200:
        analytics = response.json()
        print(f"✅ Analytics overview loaded")
        metrics = analytics['campaign_metrics']
        print(f"   Campaign metrics:")
        print(f"     - Total campaigns: {metrics['total_campaigns']}")
        print(f"     - Emails sent: {metrics['total_emails_sent']:,}")
        print(f"     - Delivery rate: {metrics['delivery_rate']}%")
        print(f"     - Open rate: {metrics['open_rate']}%")
        print(f"     - Click rate: {metrics['click_rate']}%")
        
        sub_metrics = analytics['subscriber_metrics']
        print(f"   Subscriber metrics:")
        print(f"     - New subscribers: {sub_metrics['new_subscribers']}")
        print(f"     - Unsubscribed: {sub_metrics['unsubscribed']}")
        print(f"     - Net growth: {sub_metrics['net_growth']}")
        
        print(f"   Top campaigns: {len(analytics['top_campaigns'])}")
    else:
        print(f"❌ Failed to fetch analytics: {response.status_code}")
    
    # Test 6: Test creating a new subscriber
    print("\n6. Testing subscriber creation...")
    new_subscriber = {
        "email": "test@example.com",
        "full_name": "Test User",
        "user_type": "mentee",
        "location": "Test City",
        "preferences": ["career", "development"],
        "tags": ["test", "demo"],
        "engagement_score": 75
    }
    
    response = requests.post(
        f"{BASE_URL}/api/admin/newsletter/subscribers",
        json=new_subscriber
    )
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Subscriber created successfully")
        print(f"   Subscriber ID: {result['subscriber_id']}")
    else:
        print(f"⚠️  Subscriber creation test: {response.status_code} (may already exist)")
    
    # Test 7: Test creating a new campaign
    print("\n7. Testing campaign creation...")
    new_campaign = {
        "name": "Test Campaign",
        "subject": "Test Subject",
        "content": "<p>This is a test campaign</p>",
        "segment_criteria": {
            "user_type": "mentee",
            "engagement_level": "high"
        },
        "scheduled_at": "2024-12-25T10:00:00"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/admin/newsletter/campaigns",
        json=new_campaign
    )
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Campaign created successfully")
        print(f"   Campaign ID: {result['campaign_id']}")
        print(f"   Total recipients: {result['total_recipients']}")
    else:
        print(f"❌ Failed to create campaign: {response.status_code}")
    
    # Test 8: Test creating a new template
    print("\n8. Testing template creation...")
    new_template = {
        "name": "Test Template",
        "description": "A test email template",
        "subject_template": "Test: {{subject}}",
        "html_content": "<h1>Hello {{name}}</h1><p>This is a test.</p>",
        "text_content": "Hello {{name}}, This is a test.",
        "template_type": "newsletter",
        "variables": ["subject", "name"]
    }
    
    response = requests.post(
        f"{BASE_URL}/api/admin/newsletter/templates",
        json=new_template
    )
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Template created successfully")
        print(f"   Template ID: {result['template_id']}")
    else:
        print(f"❌ Failed to create template: {response.status_code}")
    
    print("\n" + "=" * 50)
    print("🎉 Newsletter Management System Test Complete!")

if __name__ == "__main__":
    test_newsletter_system()