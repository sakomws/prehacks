"""
Form analysis agent using AI to understand job application forms.
"""

import logging
import json
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup

from core.models import FormField, FormFieldType, JobApplicationForm
from core.config import AIConfig
from agents.ai_client import AIClient


class FormAnalyzer:
    """Analyzes job application forms and extracts field information."""
    
    def __init__(self, ai_config: AIConfig):
        self.logger = logging.getLogger(__name__)
        self.ai_client = AIClient(ai_config)
    
    def analyze_form(self, html_content: str, url: str) -> JobApplicationForm:
        """Analyze HTML content and extract form fields."""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract form title
            title = self._extract_form_title(soup)
            
            # Find all form elements
            form_elements = self._find_form_elements(soup)
            
            # Analyze each element
            fields = []
            for element in form_elements:
                field = self._analyze_form_element(element)
                if field:
                    fields.append(field)
            
            # Find submit and next buttons
            submit_button = self._find_submit_button(soup)
            next_button = self._find_next_button(soup)
            
            return JobApplicationForm(
                url=url,
                title=title,
                fields=fields,
                submit_button=submit_button,
                next_button=next_button
            )
            
        except Exception as e:
            self.logger.error(f"Failed to analyze form: {e}")
            return JobApplicationForm(url=url, title="Unknown Form", fields=[])
    
    def _extract_form_title(self, soup: BeautifulSoup) -> str:
        """Extract form title from HTML."""
        # Try various selectors for form title
        title_selectors = [
            'h1',
            'h2',
            '.form-title',
            '.page-title',
            '.application-title',
            'title'
        ]
        
        for selector in title_selectors:
            element = soup.select_one(selector)
            if element and element.get_text(strip=True):
                return element.get_text(strip=True)
        
        return "Job Application Form"
    
    def _find_form_elements(self, soup: BeautifulSoup) -> List[Any]:
        """Find all form input elements."""
        elements = []
        
        # Find all input elements
        inputs = soup.find_all('input')
        elements.extend(inputs)
        
        # Find all select elements
        selects = soup.find_all('select')
        elements.extend(selects)
        
        # Find all textarea elements
        textareas = soup.find_all('textarea')
        elements.extend(textareas)
        
        return elements
    
    def _analyze_form_element(self, element: Any) -> Optional[FormField]:
        """Analyze a single form element and extract field information."""
        try:
            # Extract basic attributes
            field_id = element.get('id', '')
            field_name = element.get('name', '')
            field_type = element.get('type', 'text')
            field_required = element.get('required') is not None
            field_placeholder = element.get('placeholder', '')
            
            # Extract label
            label = self._extract_label(element)
            
            # Determine field type
            form_field_type = self._map_field_type(element.tag, field_type)
            
            # Extract options for select elements
            options = []
            if element.tag == 'select':
                options = self._extract_select_options(element)
            
            # Generate XPath
            xpath = self._generate_xpath(element)
            
            return FormField(
                id=field_id,
                name=field_name,
                field_type=form_field_type,
                label=label,
                placeholder=field_placeholder,
                required=field_required,
                options=options if options else None,
                xpath=xpath
            )
            
        except Exception as e:
            self.logger.error(f"Failed to analyze form element: {e}")
            return None
    
    def _extract_label(self, element: Any) -> str:
        """Extract label text for a form element."""
        # Try to find associated label
        field_id = element.get('id')
        if field_id:
            label = element.find_previous('label', {'for': field_id})
            if label:
                return label.get_text(strip=True)
        
        # Try to find parent label
        parent_label = element.find_parent('label')
        if parent_label:
            return parent_label.get_text(strip=True)
        
        # Try to find nearby text
        nearby_text = element.find_previous(text=True)
        if nearby_text and nearby_text.strip():
            return nearby_text.strip()
        
        return ""
    
    def _map_field_type(self, tag: str, input_type: str) -> FormFieldType:
        """Map HTML input type to FormFieldType."""
        if tag == 'select':
            return FormFieldType.SELECT
        elif tag == 'textarea':
            return FormFieldType.TEXTAREA
        elif input_type == 'email':
            return FormFieldType.EMAIL
        elif input_type == 'tel':
            return FormFieldType.PHONE
        elif input_type == 'password':
            return FormFieldType.PASSWORD
        elif input_type == 'number':
            return FormFieldType.NUMBER
        elif input_type == 'date':
            return FormFieldType.DATE
        elif input_type == 'checkbox':
            return FormFieldType.CHECKBOX
        elif input_type == 'radio':
            return FormFieldType.RADIO
        elif input_type == 'file':
            return FormFieldType.FILE
        elif input_type == 'hidden':
            return FormFieldType.HIDDEN
        else:
            return FormFieldType.TEXT
    
    def _extract_select_options(self, select_element: Any) -> List[str]:
        """Extract options from select element."""
        options = []
        for option in select_element.find_all('option'):
            option_text = option.get_text(strip=True)
            if option_text:
                options.append(option_text)
        return options
    
    def _generate_xpath(self, element: Any) -> str:
        """Generate XPath for an element."""
        try:
            # Simple XPath generation - in production, use more sophisticated method
            if element.get('id'):
                return f"//*[@id='{element.get('id')}']"
            elif element.get('name'):
                return f"//*[@name='{element.get('name')}']"
            elif element.get('class'):
                classes = ' '.join(element.get('class'))
                return f"//*[@class='{classes}']"
            else:
                return f"//{element.tag}"
        except Exception:
            return ""
    
    def _find_submit_button(self, soup: BeautifulSoup) -> Optional[FormField]:
        """Find submit button in the form."""
        submit_selectors = [
            'input[type="submit"]',
            'button[type="submit"]',
            'button:contains("Submit")',
            'button:contains("Apply")',
            'button:contains("Next")',
            '.submit-button',
            '.apply-button'
        ]
        
        for selector in submit_selectors:
            element = soup.select_one(selector)
            if element:
                return FormField(
                    id=element.get('id', ''),
                    name=element.get('name', ''),
                    field_type=FormFieldType.TEXT,
                    label=element.get_text(strip=True),
                    xpath=self._generate_xpath(element)
                )
        
        return None
    
    def _find_next_button(self, soup: BeautifulSoup) -> Optional[FormField]:
        """Find next/continue button in the form."""
        next_selectors = [
            'button:contains("Next")',
            'button:contains("Continue")',
            'button:contains("Proceed")',
            '.next-button',
            '.continue-button'
        ]
        
        for selector in next_selectors:
            element = soup.select_one(selector)
            if element:
                return FormField(
                    id=element.get('id', ''),
                    name=element.get('name', ''),
                    field_type=FormFieldType.TEXT,
                    label=element.get_text(strip=True),
                    xpath=self._generate_xpath(element)
                )
        
        return None
    
    def analyze_form_with_ai(self, html_content: str, url: str) -> JobApplicationForm:
        """Use AI to analyze form structure and extract fields."""
        try:
            # Prepare prompt for AI analysis
            prompt = f"""
            Analyze this job application form HTML and extract all form fields with their details.
            
            URL: {url}
            HTML Content: {html_content[:5000]}...
            
            Return a JSON object with the following structure:
            {{
                "title": "Form title",
                "fields": [
                    {{
                        "id": "field_id",
                        "name": "field_name",
                        "type": "text|email|phone|select|textarea|checkbox|radio|file|date|number",
                        "label": "Field label",
                        "placeholder": "Placeholder text",
                        "required": true/false,
                        "options": ["option1", "option2"] (for select fields),
                        "xpath": "//xpath/to/element"
                    }}
                ],
                "submit_button": {{
                    "id": "submit_id",
                    "label": "Submit",
                    "xpath": "//xpath/to/submit"
                }},
                "next_button": {{
                    "id": "next_id", 
                    "label": "Next",
                    "xpath": "//xpath/to/next"
                }}
            }}
            """
            
            response = self.ai_client.generate_response(prompt)
            
            # Parse AI response
            try:
                form_data = json.loads(response)
                return self._parse_ai_form_data(form_data, url)
            except json.JSONDecodeError:
                self.logger.warning("AI response is not valid JSON, falling back to HTML parsing")
                return self.analyze_form(html_content, url)
                
        except Exception as e:
            self.logger.error(f"AI form analysis failed: {e}")
            return self.analyze_form(html_content, url)
    
    def _parse_ai_form_data(self, form_data: Dict[str, Any], url: str) -> JobApplicationForm:
        """Parse AI-generated form data into JobApplicationForm object."""
        fields = []
        
        for field_data in form_data.get('fields', []):
            field = FormField(
                id=field_data.get('id', ''),
                name=field_data.get('name', ''),
                field_type=FormFieldType(field_data.get('type', 'text')),
                label=field_data.get('label', ''),
                placeholder=field_data.get('placeholder'),
                required=field_data.get('required', False),
                options=field_data.get('options'),
                xpath=field_data.get('xpath', '')
            )
            fields.append(field)
        
        submit_button = None
        if form_data.get('submit_button'):
            submit_data = form_data['submit_button']
            submit_button = FormField(
                id=submit_data.get('id', ''),
                name='submit',
                field_type=FormFieldType.TEXT,
                label=submit_data.get('label', 'Submit'),
                xpath=submit_data.get('xpath', '')
            )
        
        next_button = None
        if form_data.get('next_button'):
            next_data = form_data['next_button']
            next_button = FormField(
                id=next_data.get('id', ''),
                name='next',
                field_type=FormFieldType.TEXT,
                label=next_data.get('label', 'Next'),
                xpath=next_data.get('xpath', '')
            )
        
        return JobApplicationForm(
            url=url,
            title=form_data.get('title', 'Job Application Form'),
            fields=fields,
            submit_button=submit_button,
            next_button=next_button
        )
