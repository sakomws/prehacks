"""Repository layer for data persistence."""
from repositories.document_repository import (
    DocumentRepository,
    InMemoryDocumentRepository
)

__all__ = [
    "DocumentRepository",
    "InMemoryDocumentRepository"
]
