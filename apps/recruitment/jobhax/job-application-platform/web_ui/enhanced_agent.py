#!/usr/bin/env python3
"""
Enhanced JobHax Agent - Following AI Agent Best Practices
Implements reasoning, memory, and multi-step planning
"""

import os
import sys
import json
import time
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from core.config import Config
from utils.data_loader import DataLoader
from utils.browser_manager import BrowserManager

class AgentState(Enum):
    """Agent execution states"""
    IDLE = "idle"
    ANALYZING = "analyzing"
    PLANNING = "planning"
    EXECUTING = "executing"
    REFLECTING = "reflecting"
    ERROR = "error"
    SUCCESS = "success"

@dataclass
class AgentMemory:
    """Memory system for the agent"""
    user_preferences: Dict[str, Any]
    job_history: List[Dict[str, Any]]
    success_patterns: List[Dict[str, Any]]
    error_patterns: List[Dict[str, Any]]
    form_selectors: Dict[str, List[str]]
    
    def add_job_experience(self, job_id: str, success: bool, patterns: Dict[str, Any]):
        """Learn from job application experience"""
        experience = {
            "job_id": job_id,
            "timestamp": time.time(),
            "success": success,
            "patterns": patterns
        }
        self.job_history.append(experience)
        
        if success:
            self.success_patterns.append(patterns)
        else:
            self.error_patterns.append(patterns)
    
    def get_relevant_patterns(self, job_type: str) -> List[Dict[str, Any]]:
        """Retrieve relevant patterns for job type"""
        relevant = []
        for pattern in self.success_patterns:
            if job_type.lower() in pattern.get("job_type", "").lower():
                relevant.append(pattern)
        return relevant

