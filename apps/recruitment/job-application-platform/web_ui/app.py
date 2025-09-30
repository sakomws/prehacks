#!/usr/bin/env python3
"""
JobHax Web UI - Flask application for job application interface.
Fixed version without signal handling issues.
"""

import os
import sys
import asyncio
import threading
import time
from pathlib import Path
from flask import Flask, render_template, jsonify, request
import logging
import openai
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from core.config import Config
from utils.data_loader import DataLoader
from utils.browser_manager import BrowserManager
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

# OpenAI configuration
openai.api_key = os.getenv('OPENAI_API_KEY')
if not openai.api_key:
    print("⚠️ Warning: OPENAI_API_KEY not found. LLM features will be disabled.")

# Job data
JOBS = [
    {
        "id": "job_1",
        "title": "Hollister Co. - Assistant Manager, Santa Anita",
        "company": "Abercrombie & Fitch Co.",
        "location": "Santa Anita, CA",
        "url": "https://jobs.smartrecruiters.com/AbercrombieAndFitchCo/744000081085955-hollister-co-assistant-manager-santa-anita",
        "description": "Retail management position at Hollister Co. in Santa Anita. Leadership role in fashion retail environment.",
        "type": "Retail Management",
        "posted": "2 days ago"
    },
    {
        "id": "job_2", 
        "title": "LPN Staff I - Long Term Care",
        "company": "Rochester Regional Health",
        "location": "Newark, NY 14513",
        "url": "https://apply.appcast.io/jobs/50590620606/applyboard/apply",
        "description": "Licensed Practical Nurse position in long-term care facility. Part-time position with evening shifts.",
        "type": "Healthcare",
        "posted": "22 days ago"
    }
]

# Global variables for application status
application_status = {
    "job_1": {"status": "ready", "message": "Ready to apply"},
    "job_2": {"status": "ready", "message": "Ready to apply"}
}

