"""Document models for disaster recovery documentation."""
from datetime import datetime
from typing import List, Literal
from pydantic import BaseModel, Field
from uuid import uuid4


class Contact(BaseModel):
    """Contact information for disaster recovery personnel."""
    name: str
    role: str
    phone: str
    email: str


class Procedure(BaseModel):
    """Recovery procedure with steps."""
    name: str
    steps: List[str]
    estimated_duration: int = Field(description="Estimated duration in minutes")


CriticalityLevel = Literal["critical", "high", "medium", "low"]


class DRDocument(BaseModel):
    """Disaster recovery document model."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    scenario: str
    procedures: List[Procedure]
    contacts: List[Contact]
    rto: int = Field(description="Recovery Time Objective in minutes", gt=0)
    rpo: int = Field(description="Recovery Point Objective in minutes", gt=0)
    categories: List[str] = Field(default_factory=list, description="Document categories")
    criticality: CriticalityLevel
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    version: int = Field(default=1, ge=1)
    
    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "title": "Database Server Failure",
                "scenario": "Primary database server becomes unavailable",
                "procedures": [
                    {
                        "name": "Failover to Secondary",
                        "steps": ["Check secondary status", "Initiate failover"],
                        "estimated_duration": 15
                    }
                ],
                "contacts": [
                    {
                        "name": "John Doe",
                        "role": "Database Administrator",
                        "phone": "+1-555-0100",
                        "email": "john.doe@example.com"
                    }
                ],
                "rto": 60,
                "rpo": 15,
                "categories": ["Infrastructure"],
                "criticality": "critical"
            }
        }
