#!/usr/bin/env python3
"""
Script to run the real browser automation agent
"""

import asyncio
import sys
from autonomous_agent import main

async def run_agent(job_url: str):
    """Run the autonomous agent with a specific job URL"""
    print(f"🤖 Starting Real Browser Automation Agent")
    print(f"📋 Job URL: {job_url}")
    print("=" * 60)
    
    try:
        result = await main(job_url)
        if result:
            print(f"\n✅ Agent completed successfully!")
            print(f"📊 Total actions: {result['meta']['total_actions']}")
            print(f"📸 Screenshots taken: {result['meta']['screenshots_taken']}")
            print(f"❓ Questions encountered: {result['meta']['questions_encountered']}")
            print(f"📄 Results saved to: {result.get('artifact_path', 'N/A')}")
        else:
            print("❌ Agent failed to complete")
    except Exception as e:
        print(f"❌ Error running agent: {e}")

if __name__ == "__main__":
    # Default job URLs for testing
    job_urls = {
        "1": "https://apply.appcast.io/jobs/50590620606/applyboard/apply",
        "2": "https://jobs.smartrecruiters.com/AbercrombieAndFitchCo/744000081085955-hollister-co-assistant-manager-santa-anita",
        "3": "https://jobs.smartrecruiters.com/oneclick-ui/company/AbercrombieAndFitchCo/publication/a1fcd7d8-7af3-4ba4-9efa-d308b5ac9440?dcr_ci=AbercrombieAndFitchCo"
    }
    
    if len(sys.argv) > 1:
        # Use provided URL
        job_url = sys.argv[1]
    else:
        # Interactive selection
        print("🎯 Select a job URL to test:")
        for key, url in job_urls.items():
            print(f"  {key}. {url}")
        
        choice = input("\nEnter choice (1-3) or custom URL: ").strip()
        
        if choice in job_urls:
            job_url = job_urls[choice]
        else:
            job_url = choice
    
    asyncio.run(run_agent(job_url))
