#!/usr/bin/env python3
"""
Example usage of JobHax system.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from core.config import Config
from core.job_application_agent import JobApplicationAgent
from utils.data_loader import DataLoader
from utils.browser_manager import BrowserManager


async def example_smartrecruiters():
    """Example: Apply to SmartRecruiters job."""
    print("🎯 Example 1: SmartRecruiters Application")
    print("=" * 50)
    
    # Configuration
    config = Config(ai_provider="openai")
    
    # Load data
    data_loader = DataLoader()
    user_data = data_loader.load_user_data("data/test_data.json")
    cv_data = data_loader.load_cv_data("data/sample_cv.txt")
    
    # Initialize browser (non-headless for demonstration)
    browser_manager = BrowserManager(headless=False)
    
    # Initialize agent
    agent = JobApplicationAgent(
        config=config,
        user_data=user_data,
        cv_data=cv_data,
        browser_manager=browser_manager
    )
    
    try:
        # Process application
        url = "https://jobs.smartrecruiters.com/AbercrombieAndFitchCo/744000081085955-hollister-co-assistant-manager-santa-anita"
        result = await agent.process_job_application(url)
        
        if result.success:
            print("✅ Application completed successfully!")
            print(f"⏱️  Processing time: {result.processing_time:.2f} seconds")
            print(f"📝 Fields filled: {len(result.form_data.get('filled_fields', {}))}")
            print(f"📸 Screenshots: {len(result.screenshots)}")
        else:
            print(f"❌ Application failed: {result.message}")
            
    except Exception as e:
        print(f"💥 Error: {e}")
    finally:
        agent.cleanup()


async def example_appcast():
    """Example: Apply to Appcast job."""
    print("\n🎯 Example 2: Appcast Application")
    print("=" * 50)
    
    # Configuration
    config = Config(ai_provider="gemini")
    
    # Load data
    data_loader = DataLoader()
    user_data = data_loader.load_user_data("data/test_data.json")
    cv_data = data_loader.load_cv_data("data/sample_cv.txt")
    
    # Initialize browser
    browser_manager = BrowserManager(headless=False)
    
    # Initialize agent
    agent = JobApplicationAgent(
        config=config,
        user_data=user_data,
        cv_data=cv_data,
        browser_manager=browser_manager
    )
    
    try:
        # Process application
        url = "https://apply.appcast.io/jobs/50590620606/applyboard/apply"
        result = await agent.process_job_application(url)
        
        if result.success:
            print("✅ Application completed successfully!")
            print(f"⏱️  Processing time: {result.processing_time:.2f} seconds")
            print(f"📝 Fields filled: {len(result.form_data.get('filled_fields', {}))}")
            print(f"📸 Screenshots: {len(result.screenshots)}")
        else:
            print(f"❌ Application failed: {result.message}")
            
    except Exception as e:
        print(f"💥 Error: {e}")
    finally:
        agent.cleanup()


async def example_custom_data():
    """Example: Using custom user data."""
    print("\n🎯 Example 3: Custom User Data")
    print("=" * 50)
    
    # Create custom user data
    custom_data = {
        "personal_info": {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane.smith@example.com",
            "phone": "+1-555-987-6543",
            "address": {
                "street": "456 Oak Avenue",
                "city": "New York",
                "state": "NY",
                "zip_code": "10001",
                "country": "United States"
            }
        },
        "professional_info": {
            "current_title": "Data Scientist",
            "current_company": "AI Corp",
            "years_experience": 3,
            "linkedin_url": "https://linkedin.com/in/janesmith",
            "github_url": "https://github.com/janesmith"
        },
        "education": [
            {
                "institution": "MIT",
                "degree": "Master of Science",
                "field_of_study": "Computer Science",
                "graduation_year": 2020,
                "gpa": 3.9
            }
        ],
        "work_experience": [
            {
                "company": "AI Corp",
                "position": "Data Scientist",
                "start_date": "2021-01-01",
                "end_date": "present",
                "description": "Developed machine learning models for business intelligence",
                "achievements": [
                    "Improved model accuracy by 25%",
                    "Led data science team of 3",
                    "Implemented automated ML pipeline"
                ]
            }
        ],
        "skills": {
            "programming_languages": ["Python", "R", "SQL"],
            "frameworks": ["TensorFlow", "PyTorch", "Scikit-learn"],
            "databases": ["PostgreSQL", "MongoDB"],
            "cloud_platforms": ["AWS", "Google Cloud"],
            "tools": ["Jupyter", "Git", "Docker"]
        },
        "certifications": [],
        "references": [],
        "additional_info": {
            "cover_letter": "I am passionate about using data science to solve real-world problems...",
            "why_interested": "This role aligns perfectly with my expertise in machine learning...",
            "availability": "Immediate",
            "relocation_willingness": "Yes",
            "notice_period": "2 weeks"
        }
    }
    
    # Save custom data
    import json
    with open("data/custom_data.json", "w") as f:
        json.dump(custom_data, f, indent=2)
    
    print("✅ Custom data created and saved")
    print("📄 You can now use this data with:")
    print("   python src/main.py --url '...' --data-file 'data/custom_data.json'")


async def main():
    """Main example function."""
    print("🚀 JobHax - Autonomous Job Application Agent")
    print("=" * 60)
    print("This example demonstrates the JobHax system capabilities.")
    print()
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    try:
        # Example 1: SmartRecruiters
        await example_smartrecruiters()
        
        # Wait between examples
        print("\n⏳ Waiting 5 seconds before next example...")
        await asyncio.sleep(5)
        
        # Example 2: Appcast
        await example_appcast()
        
        # Example 3: Custom data
        await example_custom_data()
        
        print("\n🎉 All examples completed!")
        print("\n📚 For more information, see DOCUMENTATION.md")
        
    except KeyboardInterrupt:
        print("\n⏹️  Examples interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")


if __name__ == "__main__":
    asyncio.run(main())
