"""High-level Notion integration service."""
from typing import Optional, List
from models.document import DRDocument
from services.notion_client import NotionAPIClient, NotionAPIError
from services.notion_parser import NotionPageParser, NotionParseError


class NotionIntegrationService:
    """
    Service for importing DR documents from Notion.
    
    Combines the Notion API client and parser to provide
    a simple interface for importing documents.
    """
    
    def __init__(self, api_token: str):
        """
        Initialize the Notion integration service.
        
        Args:
            api_token: Notion API integration token
        """
        self._client = NotionAPIClient(api_token)
        self._parser = NotionPageParser()
    
    def import_from_url(
        self,
        page_url: str,
        categories: List[str] = None,
        criticality: str = "medium"
    ) -> DRDocument:
        """
        Import a DR document from a Notion page URL.
        
        Args:
            page_url: The Notion page URL
            categories: Document categories (default: ["General"])
            criticality: Document criticality level (default: "medium")
            
        Returns:
            A DR document created from the Notion page
            
        Raises:
            NotionAPIError: If API request fails
            NotionParseError: If page content cannot be parsed
        """
        # Retrieve page data
        page_data = self._client.get_page_by_url(page_url)
        if not page_data:
            raise NotionAPIError(f"Page not found: {page_url}")
        
        # Get page ID
        page_id = page_data["id"]
        
        # Retrieve page blocks
        blocks = self._client.get_page_blocks(page_id)
        
        # Parse into DR document
        if categories is None:
            categories = ["General"]
        
        document = self._parser.parse_page_to_document(
            page_data=page_data,
            blocks=blocks,
            categories=categories,
            criticality=criticality
        )
        
        return document
    
    def import_from_page_id(
        self,
        page_id: str,
        categories: List[str] = None,
        criticality: str = "medium"
    ) -> DRDocument:
        """
        Import a DR document from a Notion page ID.
        
        Args:
            page_id: The Notion page ID
            categories: Document categories (default: ["General"])
            criticality: Document criticality level (default: "medium")
            
        Returns:
            A DR document created from the Notion page
            
        Raises:
            NotionAPIError: If API request fails
            NotionParseError: If page content cannot be parsed
        """
        # Retrieve page data
        page_data = self._client.get_page_by_id(page_id)
        if not page_data:
            raise NotionAPIError(f"Page not found: {page_id}")
        
        # Retrieve page blocks
        blocks = self._client.get_page_blocks(page_id)
        
        # Parse into DR document
        if categories is None:
            categories = ["General"]
        
        document = self._parser.parse_page_to_document(
            page_data=page_data,
            blocks=blocks,
            categories=categories,
            criticality=criticality
        )
        
        return document
