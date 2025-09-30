"""
PDF processing utilities for CV extraction.
"""

import logging
from typing import Dict, Any, List
import PyPDF2
import re


class PDFProcessor:
    """Handles PDF file processing and text extraction."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def extract_text(self, file_path: str) -> str:
        """Extract text content from PDF file."""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text += page.extract_text() + "\n"
                
                return text.strip()
                
        except Exception as e:
            self.logger.error(f"Failed to extract text from PDF {file_path}: {e}")
            return ""
    
    def extract_structured_data(self, file_path: str) -> Dict[str, Any]:
        """Extract structured data from PDF file."""
        text = self.extract_text(file_path)
        if not text:
            return {}
        
        return {
            'sections': self._extract_sections(text),
            'contact_info': self._extract_contact_info(text),
            'skills': self._extract_skills(text),
            'experience': self._extract_experience(text),
            'education': self._extract_education(text),
            'certifications': self._extract_certifications(text)
        }
    
    def _extract_sections(self, text: str) -> List[str]:
        """Extract section headers from text."""
        # Common CV section headers
        section_keywords = [
            'experience', 'work experience', 'employment',
            'education', 'academic background',
            'skills', 'technical skills', 'core competencies',
            'certifications', 'licenses',
            'projects', 'portfolio',
            'awards', 'achievements',
            'references', 'contact'
        ]
        
        sections = []
        lines = text.split('\n')
        
        for line in lines:
            line_lower = line.lower().strip()
            for keyword in section_keywords:
                if keyword in line_lower and len(line.strip()) < 50:
                    sections.append(line.strip())
                    break
        
        return sections
    
    def _extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract contact information from text."""
        contact_info = {}
        
        # Email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            contact_info['email'] = email_match.group()
        
        # Phone
        phone_patterns = [
            r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        ]
        
        for pattern in phone_patterns:
            phone_match = re.search(pattern, text)
            if phone_match:
                contact_info['phone'] = phone_match.group()
                break
        
        # LinkedIn
        linkedin_pattern = r'linkedin\.com/in/[\w-]+'
        linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
        if linkedin_match:
            contact_info['linkedin'] = linkedin_match.group()
        
        # GitHub
        github_pattern = r'github\.com/[\w-]+'
        github_match = re.search(github_pattern, text, re.IGNORECASE)
        if github_match:
            contact_info['github'] = github_match.group()
        
        return contact_info
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from text."""
        skill_keywords = [
            'python', 'javascript', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift',
            'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring', 'express',
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible',
            'git', 'jenkins', 'ci/cd', 'agile', 'scrum', 'devops',
            'machine learning', 'ai', 'data science', 'analytics',
            'html', 'css', 'bootstrap', 'tailwind', 'sass', 'less'
        ]
        
        found_skills = []
        text_lower = text.lower()
        
        for skill in skill_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        return list(set(found_skills))  # Remove duplicates
    
    def _extract_experience(self, text: str) -> List[Dict[str, str]]:
        """Extract work experience from text."""
        experiences = []
        
        # Common experience patterns
        patterns = [
            r'(\d{4})\s*[-–]\s*(\d{4}|\w+)\s+(.+?)\s+(?:at|@)\s+(.+?)(?:\n|$)',
            r'(\d{4})\s*[-–]\s*(\d{4}|\w+)\s+(.+?)\s*,\s*(.+?)(?:\n|$)',
            r'(.+?)\s*,\s*(.+?)\s*(\d{4})\s*[-–]\s*(\d{4}|\w+)(?:\n|$)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                if len(match) >= 4:
                    experiences.append({
                        'start_date': match[0],
                        'end_date': match[1],
                        'position': match[2].strip(),
                        'company': match[3].strip()
                    })
                elif len(match) == 3:
                    experiences.append({
                        'position': match[0].strip(),
                        'company': match[1].strip(),
                        'start_date': match[2],
                        'end_date': 'Present'
                    })
        
        return experiences
    
    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education from text."""
        education = []
        
        # Common education patterns
        patterns = [
            r'(\d{4})\s+(.+?)\s+in\s+(.+?)\s+from\s+(.+?)(?:\n|$)',
            r'(.+?)\s+in\s+(.+?)\s+from\s+(.+?)\s+(\d{4})(?:\n|$)',
            r'(.+?)\s*,\s*(.+?)\s*,\s*(\d{4})(?:\n|$)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                if len(match) == 4:
                    if match[0].isdigit():
                        education.append({
                            'year': match[0],
                            'degree': match[1],
                            'field': match[2],
                            'institution': match[3]
                        })
                    else:
                        education.append({
                            'degree': match[0],
                            'field': match[1],
                            'institution': match[2],
                            'year': match[3]
                        })
                elif len(match) == 3:
                    education.append({
                        'degree': match[0],
                        'institution': match[1],
                        'year': match[2]
                    })
        
        return education
    
    def _extract_certifications(self, text: str) -> List[Dict[str, str]]:
        """Extract certifications from text."""
        certifications = []
        
        # Common certification patterns
        patterns = [
            r'(.+?)\s*,\s*(.+?)\s*,\s*(\d{4})(?:\n|$)',
            r'(.+?)\s+from\s+(.+?)\s+(\d{4})(?:\n|$)',
            r'(.+?)\s*-\s*(.+?)\s*(\d{4})(?:\n|$)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                certifications.append({
                    'name': match[0].strip(),
                    'issuer': match[1].strip(),
                    'year': match[2].strip()
                })
        
        return certifications
