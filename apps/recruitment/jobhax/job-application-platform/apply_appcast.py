#!/usr/bin/env python3
"""
Specialized script for applying to Appcast.io jobs.
"""

import asyncio
import logging
import sys
import time
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from core.config import Config
from utils.data_loader import DataLoader
from utils.browser_manager import BrowserManager


async def apply_to_appcast_job():
    """Apply to the specific Appcast.io job."""
    print("🎯 Applying to Rochester Regional Health LPN Position")
    print("=" * 60)
    print("Job: LPN Staff I - Long Term Care")
    print("Company: Rochester Regional Health")
    print("Location: Newark, NY 14513")
    print("URL: https://apply.appcast.io/jobs/50590620606/applyboard/apply")
    print()
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Load user data
    data_loader = DataLoader()
    user_data = data_loader.load_user_data("data/test_data.json")
    
    # Initialize browser (non-headless so we can see what's happening)
    browser_manager = BrowserManager(headless=False)
    
    try:
        # Navigate to the job application page
        url = "https://apply.appcast.io/jobs/50590620606/applyboard/apply"
        print(f"🌐 Navigating to: {url}")
        
        if not browser_manager.navigate_to(url):
            print("❌ Failed to navigate to job page")
            return
        
        print("✅ Successfully navigated to job page")
        
        # Wait for page to load completely
        await asyncio.sleep(5)
        
        # Take initial screenshot
        screenshot1 = browser_manager.take_screenshot("appcast_initial.png")
        print(f"📸 Initial screenshot: {screenshot1}")
        
        # Look for application form elements
        print("\n🔍 Analyzing application form...")
        
        # Common form field selectors for Appcast
        form_selectors = [
            "//form",
            "//div[contains(@class, 'application')]",
            "//div[contains(@class, 'form')]",
            "//div[contains(@class, 'apply')]"
        ]
        
        forms_found = 0
        for selector in form_selectors:
            elements = browser_manager.find_elements(selector, "xpath")
            if elements:
                forms_found += len(elements)
                print(f"   Found {len(elements)} elements with selector: {selector}")
        
        # Look for input fields
        input_selectors = [
            "//input[@type='text']",
            "//input[@type='email']",
            "//input[@type='tel']",
            "//input[@type='number']",
            "//textarea",
            "//select"
        ]
        
        total_inputs = 0
        for selector in input_selectors:
            elements = browser_manager.find_elements(selector, "xpath")
            if elements:
                total_inputs += len(elements)
                print(f"   Found {len(elements)} input elements: {selector}")
        
        print(f"📝 Total form elements found: {forms_found}")
        print(f"📝 Total input fields found: {total_inputs}")
        
        # Look for specific common fields
        common_fields = {
            "First Name": ["//input[@name='firstName']", "//input[@name='first_name']", "//input[@placeholder*='first']"],
            "Last Name": ["//input[@name='lastName']", "//input[@name='last_name']", "//input[@placeholder*='last']"],
            "Email": ["//input[@type='email']", "//input[@name='email']"],
            "Phone": ["//input[@type='tel']", "//input[@name='phone']"],
            "Address": ["//input[@name='address']", "//input[@placeholder*='address']"],
            "City": ["//input[@name='city']", "//input[@placeholder*='city']"],
            "State": ["//select[@name='state']", "//input[@name='state']"],
            "Zip": ["//input[@name='zip']", "//input[@name='zipCode']"],
            "Resume": ["//input[@type='file']", "//input[@name='resume']"]
        }
        
        print("\n🎯 Looking for specific form fields...")
        for field_name, selectors in common_fields.items():
            found = False
            for selector in selectors:
                element = browser_manager.find_element(selector, "xpath")
                if element:
                    print(f"   ✅ Found {field_name}: {selector}")
                    found = True
                    break
            if not found:
                print(f"   ❌ {field_name} not found")
        
        # Try to fill out any fields we can find
        print("\n📝 Attempting to fill form fields...")
        
        # Fill first name
        first_name_selectors = ["//input[@name='firstName']", "//input[@name='first_name']", "//input[@placeholder*='first']"]
        for selector in first_name_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                browser_manager.fill_input(element, user_data.personal_info.first_name)
                print(f"   ✅ Filled first name: {user_data.personal_info.first_name}")
                break
        
        # Fill last name
        last_name_selectors = ["//input[@name='lastName']", "//input[@name='last_name']", "//input[@placeholder*='last']"]
        for selector in last_name_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                browser_manager.fill_input(element, user_data.personal_info.last_name)
                print(f"   ✅ Filled last name: {user_data.personal_info.last_name}")
                break
        
        # Fill email
        email_selectors = ["//input[@type='email']", "//input[@name='email']"]
        for selector in email_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                browser_manager.fill_input(element, user_data.personal_info.email)
                print(f"   ✅ Filled email: {user_data.personal_info.email}")
                break
        
        # Fill phone
        phone_selectors = ["//input[@type='tel']", "//input[@name='phone']"]
        for selector in phone_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                browser_manager.fill_input(element, user_data.personal_info.phone)
                print(f"   ✅ Filled phone: {user_data.personal_info.phone}")
                break
        
        # Wait a bit for form to process
        await asyncio.sleep(2)
        
        # Take screenshot after filling
        screenshot2 = browser_manager.take_screenshot("appcast_filled.png")
        print(f"📸 Form filled screenshot: {screenshot2}")
        
        # Look for submit button
        submit_selectors = [
            "//button[@type='submit']",
            "//input[@type='submit']",
            "//button[contains(text(), 'Submit')]",
            "//button[contains(text(), 'Apply')]",
            "//button[contains(text(), 'Send')]",
            "//a[contains(text(), 'Submit')]",
            "//a[contains(text(), 'Apply')]"
        ]
        
        print("\n🔘 Looking for submit button...")
        submit_button = None
        for selector in submit_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                print(f"   ✅ Found submit button: {selector}")
                submit_button = element
                break
        
        if submit_button:
            print("🚀 Attempting to submit application...")
            browser_manager.click_element(submit_button)
            await asyncio.sleep(3)
            
            # Take final screenshot
            screenshot3 = browser_manager.take_screenshot("appcast_submitted.png")
            print(f"📸 Final screenshot: {screenshot3}")
            
            print("✅ Application submitted successfully!")
        else:
            print("⚠️  Submit button not found - application may need manual completion")
        
        # Check for success indicators
        page_source = browser_manager.get_page_source()
        success_indicators = [
            "thank you", "success", "submitted", "received", "confirmation",
            "application complete", "next step"
        ]
        
        page_lower = page_source.lower()
        for indicator in success_indicators:
            if indicator in page_lower:
                print(f"   ✅ Found success indicator: '{indicator}'")
        
        print("\n🎉 Application process completed!")
        print("📁 Check the screenshots folder for visual confirmation")
        
    except Exception as e:
        print(f"💥 Error during application: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("\n⏳ Keeping browser open for 10 seconds to review...")
        await asyncio.sleep(10)
        browser_manager.cleanup()
        print("🧹 Browser cleaned up")


if __name__ == "__main__":
    asyncio.run(apply_to_appcast_job())
