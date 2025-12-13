"""Integration tests for DocumentService."""
import pytest
from datetime import datetime, timedelta
from models.document import DRDocument, Contact, Procedure
from services.document_service import DocumentService


@pytest.fixture
def service():
    """Create a fresh DocumentService instance for each test."""
    return DocumentService()


@pytest.fixture
def sample_document():
    """Create a sample DR document for testing."""
    return DRDocument(
        title="Database Server Failure",
        scenario="Primary database server becomes unavailable due to hardware failure",
        procedures=[
            Procedure(
                name="Failover to Secondary",
                steps=[
                    "Check secondary database status",
                    "Verify replication lag is acceptable",
                    "Initiate failover procedure",
                    "Update DNS records"
                ],
                estimated_duration=15
            ),
            Procedure(
                name="Notify Stakeholders",
                steps=[
                    "Send notification to operations team",
                    "Update status page"
                ],
                estimated_duration=5
            )
        ],
        contacts=[
            Contact(
                name="John Doe",
                role="Database Administrator",
                phone="+1-555-0100",
                email="john.doe@example.com"
            ),
            Contact(
                name="Jane Smith",
                role="Operations Manager",
                phone="+1-555-0200",
                email="jane.smith@example.com"
            )
        ],
        rto=60,
        rpo=15,
        categories=["Infrastructure"],
        criticality="critical"
    )