def analyze_form_with_llm(browser_manager, user_data):
    """Use OpenAI LLM to analyze the page and find all form fields."""
    if not openai.api_key:
        print("⚠️ OpenAI API key not found, skipping LLM analysis")
        return []
    
    try:
        # Get page source
        page_source = browser_manager.driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        
        # Extract form information
        forms = soup.find_all('form')
        form_elements = []
        
        for form in forms:
            inputs = form.find_all(['input', 'select', 'textarea'])
            for element in inputs:
                element_info = {
                    'tag': element.name,
                    'type': element.get('type', 'text'),
                    'name': element.get('name', ''),
                    'id': element.get('id', ''),
                    'placeholder': element.get('placeholder', ''),
                    'class': ' '.join(element.get('class', [])),
                    'required': element.has_attr('required'),
                    'value': element.get('value', ''),
                    'text_content': element.get_text(strip=True)
                }
                form_elements.append(element_info)
        
        # Create prompt for OpenAI
        prompt = f"""
        Analyze this job application form and identify all fields that need to be filled with user data.
        
        User Data Available:
        - Name: {user_data.personal_info.first_name} {user_data.personal_info.last_name}
        - Email: {user_data.personal_info.email}
        - Phone: {user_data.personal_info.phone}
        - Address: {user_data.personal_info.address.street}, {user_data.personal_info.address.city}, {user_data.personal_info.address.state} {user_data.personal_info.address.zip_code}
        - LinkedIn: {user_data.professional_info.linkedin_url}
        - Current Title: {user_data.professional_info.current_title}
        - Current Company: {user_data.professional_info.current_company}
        - Years Experience: {user_data.professional_info.years_experience}
        - Cover Letter: {user_data.professional_info.cover_letter[:200]}...
        
        Form Elements Found:
        {json.dumps(form_elements, indent=2)}
        
        For each form element, determine:
        1. What field it represents (email, first_name, last_name, phone, address, etc.)
        2. What value should be filled
        3. The best selector to target this element
        
        Return a JSON array of field mappings in this format:
        [
            {{
                "field_type": "email",
                "value": "user@example.com",
                "selectors": ["//input[@name='email']", "//input[@type='email']"],
                "element_info": {{"name": "email", "type": "email"}}
            }}
        ]
        
        Be comprehensive and include ALL form fields, even if they seem optional.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.1
        )
        
        llm_analysis = json.loads(response.choices[0].message.content)
        print(f"🤖 LLM found {len(llm_analysis)} form fields")
        
        return llm_analysis
        
    except Exception as e:
        print(f"❌ LLM analysis failed: {e}")
        return []

def fill_form_with_llm_analysis(browser_manager, llm_analysis, user_data):
    """Fill form fields based on LLM analysis."""
    filled_count = 0
    results = {}
    
    for field_info in llm_analysis:
        field_type = field_info.get('field_type')
        value = field_info.get('value')
        selectors = field_info.get('selectors', [])
        
        if not value or not selectors:
            continue
            
        # Try each selector until one works
        filled = False
        for selector in selectors:
            try:
                element = browser_manager.find_element(selector, "xpath")
                if element:
                    if field_type == 'resume' and element.tag_name == 'input' and element.get_attribute('type') == 'file':
                        # Handle file upload
                        element.send_keys(str(Path(__file__).parent.parent / "data" / "[REDACTED].pdf"))
                        filled = True
                        break
                    elif element.tag_name == 'select':
                        # Handle dropdown
                        select = Select(element)
                        try:
                            select.select_by_visible_text(value)
                            filled = True
                            break
                        except:
                            try:
                                select.select_by_value(value)
                                filled = True
                                break
                            except:
                                pass
                    else:
                        # Handle text input
                        element.clear()
                        element.send_keys(value)
                        filled = True
                        break
            except Exception as e:
                continue
        
        if filled:
            filled_count += 1
            results[field_type] = 'filled'
            print(f"✅ LLM filled {field_type}: {value}")
        else:
            results[field_type] = 'failed'
            print(f"❌ LLM failed to fill {field_type}")
    
    return filled_count, results

def apply_to_job_async(job_id, job_url):
    """Apply to a job asynchronously."""
    global application_status
    
    try:
        application_status[job_id] = {"status": "applying", "message": "Applying to job..."}
        
        # Set timeout for the entire operation (5 minutes)
        start_time = time.time()
        timeout_seconds = 300  # 5 minutes
        
        # Load user data
        data_loader = DataLoader()
        # Get the correct path to test_data.json (parent directory)
        data_path = Path(__file__).parent.parent / "data" / "test_data.json"
        user_data = data_loader.load_user_data(str(data_path))
        
        # Initialize browser with timeout settings
        browser_manager = BrowserManager(headless=True)
        
        if not browser_manager.navigate_to(job_url):
            application_status[job_id] = {"status": "error", "message": "Failed to navigate to job page"}
            return
        
        # Wait for page to load with timeout
        print(f"🌐 Navigating to: {job_url}")
        time.sleep(2)  # Reduced wait time
        
        # Check timeout
        if time.time() - start_time > timeout_seconds:
            raise TimeoutError("Application timed out during navigation")
        
        # Look for and click "I'm Interested" or "Apply Now" button first
        print("🔍 Looking for 'I'm Interested' or 'Apply Now' button...")
        interest_button_selectors = [
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'i\'m interested')]",
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'im interested')]",
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'interested')]",
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply now')]",
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply')]",
            "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'i\'m interested')]",
            "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'im interested')]",
            "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'interested')]",
            "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply now')]",
            "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply')]",
            "//button[contains(@class, 'apply')]",
            "//button[contains(@class, 'interested')]",
            "//a[contains(@class, 'apply')]",
            "//a[contains(@class, 'interested')]",
            "//button[contains(@id, 'apply')]",
            "//button[contains(@id, 'interested')]",
            "//a[contains(@id, 'apply')]",
            "//a[contains(@id, 'interested')]"
        ]
        
        interest_button_clicked = False
        for i, selector in enumerate(interest_button_selectors):
            try:
                element = browser_manager.find_element(selector, "xpath")
                if element:
                    button_text = browser_manager.get_element_text(element) or browser_manager.get_element_attribute(element, "value") or "No text"
                    print(f"✅ Found interest button with selector {i+1}: '{selector}' - Text: '{button_text}'")
                    browser_manager.click_element(element)
                    interest_button_clicked = True
                    print("✅ Clicked interest/apply button")
                    time.sleep(3)  # Wait for form to load
                    break
            except Exception as e:
                continue
        
        if not interest_button_clicked:
            print("⚠️ No interest/apply button found, proceeding with form filling...")
        
        # Take screenshot
        screenshot = browser_manager.take_screenshot(f"job_{job_id}_application.png")
        print(f"📸 Initial page screenshot saved: {screenshot}")
        
        # Comprehensive form field detection and filling
        print("📝 Detecting and filling all form fields...")
        
        # Define field mappings with multiple selectors for each field type
        field_mappings = {
            'email': {
                'value': user_data.personal_info.email,
                'selectors': [
                    "//input[@type='email']",
                    "//input[@name='email']",
                    "//input[@name='emailAddress']",
                    "//input[@name='user_email']",
                    "//input[contains(@placeholder, 'email') or contains(@placeholder, 'Email')]",
                    "//input[contains(@id, 'email')]",
                    # SmartRecruiters specific
                    "//input[contains(@class, 'email')]",
                    "//input[contains(@data-testid, 'email')]",
                    "//input[contains(@aria-label, 'email')]"
                ]
            },
            'phone': {
                'value': user_data.personal_info.phone,
                'selectors': [
                    "//input[@type='tel']",
                    "//input[@name='phone']",
                    "//input[@name='phoneNumber']",
                    "//input[@name='mobile']",
                    "//input[@name='telephone']",
                    "//input[contains(@placeholder, 'phone') or contains(@placeholder, 'Phone')]",
                    "//input[contains(@id, 'phone')]"
                ]
            },
            'first_name': {
                'value': user_data.personal_info.first_name,
                'selectors': [
                    "//input[@name='firstName']",
                    "//input[@name='first_name']",
                    "//input[@name='fname']",
                    "//input[@name='givenName']",
                    "//input[contains(@placeholder, 'first') or contains(@placeholder, 'First')]",
                    "//input[contains(@id, 'first')]",
                    # SmartRecruiters specific
                    "//input[contains(@class, 'first')]",
                    "//input[contains(@data-testid, 'first')]",
                    "//input[contains(@aria-label, 'first')]",
                    # Rochester Regional Health specific
                    "//input[contains(@placeholder, 'Legal First Name')]",
                    "//input[contains(@placeholder, 'legal first name')]"
                ]
            },
            'last_name': {
                'value': user_data.personal_info.last_name,
                'selectors': [
                    "//input[@name='lastName']",
                    "//input[@name='last_name']",
                    "//input[@name='lname']",
                    "//input[@name='surname']",
                    "//input[contains(@placeholder, 'last') or contains(@placeholder, 'Last')]",
                    "//input[contains(@id, 'last')]",
                    # SmartRecruiters specific
                    "//input[contains(@class, 'last')]",
                    "//input[contains(@data-testid, 'last')]",
                    "//input[contains(@aria-label, 'last')]",
                    # Rochester Regional Health specific
                    "//input[contains(@placeholder, 'Legal Last Name')]",
                    "//input[contains(@placeholder, 'legal last name')]"
                ]
            },
            'address': {
                'value': user_data.personal_info.address.street,
                'selectors': [
                    "//input[@name='address']",
                    "//input[@name='street']",
                    "//input[@name='streetAddress']",
                    "//input[contains(@placeholder, 'address') or contains(@placeholder, 'Address')]",
                    "//input[contains(@id, 'address')]"
                ]
            },
            'city': {
                'value': user_data.personal_info.address.city,
                'selectors': [
                    "//input[@name='city']",
                    "//input[contains(@placeholder, 'city') or contains(@placeholder, 'City')]",
                    "//input[contains(@id, 'city')]"
                ]
            },
            'state': {
                'value': user_data.personal_info.address.state,
                'selectors': [
                    "//input[@name='state']",
                    "//input[@name='province']",
                    "//select[@name='state']",
                    "//input[contains(@placeholder, 'state') or contains(@placeholder, 'State')]",
                    "//input[contains(@id, 'state')]"
                ]
            },
            'zip_code': {
                'value': user_data.personal_info.address.zip_code,
                'selectors': [
                    "//input[@name='zip']",
                    "//input[@name='zipCode']",
                    "//input[@name='postal']",
                    "//input[@name='postalCode']",
                    "//input[contains(@placeholder, 'zip') or contains(@placeholder, 'ZIP')]",
                    "//input[contains(@id, 'zip')]"
                ]
            },
            'country': {
                'value': user_data.personal_info.address.country,
                'selectors': [
                    "//input[@name='country']",
                    "//select[@name='country']",
                    "//input[contains(@placeholder, 'country') or contains(@placeholder, 'Country')]",
                    "//input[contains(@id, 'country')]"
                ]
            },
            'linkedin': {
                'value': user_data.professional_info.linkedin_url,
                'selectors': [
                    "//input[@name='linkedin']",
                    "//input[@name='linkedIn']",
                    "//input[contains(@placeholder, 'linkedin') or contains(@placeholder, 'LinkedIn')]",
                    "//input[contains(@id, 'linkedin')]"
                ]
            },
            'website': {
                'value': user_data.professional_info.portfolio_url or user_data.professional_info.github_url or "",
                'selectors': [
                    "//input[@name='website']",
                    "//input[@name='portfolio']",
                    "//input[@name='personalWebsite']",
                    "//input[contains(@placeholder, 'website') or contains(@placeholder, 'Website')]",
                    "//input[contains(@id, 'website')]"
                ]
            },
            'current_title': {
                'value': user_data.professional_info.current_title,
                'selectors': [
                    "//input[@name='currentTitle']",
                    "//input[@name='current_position']",
                    "//input[@name='jobTitle']",
                    "//input[contains(@placeholder, 'title') or contains(@placeholder, 'Title')]",
                    "//input[contains(@id, 'title')]"
                ]
            },
            'current_company': {
                'value': user_data.professional_info.current_company,
                'selectors': [
                    "//input[@name='currentCompany']",
                    "//input[@name='current_company']",
                    "//input[@name='employer']",
                    "//input[contains(@placeholder, 'company') or contains(@placeholder, 'Company')]",
                    "//input[contains(@id, 'company')]"
                ]
            },
            'years_experience': {
                'value': str(user_data.professional_info.years_experience),
                'selectors': [
                    "//input[@name='experience']",
                    "//input[@name='yearsExperience']",
                    "//input[@name='years_of_experience']",
                    "//select[@name='experience']",
                    "//input[contains(@placeholder, 'experience') or contains(@placeholder, 'Experience')]",
                    "//input[contains(@id, 'experience')]"
                ]
            }
        }
        
        # Fill all detected fields
        filled_fields = []
        for field_name, field_info in field_mappings.items():
            for selector in field_info['selectors']:
                try:
                    element = browser_manager.find_element(selector, "xpath")
                    if element:
                        # Check if it's a select dropdown
                        if element.tag_name == 'select':
                            # For select elements, try to find and select the option
                            options = browser_manager.find_elements(f"{selector}/option", "xpath")
                            for option in options:
                                if field_info['value'].lower() in option.text.lower():
                                    option.click()
                                    filled_fields.append(field_name)
                                    print(f"✅ {field_name} selected: {option.text}")
                                    break
                        else:
                            # For input elements, fill the value
                            browser_manager.fill_input(element, field_info['value'])
                            filled_fields.append(field_name)
                            print(f"✅ {field_name} filled: {field_info['value']}")
                        break
                except Exception as e:
                    continue
        
        # Also look for textarea fields (cover letters, additional info, etc.)
        textarea_fields = [
            "//textarea[@name='coverLetter']",
            "//textarea[@name='cover_letter']",
            "//textarea[@name='additionalInfo']",
            "//textarea[@name='additional_info']",
            "//textarea[@name='comments']",
            "//textarea[@name='message']",
            "//textarea[@name='notes']",
            "//textarea[contains(@placeholder, 'cover') or contains(@placeholder, 'Cover')]",
            "//textarea[contains(@placeholder, 'additional') or contains(@placeholder, 'Additional')]",
            "//textarea[contains(@placeholder, 'message') or contains(@placeholder, 'Message')]"
        ]
        
        for textarea_selector in textarea_fields:
            try:
                element = browser_manager.find_element(textarea_selector, "xpath")
                if element:
                    # Fill with a generic cover letter or additional info
                    cover_letter_text = f"I am excited to apply for this position. With my experience in {user_data.professional_info.current_title} and {user_data.professional_info.years_experience} years of experience, I believe I would be a great fit for this role. Please find my resume attached for your review."
                    browser_manager.fill_input(element, cover_letter_text)
                    filled_fields.append("cover_letter")
                    print(f"✅ Cover letter/additional info filled")
                    break
            except Exception as e:
                continue
        
        # Look for file upload fields (resume, CV, etc.)
        file_upload_fields = [
            "//input[@type='file' and contains(@name, 'resume')]",
            "//input[@type='file' and contains(@name, 'cv')]",
            "//input[@type='file' and contains(@name, 'document')]",
            "//input[@type='file' and contains(@accept, 'pdf')]",
            "//input[@type='file' and contains(@accept, 'doc')]"
        ]
        
        for file_selector in file_upload_fields:
            try:
                element = browser_manager.find_element(file_selector, "xpath")
                if element:
                    # Try to upload the [REDACTED].pdf file
                    pdf_path = str(Path(__file__).parent.parent / "data" / "[REDACTED].pdf")
                    if Path(pdf_path).exists():
                        element.send_keys(pdf_path)
                        filled_fields.append("resume_upload")
                        print(f"✅ Resume file uploaded: [REDACTED].pdf")
                    break
            except Exception as e:
                continue
        
        print(f"📊 Traditional method filled: {len(filled_fields)} - {', '.join(filled_fields)}")
        
        # Enhanced field detection for specific form patterns
        print("🔍 Using enhanced field detection for specific form patterns...")
        
        # Try to find fields by looking for labels and nearby inputs
        enhanced_selectors = {
            'first_name': [
                "//input[contains(@placeholder, 'Legal First Name')]",
                "//input[contains(@placeholder, 'legal first name')]",
                "//input[contains(@placeholder, 'First Name')]",
                "//input[contains(@placeholder, 'first name')]",
                "//label[contains(text(), 'Legal First Name')]/following-sibling::input",
                "//label[contains(text(), 'Legal First Name')]/../input",
                "//label[contains(text(), 'First Name')]/following-sibling::input",
                "//label[contains(text(), 'First Name')]/../input",
                "//div[contains(text(), 'Legal First Name')]/following-sibling::input",
                "//div[contains(text(), 'First Name')]/following-sibling::input",
                "//span[contains(text(), 'Legal First Name')]/following-sibling::input",
                "//span[contains(text(), 'First Name')]/following-sibling::input"
            ],
            'last_name': [
                "//input[contains(@placeholder, 'Legal Last Name')]",
                "//input[contains(@placeholder, 'legal last name')]",
                "//input[contains(@placeholder, 'Last Name')]",
                "//input[contains(@placeholder, 'last name')]",
                "//label[contains(text(), 'Legal Last Name')]/following-sibling::input",
                "//label[contains(text(), 'Legal Last Name')]/../input",
                "//label[contains(text(), 'Last Name')]/following-sibling::input",
                "//label[contains(text(), 'Last Name')]/../input",
                "//div[contains(text(), 'Legal Last Name')]/following-sibling::input",
                "//div[contains(text(), 'Last Name')]/following-sibling::input",
                "//span[contains(text(), 'Legal Last Name')]/following-sibling::input",
                "//span[contains(text(), 'Last Name')]/following-sibling::input"
            ],
            'country': [
                "//select[contains(@placeholder, 'Country')]",
                "//select[contains(@placeholder, 'country')]",
                "//select[contains(@name, 'country')]",
                "//select[contains(@id, 'country')]",
                "//label[contains(text(), 'Country')]/following-sibling::select",
                "//label[contains(text(), 'Country')]/../select",
                "//div[contains(text(), 'Country')]/following-sibling::select",
                "//div[contains(text(), 'Country')]/../select",
                "//span[contains(text(), 'Country')]/following-sibling::select",
                "//span[contains(text(), 'Country')]/../select",
                "//input[contains(@placeholder, 'Country')]",
                "//input[contains(@placeholder, 'country')]",
                "//input[contains(@name, 'country')]",
                "//input[contains(@id, 'country')]"
            ]
        }
        
        # Try enhanced selectors for name fields
        for field_type, selectors in enhanced_selectors.items():
            if field_type not in [f.replace('llm_', '') for f in filled_fields]:
                for selector in selectors:
                    try:
                        element = browser_manager.find_element(selector, "xpath")
                        if element:
                            if field_type == 'first_name':
                                value = user_data.personal_info.first_name
                            elif field_type == 'last_name':
                                value = user_data.personal_info.last_name
                            elif field_type == 'country':
                                value = user_data.personal_info.address.country
                            
                            if element.tag_name == 'select':
                                # Handle dropdown selection
                                select = Select(element)
                                try:
                                    select.select_by_visible_text(value)
                                except:
                                    try:
                                        select.select_by_value(value)
                                    except:
                                        # Try partial match
                                        for option in select.options:
                                            if value.lower() in option.text.lower():
                                                select.select_by_visible_text(option.text)
                                                break
                            else:
                                # Handle text input
                                element.clear()
                                element.send_keys(value)
                            
                            filled_fields.append(f"enhanced_{field_type}")
                            print(f"✅ Enhanced detection filled {field_type}: {value}")
                            break
                    except Exception as e:
                        continue
        
        # Aggressive field detection - look for specific problematic fields first
        print("🎯 Using aggressive field detection for Legal First Name, Legal Last Name, and Country...")
        
        # Try to find Legal First Name and Legal Last Name by looking for text patterns
        try:
            # Look for any element containing "Legal First Name" text and find nearby input
            legal_first_elements = browser_manager.driver.find_elements(By.XPATH, "//*[contains(text(), 'Legal First Name') or contains(text(), 'legal first name')]")
            for element in legal_first_elements:
                # Look for input in the same container or nearby - try multiple approaches
                try:
                    # Method 1: Look in parent
                    parent = element.find_element(By.XPATH, "./..")
                    inputs = parent.find_elements(By.TAG_NAME, "input")
                    if inputs:
                        inputs[0].clear()
                        inputs[0].send_keys(user_data.personal_info.first_name)
                        filled_fields.append("aggressive_first_name")
                        print(f"✅ Aggressive detection filled Legal First Name: {user_data.personal_info.first_name}")
                        break
                except:
                    pass
                
                try:
                    # Method 2: Look in grandparent
                    grandparent = element.find_element(By.XPATH, "./../..")
                    inputs = grandparent.find_elements(By.TAG_NAME, "input")
                    if inputs:
                        inputs[0].clear()
                        inputs[0].send_keys(user_data.personal_info.first_name)
                        filled_fields.append("aggressive_first_name")
                        print(f"✅ Aggressive detection filled Legal First Name: {user_data.personal_info.first_name}")
                        break
                except:
                    pass
                
                try:
                    # Method 3: Look for next sibling input
                    next_input = element.find_element(By.XPATH, "./following-sibling::input")
                    next_input.clear()
                    next_input.send_keys(user_data.personal_info.first_name)
                    filled_fields.append("aggressive_first_name")
                    print(f"✅ Aggressive detection filled Legal First Name: {user_data.personal_info.first_name}")
                    break
                except:
                    pass
            
            # Look for any element containing "Legal Last Name" text and find nearby input
            legal_last_elements = browser_manager.driver.find_elements(By.XPATH, "//*[contains(text(), 'Legal Last Name') or contains(text(), 'legal last name')]")
            for element in legal_last_elements:
                # Look for input in the same container or nearby - try multiple approaches
                try:
                    # Method 1: Look in parent
                    parent = element.find_element(By.XPATH, "./..")
                    inputs = parent.find_elements(By.TAG_NAME, "input")
                    if inputs:
                        inputs[0].clear()
                        inputs[0].send_keys(user_data.personal_info.last_name)
                        filled_fields.append("aggressive_last_name")
                        print(f"✅ Aggressive detection filled Legal Last Name: {user_data.personal_info.last_name}")
                        break
                except:
                    pass
                
                try:
                    # Method 2: Look in grandparent
                    grandparent = element.find_element(By.XPATH, "./../..")
                    inputs = grandparent.find_elements(By.TAG_NAME, "input")
                    if inputs:
                        inputs[0].clear()
                        inputs[0].send_keys(user_data.personal_info.last_name)
                        filled_fields.append("aggressive_last_name")
                        print(f"✅ Aggressive detection filled Legal Last Name: {user_data.personal_info.last_name}")
                        break
                except:
                    pass
                
                try:
                    # Method 3: Look for next sibling input
                    next_input = element.find_element(By.XPATH, "./following-sibling::input")
                    next_input.clear()
                    next_input.send_keys(user_data.personal_info.last_name)
                    filled_fields.append("aggressive_last_name")
                    print(f"✅ Aggressive detection filled Legal Last Name: {user_data.personal_info.last_name}")
                    break
                except:
                    pass
            
            # Look for Country field
            country_elements = browser_manager.driver.find_elements(By.XPATH, "//*[contains(text(), 'Country') or contains(text(), 'country')]")
            for element in country_elements:
                # Look for select or input in the same container or nearby
                parent = element.find_element(By.XPATH, "./..")
                selects = parent.find_elements(By.TAG_NAME, "select")
                inputs = parent.find_elements(By.TAG_NAME, "input")
                
                if selects:
                    select = Select(selects[0])
                    try:
                        select.select_by_visible_text(user_data.personal_info.address.country)
                        filled_fields.append("aggressive_country")
                        print(f"✅ Aggressive detection filled Country: {user_data.personal_info.address.country}")
                        break
                    except:
                        # Try partial match
                        for option in select.options:
                            if user_data.personal_info.address.country.lower() in option.text.lower():
                                select.select_by_visible_text(option.text)
                                filled_fields.append("aggressive_country")
                                print(f"✅ Aggressive detection filled Country: {option.text}")
                                break
                elif inputs:
                    inputs[0].clear()
                    inputs[0].send_keys(user_data.personal_info.address.country)
                    filled_fields.append("aggressive_country")
                    print(f"✅ Aggressive detection filled Country: {user_data.personal_info.address.country}")
                    break
                    
        except Exception as e:
            print(f"❌ Aggressive field detection failed: {e}")
        
        # Even more aggressive approach - look for any input that might be these fields
        print("🔍 Using ultra-aggressive field detection...")
        
        try:
            # Get all inputs and check their attributes more thoroughly
            all_inputs = browser_manager.driver.find_elements(By.TAG_NAME, "input")
            
            for input_elem in all_inputs:
                try:
                    if not input_elem.is_displayed():
                        continue
                    
                    # Get all possible attributes
                    attrs = {
                        'id': input_elem.get_attribute('id') or '',
                        'name': input_elem.get_attribute('name') or '',
                        'placeholder': input_elem.get_attribute('placeholder') or '',
                        'class': input_elem.get_attribute('class') or '',
                        'aria-label': input_elem.get_attribute('aria-label') or '',
                        'title': input_elem.get_attribute('title') or ''
                    }
                    
                    # Combine all attributes for matching
                    combined_text = ' '.join(attrs.values()).lower()
                    
                    # Check for Legal First Name
                    if any(keyword in combined_text for keyword in ['legal first', 'first name', 'firstname', 'fname']) and 'first' not in [f.replace('aggressive_', '').replace('enhanced_', '').replace('llm_', '') for f in filled_fields]:
                        input_elem.clear()
                        input_elem.send_keys(user_data.personal_info.first_name)
                        filled_fields.append("ultra_aggressive_first_name")
                        print(f"✅ Ultra-aggressive detection filled Legal First Name: {user_data.personal_info.first_name}")
                    
                    # Check for Legal Last Name
                    elif any(keyword in combined_text for keyword in ['legal last', 'last name', 'lastname', 'lname']) and 'last' not in [f.replace('aggressive_', '').replace('enhanced_', '').replace('llm_', '') for f in filled_fields]:
                        input_elem.clear()
                        input_elem.send_keys(user_data.personal_info.last_name)
                        filled_fields.append("ultra_aggressive_last_name")
                        print(f"✅ Ultra-aggressive detection filled Legal Last Name: {user_data.personal_info.last_name}")
                    
                    # Check for Country
                    elif any(keyword in combined_text for keyword in ['country', 'nation']) and 'country' not in [f.replace('aggressive_', '').replace('enhanced_', '').replace('llm_', '') for f in filled_fields]:
                        if input_elem.tag_name == 'select':
                            select = Select(input_elem)
                            try:
                                select.select_by_visible_text(user_data.personal_info.address.country)
                            except:
                                # Try partial match
                                for option in select.options:
                                    if user_data.personal_info.address.country.lower() in option.text.lower():
                                        select.select_by_visible_text(option.text)
                                        break
                        else:
                            input_elem.clear()
                            input_elem.send_keys(user_data.personal_info.address.country)
                        filled_fields.append("ultra_aggressive_country")
                        print(f"✅ Ultra-aggressive detection filled Country: {user_data.personal_info.address.country}")
                        
                except Exception as e:
                    continue
                    
        except Exception as e:
            print(f"❌ Ultra-aggressive field detection failed: {e}")
        
        # Angular Material specific detection - TARGETED APPROACH
        print("🅰️ Using TARGETED Angular Material field detection...")
        
        try:
            # Fill the 6 text inputs in order
            mat_inputs = browser_manager.driver.find_elements(By.XPATH, "//input[contains(@class, 'mat-mdc-autocomplete-trigger')]")
            print(f"🔍 Found {len(mat_inputs)} Angular Material inputs")
            
            # Based on debug output, fill in this specific order:
            input_data = [
                user_data.personal_info.first_name,  # 1. First name
                user_data.personal_info.last_name,   # 2. Last name  
                user_data.personal_info.email,       # 3. Email
                user_data.personal_info.phone,       # 4. Phone
                user_data.personal_info.address.street,  # 5. Address
                user_data.personal_info.address.city     # 6. City
            ]
            
            for i, input_elem in enumerate(mat_inputs):
                if i < len(input_data) and input_data[i]:
                    try:
                        if input_elem.is_displayed():
                            input_elem.clear()
                            input_elem.send_keys(input_data[i])
                            field_names = ['first_name', 'last_name', 'email', 'phone', 'address', 'city']
                            filled_fields.append(f"targeted_input_{field_names[i]}")
                            print(f"✅ Targeted Angular Material filled {field_names[i]}: {input_data[i]}")
                    except Exception as e:
                        print(f"❌ Error filling input {i}: {e}")
            
            # Fill the 6 select dropdowns in order
            mat_selects = browser_manager.driver.find_elements(By.XPATH, "//select[contains(@class, 'universal-apply')]")
            print(f"🔍 Found {len(mat_selects)} Angular Material selects")
            
            # Based on debug output, fill in this specific order:
            select_data = [
                "United States",  # 1. Country
                "8+ years",       # 2. Experience  
                "Male",           # 3. Gender
                "White (Not Hispanic or Latino) (United States of America)",  # 4. Race
                "I AM NOT A VETERAN",  # 5. Veteran status
                "09/27/2025"      # 6. Date (today's date)
            ]
            
            for i, select_elem in enumerate(mat_selects):
                if i < len(select_data):
                    try:
                        if select_elem.is_displayed():
                            select = Select(select_elem)
                            select.select_by_visible_text(select_data[i])
                            field_names = ['country', 'experience', 'gender', 'race', 'veteran', 'date']
                            filled_fields.append(f"targeted_select_{field_names[i]}")
                            print(f"✅ Targeted Angular Material filled {field_names[i]}: {select_data[i]}")
                    except Exception as e:
                        print(f"❌ Error filling select {i}: {e}")
            
            # Fill the textarea
            mat_textareas = browser_manager.driver.find_elements(By.XPATH, "//textarea")
            print(f"🔍 Found {len(mat_textareas)} textareas")
            
            healthcare_text = "I am deeply motivated by the opportunity to improve lives through technology, secure systems, and innovation. Healthcare offers a chance to apply my skills in AI, security, and platform engineering to ensure reliability, safety, and efficiency for patients and providers."
            
            for textarea in mat_textareas:
                try:
                    if textarea.is_displayed():
                        textarea.clear()
                        textarea.send_keys(healthcare_text)
                        filled_fields.append("targeted_textarea_healthcare")
                        print(f"✅ Targeted Angular Material filled textarea: healthcare motivation")
                        break
                except Exception as e:
                    print(f"❌ Error filling textarea: {e}")
                        
        except Exception as e:
            print(f"❌ Targeted Angular Material detection failed: {e}")
        
        # Universal field detection - find ALL input fields and try to fill them
        print("🌐 Using universal field detection to find ALL form fields...")
        
        try:
            # Get all input, select, and textarea elements
            all_inputs = browser_manager.driver.find_elements(By.TAG_NAME, "input")
            all_selects = browser_manager.driver.find_elements(By.TAG_NAME, "select")
            all_textareas = browser_manager.driver.find_elements(By.TAG_NAME, "textarea")
            
            all_elements = all_inputs + all_selects + all_textareas
            print(f"🔍 Found {len(all_elements)} total form elements on the page")
            
            # Data mapping for intelligent field filling
            data_mapping = {
                'first_name': user_data.personal_info.first_name,
                'last_name': user_data.personal_info.last_name,
                'email': user_data.personal_info.email,
                'phone': user_data.personal_info.phone,
                'address': user_data.personal_info.address.street,
                'city': user_data.personal_info.address.city,
                'state': user_data.personal_info.address.state,
                'zip': user_data.personal_info.address.zip_code,
                'country': user_data.personal_info.address.country,
                'linkedin': user_data.professional_info.linkedin_url,
                'website': user_data.professional_info.portfolio_url or user_data.professional_info.github_url or "",
                'current_title': user_data.professional_info.current_title,
                'current_company': user_data.professional_info.current_company,
                'experience': str(user_data.professional_info.years_experience),
                'cover_letter': user_data.professional_info.cover_letter
            }
            
            # Keywords to match fields
            field_keywords = {
                'first_name': ['first', 'given', 'legal first', 'fname', 'firstname'],
                'last_name': ['last', 'surname', 'family', 'legal last', 'lname', 'lastname'],
                'email': ['email', 'e-mail', 'mail'],
                'phone': ['phone', 'telephone', 'mobile', 'tel', 'contact'],
                'address': ['address', 'street', 'addr'],
                'city': ['city', 'town'],
                'state': ['state', 'province', 'region'],
                'zip': ['zip', 'postal', 'postcode', 'zipcode'],
                'country': ['country', 'nation'],
                'linkedin': ['linkedin', 'linked-in'],
                'website': ['website', 'url', 'portfolio', 'github'],
                'current_title': ['title', 'position', 'job title', 'current title'],
                'current_company': ['company', 'employer', 'organization', 'current company'],
                'experience': ['experience', 'years', 'yrs'],
                'cover_letter': ['cover', 'letter', 'message', 'additional', 'comments', 'notes']
            }
            
            universal_filled = 0
            
            for element in all_elements:
                try:
                    # Skip if element is not visible or already filled
                    if not element.is_displayed() or element.get_attribute('value'):
                        continue
                    
                    # Get element attributes for matching
                    element_id = element.get_attribute('id') or ''
                    element_name = element.get_attribute('name') or ''
                    element_placeholder = element.get_attribute('placeholder') or ''
                    element_class = element.get_attribute('class') or ''
                    element_type = element.get_attribute('type') or ''
                    
                    # Combine all text for matching
                    element_text = f"{element_id} {element_name} {element_placeholder} {element_class}".lower()
                    
                    # Try to match with data fields
                    matched_field = None
                    matched_value = None
                    
                    for field_name, keywords in field_keywords.items():
                        for keyword in keywords:
                            if keyword in element_text:
                                matched_field = field_name
                                matched_value = data_mapping[field_name]
                                break
                        if matched_field:
                            break
                    
                    # Skip file inputs and submit buttons
                    if element_type in ['file', 'submit', 'button', 'hidden']:
                        continue
                    
                    # Skip if already filled by previous methods
                    if any(field_name in [f.replace('enhanced_', '').replace('llm_', '') for f in filled_fields] for field_name in [matched_field] if matched_field):
                        continue
                    
                    if matched_field and matched_value:
                        # Fill the field
                        if element.tag_name == 'select':
                            # Handle dropdown
                            select = Select(element)
                            try:
                                select.select_by_visible_text(matched_value)
                            except:
                                try:
                                    select.select_by_value(matched_value)
                                except:
                                    # Try partial match
                                    for option in select.options:
                                        if matched_value.lower() in option.text.lower():
                                            select.select_by_visible_text(option.text)
                                            break
                        elif element.tag_name == 'textarea':
                            # Handle textarea
                            element.clear()
                            element.send_keys(matched_value)
                        else:
                            # Handle input
                            element.clear()
                            element.send_keys(matched_value)
                        
                        filled_fields.append(f"universal_{matched_field}")
                        universal_filled += 1
                        print(f"✅ Universal detection filled {matched_field}: {matched_value}")
                        
                except Exception as e:
                    continue
            
            print(f"🌐 Universal detection filled {universal_filled} additional fields")
            
        except Exception as e:
            print(f"❌ Universal field detection failed: {e}")
        
        # Handle specific form questions and radio buttons
        print("📋 Handling specific form questions and radio buttons...")
        
        try:
            # Handle "Are you over the age of 18?" question - More comprehensive approach
            print("🔍 Looking for age question (18+)...")
            age_question_selectors = [
                "//input[@type='radio' and contains(@name, 'age')]",
                "//input[@type='radio' and contains(@name, '18')]",
                "//input[@type='radio' and contains(@value, 'Yes')]",
                "//input[@type='radio' and contains(@value, 'yes')]",
                "//input[@type='radio' and contains(@value, 'true')]",
                "//input[@type='radio' and contains(@value, 'Y')]",
                "//input[@type='radio' and contains(@value, 'y')]",
                "//input[@type='radio' and contains(@id, 'age')]",
                "//input[@type='radio' and contains(@id, '18')]"
            ]
            
            # Also look for any radio buttons near text containing "18" or "age"
            age_text_selectors = [
                "//*[contains(text(), 'over the age of 18')]//following::input[@type='radio']",
                "//*[contains(text(), 'age of 18')]//following::input[@type='radio']",
                "//*[contains(text(), '18')]//following::input[@type='radio']",
                "//*[contains(text(), 'age')]//following::input[@type='radio']"
            ]
            
            all_age_selectors = age_question_selectors + age_text_selectors
            
            for selector in all_age_selectors:
                try:
                    elements = browser_manager.driver.find_elements(By.XPATH, selector)
                    print(f"🔍 Found {len(elements)} elements with selector: {selector}")
                    for element in elements:
                        if element.is_displayed():
                            value = element.get_attribute('value') or ''
                            print(f"   Radio button value: '{value}'")
                            if value.lower() in ['yes', 'y', 'true', '1']:
                                element.click()
                                filled_fields.append("age_question")
                                print("✅ Filled age question: Yes")
                                break
                    if "age_question" in filled_fields:
                        break
                except Exception as e:
                    print(f"   Error with selector {selector}: {e}")
                    continue
            
            # Handle "Will you now or in the future require company sponsorship?" question
            print("🔍 Looking for sponsorship question...")
            sponsorship_question_selectors = [
                "//input[@type='radio' and contains(@name, 'sponsorship')]",
                "//input[@type='radio' and contains(@name, 'sponsor')]",
                "//input[@type='radio' and contains(@value, 'No')]",
                "//input[@type='radio' and contains(@value, 'no')]",
                "//input[@type='radio' and contains(@value, 'false')]",
                "//input[@type='radio' and contains(@value, 'N')]",
                "//input[@type='radio' and contains(@value, 'n')]",
                "//input[@type='radio' and contains(@id, 'sponsorship')]",
                "//input[@type='radio' and contains(@id, 'sponsor')]"
            ]
            
            # Also look for radio buttons near text containing "sponsorship"
            sponsorship_text_selectors = [
                "//*[contains(text(), 'sponsorship')]//following::input[@type='radio']",
                "//*[contains(text(), 'sponsor')]//following::input[@type='radio']",
                "//*[contains(text(), 'company sponsorship')]//following::input[@type='radio']"
            ]
            
            all_sponsorship_selectors = sponsorship_question_selectors + sponsorship_text_selectors
            
            for selector in all_sponsorship_selectors:
                try:
                    elements = browser_manager.driver.find_elements(By.XPATH, selector)
                    print(f"🔍 Found {len(elements)} elements with selector: {selector}")
                    for element in elements:
                        if element.is_displayed():
                            value = element.get_attribute('value') or ''
                            print(f"   Radio button value: '{value}'")
                            if value.lower() in ['no', 'n', 'false', '0']:
                                element.click()
                                filled_fields.append("sponsorship_question")
                                print("✅ Filled sponsorship question: No")
                                break
                    if "sponsorship_question" in filled_fields:
                        break
                except Exception as e:
                    print(f"   Error with selector {selector}: {e}")
                    continue
            
            # Handle "Do you have, or are you in the process of obtaining, a professional license?" question
            print("🔍 Looking for professional license question...")
            license_question_selectors = [
                "//input[@type='radio' and contains(@name, 'license')]",
                "//input[@type='radio' and contains(@name, 'professional')]",
                "//input[@type='radio' and contains(@value, 'No')]",
                "//input[@type='radio' and contains(@value, 'no')]",
                "//input[@type='radio' and contains(@value, 'false')]",
                "//input[@type='radio' and contains(@value, 'N')]",
                "//input[@type='radio' and contains(@value, 'n')]",
                "//input[@type='radio' and contains(@id, 'license')]",
                "//input[@type='radio' and contains(@id, 'professional')]"
            ]
            
            # Also look for radio buttons near text containing "license" or "professional"
            license_text_selectors = [
                "//*[contains(text(), 'professional license')]//following::input[@type='radio']",
                "//*[contains(text(), 'license')]//following::input[@type='radio']",
                "//*[contains(text(), 'professional')]//following::input[@type='radio']"
            ]
            
            all_license_selectors = license_question_selectors + license_text_selectors
            
            for selector in all_license_selectors:
                try:
                    elements = browser_manager.driver.find_elements(By.XPATH, selector)
                    print(f"🔍 Found {len(elements)} elements with selector: {selector}")
                    for element in elements:
                        if element.is_displayed():
                            value = element.get_attribute('value') or ''
                            print(f"   Radio button value: '{value}'")
                            if value.lower() in ['no', 'n', 'false', '0']:
                                element.click()
                                filled_fields.append("license_question")
                                print("✅ Filled license question: No")
                                break
                    if "license_question" in filled_fields:
                        break
                except Exception as e:
                    print(f"   Error with selector {selector}: {e}")
                    continue
            
            # Handle "What drew you to healthcare?" textarea
            healthcare_motivation_selectors = [
                "//textarea[contains(@placeholder, 'healthcare')]",
                "//textarea[contains(@placeholder, 'health')]",
                "//textarea[contains(@name, 'healthcare')]",
                "//textarea[contains(@name, 'motivation')]",
                "//textarea[contains(@id, 'healthcare')]",
                "//textarea[contains(@id, 'motivation')]",
                "//input[contains(@placeholder, 'healthcare')]",
                "//input[contains(@name, 'healthcare')]"
            ]
            
            healthcare_motivation_text = "I am deeply motivated by the opportunity to improve lives through technology, secure systems, and innovation. Healthcare offers a chance to apply my skills in AI, security, and platform engineering to ensure reliability, safety, and efficiency for patients and providers."
            
            for selector in healthcare_motivation_selectors:
                try:
                    element = browser_manager.find_element(selector, "xpath")
                    if element and element.is_displayed():
                        element.clear()
                        element.send_keys(healthcare_motivation_text)
                        filled_fields.append("healthcare_motivation")
                        print("✅ Filled healthcare motivation")
                        break
                except:
                    continue
            
            # Handle "How many years of experience do you have in a related role?" dropdown
            print("🔍 Looking for experience dropdown...")
            experience_selectors = [
                "//select[contains(@name, 'experience')]",
                "//select[contains(@name, 'years')]",
                "//select[contains(@id, 'experience')]",
                "//select[contains(@id, 'years')]",
                "//select[contains(@placeholder, 'experience')]",
                "//select[contains(@placeholder, 'years')]",
                "//select[contains(@class, 'experience')]",
                "//select[contains(@class, 'years')]"
            ]
            
            # Also look for selects near text containing "experience" or "years"
            experience_text_selectors = [
                "//*[contains(text(), 'years of experience')]//following::select",
                "//*[contains(text(), 'experience')]//following::select",
                "//*[contains(text(), 'years')]//following::select"
            ]
            
            all_experience_selectors = experience_selectors + experience_text_selectors
            
            experience_values = ["8+ years", "8+", "8", "7+", "6+", "5+", "4+", "3+", "2+", "1+"]
            
            for selector in all_experience_selectors:
                try:
                    element = browser_manager.find_element(selector, "xpath")
                    if element and element.is_displayed():
                        print(f"🔍 Found experience dropdown with selector: {selector}")
                        select = Select(element)
                        print(f"   Dropdown options: {[option.text for option in select.options]}")
                        
                        # Try each experience value
                        for exp_value in experience_values:
                            try:
                                select.select_by_visible_text(exp_value)
                                filled_fields.append("experience_dropdown")
                                print(f"✅ Filled experience dropdown: {exp_value}")
                                break
                            except:
                                try:
                                    select.select_by_value(exp_value)
                                    filled_fields.append("experience_dropdown")
                                    print(f"✅ Filled experience dropdown: {exp_value}")
                                    break
                                except:
                                    # Try partial match
                                    for option in select.options:
                                        if exp_value.lower() in option.text.lower():
                                            select.select_by_visible_text(option.text)
                                            filled_fields.append("experience_dropdown")
                                            print(f"✅ Filled experience dropdown: {option.text}")
                                            break
                                    if "experience_dropdown" in filled_fields:
                                        break
                        if "experience_dropdown" in filled_fields:
                            break
                except Exception as e:
                    print(f"   Error with selector {selector}: {e}")
                    continue
            
            print(f"📋 Form questions filled: {len([f for f in filled_fields if f in ['age_question', 'sponsorship_question', 'license_question', 'healthcare_motivation', 'experience_dropdown']])}")
            
        except Exception as e:
            print(f"❌ Form questions handling failed: {e}")
        
        # SIMPLE RADIO BUTTON CLICKING - Click all visible radio buttons
        print("🎯 Using SIMPLE radio button clicking...")
        
        try:
            # Get all radio buttons
            all_radio_buttons = browser_manager.driver.find_elements(By.XPATH, "//input[@type='radio']")
            print(f"🔍 Found {len(all_radio_buttons)} total radio buttons")
            
            # Click every other radio button (to get a mix of Yes/No answers)
            clicked_count = 0
            for i, radio in enumerate(all_radio_buttons):
                try:
                    if not radio.is_displayed():
                        continue
                    
                    # Click every 2nd radio button to get a mix of answers
                    if i % 2 == 0:
                        value = radio.get_attribute('value') or ''
                        print(f"🎯 Clicking radio {i+1} with value: '{value}'")
                        
                        # Try multiple click methods
                        success = False
                        
                        # Method 1: Regular click
                        try:
                            radio.click()
                            success = True
                            print(f"   ✅ Regular click successful")
                        except:
                            pass
                        
                        # Method 2: JavaScript click
                        if not success:
                            try:
                                browser_manager.driver.execute_script("arguments[0].click();", radio)
                                success = True
                                print(f"   ✅ JavaScript click successful")
                            except:
                                pass
                        
                        # Method 3: Force click with JavaScript
                        if not success:
                            try:
                                browser_manager.driver.execute_script("arguments[0].checked = true; arguments[0].dispatchEvent(new Event('change'));", radio)
                                success = True
                                print(f"   ✅ Force click successful")
                            except:
                                pass
                        
                        if success:
                            clicked_count += 1
                            filled_fields.append(f"simple_radio_{i}_{value}")
                            print(f"   ✅ Radio {i+1} clicked successfully")
                            
                            # Wait a moment between clicks
                            time.sleep(0.3)
                        else:
                            print(f"   ❌ All click methods failed for radio {i+1}")
                            
                except Exception as e:
                    print(f"   ❌ Error with radio {i+1}: {e}")
                    continue
            
            print(f"🎯 Simple radio clicking filled {clicked_count} radio buttons")
            
        except Exception as e:
            print(f"❌ Simple radio clicking failed: {e}")
        
        # AGGRESSIVE FALLBACK: Try to fill ALL radio buttons and form elements
        print("🚀 Using AGGRESSIVE FALLBACK to fill ALL form elements...")
        
        try:
            # Get ALL radio buttons on the page
            all_radio_buttons = browser_manager.driver.find_elements(By.XPATH, "//input[@type='radio']")
            print(f"🔍 Found {len(all_radio_buttons)} total radio buttons on the page")
            
            # Group radio buttons by name to handle them properly
            radio_groups = {}
            for radio in all_radio_buttons:
                name = radio.get_attribute('name') or 'unnamed'
                if name not in radio_groups:
                    radio_groups[name] = []
                radio_groups[name].append(radio)
            
            print(f"🔍 Found {len(radio_groups)} radio button groups")
            
            # Fill each radio button group - IMPROVED LOGIC
            for group_name, radios in radio_groups.items():
                print(f"🔍 Processing radio group: {group_name}")
                
                # Try to find the right radio button to click
                selected_radio = None
                
                for radio in radios:
                    try:
                        if not radio.is_displayed():
                            continue
                        
                        value = radio.get_attribute('value') or ''
                        print(f"   Radio button value: '{value}'")
                        
                        # For the first few groups, select "Yes" or "No" based on context
                        # Group 1: Age question - select "Yes"
                        # Group 2: Sponsorship - select "No" 
                        # Group 3: License - select "No"
                        # Group 4: Disability - select "No"
                        # Group 5: Veteran - select "No"
                        
                        if len(radio_groups) >= 5:
                            group_index = list(radio_groups.keys()).index(group_name)
                            
                            if group_index == 0:  # Age question
                                if value.lower() in ['yes', 'y', 'true', '1']:
                                    selected_radio = radio
                                    break
                            elif group_index in [1, 2, 3, 4]:  # Sponsorship, License, Disability, Veteran
                                if value.lower() in ['no', 'n', 'false', '0']:
                                    selected_radio = radio
                                    break
                        else:
                            # Fallback: try to select any available option
                            if value.lower() in ['yes', 'y', 'no', 'n', 'true', 'false', '1', '0']:
                                selected_radio = radio
                                break
                                
                    except Exception as e:
                        print(f"   Error analyzing radio: {e}")
                        continue
                
                # Click the selected radio button
                if selected_radio:
                    try:
                        selected_radio.click()
                        value = selected_radio.get_attribute('value') or ''
                        filled_fields.append(f"aggressive_radio_{group_name}_{value}")
                        print(f"✅ Selected radio button: {group_name} = {value}")
                    except Exception as e:
                        print(f"   Error clicking selected radio: {e}")
                else:
                    print(f"   ⚠️ No suitable radio button found for group: {group_name}")
            
            # Get ALL select elements on the page
            all_selects = browser_manager.driver.find_elements(By.XPATH, "//select")
            print(f"🔍 Found {len(all_selects)} total select elements on the page")
            
            for select_elem in all_selects:
                try:
                    if not select_elem.is_displayed():
                        continue
                    
                    select = Select(select_elem)
                    options = [option.text for option in select.options]
                    print(f"🔍 Select options: {options}")
                    
                    # Try to select any option that looks like experience
                    for option in select.options:
                        option_text = option.text.lower()
                        if any(exp in option_text for exp in ['8+', '7+', '6+', '5+', '4+', '3+', '2+', '1+', 'years']):
                            select.select_by_visible_text(option.text)
                            filled_fields.append(f"aggressive_select_{option.text}")
                            print(f"✅ Selected dropdown option: {option.text}")
                            break
                except Exception as e:
                    print(f"   Error with select: {e}")
                    continue
            
            # Get ALL textarea elements on the page
            all_textareas = browser_manager.driver.find_elements(By.XPATH, "//textarea")
            print(f"🔍 Found {len(all_textareas)} total textarea elements on the page")
            
            healthcare_text = "I am deeply motivated by the opportunity to improve lives through technology, secure systems, and innovation. Healthcare offers a chance to apply my skills in AI, security, and platform engineering to ensure reliability, safety, and efficiency for patients and providers."
            
            for textarea in all_textareas:
                try:
                    if not textarea.is_displayed():
                        continue
                    
                    # Check if it's empty or has placeholder text
                    current_value = textarea.get_attribute('value') or ''
                    placeholder = textarea.get_attribute('placeholder') or ''
                    
                    if not current_value or current_value in ['[REDACTED]', '']:  # Clear incorrect values
                        textarea.clear()
                        textarea.send_keys(healthcare_text)
                        filled_fields.append("aggressive_textarea_healthcare")
                        print(f"✅ Filled textarea with healthcare motivation")
                        break
                except Exception as e:
                    print(f"   Error with textarea: {e}")
                    continue
            
            print(f"🚀 AGGRESSIVE FALLBACK filled {len([f for f in filled_fields if 'aggressive_' in f])} additional fields")
            
        except Exception as e:
            print(f"❌ AGGRESSIVE FALLBACK failed: {e}")
        
        # Now use LLM to find and fill additional fields
        print("🤖 Using LLM to analyze and fill additional form fields...")
        llm_analysis = analyze_form_with_llm(browser_manager, user_data)
        
        if llm_analysis:
            llm_filled_count, llm_results = fill_form_with_llm_analysis(browser_manager, llm_analysis, user_data)
            print(f"🤖 LLM filled {llm_filled_count} additional fields")
            
            # Add LLM filled fields to the total count
            for field_type, status in llm_results.items():
                if status == 'filled':
                    filled_fields.append(f"llm_{field_type}")
        
        print(f"📊 Total fields filled: {len(filled_fields)} - {', '.join(filled_fields)}")
        
        # Debug: Take a screenshot to see what was filled
        debug_screenshot = browser_manager.take_screenshot(f"job_{job_id}_debug_filled.png")
        print(f"📸 Debug screenshot saved: {debug_screenshot}")
        
        # Debug: Print all form elements found on the page
        try:
            all_form_elements = browser_manager.driver.find_elements(By.XPATH, "//input | //select | //textarea")
            print(f"🔍 DEBUG: Found {len(all_form_elements)} total form elements:")
            for i, elem in enumerate(all_form_elements[:20]):  # Show first 20
                try:
                    elem_id = elem.get_attribute('id') or 'no-id'
                    elem_name = elem.get_attribute('name') or 'no-name'
                    elem_type = elem.get_attribute('type') or elem.tag_name
                    elem_placeholder = elem.get_attribute('placeholder') or 'no-placeholder'
                    elem_value = elem.get_attribute('value') or 'no-value'
                    print(f"  {i+1}. {elem_type} - id:'{elem_id}' name:'{elem_name}' placeholder:'{elem_placeholder}' value:'{elem_value}'")
                except:
                    print(f"  {i+1}. Error reading element")
        except Exception as e:
            print(f"❌ Debug element listing failed: {e}")
        
        # Wait a bit for form processing
        time.sleep(2)  # Slightly longer wait for file uploads
        
        # Check timeout
        if time.time() - start_time > timeout_seconds:
            raise TimeoutError("Application timed out during form filling")
        
        # Take screenshot of filled form for verification
        filled_form_screenshot = browser_manager.take_screenshot(f"job_{job_id}_filled_form.png")
        print(f"📸 Form filled - Screenshot saved: {filled_form_screenshot}")
        
        # Verify form fields are actually filled
        print("🔍 Verifying form fields are filled...")
        verification_results = []
        
        # Check email field
        email_element = browser_manager.find_element("//input[@type='email']", "xpath")
        if email_element:
            email_value = browser_manager.get_element_attribute(email_element, "value")
            verification_results.append(f"Email: {'✅ Filled' if email_value else '❌ Empty'}")
        
        # Check phone field
        phone_element = browser_manager.find_element("//input[@type='tel']", "xpath")
        if phone_element:
            phone_value = browser_manager.get_element_attribute(phone_element, "value")
            verification_results.append(f"Phone: {'✅ Filled' if phone_value else '❌ Empty'}")
        
        # Check first name field
        first_name_filled = False
        first_name_selectors = [
            "//input[@name='firstName']",
            "//input[@name='first_name']",
            "//input[@name='fname']",
            "//input[@name='givenName']",
            "//input[contains(@placeholder, 'first') or contains(@placeholder, 'First')]",
            "//input[contains(@id, 'first')]"
        ]
        for selector in first_name_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                first_name_value = browser_manager.get_element_attribute(element, "value")
                if first_name_value:
                    first_name_filled = True
                break
        verification_results.append(f"First Name: {'✅ Filled' if first_name_filled else '❌ Empty'}")
        
        # Check last name field
        last_name_filled = False
        last_name_selectors = [
            "//input[@name='lastName']",
            "//input[@name='last_name']",
            "//input[@name='lname']",
            "//input[@name='surname']",
            "//input[contains(@placeholder, 'last') or contains(@placeholder, 'Last')]",
            "//input[contains(@id, 'last')]"
        ]
        for selector in last_name_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                last_name_value = browser_manager.get_element_attribute(element, "value")
                if last_name_value:
                    last_name_filled = True
                break
        verification_results.append(f"Last Name: {'✅ Filled' if last_name_filled else '❌ Empty'}")
        
        # Print verification results
        print("📋 Form Verification Results:")
        for result in verification_results:
            print(f"  {result}")
        
        # Check if all critical fields are filled
        all_filled = all("✅ Filled" in result for result in verification_results)
        if not all_filled:
            print("⚠️  Warning: Some form fields may not be filled correctly")
        else:
            print("✅ All form fields verified as filled")
        
        # Handle multi-page forms - look for "Next", "Continue", or "Apply" buttons first
        next_button_selectors = [
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'next')]",
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'continue')]",
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'proceed')]",
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'step')]",
            "//input[@value='Next']",
            "//input[@value='Continue']",
            "//input[@value='Proceed']",
            "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'next')]",
            "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'continue')]",
        ]
        
        next_button = None
        for selector in next_button_selectors:
            try:
                element = browser_manager.find_element(selector, "xpath")
                if element:
                    button_text = browser_manager.get_element_text(element) or browser_manager.get_element_attribute(element, "value") or "No text"
                    print(f"🔄 Found next/continue button: '{button_text}' - Navigating to next page")
                    next_button = element
                    break
            except Exception as e:
                continue
        
        # If we found a next button, click it and wait for next page
        if next_button:
            browser_manager.click_element(next_button)
            time.sleep(3)  # Wait for page to load
            print("📄 Navigated to next page, now looking for submit button...")
        
        # Handle multiple pages - try up to 3 additional pages
        max_pages = 3
        current_page = 1
        submit_button = None
        
        while current_page <= max_pages and not submit_button:
            print(f"🔍 Checking page {current_page + 1} for submit button...")
            
            # Check timeout
            if time.time() - start_time > timeout_seconds:
                raise TimeoutError("Application timed out during page navigation")
            
            # Look for submit button with comprehensive selectors
            submit_selectors = [
                # SmartRecruiters specific selectors
                "//button[contains(@class, 'btn-primary')]",
                "//button[contains(@class, 'btn-submit')]",
                "//button[contains(@class, 'submit')]",
                "//button[contains(@class, 'apply')]",
                "//button[contains(@data-testid, 'submit')]",
                "//button[contains(@data-testid, 'apply')]",
                # Standard submit buttons
                "//button[@type='submit']",
                "//input[@type='submit']",
                # Text-based selectors (case insensitive) - more specific
                "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'submit application')]",
                "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply now')]",
                "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'submit')]",
                "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply')]",
                "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'send')]",
                "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'finish')]",
                "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'complete')]",
                # Link-based selectors
                "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'submit')]",
                "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply')]",
                # Value attribute selectors
                "//input[@value='Submit']",
                "//input[@value='Apply']",
                "//input[@value='Send']",
                # Class and ID based selectors
                "//button[contains(@class, 'submit')]",
                "//button[contains(@class, 'apply')]",
                "//button[contains(@id, 'submit')]",
                "//button[contains(@id, 'apply')]",
                "//input[contains(@class, 'submit')]",
                "//input[contains(@class, 'apply')]",
                # Generic button selectors (exclude cookies/privacy buttons)
                "//button[not(contains(text(), 'Cookies')) and not(contains(text(), 'Privacy')) and not(contains(text(), 'Settings'))]",
                "//button[position()>1]",  # Any button after first
            ]
            
            for i, selector in enumerate(submit_selectors):
                try:
                    element = browser_manager.find_element(selector, "xpath")
                    if element:
                        button_text = browser_manager.get_element_text(element) or browser_manager.get_element_attribute(element, "value") or "No text"
                        print(f"✅ Found submit button with selector {i+1}: '{selector}' - Text: '{button_text}'")
                        submit_button = element
                        break
                except Exception as e:
                    continue
            
            # If no submit button found on current page, look for next page button
            if not submit_button:
                print(f"❌ No submit button found on page {current_page + 1}. Looking for next page...")
                
                # Look for next page button again
                next_button = None
                for selector in next_button_selectors:
                    try:
                        element = browser_manager.find_element(selector, "xpath")
                        if element:
                            button_text = browser_manager.get_element_text(element) or browser_manager.get_element_attribute(element, "value") or "No text"
                            print(f"🔄 Found next/continue button: '{button_text}' - Navigating to next page")
                            next_button = element
                            break
                    except Exception as e:
                        continue
                
                if next_button:
                    browser_manager.click_element(next_button)
                    time.sleep(3)  # Wait for page to load
                    current_page += 1
                else:
                    print("❌ No next page button found. Stopping search.")
                    break
            else:
                break  # Found submit button, exit loop
        
        # If no submit button found after all pages, let's see what buttons are available
        if not submit_button:
            print("❌ No submit button found on any page. Available buttons on current page:")
            try:
                all_buttons = browser_manager.find_elements("//button", "xpath")
                for i, btn in enumerate(all_buttons[:10]):  # Show first 10 buttons
                    try:
                        text = browser_manager.get_element_text(btn) or browser_manager.get_element_attribute(btn, "value") or "No text"
                        classes = browser_manager.get_element_attribute(btn, "class") or "No class"
                        btn_id = browser_manager.get_element_attribute(btn, "id") or "No id"
                        print(f"  Button {i+1}: Text='{text}', Class='{classes}', ID='{btn_id}'")
                    except:
                        print(f"  Button {i+1}: Could not read details")
            except Exception as e:
                print(f"  Error getting button list: {e}")
        
        if submit_button:
            print(f"🚀 Clicking submit button: {browser_manager.get_element_text(submit_button) or browser_manager.get_element_attribute(submit_button, 'value')}")
            browser_manager.click_element(submit_button)
            time.sleep(5)  # Wait longer for page to process
            
            # Take screenshot after submission
            submission_screenshot = browser_manager.take_screenshot(f"job_{job_id}_after_submission.png")
            print(f"📸 Post-submission screenshot saved: {submission_screenshot}")
            
            # Enhanced success detection
            print("🔍 Checking for application success...")
            page_source = browser_manager.get_page_source().lower()
            page_title = browser_manager.get_page_title().lower()
            current_url = browser_manager.get_current_url().lower()
            
            # More specific success indicators - look for actual confirmation messages
            success_indicators = [
                "thank you for your application",
                "application has been received",
                "application submitted successfully", 
                "we have received your application",
                "your application is being reviewed",
                "application confirmation",
                "application complete",
                "we will contact you soon",
                "application under review",
                "thank you for applying",
                "application received successfully"
            ]
            
            # Check for success indicators in page content
            found_indicators = [indicator for indicator in success_indicators if indicator in page_source]
            
            # Check for specific confirmation page elements
            confirmation_elements = [
                "//div[contains(text(), 'Thank you for your application')]",
                "//div[contains(text(), 'Application received')]",
                "//div[contains(text(), 'Application submitted')]",
                "//h1[contains(text(), 'Thank you')]",
                "//h2[contains(text(), 'Application')]",
                "//div[contains(@class, 'success')]",
                "//div[contains(@class, 'confirmation')]",
                "//div[contains(@class, 'thank-you')]"
            ]
            
            confirmation_found = False
            for element_selector in confirmation_elements:
                if browser_manager.find_element(element_selector, "xpath"):
                    confirmation_found = True
                    print(f"✅ Found confirmation element: {element_selector}")
                    break
            
            # Check for URL changes that might indicate success (more specific)
            url_success_indicators = ["thank", "confirmation", "complete", "success", "received"]
            url_success = any(indicator in current_url for indicator in url_success_indicators)
            
            # Check for title changes (more specific)
            title_success_indicators = ["thank", "confirmation", "complete", "success", "received"]
            title_success = any(indicator in page_title for indicator in title_success_indicators)
            
            print(f"📄 Page title: {browser_manager.get_page_title()}")
            print(f"🔗 Current URL: {browser_manager.get_current_url()}")
            print(f"✅ Found success indicators: {found_indicators}")
            print(f"🔗 URL success indicators: {url_success}")
            print(f"📄 Title success indicators: {title_success}")
            print(f"🎯 Confirmation elements found: {confirmation_found}")
            
            # More strict success determination - require either specific indicators OR confirmation elements
            success_criteria_met = (
                (found_indicators and len(found_indicators) >= 2) or  # At least 2 specific indicators
                confirmation_found or  # Found confirmation page elements
                (url_success and title_success)  # Both URL and title changed to success indicators
            )
            
            if success_criteria_met:
                success_message = f"Application submitted successfully! Confirmation: {confirmation_found}, Indicators: {found_indicators[:3]}"
                application_status[job_id] = {"status": "success", "message": success_message}
                print(f"🎉 SUCCESS: {success_message}")
            else:
                # Check for error indicators
                error_indicators = ["error", "failed", "invalid", "required", "missing", "try again"]
                found_errors = [indicator for indicator in error_indicators if indicator in page_source]
                
                if found_errors:
                    error_message = f"Application may have failed. Error indicators: {found_errors[:3]}"
                    application_status[job_id] = {"status": "error", "message": error_message}
                    print(f"❌ ERROR: {error_message}")
                else:
                    application_status[job_id] = {"status": "submitted", "message": "Application submitted (manual verification needed)"}
                    print("⚠️  Application submitted but success could not be verified automatically")
        else:
            application_status[job_id] = {"status": "partial", "message": "Form filled but submit button not found"}
        
        browser_manager.cleanup()
        
    except TimeoutError:
        application_status[job_id] = {"status": "error", "message": "Application timed out after 5 minutes"}
        print("⏰ Application timed out")
    except Exception as e:
        application_status[job_id] = {"status": "error", "message": f"Error: {str(e)}"}
        print(f"❌ Error: {str(e)}")

@app.route('/')
def index():
    """Main page with job cards."""
    return render_template('index.html', jobs=JOBS)

@app.route('/api/jobs')
def get_jobs():
    """API endpoint to get job data."""
    return jsonify(JOBS)

@app.route('/api/apply/<job_id>', methods=['POST'])
def apply_to_job(job_id):
    """API endpoint to apply to a specific job."""
    job = next((job for job in JOBS if job['id'] == job_id), None)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    # Start application in background thread
    thread = threading.Thread(target=apply_to_job_async, args=(job_id, job['url']))
    thread.daemon = True
    thread.start()
    
    return jsonify({"message": "Application started", "job_id": job_id})

@app.route('/api/status/<job_id>')
def get_application_status(job_id):
    """API endpoint to get application status."""
    status = application_status.get(job_id, {"status": "unknown", "message": "Job not found"})
    return jsonify(status)

@app.route('/api/status')
def get_all_status():
    """API endpoint to get all application statuses."""
    return jsonify(application_status)

@app.route('/screenshots/<filename>')
def serve_screenshot(filename):
    """Serve screenshot files."""
    from flask import send_from_directory
    screenshots_dir = Path(__file__).parent.parent / "screenshots"
    return send_from_directory(str(screenshots_dir), filename)

@app.route('/dashboard')
def dashboard():
    """Form filling dashboard."""
    return app.send_static_file('dashboard.html')

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    templates_dir = Path(__file__).parent / "templates"
    templates_dir.mkdir(exist_ok=True)
    
    # Create static directory if it doesn't exist
    static_dir = Path(__file__).parent / "static"
    static_dir.mkdir(exist_ok=True)
    
    print("🚀 Starting JobHax Web UI...")
    print("📱 Open your browser to: http://localhost:5001")
    print("🎯 Click the 'Apply' button on any job card to start the application process")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
