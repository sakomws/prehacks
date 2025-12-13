"""API request and response models."""
from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator, EmailStr
from models.document import Contact, Procedure, CriticalityLevel
import re


# Request Models

class ContactRequest(BaseModel):
    """Request model for contact information."""
    name: str = Field(..., min_length=1, max_length=200, description="Contact name")
    role: str = Field(..., min_length=1, max_length=200, description="Contact role")
    phone: str = Field(..., min_length=1, max_length=50, description="Phone number")
    email: EmailStr = Field(..., description="Email address")
    
    @field_validator('name', 'role')
    @classmethod
    def validate_not_whitespace(cls, v: str) -> str:
        """Validate that string fields are not just whitespace."""
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or contain only whitespace")
        return v.strip()
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Validate phone number format."""
        if not v or not v.strip():
            raise ValueError("Phone number cannot be empty")
        # Basic phone validation - allows various formats
        phone_pattern = r'^[\d\s\-\+\(\)\.]+$'
        if not re.match(phone_pattern, v.strip()):
            raise ValueError("Invalid phone number format")
        return v.strip()


class ProcedureRequest(BaseModel):
    """Request model for recovery procedure."""
    name: str = Field(..., min_length=1, max_length=500, description="Procedure name")
    steps: List[str] = Field(..., min_length=1, max_length=100, description="List of procedure steps")
    estimated_duration: int = Field(..., gt=0, le=10080, description="Estimated duration in minutes (max 1 week)")
    
    @field_validator('name')
    @classmethod
    def validate_name_not_whitespace(cls, v: str) -> str:
        """Validate that name is not just whitespace."""
        if not v or not v.strip():
            raise ValueError("Procedure name cannot be empty or contain only whitespace")
        return v.strip()
    
    @field_validator('steps')
    @classmethod
    def validate_steps(cls, v: List[str]) -> List[str]:
        """Validate that steps are not empty or whitespace."""
        if not v:
            raise ValueError("Procedure must have at least one step")
        validated_steps = []
        for i, step in enumerate(v):
            if not step or not step.strip():
                raise ValueError(f"Step {i+1} cannot be empty or contain only whitespace")
            validated_steps.append(step.strip())
        return validated_steps


class CreateDocumentRequest(BaseModel):
    """Request model for creating a new DR document."""
    title: str = Field(..., min_length=1, max_length=500, description="Document title")
    scenario: str = Field(..., min_length=1, max_length=5000, description="Disaster scenario description")
    procedures: List[ProcedureRequest] = Field(..., min_length=1, max_length=50, description="Recovery procedures")
    contacts: List[ContactRequest] = Field(..., min_length=0, max_length=100, description="Contact information")
    rto: int = Field(..., gt=0, le=525600, description="Recovery Time Objective in minutes (max 1 year)")
    rpo: int = Field(..., gt=0, le=525600, description="Recovery Point Objective in minutes (max 1 year)")
    categories: List[str] = Field(..., min_length=1, max_length=10, description="Document categories")
    criticality: CriticalityLevel = Field(..., description="Criticality level")
    
    @field_validator('title', 'scenario')
    @classmethod
    def validate_not_whitespace(cls, v: str) -> str:
        """Validate that string fields are not just whitespace."""
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or contain only whitespace")
        return v.strip()
    
    @field_validator('categories')
    @classmethod
    def validate_categories(cls, v: List[str]) -> List[str]:
        """Validate categories list."""
        if not v:
            raise ValueError("At least one category is required")
        
        validated_categories = []
        for category in v:
            if not category or not category.strip():
                raise ValueError("Category cannot be empty or contain only whitespace")
            validated_categories.append(category.strip())
        
        # Remove duplicates while preserving order
        seen = set()
        unique_categories = []
        for cat in validated_categories:
            if cat.lower() not in seen:
                seen.add(cat.lower())
                unique_categories.append(cat)
        
        return unique_categories
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "Database Server Failure",
                "scenario": "Primary database server becomes unavailable due to hardware failure",
                "procedures": [
                    {
                        "name": "Failover to Secondary Database",
                        "steps": [
                            "Verify secondary database is operational",
                            "Update DNS records to point to secondary",
                            "Initiate failover procedure",
                            "Verify application connectivity"
                        ],
                        "estimated_duration": 30
                    }
                ],
                "contacts": [
                    {
                        "name": "John Doe",
                        "role": "Database Administrator",
                        "phone": "+1-555-0100",
                        "email": "john.doe@example.com"
                    }
                ],
                "rto": 60,
                "rpo": 15,
                "categories": ["Infrastructure"],
                "criticality": "critical"
            }
        }


class UpdateDocumentRequest(BaseModel):
    """Request model for updating a DR document."""
    title: Optional[str] = Field(None, min_length=1, max_length=500, description="Document title")
    scenario: Optional[str] = Field(None, min_length=1, max_length=5000, description="Disaster scenario description")
    procedures: Optional[List[ProcedureRequest]] = Field(None, min_length=1, max_length=50, description="Recovery procedures")
    contacts: Optional[List[ContactRequest]] = Field(None, min_length=0, max_length=100, description="Contact information")
    rto: Optional[int] = Field(None, gt=0, le=525600, description="Recovery Time Objective in minutes (max 1 year)")
    rpo: Optional[int] = Field(None, gt=0, le=525600, description="Recovery Point Objective in minutes (max 1 year)")
    categories: Optional[List[str]] = Field(None, min_length=1, max_length=10, description="Document categories")
    criticality: Optional[CriticalityLevel] = Field(None, description="Criticality level")
    
    @field_validator('title', 'scenario')
    @classmethod
    def validate_not_whitespace(cls, v: Optional[str]) -> Optional[str]:
        """Validate that string fields are not just whitespace."""
        if v is not None:
            if not v.strip():
                raise ValueError("Field cannot be empty or contain only whitespace")
            return v.strip()
        return v
    
    @field_validator('categories')
    @classmethod
    def validate_categories_update(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        """Validate categories list for updates."""
        if v is not None:
            if not v:
                raise ValueError("At least one category is required")
            
            validated_categories = []
            for category in v:
                if not category or not category.strip():
                    raise ValueError("Category cannot be empty or contain only whitespace")
                validated_categories.append(category.strip())
            
            # Remove duplicates while preserving order
            seen = set()
            unique_categories = []
            for cat in validated_categories:
                if cat.lower() not in seen:
                    seen.add(cat.lower())
                    unique_categories.append(cat)
            
            return unique_categories
        return v
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "Updated Database Server Failure Procedure",
                "scenario": "Primary database server becomes unavailable - updated scenario",
                "criticality": "high"
            }
        }


class NotionImportRequest(BaseModel):
    """Request model for importing from Notion."""
    page_url: Optional[str] = Field(None, min_length=1, max_length=1000, description="Notion page URL")
    page_id: Optional[str] = Field(None, min_length=1, max_length=100, description="Notion page ID")
    api_token: str = Field(..., min_length=1, max_length=500, description="Notion API token")
    categories: List[str] = Field(default=["General"], min_length=1, max_length=10, description="Document categories")
    criticality: CriticalityLevel = Field(default="medium", description="Criticality level")
    
    @field_validator('page_url')
    @classmethod
    def validate_page_url(cls, v: Optional[str]) -> Optional[str]:
        """Validate Notion page URL format."""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            # Basic URL validation for Notion
            if not v.startswith(('http://', 'https://')):
                raise ValueError("Page URL must start with http:// or https://")
            if 'notion.so' not in v and 'notion.site' not in v:
                raise ValueError("Invalid Notion URL")
        return v
    
    @field_validator('api_token')
    @classmethod
    def validate_not_whitespace(cls, v: str) -> str:
        """Validate that string fields are not just whitespace."""
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or contain only whitespace")
        return v.strip()
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "page_url": "https://www.notion.so/myworkspace/Database-Failure-Procedure-abc123",
                "api_token": "secret_abc123xyz",
                "categories": ["Infrastructure"],
                "criticality": "critical"
            }
        }


class GoogleDocsImportRequest(BaseModel):
    """Request model for importing from Google Docs."""
    document_url: Optional[str] = Field(None, min_length=1, max_length=1000, description="Google Docs URL")
    document_id: Optional[str] = Field(None, min_length=1, max_length=100, description="Google Docs document ID")
    access_token: Optional[str] = Field(None, min_length=1, max_length=500, description="Optional Google OAuth2 access token for private documents")
    categories: List[str] = Field(default=["General"], min_length=1, max_length=10, description="Document categories")
    criticality: CriticalityLevel = Field(default="medium", description="Criticality level")
    
    @field_validator('document_url')
    @classmethod
    def validate_document_url(cls, v: Optional[str]) -> Optional[str]:
        """Validate Google Docs URL format."""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            # Basic URL validation for Google Docs
            if not v.startswith(('http://', 'https://')):
                raise ValueError("Document URL must start with http:// or https://")
            if 'docs.google.com' not in v:
                raise ValueError("Invalid Google Docs URL")
        return v
    
    @field_validator('access_token')
    @classmethod
    def validate_access_token(cls, v: Optional[str]) -> Optional[str]:
        """Validate access token if provided."""
        if v is not None:
            v = v.strip()
            if not v:
                return None
        return v
    
    @field_validator('categories')
    @classmethod
    def validate_categories_not_empty(cls, v: List[str]) -> List[str]:
        """Validate that categories list is not empty and contains valid values."""
        if not v:
            raise ValueError("Categories list cannot be empty")
        # Validate each category is not just whitespace
        validated_categories = []
        for category in v:
            if not category or not category.strip():
                raise ValueError("Category cannot be empty or contain only whitespace")
            validated_categories.append(category.strip())
        return validated_categories
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "document_url": "https://docs.google.com/document/d/abc123xyz/edit",
                "access_token": None,
                "categories": ["Infrastructure"],
                "criticality": "critical"
            }
        }


ExportFormat = Literal["pdf", "markdown"]


class GitHubExportRequest(BaseModel):
    """Request model for exporting to GitHub."""
    github_token: str = Field(..., min_length=1, max_length=500, description="GitHub personal access token")
    repo_name: str = Field(..., min_length=1, max_length=200, description="Repository name in format 'owner/repo'")
    file_path: Optional[str] = Field(None, min_length=1, max_length=500, description="Custom file path in repository")
    branch: str = Field(default="main", min_length=1, max_length=200, description="Branch name")
    format: ExportFormat = Field(default="pdf", description="Export format - pdf or markdown")
    
    @field_validator('github_token', 'branch')
    @classmethod
    def validate_not_whitespace(cls, v: str) -> str:
        """Validate that string fields are not just whitespace."""
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or contain only whitespace")
        return v.strip()
    
    @field_validator('repo_name')
    @classmethod
    def validate_repo_name(cls, v: str) -> str:
        """Validate GitHub repository name format."""
        if not v or not v.strip():
            raise ValueError("Repository name cannot be empty")
        v = v.strip()
        # Validate format: owner/repo
        if '/' not in v:
            raise ValueError("Repository name must be in format 'owner/repo'")
        parts = v.split('/')
        if len(parts) != 2:
            raise ValueError("Repository name must be in format 'owner/repo'")
        owner, repo = parts
        if not owner or not repo:
            raise ValueError("Both owner and repository name must be non-empty")
        return v
    
    @field_validator('file_path')
    @classmethod
    def validate_file_path(cls, v: Optional[str]) -> Optional[str]:
        """Validate file path."""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            # Ensure it doesn't start with /
            if v.startswith('/'):
                v = v[1:]
        return v
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "github_token": "ghp_abc123xyz",
                "repo_name": "myorg/disaster-recovery-docs",
                "file_path": "docs/database-failure.pdf",
                "branch": "main"
            }
        }


# Response Models

class ContactResponse(BaseModel):
    """Response model for contact information."""
    name: str = Field(..., description="Contact name")
    role: str = Field(..., description="Contact role")
    phone: str = Field(..., description="Phone number")
    email: str = Field(..., description="Email address")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "role": "Database Administrator",
                "phone": "+1-555-0100",
                "email": "john.doe@example.com"
            }
        }


class ProcedureResponse(BaseModel):
    """Response model for recovery procedure."""
    name: str = Field(..., description="Procedure name")
    steps: List[str] = Field(..., description="List of procedure steps")
    estimated_duration: int = Field(..., description="Estimated duration in minutes")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "name": "Failover to Secondary Database",
                "steps": [
                    "Verify secondary database is operational",
                    "Update DNS records",
                    "Initiate failover"
                ],
                "estimated_duration": 30
            }
        }


class DocumentResponse(BaseModel):
    """Response model for DR document."""
    id: str = Field(..., description="Unique document identifier")
    title: str = Field(..., description="Document title")
    scenario: str = Field(..., description="Disaster scenario description")
    procedures: List[ProcedureResponse] = Field(..., description="Recovery procedures")
    contacts: List[ContactResponse] = Field(..., description="Contact information")
    rto: int = Field(..., description="Recovery Time Objective in minutes")
    rpo: int = Field(..., description="Recovery Point Objective in minutes")
    categories: List[str] = Field(..., description="Document categories")
    criticality: CriticalityLevel = Field(..., description="Criticality level")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    version: int = Field(..., description="Document version number")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Database Server Failure",
                "scenario": "Primary database server becomes unavailable",
                "procedures": [
                    {
                        "name": "Failover to Secondary",
                        "steps": ["Check secondary status", "Initiate failover"],
                        "estimated_duration": 15
                    }
                ],
                "contacts": [
                    {
                        "name": "John Doe",
                        "role": "Database Administrator",
                        "phone": "+1-555-0100",
                        "email": "john.doe@example.com"
                    }
                ],
                "rto": 60,
                "rpo": 15,
                "categories": ["Infrastructure"],
                "criticality": "critical",
                "created_at": "2024-01-01T12:00:00",
                "updated_at": "2024-01-01T12:00:00",
                "version": 1
            }
        }


class DocumentListResponse(BaseModel):
    """Response model for list of documents."""
    documents: List[DocumentResponse] = Field(..., description="List of documents")
    total: int = Field(..., ge=0, description="Total number of documents")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "documents": [],
                "total": 0
            }
        }


class ValidationIssueResponse(BaseModel):
    """Response model for validation issue."""
    field: str = Field(..., description="Field name with issue")
    message: str = Field(..., description="Validation error message")
    severity: str = Field(..., description="Issue severity (error, warning)")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "field": "contacts",
                "message": "Contact email format is invalid",
                "severity": "error"
            }
        }


class ValidationResponse(BaseModel):
    """Response model for document validation."""
    is_valid: bool = Field(..., description="Whether document is valid")
    issues: List[ValidationIssueResponse] = Field(..., description="List of validation issues")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "is_valid": False,
                "issues": [
                    {
                        "field": "scenario",
                        "message": "Scenario description is empty",
                        "severity": "error"
                    }
                ]
            }
        }


class VersionResponse(BaseModel):
    """Response model for document version."""
    document_id: str = Field(..., description="Document identifier")
    version: int = Field(..., ge=1, description="Version number")
    timestamp: datetime = Field(..., description="Version creation timestamp")
    previous_version: Optional[int] = Field(None, description="Previous version number")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "document_id": "550e8400-e29b-41d4-a716-446655440000",
                "version": 2,
                "timestamp": "2024-01-02T12:00:00",
                "previous_version": 1
            }
        }


class VersionListResponse(BaseModel):
    """Response model for list of versions."""
    versions: List[VersionResponse] = Field(..., description="List of document versions")
    total: int = Field(..., ge=0, description="Total number of versions")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "versions": [],
                "total": 0
            }
        }


class GitHubExportResponse(BaseModel):
    """Response model for GitHub export."""
    commit_url: str = Field(..., description="URL to the commit on GitHub")
    file_url: str = Field(..., description="URL to the file on GitHub")
    sha: str = Field(..., description="Commit SHA")
    file_path: str = Field(..., description="File path in repository")
    branch: str = Field(..., description="Branch name")
    format: str = Field(..., description="Export format used")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "commit_url": "https://github.com/owner/repo/commit/abc123",
                "file_url": "https://github.com/owner/repo/blob/main/docs/file.pdf",
                "sha": "abc123def456",
                "file_path": "docs/file.pdf",
                "branch": "main"
            }
        }


class ExportResponse(BaseModel):
    """Response model for document export."""
    content: str = Field(..., description="Exported document content")
    format: str = Field(..., description="Export format (markdown, json)")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "content": "# Database Server Failure\n\n...",
                "format": "markdown"
            }
        }


class ErrorResponse(BaseModel):
    """Response model for errors."""
    detail: str = Field(..., description="Error message")
    status_code: Optional[int] = Field(None, description="HTTP status code")
    error_type: Optional[str] = Field(None, description="Error type")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "detail": "Document not found",
                "status_code": 404,
                "error_type": "NotFoundError"
            }
        }


class AIReviewRequest(BaseModel):
    """Request model for AI document review."""
    openai_api_key: str = Field(..., min_length=1, max_length=500, description="OpenAI API key")
    focus_areas: Optional[List[str]] = Field(None, max_length=10, description="Optional focus areas for review")
    
    @field_validator('openai_api_key')
    @classmethod
    def validate_api_key(cls, v: str) -> str:
        """Validate API key format."""
        if not v or not v.strip():
            raise ValueError("OpenAI API key cannot be empty")
        return v.strip()
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "openai_api_key": "sk-...",
                "focus_areas": ["procedures", "contacts"]
            }
        }


class AIReviewResponse(BaseModel):
    """Response model for AI document review."""
    overall_score: int = Field(..., ge=1, le=10, description="Overall quality score")
    summary: str = Field(..., description="Brief summary of document quality")
    suggestions: List[dict] = Field(..., description="List of improvement suggestions")
    compliance_check: dict = Field(..., description="Compliance assessment")
    improved_document: Optional[DocumentResponse] = Field(None, description="AI-improved version of the document")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "overall_score": 8,
                "summary": "Well-structured document with room for improvement",
                "suggestions": [
                    {
                        "section": "procedures",
                        "priority": "high",
                        "suggestion": "Add more specific time estimates",
                        "rationale": "Improves execution efficiency"
                    }
                ],
                "compliance_check": {
                    "iso_22301": "compliant",
                    "nist_framework": "partial"
                }
            }
        }


class DocumentSyncRequest(BaseModel):
    """Request model for syncing documents to external platforms."""
    platforms: List[str] = Field(..., min_length=1, max_length=3, description="Platforms to sync to")
    github_config: Optional[dict] = Field(None, description="GitHub sync configuration")
    notion_config: Optional[dict] = Field(None, description="Notion sync configuration")
    google_docs_config: Optional[dict] = Field(None, description="Google Docs sync configuration")
    
    @field_validator('platforms')
    @classmethod
    def validate_platforms(cls, v: List[str]) -> List[str]:
        """Validate platform names."""
        valid_platforms = {"github", "notion", "google_docs"}
        for platform in v:
            if platform not in valid_platforms:
                raise ValueError(f"Invalid platform: {platform}. Must be one of: {valid_platforms}")
        return v
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "platforms": ["github", "notion"],
                "github_config": {
                    "token": "ghp_...",
                    "repo_name": "owner/repo",
                    "branch": "main",
                    "format": "markdown"
                },
                "notion_config": {
                    "token": "secret_...",
                    "page_id": "abc123"
                }
            }
        }


class DocumentSyncResponse(BaseModel):
    """Response model for document sync operations."""
    document_id: str = Field(..., description="Document ID that was synced")
    sync_summary: dict = Field(..., description="Summary of sync operations")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "document_id": "550e8400-e29b-41d4-a716-446655440000",
                "sync_summary": {
                    "successful_syncs": 2,
                    "failed_syncs": 0,
                    "platforms_synced": ["github", "notion"]
                }
            }
        }


class SuccessResponse(BaseModel):
    """Response model for successful operations."""
    message: str = Field(..., description="Success message")
    data: Optional[dict] = Field(None, description="Additional response data")
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "message": "Operation completed successfully",
                "data": None
            }
        }
