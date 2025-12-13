"""Integration tests for FastAPI endpoints."""
import pytest
from fastapi.testclient import TestClient
from main import app
from models.document import DRDocument, Contact, Procedure


client = TestClient(app)


@pytest.fixture
def sample_document_request():
    """Sample document creation request."""
    return {
        "title": "Database Server Failure",
        "scenario": "Primary database server becomes unavailable",
        "procedures": [
            {
                "name": "Failover to Secondary",
                "steps": ["Check secondary status", "Initiate failover", "Verify connection"],
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
        "criticality": "critical"
    }


@pytest.fixture
def created_document(sample_document_request):
    """Create a document and return its ID."""
    response = client.post("/api/documents", json=sample_document_request)
    assert response.status_code == 201
    return response.json()


class TestDocumentCreation:
    """Tests for document creation endpoint."""
    
    def test_create_document_success(self, sample_document_request):
        """Test successful document creation."""
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == sample_document_request["title"]
        assert data["scenario"] == sample_document_request["scenario"]
        assert data["rto"] == sample_document_request["rto"]
        assert data["rpo"] == sample_document_request["rpo"]
        assert data["categories"] == sample_document_request["categories"]
        assert data["criticality"] == sample_document_request["criticality"]
        assert "id" in data
        assert data["version"] == 1
    
    def test_create_document_invalid_rto(self, sample_document_request):
        """Test document creation with invalid RTO."""
        sample_document_request["rto"] = -10
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400  # Validation error
    
    def test_create_document_invalid_criticality(self, sample_document_request):
        """Test document creation with invalid criticality."""
        sample_document_request["criticality"] = "invalid"
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400  # Validation error
    
    def test_create_document_missing_required_field(self, sample_document_request):
        """Test document creation with missing required field."""
        del sample_document_request["title"]
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400  # Validation error


class TestDocumentRetrieval:
    """Tests for document retrieval endpoint."""
    
    def test_get_document_success(self, created_document):
        """Test successful document retrieval."""
        doc_id = created_document["id"]
        response = client.get(f"/api/documents/{doc_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == doc_id
        assert data["title"] == created_document["title"]
    
    def test_get_document_not_found(self):
        """Test retrieving non-existent document."""
        response = client.get("/api/documents/nonexistent-id")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_get_document_with_version(self, created_document):
        """Test retrieving specific version of document."""
        doc_id = created_document["id"]
        response = client.get(f"/api/documents/{doc_id}?version=1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["version"] == 1


class TestDocumentUpdate:
    """Tests for document update endpoint."""
    
    def test_update_document_success(self, created_document):
        """Test successful document update."""
        doc_id = created_document["id"]
        update_data = {
            "title": "Updated Database Server Failure",
            "rto": 120
        }
        
        response = client.put(f"/api/documents/{doc_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["rto"] == update_data["rto"]
        assert data["version"] == 2  # Version should increment
    
    def test_update_document_not_found(self):
        """Test updating non-existent document."""
        update_data = {"title": "Updated Title"}
        response = client.put("/api/documents/nonexistent-id", json=update_data)
        
        assert response.status_code == 404
    
    def test_update_document_invalid_data(self, created_document):
        """Test updating document with invalid data."""
        doc_id = created_document["id"]
        update_data = {"rto": -50}
        
        response = client.put(f"/api/documents/{doc_id}", json=update_data)
        
        assert response.status_code == 400  # Validation error


class TestDocumentDeletion:
    """Tests for document deletion endpoint."""
    
    def test_delete_document_success(self, created_document):
        """Test successful document deletion."""
        doc_id = created_document["id"]
        response = client.delete(f"/api/documents/{doc_id}")
        
        assert response.status_code == 200
        assert "success" in response.json()["message"].lower()
        
        # Verify document is deleted
        get_response = client.get(f"/api/documents/{doc_id}")
        assert get_response.status_code == 404
    
    def test_delete_document_not_found(self):
        """Test deleting non-existent document."""
        response = client.delete("/api/documents/nonexistent-id")
        
        assert response.status_code == 404


class TestDocumentDuplication:
    """Tests for document duplication endpoint."""
    
    def test_duplicate_document_success(self, created_document):
        """Test successful document duplication."""
        doc_id = created_document["id"]
        response = client.post(f"/api/documents/{doc_id}/duplicate")
        
        assert response.status_code == 201
        data = response.json()
        
        # Verify duplicate has different ID
        assert data["id"] != created_document["id"]
        
        # Verify title is prefixed
        assert data["title"] == f"Copy of {created_document['title']}"
        
        # Verify other content is identical
        assert data["scenario"] == created_document["scenario"]
        assert data["rto"] == created_document["rto"]
        assert data["rpo"] == created_document["rpo"]
        assert data["categories"] == created_document["categories"]
        assert data["criticality"] == created_document["criticality"]
        
        # Verify new metadata
        assert data["version"] == 1
        assert data["created_at"] != created_document["created_at"]
        assert data["updated_at"] != created_document["updated_at"]
    
    def test_duplicate_document_not_found(self):
        """Test duplicating non-existent document."""
        response = client.post("/api/documents/nonexistent-id/duplicate")
        
        assert response.status_code == 404
    
    def test_duplicate_preserves_procedures_and_contacts(self, created_document):
        """Test that duplication preserves procedures and contacts."""
        doc_id = created_document["id"]
        response = client.post(f"/api/documents/{doc_id}/duplicate")
        
        assert response.status_code == 201
        data = response.json()
        
        # Verify procedures are preserved
        assert len(data["procedures"]) == len(created_document["procedures"])
        for orig_proc, dup_proc in zip(created_document["procedures"], data["procedures"]):
            assert dup_proc["name"] == orig_proc["name"]
            assert dup_proc["steps"] == orig_proc["steps"]
            assert dup_proc["estimated_duration"] == orig_proc["estimated_duration"]
        
        # Verify contacts are preserved
        assert len(data["contacts"]) == len(created_document["contacts"])
        for orig_contact, dup_contact in zip(created_document["contacts"], data["contacts"]):
            assert dup_contact["name"] == orig_contact["name"]
            assert dup_contact["role"] == orig_contact["role"]
            assert dup_contact["phone"] == orig_contact["phone"]
            assert dup_contact["email"] == orig_contact["email"]


class TestDocumentListing:
    """Tests for document listing and search endpoints."""
    
    def test_list_all_documents(self, created_document):
        """Test listing all documents."""
        response = client.get("/api/documents")
        
        assert response.status_code == 200
        data = response.json()
        assert "documents" in data
        assert "total" in data
        assert data["total"] >= 1
    
    def test_list_documents_by_category(self, created_document):
        """Test filtering documents by category."""
        category = created_document["categories"][0]  # Get first category from list
        response = client.get(f"/api/documents?category={category}")
        
        assert response.status_code == 200
        data = response.json()
        assert all(category in doc["categories"] for doc in data["documents"])
    
    def test_list_documents_by_criticality(self, created_document):
        """Test filtering documents by criticality."""
        criticality = created_document["criticality"]
        response = client.get(f"/api/documents?criticality={criticality}")
        
        assert response.status_code == 200
        data = response.json()
        assert all(doc["criticality"] == criticality for doc in data["documents"])
    
    def test_search_documents(self, created_document):
        """Test searching documents by keyword."""
        response = client.get("/api/documents?query=database")
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
    
    def test_search_documents_no_results(self):
        """Test searching with no matching results."""
        response = client.get("/api/documents?query=nonexistentkeyword12345")
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0


class TestVersionManagement:
    """Tests for version management endpoints."""
    
    def test_list_versions(self, created_document):
        """Test listing document versions."""
        doc_id = created_document["id"]
        response = client.get(f"/api/documents/{doc_id}/versions")
        
        assert response.status_code == 200
        data = response.json()
        assert "versions" in data
        assert "total" in data
        assert data["total"] >= 1
    
    def test_list_versions_not_found(self):
        """Test listing versions for non-existent document."""
        response = client.get("/api/documents/nonexistent-id/versions")
        
        assert response.status_code == 404
    
    def test_revert_to_version(self, created_document):
        """Test reverting document to previous version."""
        doc_id = created_document["id"]
        
        # Update document to create version 2
        update_data = {"title": "Updated Title"}
        client.put(f"/api/documents/{doc_id}", json=update_data)
        
        # Revert to version 1
        response = client.post(f"/api/documents/{doc_id}/revert/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == created_document["title"]  # Original title
        assert data["version"] == 3  # New version created
    
    def test_revert_to_invalid_version(self, created_document):
        """Test reverting to non-existent version."""
        doc_id = created_document["id"]
        response = client.post(f"/api/documents/{doc_id}/revert/999")
        
        assert response.status_code == 404


class TestDocumentValidation:
    """Tests for document validation endpoint."""
    
    def test_validate_valid_document(self, created_document):
        """Test validating a valid document."""
        doc_id = created_document["id"]
        response = client.post(f"/api/documents/{doc_id}/validate")
        
        assert response.status_code == 200
        data = response.json()
        assert "is_valid" in data
        assert "issues" in data
    
    def test_validate_document_not_found(self):
        """Test validating non-existent document."""
        response = client.post("/api/documents/nonexistent-id/validate")
        
        assert response.status_code == 404


class TestDocumentExport:
    """Tests for document export endpoints."""
    
    def test_export_markdown(self, created_document):
        """Test exporting document as Markdown."""
        doc_id = created_document["id"]
        response = client.get(f"/api/documents/{doc_id}/export/markdown")
        
        assert response.status_code == 200
        data = response.json()
        assert data["format"] == "markdown"
        assert "content" in data
        assert len(data["content"]) > 0
    
    def test_export_json(self, created_document):
        """Test exporting document as JSON."""
        doc_id = created_document["id"]
        response = client.get(f"/api/documents/{doc_id}/export/json")
        
        assert response.status_code == 200
        data = response.json()
        assert data["format"] == "json"
        assert "content" in data
        assert len(data["content"]) > 0
    
    def test_export_not_found(self):
        """Test exporting non-existent document."""
        response = client.get("/api/documents/nonexistent-id/export/markdown")
        
        assert response.status_code == 404


class TestNotionIntegration:
    """Tests for Notion integration endpoint."""
    
    def test_import_notion_missing_params(self):
        """Test Notion import with missing parameters."""
        request_data = {
            "api_token": "test_token",
            "categories": ["Test"],
            "criticality": "medium"
        }
        response = client.post("/api/documents/import/notion", json=request_data)
        
        assert response.status_code == 400
        assert "page_url or page_id" in response.json()["detail"].lower()
    
    def test_import_notion_invalid_token(self):
        """Test Notion import with invalid token."""
        request_data = {
            "page_url": "https://notion.so/test-page",
            "api_token": "invalid_token",
            "categories": ["Test"],
            "criticality": "medium"
        }
        response = client.post("/api/documents/import/notion", json=request_data)
        
        # Should fail with API error (400) or internal error (500)
        assert response.status_code in [400, 500]


class TestGitHubIntegration:
    """Tests for GitHub integration endpoint."""
    
    def test_export_github_document_not_found(self):
        """Test GitHub export for non-existent document."""
        request_data = {
            "github_token": "test_token",
            "repo_name": "owner/repo",
            "branch": "main"
        }
        response = client.post("/api/documents/nonexistent-id/export/github", json=request_data)
        
        assert response.status_code == 404
    
    def test_export_github_invalid_repo(self, created_document):
        """Test GitHub export with invalid repository."""
        doc_id = created_document["id"]
        request_data = {
            "github_token": "invalid_token",
            "repo_name": "invalid/repo",
            "branch": "main"
        }
        response = client.post(f"/api/documents/{doc_id}/export/github", json=request_data)
        
        # Should fail with validation error (400) or internal error (500)
        assert response.status_code in [400, 500]


class TestHealthEndpoints:
    """Tests for health check endpoints."""
    
    def test_root_endpoint(self):
        """Test root endpoint."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
    
    def test_health_endpoint(self):
        """Test health check endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestAPIValidationErrors:
    """Tests for API validation and error handling."""
    
    def test_create_document_empty_title(self, sample_document_request):
        """Test creating document with empty title."""
        sample_document_request["title"] = ""
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    def test_create_document_whitespace_scenario(self, sample_document_request):
        """Test creating document with whitespace-only scenario."""
        sample_document_request["scenario"] = "   "
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    def test_create_document_empty_procedures(self, sample_document_request):
        """Test creating document with empty procedures list."""
        sample_document_request["procedures"] = []
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400
    
    def test_create_document_invalid_email(self, sample_document_request):
        """Test creating document with invalid email format."""
        sample_document_request["contacts"][0]["email"] = "invalid-email"
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400
    
    def test_create_document_invalid_phone(self, sample_document_request):
        """Test creating document with invalid phone format."""
        sample_document_request["contacts"][0]["phone"] = "abc"
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400
    
    def test_create_document_zero_rto(self, sample_document_request):
        """Test creating document with zero RTO."""
        sample_document_request["rto"] = 0
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400
    
    def test_create_document_zero_rpo(self, sample_document_request):
        """Test creating document with zero RPO."""
        sample_document_request["rpo"] = 0
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400
    
    def test_create_document_negative_rto(self, sample_document_request):
        """Test creating document with negative RTO."""
        sample_document_request["rto"] = -100
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400
    
    def test_create_document_procedure_empty_steps(self, sample_document_request):
        """Test creating document with procedure having empty steps."""
        sample_document_request["procedures"][0]["steps"] = []
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400
    
    def test_create_document_procedure_whitespace_name(self, sample_document_request):
        """Test creating document with procedure having whitespace-only name."""
        sample_document_request["procedures"][0]["name"] = "   "
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 400


class TestAPIStatusCodes:
    """Tests for correct HTTP status codes."""
    
    def test_create_returns_201(self, sample_document_request):
        """Test that document creation returns 201 Created."""
        response = client.post("/api/documents", json=sample_document_request)
        assert response.status_code == 201
    
    def test_get_returns_200(self, created_document):
        """Test that document retrieval returns 200 OK."""
        doc_id = created_document["id"]
        response = client.get(f"/api/documents/{doc_id}")
        assert response.status_code == 200
    
    def test_update_returns_200(self, created_document):
        """Test that document update returns 200 OK."""
        doc_id = created_document["id"]
        response = client.put(f"/api/documents/{doc_id}", json={"title": "Updated"})
        assert response.status_code == 200
    
    def test_delete_returns_200(self, created_document):
        """Test that document deletion returns 200 OK."""
        doc_id = created_document["id"]
        response = client.delete(f"/api/documents/{doc_id}")
        assert response.status_code == 200
    
    def test_not_found_returns_404(self):
        """Test that non-existent resource returns 404."""
        response = client.get("/api/documents/nonexistent-id")
        assert response.status_code == 404
    
    def test_validation_error_returns_400(self, sample_document_request):
        """Test that validation errors return 400."""
        sample_document_request["rto"] = -1
        response = client.post("/api/documents", json=sample_document_request)
        assert response.status_code == 400


class TestCompleteWorkflows:
    """Tests for complete end-to-end workflows."""
    
    def test_create_update_retrieve_workflow(self, sample_document_request):
        """Test complete workflow: create, update, retrieve."""
        # Create document
        create_response = client.post("/api/documents", json=sample_document_request)
        assert create_response.status_code == 201
        doc_id = create_response.json()["id"]
        
        # Update document
        update_data = {"title": "Updated Title", "rto": 120}
        update_response = client.put(f"/api/documents/{doc_id}", json=update_data)
        assert update_response.status_code == 200
        assert update_response.json()["version"] == 2
        
        # Retrieve updated document
        get_response = client.get(f"/api/documents/{doc_id}")
        assert get_response.status_code == 200
        assert get_response.json()["title"] == "Updated Title"
        assert get_response.json()["rto"] == 120
    
    def test_create_validate_export_workflow(self, sample_document_request):
        """Test workflow: create, validate, export."""
        # Create document
        create_response = client.post("/api/documents", json=sample_document_request)
        assert create_response.status_code == 201
        doc_id = create_response.json()["id"]
        
        # Validate document
        validate_response = client.post(f"/api/documents/{doc_id}/validate")
        assert validate_response.status_code == 200
        validation_data = validate_response.json()
        assert "is_valid" in validation_data
        
        # Export as Markdown
        markdown_response = client.get(f"/api/documents/{doc_id}/export/markdown")
        assert markdown_response.status_code == 200
        assert markdown_response.json()["format"] == "markdown"
        
        # Export as JSON
        json_response = client.get(f"/api/documents/{doc_id}/export/json")
        assert json_response.status_code == 200
        assert json_response.json()["format"] == "json"
    
    def test_version_management_workflow(self, sample_document_request):
        """Test workflow: create, update multiple times, list versions, revert."""
        # Create document
        create_response = client.post("/api/documents", json=sample_document_request)
        assert create_response.status_code == 201
        doc_id = create_response.json()["id"]
        original_title = create_response.json()["title"]
        
        # Update document twice
        client.put(f"/api/documents/{doc_id}", json={"title": "Version 2"})
        client.put(f"/api/documents/{doc_id}", json={"title": "Version 3"})
        
        # List versions
        versions_response = client.get(f"/api/documents/{doc_id}/versions")
        assert versions_response.status_code == 200
        versions_data = versions_response.json()
        assert versions_data["total"] == 3
        
        # Revert to version 1
        revert_response = client.post(f"/api/documents/{doc_id}/revert/1")
        assert revert_response.status_code == 200
        assert revert_response.json()["title"] == original_title
        assert revert_response.json()["version"] == 4
    
    def test_search_and_filter_workflow(self, sample_document_request):
        """Test workflow: create multiple documents, search and filter."""
        # Create first document
        doc1 = sample_document_request.copy()
        doc1["title"] = "Database Failure"
        doc1["category"] = "Infrastructure"
        doc1["criticality"] = "critical"
        client.post("/api/documents", json=doc1)
        
        # Create second document
        doc2 = sample_document_request.copy()
        doc2["title"] = "Network Outage"
        doc2["category"] = "Network"
        doc2["criticality"] = "high"
        client.post("/api/documents", json=doc2)
        
        # Search by keyword
        search_response = client.get("/api/documents?query=database")
        assert search_response.status_code == 200
        search_data = search_response.json()
        assert search_data["total"] >= 1
        
        # Filter by category
        category_response = client.get("/api/documents?category=Infrastructure")
        assert category_response.status_code == 200
        category_data = category_response.json()
        assert all("Infrastructure" in doc["categories"] for doc in category_data["documents"])
        
        # Filter by criticality
        criticality_response = client.get("/api/documents?criticality=critical")
        assert criticality_response.status_code == 200
        criticality_data = criticality_response.json()
        assert all(doc["criticality"] == "critical" for doc in criticality_data["documents"])


class TestNotionIntegrationDetailed:
    """Detailed tests for Notion integration."""
    
    def test_notion_import_requires_page_url_or_id(self):
        """Test that Notion import requires either page_url or page_id."""
        request_data = {
            "api_token": "test_token",
            "categories": ["Test"],
            "criticality": "medium"
        }
        response = client.post("/api/documents/import/notion", json=request_data)
        
        assert response.status_code == 400
        assert "page_url or page_id" in response.json()["detail"].lower()
    
    def test_notion_import_invalid_url_format(self):
        """Test Notion import with invalid URL format."""
        request_data = {
            "page_url": "not-a-valid-url",
            "api_token": "test_token",
            "categories": ["Test"],
            "criticality": "medium"
        }
        response = client.post("/api/documents/import/notion", json=request_data)
        
        assert response.status_code == 400
    
    def test_notion_import_empty_token(self):
        """Test Notion import with empty token."""
        request_data = {
            "page_url": "https://notion.so/test",
            "api_token": "",
            "categories": ["Test"],
            "criticality": "medium"
        }
        response = client.post("/api/documents/import/notion", json=request_data)
        
        assert response.status_code == 400
    
    def test_notion_import_whitespace_token(self):
        """Test Notion import with whitespace-only token."""
        request_data = {
            "page_url": "https://notion.so/test",
            "api_token": "   ",
            "categories": ["Test"],
            "criticality": "medium"
        }
        response = client.post("/api/documents/import/notion", json=request_data)
        
        assert response.status_code == 400
    
    def test_notion_import_with_page_id(self):
        """Test Notion import using page_id instead of URL."""
        request_data = {
            "page_id": "test-page-id-123",
            "api_token": "test_token",
            "categories": ["Test"],
            "criticality": "medium"
        }
        response = client.post("/api/documents/import/notion", json=request_data)
        
        # Should fail with API error since token is invalid
        assert response.status_code in [400, 500]
    
    def test_notion_import_default_values(self):
        """Test Notion import with default category and criticality."""
        request_data = {
            "page_url": "https://notion.so/test",
            "api_token": "test_token"
        }
        response = client.post("/api/documents/import/notion", json=request_data)
        
        # Should fail with API error, but validates request structure
        assert response.status_code in [400, 500]


class TestGitHubIntegrationDetailed:
    """Detailed tests for GitHub integration."""
    
    def test_github_export_invalid_repo_format(self, created_document):
        """Test GitHub export with invalid repository format."""
        doc_id = created_document["id"]
        request_data = {
            "github_token": "test_token",
            "repo_name": "invalid-format",  # Missing owner/repo format
            "branch": "main"
        }
        response = client.post(f"/api/documents/{doc_id}/export/github", json=request_data)
        
        assert response.status_code == 400
    
    def test_github_export_empty_token(self, created_document):
        """Test GitHub export with empty token."""
        doc_id = created_document["id"]
        request_data = {
            "github_token": "",
            "repo_name": "owner/repo",
            "branch": "main"
        }
        response = client.post(f"/api/documents/{doc_id}/export/github", json=request_data)
        
        assert response.status_code == 400
    
    def test_github_export_empty_branch(self, created_document):
        """Test GitHub export with empty branch."""
        doc_id = created_document["id"]
        request_data = {
            "github_token": "test_token",
            "repo_name": "owner/repo",
            "branch": ""
        }
        response = client.post(f"/api/documents/{doc_id}/export/github", json=request_data)
        
        assert response.status_code == 400
    
    def test_github_export_custom_file_path(self, created_document):
        """Test GitHub export with custom file path."""
        doc_id = created_document["id"]
        request_data = {
            "github_token": "test_token",
            "repo_name": "owner/repo",
            "file_path": "docs/custom/path.pdf",
            "branch": "main"
        }
        response = client.post(f"/api/documents/{doc_id}/export/github", json=request_data)
        
        # Should fail with auth error, but validates request structure
        assert response.status_code in [400, 500]
    
    def test_github_export_default_branch(self, created_document):
        """Test GitHub export uses default branch."""
        doc_id = created_document["id"]
        request_data = {
            "github_token": "test_token",
            "repo_name": "owner/repo"
        }
        response = client.post(f"/api/documents/{doc_id}/export/github", json=request_data)
        
        # Should fail with auth error, but validates request structure
        assert response.status_code in [400, 500]
    
    def test_github_export_nonexistent_document(self):
        """Test GitHub export for document that doesn't exist."""
        request_data = {
            "github_token": "test_token",
            "repo_name": "owner/repo",
            "branch": "main"
        }
        response = client.post("/api/documents/nonexistent-id/export/github", json=request_data)
        
        assert response.status_code == 404


class TestEdgeCases:
    """Tests for edge cases and boundary conditions."""
    
    def test_create_document_with_many_procedures(self, sample_document_request):
        """Test creating document with maximum number of procedures."""
        sample_document_request["procedures"] = [
            {
                "name": f"Procedure {i}",
                "steps": [f"Step 1 for procedure {i}", f"Step 2 for procedure {i}"],
                "estimated_duration": 10
            }
            for i in range(50)  # Max is 50
        ]
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 201
    
    def test_create_document_with_many_contacts(self, sample_document_request):
        """Test creating document with many contacts."""
        sample_document_request["contacts"] = [
            {
                "name": f"Contact {i}",
                "role": f"Role {i}",
                "phone": f"+1-555-{i:04d}",
                "email": f"contact{i}@example.com"
            }
            for i in range(20)
        ]
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 201
    
    def test_create_document_with_no_contacts(self, sample_document_request):
        """Test creating document with empty contacts list."""
        sample_document_request["contacts"] = []
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 201
    
    def test_create_document_with_long_title(self, sample_document_request):
        """Test creating document with very long title."""
        sample_document_request["title"] = "A" * 500  # Max length
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 201
    
    def test_create_document_with_long_scenario(self, sample_document_request):
        """Test creating document with very long scenario."""
        sample_document_request["scenario"] = "A" * 5000  # Max length
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 201
    
    def test_create_document_max_rto_rpo(self, sample_document_request):
        """Test creating document with maximum RTO and RPO values."""
        sample_document_request["rto"] = 525600  # 1 year in minutes
        sample_document_request["rpo"] = 525600
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 201
    
    def test_update_document_partial_fields(self, created_document):
        """Test updating only some fields of a document."""
        doc_id = created_document["id"]
        
        # Update only title
        response = client.put(f"/api/documents/{doc_id}", json={"title": "New Title"})
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Title"
        # Other fields should remain unchanged
        assert data["scenario"] == created_document["scenario"]
        assert data["rto"] == created_document["rto"]
    
    def test_search_with_special_characters(self):
        """Test searching with special characters."""
        response = client.get("/api/documents?query=test@#$%")
        
        assert response.status_code == 200
        # Should not crash, even with special characters
    
    def test_list_documents_with_all_filters(self, sample_document_request):
        """Test listing documents with multiple filters."""
        # Create a specific document for this test
        test_doc_request = sample_document_request.copy()
        test_doc_request["title"] = "Test Filter Document"
        test_doc_request["categories"] = ["TestCategory"]
        test_doc_request["criticality"] = "high"
        
        response = client.post("/api/documents", json=test_doc_request)
        assert response.status_code == 201
        created_doc = response.json()
        
        category = created_doc["categories"][0]
        criticality = created_doc["criticality"]
        
        response = client.get(
            f"/api/documents?category={category}&criticality={criticality}&sort_by_criticality=true"
        )
        
        assert response.status_code == 200
        data = response.json()
        # All returned documents should match both filters
        for doc in data["documents"]:
            assert category in doc["categories"]
            assert doc["criticality"] == criticality


class TestConcurrentOperations:
    """Tests for concurrent operations and race conditions."""
    
    def test_multiple_updates_create_versions(self, created_document):
        """Test that multiple updates create separate versions."""
        doc_id = created_document["id"]
        
        # Perform multiple updates
        for i in range(5):
            response = client.put(f"/api/documents/{doc_id}", json={"title": f"Version {i+2}"})
            assert response.status_code == 200
            assert response.json()["version"] == i + 2
        
        # Check version count
        versions_response = client.get(f"/api/documents/{doc_id}/versions")
        assert versions_response.status_code == 200
        assert versions_response.json()["total"] == 6  # Original + 5 updates
    
    def test_delete_then_get_returns_404(self, created_document):
        """Test that getting a deleted document returns 404."""
        doc_id = created_document["id"]
        
        # Delete document
        delete_response = client.delete(f"/api/documents/{doc_id}")
        assert delete_response.status_code == 200
        
        # Try to get deleted document
        get_response = client.get(f"/api/documents/{doc_id}")
        assert get_response.status_code == 404
    
    def test_update_deleted_document_returns_404(self, created_document):
        """Test that updating a deleted document returns 404."""
        doc_id = created_document["id"]
        
        # Delete document
        client.delete(f"/api/documents/{doc_id}")
        
        # Try to update deleted document
        update_response = client.put(f"/api/documents/{doc_id}", json={"title": "Updated"})
        assert update_response.status_code == 404


class TestResponseStructure:
    """Tests for response structure and data integrity."""
    
    def test_created_document_has_all_fields(self, sample_document_request):
        """Test that created document response has all required fields."""
        response = client.post("/api/documents", json=sample_document_request)
        
        assert response.status_code == 201
        data = response.json()
        
        # Check all required fields are present
        required_fields = [
            "id", "title", "scenario", "procedures", "contacts",
            "rto", "rpo", "categories", "criticality",
            "created_at", "updated_at", "version"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
    
    def test_document_list_response_structure(self):
        """Test that document list response has correct structure."""
        response = client.get("/api/documents")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "documents" in data
        assert "total" in data
        assert isinstance(data["documents"], list)
        assert isinstance(data["total"], int)
    
    def test_version_list_response_structure(self, created_document):
        """Test that version list response has correct structure."""
        doc_id = created_document["id"]
        response = client.get(f"/api/documents/{doc_id}/versions")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "versions" in data
        assert "total" in data
        assert isinstance(data["versions"], list)
        
        # Check version structure
        if data["versions"]:
            version = data["versions"][0]
            assert "document_id" in version
            assert "version" in version
            assert "timestamp" in version
    
    def test_validation_response_structure(self, created_document):
        """Test that validation response has correct structure."""
        doc_id = created_document["id"]
        response = client.post(f"/api/documents/{doc_id}/validate")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "is_valid" in data
        assert "issues" in data
        assert isinstance(data["is_valid"], bool)
        assert isinstance(data["issues"], list)
    
    def test_export_response_structure(self, created_document):
        """Test that export response has correct structure."""
        doc_id = created_document["id"]
        response = client.get(f"/api/documents/{doc_id}/export/markdown")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "content" in data
        assert "format" in data
        assert data["format"] == "markdown"
        assert isinstance(data["content"], str)
    
    def test_error_response_structure(self):
        """Test that error responses have consistent structure."""
        response = client.get("/api/documents/nonexistent-id")
        
        assert response.status_code == 404
        data = response.json()
        
        assert "detail" in data
        assert isinstance(data["detail"], str)
