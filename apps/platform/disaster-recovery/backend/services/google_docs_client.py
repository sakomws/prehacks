"""Google Docs API client for retrieving document content."""
from typing import Dict, Any, Optional, List
import re
import requests
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


class GoogleDocsClient:
    """
    Client for interacting with the Google Docs API.
    
    Handles both authenticated and public document access.
    """
    
    def __init__(self, access_token: Optional[str] = None):
        """
        Initialize the Google Docs API client.
        
        Args:
            access_token: Optional Google OAuth2 access token for private documents
        """
        self._access_token = access_token
        if access_token:
            self._credentials = Credentials(token=access_token)
            self._service = build('docs', 'v1', credentials=self._credentials)
        else:
            self._service = None  # No service for public access, use direct HTTP
    
    def get_document_by_id(self, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a Google Doc by its ID.
        
        First tries public access, then falls back to authenticated access if available.
        
        Args:
            document_id: The Google Docs document ID
            
        Returns:
            Document data as a dictionary, or None if document not found
            
        Raises:
            GoogleDocsAPIError: If API request fails
        """
        # First try public access via export API
        try:
            return self._get_public_document(document_id)
        except GoogleDocsAPIError as public_error:
            # If public access fails and we have credentials, try authenticated access
            if self._access_token and self._service:
                try:
                    document = self._service.documents().get(documentId=document_id).execute()
                    return document
                except HttpError as e:
                    if e.resp.status == 404:
                        return None
                    elif e.resp.status == 403:
                        raise GoogleDocsAPIError(f"Access denied to document: {document_id}. Make sure the document is shared with 'Anyone with the link can view' or provide a valid access token.") from e
                    else:
                        raise GoogleDocsAPIError(f"Failed to retrieve document: {e}") from e
                except Exception as e:
                    raise GoogleDocsAPIError(f"Unexpected error retrieving document: {str(e)}") from e
            else:
                # No credentials available, re-raise the public access error
                raise public_error
    
    def _get_public_document(self, document_id: str) -> Dict[str, Any]:
        """
        Retrieve a public Google Doc using the export API.
        
        This works for documents shared with "Anyone with the link can view".
        """
        try:
            # Use the export API to get the document as plain text first to check access
            export_url = f"https://docs.google.com/document/d/{document_id}/export?format=txt"
            response = requests.get(export_url, timeout=30)
            
            if response.status_code == 404:
                raise GoogleDocsAPIError(f"Document not found: {document_id}")
            elif response.status_code == 403:
                raise GoogleDocsAPIError(f"Document is not publicly accessible: {document_id}. Make sure it's shared with 'Anyone with the link can view'.")
            elif response.status_code != 200:
                raise GoogleDocsAPIError(f"Failed to access document: HTTP {response.status_code}")
            
            # If we can access the text, try to get the structured content
            # For public documents, we'll parse the HTML export which has more structure
            html_url = f"https://docs.google.com/document/d/{document_id}/export?format=html"
            html_response = requests.get(html_url, timeout=30)
            
            if html_response.status_code == 200:
                return self._parse_html_export(html_response.text, document_id)
            else:
                # Fallback to plain text if HTML fails
                return self._parse_text_export(response.text, document_id)
                
        except requests.RequestException as e:
            raise GoogleDocsAPIError(f"Network error accessing document: {str(e)}") from e
    
    def _parse_html_export(self, html_content: str, document_id: str) -> Dict[str, Any]:
        """Parse HTML export into a document structure similar to the API format."""
        from bs4 import BeautifulSoup
        
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract title
            title_elem = soup.find('title')
            title = title_elem.get_text().strip() if title_elem else f"Document {document_id}"
            
            # Create a simplified document structure
            content_elements = []
            
            # Find the main content (usually in a div or body)
            main_content = soup.find('body') or soup
            
            # Process paragraphs and headings
            for elem in main_content.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']):
                text = elem.get_text().strip()
                if not text:
                    continue
                
                # Determine element type
                if elem.name.startswith('h'):
                    # Heading
                    level = elem.name[1]  # h1 -> 1, h2 -> 2, etc.
                    content_elements.append({
                        "paragraph": {
                            "elements": [{"textRun": {"content": text + "\n"}}],
                            "paragraphStyle": {"namedStyleType": f"HEADING_{level}"}
                        }
                    })
                elif elem.name == 'li':
                    # List item
                    content_elements.append({
                        "paragraph": {
                            "elements": [{"textRun": {"content": text + "\n"}}],
                            "bullet": {"listId": "list1"}
                        }
                    })
                else:
                    # Regular paragraph
                    content_elements.append({
                        "paragraph": {
                            "elements": [{"textRun": {"content": text + "\n"}}]
                        }
                    })
            
            return {
                "title": title,
                "body": {
                    "content": content_elements
                }
            }
            
        except Exception as e:
            raise GoogleDocsAPIError(f"Failed to parse HTML export: {str(e)}") from e
    
    def _parse_text_export(self, text_content: str, document_id: str) -> Dict[str, Any]:
        """Parse plain text export into a basic document structure."""
        lines = text_content.strip().split('\n')
        
        # Use first non-empty line as title, or default
        title = f"Document {document_id}"
        content_start = 0
        
        for i, line in enumerate(lines):
            if line.strip():
                title = line.strip()
                content_start = i + 1
                break
        
        # Convert remaining lines to paragraphs
        content_elements = []
        for line in lines[content_start:]:
            if line.strip():
                content_elements.append({
                    "paragraph": {
                        "elements": [{"textRun": {"content": line + "\n"}}]
                    }
                })
        
        return {
            "title": title,
            "body": {
                "content": content_elements
            }
        }
    
    def get_document_by_url(self, document_url: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a Google Doc by its URL.
        
        Extracts the document ID from the URL and retrieves the document.
        
        Args:
            document_url: The Google Docs document URL
            
        Returns:
            Document data as a dictionary, or None if document not found
            
        Raises:
            GoogleDocsAPIError: If URL is invalid or API request fails
        """
        document_id = self._extract_document_id_from_url(document_url)
        if not document_id:
            raise GoogleDocsAPIError(f"Invalid Google Docs URL: {document_url}")
        
        return self.get_document_by_id(document_id)
    
    def _extract_document_id_from_url(self, url: str) -> Optional[str]:
        """
        Extract document ID from a Google Docs URL.
        
        Google Docs URLs have formats like:
        - https://docs.google.com/document/d/{document_id}/edit
        - https://docs.google.com/document/d/{document_id}/
        
        Args:
            url: The Google Docs URL
            
        Returns:
            The document ID, or None if extraction fails
        """
        # Pattern to match Google Docs URLs
        pattern = r'https://docs\.google\.com/document/d/([a-zA-Z0-9-_]+)'
        match = re.search(pattern, url)
        
        if match:
            return match.group(1)
        
        return None


class GoogleDocsAPIError(Exception):
    """Exception raised for Google Docs API errors."""
    pass