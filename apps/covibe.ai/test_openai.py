#!/usr/bin/env python3
"""
Test script for OpenAI API key
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

def test_openai_key():
    """Test if OpenAI API key is valid"""
    
    api_key = os.getenv('OPENAI_API_KEY')
    
    print("=" * 60)
    print("🧪 Testing OpenAI API Key")
    print("=" * 60)
    print()
    
    # Check if key exists
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment")
        print("   Please add it to backend/.env file")
        return False
    
    print(f"✅ API Key found: {api_key[:20]}...{api_key[-10:]}")
    print()
    
    # Test the API
    try:
        from openai import OpenAI
        
        print("📡 Testing API connection...")
        client = OpenAI(api_key=api_key)
        
        # Make a simple test request with gpt-3.5-turbo (cheaper)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": "Say 'Hello' in one word"
                }
            ],
            max_tokens=10
        )
        
        print("✅ API Connection Successful!")
        print()
        print("📊 Response Details:")
        print(f"   Model: {response.model}")
        print(f"   Response: {response.choices[0].message.content}")
        print(f"   Prompt tokens: {response.usage.prompt_tokens}")
        print(f"   Completion tokens: {response.usage.completion_tokens}")
        print(f"   Total tokens: {response.usage.total_tokens}")
        print()
        print("=" * 60)
        print("✅ Your OpenAI API key is working correctly!")
        print("=" * 60)
        return True
        
    except ImportError:
        print("❌ OpenAI library not installed")
        print("   Run: pip install openai")
        return False
        
    except Exception as e:
        error_msg = str(e)
        print("❌ API Test Failed")
        print()
        print(f"Error: {error_msg}")
        print()
        
        # Check for common errors
        if "quota" in error_msg.lower() or "insufficient_quota" in error_msg.lower():
            print("💳 Issue: Insufficient Credits / Quota Exceeded")
            print("   Your API key is valid but has no credits or exceeded quota")
            print("   Solution:")
            print("   1. Visit: https://platform.openai.com/account/billing")
            print("   2. Add credits to your account")
            print("   3. Check your usage limits")
            print("   4. Run this test again")
            
        elif "invalid" in error_msg.lower() or "authentication" in error_msg.lower() or "401" in error_msg:
            print("🔑 Issue: Invalid API Key")
            print("   Your API key may be incorrect or expired")
            print("   Solution:")
            print("   1. Visit: https://platform.openai.com/api-keys")
            print("   2. Generate a new API key")
            print("   3. Update backend/.env file")
            
        elif "rate limit" in error_msg.lower() or "429" in error_msg:
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
    test_openai_key()
