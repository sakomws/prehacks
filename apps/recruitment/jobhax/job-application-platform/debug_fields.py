#!/usr/bin/env python3
"""
Debug script to test field detection on the job application page
"""

import os
import sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def debug_job_page():
    """Debug the job application page to see what fields are available"""
    
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Initialize driver
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        # Navigate to the job page
        job_url = "https://apply.appcast.io/jobs/50590620606/applyboard/apply"
        print(f"🌐 Navigating to: {job_url}")
        driver.get(job_url)
        
        # Wait for page to load
        time.sleep(5)
        
        # Look for "I'm Interested" button
        print("🔍 Looking for 'I'm Interested' button...")
        interest_buttons = driver.find_elements(By.XPATH, "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'interested')]")
        if interest_buttons:
            print(f"✅ Found {len(interest_buttons)} interest button(s)")
            interest_buttons[0].click()
            print("✅ Clicked interest button")
            time.sleep(3)
        else:
            print("⚠️ No interest button found")
        
        # Get all form elements
        print("\n🔍 Analyzing all form elements...")
        all_inputs = driver.find_elements(By.TAG_NAME, "input")
        all_selects = driver.find_elements(By.TAG_NAME, "select")
        all_textareas = driver.find_elements(By.TAG_NAME, "textarea")
        
        all_elements = all_inputs + all_selects + all_textareas
        print(f"📊 Found {len(all_elements)} total form elements")
        
        # Analyze each element
        for i, elem in enumerate(all_elements):
            try:
                if not elem.is_displayed():
                    continue
                    
                elem_id = elem.get_attribute('id') or 'no-id'
                elem_name = elem.get_attribute('name') or 'no-name'
                elem_type = elem.get_attribute('type') or elem.tag_name
                elem_placeholder = elem.get_attribute('placeholder') or 'no-placeholder'
                elem_class = elem.get_attribute('class') or 'no-class'
                elem_value = elem.get_attribute('value') or 'no-value'
                elem_required = elem.get_attribute('required') or 'no-required'
                
                # Check if this might be a name field
                combined_text = f"{elem_id} {elem_name} {elem_placeholder} {elem_class}".lower()
                is_name_field = any(keyword in combined_text for keyword in ['first', 'last', 'name', 'legal'])
                is_country_field = any(keyword in combined_text for keyword in ['country', 'nation'])
                
                print(f"\n{i+1}. {elem_type.upper()}")
                print(f"   ID: '{elem_id}'")
                print(f"   Name: '{elem_name}'")
                print(f"   Placeholder: '{elem_placeholder}'")
                print(f"   Class: '{elem_class}'")
                print(f"   Value: '{elem_value}'")
                print(f"   Required: '{elem_required}'")
                print(f"   Might be name field: {is_name_field}")
                print(f"   Might be country field: {is_country_field}")
                
                # If it's a select, show options
                if elem.tag_name == 'select':
                    try:
                        select = Select(elem)
                        options = [opt.text for opt in select.options[:5]]  # First 5 options
                        print(f"   Options: {options}")
                    except:
                        print(f"   Options: Error reading options")
                        
            except Exception as e:
                print(f"   Error analyzing element {i+1}: {e}")
        
        # Look specifically for "Legal First Name" and "Legal Last Name"
        print("\n🎯 Looking specifically for Legal First Name and Legal Last Name...")
        
        # Method 1: Look for text containing "Legal First Name"
        legal_first_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Legal First Name')]")
        print(f"Found {len(legal_first_elements)} elements containing 'Legal First Name'")
        
        for i, elem in enumerate(legal_first_elements):
            print(f"  {i+1}. Tag: {elem.tag_name}, Text: '{elem.text}'")
            # Look for nearby input
            try:
                parent = elem.find_element(By.XPATH, "./..")
                inputs = parent.find_elements(By.TAG_NAME, "input")
                print(f"     Found {len(inputs)} input(s) in parent")
            except:
                print(f"     Error finding parent inputs")
        
        # Method 2: Look for inputs with specific attributes
        name_inputs = driver.find_elements(By.XPATH, "//input[contains(@placeholder, 'Legal') or contains(@placeholder, 'legal')]")
        print(f"Found {len(name_inputs)} inputs with 'Legal' in placeholder")
        
        for i, elem in enumerate(name_inputs):
            placeholder = elem.get_attribute('placeholder')
            print(f"  {i+1}. Placeholder: '{placeholder}'")
        
        # Take a screenshot
        screenshot_path = f"debug_job_page_{int(time.time())}.png"
        driver.save_screenshot(screenshot_path)
        print(f"\n📸 Screenshot saved: {screenshot_path}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    debug_job_page()
