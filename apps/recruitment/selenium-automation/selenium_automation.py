#!/usr/bin/env python3
"""
Selenium-based Job Application Automation
A more reliable alternative to browser-use
"""

import json
import time
import os
from datetime import datetime
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def load_resume_data():
    """Load resume data from test_data.json"""
    try:
        with open('../data/test_data.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ test_data.json not found")
        return None

def setup_driver():
    """Setup Chrome driver with appropriate options"""
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Uncomment for headless mode
    # chrome_options.add_argument("--headless")
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    return driver

def fill_text_field(driver, field_name, value, by_type=By.NAME):
    """Fill a text input field"""
    try:
        # Try multiple selectors
        selectors = [
            (By.NAME, field_name),
            (By.ID, field_name),
            (By.XPATH, f"//input[@name='{field_name}']"),
            (By.XPATH, f"//input[@id='{field_name}']"),
            (By.XPATH, f"//input[contains(@placeholder, '{field_name}')]"),
            (By.XPATH, f"//input[contains(@aria-label, '{field_name}')]")
        ]
        
        for by, selector in selectors:
            try:
                element = WebDriverWait(driver, 2).until(
                    EC.presence_of_element_located((by, selector))
                )
                element.clear()
                element.send_keys(value)
                print(f"✅ Filled {field_name}: {value}")
                return True
            except TimeoutException:
                continue
        
        print(f"⚠️ Could not find field: {field_name}")
        return False
        
    except Exception as e:
        print(f"❌ Error filling {field_name}: {e}")
        return False

def fill_select_field(driver, field_name, value):
    """Fill a select dropdown field"""
    try:
        # Try multiple selectors for select elements
        selectors = [
            (By.NAME, field_name),
            (By.ID, field_name),
            (By.XPATH, f"//select[@name='{field_name}']"),
            (By.XPATH, f"//select[@id='{field_name}']")
        ]
        
        for by, selector in selectors:
            try:
                element = WebDriverWait(driver, 2).until(
                    EC.presence_of_element_located((by, selector))
                )
                select = Select(element)
                
                # Try to select by visible text first
                try:
                    select.select_by_visible_text(value)
                    print(f"✅ Selected {field_name}: {value}")
                    return True
                except:
                    # Try partial text match
                    for option in select.options:
                        if value.lower() in option.text.lower():
                            select.select_by_visible_text(option.text)
                            print(f"✅ Selected {field_name}: {option.text}")
                            return True
                
            except TimeoutException:
                continue
        
        print(f"⚠️ Could not find select field: {field_name}")
        return False
        
    except Exception as e:
        print(f"❌ Error selecting {field_name}: {e}")
        return False

def fill_radio_button(driver, field_name, value):
    """Fill a radio button field"""
    try:
        # Try multiple approaches for radio buttons
        selectors = [
            f"//input[@type='radio' and @name='{field_name}' and @value='{value}']",
            f"//input[@type='radio' and @name='{field_name}' and contains(@value, '{value}')]",
            f"//input[@type='radio' and @name='{field_name}']",
            f"//input[@type='radio' and contains(@name, '{field_name}')]"
        ]
        
        for selector in selectors:
            try:
                elements = driver.find_elements(By.XPATH, selector)
                for element in elements:
                    if value.lower() in element.get_attribute('value').lower():
                        element.click()
                        print(f"✅ Selected radio {field_name}: {value}")
                        return True
            except:
                continue
        
        print(f"⚠️ Could not find radio field: {field_name}")
        return False
        
    except Exception as e:
        print(f"❌ Error selecting radio {field_name}: {e}")
        return False

def fill_textarea(driver, field_name, value):
    """Fill a textarea field"""
    try:
        selectors = [
            (By.NAME, field_name),
            (By.ID, field_name),
            (By.XPATH, f"//textarea[@name='{field_name}']"),
            (By.XPATH, f"//textarea[@id='{field_name}']")
        ]
        
        for by, selector in selectors:
            try:
                element = WebDriverWait(driver, 2).until(
                    EC.presence_of_element_located((by, selector))
                )
                element.clear()
                element.send_keys(value)
                print(f"✅ Filled textarea {field_name}")
                return True
            except TimeoutException:
                continue
        
        print(f"⚠️ Could not find textarea: {field_name}")
        return False
        
    except Exception as e:
        print(f"❌ Error filling textarea {field_name}: {e}")
        return False

def upload_file(driver, field_name, file_path):
    """Upload a file"""
    try:
        selectors = [
            (By.NAME, field_name),
            (By.ID, field_name),
            (By.XPATH, f"//input[@type='file' and @name='{field_name}']"),
            (By.XPATH, f"//input[@type='file' and @id='{field_name}']")
        ]
        
        for by, selector in selectors:
            try:
                element = WebDriverWait(driver, 2).until(
                    EC.presence_of_element_located((by, selector))
                )
                element.send_keys(file_path)
                print(f"✅ Uploaded file: {file_path}")
                return True
            except TimeoutException:
                continue
        
        print(f"⚠️ Could not find file upload field: {field_name}")
        return False
        
    except Exception as e:
        print(f"❌ Error uploading file {field_name}: {e}")
        return False

def fill_job_application(driver, resume_data):
    """Fill out the job application form"""
    print("📝 Starting to fill job application form...")
    
    filled_fields = 0
    total_attempts = 0
    
    # Personal Information
    personal_info = resume_data.get('personal_info', {})
    personal_fields = [
        ('first_name', personal_info.get('first_name', '')),
        ('last_name', personal_info.get('last_name', '')),
        ('email', personal_info.get('email', '')),
        ('phone', personal_info.get('phone', '')),
        ('address', personal_info.get('address', {}).get('street', '')),
        ('city', personal_info.get('address', {}).get('city', '')),
        ('state', personal_info.get('address', {}).get('state', '')),
        ('zip_code', str(personal_info.get('address', {}).get('zip_code', ''))),
        ('country', personal_info.get('address', {}).get('country', '')),
    ]
    
    for field_name, value in personal_fields:
        if value:
            total_attempts += 1
            if fill_text_field(driver, field_name, value):
                filled_fields += 1
    
    # Professional Information
    professional_info = resume_data.get('professional_info', {})
    professional_fields = [
        ('current_title', professional_info.get('current_title', '')),
        ('current_company', professional_info.get('current_company', '')),
        ('linkedin_url', professional_info.get('linkedin_url', '')),
        ('github_url', professional_info.get('github_url', '')),
        ('portfolio_url', professional_info.get('portfolio_url', '')),
    ]
    
    for field_name, value in professional_fields:
        if value:
            total_attempts += 1
            if fill_text_field(driver, field_name, value):
                filled_fields += 1
    
    # Experience dropdown
    years_experience = professional_info.get('years_experience', 5)
    if fill_select_field(driver, 'years_experience', f"{years_experience}+"):
        filled_fields += 1
        total_attempts += 1
    
    # Yes/No Questions
    yes_no_questions = [
        ('age_18', 'Yes'),
        ('work_authorization', 'Yes'),
        ('sponsorship', 'No'),
        ('professional_license', 'No'),
        ('disability', 'No'),
        ('veteran', 'No')
    ]
    
    for field_name, value in yes_no_questions:
        total_attempts += 1
        if fill_radio_button(driver, field_name, value):
            filled_fields += 1
    
    # Cover letter
    cover_letter = resume_data.get('additional_info', {}).get('cover_letter', '')
    if cover_letter:
        total_attempts += 1
        if fill_textarea(driver, 'cover_letter', cover_letter):
            filled_fields += 1
    
    # Healthcare motivation
    healthcare_motivation = "I am drawn to healthcare because of the opportunity to make a meaningful impact on people's lives. With my technical background and passion for helping others, I believe I can contribute to improving healthcare systems and patient outcomes through innovative solutions."
    total_attempts += 1
    if fill_textarea(driver, 'healthcare_motivation', healthcare_motivation):
        filled_fields += 1
    
    # File upload (resume)
    cv_path = os.path.abspath('../data/[REDACTED].pdf')
    if os.path.exists(cv_path):
        total_attempts += 1
        if upload_file(driver, 'resume', cv_path):
            filled_fields += 1
    
    print(f"📊 Filled {filled_fields}/{total_attempts} fields")
    return filled_fields, total_attempts

def find_and_click_next_button(driver):
    """Find and click the next/submit button"""
    next_button_selectors = [
        "//button[contains(text(), 'Next')]",
        "//button[contains(text(), 'Continue')]",
        "//button[contains(text(), 'Submit')]",
        "//input[@type='submit']",
        "//button[@type='submit']",
        "//button[contains(@class, 'next')]",
        "//button[contains(@class, 'submit')]",
        "//button[contains(@class, 'continue')]"
    ]
    
    for selector in next_button_selectors:
        try:
            button = WebDriverWait(driver, 2).until(
                EC.element_to_be_clickable((By.XPATH, selector))
            )
            button.click()
            print("✅ Clicked next/submit button")
            return True
        except TimeoutException:
            continue
    
    print("⚠️ Could not find next/submit button")
    return False

def main():
    """Main function"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python selenium_automation.py <job_application_url>")
        sys.exit(1)
    
    job_url = sys.argv[1]
    
    print("🤖 Selenium Job Application Automation")
    print("=" * 40)
    print(f"🎯 Target URL: {job_url}")
    
    # Load resume data
    resume_data = load_resume_data()
    if not resume_data:
        sys.exit(1)
    
    print(f"👤 Applicant: {resume_data['personal_info']['first_name']} {resume_data['personal_info']['last_name']}")
    print(f"📧 Email: {resume_data['personal_info']['email']}")
    print("=" * 40)
    
    driver = None
    try:
        # Setup driver
        print("🚀 Setting up browser...")
        driver = setup_driver()
        
        # Navigate to job application
        print(f"🌐 Navigating to: {job_url}")
        driver.get(job_url)
        
        # Wait for page to load
        time.sleep(3)
        
        # Fill out the form
        filled_fields, total_attempts = fill_job_application(driver, resume_data)
        
        # Take screenshot
        screenshot_path = f"job_application_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        driver.save_screenshot(screenshot_path)
        print(f"📸 Screenshot saved: {screenshot_path}")
        
        # Try to click next button
        if find_and_click_next_button(driver):
            print("✅ Successfully clicked next button")
            time.sleep(2)
            
            # Take another screenshot after clicking next
            next_screenshot = f"job_application_next_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            driver.save_screenshot(next_screenshot)
            print(f"📸 Next page screenshot saved: {next_screenshot}")
        
        print(f"✅ Job application automation completed!")
        print(f"📊 Filled {filled_fields}/{total_attempts} fields")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        
    finally:
        if driver:
            print("🔄 Closing browser...")
            driver.quit()

if __name__ == "__main__":
    main()
