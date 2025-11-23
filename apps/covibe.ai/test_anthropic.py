#!/usr/bin/env python3
"""
Test script for Anthropic API key
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

def test_anthropic_key():
    """Test if Anthropic API key is valid"""
    
    api_key = os.getenv('ANTHROPIC_API_KEY')
    
    print("=" * 60)
    print("🧪 Testing Anthropic API Key")
    print("=" * 60)
    print()
    
    # Check if key exists
    if not api_key:
        print("❌ ANTHROPIC_API_KEY not found in environment")
        print("   Please add it to backend/.env file")
        return False
    
    print(f"✅ API Key found: {api_key[:20]}...{api_key[-10:]}")
    print()
    
    # Test the API
    try:
        from anthropic import Anthropic
        
        print("📡 Testing API connection...")
        client = Anthropic(api_key=api_key)
        
        # Make a simple test request
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=50,
            messages=[
                {
                    "role": "user",
                    "content": "Say 'Hello' in one word"
                }
            ]
        )
        
        print("✅ API Connection Successful!")
        print()
        print("📊 Response Details:")
        print(f"   Model: {response.model}")
        print(f"   Response: {response.content[0].text}")
        print(f"   Input tokens: {response.usage.input_tokens}")
        print(f"   Output tokens: {response.usage.output_tokens}")
        print(f"   Total tokens: {response.usage.input_tokens + response.usage.output_tokens}")
        print()
        print("=" * 60)
        print("✅ Your Anthropic API key is working correctly!")
        print("=" * 60)
        return True
        
    except ImportError:
        print("❌ Anthropic library not installed")
        print("   Run: pip install anthropic")
        return False
        
    except Exception as e:
        error_msg = str(e)
        print("❌ API Test Failed")
        print()
        print(f"Error: {error_msg}")
        print()
        
        # Check for common errors
        if "credit balance is too low" in error_msg.lower():
            print("💳 Issue: Insufficient Credits")
            print("   Your API key is valid but has no credits")
            print("   Solution:")
            print("   1. Visit: https://console.anthropic.com/settings/billing")
            print("   2. Add credits to your account")
            print("   3. Run this test again")
            
        elif "invalid" in error_msg.lower() or "authentication" in error_msg.lower():
            print("🔑 Issue: Invalid API Key")
            print("   Your API key may be incorrect or expired")
            print("   Solution:")
            print("   1. Visit: https://console.anthropic.com/settings/keys")
            print("   2. Generate a new API key")
            print("   3. Update backend/.env file")
            
        elif "rate limit" in error_msg.lower():
            print("⏱️  Issue: Rate Limited")
            print("   You've made too many requests")
            print("   Solution: Wait a few minutes and try again")
            
        else:
            print("🔍 Unknown Error")
            print("   Check the error message above for details")
        
        print()
        print("=" * 60)
        return False

if __name__ == "__main__":
    test_anthropic_key()
