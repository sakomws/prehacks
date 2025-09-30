"""
Data loading utilities for JobHax system.
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

from core.models import UserData, PersonalInfo, ProfessionalInfo, Address, Education, WorkExperience, Skills, Certification, Reference, CVData
from utils.pdf_processor import PDFProcessor
from utils.docx_processor import DocxProcessor


class DataLoader:
    """Handles loading and processing of user data and CV files."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.pdf_processor = PDFProcessor()
        self.docx_processor = DocxProcessor()
    
    def load_user_data(self, file_path: str) -> UserData:
        """Load user data from JSON file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Parse personal info
            personal_data = data['personal_info']
            address_data = personal_data['address']
            personal_info = PersonalInfo(
                first_name=personal_data['first_name'],
                last_name=personal_data['last_name'],
                email=personal_data['email'],
                phone=personal_data['phone'],
                address=Address(
                    street=address_data['street'],
                    city=address_data['city'],
                    state=address_data['state'],
                    zip_code=address_data['zip_code'],
                    country=address_data['country']
                ),
                date_of_birth=personal_data.get('date_of_birth'),
                gender=personal_data.get('gender'),
                nationality=personal_data.get('nationality')
            )
            
            # Parse professional info
            prof_data = data['professional_info']
            professional_info = ProfessionalInfo(
                current_title=prof_data['current_title'],
                current_company=prof_data['current_company'],
                years_experience=prof_data['years_experience'],
                linkedin_url=prof_data.get('linkedin_url'),
                github_url=prof_data.get('github_url'),
                portfolio_url=prof_data.get('portfolio_url'),
                availability=prof_data.get('availability'),
                salary_expectation=prof_data.get('salary_expectation'),
                work_authorization=prof_data.get('work_authorization')
            )
            
            # Parse education
            education = []
            for edu_data in data['education']:
                education.append(Education(
                    institution=edu_data['institution'],
                    degree=edu_data['degree'],
                    field_of_study=edu_data['field_of_study'],
                    graduation_year=edu_data['graduation_year'],
                    gpa=edu_data.get('gpa')
                ))
            
            # Parse work experience
            work_experience = []
            for exp_data in data['work_experience']:
                work_experience.append(WorkExperience(
                    company=exp_data['company'],
                    position=exp_data['position'],
                    start_date=exp_data['start_date'],
                    end_date=exp_data['end_date'],
                    description=exp_data['description'],
                    achievements=exp_data['achievements']
                ))
            
            # Parse skills
            skills_data = data['skills']
            skills = Skills(
                programming_languages=skills_data['programming_languages'],
                frameworks=skills_data['frameworks'],
                databases=skills_data['databases'],
                cloud_platforms=skills_data['cloud_platforms'],
                tools=skills_data['tools']
            )
            
            # Parse certifications
            certifications = []
            for cert_data in data['certifications']:
                certifications.append(Certification(
                    name=cert_data['name'],
                    issuer=cert_data['issuer'],
                    date_earned=cert_data['date_earned'],
                    expiry_date=cert_data.get('expiry_date')
                ))
            
            # Parse references
            references = []
            for ref_data in data['references']:
                references.append(Reference(
                    name=ref_data['name'],
                    title=ref_data['title'],
                    company=ref_data['company'],
                    email=ref_data['email'],
                    phone=ref_data['phone']
                ))
            
            return UserData(
                personal_info=personal_info,
                professional_info=professional_info,
                education=education,
                work_experience=work_experience,
                skills=skills,
                certifications=certifications,
                references=references,
                additional_info=data['additional_info']
            )
            
        except Exception as e:
            self.logger.error(f"Failed to load user data from {file_path}: {e}")
            raise
    
    def load_cv_data(self, file_path: str) -> Optional[CVData]:
        """Load and process CV data from file."""
        try:
            file_path = Path(file_path)
            if not file_path.exists():
                self.logger.warning(f"CV file not found: {file_path}")
                return None
            
            file_type = file_path.suffix.lower()
            
            if file_type == '.pdf':
                return self._process_pdf_cv(file_path)
            elif file_type in ['.doc', '.docx']:
                return self._process_docx_cv(file_path)
            else:
                self.logger.warning(f"Unsupported CV file type: {file_type}")
                return None
                
        except Exception as e:
            self.logger.error(f"Failed to load CV data from {file_path}: {e}")
            return None
    
    def _process_pdf_cv(self, file_path: Path) -> CVData:
        """Process PDF CV file."""
        text_content = self.pdf_processor.extract_text(str(file_path))
        structured_data = self.pdf_processor.extract_structured_data(str(file_path))
        
        return CVData(
            file_path=str(file_path),
            file_type='pdf',
            text_content=text_content,
            structured_data=structured_data,
            skills=self._extract_skills_from_text(text_content),
            experience=self._extract_experience_from_text(text_content),
            education=self._extract_education_from_text(text_content),
            contact_info=self._extract_contact_info_from_text(text_content)
        )
    
    def _process_docx_cv(self, file_path: Path) -> CVData:
        """Process DOCX CV file."""
        text_content = self.docx_processor.extract_text(str(file_path))
        structured_data = self.docx_processor.extract_structured_data(str(file_path))
        
        return CVData(
            file_path=str(file_path),
            file_type='docx',
            text_content=text_content,
            structured_data=structured_data,
            skills=self._extract_skills_from_text(text_content),
            experience=self._extract_experience_from_text(text_content),
            education=self._extract_education_from_text(text_content),
            contact_info=self._extract_contact_info_from_text(text_content)
        )
    
    def _extract_skills_from_text(self, text: str) -> list:
        """Extract skills from CV text."""
        # Simple keyword extraction - in production, use more sophisticated NLP
        skill_keywords = [
            'python', 'javascript', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby',
            'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring',
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
            'git', 'jenkins', 'ci/cd', 'agile', 'scrum'
        ]
        
        found_skills = []
        text_lower = text.lower()
        for skill in skill_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        return found_skills
    
    def _extract_experience_from_text(self, text: str) -> list:
        """Extract work experience from CV text."""
        # Simple regex-based extraction - in production, use more sophisticated NLP
        import re
        
        experience_patterns = [
            r'(\d{4})\s*-\s*(\d{4}|\w+)\s+(.+?)\s+at\s+(.+?)(?:\n|$)',
            r'(\d{4})\s*-\s*(\d{4}|\w+)\s+(.+?)\s+@\s+(.+?)(?:\n|$)',
        ]
        
        experiences = []
        for pattern in experience_patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                experiences.append({
                    'start_date': match[0],
                    'end_date': match[1],
                    'position': match[2].strip(),
                    'company': match[3].strip()
                })
        
        return experiences
    
    def _extract_education_from_text(self, text: str) -> list:
        """Extract education from CV text."""
        # Simple regex-based extraction
        import re
        
        education_patterns = [
            r'(\d{4})\s+(.+?)\s+in\s+(.+?)\s+from\s+(.+?)(?:\n|$)',
            r'(.+?)\s+in\s+(.+?)\s+from\s+(.+?)\s+(\d{4})(?:\n|$)',
        ]
        
        education = []
        for pattern in education_patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                if len(match) == 4:
                    education.append({
                        'year': match[0] if match[0].isdigit() else match[3],
                        'degree': match[1] if match[0].isdigit() else match[0],
                        'field': match[2],
                        'institution': match[3] if match[0].isdigit() else match[2]
                    })
        
        return education
    
    def _extract_contact_info_from_text(self, text: str) -> dict:
        """Extract contact information from CV text."""
        import re
        
        contact_info = {}
        
        # Email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            contact_info['email'] = email_match.group()
        
        # Phone
        phone_pattern = r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
        phone_match = re.search(phone_pattern, text)
        if phone_match:
            contact_info['phone'] = phone_match.group()
        
        # LinkedIn
        linkedin_pattern = r'linkedin\.com/in/[\w-]+'
        linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
        if linkedin_match:
            contact_info['linkedin'] = linkedin_match.group()
        
        return contact_info
