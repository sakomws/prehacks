"""
AI client for handling different AI providers (OpenAI, Gemini, Anthropic).
"""

import json
import logging
from typing import Optional, Dict, Any
import openai
import google.generativeai as genai
import anthropic


class AIClient:
    """Client for interacting with different AI providers."""
    
    def __init__(self, ai_config):
        self.logger = logging.getLogger(__name__)
        self.provider = ai_config.provider
        self.api_key = ai_config.api_key
        self.model = ai_config.model
        self.max_tokens = ai_config.max_tokens
        self.temperature = ai_config.temperature
        
        self._setup_client()
    
    def _setup_client(self):
        """Setup the appropriate AI client based on provider."""
        try:
            if self.provider == "openai":
                openai.api_key = self.api_key
                self.client = openai.OpenAI(api_key=self.api_key)
            elif self.provider == "gemini":
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model)
            elif self.provider == "anthropic":
                self.client = anthropic.Anthropic(api_key=self.api_key)
            else:
                raise ValueError(f"Unsupported AI provider: {self.provider}")
                
            self.logger.info(f"AI client initialized for provider: {self.provider}")
            
        except Exception as e:
            self.logger.error(f"Failed to setup AI client: {e}")
            raise
    
    def generate_response(self, prompt: str, system_prompt: str = None) -> str:
        """Generate a response using the configured AI provider."""
        try:
            if self.provider == "openai":
                return self._generate_openai_response(prompt, system_prompt)
            elif self.provider == "gemini":
                return self._generate_gemini_response(prompt, system_prompt)
            elif self.provider == "anthropic":
                return self._generate_anthropic_response(prompt, system_prompt)
            else:
                raise ValueError(f"Unsupported AI provider: {self.provider}")
                
        except Exception as e:
            self.logger.error(f"Failed to generate AI response: {e}")
            return ""
    
    def _generate_openai_response(self, prompt: str, system_prompt: str = None) -> str:
        """Generate response using OpenAI."""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            self.logger.error(f"OpenAI API error: {e}")
            return ""
    
    def _generate_gemini_response(self, prompt: str, system_prompt: str = None) -> str:
        """Generate response using Google Gemini."""
        try:
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"{system_prompt}\n\n{prompt}"
            
            response = self.client.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=self.max_tokens,
                    temperature=self.temperature
                )
            )
            
            return response.text.strip()
            
        except Exception as e:
            self.logger.error(f"Gemini API error: {e}")
            return ""
    
    def _generate_anthropic_response(self, prompt: str, system_prompt: str = None) -> str:
        """Generate response using Anthropic Claude."""
        try:
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"{system_prompt}\n\n{prompt}"
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                messages=[{"role": "user", "content": full_prompt}]
            )
            
            return response.content[0].text.strip()
            
        except Exception as e:
            self.logger.error(f"Anthropic API error: {e}")
            return ""
    
    def analyze_form_fields(self, form_html: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze form fields and suggest data mapping."""
        try:
            prompt = f"""
            Analyze this job application form HTML and suggest how to map user data to form fields.
            
            Form HTML: {form_html[:3000]}...
            
            User Data: {json.dumps(user_data, indent=2)[:2000]}...
            
            Return a JSON object mapping form field names/IDs to user data fields:
            {{
                "field_mappings": {{
                    "first_name": "personal_info.first_name",
                    "last_name": "personal_info.last_name",
                    "email": "personal_info.email",
                    "phone": "personal_info.phone",
                    "address": "personal_info.address.street",
                    "city": "personal_info.address.city",
                    "state": "personal_info.address.state",
                    "zip": "personal_info.address.zip_code",
                    "country": "personal_info.address.country",
                    "current_company": "professional_info.current_company",
                    "current_title": "professional_info.current_title",
                    "years_experience": "professional_info.years_experience",
                    "linkedin": "professional_info.linkedin_url",
                    "github": "professional_info.github_url",
                    "portfolio": "professional_info.portfolio_url",
                    "availability": "professional_info.availability",
                    "salary": "professional_info.salary_expectation",
                    "work_auth": "professional_info.work_authorization"
                }},
                "file_uploads": {{
                    "resume": "cv_file_path",
                    "cover_letter": "cover_letter_text"
                }},
                "special_instructions": [
                    "Additional instructions for filling specific fields"
                ]
            }}
            """
            
            response = self.generate_response(prompt)
            
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                self.logger.warning("AI response is not valid JSON")
                return {"field_mappings": {}, "file_uploads": {}, "special_instructions": []}
                
        except Exception as e:
            self.logger.error(f"Failed to analyze form fields: {e}")
            return {"field_mappings": {}, "file_uploads": {}, "special_instructions": []}
    
    def generate_cover_letter(self, job_description: str, user_data: Dict[str, Any]) -> str:
        """Generate a cover letter based on job description and user data."""
        try:
            prompt = f"""
            Generate a professional cover letter for this job application.
            
            Job Description: {job_description[:2000]}...
            
            User Information:
            - Name: {user_data.get('personal_info', {}).get('first_name', '')} {user_data.get('personal_info', {}).get('last_name', '')}
            - Current Position: {user_data.get('professional_info', {}).get('current_title', '')}
            - Company: {user_data.get('professional_info', {}).get('current_company', '')}
            - Experience: {user_data.get('professional_info', {}).get('years_experience', '')} years
            - Skills: {', '.join(user_data.get('skills', {}).get('programming_languages', [])[:5])}
            
            Additional Info: {user_data.get('additional_info', {}).get('cover_letter', '')}
            
            Generate a compelling cover letter that:
            1. Highlights relevant experience and skills
            2. Shows enthusiasm for the role
            3. Is professional and concise (300-500 words)
            4. Addresses key requirements from the job description
            """
            
            return self.generate_response(prompt)
            
        except Exception as e:
            self.logger.error(f"Failed to generate cover letter: {e}")
            return ""
    
    def suggest_field_value(self, field_name: str, field_type: str, user_data: Dict[str, Any]) -> str:
        """Suggest a value for a specific form field."""
        try:
            prompt = f"""
            Suggest an appropriate value for this form field based on the user's data.
            
            Field Name: {field_name}
            Field Type: {field_type}
            
            User Data: {json.dumps(user_data, indent=2)[:1000]}...
            
            Return only the suggested value, nothing else.
            """
            
            return self.generate_response(prompt).strip()
            
        except Exception as e:
            self.logger.error(f"Failed to suggest field value: {e}")
            return ""
