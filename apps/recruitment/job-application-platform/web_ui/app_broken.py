#!/usr/bin/env python3
"""
JobHax Web UI - Flask application for job application interface.
"""

import os
import sys
import asyncio
import threading
from pathlib import Path
from flask import Flask, render_template, jsonify, request
import logging

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from core.config import Config
from utils.data_loader import DataLoader
from utils.browser_manager import BrowserManager

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

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

def apply_to_job_async(job_id, job_url):
    """Apply to a job asynchronously."""
    global application_status
    
    try:
        application_status[job_id] = {"status": "applying", "message": "Applying to job..."}
        
        # Set timeout for the entire operation (5 minutes)
        import signal
        
        def timeout_handler(signum, frame):
            raise TimeoutError("Application process timed out after 5 minutes")
        
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(300)  # 5 minutes timeout
        
        try:
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
        import time
            time.sleep(2)  # Reduced wait time
        
        # Take screenshot
        screenshot = browser_manager.take_screenshot(f"job_{job_id}_application.png")
            print(f"📸 Initial page screenshot saved: {screenshot}")
        
        # Look for and fill form fields
            print("📝 Filling form fields...")
        email_element = browser_manager.find_element("//input[@type='email']", "xpath")
        if email_element:
            browser_manager.fill_input(email_element, user_data.personal_info.email)
                print("✅ Email filled")
        
        phone_element = browser_manager.find_element("//input[@type='tel']", "xpath")
        if phone_element:
            browser_manager.fill_input(phone_element, user_data.personal_info.phone)
                print("✅ Phone filled")
        
        # Look for first name field
        first_name_selectors = [
            "//input[@name='firstName']",
            "//input[@name='first_name']",
            "//input[@placeholder*='first' or @placeholder*='First']"
        ]
        for selector in first_name_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                browser_manager.fill_input(element, user_data.personal_info.first_name)
                    print("✅ First name filled")
                break
        
        # Look for last name field
        last_name_selectors = [
            "//input[@name='lastName']",
            "//input[@name='last_name']",
            "//input[@placeholder*='last' or @placeholder*='Last']"
        ]
        for selector in last_name_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                browser_manager.fill_input(element, user_data.personal_info.last_name)
                    print("✅ Last name filled")
                break
        
        # Wait a bit for form processing
            time.sleep(1)  # Reduced wait time
            
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
                
                # Look for submit button with comprehensive selectors
        submit_selectors = [
                    # Standard submit buttons
            "//button[@type='submit']",
            "//input[@type='submit']",
                    # Text-based selectors (case insensitive)
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
                    # Generic button selectors
                    "//button[last()]",  # Last button on page
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
                
                # Comprehensive success indicators
                success_indicators = [
                    "thank you", "success", "submitted", "received", "confirmation",
                    "application received", "application submitted", "thank you for applying",
                    "we have received your application", "your application has been submitted",
                    "application complete", "application successful", "congratulations",
                    "next steps", "we will contact you", "application under review"
                ]
                
                # Check for success indicators in page content
                found_indicators = [indicator for indicator in success_indicators if indicator in page_source]
                
                # Check for URL changes that might indicate success
                url_success_indicators = ["success", "thank", "complete", "submitted", "received"]
                url_success = any(indicator in current_url for indicator in url_success_indicators)
                
                # Check for title changes
                title_success_indicators = ["thank", "success", "complete", "submitted", "received"]
                title_success = any(indicator in page_title for indicator in title_success_indicators)
                
                print(f"📄 Page title: {browser_manager.get_page_title()}")
                print(f"🔗 Current URL: {browser_manager.get_current_url()}")
                print(f"✅ Found success indicators: {found_indicators}")
                print(f"🔗 URL success indicators: {url_success}")
                print(f"📄 Title success indicators: {title_success}")
                
                # Determine success status
                if found_indicators or url_success or title_success:
                    success_message = f"Application submitted successfully! Indicators found: {found_indicators[:3]}"
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
        finally:
            # Cancel the alarm
            signal.alarm(0)

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
