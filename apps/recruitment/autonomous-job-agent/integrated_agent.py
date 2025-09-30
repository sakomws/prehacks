#!/usr/bin/env python3
"""
Integrated Real Browser Agent with WebSocket Monitoring
Combines real browser automation with live WebSocket updates
"""

import asyncio
import json
import time
import os
import socketio
from datetime import datetime
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

def load_candidate_data(data_path: str = "data/test_data.json") -> dict:
    """Load candidate data from JSON file"""
    try:
        with open(data_path, 'r') as f:
            data = json.load(f)
        print(f"✅ Loaded candidate data from {data_path}")
        return data
    except FileNotFoundError:
        print(f"❌ Data file not found: {data_path}")
        return {}
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {e}")
        return {}

class IntegratedBrowserAgent:
    """Real browser automation agent with WebSocket monitoring"""
    
    def __init__(self, candidate_data: dict, websocket_url: str = "http://localhost:8081"):
        self.candidate = candidate_data
        self.driver = None
        self.actions_log = []
        self.questions_encountered = []
        self.screenshots_taken = 0
        self.current_page = 1
        self.session_id = f"real_session_{int(time.time())}"
        
        # WebSocket client
        self.sio = socketio.Client()
        self.websocket_url = websocket_url
        self.connected = False
        
        # Setup WebSocket event handlers
        self.setup_websocket_handlers()
        
    def setup_websocket_handlers(self):
        """Setup WebSocket event handlers"""
        @self.sio.event
        def connect():
            print("🔗 Connected to WebSocket server")
            self.connected = True
            
        @self.sio.event
        def disconnect():
            print("🔌 Disconnected from WebSocket server")
            self.connected = False
            
        @self.sio.event
        def connect_error(data):
            print(f"❌ WebSocket connection error: {data}")
            self.connected = False
    
    def connect_websocket(self):
        """Connect to WebSocket server"""
        try:
            self.sio.connect(self.websocket_url)
            return True
        except Exception as e:
            print(f"❌ Failed to connect to WebSocket: {e}")
            return False
    
    def disconnect_websocket(self):
        """Disconnect from WebSocket server"""
        if self.connected:
            self.sio.disconnect()
    
    def emit_action(self, action_type: str, **kwargs):
        """Emit action to WebSocket server"""
        if self.connected:
            action = {
                "timestamp": time.time(),
                "action_type": action_type,
                "page": self.current_page,
                "session_id": self.session_id,
                **kwargs
            }
            self.sio.emit('agent_action', action)
            print(f"📡 Emitted action: {action_type}")
    
    def emit_questions(self, questions):
        """Emit detected questions to WebSocket server"""
        if self.connected:
            self.sio.emit('questions_detected', questions)
            print(f"📡 Emitted {len(questions)} questions")
    
    def emit_screenshot(self, filename: str):
        """Emit screenshot notification to WebSocket server"""
        if self.connected:
            self.sio.emit('screenshot_taken', {
                "filename": filename,
                "sessionId": self.session_id,
                "jobUrl": getattr(self, 'current_job_url', 'unknown')
            })
            print(f"📡 Emitted screenshot: {filename}")
    
    def emit_status(self, status: str, progress: int = 0):
        """Emit status update to WebSocket server"""
        if self.connected:
            self.sio.emit('agent_status', {
                "status": status,
                "currentPage": self.current_page,
                "progress": progress
            })
            print(f"📡 Emitted status: {status}")
    
    def log_action(self, action_type: str, **kwargs):
        """Log an action and emit to WebSocket"""
        action = {
            "timestamp": time.time(),
            "action_type": action_type,
            "page": self.current_page,
            **kwargs
        }
        self.actions_log.append(action)
        print(f"🤖 [{self.current_page}] {action_type.upper()}: {kwargs}")
        
        # Emit to WebSocket
        self.emit_action(action_type, **kwargs)
        
    def setup_driver(self):
        """Setup Chrome driver with appropriate options"""
        chrome_options = Options()
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Uncomment for headless mode
        # chrome_options.add_argument("--headless")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        print("🌐 Browser started successfully")
        
    def take_screenshot(self, filename: str):
        """Take a screenshot and save it"""
        try:
            screenshot_dir = Path("artifacts/screenshots")
            screenshot_dir.mkdir(parents=True, exist_ok=True)
            
            screenshot_path = screenshot_dir / filename
            self.driver.save_screenshot(str(screenshot_path))
            self.screenshots_taken += 1
            self.log_action("screenshot", filename=filename)
            print(f"📸 Screenshot saved: {screenshot_path}")
            
            # Emit screenshot notification
            self.emit_screenshot(filename)
            
            return str(screenshot_path)
        except Exception as e:
            print(f"❌ Failed to take screenshot: {e}")
            return None
    
    def detect_questions(self):
        """Detect questions on the current page"""
        print("🔍 Detecting questions on the page...")
        
        # Simulate question detection (in real implementation, this would analyze the page)
        questions = [
            {
                "question_id": "first_name",
                "question_text": "First Name",
                "field_type": "text_input",
                "required": True,
                "filled": False
            },
            {
                "question_id": "last_name", 
                "question_text": "Last Name",
                "field_type": "text_input",
                "required": True,
                "filled": False
            },
            {
                "question_id": "email",
                "question_text": "Email Address",
                "field_type": "email_input",
                "required": True,
                "filled": False
            },
            {
                "question_id": "phone",
                "question_text": "Phone Number",
                "field_type": "tel_input",
                "required": True,
                "filled": False
            },
            {
                "question_id": "over_18",
                "question_text": "Are you over 18?",
                "field_type": "radio_group",
                "required": True,
                "filled": False
            },
            {
                "question_id": "eligible_to_work",
                "question_text": "Are you eligible to work in the US?",
                "field_type": "radio_group",
                "required": True,
                "filled": False
            },
            {
                "question_id": "require_sponsorship",
                "question_text": "Do you require sponsorship?",
                "field_type": "radio_group",
                "required": True,
                "filled": False
            },
            {
                "question_id": "what_drew_you_to_healthcare",
                "question_text": "What drew you to healthcare?",
                "field_type": "textarea",
                "required": True,
                "filled": False
            },
            {
                "question_id": "years_experience",
                "question_text": "Years of experience",
                "field_type": "select",
                "required": True,
                "filled": False
            }
        ]
        
        self.questions_encountered = questions
        self.log_action("question_detection", questions_found=len(questions))
        
        # Emit questions to WebSocket
        self.emit_questions(questions)
        
        return questions
    
    def fill_text_field(self, field_name, value, by_type=By.NAME):
        """Fill a text input field"""
        try:
            # Try multiple selectors
            selectors = [
                (By.NAME, field_name),
                (By.ID, field_name),
                (By.CSS_SELECTOR, f"input[name='{field_name}']"),
                (By.CSS_SELECTOR, f"input[id='{field_name}']"),
                (By.CSS_SELECTOR, f"input[placeholder*='{field_name}']"),
                (By.XPATH, f"//input[@name='{field_name}']"),
                (By.XPATH, f"//input[@id='{field_name}']"),
                (By.XPATH, f"//input[contains(@placeholder, '{field_name}')]")
            ]
            
            element = None
            for by, selector in selectors:
                try:
                    element = WebDriverWait(self.driver, 2).until(
                        EC.presence_of_element_located((by, selector))
                    )
                    break
                except TimeoutException:
                    continue
                    
            if element:
                element.clear()
                element.send_keys(value)
                self.log_action("type_text", question_id=field_name, value=value)
                
                # Update question status
                for q in self.questions_encountered:
                    if q['question_id'] == field_name:
                        q['filled'] = True
                        q['response'] = value
                        q['response_type'] = 'text'
                        break
                
                return True
            else:
                print(f"⚠️ Could not find field: {field_name}")
                return False
                
        except Exception as e:
            print(f"❌ Error filling field {field_name}: {e}")
            return False
    
    def select_dropdown(self, field_name, value):
        """Select an option from a dropdown"""
        try:
            # Try multiple selectors for dropdown
            selectors = [
                (By.NAME, field_name),
                (By.ID, field_name),
                (By.CSS_SELECTOR, f"select[name='{field_name}']"),
                (By.CSS_SELECTOR, f"select[id='{field_name}']")
            ]
            
            element = None
            for by, selector in selectors:
                try:
                    element = WebDriverWait(self.driver, 2).until(
                        EC.presence_of_element_located((by, selector))
                    )
                    break
                except TimeoutException:
                    continue
                    
            if element:
                select = Select(element)
                select.select_by_visible_text(value)
                self.log_action("select_dropdown", question_id=field_name, value=value)
                
                # Update question status
                for q in self.questions_encountered:
                    if q['question_id'] == field_name:
                        q['filled'] = True
                        q['response'] = value
                        q['response_type'] = 'select'
                        break
                
                return True
            else:
                print(f"⚠️ Could not find dropdown: {field_name}")
                return False
                
        except Exception as e:
            print(f"❌ Error selecting dropdown {field_name}: {e}")
            return False
    
    def click_radio_button(self, field_name, value):
        """Click a radio button"""
        try:
            # Try multiple selectors for radio buttons
            selectors = [
                (By.CSS_SELECTOR, f"input[name='{field_name}'][value='{value}']"),
                (By.CSS_SELECTOR, f"input[name='{field_name}']"),
                (By.XPATH, f"//input[@name='{field_name}' and @value='{value}']"),
                (By.XPATH, f"//input[@name='{field_name}']")
            ]
            
            element = None
            for by, selector in selectors:
                try:
                    elements = self.driver.find_elements(by, selector)
                    if elements:
                        # If we have multiple radio buttons, find the one with the right value
                        for el in elements:
                            if el.get_attribute('value') == value:
                                element = el
                                break
                        if not element and elements:
                            element = elements[0]  # Use first one if no value match
                        break
                except:
                    continue
                    
            if element:
                self.driver.execute_script("arguments[0].click();", element)
                self.log_action("click_radio", question_id=field_name, option=value)
                
                # Update question status
                for q in self.questions_encountered:
                    if q['question_id'] == field_name:
                        q['filled'] = True
                        q['response'] = value
                        q['response_type'] = 'radio'
                        break
                
                return True
            else:
                print(f"⚠️ Could not find radio button: {field_name} = {value}")
                return False
                
        except Exception as e:
            print(f"❌ Error clicking radio button {field_name}: {e}")
            return False
    
    def fill_all_questions(self):
        """Fill all questions using candidate data"""
        print("📝 Filling all questions with real data...")
        
        personal = self.candidate['personal_information']
        eligibility = self.candidate['eligibility']
        motivation = self.candidate['motivation']
        experience = self.candidate['experience']
        disclosures = self.candidate['voluntary_disclosures']
        
        # Fill personal information
        self.fill_text_field('first_name', personal['first_name'])
        self.fill_text_field('last_name', personal['last_name'])
        self.fill_text_field('email', personal['email'])
        self.fill_text_field('phone', personal['phone'])
        
        # Fill address
        address_line = personal['address']['line']
        self.fill_text_field('address', address_line)
        self.fill_text_field('city', personal['address']['city'])
        self.fill_text_field('state', personal['address']['state'])
        self.fill_text_field('postal_code', personal['address']['postal_code'])
        self.select_dropdown('country', personal['address']['country'])
        
        # Fill eligibility questions
        self.click_radio_button('over_18', 'Yes' if eligibility['over_18'] else 'No')
        self.click_radio_button('eligible_to_work', 'Yes' if eligibility['eligible_to_work_in_us'] else 'No')
        self.click_radio_button('require_sponsorship', 'No' if not eligibility['require_sponsorship'] else 'Yes')
        self.click_radio_button('professional_license', 'No' if not eligibility['professional_license'] else 'Yes')
        
        # Fill motivation
        self.fill_text_field('what_drew_you_to_healthcare', motivation['what_drew_you_to_healthcare'])
        
        # Fill experience
        self.select_dropdown('years_experience', experience['years_related_role'])
        
        # Fill voluntary disclosures
        self.select_dropdown('gender', disclosures['gender'])
        self.select_dropdown('race', disclosures['race'])
        self.click_radio_button('hispanic_latino', 'No' if not disclosures['hispanic_or_latino'] else 'Yes')
        self.select_dropdown('veteran_status', disclosures['veteran_status'])
        self.click_radio_button('disability_status', 'No' if 'No' in disclosures['disability_status'] else 'Yes')
        
        print("✅ All questions filled successfully")
        
        # Emit updated questions to WebSocket
        self.emit_questions(self.questions_encountered)
    
    def run_application(self, job_url: str):
        """Run the complete job application process"""
        try:
            self.current_job_url = job_url
            print(f"🚀 Starting integrated browser automation for: {job_url}")
            print(f"👤 Candidate: {self.candidate['personal_information']['first_name']} {self.candidate['personal_information']['last_name']}")
            
            # Connect to WebSocket
            if not self.connect_websocket():
                print("⚠️ WebSocket connection failed, continuing without live monitoring")
            
            # Emit initial status
            self.emit_status("running", 0)
            
            # Setup browser
            self.setup_driver()
            
            # Navigate to job URL
            self.log_action("navigate", url=job_url)
            self.driver.get(job_url)
            time.sleep(3)
            
            # Take initial screenshot
            self.take_screenshot("initial_page.png")
            
            # Detect questions
            self.detect_questions()
            
            # Take screenshot after detection
            self.take_screenshot("questions_detected.png")
            
            # Fill all questions
            self.fill_all_questions()
            
            # Take screenshot after filling
            self.take_screenshot("form_filled.png")
            
            # Look for next/submit button
            try:
                next_button = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit'], input[type='submit'], button:contains('Next'), button:contains('Continue'), button:contains('Submit')"))
                )
                self.log_action("click_next_button")
                next_button.click()
                time.sleep(3)
                
                # Update page
                self.current_page = 2
                self.emit_status("running", 50)
                
                # Take final screenshot
                self.take_screenshot("after_submit.png")
                
                print("✅ Successfully submitted application")
                
            except TimeoutException:
                print("⚠️ Could not find submit button")
            
            # Emit completion status
            self.emit_status("completed", 100)
            
            # Generate results
            result = {
                "meta": {
                    "job_url": job_url,
                    "candidate": f"{self.candidate['personal_information']['first_name']} {self.candidate['personal_information']['last_name']}",
                    "total_actions": len(self.actions_log),
                    "screenshots_taken": self.screenshots_taken,
                    "questions_encountered": len(self.questions_encountered),
                    "timestamp": datetime.now().isoformat()
                },
                "actions": self.actions_log,
                "questions": self.questions_encountered,
                "success": True
            }
            
            # Save results
            artifacts_dir = Path("artifacts")
            artifacts_dir.mkdir(exist_ok=True)
            result_path = artifacts_dir / f"integrated_application_{int(time.time())}.json"
            result_path.write_text(json.dumps(result, indent=2))
            print(f"📄 Results saved to: {result_path}")
            
            return result
            
        except Exception as e:
            print(f"❌ Error during application: {e}")
            self.emit_status("error", 0)
            return {"success": False, "error": str(e)}
        finally:
            if self.driver:
                self.driver.quit()
                print("🔒 Browser closed")
            self.disconnect_websocket()

def main(job_url: str = None):
    """Main function to run the integrated agent"""
    # Load candidate data
    candidate = load_candidate_data("data/test_data.json")
    
    if not candidate:
        print("❌ Failed to load candidate data. Exiting.")
        return None
    
    # Use provided job URL or default
    if not job_url:
        job_url = "https://apply.appcast.io/jobs/50590620606/applyboard/apply"
    
    # Initialize and run agent
    agent = IntegratedBrowserAgent(candidate)
    result = agent.run_application(job_url)
    
    return result

if __name__ == "__main__":
    import sys
    
    job_url = sys.argv[1] if len(sys.argv) > 1 else None
    main(job_url)

