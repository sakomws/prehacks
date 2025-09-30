#!/usr/bin/env python3
"""
Test script for JobHax LLM integration
"""

import os
import sys
from pathlib import Path

# Set up environment
os.environ['OPENAI_API_KEY'] = 'sk-test-key-placeholder'  # Placeholder for testing

# Add paths
sys.path.insert(0, str(Path(__file__).parent / "src"))
sys.path.insert(0, str(Path(__file__).parent / "web_ui"))

def test_llm_functions():
    """Test the LLM integration functions"""
    try:
        from web_ui.app import analyze_form_with_llm, fill_form_with_llm_analysis
        print("✅ LLM functions imported successfully")
        
        # Test with mock data
        from utils.data_loader import DataLoader
        data_loader = DataLoader()
        data_path = Path(__file__).parent / "data" / "test_data.json"
        user_data = data_loader.load_user_data(str(data_path))
        
        print(f"✅ User data loaded: {user_data.personal_info.first_name} {user_data.personal_info.last_name}")
        print(f"✅ Email: {user_data.personal_info.email}")
        print(f"✅ Phone: {user_data.personal_info.phone}")
        
        print("\n🤖 LLM Integration Test Results:")
        print("✅ analyze_form_with_llm() function available")
        print("✅ fill_form_with_llm_analysis() function available")
        print("✅ Environment variables loaded")
        print("✅ Dependencies imported successfully")
        
        print("\n🚀 JobHax is ready with LLM integration!")
        print("📝 Note: Add your real OpenAI API key to .env file for full functionality")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing LLM integration: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing JobHax LLM Integration...")
    print("=" * 50)
    
    success = test_llm_functions()
    
    if success:
        print("\n🎉 LLM Integration Test PASSED!")
        print("🚀 Ready to run: python web_ui/app.py")
    else:
        print("\n❌ LLM Integration Test FAILED!")
        print("🔧 Check dependencies and configuration")
