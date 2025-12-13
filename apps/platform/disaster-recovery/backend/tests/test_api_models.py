"""Tests for API request/response models validation."""
import pytest
from pydantic import ValidationError
from api.models import (
    ContactRequest,
    ProcedureRequest,
    CreateDocumentRequest,
    UpdateDocumentRequest,
    NotionImportRequest,
    GitHubExportRequest,
)


class TestContactRequestValidation:
    """Test ContactRequest validation."""
    
    def test_valid_contact(self):
        """Test creating a valid contact."""
        contact = ContactRequest(
            name="John Doe",
            role="Database Admin",
            phone="+1-555-0100",
            email="john@example.com"
        )
        assert contact.name == "John Doe"
        assert contact.email == "john@example.com"
    
    def test_invalid_email(self):
        """Test that invalid email is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ContactRequest(
                name="John Doe",
                role="Admin",
                phone="+1-555-0100",
                email="invalid-email"
            )
        assert "email" in str(exc_info.value).lower()
    
    def test_whitespace_name(self):
        """Test that whitespace-only name is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ContactRequest(
                name="   ",
                role="Admin",
                phone="+1-555-0100",
                email="john@example.com"
            )
        assert "whitespace" in str(exc_info.value).lower()
    
    def test_invalid_phone(self):
        """Test that invalid phone format is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ContactRequest(
                name="John Doe",
                role="Admin",
                phone="abc-def-ghij",
                email="john@example.com"
            )
        assert "phone" in str(exc_info.value).lower()


class TestProcedureRequestValidation:
    """Test ProcedureRequest validation."""
    
    def test_valid_procedure(self):
        """Test creating a valid procedure."""
        procedure = ProcedureRequest(
            name="Failover",
            steps=["Step 1", "Step 2"],
            estimated_duration=30
        )
        assert procedure.name == "Failover"
        assert len(procedure.steps) == 2
    
    def test_empty_steps(self):
        """Test that empty steps list is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ProcedureRequest(
                name="Failover",
                steps=[],
                estimated_duration=30
            )
        assert "steps" in str(exc_info.value).lower()
    
    def test_whitespace_step(self):
        """Test that whitespace-only step is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ProcedureRequest(
                name="Failover",
                steps=["Step 1", "   ", "Step 3"],
                estimated_duration=30
            )
        assert "whitespace" in str(exc_info.value).lower()
    
    def test_negative_duration(self):
        """Test that negative duration is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ProcedureRequest(
                name="Failover",
                steps=["Step 1"],
                estimated_duration=-10
            )
        assert "duration" in str(exc_info.value).lower()


class TestCreateDocumentRequestValidation:
    """Test CreateDocumentRequest validation."""
    
    def test_valid_document_request(self):
        """Test creating a valid document request."""
        request = CreateDocumentRequest(
            title="Test Document",
            scenario="Test scenario",
            procedures=[
                ProcedureRequest(
                    name="Procedure 1",
                    steps=["Step 1"],
                    estimated_duration=10
                )
            ],
            contacts=[
                ContactRequest(
                    name="John Doe",
                    role="Admin",
                    phone="+1-555-0100",
                    email="john@example.com"
                )
            ],
            rto=60,
            rpo=30,
            categories=["Infrastructure"],
            criticality="critical"
        )
        assert request.title == "Test Document"
        assert request.rto == 60
    
    def test_whitespace_scenario(self):
        """Test that whitespace-only scenario is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CreateDocumentRequest(
                title="Test",
                scenario="   ",
                procedures=[
                    ProcedureRequest(
                        name="Proc",
                        steps=["Step"],
                        estimated_duration=10
                    )
                ],
                contacts=[],
                rto=60,
                rpo=30,
                category="Test",
                criticality="medium"
            )
        assert "whitespace" in str(exc_info.value).lower()
    
    def test_invalid_rto(self):
        """Test that zero RTO is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CreateDocumentRequest(
                title="Test",
                scenario="Scenario",
                procedures=[
                    ProcedureRequest(
                        name="Proc",
                        steps=["Step"],
                        estimated_duration=10
                    )
                ],
                contacts=[],
                rto=0,
                rpo=30,
                category="Test",
                criticality="medium"
            )
        assert "rto" in str(exc_info.value).lower()


class TestNotionImportRequestValidation:
    """Test NotionImportRequest validation."""
    
    def test_valid_notion_request(self):
        """Test creating a valid Notion import request."""
        request = NotionImportRequest(
            page_url="https://www.notion.so/test-page",
            api_token="secret_token",
            category="Test",
            criticality="medium"
        )
        assert "notion.so" in request.page_url
    
    def test_invalid_notion_url(self):
        """Test that non-Notion URL is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            NotionImportRequest(
                page_url="https://www.google.com",
                api_token="secret_token"
            )
        assert "notion" in str(exc_info.value).lower()


class TestGitHubExportRequestValidation:
    """Test GitHubExportRequest validation."""
    
    def test_valid_github_request(self):
        """Test creating a valid GitHub export request."""
        request = GitHubExportRequest(
            github_token="ghp_token",
            repo_name="owner/repo",
            branch="main"
        )
        assert request.repo_name == "owner/repo"
    
    def test_invalid_repo_format(self):
        """Test that invalid repo format is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            GitHubExportRequest(
                github_token="ghp_token",
                repo_name="invalid-repo-name",
                branch="main"
            )
        assert "owner/repo" in str(exc_info.value).lower()
    
    def test_file_path_normalization(self):
        """Test that file path is normalized."""
        request = GitHubExportRequest(
            github_token="ghp_token",
            repo_name="owner/repo",
            file_path="/docs/file.pdf",
            branch="main"
        )
        # Leading slash should be removed
        assert not request.file_path.startswith("/")


class TestUpdateDocumentRequestValidation:
    """Test UpdateDocumentRequest validation."""
    
    def test_partial_update(self):
        """Test creating a partial update request."""
        request = UpdateDocumentRequest(
            title="New Title",
            criticality="high"
        )
        assert request.title == "New Title"
        assert request.scenario is None
    
    def test_whitespace_in_optional_field(self):
        """Test that whitespace in optional field is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            UpdateDocumentRequest(
                title="   "
            )
        assert "whitespace" in str(exc_info.value).lower()
