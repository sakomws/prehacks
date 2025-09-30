from browser_use import Agent, ChatGoogle, ChatOpenAI
from dotenv import load_dotenv
import asyncio
from browser_use import Browser
import time

load_dotenv()

# Create a fresh browser instance with better error handling
browser = Browser(
    user_data_dir='/Users/sakom/github/prehacks/apps/recruitment/jobhax/cl/user_data',
    profile_directory='Default',
    headless=False  # Set to False to see what's happening
)

async def main():
    try:
        # Use GPT-4.1-mini for better reliability
        llm = ChatOpenAI(model="gpt-4.1-mini")
        
        task = """Apply to the job posting https://apply.appcast.io/jobs/50590620606/applyboard/apply using the following resume data:

PERSONAL INFORMATION:
- First Name: [REDACTED]
- Last Name: [REDACTED]
- Email: [REDACTED]
- Phone: [REDACTED]
- Address: [REDACTED]

ELIGIBILITY:
- Over 18: Yes
- Eligible to work in US: Yes
- Require sponsorship: No
- Professional license: No

MOTIVATION:
- What drew you to healthcare: I am deeply motivated by the opportunity to improve lives through technology, secure systems, and innovation. Healthcare offers a chance to apply my skills in AI, security, and platform engineering to ensure reliability, safety, and efficiency for patients and providers.

EXPERIENCE:
- Years in related role: 8+ years

VOLUNTARY DISCLOSURES:
- Gender: x
- Race: x
- Hispanic or Latino: x
- Veteran Status: x
- Disability Status: x
- Date: 2025-09-27

Please fill out the job application form with this information, ensuring all required fields are completed and radio buttons are selected appropriately. Take your time and be thorough."""
        
        agent = Agent(task=task, llm=llm, browser=browser)
        
        # Add a small delay to ensure browser is ready
        await asyncio.sleep(2)
        
        # Run the agent
        await agent.run()
        
    except Exception as e:
        print(f"Error occurred: {e}")
        print("This might be due to browser session issues. The application may have been partially filled.")
    finally:
        # Clean up
        try:
            await browser.close()
        except:
            pass

if __name__ == "__main__":
    asyncio.run(main())
