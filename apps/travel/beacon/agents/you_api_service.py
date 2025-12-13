#!/usr/bin/env python3
"""
You.com API Service - Centralized service for You.com API interactions
"""
import os
import aiohttp
import asyncio
from typing import Dict, Any, Optional, List
from urllib.parse import quote_plus
import json
from dotenv import load_dotenv

load_dotenv()

class YouAPIService:
    """Centralized service for You.com API interactions"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://ydc-index.io"):
        self.api_key = api_key or os.getenv("YOU_API_KEY")
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
        
        if not self.api_key:
            print("Warning: YOU_API_KEY not found. You.com API will be disabled.")
        else:
            print("You.com API key loaded successfully")
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def search(self, query: str, count: int = 10, offset: int = 0) -> Dict[str, Any]:
        """Perform search using You.com API"""
        
        if not self.api_key:
            print("You.com API not configured, returning empty results")
            return {"results": []}
        
        try:
            session = await self._get_session()
            
            # Construct the search URL
            encoded_query = quote_plus(query)
            url = f"{self.base_url}/v1/search?query={encoded_query}&count={count}&offset={offset}"
            
            headers = {
                "X-API-Key": self.api_key
            }
            
            print(f"Searching You.com API: {query}")
            
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"You.com API search successful: {len(data.get('results', []))} results")
                    return data
                elif response.status == 401:
                    print("You.com API authentication failed")
                    return {"results": [], "error": "authentication_failed"}
                elif response.status == 429:
                    print("You.com API rate limit exceeded")
                    return {"results": [], "error": "rate_limit_exceeded"}
                else:
                    error_text = await response.text()
                    print(f"You.com API error: {response.status} - {error_text}")
                    return {"results": [], "error": f"api_error_{response.status}"}
                    
        except asyncio.TimeoutError:
            print("You.com API request timed out")
            return {"results": [], "error": "timeout"}
        except Exception as e:
            print(f"You.com API error: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"results": [], "error": str(e)}
    
    def parse_search_results(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse You.com API search results into a standardized format"""
        
        results = []
        
        if "error" in data:
            return results
        
        # You.com API returns results in nested structure: results.web is an array
        raw_results = []
        if "results" in data:
            if isinstance(data["results"], dict):
                # Handle nested structure: results.web, results.news, etc.
                for key in data["results"].keys():
                    if isinstance(data["results"][key], list):
                        raw_results.extend(data["results"][key])
            elif isinstance(data["results"], list):
                raw_results = data["results"]
        elif "hits" in data:
            raw_results = data["hits"]
        elif isinstance(data, list):
            raw_results = data
        else:
            # Try to extract any list-like structure
            for key in data.keys():
                if isinstance(data[key], list) and len(data[key]) > 0:
                    raw_results = data[key]
                    break
            else:
                return results
        
        for item in raw_results:
            try:
                # Standardize the result format
                # Handle snippets array - join them or take first
                description = item.get("description", "")
                if not description and "snippets" in item:
                    snippets = item.get("snippets", [])
                    if isinstance(snippets, list) and len(snippets) > 0:
                        description = snippets[0] if isinstance(snippets[0], str) else str(snippets[0])
                
                result = {
                    "title": item.get("title", item.get("name", "")),
                    "description": description or item.get("snippet", item.get("text", "")),
                    "url": item.get("url", item.get("link", "")),
                    "source": item.get("source", ""),
                }
                
                # Add any additional fields
                if "score" in item:
                    result["score"] = item["score"]
                if "metadata" in item:
                    result["metadata"] = item["metadata"]
                
                results.append(result)
            except Exception as e:
                print(f"Error parsing search result: {e}")
                continue
        
        return results

# Global instance
_you_api_service: Optional[YouAPIService] = None

def get_you_api_service() -> YouAPIService:
    """Get or create the global You.com API service instance"""
    global _you_api_service
    if _you_api_service is None:
        _you_api_service = YouAPIService()
    return _you_api_service
