#!/usr/bin/env python3
"""
Test script for real browser automation with actual screenshots.
"""

import asyncio
import json
import time
from pathlib import Path
from real_browser_automation import RealHostDevice, RealBrowser, WebSocketMonitor

async def test_real_browser_automation():
    """Test the real browser automation with actual screenshots."""
    
    print("🚀 Testing Real Browser Automation")
    print("==================================")
    
    # Load test data
    with open("data/test_data.json", "r") as f:
        candidate_data = json.load(f)
    
    job_url = "https://apply.appcast.io/jobs/50590620606/applyboard/apply"
    
    # Initialize real browser (non-headless for testing)
    print("🌐 Initializing real browser...")
    device = RealHostDevice(headless=False, user_data_dir=None)
    browser = RealBrowser(device)
    
    try:
        # Test navigation
        print("\n📍 Testing navigation...")
        await browser.go_to_url(job_url)
        await browser.take_screenshot("test_navigation.png")
        print("✅ Navigation successful")
        
        # Test form field detection
        print("\n🔍 Testing form field detection...")
        
        # Look for common form elements
        form_elements = device.find_elements("input, select, textarea")
        print(f"Found {len(form_elements)} form elements")
        
        # Test text input
        print("\n📝 Testing text input...")
        test_text = "Test Input"
        input_elements = device.find_elements("input[type='text']")
        if input_elements:
            element = input_elements[0]
            element.clear()
            element.send_keys(test_text)
            print(f"✅ Text input successful: {test_text}")
        else:
            print("⚠️ No text input fields found")
        
        # Test dropdown selection
        print("\n📋 Testing dropdown selection...")
        select_elements = device.find_elements("select")
        if select_elements:
            select = select_elements[0]
            try:
                from selenium.webdriver.common.by import By
                options = [option.text for option in select.find_elements(By.TAG_NAME, "option")]
                print(f"Found dropdown with options: {options[:5]}...")  # Show first 5 options
            except Exception as e:
                print(f"⚠️ Could not get dropdown options: {e}")
        else:
            print("⚠️ No dropdown elements found")
        
        # Test radio button clicking
        print("\n🔘 Testing radio button clicking...")
        radio_elements = device.find_elements("input[type='radio']")
        if radio_elements:
            print(f"Found {len(radio_elements)} radio buttons")
            # Try clicking the first radio button
            try:
                radio_elements[0].click()
                print("✅ Radio button click successful")
            except Exception as e:
                print(f"⚠️ Radio button click failed: {e}")
        else:
            print("⚠️ No radio buttons found")
        
        # Test file upload (if file input exists)
        print("\n📄 Testing file upload...")
        file_elements = device.find_elements("input[type='file']")
        if file_elements:
            print(f"Found {len(file_elements)} file input elements")
            # Note: We won't actually upload a file in this test
        else:
            print("⚠️ No file input elements found")
        
        # Take final screenshot
        print("\n📸 Taking final screenshot...")
        await browser.take_screenshot("test_final.png")
        
        # Test scrolling
        print("\n📜 Testing scrolling...")
        await browser.scroll(down=True, num_pages=1.0)
        await browser.take_screenshot("test_after_scroll.png")
        
        print("\n✅ All tests completed successfully!")
        
        # Show actions taken
        actions = device.get_actions()
        print(f"\n📊 Actions taken: {len(actions)}")
        for i, action in enumerate(actions[-5:], 1):  # Show last 5 actions
            print(f"  {i}. {action['type']}: {action.get('success', 'unknown')}")
        
        # Show screenshots taken
        screenshots = [a for a in actions if a['type'] == 'screenshot' and a.get('success', False)]
        print(f"\n📸 Screenshots taken: {len(screenshots)}")
        for screenshot in screenshots:
            print(f"  - {screenshot['filename']} -> {screenshot.get('path', 'N/A')}")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Close browser
        print("\n🔒 Closing browser...")
        device.close()
        print("✅ Browser closed")

async def test_websocket_monitoring():
    """Test WebSocket monitoring integration."""
    
    print("\n🌐 Testing WebSocket monitoring...")
    
    # Initialize WebSocket monitor
    websocket_monitor = WebSocketMonitor()
    
    try:
        # Try to connect
        connected = await websocket_monitor.connect()
        if connected:
            print("✅ WebSocket connection successful")
            
            # Send test update
            await websocket_monitor.send_update({
                "status": "Testing",
                "progress": 50,
                "metrics": {"totalActions": 5, "errors": 0, "screenshotsTaken": 2},
                "actionLog": [{"timestamp": time.time(), "type": "test", "details": "WebSocket test successful"}],
                "questions": [],
                "screenshots": ["test_navigation.png", "test_final.png"]
            })
            print("✅ WebSocket update sent")
        else:
            print("⚠️ WebSocket connection failed (server may not be running)")
    
    except Exception as e:
        print(f"⚠️ WebSocket test failed: {e}")
    
    finally:
        await websocket_monitor.close()

if __name__ == "__main__":
    print("🧪 Starting Real Browser Automation Tests")
    print("=========================================")
    
    # Run the tests
    asyncio.run(test_real_browser_automation())
    asyncio.run(test_websocket_monitoring())
    
    print("\n🎉 All tests completed!")
    print("\n📁 Check the 'artifacts/screenshots/' directory for actual screenshots!")
