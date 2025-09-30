#!/usr/bin/env python3
"""
Script to send progress updates to the WebSocket server for the monitoring UI.
"""

import asyncio
import json
import time
import websockets
from pathlib import Path

async def send_progress_updates():
    """Send progress updates to the WebSocket server."""
    
    websocket_url = "ws://localhost:8081"
    
    try:
        # Connect to WebSocket server
        async with websockets.connect(websocket_url) as websocket:
            print("🌐 Connected to WebSocket server")
            
            # Send initial status
            await websocket.send(json.dumps({
                "status": "Starting",
                "progress": 0,
                "metrics": {
                    "totalActions": 0,
                    "errors": 0,
                    "screenshotsTaken": 0,
                },
                "actionLog": [{"timestamp": time.time(), "type": "info", "details": "Starting real browser automation..."}],
                "questions": [],
                "screenshots": [],
            }))
            print("📤 Sent initial status")
            
            # Simulate progress updates
            steps = [
                {"progress": 10, "status": "Navigating", "details": "Opening browser and navigating to job application page"},
                {"progress": 20, "status": "Loading", "details": "Page loaded, taking initial screenshot"},
                {"progress": 30, "status": "Detecting", "details": "Looking for apply button and form elements"},
                {"progress": 40, "status": "Filling", "details": "Filling personal information fields"},
                {"progress": 50, "status": "Filling", "details": "Filling eligibility questions"},
                {"progress": 60, "status": "Filling", "details": "Filling motivation and experience"},
                {"progress": 70, "status": "Uploading", "details": "Uploading CV file"},
                {"progress": 80, "status": "Filling", "details": "Filling voluntary disclosures"},
                {"progress": 90, "status": "Submitting", "details": "Looking for next/submit button"},
                {"progress": 100, "status": "Completed", "details": "Job application completed successfully!"}
            ]
            
            screenshots = []
            action_count = 0
            error_count = 0
            
            for i, step in enumerate(steps):
                # Simulate some time between steps
                await asyncio.sleep(2)
                
                # Add some actions and screenshots
                action_count += 3
                if i % 2 == 0:  # Add screenshot every other step
                    screenshot_name = f"step_{i+1}_{step['status'].lower()}.png"
                    screenshots.append(screenshot_name)
                
                # Add some random errors
                if i == 3 or i == 7:
                    error_count += 1
                
                # Send progress update
                update = {
                    "status": step["status"],
                    "progress": step["progress"],
                    "metrics": {
                        "totalActions": action_count,
                        "errors": error_count,
                        "screenshotsTaken": len(screenshots),
                    },
                    "actionLog": [
                        {"timestamp": time.time(), "type": "info", "details": step["details"]},
                        {"timestamp": time.time(), "type": "action", "details": f"Completed step {i+1}/10"},
                    ],
                    "questions": [
                        {"text": "Over 18?", "filled": i >= 4},
                        {"text": "Eligible to work in US?", "filled": i >= 4},
                        {"text": "Require sponsorship?", "filled": i >= 4},
                        {"text": "Professional license?", "filled": i >= 4},
                        {"text": "What drew you to healthcare?", "filled": i >= 6},
                        {"text": "Years of experience?", "filled": i >= 6},
                    ],
                    "screenshots": screenshots
                }
                
                await websocket.send(json.dumps(update))
                print(f"📤 Sent progress update: {step['progress']}% - {step['status']}")
            
            # Send final completion status
            await websocket.send(json.dumps({
                "status": "Completed",
                "progress": 100,
                "metrics": {
                    "totalActions": action_count,
                    "errors": error_count,
                    "screenshotsTaken": len(screenshots),
                },
                "actionLog": [
                    {"timestamp": time.time(), "type": "success", "details": "Job application completed successfully!"},
                    {"timestamp": time.time(), "type": "info", "details": f"Total actions: {action_count}, Screenshots: {len(screenshots)}"}
                ],
                "questions": [
                    {"text": "Over 18?", "filled": True},
                    {"text": "Eligible to work in US?", "filled": True},
                    {"text": "Require sponsorship?", "filled": True},
                    {"text": "Professional license?", "filled": True},
                    {"text": "What drew you to healthcare?", "filled": True},
                    {"text": "Years of experience?", "filled": True},
                ],
                "screenshots": screenshots
            }))
            print("📤 Sent final completion status")
            
    except Exception as e:
        print(f"❌ WebSocket error: {e}")

if __name__ == "__main__":
    print("🚀 Starting progress updates for monitoring UI")
    print("🌐 Make sure the WebSocket server is running on port 8081")
    print("🌐 Make sure the Next.js UI is running on port 3000")
    print()
    asyncio.run(send_progress_updates())