class TestDocumentServiceWorkflows:
    """Test complete workflows through the document service."""
    
    def test_create_and_retrieve_document(self, service, sample_document):
        """Test creating a document and retrieving it."""
        # Create document
        created = service.create_document(sample_document)
        
        # Verify it has an ID
        assert created.id is not None
        assert created.version == 1
        
        # Retrieve the document
        retrieved = service.get_document(created.id)
        
        # Verify all fields match
        assert retrieved is not None
        assert retrieved.id == created.id
        assert retrieved.title == sample_document.title
        assert retrieved.scenario == sample_document.scenario
        assert len(retrieved.procedures) == len(sample_document.procedures)
        assert len(retrieved.contacts) == len(sample_document.contacts)
        assert retrieved.rto == sample_document.rto
        assert retrieved.rpo == sample_document.rpo
        assert retrieved.categories == sample_document.categories
        assert retrieved.criticality == sample_document.criticality
    
    def test_update_document_workflow(self, service, sample_document):
        """Test updating a document creates new version."""
        # Create document
        created = service.create_document(sample_document)
        original_id = created.id
        
        # Update the document
        created.title = "Updated Database Failure Procedure"
        created.scenario = "Updated scenario description"
        
        updated = service.update_document(created)
        
        # Verify update succeeded
        assert updated is not None
        assert updated.id == original_id
        assert updated.version == 2
        assert updated.title == "Updated Database Failure Procedure"
        
        # Verify we can retrieve both versions
        latest = service.get_document(original_id)
        assert latest.version == 2
        assert latest.title == "Updated Database Failure Procedure"
        
        original_version = service.get_document(original_id, version=1)
        assert original_version.version == 1
        assert original_version.title == sample_document.title
    
    def test_duplicate_document_workflow(self, service, sample_document):
        """Test duplicating a document."""
        # Create original document
        original = service.create_document(sample_document)
        original_id = original.id
        
        # Duplicate the document
        duplicate = service.duplicate_document(original_id)
        
        # Verify duplicate was created
        assert duplicate is not None
        assert duplicate.id != original_id
        
        # Verify title is prefixed
        assert duplicate.title == f"Copy of {original.title}"
        
        # Verify content is identical
        assert duplicate.scenario == original.scenario
        assert duplicate.rto == original.rto
        assert duplicate.rpo == original.rpo
        assert duplicate.categories == original.categories
        assert duplicate.criticality == original.criticality
        
        # Verify procedures are identical
        assert len(duplicate.procedures) == len(original.procedures)
        for orig_proc, dup_proc in zip(original.procedures, duplicate.procedures):
            assert dup_proc.name == orig_proc.name
            assert dup_proc.steps == orig_proc.steps
            assert dup_proc.estimated_duration == orig_proc.estimated_duration
        
        # Verify contacts are identical
        assert len(duplicate.contacts) == len(original.contacts)
        for orig_contact, dup_contact in zip(original.contacts, duplicate.contacts):
            assert dup_contact.name == orig_contact.name
            assert dup_contact.role == orig_contact.role
            assert dup_contact.phone == orig_contact.phone
            assert dup_contact.email == orig_contact.email
        
        # Verify new metadata
        assert duplicate.version == 1
        assert duplicate.created_at != original.created_at
        assert duplicate.updated_at != original.updated_at
        
        # Verify both documents exist independently
        retrieved_original = service.get_document(original_id)
        retrieved_duplicate = service.get_document(duplicate.id)
        
        assert retrieved_original.id == original_id
        assert retrieved_duplicate.id == duplicate.id
        assert retrieved_original.title != retrieved_duplicate.title
    
    def test_duplicate_nonexistent_document(self, service):
        """Test duplicating a document that doesn't exist."""
        result = service.duplicate_document("nonexistent-id")
        assert result is None
    
    def test_search_workflow(self, service):
        """Test searching across multiple documents."""
        # Create multiple documents
        doc1 = DRDocument(
            title="Database Failure",
            scenario="Database server crash",
            procedures=[Procedure(name="Restart", steps=["Step 1"], estimated_duration=10)],
            contacts=[Contact(name="Admin", role="DBA", phone="+1-555-0100", email="admin@example.com")],
            rto=60,
            rpo=15,
            categories=["Infrastructure"],
            criticality="critical"
        )
        
        doc2 = DRDocument(
            title="Network Outage",
            scenario="Network connectivity lost",
            procedures=[Procedure(name="Diagnose", steps=["Check routers"], estimated_duration=20)],
            contacts=[Contact(name="NetAdmin", role="Network Admin", phone="+1-555-0200", email="netadmin@example.com")],
            rto=30,
            rpo=10,
            category="Network",
            criticality="high"
        )
        
        doc3 = DRDocument(
            title="Application Error",
            scenario="Application crashes due to database connection issues",
            procedures=[Procedure(name="Restart App", steps=["Stop app", "Start app"], estimated_duration=5)],
            contacts=[Contact(name="DevOps", role="DevOps Engineer", phone="+1-555-0300", email="devops@example.com")],
            rto=15,
            rpo=5,
            categories=["Application"],
            criticality="medium"
        )
        
        service.create_document(doc1)
        service.create_document(doc2)
        service.create_document(doc3)
        
        # Search for "database" - should match doc1 (title) and doc3 (scenario)
        results = service.search_documents("database")
        assert len(results) == 2
        # doc1 should be first (title match ranks higher)
        assert results[0].title == "Database Failure"
        assert results[1].title == "Application Error"
        
        # Search for "network" - should match doc2
        results = service.search_documents("network")
        assert len(results) == 1
        assert results[0].title == "Network Outage"
        
        # Empty search should return all documents
        results = service.search_documents("")
        assert len(results) == 3
    
    def test_export_import_workflow(self, service, sample_document):
        """Test exporting and importing a document."""
        # Create document
        created = service.create_document(sample_document)
        original_id = created.id
        
        # Export to JSON
        json_export = service.export_document(original_id, format="json")
        assert json_export is not None
        assert "Database Server Failure" in json_export
        
        # Export to Markdown
        markdown_export = service.export_document(original_id, format="markdown")
        assert markdown_export is not None
        assert "# Database Server Failure" in markdown_export
        assert "## Disaster Scenario" in markdown_export
        
        # Import from JSON (creates new document with same ID from JSON)
        imported = service.import_document(json_export, format="json")
        
        # Verify imported document preserves ID and content from JSON
        assert imported.id == original_id  # ID is preserved from JSON
        assert imported.title == sample_document.title
        assert imported.scenario == sample_document.scenario
        assert len(imported.procedures) == len(sample_document.procedures)
        assert len(imported.contacts) == len(sample_document.contacts)
    
    def test_validation_workflow(self, service):
        """Test document validation."""
        # Create a valid document
        valid_doc = DRDocument(
            title="Valid Document",
            scenario="A valid scenario",
            procedures=[Procedure(name="Proc", steps=["Step 1"], estimated_duration=10)],
            contacts=[Contact(name="Admin", role="Admin", phone="+1-555-0100", email="admin@example.com")],
            rto=60,
            rpo=15,
            category="Test",
            criticality="low"
        )
        
        issues = service.validate_document(valid_doc)
        assert len(issues) == 0
        
        # Create an invalid document (empty scenario)
        invalid_doc = DRDocument(
            title="Invalid Document",
            scenario="   ",  # Empty/whitespace
            procedures=[],  # No procedures
            contacts=[Contact(name="Admin", role="Admin", phone="invalid", email="not-an-email")],
            rto=60,
            rpo=15,
            category="Test",
            criticality="low"
        )
        
        issues = service.validate_document(invalid_doc)
        # Should have multiple issues
        assert len(issues) > 0
        # Check for specific issues
        issue_fields = [issue.field for issue in issues]
        assert "scenario" in issue_fields
        assert "procedures" in issue_fields
        assert any("phone" in field for field in issue_fields)
        assert any("email" in field for field in issue_fields)
    
    def test_version_management_workflow(self, service, sample_document):
        """Test version management through the service."""
        # Create document
        created = service.create_document(sample_document)
        doc_id = created.id
        
        # Make multiple updates
        created.title = "Version 2"
        service.update_document(created)
        
        created.title = "Version 3"
        service.update_document(created)
        
        # Get all versions
        versions = service.get_document_versions(doc_id)
        assert len(versions) == 3
        assert versions[0].version == 1
        assert versions[1].version == 2
        assert versions[2].version == 3
        
        # Revert to version 1
        reverted = service.revert_document(doc_id, 1)
        assert reverted is not None
        assert reverted.version == 4  # New version created
        assert reverted.title == sample_document.title  # Content from version 1
        
        # Verify version 4 exists
        versions = service.get_document_versions(doc_id)
        assert len(versions) == 4
    
    def test_list_and_filter_workflow(self, service):
        """Test listing and filtering documents."""
        # Create documents with different categories and criticalities
        doc1 = DRDocument(
            title="Critical Infrastructure",
            scenario="Critical issue",
            procedures=[Procedure(name="Fix", steps=["Step 1"], estimated_duration=10)],
            contacts=[Contact(name="Admin", role="Admin", phone="+1-555-0100", email="admin@example.com")],
            rto=60,
            rpo=15,
            categories=["Infrastructure"],
            criticality="critical"
        )
        
        doc2 = DRDocument(
            title="High Infrastructure",
            scenario="High priority issue",
            procedures=[Procedure(name="Fix", steps=["Step 1"], estimated_duration=10)],
            contacts=[Contact(name="Admin", role="Admin", phone="+1-555-0100", email="admin@example.com")],
            rto=60,
            rpo=15,
            categories=["Infrastructure"],
            criticality="high"
        )
        
        doc3 = DRDocument(
            title="Medium Application",
            scenario="Medium priority issue",
            procedures=[Procedure(name="Fix", steps=["Step 1"], estimated_duration=10)],
            contacts=[Contact(name="Admin", role="Admin", phone="+1-555-0100", email="admin@example.com")],
            rto=60,
            rpo=15,
            categories=["Application"],
            criticality="medium"
        )
        
        service.create_document(doc1)
        service.create_document(doc2)
        service.create_document(doc3)
        
        # List all documents
        all_docs = service.list_documents()
        assert len(all_docs) == 3
        
        # Filter by category
        infra_docs = service.list_documents(category="Infrastructure")
        assert len(infra_docs) == 2
        
        # Filter by criticality
        critical_docs = service.list_documents(criticality="critical")
        assert len(critical_docs) == 1
        assert critical_docs[0].title == "Critical Infrastructure"
        
        # Sort by criticality
        sorted_docs = service.list_documents(sort_by_criticality=True)
        assert len(sorted_docs) == 3
        assert sorted_docs[0].criticality == "critical"
        assert sorted_docs[1].criticality == "high"
        assert sorted_docs[2].criticality == "medium"


