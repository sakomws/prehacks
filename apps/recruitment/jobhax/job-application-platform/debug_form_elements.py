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

def debug_form_elements():
    print("🔍 Debugging form elements on the job application page...")
    
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
        "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'i\'m interested')]",
        "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'im interested')]",
        "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'interested')]",
        "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply now')]",
        "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply')]"
    ]
    
    for i, selector in enumerate(interest_button_selectors):
        try:
            element = browser_manager.find_element(selector, "xpath")
            if element and element.is_displayed():
                button_text = browser_manager.get_element_text(element) or browser_manager.get_element_attribute(element, "value") or "No text"
                print(f"✅ Found interest button with selector {i+1}: '{selector}' - Text: '{button_text}'")
                browser_manager.click_element(element)
                print("✅ Clicked interest/apply button")
                time.sleep(3)
                break
        except Exception as e:
            continue
    
    print("\n" + "="*80)
    print("📋 FORM ELEMENTS ANALYSIS")
    print("="*80)
    
    # Get ALL input elements
    all_inputs = browser_manager.driver.find_elements(By.XPATH, "//input")
    print(f"\n🔍 Found {len(all_inputs)} input elements:")
    
    for i, input_elem in enumerate(all_inputs):
        try:
            if not input_elem.is_displayed():
                continue
                
            input_type = input_elem.get_attribute('type') or 'text'
            input_id = input_elem.get_attribute('id') or 'no-id'
            input_name = input_elem.get_attribute('name') or 'no-name'
            input_placeholder = input_elem.get_attribute('placeholder') or 'no-placeholder'
            input_value = input_elem.get_attribute('value') or 'no-value'
            input_class = input_elem.get_attribute('class') or 'no-class'
            
            print(f"\n{i+1}. {input_type.upper()} INPUT")
            print(f"   ID: '{input_id}'")
            print(f"   Name: '{input_name}'")
            print(f"   Placeholder: '{input_placeholder}'")
            print(f"   Value: '{input_value}'")
            print(f"   Class: '{input_class}'")
            
            if input_type == 'radio':
                print(f"   ⚠️  RADIO BUTTON - Value: '{input_value}'")
            elif input_type == 'checkbox':
                print(f"   ☑️  CHECKBOX - Value: '{input_value}'")
                
        except Exception as e:
            print(f"   ❌ Error reading input {i+1}: {e}")
    
    # Get ALL select elements
    all_selects = browser_manager.driver.find_elements(By.XPATH, "//select")
    print(f"\n🔍 Found {len(all_selects)} select elements:")
    
    for i, select_elem in enumerate(all_selects):
        try:
            if not select_elem.is_displayed():
                continue
                
            select_id = select_elem.get_attribute('id') or 'no-id'
            select_name = select_elem.get_attribute('name') or 'no-name'
            select_class = select_elem.get_attribute('class') or 'no-class'
            
            select = Select(select_elem)
            options = [option.text for option in select.options]
            
            print(f"\n{i+1}. SELECT DROPDOWN")
            print(f"   ID: '{select_id}'")
            print(f"   Name: '{select_name}'")
            print(f"   Class: '{select_class}'")
            print(f"   Options: {options}")
            
        except Exception as e:
            print(f"   ❌ Error reading select {i+1}: {e}")
    
    # Get ALL textarea elements
    all_textareas = browser_manager.driver.find_elements(By.XPATH, "//textarea")
    print(f"\n🔍 Found {len(all_textareas)} textarea elements:")
    
    for i, textarea in enumerate(all_textareas):
        try:
            if not textarea.is_displayed():
                continue
                
            textarea_id = textarea.get_attribute('id') or 'no-id'
            textarea_name = textarea.get_attribute('name') or 'no-name'
            textarea_placeholder = textarea.get_attribute('placeholder') or 'no-placeholder'
            textarea_value = textarea.get_attribute('value') or 'no-value'
            textarea_class = textarea.get_attribute('class') or 'no-class'
            
            print(f"\n{i+1}. TEXTAREA")
            print(f"   ID: '{textarea_id}'")
            print(f"   Name: '{textarea_name}'")
            print(f"   Placeholder: '{textarea_placeholder}'")
            print(f"   Value: '{textarea_value}'")
            print(f"   Class: '{textarea_class}'")
            
        except Exception as e:
            print(f"   ❌ Error reading textarea {i+1}: {e}")
    
    # Take a screenshot
    screenshot = browser_manager.take_screenshot("debug_form_analysis.png")
    print(f"\n📸 Screenshot saved: {screenshot}")
    
    # Keep browser open for manual inspection
    print("\n🔍 Browser will stay open for 30 seconds for manual inspection...")
    time.sleep(30)
    
    browser_manager.quit()

if __name__ == "__main__":
    debug_form_elements()
