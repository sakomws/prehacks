"""
Main job application agent that orchestrates the entire process.
"""

import asyncio
import json
import logging
import time
from typing import Optional, Dict, Any
from datetime import datetime
from pathlib import Path

from core.config import Config
from core.models import UserData, JobApplicationResult, CVData
from utils.browser_manager import BrowserManager
from agents.form_analyzer import FormAnalyzer
from agents.form_filler import FormFiller
from agents.ai_client import AIClient


class JobApplicationAgent:
    """Main agent that orchestrates the job application process."""
    
    def __init__(self, config: Config, user_data: UserData, cv_data: Optional[CVData], browser_manager: BrowserManager):
        self.logger = logging.getLogger(__name__)
        self.config = config
        self.user_data = user_data
        self.cv_data = cv_data
        self.browser_manager = browser_manager
        
        # Initialize components
        self.ai_client = AIClient(config.get_ai_config())
        self.form_analyzer = FormAnalyzer(config.get_ai_config())
        self.form_filler = FormFiller(self.ai_client, browser_manager)
        
        # Results tracking
        self.results = []
        self.screenshots = []
    
    async def process_job_application(self, url: str) -> JobApplicationResult:
        """Process a complete job application."""
        start_time = time.time()
        
        try:
            self.logger.info(f"Starting job application process for: {url}")
            
            # Step 1: Navigate to job application page
            if not await self._navigate_to_application(url):
                return self._create_error_result("Failed to navigate to application page")
            
            # Step 2: Analyze the form
            form = await self._analyze_application_form()
            if not form or not form.fields:
                return self._create_error_result("Failed to analyze application form")
            
            self.logger.info(f"Found {len(form.fields)} form fields")
            
            # Step 3: Fill the form
            if not await self._fill_application_form(form):
                return self._create_error_result("Failed to fill application form")
            
            # Step 4: Submit the application
            if not await self._submit_application(form):
                return self._create_error_result("Failed to submit application")
            
            # Step 5: Handle any additional steps
            await self._handle_additional_steps()
            
            # Create success result
            processing_time = time.time() - start_time
            result = JobApplicationResult(
                success=True,
                message="Job application completed successfully",
                form_data=self.form_filler.get_filled_fields_summary(),
                errors=[],
                screenshots=self.screenshots,
                processing_time=processing_time,
                timestamp=datetime.now()
            )
            
            self.logger.success(f"Job application completed in {processing_time:.2f} seconds")
            return result
            
        except Exception as e:
            self.logger.error(f"Job application failed: {e}")
            return self._create_error_result(f"Job application failed: {str(e)}")
    
    async def _navigate_to_application(self, url: str) -> bool:
        """Navigate to the job application page."""
        try:
            self.logger.info(f"Navigating to: {url}")
            
            if not self.browser_manager.navigate_to(url):
                return False
            
            # Wait for page to load
            await asyncio.sleep(3)
            
            # Take screenshot
            screenshot = self.browser_manager.take_screenshot(f"initial_page_{int(time.time())}.png")
            if screenshot:
                self.screenshots.append(screenshot)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to navigate to application: {e}")
            return False
    
    async def _analyze_application_form(self) -> Optional[Any]:
        """Analyze the job application form."""
        try:
            self.logger.info("Analyzing application form...")
            
            # Get page source
            html_content = self.browser_manager.get_page_source()
            if not html_content:
                return None
            
            # Analyze form using AI
            form = self.form_analyzer.analyze_form_with_ai(html_content, self.browser_manager.get_current_url())
            
            # Take screenshot of form
            screenshot = self.browser_manager.take_screenshot(f"form_analysis_{int(time.time())}.png")
            if screenshot:
                self.screenshots.append(screenshot)
            
            return form
            
        except Exception as e:
            self.logger.error(f"Failed to analyze form: {e}")
            return None
    
    async def _fill_application_form(self, form: Any) -> bool:
        """Fill the job application form."""
        try:
            self.logger.info("Filling application form...")
            
            # Generate form filling actions
            actions = self.form_filler.fill_form(form, self.user_data, self.cv_data)
            
            if not actions:
                self.logger.warning("No actions generated for form filling")
                return False
            
            # Execute actions
            for i, action in enumerate(actions):
                self.logger.info(f"Executing action {i+1}/{len(actions)}: {action.action_type}")
                
                if not self.browser_manager.execute_action(action):
                    self.logger.warning(f"Failed to execute action: {action.action_type}")
                    continue
                
                # Wait between actions
                await asyncio.sleep(action.wait_time)
            
            # Take screenshot after filling
            screenshot = self.browser_manager.take_screenshot(f"form_filled_{int(time.time())}.png")
            if screenshot:
                self.screenshots.append(screenshot)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to fill form: {e}")
            return False
    
    async def _submit_application(self, form: Any) -> bool:
        """Submit the job application."""
        try:
            self.logger.info("Submitting application...")
            
            # Look for submit button
            submit_button = form.submit_button or form.next_button
            if not submit_button:
                self.logger.warning("No submit button found")
                return False
            
            # Click submit button
            if not self.browser_manager.click_element(
                self.browser_manager.find_element(submit_button.xpath)
            ):
                self.logger.error("Failed to click submit button")
                return False
            
            # Wait for submission to process
            await asyncio.sleep(3)
            
            # Take screenshot after submission
            screenshot = self.browser_manager.take_screenshot(f"submitted_{int(time.time())}.png")
            if screenshot:
                self.screenshots.append(screenshot)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to submit application: {e}")
            return False
    
    async def _handle_additional_steps(self):
        """Handle any additional steps after form submission."""
        try:
            self.logger.info("Checking for additional steps...")
            
            # Wait a bit to see if there are additional pages
            await asyncio.sleep(2)
            
            # Check if we're on a confirmation page or next step
            current_url = self.browser_manager.get_current_url()
            page_source = self.browser_manager.get_page_source()
            
            # Look for confirmation messages
            confirmation_keywords = [
                "thank you", "application received", "successfully submitted",
                "confirmation", "next step", "continue"
            ]
            
            page_lower = page_source.lower()
            for keyword in confirmation_keywords:
                if keyword in page_lower:
                    self.logger.info(f"Found confirmation: {keyword}")
                    break
            
            # Take final screenshot
            screenshot = self.browser_manager.take_screenshot(f"final_{int(time.time())}.png")
            if screenshot:
                self.screenshots.append(screenshot)
            
        except Exception as e:
            self.logger.error(f"Error handling additional steps: {e}")
    
    def _create_error_result(self, message: str) -> JobApplicationResult:
        """Create an error result."""
        return JobApplicationResult(
            success=False,
            message=message,
            form_data={},
            errors=[message],
            screenshots=self.screenshots,
            processing_time=0,
            timestamp=datetime.now()
        )
    
    def get_application_summary(self) -> Dict[str, Any]:
        """Get summary of the application process."""
        return {
            "total_applications": len(self.results),
            "successful_applications": sum(1 for r in self.results if r.success),
            "failed_applications": sum(1 for r in self.results if not r.success),
            "total_processing_time": sum(r.processing_time for r in self.results),
            "screenshots_taken": len(self.screenshots),
            "results": self.results
        }
    
    def save_results(self, output_dir: str = "results"):
        """Save application results to files."""
        try:
            output_path = Path(output_dir)
            output_path.mkdir(exist_ok=True)
            
            # Save results summary
            summary = self.get_application_summary()
            with open(output_path / "application_summary.json", "w") as f:
                json.dump(summary, f, indent=2, default=str)
            
            # Save individual results
            for i, result in enumerate(self.results):
                with open(output_path / f"result_{i+1}.json", "w") as f:
                    json.dump(result.__dict__, f, indent=2, default=str)
            
            self.logger.info(f"Results saved to {output_path}")
            
        except Exception as e:
            self.logger.error(f"Failed to save results: {e}")
    
    def cleanup(self):
        """Clean up resources."""
        try:
            self.browser_manager.cleanup()
            self.logger.info("Cleanup completed")
        except Exception as e:
            self.logger.error(f"Error during cleanup: {e}")
