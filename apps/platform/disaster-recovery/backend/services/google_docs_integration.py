"""High-level Google Docs integration service."""
from typing import Optional, List
from models.document import DRDocument
from services.google_docs_client import GoogleDocsClient, GoogleDocsAPIError
from services.google_docs_parser import GoogleDocsParser, GoogleDocsParseError


class GoogleDocsIntegrationService:
    """
    Service for importing DR documents from Google Docs.
    
    Combines the Google Docs API client and parser to provide
    a simple interface for importing documents.
    """
    
    def __init__(self, access_token: Optional[str] = None):
        """
        Initialize the Google Docs integration service.
        
        Args:
            access_token: Optional Google OAuth2 access token for private documents
        """
        self._client = GoogleDocsClient(access_token)
        self._parser = GoogleDocsParser()
    
    def import_from_url(
        self,
        document_url: str,
        categories: List[str] = None,
        criticality: str = "medium"
    ) -> DRDocument:
        """
        Import a DR document from a Google Docs URL.
        
        Args:
            document_url: The Google Docs URL
            categories: Document categories (default: ["General"])
            criticality: Document criticality level (default: "medium")
            
        Returns:
            A DR document created from the Google Doc
            
        Raises:
            GoogleDocsAPIError: If API request fails
            GoogleDocsParseError: If document content cannot be parsed
        """
        # Retrieve document data
        document_data = self._client.get_document_by_url(document_url)
        if not document_data:
            raise GoogleDocsAPIError(f"Document not found: {document_url}")
        
        # Parse into DR document
        if categories is None:
            categories = ["General"]
        
        document = self._parser.parse_document_to_dr_document(
            document_data=document_data,
            categories=categories,
            criticality=criticality
        )
        
        return document
    
    def import_from_document_id(
        self,
        document_id: str,
        categories: List[str] = None,
        criticality: str = "medium"
    ) -> DRDocument:
        """
        Import a DR document from a Google Docs document ID.
        
        Args:
            document_id: The Google Docs document ID
            categories: Document categories (default: ["General"])
            criticality: Document criticality level (default: "medium")
            
        Returns:
            A DR document created from the Google Doc
            
        Raises:
            GoogleDocsAPIError: If API request fails
            GoogleDocsParseError: If document content cannot be parsed
        """
        # Retrieve document data
        document_data = self._client.get_document_by_id(document_id)
        if not document_data:
            raise GoogleDocsAPIError(f"Document not found: {document_id}")
        
        # Parse into DR document
        if categories is None:
            categories = ["General"]
        
        document = self._parser.parse_document_to_dr_document(
            document_data=document_data,
            categories=categories,
            criticality=criticality
        )
        
        return document