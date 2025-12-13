"""Tests for API error handling and HTTP status codes."""
import pytest
from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


class TestValidationErrors:
    """Tests for Pydantic validation error handling."""
    
    def test_validation_error_missing_required_field(self):
        """Test validation error when required field is missing."""
        request_data = {
            "scenario": "Test scenario",
            "procedures": [
                {
                    "name": "Test procedure",
                    "steps": ["Step 1"],
                    "estimated_duration": 10
                }
            ],
            "contacts": [],
            "rto": 60,
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
            # Missing 'title' field
        }
        
        response = client.post("/api/documents", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "validation" in data["detail"].lower() or "required" in data["detail"].lower()
        assert "error_type" in data
        assert data["error_type"] == "ValidationError"
    
    def test_validation_error_invalid_type(self):
        """Test validation error when field has wrong type."""
        request_data = {
            "title": "Test Document",
            "scenario": "Test scenario",
            "procedures": [
                {
                    "name": "Test procedure",
                    "steps": ["Step 1"],
                    "estimated_duration": 10
                }
            ],
            "contacts": [],
            "rto": "not_a_number",  # Should be integer
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
        }
        
        response = client.post("/api/documents", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "error_type" in data
        assert data["error_type"] == "ValidationError"
    
    def test_validation_error_negative_rto(self):
        """Test validation error for negative RTO value."""
        request_data = {
            "title": "Test Document",
            "scenario": "Test scenario",
            "procedures": [
                {
                    "name": "Test procedure",
                    "steps": ["Step 1"],
                    "estimated_duration": 10
                }
            ],
            "contacts": [],
            "rto": -10,  # Invalid: must be positive
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
        }
        
        response = client.post("/api/documents", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "error_type" in data
    
    def test_validation_error_invalid_criticality(self):
        """Test validation error for invalid criticality level."""
        request_data = {
            "title": "Test Document",
            "scenario": "Test scenario",
            "procedures": [
                {
                    "name": "Test procedure",
                    "steps": ["Step 1"],
                    "estimated_duration": 10
                }
            ],
            "contacts": [],
            "rto": 60,
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "invalid_level"  # Invalid criticality
        }
        
        response = client.post("/api/documents", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "error_type" in data
    
    def test_validation_error_empty_procedures(self):
        """Test validation error for empty procedures list."""
        request_data = {
            "title": "Test Document",
            "scenario": "Test scenario",
            "procedures": [],  # Invalid: must have at least one procedure
            "contacts": [],
            "rto": 60,
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
        }
        
        response = client.post("/api/documents", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    def test_validation_error_invalid_email(self):
        """Test validation error for invalid email format."""
        request_data = {
            "title": "Test Document",
            "scenario": "Test scenario",
            "procedures": [
                {
                    "name": "Test procedure",
                    "steps": ["Step 1"],
                    "estimated_duration": 10
                }
            ],
            "contacts": [
                {
                    "name": "John Doe",
                    "role": "Admin",
                    "phone": "+1-555-0100",
                    "email": "invalid-email"  # Invalid email format
                }
            ],
            "rto": 60,
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
        }
        
        response = client.post("/api/documents", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "error_type" in data
    
    def test_validation_error_whitespace_only_title(self):
        """Test validation error for whitespace-only title."""
        request_data = {
            "title": "   ",  # Whitespace only
            "scenario": "Test scenario",
            "procedures": [
                {
                    "name": "Test procedure",
                    "steps": ["Step 1"],
                    "estimated_duration": 10
                }
            ],
            "contacts": [],
            "rto": 60,
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
        }
        
        response = client.post("/api/documents", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data


class TestNotFoundErrors:
    """Tests for 404 Not Found errors."""
    
    def test_get_nonexistent_document(self):
        """Test 404 error when getting non-existent document."""
        response = client.get("/api/documents/nonexistent-id-12345")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
    
    def test_update_nonexistent_document(self):
        """Test 404 error when updating non-existent document."""
        update_data = {"title": "Updated Title"}
        response = client.put("/api/documents/nonexistent-id-12345", json=update_data)
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
    
    def test_delete_nonexistent_document(self):
        """Test 404 error when deleting non-existent document."""
        response = client.delete("/api/documents/nonexistent-id-12345")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
    
    def test_validate_nonexistent_document(self):
        """Test 404 error when validating non-existent document."""
        response = client.post("/api/documents/nonexistent-id-12345/validate")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
    
    def test_export_nonexistent_document(self):
        """Test 404 error when exporting non-existent document."""
        response = client.get("/api/documents/nonexistent-id-12345/export/markdown")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
    
    def test_list_versions_nonexistent_document(self):
        """Test 404 error when listing versions of non-existent document."""
        response = client.get("/api/documents/nonexistent-id-12345/versions")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
    
    def test_revert_nonexistent_document(self):
        """Test 404 error when reverting non-existent document."""
        response = client.post("/api/documents/nonexistent-id-12345/revert/1")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data


class TestBadRequestErrors:
    """Tests for 400 Bad Request errors."""
    
    def test_notion_import_missing_page_info(self):
        """Test 400 error when Notion import missing page URL/ID."""
        request_data = {
            "api_token": "test_token",
            "categories": ["Test"],
            "criticality": "medium"
            # Missing both page_url and page_id
        }
        
        response = client.post("/api/documents/import/notion", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "page_url or page_id" in data["detail"].lower()
    
    def test_invalid_github_repo_format(self):
        """Test validation error for invalid GitHub repo format."""
        request_data = {
            "github_token": "test_token",
            "repo_name": "invalid-format",  # Should be "owner/repo"
            "branch": "main"
        }
        
        # First create a document
        doc_request = {
            "title": "Test Document",
            "scenario": "Test scenario",
            "procedures": [
                {
                    "name": "Test procedure",
                    "steps": ["Step 1"],
                    "estimated_duration": 10
                }
            ],
            "contacts": [],
            "rto": 60,
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
        }
        doc_response = client.post("/api/documents", json=doc_request)
        doc_id = doc_response.json()["id"]
        
        # Try to export with invalid repo format
        response = client.post(f"/api/documents/{doc_id}/export/github", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data


class TestErrorResponseFormat:
    """Tests for consistent error response format."""
    
    def test_error_response_has_detail(self):
        """Test that error responses include 'detail' field."""
        response = client.get("/api/documents/nonexistent-id")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert isinstance(data["detail"], str)
    
    def test_validation_error_has_error_type(self):
        """Test that validation errors include 'error_type' field."""
        request_data = {
            "scenario": "Test",
            "procedures": [{"name": "Test", "steps": ["Step 1"], "estimated_duration": 10}],
            "contacts": [],
            "rto": 60,
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
            # Missing title
        }
        
        response = client.post("/api/documents", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "error_type" in data
        assert data["error_type"] == "ValidationError"
    
    def test_validation_error_has_errors_list(self):
        """Test that validation errors include detailed 'errors' list."""
        request_data = {
            "scenario": "Test",
            "procedures": [{"name": "Test", "steps": ["Step 1"], "estimated_duration": 10}],
            "contacts": [],
            "rto": 60,
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
            # Missing title
        }
        
        response = client.post("/api/documents", json=request_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "errors" in data
        assert isinstance(data["errors"], list)
        assert len(data["errors"]) > 0
        
        # Check error structure
        error = data["errors"][0]
        assert "field" in error
        assert "message" in error
        assert "type" in error


class TestSuccessStatusCodes:
    """Tests for correct success status codes."""
    
    def test_create_returns_201(self):
        """Test that document creation returns 201 Created."""
        request_data = {
            "title": "Test Document",
            "scenario": "Test scenario",
            "procedures": [
                {
                    "name": "Test procedure",
                    "steps": ["Step 1"],
                    "estimated_duration": 10
                }
            ],
            "contacts": [],
            "rto": 60,
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
        }
        
        response = client.post("/api/documents", json=request_data)
        
        assert response.status_code == 201
    
    def test_get_returns_200(self):
        """Test that document retrieval returns 200 OK."""
        # Create a document first
        request_data = {
            "title": "Test Document",
            "scenario": "Test scenario",
            "procedures": [
                {
                    "name": "Test procedure",
                    "steps": ["Step 1"],
                    "estimated_duration": 10
                }
            ],
            "contacts": [],
            "rto": 60,
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
        }
        create_response = client.post("/api/documents", json=request_data)
        doc_id = create_response.json()["id"]
        
        # Get the document
        response = client.get(f"/api/documents/{doc_id}")
        
        assert response.status_code == 200
    
    def test_update_returns_200(self):
        """Test that document update returns 200 OK."""
        # Create a document first
        request_data = {
            "title": "Test Document",
            "scenario": "Test scenario",
            "procedures": [
                {
                    "name": "Test procedure",
                    "steps": ["Step 1"],
                    "estimated_duration": 10
                }
            ],
            "contacts": [],
            "rto": 60,
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
        }
        create_response = client.post("/api/documents", json=request_data)
        doc_id = create_response.json()["id"]
        
        # Update the document
        update_data = {"title": "Updated Title"}
        response = client.put(f"/api/documents/{doc_id}", json=update_data)
        
        assert response.status_code == 200
    
    def test_delete_returns_200(self):
        """Test that document deletion returns 200 OK."""
        # Create a document first
        request_data = {
            "title": "Test Document",
            "scenario": "Test scenario",
            "procedures": [
                {
                    "name": "Test procedure",
                    "steps": ["Step 1"],
                    "estimated_duration": 10
                }
            ],
            "contacts": [],
            "rto": 60,
            "rpo": 15,
            "categories": ["Test"],
            "criticality": "medium"
        }
        create_response = client.post("/api/documents", json=request_data)
        doc_id = create_response.json()["id"]
        
        # Delete the document
        response = client.delete(f"/api/documents/{doc_id}")
        
        assert response.status_code == 200
    
    def test_list_returns_200(self):
        """Test that document listing returns 200 OK."""
        response = client.get("/api/documents")
        
        assert response.status_code == 200
