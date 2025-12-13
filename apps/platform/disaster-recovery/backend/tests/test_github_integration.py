"""Unit tests for GitHub integration."""
import pytest
from unittest.mock import Mock, patch
from services.github_client import GitHubClient
from services.github_export import export_to_github
from models.document import DRDocument, Procedure, Contact
from datetime import datetime
from github import GithubException


def test_github_client_authentication_failure():
    """Test that GitHubClient raises ValueError on invalid token."""
    # Test with empty token
    with pytest.raises(ValueError, match="access token cannot be empty"):
        GitHubClient("")
    
    # Test with whitespace-only token
    with pytest.raises(ValueError, match="access token cannot be empty"):
        GitHubClient("   ")


def test_github_client_invalid_repository_specification():
    """Test that commit_file raises ValueError for invalid repository names."""
    with patch('backend.services.github_client.Github') as MockGithub:
        # Mock successful authentication
        mock_github_instance = Mock()
        mock_user = Mock()
        mock_user.login = "testuser"
        mock_github_instance.get_user.return_value = mock_user
        MockGithub.return_value = mock_github_instance
        
        client = GitHubClient("valid_token")
        
        # Test with empty repo name
        with pytest.raises(ValueError, match="Repository name cannot be empty"):
            client.commit_file("", "file.pdf", b"content", "message")
        
        # Test with repo name without slash
        with pytest.raises(ValueError, match="must be in format 'owner/repo'"):
            client.commit_file("invalid-repo-name", "file.pdf", b"content", "message")
        
        # Test with empty file path
        with pytest.raises(ValueError, match="File path cannot be empty"):
            client.commit_file("owner/repo", "", b"content", "message")
        
        # Test with empty commit message
        with pytest.raises(ValueError, match="Commit message cannot be empty"):
            client.commit_file("owner/repo", "file.pdf", b"content", "")
        
        # Test with empty branch
        with pytest.raises(ValueError, match="Branch name cannot be empty"):
            client.commit_file("owner/repo", "file.pdf", b"content", "message", branch="")


def test_github_client_commit_message_formatting():
    """Test that commit messages are properly formatted."""
    with patch('backend.services.github_client.Github') as MockGithub:
        # Mock successful authentication
        mock_github_instance = Mock()
        mock_user = Mock()
        mock_user.login = "testuser"
        mock_github_instance.get_user.return_value = mock_user
        
        # Mock repository and file operations
        mock_repo = Mock()
        mock_github_instance.get_repo.return_value = mock_repo
        
        # Mock file doesn't exist (will create new file)
        mock_repo.get_contents.side_effect = GithubException(404, "Not Found", {})
        
        # Mock successful file creation
        mock_commit = Mock()
        mock_commit.html_url = "https://github.com/owner/repo/commit/abc123"
        mock_commit.sha = "abc123"
        
        mock_content = Mock()
        mock_content.html_url = "https://github.com/owner/repo/blob/main/test.pdf"
        
        mock_repo.create_file.return_value = {
            'commit': mock_commit,
            'content': mock_content
        }
        
        MockGithub.return_value = mock_github_instance
        
        client = GitHubClient("valid_token")
        
        # Test commit with custom message
        custom_message = "Update DR document: Test Document (v1) - 2025-12-09"
        result = client.commit_file(
            repo_name="owner/repo",
            file_path="test.pdf",
            file_content=b"test content",
            commit_message=custom_message,
            branch="main"
        )
        
        # Verify the commit was created with the correct message
        mock_repo.create_file.assert_called_once()
        call_args = mock_repo.create_file.call_args
        assert call_args.kwargs['message'] == custom_message
        
        # Verify result structure
        assert 'commit_url' in result
        assert 'file_url' in result
        assert 'sha' in result


