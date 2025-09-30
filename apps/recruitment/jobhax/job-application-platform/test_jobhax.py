#!/usr/bin/env python3
"""
Test script for JobHax system.
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


async def test_job_application():
    """Test the job application system."""
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # Test URLs
    test_urls = [
        "https://jobs.smartrecruiters.com/AbercrombieAndFitchCo/744000081085955-hollister-co-assistant-manager-santa-anita",
        "https://apply.appcast.io/jobs/50590620606/applyboard/apply"
    ]
    
    # Load configuration
    config = Config(ai_provider="openai")
    
    # Load test data
    data_loader = DataLoader()
    user_data = data_loader.load_user_data("data/test_data.json")
    cv_data = data_loader.load_cv_data("data/sample_cv.txt")
    
    # Initialize browser manager
    browser_manager = BrowserManager(headless=False)  # Set to True for headless mode
    
    # Initialize job application agent
    agent = JobApplicationAgent(
        config=config,
        user_data=user_data,
        cv_data=cv_data,
        browser_manager=browser_manager
    )
    
    try:
        # Test each URL
        for i, url in enumerate(test_urls):
            logger.info(f"Testing URL {i+1}/{len(test_urls)}: {url}")
            
            result = await agent.process_job_application(url)
            
            if result.success:
                logger.info(f"✅ Application {i+1} completed successfully!")
                logger.info(f"Processing time: {result.processing_time:.2f} seconds")
                logger.info(f"Fields filled: {len(result.form_data.get('filled_fields', {}))}")
            else:
                logger.error(f"❌ Application {i+1} failed: {result.message}")
            
            # Wait between applications
            if i < len(test_urls) - 1:
                logger.info("Waiting 5 seconds before next application...")
                await asyncio.sleep(5)
        
        # Save results
        agent.save_results("test_results")
        logger.info("Test completed! Check test_results/ folder for details.")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
    finally:
        agent.cleanup()


if __name__ == "__main__":
    asyncio.run(test_job_application())
