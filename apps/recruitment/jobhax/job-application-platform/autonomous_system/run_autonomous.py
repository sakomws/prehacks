#!/usr/bin/env python3
"""
Run script for the Autonomous Job Application System
"""

import sys
import os
from pathlib import Path

def main():
    """Main run function"""
    print("🤖 Autonomous Job Application System")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not Path("autonomous_job_applicant.py").exists():
        print("❌ Please run this script from the autonomous_system directory")
        return
    
    # Check for job URL
    if len(sys.argv) < 2:
        print("Usage: python run_autonomous.py <job_application_url>")
        print("\nExample:")
        print("python run_autonomous.py 'https://jobs.example.com/apply/123'")
        return
    
    job_url = sys.argv[1]
    
    # Run the autonomous system
    try:
        from autonomous_job_applicant import AutonomousJobApplicant
        
        print(f"🎯 Target URL: {job_url}")
        print("🚀 Starting autonomous application...")
        print("-" * 40)
        
        # Initialize and run
        applicant = AutonomousJobApplicant()
        result = applicant.run_autonomous_application(job_url)
        
        print("-" * 40)
        print("✅ Autonomous application completed!")
        print(f"📊 Reached second page: {result['task_completion']['reached_second_page']}")
        print(f"📝 Fields filled: {result['task_completion']['fields_filled']}")
        print(f"🎯 Total actions: {result['task_completion']['total_actions']}")
        
        # Save results
        output_file = f"job_application_result_{result['task_completion']['current_page']}.json"
        import json
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"💾 Results saved to: {output_file}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Try running setup.py first to install dependencies")

if __name__ == "__main__":
    main()
