#!/usr/bin/env python3
"""
Start the integrated system: WebSocket server + Real browser agent
"""

import subprocess
import time
import sys
import os
from pathlib import Path

def start_websocket_server():
    """Start the WebSocket server"""
    print("🚀 Starting WebSocket server...")
    websocket_dir = Path("monitor-ui")
    websocket_script = websocket_dir / "websocket-server.js"
    
    if websocket_script.exists():
        return subprocess.Popen(
            ["node", str(websocket_script)],
            cwd=websocket_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
    else:
        print(f"❌ WebSocket server not found at {websocket_script}")
        return None

def start_nextjs_ui():
    """Start the Next.js monitoring UI"""
    print("🚀 Starting Next.js monitoring UI...")
    ui_dir = Path("monitor-ui")
    
    if ui_dir.exists():
        return subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=ui_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
    else:
        print(f"❌ Next.js UI not found at {ui_dir}")
        return None

def run_integrated_agent(job_url: str):
    """Run the integrated browser agent"""
    print(f"🤖 Starting integrated browser agent for: {job_url}")
    
    # Wait a moment for servers to start
    time.sleep(3)
    
    # Run the integrated agent
    result = subprocess.run([
        "python", "integrated_agent.py", job_url
    ], capture_output=True, text=True)
    
    print("🤖 Agent output:")
    print(result.stdout)
    if result.stderr:
        print("🤖 Agent errors:")
        print(result.stderr)
    
    return result.returncode == 0

def main():
    """Main function"""
    job_url = sys.argv[1] if len(sys.argv) > 1 else "https://apply.appcast.io/jobs/50590620606/applyboard/apply"
    
    print("🎯 Starting Integrated Job Application System")
    print(f"📋 Job URL: {job_url}")
    print("=" * 60)
    
    websocket_process = None
    ui_process = None
    
    try:
        # Start WebSocket server
        websocket_process = start_websocket_server()
        if not websocket_process:
            print("❌ Failed to start WebSocket server")
            return
        
        print("✅ WebSocket server started")
        
        # Start Next.js UI
        ui_process = start_nextjs_ui()
        if not ui_process:
            print("❌ Failed to start Next.js UI")
            return
        
        print("✅ Next.js UI started")
        print("🌐 Monitoring UI available at: http://localhost:3000")
        print("📡 WebSocket server running on: http://localhost:8081")
        
        # Wait for servers to be ready
        print("⏳ Waiting for servers to be ready...")
        time.sleep(5)
        
        # Run the integrated agent
        print("🤖 Starting real browser automation...")
        success = run_integrated_agent(job_url)
        
        if success:
            print("✅ Integrated system completed successfully!")
        else:
            print("❌ Integrated system failed")
        
        print("\n📊 System Status:")
        print(f"  WebSocket Server: {'Running' if websocket_process and websocket_process.poll() is None else 'Stopped'}")
        print(f"  Next.js UI: {'Running' if ui_process and ui_process.poll() is None else 'Stopped'}")
        
        print("\n🔗 Access the monitoring UI at: http://localhost:3000")
        print("Press Ctrl+C to stop all services")
        
        # Keep running until interrupted
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Shutting down system...")
    
    except Exception as e:
        print(f"❌ Error: {e}")
    
    finally:
        # Cleanup processes
        if websocket_process:
            websocket_process.terminate()
            print("🔒 WebSocket server stopped")
        
        if ui_process:
            ui_process.terminate()
            print("🔒 Next.js UI stopped")

if __name__ == "__main__":
    main()

