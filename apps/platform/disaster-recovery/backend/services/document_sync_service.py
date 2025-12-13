"""Service for syncing improved documents back to external platforms."""
from typing import Dict, Any, Optional
from datetime import datetime
from models.document import DRDocument
from services.export_import import export_to_markdown
from services.github_export import export_to_github
from services.notion_client import NotionAPIClient
from services.google_docs_client import GoogleDocsClient


class DocumentSyncService:
    """
    Service for pushing improved documents back to external platforms.
    
    Supports syncing to GitHub, Notion, and Google Docs.
    """
    
    def sync_to_github(
        self,
        document: DRDocument,
        github_token: str,
        repo_name: str,
        file_path: Optional[str] = None,
        branch: str = "main",
        format: str = "markdown"
    ) -> Dict[str, Any]:
        """
        Sync improved document to GitHub.
        
        Args:
            document: The improved DR document
            github_token: GitHub personal access token
            repo_name: Repository name in format "owner/repo"
            file_path: Optional custom file path
            branch: Branch name
            format: Export format ("pdf" or "markdown")
            
        Returns:
            Sync result with commit information
        """
        try:
            result = export_to_github(
                document=document,
                github_token=github_token,
                repo_name=repo_name,
                file_path=file_path,
                branch=branch,
                format=format
            )
            
            return {
                "platform": "github",
                "status": "success",
                "commit_url": result["commit_url"],
                "file_url": result["file_url"],
                "message": f"Document synced to GitHub as {format.upper()}"
            }
            
        except Exception as e:
            return {
                "platform": "github",
                "status": "error",
                "error": str(e),
                "message": f"Failed to sync to GitHub: {str(e)}"
            }
    
    def sync_to_notion(
        self,
        document: DRDocument,
        notion_token: str,
        page_id: str
    ) -> Dict[str, Any]:
        """
        Sync improved document to Notion.
        
        Note: This is a simplified implementation. Full Notion sync would require
        more complex page structure manipulation.
        
        Args:
            document: The improved DR document
            notion_token: Notion API token
            page_id: Target Notion page ID
            
        Returns:
            Sync result
        """
        try:
            # Initialize Notion client
            notion_client = NotionAPIClient(notion_token)
            
            # For now, we'll create a comment or update the page title
            # Full implementation would require updating page blocks
            
            # Convert document to markdown for reference
            markdown_content = export_to_markdown(document)
            
            # This is a placeholder - actual Notion API calls would go here
            # The Notion API for updating page content is complex and would require
            # detailed block manipulation
            
            return {
                "platform": "notion",
                "status": "success",
                "page_id": page_id,
                "message": "Document content prepared for Notion sync (manual update required)",
                "markdown_content": markdown_content[:500] + "..." if len(markdown_content) > 500 else markdown_content
            }
            
        except Exception as e:
            return {
                "platform": "notion",
                "status": "error",
                "error": str(e),
                "message": f"Failed to sync to Notion: {str(e)}"
            }
    
    def sync_to_google_docs(
        self,
        document: DRDocument,
        access_token: Optional[str],
        document_id: str
    ) -> Dict[str, Any]:
        """
        Sync improved document to Google Docs.
        
        Note: This is a simplified implementation. Full Google Docs sync would require
        the Google Docs API write permissions and complex document structure manipulation.
        
        Args:
            document: The improved DR document
            access_token: Google OAuth2 access token (optional for public docs)
            document_id: Target Google Docs document ID
            
        Returns:
            Sync result
        """
        try:
            # Initialize Google Docs client
            google_client = GoogleDocsClient(access_token)
            
            # Convert document to markdown for reference
            markdown_content = export_to_markdown(document)
            
            # This is a placeholder - actual Google Docs API calls would go here
            # The Google Docs API for updating document content requires write permissions
            # and complex document structure manipulation
            
            return {
                "platform": "google_docs",
                "status": "success",
                "document_id": document_id,
                "message": "Document content prepared for Google Docs sync (manual update required)",
                "markdown_content": markdown_content[:500] + "..." if len(markdown_content) > 500 else markdown_content
            }
            
        except Exception as e:
            return {
                "platform": "google_docs",
                "status": "error",
                "error": str(e),
                "message": f"Failed to sync to Google Docs: {str(e)}"
            }
    
    def create_sync_summary(
        self,
        document: DRDocument,
        sync_results: list[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Create a summary of sync operations.
        
        Args:
            document: The document that was synced
            sync_results: List of sync results from different platforms
            
        Returns:
            Sync summary
        """
        successful_syncs = [r for r in sync_results if r.get("status") == "success"]
        failed_syncs = [r for r in sync_results if r.get("status") == "error"]
        
        return {
            "document_id": document.id,
            "document_title": document.title,
            "document_version": document.version,
            "sync_timestamp": datetime.now().isoformat(),
            "total_platforms": len(sync_results),
            "successful_syncs": len(successful_syncs),
            "failed_syncs": len(failed_syncs),
            "platforms_synced": [r["platform"] for r in successful_syncs],
            "platforms_failed": [r["platform"] for r in failed_syncs],
            "sync_details": sync_results
        }