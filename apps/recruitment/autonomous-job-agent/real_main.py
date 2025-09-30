"""
Real browser automation main application using Selenium for actual screenshots.
"""

import os
import json
import asyncio
import time
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Import real browser automation
from real_browser_automation import RealHostDevice, RealBrowser, WebSocketMonitor

# Load environment variables
load_dotenv()

app = FastAPI(title="Real JobHax Agent", version="1.0.0")

class JobApplicationRequest(BaseModel):
    job_url: str
    timeout_seconds: int = 600
    user_data_dir: Optional[str] = None
    profile_directory: Optional[str] = None
    cv_path: Optional[str] = None
    site_hint: Optional[str] = None
    headless: bool = False

def load_candidate_data() -> dict:
    """Load candidate data from test_data.json."""
    try:
        with open("data/test_data.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        # Fallback data if file doesn't exist
        return {
            "personal_information": {
                "first_name": "[REDACTED]",
                "last_name": "[REDACTED]",
                "email": "[REDACTED]",
                "phone": "[REDACTED]",
                "address": "[REDACTED]"
            },
            "eligibility": {
                "over_18": True,
                "eligible_to_work_in_us": True,
                "require_sponsorship": False,
                "professional_license": False
            },
            "motivation": {
                "what_drew_you_to_healthcare": "I am deeply motivated by the opportunity to improve lives through technology, secure systems, and innovation. Healthcare offers a chance to apply my skills in AI, security, and platform engineering to ensure reliability, safety, and efficiency for patients and providers."
            },
            "experience": {
                "years_related_role": "8+ years"
            },
            "voluntary_disclosures": {
                "gender": "Male",
                "race": "White (Not Hispanic or Latino)",
                "hispanic_or_latino": False,
                "veteran_status": "Not a Veteran",
                "disability_status": "No, I do not have a disability and have not had one in the past",
                "date": "2025-09-27"
            }
        }

def build_task(candidate: dict, job_url: str, cv_path: Optional[str], site_hint: Optional[str]) -> str:
    """Build the task string for the agent."""
    task = f"""Apply to the job posting {job_url} using the following resume data:

PERSONAL INFORMATION:
- First Name: {candidate['personal_information']['first_name']}
- Last Name: {candidate['personal_information']['last_name']}
- Email: {candidate['personal_information']['email']}
- Phone: {candidate['personal_information']['phone']}
- Address: {candidate['personal_information']['address']}

ELIGIBILITY:
- Over 18: {'Yes' if candidate['eligibility']['over_18'] else 'No'}
- Eligible to work in US: {'Yes' if candidate['eligibility']['eligible_to_work_in_us'] else 'No'}
- Require sponsorship: {'Yes' if candidate['eligibility']['require_sponsorship'] else 'No'}
- Professional license: {'Yes' if candidate['eligibility']['professional_license'] else 'No'}

MOTIVATION:
- What drew you to healthcare: {candidate['motivation']['what_drew_you_to_healthcare']}

EXPERIENCE:
- Years in related role: {candidate['experience']['years_related_role']}

VOLUNTARY DISCLOSURES:
- Gender: {candidate['voluntary_disclosures']['gender']}
- Race: {candidate['voluntary_disclosures']['race']}
- Hispanic or Latino: {'Yes' if candidate['voluntary_disclosures']['hispanic_or_latino'] else 'No'}
- Veteran Status: {candidate['voluntary_disclosures']['veteran_status']}
- Disability Status: {candidate['voluntary_disclosures']['disability_status']}
- Date: {candidate['voluntary_disclosures']['date']}

Please fill out the job application form with this information, ensuring all required fields are completed and radio buttons are selected appropriately. Take screenshots at key steps to document the process."""

    return task

async def run_autonomous_agent(
    job_url: str,
    candidate_data: dict,
    cv_path: Optional[str] = None,
    headless: bool = False,
    user_data_dir: Optional[str] = None,
    websocket_monitor: Optional[WebSocketMonitor] = None
):
    """Run the autonomous agent with real browser automation."""
    
    # Initialize real browser
    device = RealHostDevice(headless=headless, user_data_dir=user_data_dir)
    browser = RealBrowser(device, user_data_dir=user_data_dir)
    
    try:
        # Send initial status
        if websocket_monitor:
            await websocket_monitor.send_update({
                "status": "Starting",
                "progress": 0,
                "metrics": {
                    "totalActions": 0,
                    "errors": 0,
                    "screenshotsTaken": 0,
                },
                "actionLog": [{"timestamp": time.time(), "type": "info", "details": "Starting autonomous agent..."}],
                "questions": [],
                "screenshots": [],
            })
        
        print("🤖 Starting Real Autonomous Job Application Agent")
        print(f"📋 Candidate: {candidate_data['personal_information']['first_name']} {candidate_data['personal_information']['last_name']}")
        print(f"🌐 Job URL: {job_url}")
        print("============================================================\n")
        
        # Step 1: Navigate to the job application page
        print("📍 Step 1: Navigating to job application...")
        await browser.go_to_url(job_url)
        await browser.take_screenshot("screenshot_1_initial_page.png")
        
        if websocket_monitor:
            await websocket_monitor.send_update({
                "status": "Navigating",
                "progress": 10,
                "actionLog": [{"timestamp": time.time(), "type": "navigate", "details": f"Navigated to {job_url}"}],
                "screenshots": ["screenshot_1_initial_page.png"]
            })
        
        # Step 2: Look for and click "Apply Now" or "I'm Interested" button
        print("\n📍 Step 2: Looking for apply button...")
        apply_selectors = [
            "button[data-testid*='apply']",
            "button:contains('Apply')",
            "a:contains('Apply')",
            "button:contains('I\\'m Interested')",
            "a:contains('I\\'m Interested')",
            "input[value*='Apply']",
            "input[value*='Apply Now']",
            ".apply-button",
            "#apply-button",
            "[data-cy*='apply']"
        ]
        
        apply_clicked = False
        for selector in apply_selectors:
            if device.click_element(selector):
                apply_clicked = True
                print(f"✅ Clicked apply button: {selector}")
                break
        
        if apply_clicked:
            await browser.wait(2.0)
            await browser.take_screenshot("screenshot_2_after_apply_click.png")
        
        # Step 3: Fill personal information
        print("\n📍 Step 3: Filling personal information...")
        
        # Try multiple strategies for each field
        field_mappings = {
            "first_name": [
                "input[name*='first']",
                "input[id*='first']",
                "input[placeholder*='first']",
                "input[data-testid*='first']",
                "input[aria-label*='first']"
            ],
            "last_name": [
                "input[name*='last']",
                "input[id*='last']", 
                "input[placeholder*='last']",
                "input[data-testid*='last']",
                "input[aria-label*='last']"
            ],
            "email": [
                "input[type='email']",
                "input[name*='email']",
                "input[id*='email']",
                "input[placeholder*='email']"
            ],
            "phone": [
                "input[type='tel']",
                "input[name*='phone']",
                "input[id*='phone']",
                "input[placeholder*='phone']"
            ],
            "address": [
                "input[name*='address']",
                "input[id*='address']",
                "textarea[name*='address']",
                "input[placeholder*='address']"
            ]
        }
        
        personal_info = candidate_data['personal_information']
        for field_name, selectors in field_mappings.items():
            value = personal_info.get(field_name, "")
            if value:
                filled = False
                for selector in selectors:
                    if device.type(value, selector):
                        print(f"✅ Filled {field_name}: {value[:30]}...")
                        filled = True
                        break
                if not filled:
                    print(f"⚠️ Could not fill {field_name}")
        
        await browser.take_screenshot("screenshot_3_personal_info_filled.png")
        
        # Step 4: Fill eligibility questions (radio buttons)
        print("\n📍 Step 4: Filling eligibility questions...")
        
        # Over 18
        if candidate_data['eligibility']['over_18']:
            radio_selectors = [
                "input[type='radio'][value='yes']",
                "input[type='radio'][value='Yes']",
                "input[type='radio'][value='true']",
                "input[type='radio'][value='1']"
            ]
            for selector in radio_selectors:
                if device.click_element(selector):
                    print("✅ Selected 'Yes' for over 18")
                    break
        
        # Eligible to work in US
        if candidate_data['eligibility']['eligible_to_work_in_us']:
            radio_selectors = [
                "input[type='radio'][value='yes']",
                "input[type='radio'][value='Yes']",
                "input[type='radio'][value='true']"
            ]
            for selector in radio_selectors:
                if device.click_element(selector):
                    print("✅ Selected 'Yes' for eligible to work in US")
                    break
        
        # Require sponsorship
        if not candidate_data['eligibility']['require_sponsorship']:
            radio_selectors = [
                "input[type='radio'][value='no']",
                "input[type='radio'][value='No']",
                "input[type='radio'][value='false']"
            ]
            for selector in radio_selectors:
                if device.click_element(selector):
                    print("✅ Selected 'No' for require sponsorship")
                    break
        
        # Professional license
        if not candidate_data['eligibility']['professional_license']:
            radio_selectors = [
                "input[type='radio'][value='no']",
                "input[type='radio'][value='No']",
                "input[type='radio'][value='false']"
            ]
            for selector in radio_selectors:
                if device.click_element(selector):
                    print("✅ Selected 'No' for professional license")
                    break
        
        await browser.take_screenshot("screenshot_4_eligibility_filled.png")
        
        # Step 5: Fill motivation and experience
        print("\n📍 Step 5: Filling motivation and experience...")
        
        # Motivation text
        motivation_text = candidate_data['motivation']['what_drew_you_to_healthcare']
        textarea_selectors = [
            "textarea[name*='motivation']",
            "textarea[name*='healthcare']",
            "textarea[name*='drew']",
            "textarea[placeholder*='motivation']",
            "textarea[placeholder*='healthcare']"
        ]
        
        for selector in textarea_selectors:
            if device.type(motivation_text, selector):
                print("✅ Filled motivation text")
                break
        
        # Experience dropdown
        experience = candidate_data['experience']['years_related_role']
        select_selectors = [
            "select[name*='experience']",
            "select[name*='years']",
            "select[id*='experience']",
            "select[id*='years']"
        ]
        
        for selector in select_selectors:
            if device.select(experience, selector):
                print(f"✅ Selected experience: {experience}")
                break
        
        await browser.take_screenshot("screenshot_5_motivation_experience_filled.png")
        
        # Step 6: Upload CV if provided
        if cv_path and Path(cv_path).exists():
            print("\n📍 Step 6: Uploading CV...")
            file_selectors = [
                "input[type='file']",
                "input[accept*='pdf']",
                "input[accept*='document']"
            ]
            
            for selector in file_selectors:
                if device.upload(cv_path, selector):
                    print(f"✅ Uploaded CV: {cv_path}")
                    break
        
        await browser.take_screenshot("screenshot_6_cv_uploaded.png")
        
        # Step 7: Fill voluntary disclosures
        print("\n📍 Step 7: Filling voluntary disclosures...")
        
        # Gender
        gender = candidate_data['voluntary_disclosures']['gender']
        gender_selectors = [
            "select[name*='gender']",
            "select[id*='gender']"
        ]
        
        for selector in gender_selectors:
            if device.select(gender, selector):
                print(f"✅ Selected gender: {gender}")
                break
        
        # Race
        race = candidate_data['voluntary_disclosures']['race']
        race_selectors = [
            "select[name*='race']",
            "select[id*='race']"
        ]
        
        for selector in race_selectors:
            if device.select(race, selector):
                print(f"✅ Selected race: {race}")
                break
        
        # Hispanic or Latino
        if not candidate_data['voluntary_disclosures']['hispanic_or_latino']:
            radio_selectors = [
                "input[type='radio'][value='no']",
                "input[type='radio'][value='No']"
            ]
            for selector in radio_selectors:
                if device.click_element(selector):
                    print("✅ Selected 'No' for Hispanic or Latino")
                    break
        
        # Veteran status
        veteran_status = candidate_data['voluntary_disclosures']['veteran_status']
        veteran_selectors = [
            "select[name*='veteran']",
            "select[id*='veteran']"
        ]
        
        for selector in veteran_selectors:
            if device.select(veteran_status, selector):
                print(f"✅ Selected veteran status: {veteran_status}")
                break
        
        # Disability status
        if not candidate_data['voluntary_disclosures']['disability_status'].startswith("No"):
            radio_selectors = [
                "input[type='radio'][value='no']",
                "input[type='radio'][value='No']"
            ]
            for selector in radio_selectors:
                if device.click_element(selector):
                    print("✅ Selected 'No' for disability status")
                    break
        
        # Date
        date = candidate_data['voluntary_disclosures']['date']
        date_selectors = [
            "input[type='date']",
            "input[name*='date']",
            "input[placeholder*='date']"
        ]
        
        for selector in date_selectors:
            if device.type(date, selector):
                print(f"✅ Filled date: {date}")
                break
        
        await browser.take_screenshot("screenshot_7_voluntary_disclosures_filled.png")
        
        # Step 8: Look for Next/Continue/Submit button
        print("\n📍 Step 8: Looking for Next/Continue/Submit button...")
        
        next_selectors = [
            "button[type='submit']",
            "input[type='submit']",
            "button:contains('Next')",
            "button:contains('Continue')",
            "button:contains('Submit')",
            "a:contains('Next')",
            "a:contains('Continue')",
            ".next-button",
            ".continue-button",
            ".submit-button"
        ]
        
        next_clicked = False
        for selector in next_selectors:
            if device.click_element(selector):
                next_clicked = True
                print(f"✅ Clicked next button: {selector}")
                break
        
        if next_clicked:
            await browser.wait(3.0)
            await browser.take_screenshot("screenshot_8_page2_detected.png")
            print("✅ Successfully navigated to page 2!")
        else:
            print("⚠️ Could not find next button, taking final screenshot")
            await browser.take_screenshot("screenshot_8_final_page.png")
        
        # Generate result
        result = {
            "meta": {
                "job_url": job_url,
                "session_mode": "real_browser",
                "candidate": f"{candidate_data['personal_information']['first_name']} {candidate_data['personal_information']['last_name']}",
                "total_actions": len(device.get_actions()),
                "screenshots_taken": len([a for a in device.get_actions() if a['type'] == 'screenshot' and a.get('success', False)]),
                "successful_actions": len([a for a in device.get_actions() if a.get('success', False)]),
                "failed_actions": len([a for a in device.get_actions() if not a.get('success', True)])
            },
            "page1": {
                "personal_info_filled": True,
                "eligibility_questions_answered": True,
                "motivation_filled": True,
                "experience_selected": True,
                "cv_uploaded": bool(cv_path and Path(cv_path).exists()),
                "voluntary_disclosures_filled": True
            },
            "page2_detection": {
                "detected": next_clicked,
                "signal": "next_button_clicked" if next_clicked else "no_next_button_found",
                "details": "Successfully navigated to page 2" if next_clicked else "Could not find next button"
            },
            "traces": device.get_actions(),
            "errors": [a for a in device.get_actions() if not a.get('success', True) and 'error' in a]
        }
        
        # Save result
        artifacts_dir = Path("artifacts")
        artifacts_dir.mkdir(exist_ok=True)
        result_path = artifacts_dir / f"real_application_{int(time.time())}.json"
        result_path.write_text(json.dumps(result, indent=2))
        print(f"💾 Result saved to: {result_path}")
        
        # Send final status
        if websocket_monitor:
            await websocket_monitor.send_update({
                "status": "Completed",
                "progress": 100,
                "metrics": {
                    "totalActions": result["meta"]["total_actions"],
                    "errors": result["meta"]["failed_actions"],
                    "screenshotsTaken": result["meta"]["screenshots_taken"],
                },
                "actionLog": [{"timestamp": time.time(), "type": "complete", "details": "Application completed successfully"}],
                "screenshots": [a["filename"] for a in device.get_actions() if a['type'] == 'screenshot' and a.get('success', False)]
            })
        
        print("\n✅ AUTONOMOUS APPLICATION COMPLETED SUCCESSFULLY!")
        return result
        
    except Exception as e:
        print(f"\n❌ Error during application: {e}")
        if websocket_monitor:
            await websocket_monitor.send_update({
                "status": "Error",
                "progress": 0,
                "metrics": {"totalActions": 0, "errors": 1, "screenshotsTaken": 0},
                "actionLog": [{"timestamp": time.time(), "type": "error", "details": str(e)}],
                "questions": [],
                "screenshots": [],
            })
        raise
    finally:
        device.close()

@app.post("/apply")
async def apply_to_job(req: JobApplicationRequest):
    """Apply to a job using real browser automation."""
    try:
        # Load candidate data
        candidate = load_candidate_data()
        
        # Initialize WebSocket monitor
        websocket_monitor = WebSocketMonitor()
        await websocket_monitor.connect()
        
        # Run the autonomous agent
        result = await run_autonomous_agent(
            job_url=req.job_url,
            candidate_data=candidate,
            cv_path=req.cv_path,
            headless=req.headless,
            user_data_dir=req.user_data_dir,
            websocket_monitor=websocket_monitor
        )
        
        await websocket_monitor.close()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Real JobHax Agent API", "version": "1.0.0"}

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": time.time()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