def test_export_to_github_generates_correct_file_path():
    """Test that export_to_github generates appropriate file paths."""
    # Create a test document
    doc = DRDocument(
        title="Database Server Failure",
        scenario="Primary database server becomes unavailable",
        procedures=[Procedure(name="Failover", steps=["Step 1"], estimated_duration=15)],
        contacts=[Contact(name="John", role="Admin", phone="+1-555-0100", email="john@example.com")],
        rto=60,
        rpo=15,
        category="Infrastructure",
        criticality="critical"
    )
    
    with patch('backend.services.github_export.GitHubClient') as MockGitHubClient:
        mock_client_instance = Mock()
        mock_client_instance.commit_file.return_value = {
            'commit_url': 'https://github.com/owner/repo/commit/abc123',
            'file_url': 'https://github.com/owner/repo/blob/main/test.pdf',
            'sha': 'abc123',
            'file_path': 'disaster-recovery/test.pdf',
            'branch': 'main'
        }
        MockGitHubClient.return_value = mock_client_instance
        
        # Export without custom file path
        result = export_to_github(
            document=doc,
            github_token="test_token",
            repo_name="owner/repo"
        )
        
        # Verify commit_file was called
        mock_client_instance.commit_file.assert_called_once()
        call_args = mock_client_instance.commit_file.call_args
        
        # Verify file path was generated
        file_path = call_args.kwargs['file_path']
        assert file_path.startswith('disaster-recovery/')
        assert file_path.endswith('.pdf')
        assert 'Database_Server_Failure' in file_path
        
        # Verify commit message contains document title and version
        commit_message = call_args.kwargs['commit_message']
        assert 'Database Server Failure' in commit_message
        assert 'v1' in commit_message


def test_export_to_github_with_custom_file_path():
    """Test that export_to_github respects custom file paths."""
    doc = DRDocument(
        title="Test Document",
        scenario="Test scenario",
        procedures=[Procedure(name="Test", steps=["Step 1"], estimated_duration=10)],
        contacts=[Contact(name="Test", role="Test", phone="+1-555-0100", email="test@example.com")],
        rto=30,
        rpo=10,
        category="Test",
        criticality="medium"
    )
    
    with patch('backend.services.github_export.GitHubClient') as MockGitHubClient:
        mock_client_instance = Mock()
        mock_client_instance.commit_file.return_value = {
            'commit_url': 'https://github.com/owner/repo/commit/abc123',
            'file_url': 'https://github.com/owner/repo/blob/main/custom/path/doc.pdf',
            'sha': 'abc123',
            'file_path': 'custom/path/doc.pdf',
            'branch': 'main'
        }
        MockGitHubClient.return_value = mock_client_instance
        
        # Export with custom file path
        custom_path = "custom/path/doc.pdf"
        result = export_to_github(
            document=doc,
            github_token="test_token",
            repo_name="owner/repo",
            file_path=custom_path
        )
        
        # Verify commit_file was called with custom path
        mock_client_instance.commit_file.assert_called_once()
        call_args = mock_client_instance.commit_file.call_args
        assert call_args.kwargs['file_path'] == custom_path


def test_export_to_github_with_custom_branch():
    """Test that export_to_github respects custom branch names."""
    doc = DRDocument(
        title="Test Document",
        scenario="Test scenario",
        procedures=[Procedure(name="Test", steps=["Step 1"], estimated_duration=10)],
        contacts=[Contact(name="Test", role="Test", phone="+1-555-0100", email="test@example.com")],
        rto=30,
        rpo=10,
        category="Test",
        criticality="medium"
    )
    
    with patch('backend.services.github_export.GitHubClient') as MockGitHubClient:
        mock_client_instance = Mock()
        mock_client_instance.commit_file.return_value = {
            'commit_url': 'https://github.com/owner/repo/commit/abc123',
            'file_url': 'https://github.com/owner/repo/blob/develop/test.pdf',
            'sha': 'abc123',
            'file_path': 'test.pdf',
            'branch': 'develop'
        }
        MockGitHubClient.return_value = mock_client_instance
        
        # Export to custom branch
        result = export_to_github(
            document=doc,
            github_token="test_token",
            repo_name="owner/repo",
            branch="develop"
        )
        
        # Verify commit_file was called with custom branch
        mock_client_instance.commit_file.assert_called_once()
        call_args = mock_client_instance.commit_file.call_args
        assert call_args.kwargs['branch'] == "develop"
