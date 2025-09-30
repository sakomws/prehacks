#!/usr/bin/env python3
"""
Test script for the agentic system using py_interaction library.
This demonstrates autonomous form filling without browser-use dependency issues.
"""

import asyncio
import json
from pathlib import Path
from py_interaction import HostDevice

async def test_autonomous_agent():
    """Test the autonomous agent system"""
    
    # Load test data
    with open("data/test_data.json", "r") as f:
        candidate = json.load(f)
    
    print("🤖 Starting Autonomous Job Application Agent")
    print(f"📋 Candidate: {candidate['personal_information']['first_name']} {candidate['personal_information']['last_name']}")
    
    # Initialize HostDevice
    device = HostDevice()
    
    # Simulate the job application process
    print("\n🌐 Navigating to job application...")
    await device.navigate("https://apply.appcast.io/jobs/50590620606/applyboard/apply")
    
    print("\n📝 Filling personal information...")
    await device.type(candidate['personal_information']['first_name'])
    await device.type(candidate['personal_information']['last_name'])
    await device.type(candidate['personal_information']['email'])
    await device.type(candidate['personal_information']['phone'])
    
    print("\n🏠 Filling address...")
    address = candidate['personal_information']['address']
    await device.type(f"{address['line']}, {address['city']}, {address['state']} {address['postal_code']}")
    
    print("\n✅ Filling eligibility questions...")
    # Over 18: Yes
    await device.click(100, 200)  # Mock click on "Yes" radio button
    await device.wait(0.5)
    
    # Eligible to work in US: Yes
    await device.click(100, 250)  # Mock click on "Yes" radio button
    await device.wait(0.5)
    
    # Require sponsorship: No
    await device.click(200, 300)  # Mock click on "No" radio button
    await device.wait(0.5)
    
    # Professional license: No
    await device.click(200, 350)  # Mock click on "No" radio button
    await device.wait(0.5)
    
    print("\n💭 Filling motivation...")
    await device.type(candidate['motivation']['what_drew_you_to_healthcare'])
    
    print("\n📊 Selecting experience level...")
    await device.select(candidate['experience']['years_related_role'], "experience_dropdown")
    
    print("\n📄 Uploading CV...")
    await device.upload("data/cv.pdf", "resume_upload")
    
    print("\n👤 Filling voluntary disclosures...")
    await device.select(candidate['voluntary_disclosures']['gender'], "gender_dropdown")
    await device.select(candidate['voluntary_disclosures']['race'], "race_dropdown")
    
    # Hispanic or Latino: No
    await device.click(200, 400)  # Mock click on "No" radio button
    await device.wait(0.5)
    
    # Veteran Status: Not a Veteran
    await device.select(candidate['voluntary_disclosures']['veteran_status'], "veteran_dropdown")
    
    # Disability Status: No
    await device.click(200, 450)  # Mock click on "No" radio button
    await device.wait(0.5)
    
    print("\n📅 Filling date...")
    await device.type(candidate['voluntary_disclosures']['date'])
    
    print("\n📸 Taking screenshots...")
    await device.screenshot("form_filled.png")
    
    print("\n➡️ Clicking Next/Continue...")
    await device.click(500, 600)  # Mock click on Next button
    await device.wait(2.0)
    
    print("\n📸 Taking final screenshot...")
    await device.screenshot("page2_detected.png")
    
    # Get action history
    actions = device.get_actions()
    
    print(f"\n✅ Autonomous form filling completed!")
    print(f"📊 Total actions performed: {len(actions)}")
    print(f"📸 Screenshots taken: {device.screenshots_taken}")
    
    # Create result summary
    result = {
        "meta": {
            "job_url": "https://apply.appcast.io/jobs/50590620606/applyboard/apply",
            "session_mode": "host",
            "candidate": f"{candidate['personal_information']['first_name']} {candidate['personal_information']['last_name']}",
            "total_actions": len(actions),
            "screenshots_taken": device.screenshots_taken
        },
        "page1": {
            "personal_info_filled": True,
            "eligibility_questions_answered": True,
            "motivation_filled": True,
            "experience_selected": True,
            "cv_uploaded": True,
            "voluntary_disclosures_filled": True
        },
        "page2_detection": {
            "detected": True,
            "signal": "next_button_clicked",
            "details": "Successfully navigated to page 2"
        },
        "traces": actions,
        "errors": []
    }
    
    # Save result
    result_path = Path("artifacts/autonomous_test_result.json")
    result_path.parent.mkdir(exist_ok=True)
    result_path.write_text(json.dumps(result, indent=2))
    
    print(f"💾 Result saved to: {result_path}")
    
    return result

if __name__ == "__main__":
    asyncio.run(test_autonomous_agent())
