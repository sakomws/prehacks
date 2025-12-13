"""GitHub export service for DR documents."""
from typing import Dict, Literal
from datetime import datetime
from models.document import DRDocument
from services.pdf_generator import generate_pdf
from services.export_import import export_to_markdown
from services.github_client import GitHubClient

ExportFormat = Literal["pdf", "markdown"]


def export_to_github(
    document: DRDocument,
    github_token: str,
    repo_name: str,
    file_path: str = None,
    branch: str = "main",
    format: ExportFormat = "pdf"
) -> Dict[str, str]:
    """
    Export a DR document to GitHub as PDF or Markdown.
    
    Args:
        document: The DR document to export
        github_token: GitHub personal access token
        repo_name: Repository name in format "owner/repo"
        file_path: Optional custom file path. If not provided, generates one from document title
        branch: Branch name (default: "main")
        format: Export format - "pdf" or "markdown" (default: "pdf")
        
    Returns:
        Dictionary containing:
            - commit_url: URL to the commit
            - file_url: URL to the file in the repository
            - sha: SHA of the commit
            - file_path: Path where the file was stored
            - branch: Branch where the file was committed
            - format: Export format used
            
    Raises:
        ValueError: If parameters are invalid
        GithubException: If GitHub API call fails
    """
    # Generate content based on format
    if format == "pdf":
        file_content = generate_pdf(document)
        file_extension = "pdf"
        content_type = "application/pdf"
    elif format == "markdown":
        file_content = export_to_markdown(document).encode('utf-8')
        file_extension = "md"
        content_type = "text/markdown"
    else:
        raise ValueError(f"Unsupported export format: {format}")
    
    # Generate file path if not provided
    if not file_path:
        # Create a safe filename from the document title
        safe_title = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in document.title)
        safe_title = safe_title.replace(' ', '_')
        timestamp = datetime.now().strftime("%Y%m%d")
        file_path = f"disaster-recovery/{safe_title}_{timestamp}.{file_extension}"
    
    # Create commit message
    commit_message = f"Update DR document: {document.title} (v{document.version}) - {format.upper()} export - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    
    # Initialize GitHub client
    github_client = GitHubClient(github_token)
    
    # Commit the file to GitHub
    result = github_client.commit_file(
        repo_name=repo_name,
        file_path=file_path,
        file_content=file_content,
        commit_message=commit_message,
        branch=branch
    )
    
    # Add format to result
    result["format"] = format
    
    return result
