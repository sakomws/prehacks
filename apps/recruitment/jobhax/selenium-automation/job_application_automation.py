#!/usr/bin/env python3
"""
JobHax Browser Automation
Automated job application form filling using browser-use library
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from browser_use import Agent, ChatGoogle, ChatOpenAI, ChatAnthropic, ChatGroq
from browser_use import Browser

# Load environment variables
load_dotenv()

# Resume data
RESUME_DATA = {
    "firstName": "[REDACTED]",
    "lastName": "[REDACTED]",
    "email": "[REDACTED]",
    "phone": "[REDACTED]",
    "address": "[REDACTED]",
    "city": "[REDACTED]",
    "state": "[REDACTED]",
    "zipCode": "[REDACTED]",
    "country": "United States",
    "linkedin": "[REDACTED]",
    "website": "[REDACTED]",
    "currentTitle": "Software Engineer",
    "currentCompany": "Tech Corp",
    "yearsExperience": "8+",
    "coverLetter": "I am excited to apply for this position. With my experience in software engineering and 8+ years of experience, I believe I would be a great fit for this role. Please find my resume attached for your review."
}

def get_llm():
    """Initialize the appropriate LLM based on available API keys"""
    
    # Try Gemini first (free tier)
    if os.getenv("GEMINI_API_KEY"):
        print("Using Google Gemini...")
        return ChatGoogle(model="gemini-flash-latest")
    
    # Try OpenAI
    elif os.getenv("OPENAI_API_KEY"):
        print("Using OpenAI...")
        return ChatOpenAI(model="gpt-4o-mini")
    
    # Try Anthropic
    elif os.getenv("ANTHROPIC_API_KEY"):
        print("Using Anthropic Claude...")
        return ChatAnthropic(model="claude-3-5-sonnet-20241022")
    
    # Try Groq
    elif os.getenv("GROQ_API_KEY"):
        print("Using Groq...")
        return ChatGroq(model="llama-3.1-8b-instant")
    
    else:
        raise ValueError("No API key found! Please set one of: GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or GROQ_API_KEY")

def create_job_application_task(job_url, resume_data):
    """Create a detailed task for filling out a job application"""
    
    task = f"""
You are an AI assistant helping to fill out a job application form. Your task is to:

1. Navigate to the job application URL: {job_url}
2. Fill out ALL form fields with the provided resume data
3. Handle different types of form fields (text inputs, dropdowns, radio buttons, checkboxes, textareas)
4. Answer all questions appropriately based on the resume data

RESUME DATA TO USE:
- Legal First Name: {resume_data['firstName']}
- Legal Last Name: {resume_data['lastName']}
- Email: {resume_data['email']}
- Phone: {resume_data['phone']}
- Address: {resume_data['address']}
- City: {resume_data['city']}
- State: {resume_data['state']}
- Zip Code: {resume_data['zipCode']}
- Country: {resume_data['country']}
- LinkedIn: {resume_data['linkedin']}
- Website: {resume_data['website']}
- Current Title: {resume_data['currentTitle']}
- Current Company: {resume_data['currentCompany']}
- Years of Experience: {resume_data['yearsExperience']}

SPECIFIC INSTRUCTIONS:
1. For "Are you over the age of 18?" - Select "Yes"
2. For "Are you eligible to work in the United States?" - Select "Yes"
3. For "Will you require company sponsorship?" - Select "No"
4. For "Do you have a professional license?" - Select "No"
5. For "What drew you to healthcare?" - Write: "I am drawn to healthcare because of the opportunity to make a meaningful impact on people's lives. With my technical background and passion for helping others, I believe I can contribute to improving healthcare systems and patient outcomes through innovative solutions."
6. For experience dropdowns - Select "8+ years" or similar
7. For demographic questions (Gender, Race, etc.) - Select appropriate defaults
8. For veteran status - Select "I am not a protected veteran"
9. For disability status - Select "No, I do not have a disability"
10. For date fields - Use today's date

IMPORTANT:
- Fill ALL visible form fields
- Be thorough and complete
- If you encounter any issues, try different approaches
- Take screenshots if needed for debugging
- Do NOT submit the form unless explicitly asked

Start by navigating to the URL and then systematically fill out each section of the form.
"""
    
    return task

def run_job_application_automation(job_url):
    """Run the job application automation"""
    
    try:
        # Initialize LLM
        llm = get_llm()
        
        # Create browser instance with local configuration
        browser = Browser(
            use_cloud=False,
            headless=False
        )
        
        # Create agent
        agent = Agent(
            task=create_job_application_task(job_url, RESUME_DATA),
            llm=llm,
            browser=browser
        )
        
        print(f"🚀 Starting job application automation for: {job_url}")
        print("📝 Resume data loaded and ready")
        print("🤖 AI agent will now fill out the form...")
        print("-" * 50)
        
        # Run the automation
        result = agent.run_sync()
        
        print("-" * 50)
        print("✅ Job application automation completed!")
        print(f"📊 Result: {result}")
        
        return result
        
    except Exception as e:
        print(f"❌ Error during automation: {e}")
        return None

def main():
    """Main function"""
    
    # Check if URL is provided
    if len(sys.argv) > 1:
        job_url = sys.argv[1]
    else:
        # Default test URL - replace with actual job application URL
        job_url = input("Enter the job application URL: ").strip()
        
        if not job_url:
            print("❌ No URL provided. Exiting.")
            return
    
    # Validate URL
    if not job_url.startswith(('http://', 'https://')):
        job_url = 'https://' + job_url
    
    print("🎯 JobHax Browser Automation")
    print("=" * 40)
    print(f"📋 Target URL: {job_url}")
    print(f"👤 Applicant: {RESUME_DATA['firstName']} {RESUME_DATA['lastName']}")
    print(f"📧 Email: {RESUME_DATA['email']}")
    print("=" * 40)
    
    # Run automation
    result = run_job_application_automation(job_url)
    
    if result:
        print("\n🎉 Automation completed successfully!")
    else:
        print("\n💥 Automation failed. Check the logs above.")

if __name__ == "__main__":
    main()
