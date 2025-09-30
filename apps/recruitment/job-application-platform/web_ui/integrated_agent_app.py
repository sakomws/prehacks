#!/usr/bin/env python3
"""
JobHax Integrated Agent Application
Combines enhanced agent capabilities with Flask web interface
"""

import os
import sys
import json
import threading
import time
from pathlib import Path
from flask import Flask, render_template, jsonify, request
import logging

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from core.config import Config
from utils.data_loader import DataLoader
from utils.browser_manager import BrowserManager

# Import the enhanced agent
from enhanced_agent import JobHaxAgent, AgentState

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

# Global agent and status tracking
agent = JobHaxAgent()
application_status = {
    "job_1": {"status": "ready", "message": "Ready to apply"},
    "job_2": {"status": "ready", "message": "Ready to apply"}
}

def apply_to_job_with_agent(job_id, job_url):
    """Apply to a job using the enhanced agent"""
    global application_status
    
    try:
        application_status[job_id] = {"status": "applying", "message": "Agent analyzing job..."}
        
        # Get job data
        job_data = next((job for job in JOBS if job['id'] == job_id), None)
        if not job_data:
            application_status[job_id] = {"status": "error", "message": "Job not found"}
            return
        
        # Step 1: Reasoning - Analyze the job
        application_status[job_id] = {"status": "applying", "message": "🧠 Analyzing job requirements..."}
        reasoning = agent.reason_about_job(job_data)
        
        # Step 2: Planning - Create execution plan
        application_status[job_id] = {"status": "applying", "message": "📋 Creating application strategy..."}
        plan = agent.plan_application(job_data, reasoning)
        
        # Step 3: Execution - Execute the plan
        application_status[job_id] = {"status": "applying", "message": "🚀 Executing application plan..."}
        results = agent.execute_plan(job_data, plan)
        
        # Step 4: Reflection - Learn from results
        application_status[job_id] = {"status": "reflecting", "message": "🤔 Analyzing results and learning..."}
        reflection = agent.reflect_on_results(job_data, results)
        
        # Update final status
        if results["success"]:
            application_status[job_id] = {
                "status": "success", 
                "message": f"✅ Application submitted successfully! Agent learned {len(reflection['patterns_learned'])} new patterns."
            }
        else:
            error_count = len(results["errors"])
            application_status[job_id] = {
                "status": "error", 
                "message": f"❌ Application failed with {error_count} errors. Agent will learn from this experience."
            }
        
        # Log agent execution summary
        summary = agent.get_execution_summary()
        print(f"📊 Agent Summary for {job_id}:")
        print(f"   State: {summary['state']}")
        print(f"   Steps Completed: {len([log for log in summary['execution_log'] if '✅' in log])}")
        print(f"   Memory Stats: {summary['memory_stats']}")
        
    except Exception as e:
        application_status[job_id] = {"status": "error", "message": f"Agent error: {str(e)}"}
        print(f"💥 Agent error for {job_id}: {str(e)}")

@app.route('/')
def index():
    """Main page with job cards and agent status"""
    return render_template('index.html', jobs=JOBS)

@app.route('/api/jobs')
def get_jobs():
    """API endpoint to get job data"""
    return jsonify(JOBS)

@app.route('/api/apply/<job_id>', methods=['POST'])
def apply_to_job(job_id):
    """API endpoint to apply to a specific job using the agent"""
    job = next((job for job in JOBS if job['id'] == job_id), None)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    # Start agent application in background thread
    thread = threading.Thread(target=apply_to_job_with_agent, args=(job_id, job['url']))
    thread.daemon = True
    thread.start()
    
    return jsonify({"message": "Agent started application process", "job_id": job_id})

@app.route('/api/status/<job_id>')
def get_application_status(job_id):
    """API endpoint to get application status"""
    status = application_status.get(job_id, {"status": "unknown", "message": "Job not found"})
    return jsonify(status)

@app.route('/api/status')
def get_all_status():
    """API endpoint to get all application statuses"""
    return jsonify(application_status)

@app.route('/api/agent/status')
def get_agent_status():
    """API endpoint to get agent status and memory"""
    summary = agent.get_execution_summary()
    return jsonify({
        "agent_state": summary["state"],
        "memory_stats": summary["memory_stats"],
        "recent_logs": summary["execution_log"][-10:]  # Last 10 log entries
    })

@app.route('/api/agent/learnings')
def get_agent_learnings():
    """API endpoint to get agent learning patterns"""
    return jsonify({
        "success_patterns": agent.memory.success_patterns[-5:],  # Last 5 success patterns
        "error_patterns": agent.memory.error_patterns[-5:],      # Last 5 error patterns
        "total_experience": len(agent.memory.job_history)
    })

@app.route('/screenshots/<filename>')
def serve_screenshot(filename):
    """Serve screenshot files"""
    from flask import send_from_directory
    screenshots_dir = Path(__file__).parent.parent / "screenshots"
    return send_from_directory(str(screenshots_dir), filename)

@app.route('/api/agent/reset', methods=['POST'])
def reset_agent():
    """Reset agent memory and state"""
    global agent
    agent = JobHaxAgent()
    return jsonify({"message": "Agent memory and state reset successfully"})

if __name__ == '__main__':
    # Create necessary directories
    templates_dir = Path(__file__).parent / "templates"
    templates_dir.mkdir(exist_ok=True)
    
    static_dir = Path(__file__).parent / "static"
    static_dir.mkdir(exist_ok=True)
    
    print("🤖 Starting JobHax Enhanced Agent...")
    print("🧠 Agent capabilities: Reasoning, Planning, Execution, Learning")
    print("📱 Open your browser to: http://localhost:5001")
    print("🎯 Click 'Apply Now' to see the agent in action")
    print("📊 Visit /api/agent/status to see agent memory and learnings")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
