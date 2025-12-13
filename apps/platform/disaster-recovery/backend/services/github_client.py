"""GitHub API client for committing files to repositories."""
from typing import Optional, Dict
from github import Github, GithubException
from datetime import datetime


class GitHubClient:
    """Client for interacting with GitHub API."""
    
    def __init__(self, access_token: str):
        """
        Initialize GitHub client with access token.
        
        Args:
            access_token: GitHub personal access token
            
        Raises:
            ValueError: If access token is empty or invalid
        """
        if not access_token or not access_token.strip():
            raise ValueError("GitHub access token cannot be empty")
        
        self.access_token = access_token
        self.github = Github(access_token)
        
        # Verify authentication
        try:
            self.github.get_user().login
        except GithubException as e:
            raise ValueError(f"Invalid GitHub access token: {str(e)}")
    
    def commit_file(
        self,
        repo_name: str,
        file_path: str,
        file_content: bytes,
        commit_message: str,
        branch: str = "main"
    ) -> Dict[str, str]:
        """
        Commit a file to a GitHub repository.
        
        Args:
            repo_name: Repository name in format "owner/repo"
            file_path: Path where the file should be stored in the repository
            file_content: Content of the file as bytes
            commit_message: Commit message
            branch: Branch name (default: "main")
            
        Returns:
            Dictionary containing:
                - commit_url: URL to the commit
                - file_url: URL to the file in the repository
                - sha: SHA of the commit
                
        Raises:
            ValueError: If repository name is invalid or parameters are missing
            GithubException: If GitHub API call fails
        """
        # Validate inputs
        if not repo_name or not repo_name.strip():
            raise ValueError("Repository name cannot be empty")
        
        if "/" not in repo_name:
            raise ValueError("Repository name must be in format 'owner/repo'")
        
        if not file_path or not file_path.strip():
            raise ValueError("File path cannot be empty")
        
        if not commit_message or not commit_message.strip():
            raise ValueError("Commit message cannot be empty")
        
        if not branch or not branch.strip():
            raise ValueError("Branch name cannot be empty")
        
        try:
            # Get the repository
            repo = self.github.get_repo(repo_name)
            
            # Check if file already exists
            try:
                existing_file = repo.get_contents(file_path, ref=branch)
                # File exists, update it
                result = repo.update_file(
                    path=file_path,
                    message=commit_message,
                    content=file_content,
                    sha=existing_file.sha,
                    branch=branch
                )
            except GithubException as e:
                if e.status == 404:
                    # File doesn't exist, create it
                    result = repo.create_file(
                        path=file_path,
                        message=commit_message,
                        content=file_content,
                        branch=branch
                    )
                else:
                    raise
            
            # Extract commit information
            commit = result['commit']
            content = result['content']
            
            return {
                'commit_url': commit.html_url,
                'file_url': content.html_url,
                'sha': commit.sha,
                'file_path': file_path,
                'branch': branch
            }
            
        except GithubException as e:
            if e.status == 404:
                raise ValueError(f"Repository '{repo_name}' not found or not accessible")
            elif e.status == 401:
                raise ValueError("Authentication failed - invalid or expired access token")
            elif e.status == 403:
                raise ValueError("Permission denied - token may not have required permissions")
            else:
                raise ValueError(f"GitHub API error: {str(e)}")
    
    def verify_repository_access(self, repo_name: str) -> bool:
        """
        Verify that the client has access to a repository.
        
        Args:
            repo_name: Repository name in format "owner/repo"
            
        Returns:
            True if repository is accessible, False otherwise
        """
        try:
            self.github.get_repo(repo_name)
            return True
        except GithubException:
            return False
