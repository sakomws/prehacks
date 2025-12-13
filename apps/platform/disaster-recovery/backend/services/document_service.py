"""High-level document service that orchestrates all document operations."""
from typing import List, Optional
from models.document import DRDocument, CriticalityLevel
from repositories.document_repository import DocumentRepository, InMemoryDocumentRepository
from services.version_manager import VersionManager, DocumentVersion
from services.validator import DocumentValidator, ValidationIssue
from services.search_engine import SearchEngine
from services.export_import import export_to_markdown, export_to_json, import_from_json


class DocumentService:
    """
    High-level service for managing DR documents.
    
    Orchestrates repository, version manager, validator, and search engine
    to provide complete document lifecycle management.
    """
    
    def __init__(
        self,
        repository: Optional[DocumentRepository] = None,
        validator: Optional[DocumentValidator] = None,
        search_engine: Optional[SearchEngine] = None
    ):
        """
        Initialize the document service.
        
        Args:
            repository: Document repository (defaults to InMemoryDocumentRepository)
            validator: Document validator (defaults to DocumentValidator)
            search_engine: Search engine (defaults to SearchEngine)
        """
        # Initialize version manager first
        self._version_manager = VersionManager()
        
        # Initialize repository with version manager
        self._repository = repository or InMemoryDocumentRepository(version_manager=self._version_manager)
        
        # If repository was provided, ensure it uses our version manager
        if hasattr(self._repository, '_version_manager'):
            self._version_manager = self._repository.get_version_manager()
        
        self._validator = validator or DocumentValidator()
        self._search_engine = search_engine or SearchEngine()
    
    def create_document(self, document: DRDocument) -> DRDocument:
        """
        Create a new DR document.
        
        Args:
            document: The document to create
            
        Returns:
            The created document with generated ID
        """
        # Save the document (repository handles version creation)
        return self._repository.save(document)
    
    def update_document(self, document: DRDocument) -> Optional[DRDocument]:
        """
        Update an existing DR document.
        
        Creates a new version while preserving the previous version.
        
        Args:
            document: The document with updated data
            
        Returns:
            The updated document with incremented version, or None if not found
        """
        return self._repository.update(document)
    
    def get_document(self, document_id: str, version: Optional[int] = None) -> Optional[DRDocument]:
        """
        Get a DR document by ID.
        
        Args:
            document_id: The unique identifier of the document
            version: Optional version number (defaults to latest)
            
        Returns:
            The document if found, None otherwise
        """
        if version is None:
            # Get latest version from repository
            return self._repository.find_by_id(document_id)
        else:
            # Get specific version from version manager
            doc_version = self._version_manager.get_version(document_id, version)
            return doc_version.content if doc_version else None
    
    def delete_document(self, document_id: str) -> bool:
        """
        Delete a DR document.
        
        Args:
            document_id: The unique identifier of the document to delete
            
        Returns:
            True if document was deleted, False if not found
        """
        return self._repository.delete(document_id)
    
    def duplicate_document(self, document_id: str, title_prefix: str = "Copy of ") -> Optional[DRDocument]:
        """
        Create a duplicate of an existing DR document.
        
        Args:
            document_id: The unique identifier of the document to duplicate
            title_prefix: Prefix to add to the duplicate's title
            
        Returns:
            The newly created duplicate document, or None if original not found
        """
        # Get the original document
        original_doc = self._repository.find_by_id(document_id)
        if not original_doc:
            return None
        
        # Create a duplicate with modified title
        duplicate_title = f"{title_prefix}{original_doc.title}"
        
        # Create new document with same content but new metadata
        duplicate_doc = DRDocument(
            title=duplicate_title,
            scenario=original_doc.scenario,
            procedures=original_doc.procedures,
            contacts=original_doc.contacts,
            rto=original_doc.rto,
            rpo=original_doc.rpo,
            categories=original_doc.categories,
            criticality=original_doc.criticality
            # id, created_at, updated_at, version will be auto-generated
        )
        
        # Save the duplicate
        return self._repository.save(duplicate_doc)
    
    def list_documents(
        self,
        category: Optional[str] = None,
        criticality: Optional[CriticalityLevel] = None,
        sort_by_criticality: bool = False
    ) -> List[DRDocument]:
        """
        List DR documents with optional filtering and sorting.
        
        Args:
            category: Optional category filter
            criticality: Optional criticality filter
            sort_by_criticality: If True, sort by criticality (descending)
            
        Returns:
            List of documents matching the criteria
        """
        # Apply filters
        if category:
            documents = self._repository.find_by_category(category)
        elif criticality:
            documents = self._repository.find_by_criticality(criticality)
        elif sort_by_criticality:
            documents = self._repository.find_all_sorted_by_criticality()
        else:
            documents = self._repository.find_all()
        
        return documents
    
    def search_documents(self, query: str) -> List[DRDocument]:
        """
        Search documents by keyword(s).
        
        Supports case-insensitive matching across title, scenario, and procedures.
        Multiple keywords use OR logic. Empty query returns all documents.
        
        Args:
            query: Search query (can contain multiple keywords)
            
        Returns:
            List of matching documents, ranked by relevance
        """
        all_documents = self._repository.find_all()
        return self._search_engine.search(all_documents, query)
    
    def validate_document(self, document: DRDocument) -> List[ValidationIssue]:
        """
        Validate a DR document for completeness and correctness.
        
        Checks:
        - Required sections are present and non-empty
        - Contact information is valid
        - RTO/RPO are defined and positive
        - Document is not outdated
        
        Args:
            document: The document to validate
            
        Returns:
            List of validation issues (empty if document is valid)
        """
        return self._validator.validate(document)
    
    def export_document(self, document_id: str, format: str = "json") -> Optional[str]:
        """
        Export a DR document to a specified format.
        
        Args:
            document_id: The unique identifier of the document
            format: Export format ("json" or "markdown")
            
        Returns:
            The exported document as a string, or None if document not found
            
        Raises:
            ValueError: If format is not supported
        """
        document = self._repository.find_by_id(document_id)
        if not document:
            return None
        
        if format.lower() == "json":
            return export_to_json(document)
        elif format.lower() == "markdown":
            return export_to_markdown(document)
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    def import_document(self, data: str, format: str = "json") -> DRDocument:
        """
        Import a DR document from a string.
        
        Args:
            data: The document data as a string
            format: Import format ("json" only currently supported)
            
        Returns:
            The imported document
            
        Raises:
            ValueError: If format is not supported or data is invalid
        """
        if format.lower() == "json":
            document = import_from_json(data)
            # Save the imported document
            return self.create_document(document)
        else:
            raise ValueError(f"Unsupported import format: {format}")
    
    def get_document_versions(self, document_id: str) -> List[DocumentVersion]:
        """
        Get all versions of a document.
        
        Args:
            document_id: The unique identifier of the document
            
        Returns:
            List of document versions in chronological order
        """
        return self._version_manager.list_versions(document_id)
    
    def revert_document(self, document_id: str, version_number: int) -> Optional[DRDocument]:
        """
        Revert a document to a previous version.
        
        Creates a new version with content from the specified previous version.
        
        Args:
            document_id: The unique identifier of the document
            version_number: The version number to revert to
            
        Returns:
            The new document with reverted content, or None if version not found
        """
        # Use version manager to create reverted document
        reverted_doc = self._version_manager.revert_to_version(document_id, version_number)
        
        if reverted_doc:
            # Update the document in the repository
            self._repository.update(reverted_doc)
        
        return reverted_doc
