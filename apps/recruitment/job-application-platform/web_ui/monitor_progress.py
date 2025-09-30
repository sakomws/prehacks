#!/usr/bin/env python3
"""
Monitor JobHax Application Progress
Shows real-time status updates and screenshots
"""

import requests
import time
import json
from pathlib import Path

def monitor_application(job_id, max_attempts=60):
    """Monitor application progress with real-time updates"""
    print(f"🔍 Monitoring application for job: {job_id}")
    print("=" * 60)
    
    for attempt in range(max_attempts):
        try:
            # Get current status
            response = requests.get(f"http://localhost:5001/api/status/{job_id}")
            status = response.json()
            
            # Display status
            status_emoji = {
                "ready": "⚪",
                "applying": "🟡", 
                "success": "✅",
                "error": "❌",
                "partial": "⚠️"
            }.get(status["status"], "❓")
            
            print(f"[{attempt+1:2d}] {status_emoji} {status['message']}")
            
            # Check for completion
            if status["status"] in ["success", "error", "partial"]:
                print("\n" + "=" * 60)
                print(f"🎯 Final Status: {status['status'].upper()}")
                print(f"📝 Message: {status['message']}")
                
                # Check for screenshots
                screenshots_dir = Path(__file__).parent.parent / "screenshots"
                if screenshots_dir.exists():
                    screenshot_files = list(screenshots_dir.glob(f"job_{job_id}_*.png"))
                    if screenshot_files:
                        print(f"\n📸 Screenshots captured:")
                        for screenshot in sorted(screenshot_files):
                            print(f"   - {screenshot.name}")
                    else:
                        print("\n📸 No screenshots found")
                
                break
            
            # Wait before next check
            time.sleep(2)
            
        except Exception as e:
            print(f"❌ Error checking status: {e}")
            time.sleep(2)
    
    else:
        print(f"\n⏰ Monitoring timed out after {max_attempts} attempts")

if __name__ == "__main__":
    import sys
    job_id = sys.argv[1] if len(sys.argv) > 1 else "job_2"
    monitor_application(job_id)
