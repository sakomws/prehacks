"""
Data models for JobHax system.
"""

from typing import List, Optional, Dict, Any, Union
from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class FormFieldType(Enum):
    """Types of form fields."""
    TEXT = "text"
    EMAIL = "email"
    PHONE = "tel"
    PASSWORD = "password"
    NUMBER = "number"
    DATE = "date"
    SELECT = "select"
    TEXTAREA = "textarea"
    CHECKBOX = "checkbox"
    RADIO = "radio"
    FILE = "file"
    HIDDEN = "hidden"


class FormFieldStatus(Enum):
    """Status of form field processing."""
    PENDING = "pending"
    FILLED = "filled"
    SKIPPED = "skipped"
    ERROR = "error"


@dataclass
class Address:
    """Address information."""
    street: str
    city: str
    state: str
    zip_code: str
    country: str


@dataclass
class PersonalInfo:
    """Personal information."""
    first_name: str
    last_name: str
    email: str
    phone: str
    address: Address
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None


@dataclass
class ProfessionalInfo:
    """Professional information."""
    current_title: str
    current_company: str
    years_experience: int
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    availability: Optional[str] = None
    salary_expectation: Optional[int] = None
    work_authorization: Optional[str] = None


@dataclass
class Education:
    """Education information."""
    institution: str
    degree: str
    field_of_study: str
    graduation_year: int
    gpa: Optional[float] = None


@dataclass
class WorkExperience:
    """Work experience information."""
    company: str
    position: str
    start_date: str
    end_date: str
    description: str
    achievements: List[str]


@dataclass
class Skills:
    """Skills information."""
    programming_languages: List[str]
    frameworks: List[str]
    databases: List[str]
    cloud_platforms: List[str]
    tools: List[str]


@dataclass
class Certification:
    """Certification information."""
    name: str
    issuer: str
    date_earned: str
    expiry_date: Optional[str] = None


@dataclass
class Reference:
    """Reference information."""
    name: str
    title: str
    company: str
    email: str
    phone: str


@dataclass
class UserData:
    """Complete user data structure."""
    personal_info: PersonalInfo
    professional_info: ProfessionalInfo
    education: List[Education]
    work_experience: List[WorkExperience]
    skills: Skills
    certifications: List[Certification]
    references: List[Reference]
    additional_info: Dict[str, Any]


@dataclass
class FormField:
    """Form field information."""
    id: str
    name: str
    field_type: FormFieldType
    label: str
    placeholder: Optional[str] = None
    required: bool = False
    value: Optional[str] = None
    options: Optional[List[str]] = None
    status: FormFieldStatus = FormFieldStatus.PENDING
    error_message: Optional[str] = None
    xpath: Optional[str] = None
    css_selector: Optional[str] = None


@dataclass
class JobApplicationForm:
    """Job application form structure."""
    url: str
    title: str
    fields: List[FormField]
    submit_button: Optional[FormField] = None
    next_button: Optional[FormField] = None
    file_uploads: List[FormField] = None


@dataclass
class JobApplicationResult:
    """Result of job application processing."""
    success: bool
    message: str
    form_data: Dict[str, Any]
    errors: List[str]
    screenshots: List[str]
    processing_time: float
    timestamp: datetime


@dataclass
class CVData:
    """CV/Resume data structure."""
    file_path: str
    file_type: str
    text_content: str
    structured_data: Dict[str, Any]
    skills: List[str]
    experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    contact_info: Dict[str, str]


@dataclass
class BrowserAction:
    """Browser action to perform."""
    action_type: str  # click, fill, select, upload, wait, etc.
    target: str  # xpath, css selector, or text
    value: Optional[str] = None
    wait_time: float = 1.0
    retry_count: int = 3


@dataclass
class JobApplicationStep:
    """Single step in job application process."""
    step_number: int
    description: str
    actions: List[BrowserAction]
    validation: Optional[str] = None
    screenshot: bool = False
