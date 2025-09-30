#!/usr/bin/env python3
"""
Simple test script for JobHax system.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from core.config import Config
from utils.data_loader import DataLoader
from utils.browser_manager import BrowserManager


async def test_browser_navigation():
    """Test basic browser navigation."""
    print("🚀 Testing JobHax Browser Navigation")
    print("=" * 50)
    
    # Initialize browser
    browser_manager = BrowserManager(headless=False)
    
    try:
        # Test navigation to SmartRecruiters
        url = "https://jobs.smartrecruiters.com/AbercrombieAndFitchCo/744000081085955-hollister-co-assistant-manager-santa-anita"
        print(f"📍 Navigating to: {url}")
        
        if browser_manager.navigate_to(url):
            print("✅ Successfully navigated to job page")
            
            # Wait a bit to see the page
            await asyncio.sleep(3)
            
            # Take a screenshot
            screenshot = browser_manager.take_screenshot("job_page.png")
            if screenshot:
                print(f"📸 Screenshot saved: {screenshot}")
            
            # Get page title
            title = browser_manager.driver.title if browser_manager.driver else "Unknown"
            print(f"📄 Page title: {title}")
            
            # Look for form elements
            form_elements = browser_manager.find_elements("//form", "xpath")
            print(f"🔍 Found {len(form_elements)} form elements")
            
            # Look for input fields
            input_elements = browser_manager.find_elements("//input", "xpath")
            print(f"📝 Found {len(input_elements)} input elements")
            
            # Look for buttons
            button_elements = browser_manager.find_elements("//button", "xpath")
            print(f"🔘 Found {len(button_elements)} button elements")
            
        else:
            print("❌ Failed to navigate to job page")
            
    except Exception as e:
        print(f"💥 Error during test: {e}")
    finally:
        browser_manager.cleanup()
        print("🧹 Browser cleaned up")


async def test_data_loading():
    """Test data loading functionality."""
    print("\n📊 Testing Data Loading")
    print("=" * 50)
    
    try:
        data_loader = DataLoader()
        
        # Load user data
        user_data = data_loader.load_user_data("data/test_data.json")
        print("✅ User data loaded successfully")
        print(f"   Name: {user_data.personal_info.first_name} {user_data.personal_info.last_name}")
        print(f"   Email: {user_data.personal_info.email}")
        print(f"   Phone: {user_data.personal_info.phone}")
        print(f"   Current Title: {user_data.professional_info.current_title}")
        print(f"   Years Experience: {user_data.professional_info.years_experience}")
        
        # Load CV data
        cv_data = data_loader.load_cv_data("data/sample_cv.txt")
        if cv_data:
            print("✅ CV data loaded successfully")
            print(f"   File type: {cv_data.file_type}")
            print(f"   Skills found: {len(cv_data.skills)}")
            print(f"   Experience entries: {len(cv_data.experience)}")
        else:
            print("⚠️  No CV data loaded")
            
    except Exception as e:
        print(f"💥 Error loading data: {e}")


async def test_ai_client():
    """Test AI client functionality."""
    print("\n🤖 Testing AI Client")
    print("=" * 50)
    
    try:
        config = Config(ai_provider="openai")
        from agents.ai_client import AIClient
        
        ai_client = AIClient(config.get_ai_config())
        
        # Test simple prompt
        prompt = "What is the capital of France?"
        response = ai_client.generate_response(prompt)
        
        if response:
            print("✅ AI client working")
            print(f"   Response: {response[:100]}...")
        else:
            print("❌ AI client not responding")
            
    except Exception as e:
        print(f"💥 Error testing AI client: {e}")


async def main():
    """Main test function."""
    print("🧪 JobHax System Test")
    print("=" * 60)
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    try:
        # Test data loading
        await test_data_loading()
        
        # Test AI client
        await test_ai_client()
        
        # Test browser navigation
        await test_browser_navigation()
        
        print("\n🎉 All tests completed!")
        
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")


if __name__ == "__main__":
    asyncio.run(main())
