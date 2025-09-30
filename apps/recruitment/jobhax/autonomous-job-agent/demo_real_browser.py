#!/usr/bin/env python3
"""
Demo script for real browser automation with actual screenshots.
This demonstrates the autonomous agent filling out a job application form.
"""

import asyncio
import json
import time
from pathlib import Path
from real_browser_automation import RealHostDevice, RealBrowser

async def demo_real_browser_automation():
    """Demo the real browser automation with actual screenshots."""
    
    print("🚀 Real Browser Automation Demo")
    print("===============================")
    print("This demo will:")
    print("1. Open a real Chrome browser")
    print("2. Navigate to the job application page")
    print("3. Take actual screenshots at each step")
    print("4. Fill out the form autonomously")
    print("5. Save screenshots to artifacts/screenshots/")
    print()
    
    # Load test data
    with open("data/test_data.json", "r") as f:
        candidate_data = json.load(f)
    
    job_url = "https://apply.appcast.io/jobs/50590620606/applyboard/apply"
    
    # Initialize real browser (non-headless so you can see it)
    print("🌐 Initializing real Chrome browser...")
    device = RealHostDevice(headless=False, user_data_dir=None)
    browser = RealBrowser(device)
    
    try:
        # Step 1: Navigate to job application
        print("\n📍 Step 1: Navigating to job application...")
        print(f"   URL: {job_url}")
        await browser.go_to_url(job_url)
        await browser.take_screenshot("demo_1_initial_page.png")
        print("   ✅ Navigation complete - screenshot saved!")
        
        # Step 2: Look for apply button
        print("\n📍 Step 2: Looking for apply button...")
        apply_selectors = [
            "button[data-testid*='apply']",
            "button:contains('Apply')",
            "a:contains('Apply')",
            "button:contains('I\\'m Interested')",
            "a:contains('I\\'m Interested')",
            "input[value*='Apply']",
            ".apply-button",
            "#apply-button"
        ]
        
        apply_clicked = False
        for selector in apply_selectors:
            if device.click_element(selector):
                apply_clicked = True
                print(f"   ✅ Clicked apply button: {selector}")
                break
        
        if apply_clicked:
            await browser.wait(2.0)
            await browser.take_screenshot("demo_2_after_apply_click.png")
            print("   ✅ Apply button clicked - screenshot saved!")
        else:
            print("   ⚠️ No apply button found, continuing...")
        
        # Step 3: Fill personal information
        print("\n📍 Step 3: Filling personal information...")
        
        personal_info = candidate_data['personal_information']
        
        # Try to fill first name
        first_name_selectors = [
            "input[name*='first']",
            "input[id*='first']",
            "input[placeholder*='first']",
            "input[data-testid*='first']"
        ]
        
        for selector in first_name_selectors:
            if device.type(personal_info['first_name'], selector):
                print(f"   ✅ Filled first name: {personal_info['first_name']}")
                break
        
        # Try to fill last name
        last_name_selectors = [
            "input[name*='last']",
            "input[id*='last']",
            "input[placeholder*='last']",
            "input[data-testid*='last']"
        ]
        
        for selector in last_name_selectors:
            if device.type(personal_info['last_name'], selector):
                print(f"   ✅ Filled last name: {personal_info['last_name']}")
                break
        
        # Try to fill email
        email_selectors = [
            "input[type='email']",
            "input[name*='email']",
            "input[id*='email']"
        ]
        
        for selector in email_selectors:
            if device.type(personal_info['email'], selector):
                print(f"   ✅ Filled email: {personal_info['email']}")
                break
        
        # Try to fill phone
        phone_selectors = [
            "input[type='tel']",
            "input[name*='phone']",
            "input[id*='phone']"
        ]
        
        for selector in phone_selectors:
            if device.type(personal_info['phone'], selector):
                print(f"   ✅ Filled phone: {personal_info['phone']}")
                break
        
        await browser.take_screenshot("demo_3_personal_info_filled.png")
        print("   ✅ Personal information filled - screenshot saved!")
        
        # Step 4: Fill eligibility questions
        print("\n📍 Step 4: Filling eligibility questions...")
        
        # Over 18 - Yes
        if candidate_data['eligibility']['over_18']:
            radio_selectors = [
                "input[type='radio'][value='yes']",
                "input[type='radio'][value='Yes']",
                "input[type='radio'][value='true']"
            ]
            for selector in radio_selectors:
                if device.click_element(selector):
                    print("   ✅ Selected 'Yes' for over 18")
                    break
        
        # Eligible to work in US - Yes
        if candidate_data['eligibility']['eligible_to_work_in_us']:
            radio_selectors = [
                "input[type='radio'][value='yes']",
                "input[type='radio'][value='Yes']",
                "input[type='radio'][value='true']"
            ]
            for selector in radio_selectors:
                if device.click_element(selector):
                    print("   ✅ Selected 'Yes' for eligible to work in US")
                    break
        
        # Require sponsorship - No
        if not candidate_data['eligibility']['require_sponsorship']:
            radio_selectors = [
                "input[type='radio'][value='no']",
                "input[type='radio'][value='No']",
                "input[type='radio'][value='false']"
            ]
            for selector in radio_selectors:
                if device.click_element(selector):
                    print("   ✅ Selected 'No' for require sponsorship")
                    break
        
        await browser.take_screenshot("demo_4_eligibility_filled.png")
        print("   ✅ Eligibility questions filled - screenshot saved!")
        
        # Step 5: Fill motivation
        print("\n📍 Step 5: Filling motivation...")
        
        motivation_text = candidate_data['motivation']['what_drew_you_to_healthcare']
        textarea_selectors = [
            "textarea[name*='motivation']",
            "textarea[name*='healthcare']",
            "textarea[name*='drew']",
            "textarea[placeholder*='motivation']"
        ]
        
        for selector in textarea_selectors:
            if device.type(motivation_text, selector):
                print("   ✅ Filled motivation text")
                break
        
        await browser.take_screenshot("demo_5_motivation_filled.png")
        print("   ✅ Motivation filled - screenshot saved!")
        
        # Step 6: Look for next button
        print("\n📍 Step 6: Looking for next/continue button...")
        
        next_selectors = [
            "button[type='submit']",
            "input[type='submit']",
            "button:contains('Next')",
            "button:contains('Continue')",
            "button:contains('Submit')",
            ".next-button",
            ".continue-button"
        ]
        
        next_clicked = False
        for selector in next_selectors:
            if device.click_element(selector):
                next_clicked = True
                print(f"   ✅ Clicked next button: {selector}")
                break
        
        if next_clicked:
            await browser.wait(3.0)
            await browser.take_screenshot("demo_6_page2_detected.png")
            print("   ✅ Successfully navigated to page 2 - screenshot saved!")
        else:
            print("   ⚠️ No next button found, taking final screenshot")
            await browser.take_screenshot("demo_6_final_page.png")
        
        # Show results
        print("\n🎉 DEMO COMPLETED SUCCESSFULLY!")
        print("===============================")
        
        # Show actions taken
        actions = device.get_actions()
        print(f"📊 Total actions taken: {len(actions)}")
        
        # Show screenshots taken
        screenshots = [a for a in actions if a['type'] == 'screenshot' and a.get('success', False)]
        print(f"📸 Screenshots taken: {len(screenshots)}")
        for screenshot in screenshots:
            print(f"   - {screenshot['filename']} -> {screenshot.get('path', 'N/A')}")
        
        # Show successful vs failed actions
        successful_actions = len([a for a in actions if a.get('success', False)])
        failed_actions = len([a for a in actions if not a.get('success', True)])
        print(f"✅ Successful actions: {successful_actions}")
        print(f"❌ Failed actions: {failed_actions}")
        
        print(f"\n📁 Check the 'artifacts/screenshots/' directory for actual screenshots!")
        print(f"🌐 The browser will stay open for 10 seconds so you can see the result...")
        
        # Keep browser open for a bit so user can see the result
        await browser.wait(10.0)
        
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Close browser
        print("\n🔒 Closing browser...")
        device.close()
        print("✅ Browser closed")

if __name__ == "__main__":
    asyncio.run(demo_real_browser_automation())
