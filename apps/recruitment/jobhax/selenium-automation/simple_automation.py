#!/usr/bin/env python3
"""
Simple Job Application Automation
Bypasses browser-use cloud issues with direct Playwright implementation
"""

import json
import asyncio
import os
from datetime import datetime
from pathlib import Path
from playwright.async_api import async_playwright

def load_resume_data():
    """Load resume data from test_data.json"""
    try:
        with open('../data/test_data.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ test_data.json not found")
        return None

async def fill_form_field(page, field_name, value, field_type="text"):
    """Fill a form field with the given value"""
    try:
        # Try multiple selectors for different field types
        selectors = [
            f"input[name='{field_name}']",
            f"input[id='{field_name}']",
            f"input[placeholder*='{field_name}']",
            f"input[aria-label*='{field_name}']",
            f"select[name='{field_name}']",
            f"select[id='{field_name}']",
            f"textarea[name='{field_name}']",
            f"textarea[id='{field_name}']"
        ]
        
        for selector in selectors:
            try:
                element = await page.wait_for_selector(selector, timeout=2000)
                
                if field_type == "select":
                    await element.select_option(value)
                elif field_type == "textarea":
                    await element.fill(value)
                elif field_type == "file":
                    await element.set_input_files(value)
                else:
                    await element.fill(value)
                
                print(f"✅ Filled {field_name}: {value}")
                return True
            except:
                continue
        
        print(f"⚠️ Could not find field: {field_name}")
        return False
        
    except Exception as e:
        print(f"❌ Error filling {field_name}: {e}")
        return False

async def fill_radio_button(page, field_name, value):
    """Fill a radio button field"""
    try:
        selectors = [
            f"input[type='radio'][name='{field_name}'][value='{value}']",
            f"input[type='radio'][name='{field_name}']"
        ]
        
        for selector in selectors:
            try:
                elements = await page.query_selector_all(selector)
                for element in elements:
                    element_value = await element.get_attribute('value')
                    if value.lower() in element_value.lower():
                        await element.click()
                        print(f"✅ Selected radio {field_name}: {value}")
                        return True
            except:
                continue
        
        print(f"⚠️ Could not find radio field: {field_name}")
        return False
        
    except Exception as e:
        print(f"❌ Error selecting radio {field_name}: {e}")
        return False

async def fill_job_application(page, resume_data):
    """Fill out the job application form"""
    print("📝 Starting to fill job application form...")
    
    filled_fields = 0
    total_attempts = 0
    
    # Personal Information
    personal_info = resume_data.get('personal_info', {})
    personal_fields = [
        ('first_name', personal_info.get('first_name', ''), 'text'),
        ('last_name', personal_info.get('last_name', ''), 'text'),
        ('email', personal_info.get('email', ''), 'text'),
        ('phone', personal_info.get('phone', ''), 'text'),
        ('address', personal_info.get('address', {}).get('street', ''), 'text'),
        ('city', personal_info.get('address', {}).get('city', ''), 'text'),
        ('state', personal_info.get('address', {}).get('state', ''), 'text'),
        ('zip_code', str(personal_info.get('address', {}).get('zip_code', '')), 'text'),
        ('country', personal_info.get('address', {}).get('country', ''), 'select'),
    ]
    
    for field_name, value, field_type in personal_fields:
        if value:
            total_attempts += 1
            if await fill_form_field(page, field_name, value, field_type):
                filled_fields += 1
    
    # Professional Information
    professional_info = resume_data.get('professional_info', {})
    professional_fields = [
        ('current_title', professional_info.get('current_title', ''), 'text'),
        ('current_company', professional_info.get('current_company', ''), 'text'),
        ('linkedin_url', professional_info.get('linkedin_url', ''), 'text'),
        ('github_url', professional_info.get('github_url', ''), 'text'),
        ('portfolio_url', professional_info.get('portfolio_url', ''), 'text'),
    ]
    
    for field_name, value, field_type in professional_fields:
        if value:
            total_attempts += 1
            if await fill_form_field(page, field_name, value, field_type):
                filled_fields += 1
    
    # Experience dropdown
    years_experience = professional_info.get('years_experience', 5)
    total_attempts += 1
    if await fill_form_field(page, 'years_experience', f"{years_experience}+", 'select'):
        filled_fields += 1
    
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
        if await fill_radio_button(page, field_name, value):
            filled_fields += 1
    
    # Cover letter
    cover_letter = resume_data.get('additional_info', {}).get('cover_letter', '')
    if cover_letter:
        total_attempts += 1
        if await fill_form_field(page, 'cover_letter', cover_letter, 'textarea'):
            filled_fields += 1
    
    # Healthcare motivation
    healthcare_motivation = "I am drawn to healthcare because of the opportunity to make a meaningful impact on people's lives. With my technical background and passion for helping others, I believe I can contribute to improving healthcare systems and patient outcomes through innovative solutions."
    total_attempts += 1
    if await fill_form_field(page, 'healthcare_motivation', healthcare_motivation, 'textarea'):
        filled_fields += 1
    
    # File upload (resume)
    cv_path = os.path.abspath('../data/[REDACTED].pdf')
    if os.path.exists(cv_path):
        total_attempts += 1
        if await fill_form_field(page, 'resume', cv_path, 'file'):
            filled_fields += 1
    
    print(f"📊 Filled {filled_fields}/{total_attempts} fields")
    return filled_fields, total_attempts

async def find_and_click_next_button(page):
    """Find and click the next/submit button"""
    next_button_selectors = [
        "button:has-text('Next')",
        "button:has-text('Continue')",
        "button:has-text('Submit')",
        "input[type='submit']",
        "button[type='submit']",
        "button[class*='next']",
        "button[class*='submit']",
        "button[class*='continue']"
    ]
    
    for selector in next_button_selectors:
        try:
            button = await page.wait_for_selector(selector, timeout=2000)
            await button.click()
            print("✅ Clicked next/submit button")
            return True
        except:
            continue
    
    print("⚠️ Could not find next/submit button")
    return False

async def main():
    """Main function"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python simple_automation.py <job_application_url>")
        sys.exit(1)
    
    job_url = sys.argv[1]
    
    print("🤖 Simple Job Application Automation")
    print("=" * 40)
    print(f"🎯 Target URL: {job_url}")
    
    # Load resume data
    resume_data = load_resume_data()
    if not resume_data:
        sys.exit(1)
    
    print(f"👤 Applicant: {resume_data['personal_info']['first_name']} {resume_data['personal_info']['last_name']}")
    print(f"📧 Email: {resume_data['personal_info']['email']}")
    print("=" * 40)
    
    async with async_playwright() as p:
        try:
            # Launch browser
            print("🚀 Starting browser...")
            browser = await p.chromium.launch(headless=False)
            page = await browser.new_page()
            
            # Navigate to job application
            print(f"🌐 Navigating to: {job_url}")
            await page.goto(job_url)
            
            # Wait for page to load
            await page.wait_for_load_state('networkidle')
            
            # Fill out the form
            filled_fields, total_attempts = await fill_job_application(page, resume_data)
            
            # Take screenshot
            screenshot_path = f"job_application_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            await page.screenshot(path=screenshot_path)
            print(f"📸 Screenshot saved: {screenshot_path}")
            
            # Try to click next button
            if await find_and_click_next_button(page):
                print("✅ Successfully clicked next button")
                await page.wait_for_timeout(2000)
                
                # Take another screenshot after clicking next
                next_screenshot = f"job_application_next_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                await page.screenshot(path=next_screenshot)
                print(f"📸 Next page screenshot saved: {next_screenshot}")
            
            print(f"✅ Job application automation completed!")
            print(f"📊 Filled {filled_fields}/{total_attempts} fields")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
