"""Tests for the NotionAPIClient."""
import pytest
from unittest.mock import Mock, patch
from services.notion_client import NotionAPIClient, NotionAPIError
from notion_client.errors import APIResponseError, RequestTimeoutError


class TestNotionAPIClient:
    """Test the NotionAPIClient class."""
    
    def test_init_with_token(self):
        """Test that client initializes with API token."""
        client = NotionAPIClient("test_token")
        assert client._client is not None
    
    def test_extract_page_id_from_url_valid(self):
        """Test extracting page ID from valid Notion URLs."""
        client = NotionAPIClient("test_token")
        
        # Test standard Notion URL format (32 char hex ID)
        url1 = "https://www.notion.so/My-Page-Title-abc123def456789012345678901234ab"
        page_id1 = client._extract_page_id_from_url(url1)
        assert page_id1 == "abc123def456789012345678901234ab"
        
        # Test URL with workspace
        url2 = "https://www.notion.so/workspace/Page-Title-1234567890abcdef1234567890abcdef"
        page_id2 = client._extract_page_id_from_url(url2)
        assert page_id2 == "1234567890abcdef1234567890abcdef"
        
        # Test URL with query parameters
        url3 = "https://www.notion.so/Page-Title-fedcba0987654321fedcba09876543ab?v=123"
        page_id3 = client._extract_page_id_from_url(url3)
        assert page_id3 == "fedcba0987654321fedcba09876543ab"
    
    def test_extract_page_id_from_url_invalid(self):
        """Test extracting page ID from invalid URLs."""
        client = NotionAPIClient("test_token")
        
        # Test invalid URLs
        assert client._extract_page_id_from_url("https://google.com") is None
        assert client._extract_page_id_from_url("not-a-url") is None
        assert client._extract_page_id_from_url("") is None
        assert client._extract_page_id_from_url("https://notion.so/short-id") is None
    
    @patch('services.notion_client.NotionAPIClient._make_api_request')
    def test_get_page_by_id_success(self, mock_request):
        """Test successful page retrieval by ID."""
        client = NotionAPIClient("test_token")
        mock_page = {"id": "test_id", "properties": {}}
        mock_request.return_value = mock_page
        
        result = client.get_page_by_id("test_id")
        assert result == mock_page
        mock_request.assert_called_once()
    
    @patch('services.notion_client.NotionAPIClient._make_api_request')
    def test_get_page_by_id_not_found(self, mock_request):
        """Test page retrieval when page not found."""
        client = NotionAPIClient("test_token")
        mock_request.return_value = None
        
        result = client.get_page_by_id("nonexistent_id")
        assert result is None
    
    def test_get_page_by_url_invalid_url(self):
        """Test page retrieval with invalid URL."""
        client = NotionAPIClient("test_token")
        
        with pytest.raises(NotionAPIError, match="Invalid Notion URL"):
            client.get_page_by_url("https://google.com")
    
    @patch('services.notion_client.NotionAPIClient.get_page_by_id')
    def test_get_page_by_url_success(self, mock_get_by_id):
        """Test successful page retrieval by URL."""
        client = NotionAPIClient("test_token")
        mock_page = {"id": "test_id", "properties": {}}
        mock_get_by_id.return_value = mock_page
        
        url = "https://www.notion.so/Page-Title-1234567890abcdef1234567890abcdef"
        result = client.get_page_by_url(url)
        
        assert result == mock_page
        mock_get_by_id.assert_called_once_with("1234567890abcdef1234567890abcdef")
    
    @patch('services.notion_client.NotionAPIClient._make_api_request')
    def test_get_page_blocks_success(self, mock_request):
        """Test successful page blocks retrieval."""
        client = NotionAPIClient("test_token")
        
        # Mock paginated response
        mock_request.side_effect = [
            {
                "results": [{"type": "paragraph", "id": "block1"}],
                "has_more": True,
                "next_cursor": "cursor1"
            },
            {
                "results": [{"type": "heading_1", "id": "block2"}],
                "has_more": False,
                "next_cursor": None
            }
        ]
        
        result = client.get_page_blocks("test_page_id")
        
        assert len(result) == 2
        assert result[0]["id"] == "block1"
        assert result[1]["id"] == "block2"
        assert mock_request.call_count == 2


class TestNotionAPIClientErrorHandling:
    """Test error handling and rate limiting in NotionAPIClient."""
    
    def test_unexpected_error_raises_notion_error(self):
        """Test that unexpected errors are wrapped in NotionAPIError."""
        client = NotionAPIClient("test_token")
        
        mock_func = Mock()
        mock_func.side_effect = ValueError("Unexpected error")
        
        with pytest.raises(NotionAPIError, match="Unexpected error"):
            client._make_api_request(mock_func)
    
    def test_make_api_request_success(self):
        """Test successful API request."""
        client = NotionAPIClient("test_token")
        
        mock_func = Mock()
        mock_func.return_value = {"success": True}
        
        result = client._make_api_request(mock_func)
        assert result == {"success": True}
        assert mock_func.call_count == 1