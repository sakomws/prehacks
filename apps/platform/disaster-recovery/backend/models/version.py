"""Version model for document versioning."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from models.document import DRDocument


class DocumentVersion(BaseModel):
    """Represents a specific version of a DR document."""
    document_id: str
    version: int = Field(ge=1)
    content: DRDocument
    timestamp: datetime = Field(default_factory=datetime.now)
    previous_version: Optional[int] = None
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "document_id": "123e4567-e89b-12d3-a456-426614174000",
                "version": 2,
                "timestamp": "2024-01-15T10:30:00",
                "previous_version": 1
            }
        }