class TestDocumentServiceErrorHandling:
    """Test error handling in the document service."""
    
    def test_get_nonexistent_document(self, service):
        """Test retrieving a document that doesn't exist."""
        result = service.get_document("nonexistent-id")
        assert result is None
    
    def test_update_nonexistent_document(self, service, sample_document):
        """Test updating a document that doesn't exist."""
        sample_document.id = "nonexistent-id"
        result = service.update_document(sample_document)
        assert result is None
    
    def test_delete_nonexistent_document(self, service):
        """Test deleting a document that doesn't exist."""
        result = service.delete_document("nonexistent-id")
        assert result is False
    
    def test_export_nonexistent_document(self, service):
        """Test exporting a document that doesn't exist."""
        result = service.export_document("nonexistent-id")
        assert result is None
    
    def test_export_unsupported_format(self, service, sample_document):
        """Test exporting with an unsupported format."""
        created = service.create_document(sample_document)
        
        with pytest.raises(ValueError, match="Unsupported export format"):
            service.export_document(created.id, format="xml")
    
    def test_import_invalid_json(self, service):
        """Test importing invalid JSON."""
        with pytest.raises(ValueError, match="Invalid JSON"):
            service.import_document("not valid json", format="json")
    
    def test_import_unsupported_format(self, service):
        """Test importing with an unsupported format."""
        with pytest.raises(ValueError, match="Unsupported import format"):
            service.import_document("{}", format="xml")
    
    def test_revert_to_nonexistent_version(self, service, sample_document):
        """Test reverting to a version that doesn't exist."""
        created = service.create_document(sample_document)
        
        result = service.revert_document(created.id, 999)
        assert result is None
    
    def test_get_versions_of_nonexistent_document(self, service):
        """Test getting versions of a document that doesn't exist."""
        versions = service.get_document_versions("nonexistent-id")
        assert len(versions) == 0
