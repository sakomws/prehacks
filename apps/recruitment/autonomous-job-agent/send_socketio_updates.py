#!/usr/bin/env python3
"""
Script to send progress updates to the Socket.IO server for the monitoring UI.
"""

import socketio
import time
import json

# Create a Socket.IO client
sio = socketio.Client()

@sio.event
def connect():
    print("🌐 Connected to Socket.IO server")
    
    # Start the agent simulation
    sio.emit('start_agent', {
        'job_url': 'https://apply.appcast.io/jobs/50590620606/applyboard/apply'
    })
    print("📤 Started agent simulation")

@sio.event
def disconnect():
    print("🔌 Disconnected from Socket.IO server")

@sio.event
def agent_status(data):
    print(f"📊 Agent Status: {data['status']} - Progress: {data['progress']}% - Page: {data['currentPage']}")

@sio.event
def agent_action(data):
    print(f"🎬 Action: {data['action_type']} - Page: {data['page']}")

@sio.event
def questions_detected(data):
    print(f"❓ Questions detected: {len(data)} questions")
    for q in data:
        status = "✅" if q['filled'] else "⏳"
        print(f"   {status} {q['question_text']} ({q['field_type']})")

@sio.event
def screenshot_taken(filename):
    print(f"📸 Screenshot taken: {filename}")

@sio.event
def page_transition(page):
    print(f"📄 Page transition to page {page}")

@sio.event
def agent_completed(data):
    print(f"🎉 Agent completed!")
    print(f"   Total actions: {data['totalActions']}")
    print(f"   Questions found: {data['questionsFound']}")
    print(f"   Screenshots taken: {data['screenshotsTaken']}")

def main():
    print("🚀 Starting Socket.IO progress updates for monitoring UI")
    print("🌐 Make sure the Socket.IO server is running on port 8081")
    print("🌐 Make sure the Next.js UI is running on port 3000")
    print()
    
    try:
        # Connect to the Socket.IO server
        sio.connect('http://localhost:8081')
        
        # Keep the connection alive to receive updates
        print("🔄 Monitoring agent activity... (Press Ctrl+C to stop)")
        sio.wait()
        
    except KeyboardInterrupt:
        print("\n🛑 Stopping monitoring...")
        sio.disconnect()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
