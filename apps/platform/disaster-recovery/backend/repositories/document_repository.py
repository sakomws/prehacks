"""Document repository interface and implementation."""
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional
from models.document import DRDocument, CriticalityLevel
from services.version_manager import VersionManager


class DocumentRepository(ABC):
    """Abstract base class for document repository."""
    
    @abstractmethod
    def save(self, document: DRDocument) -> DRDocument:
        """
        Save a new document to the repository.
        
        Args:
            document: The document to save
            
        Returns:
            The saved document with generated ID
        """
        pass
    
    @abstractmethod
    def find_by_id(self, document_id: str) -> Optional[DRDocument]:
        """
        Find a document by its ID.
        
        Args:
            document_id: The unique identifier of the document
            
        Returns:
            The document if found, None otherwise
        """
        pass
    
    @abstractmethod
    def find_by_category(self, category: str) -> List[DRDocument]:
        """
        Find all documents in a specific category.
        
        Args:
            category: The category to filter by
            
        Returns:
            List of documents in the category
        """
        pass
    
    @abstractmethod
    def find_by_criticality(self, criticality: CriticalityLevel) -> List[DRDocument]:
        """
        Find all documents with a specific criticality level.
        
        Args:
            criticality: The criticality level to filter by
            
        Returns:
            List of documents with the criticality level
        """
        pass
    
    @abstractmethod
    def find_all(self) -> List[DRDocument]:
        """
        Retrieve all documents from the repository.
        
        Returns:
            List of all documents
        """
        pass
    
    @abstractmethod
    def find_all_sorted_by_criticality(self) -> List[DRDocument]:
        """
        Retrieve all documents sorted by criticality level in descending order.
        Order: critical, high, medium, low
        
        Returns:
            List of all documents sorted by criticality
        """
        pass
    
    @abstractmethod
    def update(self, document: DRDocument) -> Optional[DRDocument]:
        """
        Update an existing document.
        
        Args:
            document: The document with updated data
            
        Returns:
            The updated document if found, None otherwise
        """
        pass
    
    @abstractmethod
    def delete(self, document_id: str) -> bool:
        """
        Delete a document by its ID.
        
        Args:
            document_id: The unique identifier of the document to delete
            
        Returns:
            True if document was deleted, False if not found
        """
        pass



class InMemoryDocumentRepository(DocumentRepository):
    """In-memory implementation of document repository using a dictionary."""
    
    def __init__(self, version_manager: Optional[VersionManager] = None):
        """Initialize the repository with an empty storage.
        
        Args:
            version_manager: Optional version manager for tracking document versions
        """
        self._storage: dict[str, DRDocument] = {}
        self._version_manager = version_manager or VersionManager()
    
    def save(self, document: DRDocument) -> DRDocument:
        """
        Save a new document to the repository.
        
        Args:
            document: The document to save
            
        Returns:
            The saved document with generated ID
        """
        # Store the document using its ID as the key
        self._storage[document.id] = document
        
        # Create initial version
        self._version_manager.create_version(document, previous_version=None)
        
        return document
    
    def find_by_id(self, document_id: str) -> Optional[DRDocument]:
        """
        Find a document by its ID.
        
        Args:
            document_id: The unique identifier of the document
            
        Returns:
            The document if found, None otherwise
        """
        return self._storage.get(document_id)
    
    def find_by_category(self, category: str) -> List[DRDocument]:
        """
        Find all documents in a specific category.
        
        Args:
            category: The category to filter by
            
        Returns:
            List of documents in the category
        """
        return [doc for doc in self._storage.values() if category in doc.categories]
    
    def find_by_criticality(self, criticality: CriticalityLevel) -> List[DRDocument]:
        """
        Find all documents with a specific criticality level.
        
        Args:
            criticality: The criticality level to filter by
            
        Returns:
            List of documents with the criticality level
        """
        return [doc for doc in self._storage.values() if doc.criticality == criticality]
    
    def find_all(self) -> List[DRDocument]:
        """
        Retrieve all documents from the repository.
        
        Returns:
            List of all documents
        """
        return list(self._storage.values())
    
    def find_all_sorted_by_criticality(self) -> List[DRDocument]:
        """
        Retrieve all documents sorted by criticality level in descending order.
        Order: critical, high, medium, low
        
        Returns:
            List of all documents sorted by criticality
        """
        # Define criticality order (higher value = higher criticality)
        criticality_order = {
            "critical": 4,
            "high": 3,
            "medium": 2,
            "low": 1
        }
        
        # Sort documents by criticality in descending order
        documents = list(self._storage.values())
        return sorted(documents, key=lambda doc: criticality_order[doc.criticality], reverse=True)
    
    def update(self, document: DRDocument) -> Optional[DRDocument]:
        """
        Update an existing document.
        
        Args:
            document: The document with updated data
            
        Returns:
            The updated document if found, None otherwise
        """
        if document.id not in self._storage:
            return None
        
        # Get the current document to track previous version
        current_doc = self._storage[document.id]
        previous_version_num = current_doc.version
        
        # Increment version number and update timestamp
        updated_doc = DRDocument(
            id=document.id,
            title=document.title,
            scenario=document.scenario,
            procedures=document.procedures,
            contacts=document.contacts,
            rto=document.rto,
            rpo=document.rpo,
            categories=document.categories,
            criticality=document.criticality,
            created_at=current_doc.created_at,
            updated_at=datetime.now(),
            version=previous_version_num + 1
        )
        
        # Store the updated document
        self._storage[document.id] = updated_doc
        
        # Create new version in version manager
        self._version_manager.create_version(updated_doc, previous_version=previous_version_num)
        
        return updated_doc
    
    def delete(self, document_id: str) -> bool:
        """
        Delete a document by its ID.
        
        Args:
            document_id: The unique identifier of the document to delete
            
        Returns:
            True if document was deleted, False if not found
        """
        if document_id in self._storage:
            del self._storage[document_id]
            return True
        return False
    
    def get_version_manager(self) -> VersionManager:
        """
        Get the version manager instance.
        
        Returns:
            The VersionManager instance used by this repository
        """
        return self._version_manager
