#!/usr/bin/env python3

import os
import sys
import time
from pathlib import Path
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from core.config import Config
from utils.data_loader import DataLoader
from utils.browser_manager import BrowserManager

def test_radio_buttons():
    print("🎯 Testing radio button clicking...")
    
    # Load user data
    data_loader = DataLoader()
    data_path = Path(__file__).parent / "data" / "test_data.json"
    user_data = data_loader.load_user_data(str(data_path))
    
    # Initialize browser
    browser_manager = BrowserManager(headless=False)  # Keep visible for debugging
    
    job_url = "https://apply.appcast.io/jobs/50590620606/applyboard/apply"
    
    if not browser_manager.navigate_to(job_url):
        print("❌ Failed to navigate to job page")
        return
    
    time.sleep(3)
    
    # Try to click "I'm Interested" button
    print("🔍 Looking for 'I'm Interested' button...")
    interest_button_selectors = [
        "//button[contains(text(), 'I'm Interested')]",
        "//button[contains(text(), 'Apply Now')]",
        "//button[contains(text(), 'Apply')]"
    ]
    
    for selector in interest_button_selectors:
        try:
            element = browser_manager.find_element(selector, "xpath")
            if element and element.is_displayed():
                browser_manager.click_element(element)
                print("✅ Clicked interest/apply button")
                time.sleep(3)
                break
        except:
            continue
    
    print("\n" + "="*80)
    print("🎯 RADIO BUTTON TESTING")
    print("="*80)
    
    # Get all radio buttons
    all_radio_buttons = browser_manager.driver.find_elements(By.XPATH, "//input[@type='radio']")
    print(f"🔍 Found {len(all_radio_buttons)} total radio buttons")
    
    # Group radio buttons by name
    radio_groups = {}
    for radio in all_radio_buttons:
        try:
            if not radio.is_displayed():
                continue
            name = radio.get_attribute('name') or 'unnamed'
            if name not in radio_groups:
                radio_groups[name] = []
            radio_groups[name].append(radio)
        except:
            continue
    
    print(f"🔍 Found {len(radio_groups)} radio button groups")
    
    # Test clicking radio buttons
    for group_name, radios in radio_groups.items():
        print(f"\n🔍 Testing group: {group_name}")
        print(f"   Found {len(radios)} radio buttons in this group")
        
        for i, radio in enumerate(radios):
            try:
                value = radio.get_attribute('value') or ''
                print(f"   Radio {i+1}: value='{value}'")
                
                # Click the first "Yes" or "No" we find
                if value.lower() in ['yes', 'y', 'no', 'n', 'true', 'false', '1', '0']:
                    print(f"   🎯 Clicking radio with value: '{value}'")
                    
                    # Try regular click first
                    try:
                        radio.click()
                        print(f"   ✅ Regular click successful")
                    except Exception as e:
                        print(f"   ❌ Regular click failed: {e}")
                        
                        # Try JavaScript click
                        try:
                            browser_manager.driver.execute_script("arguments[0].click();", radio)
                            print(f"   ✅ JavaScript click successful")
                        except Exception as e2:
                            print(f"   ❌ JavaScript click failed: {e2}")
                    
                    # Check if it's selected
                    is_selected = radio.is_selected()
                    print(f"   📊 Radio is now selected: {is_selected}")
                    
                    # Only click one radio per group
                    break
                    
            except Exception as e:
                print(f"   ❌ Error with radio {i+1}: {e}")
    
    # Take a screenshot
    screenshot = browser_manager.take_screenshot("test_radio_buttons.png")
    print(f"\n📸 Screenshot saved: {screenshot}")
    
    # Keep browser open for manual inspection
    print("\n🔍 Browser will stay open for 30 seconds for manual inspection...")
    time.sleep(30)
    
    browser_manager.quit()

if __name__ == "__main__":
    test_radio_buttons()
