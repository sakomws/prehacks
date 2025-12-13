"""Notion API client for retrieving page content."""
import time
from typing import Dict, Any, Optional, List
from notion_client import Client
from notion_client.errors import APIResponseError, RequestTimeoutError


class NotionAPIClient:
    """
    Client for interacting with the Notion API.
    
    Handles authentication, page retrieval, and error handling.
    """
    
    def __init__(self, api_token: str):
        """
        Initialize the Notion API client.
        
        Args:
            api_token: Notion API integration token
        """
        self._client = Client(auth=api_token)
    
    def get_page_by_id(self, page_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a Notion page by its ID.
        
        Args:
            page_id: The Notion page ID (32-character UUID)
            
        Returns:
            Page data as a dictionary, or None if page not found
            
        Raises:
            NotionAPIError: If API request fails
        """
        return self._make_api_request(lambda: self._client.pages.retrieve(page_id=page_id))
    
    def get_page_by_url(self, page_url: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a Notion page by its URL.
        
        Extracts the page ID from the URL and retrieves the page.
        
        Args:
            page_url: The Notion page URL
            
        Returns:
            Page data as a dictionary, or None if page not found
            
        Raises:
            NotionAPIError: If URL is invalid or API request fails
        """
        page_id = self._extract_page_id_from_url(page_url)
        if not page_id:
            raise NotionAPIError(f"Invalid Notion URL: {page_url}")
        
        return self.get_page_by_id(page_id)
    
    def get_page_blocks(self, page_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve all blocks (content) from a Notion page.
        
        Args:
            page_id: The Notion page ID
            
        Returns:
            List of block objects containing page content
            
        Raises:
            NotionAPIError: If API request fails
        """
        blocks = []
        has_more = True
        start_cursor = None
        
        # Handle pagination
        while has_more:
            response = self._make_api_request(
                lambda: self._client.blocks.children.list(
                    block_id=page_id,
                    start_cursor=start_cursor
                )
            )
            blocks.extend(response.get("results", []))
            has_more = response.get("has_more", False)
            start_cursor = response.get("next_cursor")
        
        return blocks
    
    def _extract_page_id_from_url(self, url: str) -> Optional[str]:
        """
        Extract page ID from a Notion URL.
        
        Notion URLs have formats like:
        - https://www.notion.so/Page-Title-{page_id}
        - https://www.notion.so/{workspace}/Page-Title-{page_id}
        
        Args:
            url: The Notion page URL
            
        Returns:
            The 32-character page ID, or None if extraction fails
        """
        # Remove query parameters
        url = url.split("?")[0]
        
        # Extract the last segment which contains the page ID
        segments = url.rstrip("/").split("/")
        if not segments:
            return None
        
        last_segment = segments[-1]
        
        # Page ID is the last 32 characters (without hyphens)
        # It may be at the end of the segment after a hyphen
        if "-" in last_segment:
            # Extract everything after the last hyphen
            potential_id = last_segment.split("-")[-1]
        else:
            potential_id = last_segment
        
        # Remove any hyphens from the ID
        page_id = potential_id.replace("-", "")
        
        # Validate it's a 32-character hex string (Notion page IDs are 32 hex chars)
        if len(page_id) == 32 and all(c in "0123456789abcdefABCDEF" for c in page_id):
            return page_id
        
        return None
    
    def _make_api_request(self, request_func, max_retries: int = 3):
        """
        Make an API request with rate limiting and retry logic.
        
        Args:
            request_func: Function that makes the API request
            max_retries: Maximum number of retry attempts
            
        Returns:
            The API response
            
        Raises:
            NotionAPIError: If API request fails after all retries
        """
        for attempt in range(max_retries + 1):
            try:
                response = request_func()
                return response
            except APIResponseError as e:
                if e.code == "object_not_found":
                    return None
                elif e.code == "rate_limited":
                    if attempt < max_retries:
                        # Extract retry-after from headers if available, otherwise use exponential backoff
                        retry_after = getattr(e, 'retry_after', None) or (2 ** attempt)
                        time.sleep(retry_after)
                        continue
                    else:
                        raise NotionAPIError(f"Rate limit exceeded after {max_retries} retries") from e
                elif e.code in ["service_unavailable", "internal_server_error"]:
                    if attempt < max_retries:
                        # Exponential backoff for server errors
                        time.sleep(2 ** attempt)
                        continue
                    else:
                        raise NotionAPIError(f"Service unavailable after {max_retries} retries: {e.message}") from e
                else:
                    raise NotionAPIError(f"API request failed: {e.message}") from e
            except RequestTimeoutError as e:
                if attempt < max_retries:
                    # Retry on timeout with exponential backoff
                    time.sleep(2 ** attempt)
                    continue
                else:
                    raise NotionAPIError(f"Request timeout after {max_retries} retries") from e
            except Exception as e:
                raise NotionAPIError(f"Unexpected error: {str(e)}") from e
        
        # This should never be reached, but just in case
        raise NotionAPIError("Maximum retries exceeded")


class NotionAPIError(Exception):
    """Exception raised for Notion API errors."""
    pass