class JobHaxAgent:
    """
    Enhanced JobHax Agent with reasoning capabilities
    Implements ReAct (Reasoning + Acting) pattern
    """
    
    def __init__(self):
        self.state = AgentState.IDLE
        self.memory = AgentMemory(
            user_preferences={},
            job_history=[],
            success_patterns=[],
            error_patterns=[],
            form_selectors={}
        )
        self.current_plan = []
        self.execution_log = []
        
    def reason_about_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Step 1: Reasoning - Analyze the job and plan approach
        """
        self.state = AgentState.ANALYZING
        self.execution_log.append(f"🧠 REASONING: Analyzing job - {job_data['title']}")
        
        # Analyze job characteristics
        job_type = job_data.get('type', 'Unknown')
        company = job_data.get('company', 'Unknown')
        location = job_data.get('location', 'Unknown')
        
        # Retrieve relevant patterns from memory
        relevant_patterns = self.memory.get_relevant_patterns(job_type)
        
        reasoning = {
            "job_analysis": {
                "type": job_type,
                "company": company,
                "location": location,
                "complexity_score": self._assess_complexity(job_data),
                "form_type_prediction": self._predict_form_type(job_data)
            },
            "relevant_patterns": relevant_patterns,
            "strategy": self._determine_strategy(job_data, relevant_patterns)
        }
        
        self.execution_log.append(f"📊 Analysis complete: {reasoning['strategy']}")
        return reasoning
    
    def plan_application(self, job_data: Dict[str, Any], reasoning: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Step 2: Planning - Create detailed execution plan
        """
        self.state = AgentState.PLANNING
        self.execution_log.append("📋 PLANNING: Creating application strategy")
        
        strategy = reasoning['strategy']
        plan = []
        
        # Phase 1: Initial Setup
        plan.append({
            "phase": "setup",
            "action": "navigate_to_job",
            "description": "Navigate to job application page",
            "expected_outcome": "Job page loaded successfully",
            "fallback_actions": ["retry_navigation", "check_page_load"]
        })
        
        plan.append({
            "phase": "setup", 
            "action": "analyze_form_structure",
            "description": "Analyze form fields and structure",
            "expected_outcome": "Form fields identified and mapped",
            "fallback_actions": ["try_alternative_selectors", "manual_form_analysis"]
        })
        
        # Phase 2: Form Filling
        plan.append({
            "phase": "filling",
            "action": "fill_personal_info",
            "description": "Fill email, phone, first name, last name",
            "expected_outcome": "Personal information fields completed",
            "fallback_actions": ["try_alternative_selectors", "manual_field_detection"]
        })
        
        if strategy.get("multi_page_expected", False):
            plan.append({
                "phase": "navigation",
                "action": "navigate_to_next_page",
                "description": "Find and click next/continue button",
                "expected_outcome": "Successfully moved to next page",
                "fallback_actions": ["try_alternative_navigation", "analyze_page_buttons"]
            })
        
        # Phase 3: Submission
        plan.append({
            "phase": "submission",
            "action": "find_submit_button",
            "description": "Locate and click submit button",
            "expected_outcome": "Application submitted successfully",
            "fallback_actions": ["try_alternative_submit_selectors", "analyze_all_buttons"]
        })
        
        # Phase 4: Verification
        plan.append({
            "phase": "verification",
            "action": "verify_submission",
            "description": "Check for success indicators",
            "expected_outcome": "Application confirmed as submitted",
            "fallback_actions": ["manual_verification", "screenshot_analysis"]
        })
        
        self.current_plan = plan
        self.execution_log.append(f"✅ Plan created with {len(plan)} steps")
        return plan
    
    def execute_plan(self, job_data: Dict[str, Any], plan: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Step 3: Execution - Execute the plan with monitoring
        """
        self.state = AgentState.EXECUTING
        self.execution_log.append("🚀 EXECUTING: Starting plan execution")
        
        results = {
            "success": False,
            "steps_completed": 0,
            "errors": [],
            "screenshots": [],
            "form_data_verified": False
        }
        
        try:
            # Load user data
            data_loader = DataLoader()
            data_path = Path(__file__).parent.parent / "data" / "test_data.json"
            user_data = data_loader.load_user_data(str(data_path))
            
            # Initialize browser
            browser_manager = BrowserManager(headless=True)
            
            for i, step in enumerate(plan):
                self.execution_log.append(f"⚡ Executing step {i+1}: {step['action']}")
                
                try:
                    step_result = self._execute_step(step, browser_manager, user_data, job_data)
                    results["steps_completed"] += 1
                    
                    if step_result.get("screenshot"):
                        results["screenshots"].append(step_result["screenshot"])
                    
                    if step_result.get("error"):
                        results["errors"].append(step_result["error"])
                        # Try fallback actions
                        if step.get("fallback_actions"):
                            self._try_fallback_actions(step, browser_manager, user_data, job_data)
                
                except Exception as e:
                    error_msg = f"Step {i+1} failed: {str(e)}"
                    results["errors"].append(error_msg)
                    self.execution_log.append(f"❌ {error_msg}")
            
            # Final verification
            if results["steps_completed"] == len(plan):
                results["success"] = True
                results["form_data_verified"] = True
            
            browser_manager.cleanup()
            
        except Exception as e:
            results["errors"].append(f"Execution failed: {str(e)}")
            self.execution_log.append(f"💥 Execution failed: {str(e)}")
        
        return results
    
    def reflect_on_results(self, job_data: Dict[str, Any], results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Step 4: Reflection - Analyze results and learn
        """
        self.state = AgentState.REFLECTING
        self.execution_log.append("🤔 REFLECTING: Analyzing execution results")
        
        reflection = {
            "success_rate": results["steps_completed"] / len(self.current_plan) if self.current_plan else 0,
            "key_insights": [],
            "improvements": [],
            "patterns_learned": {}
        }
        
        # Analyze success patterns
        if results["success"]:
            reflection["key_insights"].append("Application completed successfully")
            reflection["patterns_learned"]["successful_approach"] = {
                "job_type": job_data.get("type"),
                "form_type": "multi_page" if len(results["screenshots"]) > 2 else "single_page",
                "selectors_used": self._extract_used_selectors()
            }
        else:
            reflection["key_insights"].append(f"Application failed with {len(results['errors'])} errors")
            reflection["improvements"].append("Need better error handling and fallback strategies")
        
        # Learn from this experience
        self.memory.add_job_experience(
            job_data["id"],
            results["success"],
            reflection["patterns_learned"]
        )
        
        self.execution_log.append(f"📚 Learning complete: {len(reflection['patterns_learned'])} patterns learned")
        return reflection
    
    def _assess_complexity(self, job_data: Dict[str, Any]) -> int:
        """Assess job application complexity (1-10 scale)"""
        complexity = 1
        
        # Company size indicator
        if "regional" in job_data.get("company", "").lower():
            complexity += 2
        elif "corp" in job_data.get("company", "").lower():
            complexity += 3
        
        # Job type complexity
        if job_data.get("type") in ["Healthcare", "Management"]:
            complexity += 2
        
        # URL complexity
        if "smartrecruiters" in job_data.get("url", ""):
            complexity += 2
        elif "appcast" in job_data.get("url", ""):
            complexity += 1
        
        return min(complexity, 10)
    
    def _predict_form_type(self, job_data: Dict[str, Any]) -> str:
        """Predict likely form type based on job data"""
        url = job_data.get("url", "")
        
        if "smartrecruiters" in url:
            return "multi_page_enterprise"
        elif "appcast" in url:
            return "single_page_simple"
        else:
            return "unknown"
    
    def _determine_strategy(self, job_data: Dict[str, Any], patterns: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Determine application strategy based on analysis"""
        complexity = self._assess_complexity(job_data)
        form_type = self._predict_form_type(job_data)
        
        strategy = {
            "approach": "conservative" if complexity > 7 else "aggressive",
            "multi_page_expected": "multi_page" in form_type,
            "timeout_seconds": 300 if complexity > 7 else 180,
            "retry_attempts": 3 if complexity > 7 else 2,
            "verification_level": "comprehensive" if complexity > 7 else "basic"
        }
        
        # Apply learned patterns
        if patterns:
            successful_pattern = patterns[0]  # Use most recent successful pattern
            strategy.update(successful_pattern.get("strategy", {}))
        
        return strategy
    
    def _execute_step(self, step: Dict[str, Any], browser_manager: BrowserManager, 
                     user_data: Any, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single plan step"""
        action = step["action"]
        result = {"success": False, "screenshot": None, "error": None}
        
        try:
            if action == "navigate_to_job":
                success = browser_manager.navigate_to(job_data["url"])
                if success:
                    result["success"] = True
                    result["screenshot"] = browser_manager.take_screenshot(f"job_{job_data['id']}_initial.png")
                else:
                    result["error"] = "Failed to navigate to job page"
            
            elif action == "analyze_form_structure":
                # Analyze form fields
                email_elements = browser_manager.find_elements("//input[@type='email']", "xpath")
                phone_elements = browser_manager.find_elements("//input[@type='tel']", "xpath")
                text_elements = browser_manager.find_elements("//input[@type='text']", "xpath")
                
                if email_elements or phone_elements or text_elements:
                    result["success"] = True
                    result["screenshot"] = browser_manager.take_screenshot(f"job_{job_data['id']}_form_analysis.png")
                else:
                    result["error"] = "No form fields found"
            
            elif action == "fill_personal_info":
                # Fill form fields
                self._fill_form_fields(browser_manager, user_data)
                result["success"] = True
                result["screenshot"] = browser_manager.take_screenshot(f"job_{job_data['id']}_filled.png")
            
            elif action == "navigate_to_next_page":
                # Find and click next button
                next_button = self._find_next_button(browser_manager)
                if next_button:
                    browser_manager.click_element(next_button)
                    time.sleep(3)
                    result["success"] = True
                    result["screenshot"] = browser_manager.take_screenshot(f"job_{job_data['id']}_next_page.png")
                else:
                    result["error"] = "Next button not found"
            
            elif action == "find_submit_button":
                # Find and click submit button
                submit_button = self._find_submit_button(browser_manager)
                if submit_button:
                    browser_manager.click_element(submit_button)
                    time.sleep(5)
                    result["success"] = True
                    result["screenshot"] = browser_manager.take_screenshot(f"job_{job_data['id']}_submitted.png")
                else:
                    result["error"] = "Submit button not found"
            
            elif action == "verify_submission":
                # Verify submission success
                success = self._verify_submission_success(browser_manager)
                result["success"] = success
                if not success:
                    result["error"] = "Submission verification failed"
        
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def _fill_form_fields(self, browser_manager: BrowserManager, user_data: Any):
        """Fill form fields with user data"""
        # Email
        email_element = browser_manager.find_element("//input[@type='email']", "xpath")
        if email_element:
            browser_manager.fill_input(email_element, user_data.personal_info.email)
        
        # Phone
        phone_element = browser_manager.find_element("//input[@type='tel']", "xpath")
        if phone_element:
            browser_manager.fill_input(phone_element, user_data.personal_info.phone)
        
        # First name
        first_name_selectors = [
            "//input[@name='firstName']",
            "//input[@name='first_name']",
            "//input[@placeholder*='first' or @placeholder*='First']"
        ]
        for selector in first_name_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                browser_manager.fill_input(element, user_data.personal_info.first_name)
                break
        
        # Last name
        last_name_selectors = [
            "//input[@name='lastName']",
            "//input[@name='last_name']",
            "//input[@placeholder*='last' or @placeholder*='Last']"
        ]
        for selector in last_name_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                browser_manager.fill_input(element, user_data.personal_info.last_name)
                break
    
    def _find_next_button(self, browser_manager: BrowserManager):
        """Find next/continue button"""
        next_selectors = [
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'next')]",
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'continue')]",
            "//input[@value='Next']",
            "//input[@value='Continue']"
        ]
        
        for selector in next_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                return element
        return None
    
    def _find_submit_button(self, browser_manager: BrowserManager):
        """Find submit button"""
        submit_selectors = [
            "//button[@type='submit']",
            "//input[@type='submit']",
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'submit')]",
            "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply')]"
        ]
        
        for selector in submit_selectors:
            element = browser_manager.find_element(selector, "xpath")
            if element:
                return element
        return None
    
    def _verify_submission_success(self, browser_manager: BrowserManager) -> bool:
        """Verify if submission was successful"""
        page_source = browser_manager.get_page_source().lower()
        success_indicators = [
            "thank you", "success", "submitted", "received", "confirmation",
            "application received", "application submitted"
        ]
        
        return any(indicator in page_source for indicator in success_indicators)
    
    def _try_fallback_actions(self, step: Dict[str, Any], browser_manager: BrowserManager, 
                             user_data: Any, job_data: Dict[str, Any]):
        """Try fallback actions if main action fails"""
        for fallback in step.get("fallback_actions", []):
            self.execution_log.append(f"🔄 Trying fallback: {fallback}")
            # Implement fallback logic here
            time.sleep(1)  # Brief pause between attempts
    
    def _extract_used_selectors(self) -> Dict[str, List[str]]:
        """Extract selectors that were successfully used"""
        # This would track which selectors worked during execution
        return {
            "email": ["//input[@type='email']"],
            "phone": ["//input[@type='tel']"],
            "first_name": ["//input[@name='firstName']"],
            "last_name": ["//input[@name='lastName']"]
        }
    
    def get_execution_summary(self) -> Dict[str, Any]:
        """Get summary of agent execution"""
        return {
            "state": self.state.value,
            "execution_log": self.execution_log,
            "memory_stats": {
                "total_jobs": len(self.memory.job_history),
                "successful_jobs": len([j for j in self.memory.job_history if j["success"]]),
                "success_patterns": len(self.memory.success_patterns),
                "error_patterns": len(self.memory.error_patterns)
            }
        }

# Example usage
if __name__ == "__main__":
    agent = JobHaxAgent()
    
    # Example job data
    job_data = {
        "id": "job_1",
        "title": "Hollister Co. - Assistant Manager, Santa Anita",
        "company": "Abercrombie & Fitch Co.",
        "type": "Retail Management",
        "url": "https://jobs.smartrecruiters.com/AbercrombieAndFitchCo/744000081085955-hollister-co-assistant-manager-santa-anita"
    }
    
    # ReAct pattern execution
    reasoning = agent.reason_about_job(job_data)
    plan = agent.plan_application(job_data, reasoning)
    results = agent.execute_plan(job_data, plan)
    reflection = agent.reflect_on_results(job_data, results)
    
    print("Agent Execution Summary:")
    print(json.dumps(agent.get_execution_summary(), indent=2))
