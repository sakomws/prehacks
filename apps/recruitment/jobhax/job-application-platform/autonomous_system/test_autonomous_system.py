#!/usr/bin/env python3
"""
Test script for the Autonomous Job Application System
Works with or without the py_interaction library
"""

import json
import sys
from pathlib import Path

# Try to import py_interaction, fall back to mock if not available
try:
    from py_interaction import HostDevice, VNCClient
    print("✅ Using real py_interaction library")
except ImportError:
    print("⚠️  py_interaction not found, using mock implementation")
    try:
        from mock_py_interaction import HostDevice, VNCClient
    except ImportError:
        print("❌ Mock implementation not found. Run setup.py first.")
        sys.exit(1)

from autonomous_job_applicant import AutonomousJobApplicant

class TestAutonomousSystem:
    """Test the autonomous system with mock data"""
    
    def __init__(self):
        self.applicant = AutonomousJobApplicant()
        # Replace the browser with our mock/real implementation
        self.applicant.browser = HostDevice()
    
    def test_field_detection(self):
        """Test field detection capabilities"""
        print("\n🔍 Testing field detection...")
        
        # Simulate a job application page
        mock_fields = [
            {"type": "text", "name": "first_name", "label": "First Name", "required": True},
            {"type": "text", "name": "last_name", "label": "Last Name", "required": True},
            {"type": "email", "name": "email", "label": "Email Address", "required": True},
            {"type": "tel", "name": "phone", "label": "Phone Number", "required": True},
            {"type": "select", "name": "country", "label": "Country", "required": True},
            {"type": "radio", "name": "work_authorization", "label": "Work Authorization", "required": True},
            {"type": "textarea", "name": "cover_letter", "label": "Cover Letter", "required": False},
            {"type": "file", "name": "resume", "label": "Resume Upload", "required": True},
        ]
        
        print(f"✅ Detected {len(mock_fields)} form fields")
        
        # Test field mapping
        for field in mock_fields:
            # Convert field format for mapping function
            field_for_mapping = {
                "field_id": field["name"],
                "field_type": field["type"]
            }
            value = self.applicant.map_field_to_data(field_for_mapping)
            if value:
                print(f"✅ Mapped {field['name']} → {value}")
            else:
                print(f"⚠️  No mapping for {field['name']}")
        
        return mock_fields
    
    def test_data_mapping(self):
        """Test data mapping capabilities"""
        print("\n📝 Testing data mapping...")
        
        test_fields = [
            {"field_id": "first_name", "field_type": "text", "label": "First Name"},
            {"field_id": "email", "field_type": "email", "label": "Email"},
            {"field_id": "years_experience", "field_type": "select", "label": "Years of Experience"},
            {"field_id": "cover_letter", "field_type": "textarea", "label": "Cover Letter"},
            {"field_id": "age_18", "field_type": "radio", "label": "Are you over 18?"},
            {"field_id": "sponsorship", "field_type": "radio", "label": "Need sponsorship?"},
        ]
        
        for field in test_fields:
            value = self.applicant.map_field_to_data(field)
            print(f"Field: {field['field_id']} → Value: {value}")
    
    def test_autonomous_flow(self, job_url="https://example.com/jobs/apply/123"):
        """Test the complete autonomous flow"""
        print(f"\n🤖 Testing autonomous flow with URL: {job_url}")
        
        # Mock the page detection
        self.applicant.detect_page_type = lambda: "first_page"
        
        # Mock field analysis
        original_analyze = self.applicant.analyze_form_fields
        def mock_analyze():
            mock_fields = self.test_field_detection()
            # Convert to the format expected by the system
            return [{"field_id": f["name"], "field_type": f["type"], "label": f["label"], "required": f["required"]} for f in mock_fields]
        self.applicant.analyze_form_fields = mock_analyze
        
        # Mock page progression
        original_proceed = self.applicant.proceed_to_next_page
        def mock_proceed():
            self.applicant.current_page += 1
            self.applicant.is_second_page = True
            return True
        self.applicant.proceed_to_next_page = mock_proceed
        
        # Run the autonomous application
        result = self.applicant.run_autonomous_application(job_url)
        
        # Restore original methods
        self.applicant.analyze_form_fields = original_analyze
        self.applicant.proceed_to_next_page = original_proceed
        
        return result
    
    def test_output_generation(self):
        """Test output generation"""
        print("\n📊 Testing output generation...")
        
        # Generate test output
        result = self.applicant._generate_output()
        
        # Validate output structure
        required_keys = ["task_completion", "detections", "actions_performed", "questions_encountered", "traces", "summary"]
        for key in required_keys:
            if key in result:
                print(f"✅ {key} present in output")
            else:
                print(f"❌ {key} missing from output")
        
        # Save test output
        output_file = "test_output.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"✅ Test output saved to {output_file}")
        return result
    
    def run_all_tests(self):
        """Run all tests"""
        print("🧪 Running Autonomous Job Application System Tests")
        print("=" * 60)
        
        # Test 1: Field detection
        self.test_field_detection()
        
        # Test 2: Data mapping
        self.test_data_mapping()
        
        # Test 3: Autonomous flow
        result = self.test_autonomous_flow()
        
        # Test 4: Output generation
        self.test_output_generation()
        
        print("\n✅ All tests completed!")
        print(f"📊 Task completion: {result['task_completion']}")
        print(f"📝 Summary: {result['summary'][:200]}...")

def main():
    """Main test function"""
    if len(sys.argv) > 1:
        job_url = sys.argv[1]
    else:
        job_url = "https://example.com/jobs/apply/123"
    
    tester = TestAutonomousSystem()
    tester.run_all_tests()
    
    print(f"\n🎯 To test with a real job URL, run:")
    print(f"python autonomous_job_applicant.py '{job_url}'")

if __name__ == "__main__":
    main()
