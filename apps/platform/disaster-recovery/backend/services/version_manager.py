"""Version manager for DR documents."""
from datetime import datetime
from typing import Dict, List, Optional
from models.document import DRDocument
from models.version import DocumentVersion


class VersionManager:
    """Manages versioning for DR documents."""
    
    def __init__(self):
        """Initialize the version manager with empty storage."""
        # Storage structure: {document_id: {version_number: DocumentVersion}}
        self._versions: Dict[str, Dict[int, DocumentVersion]] = {}
    
    def create_version(self, document: DRDocument, previous_version: Optional[int] = None) -> DocumentVersion:
        """
        Create a new version of a document.
        
        Args:
            document: The document to version
            previous_version: The version number this is based on (optional)
            
        Returns:
            The created DocumentVersion
        """
        doc_id = document.id
        
        # Initialize storage for this document if it doesn't exist
        if doc_id not in self._versions:
            self._versions[doc_id] = {}
        
        # Create the version
        version = DocumentVersion(
            document_id=doc_id,
            version=document.version,
            content=document,
            timestamp=datetime.now(),
            previous_version=previous_version
        )
        
        # Store the version
        self._versions[doc_id][document.version] = version
        
        return version
    
    def get_latest_version(self, document_id: str) -> Optional[DocumentVersion]:
        """
        Get the latest version of a document.
        
        Args:
            document_id: The ID of the document
            
        Returns:
            The latest DocumentVersion, or None if document has no versions
        """
        if document_id not in self._versions or not self._versions[document_id]:
            return None
        
        # Find the version with the highest version number
        latest_version_num = max(self._versions[document_id].keys())
        return self._versions[document_id][latest_version_num]
    
    def get_version(self, document_id: str, version_number: int) -> Optional[DocumentVersion]:
        """
        Get a specific version of a document.
        
        Args:
            document_id: The ID of the document
            version_number: The version number to retrieve
            
        Returns:
            The DocumentVersion, or None if not found
        """
        if document_id not in self._versions:
            return None
        
        return self._versions[document_id].get(version_number)
    
    def list_versions(self, document_id: str) -> List[DocumentVersion]:
        """
        List all versions of a document in chronological order.
        
        Args:
            document_id: The ID of the document
            
        Returns:
            List of DocumentVersions sorted by timestamp (oldest first)
        """
        if document_id not in self._versions:
            return []
        
        versions = list(self._versions[document_id].values())
        # Sort by timestamp in chronological order
        return sorted(versions, key=lambda v: v.timestamp)
    
    def revert_to_version(self, document_id: str, version_number: int) -> Optional[DRDocument]:
        """
        Revert a document to a previous version by creating a new version with old content.
        
        Args:
            document_id: The ID of the document
            version_number: The version number to revert to
            
        Returns:
            A new DRDocument with content from the specified version and incremented version number,
            or None if the specified version doesn't exist
        """
        # Get the version to revert to
        old_version = self.get_version(document_id, version_number)
        if old_version is None:
            return None
        
        # Get the latest version to determine the new version number
        latest_version = self.get_latest_version(document_id)
        if latest_version is None:
            return None
        
        # Create a new document with content from the old version
        # but with a new version number
        old_content = old_version.content
        new_version_number = latest_version.version + 1
        
        # Create new document with updated version and timestamp
        new_document = DRDocument(
            id=old_content.id,
            title=old_content.title,
            scenario=old_content.scenario,
            procedures=old_content.procedures,
            contacts=old_content.contacts,
            rto=old_content.rto,
            rpo=old_content.rpo,
            categories=old_content.categories,
            criticality=old_content.criticality,
            created_at=old_content.created_at,
            updated_at=datetime.now(),
            version=new_version_number
        )
        
        # Create a new version entry
        self.create_version(new_document, previous_version=latest_version.version)
        
        return new_document
