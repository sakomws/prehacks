"""
Form filling agent that maps user data to form fields and fills them.
"""

import logging
import json
from typing import Dict, Any, List, Optional
from datetime import datetime

from core.models import UserData, FormField, FormFieldType, JobApplicationForm, BrowserAction
from agents.ai_client import AIClient
from utils.browser_manager import BrowserManager


class FormFiller:
    """Handles form filling logic and data mapping."""
    
    def __init__(self, ai_client: AIClient, browser_manager: BrowserManager):
        self.logger = logging.getLogger(__name__)
        self.ai_client = ai_client
        self.browser_manager = browser_manager
        self.field_mappings = {}
        self.filled_fields = {}
    
    def fill_form(self, form: JobApplicationForm, user_data: UserData, cv_data: Optional[Any] = None) -> List[BrowserAction]:
        """Fill the job application form with user data."""
        try:
            actions = []
            
            # Analyze form and create field mappings
            self.field_mappings = self._create_field_mappings(form, user_data)
            
            # Fill each field
            for field in form.fields:
                if field.field_type == FormFieldType.HIDDEN:
                    continue
                
                field_actions = self._fill_field(field, user_data, cv_data)
                actions.extend(field_actions)
            
            # Handle file uploads
            file_upload_actions = self._handle_file_uploads(form, user_data, cv_data)
            actions.extend(file_upload_actions)
            
            # Add submit/next button actions
            if form.submit_button:
                actions.append(BrowserAction(
                    action_type="click",
                    target=form.submit_button.xpath,
                    wait_time=2.0
                ))
            elif form.next_button:
                actions.append(BrowserAction(
                    action_type="click",
                    target=form.next_button.xpath,
                    wait_time=2.0
                ))
            
            return actions
            
        except Exception as e:
            self.logger.error(f"Failed to fill form: {e}")
            return []
    
    def _create_field_mappings(self, form: JobApplicationForm, user_data: UserData) -> Dict[str, str]:
        """Create mappings between form fields and user data."""
        mappings = {}
        
        # Common field name mappings
        common_mappings = {
            # Personal info
            'first_name': 'personal_info.first_name',
            'firstname': 'personal_info.first_name',
            'fname': 'personal_info.first_name',
            'last_name': 'personal_info.last_name',
            'lastname': 'personal_info.last_name',
            'lname': 'personal_info.last_name',
            'email': 'personal_info.email',
            'email_address': 'personal_info.email',
            'phone': 'personal_info.phone',
            'phone_number': 'personal_info.phone',
            'telephone': 'personal_info.phone',
            'mobile': 'personal_info.phone',
            'address': 'personal_info.address.street',
            'street': 'personal_info.address.street',
            'street_address': 'personal_info.address.street',
            'city': 'personal_info.address.city',
            'state': 'personal_info.address.state',
            'zip': 'personal_info.address.zip_code',
            'zip_code': 'personal_info.address.zip_code',
            'postal_code': 'personal_info.address.zip_code',
            'country': 'personal_info.address.country',
            'date_of_birth': 'personal_info.date_of_birth',
            'dob': 'personal_info.date_of_birth',
            'birth_date': 'personal_info.date_of_birth',
            'gender': 'personal_info.gender',
            'nationality': 'personal_info.nationality',
            
            # Professional info
            'current_company': 'professional_info.current_company',
            'company': 'professional_info.current_company',
            'employer': 'professional_info.current_company',
            'current_title': 'professional_info.current_title',
            'position': 'professional_info.current_title',
            'job_title': 'professional_info.current_title',
            'title': 'professional_info.current_title',
            'years_experience': 'professional_info.years_experience',
            'experience': 'professional_info.years_experience',
            'linkedin': 'professional_info.linkedin_url',
            'linkedin_url': 'professional_info.linkedin_url',
            'github': 'professional_info.github_url',
            'github_url': 'professional_info.github_url',
            'portfolio': 'professional_info.portfolio_url',
            'portfolio_url': 'professional_info.portfolio_url',
            'website': 'professional_info.portfolio_url',
            'availability': 'professional_info.availability',
            'available': 'professional_info.availability',
            'salary': 'professional_info.salary_expectation',
            'salary_expectation': 'professional_info.salary_expectation',
            'expected_salary': 'professional_info.salary_expectation',
            'work_authorization': 'professional_info.work_authorization',
            'work_auth': 'professional_info.work_authorization',
            'authorized_to_work': 'professional_info.work_authorization',
            
            # Additional fields
            'cover_letter': 'additional_info.cover_letter',
            'why_interested': 'additional_info.why_interested',
            'relocation': 'additional_info.relocation_willingness',
            'notice_period': 'additional_info.notice_period'
        }
        
        # Map form fields to user data
        for field in form.fields:
            field_key = field.name.lower() if field.name else field.id.lower()
            
            # Check direct mapping
            if field_key in common_mappings:
                mappings[field.id] = common_mappings[field_key]
            else:
                # Use AI to suggest mapping
                suggested_mapping = self._suggest_field_mapping(field, user_data)
                if suggested_mapping:
                    mappings[field.id] = suggested_mapping
        
        return mappings
    
    def _suggest_field_mapping(self, field: FormField, user_data: UserData) -> Optional[str]:
        """Use AI to suggest field mapping."""
        try:
            prompt = f"""
            Suggest which user data field should be used for this form field.
            
            Form Field:
            - Name: {field.name}
            - ID: {field.id}
            - Label: {field.label}
            - Type: {field.field_type.value}
            - Required: {field.required}
            
            Available User Data Fields:
            - personal_info.first_name, personal_info.last_name, personal_info.email, personal_info.phone
            - personal_info.address.street, personal_info.address.city, personal_info.address.state, personal_info.address.zip_code, personal_info.address.country
            - professional_info.current_company, professional_info.current_title, professional_info.years_experience
            - professional_info.linkedin_url, professional_info.github_url, professional_info.portfolio_url
            - professional_info.availability, professional_info.salary_expectation, professional_info.work_authorization
            - additional_info.cover_letter, additional_info.why_interested, additional_info.relocation_willingness
            
            Return only the suggested field path (e.g., "personal_info.first_name") or "none" if no suitable mapping exists.
            """
            
            response = self.ai_client.generate_response(prompt)
            if response and response != "none":
                return response.strip()
            
        except Exception as e:
            self.logger.error(f"Failed to suggest field mapping: {e}")
        
        return None
    
    def _fill_field(self, field: FormField, user_data: UserData, cv_data: Optional[Any] = None) -> List[BrowserAction]:
        """Fill a single form field."""
        actions = []
        
        try:
            # Get field value
            value = self._get_field_value(field, user_data, cv_data)
            
            if not value:
                self.logger.warning(f"No value found for field: {field.name or field.id}")
                return actions
            
            # Create action based on field type
            if field.field_type == FormFieldType.SELECT:
                actions.append(BrowserAction(
                    action_type="select",
                    target=field.xpath,
                    value=value,
                    wait_time=1.0
                ))
            elif field.field_type == FormFieldType.CHECKBOX:
                if value.lower() in ['true', 'yes', '1', 'on']:
                    actions.append(BrowserAction(
                        action_type="click",
                        target=field.xpath,
                        wait_time=0.5
                    ))
            elif field.field_type == FormFieldType.RADIO:
                # For radio buttons, we need to find the specific option
                radio_xpath = f"{field.xpath}[@value='{value}']"
                actions.append(BrowserAction(
                    action_type="click",
                    target=radio_xpath,
                    wait_time=0.5
                ))
            else:
                # Text, email, phone, textarea, etc.
                actions.append(BrowserAction(
                    action_type="fill",
                    target=field.xpath,
                    value=value,
                    wait_time=1.0
                ))
            
            # Mark field as filled
            self.filled_fields[field.id] = value
            
        except Exception as e:
            self.logger.error(f"Failed to fill field {field.name or field.id}: {e}")
        
        return actions
    
    def _get_field_value(self, field: FormField, user_data: UserData, cv_data: Optional[Any] = None) -> str:
        """Get the value for a form field from user data."""
        try:
            # Check if we have a mapping for this field
            field_mapping = self.field_mappings.get(field.id)
            if field_mapping:
                value = self._get_nested_value(user_data, field_mapping)
                if value:
                    return str(value)
            
            # Try to match by field name/label
            field_key = field.name.lower() if field.name else field.id.lower()
            label_key = field.label.lower() if field.label else ""
            
            # Direct field matching
            if 'first' in field_key or 'first' in label_key:
                return user_data.personal_info.first_name
            elif 'last' in field_key or 'last' in label_key:
                return user_data.personal_info.last_name
            elif 'email' in field_key or 'email' in label_key:
                return user_data.personal_info.email
            elif 'phone' in field_key or 'phone' in label_key or 'tel' in field_key:
                return user_data.personal_info.phone
            elif 'address' in field_key or 'street' in field_key:
                return user_data.personal_info.address.street
            elif 'city' in field_key:
                return user_data.personal_info.address.city
            elif 'state' in field_key:
                return user_data.personal_info.address.state
            elif 'zip' in field_key or 'postal' in field_key:
                return user_data.personal_info.address.zip_code
            elif 'country' in field_key:
                return user_data.personal_info.address.country
            elif 'company' in field_key or 'employer' in field_key:
                return user_data.professional_info.current_company
            elif 'title' in field_key or 'position' in field_key:
                return user_data.professional_info.current_title
            elif 'experience' in field_key or 'years' in field_key:
                return str(user_data.professional_info.years_experience)
            elif 'linkedin' in field_key:
                return user_data.professional_info.linkedin_url or ""
            elif 'github' in field_key:
                return user_data.professional_info.github_url or ""
            elif 'portfolio' in field_key or 'website' in field_key:
                return user_data.professional_info.portfolio_url or ""
            elif 'availability' in field_key or 'available' in field_key:
                return user_data.professional_info.availability or ""
            elif 'salary' in field_key:
                return str(user_data.professional_info.salary_expectation) if user_data.professional_info.salary_expectation else ""
            elif 'work_auth' in field_key or 'authorization' in field_key:
                return user_data.professional_info.work_authorization or ""
            elif 'cover' in field_key or 'letter' in field_key:
                return user_data.additional_info.get('cover_letter', '')
            elif 'why' in field_key or 'interest' in field_key:
                return user_data.additional_info.get('why_interested', '')
            elif 'relocation' in field_key:
                return user_data.additional_info.get('relocation_willingness', '')
            elif 'notice' in field_key:
                return user_data.additional_info.get('notice_period', '')
            
            # Use AI to suggest value
            return self.ai_client.suggest_field_value(field.name or field.id, field.field_type.value, user_data.__dict__)
            
        except Exception as e:
            self.logger.error(f"Failed to get field value for {field.name or field.id}: {e}")
            return ""
    
    def _get_nested_value(self, obj: Any, path: str) -> Any:
        """Get nested value from object using dot notation."""
        try:
            keys = path.split('.')
            value = obj
            for key in keys:
                if hasattr(value, key):
                    value = getattr(value, key)
                elif isinstance(value, dict) and key in value:
                    value = value[key]
                else:
                    return None
            return value
        except Exception:
            return None
    
    def _handle_file_uploads(self, form: JobApplicationForm, user_data: UserData, cv_data: Optional[Any] = None) -> List[BrowserAction]:
        """Handle file upload fields."""
        actions = []
        
        try:
            file_fields = [field for field in form.fields if field.field_type == FormFieldType.FILE]
            
            for field in file_fields:
                field_key = field.name.lower() if field.name else field.id.lower()
                
                if 'resume' in field_key or 'cv' in field_key or 'cv' in field_key.lower():
                    if cv_data and cv_data.file_path:
                        actions.append(BrowserAction(
                            action_type="upload",
                            target=field.xpath,
                            value=cv_data.file_path,
                            wait_time=2.0
                        ))
                elif 'cover' in field_key or 'letter' in field_key:
                    # Generate cover letter if needed
                    cover_letter = self._generate_cover_letter(user_data)
                    if cover_letter:
                        # Save cover letter to file and upload
                        cover_letter_path = self._save_cover_letter(cover_letter)
                        actions.append(BrowserAction(
                            action_type="upload",
                            target=field.xpath,
                            value=cover_letter_path,
                            wait_time=2.0
                        ))
        
        except Exception as e:
            self.logger.error(f"Failed to handle file uploads: {e}")
        
        return actions
    
    def _generate_cover_letter(self, user_data: UserData) -> str:
        """Generate a cover letter for the job application."""
        try:
            # Use existing cover letter from user data if available
            if user_data.additional_info.get('cover_letter'):
                return user_data.additional_info['cover_letter']
            
            # Generate new cover letter using AI
            job_description = "Software Engineer Position"  # This should be extracted from the job posting
            return self.ai_client.generate_cover_letter(job_description, user_data.__dict__)
            
        except Exception as e:
            self.logger.error(f"Failed to generate cover letter: {e}")
            return ""
    
    def _save_cover_letter(self, cover_letter: str) -> str:
        """Save cover letter to a file."""
        try:
            from pathlib import Path
            import os
            
            # Create cover letter file
            cover_letter_path = Path("temp") / "cover_letter.txt"
            cover_letter_path.parent.mkdir(exist_ok=True)
            
            with open(cover_letter_path, 'w', encoding='utf-8') as f:
                f.write(cover_letter)
            
            return str(cover_letter_path)
            
        except Exception as e:
            self.logger.error(f"Failed to save cover letter: {e}")
            return ""
    
    def get_filled_fields_summary(self) -> Dict[str, Any]:
        """Get summary of filled fields."""
        return {
            "total_fields": len(self.filled_fields),
            "filled_fields": self.filled_fields,
            "mappings_used": self.field_mappings
        }
