"""SQLAlchemy database models."""
from datetime import datetime
from typing import List
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship, Mapped, mapped_column
from database.config import Base
import uuid


# Association table for document categories (many-to-many)
document_categories = Table(
    'document_categories',
    Base.metadata,
    Column('document_id', String, ForeignKey('documents.id'), primary_key=True),
    Column('category_id', String, ForeignKey('categories.id'), primary_key=True)
)


class Category(Base):
    """Category model."""
    __tablename__ = "categories"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    documents: Mapped[List["Document"]] = relationship(
        "Document", 
        secondary=document_categories, 
        back_populates="categories"
    )


class Contact(Base):
    """Contact model."""
    __tablename__ = "contacts"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String, ForeignKey('documents.id'), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="contacts")


class Procedure(Base):
    """Procedure model."""
    __tablename__ = "procedures"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String, ForeignKey('documents.id'), nullable=False)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    estimated_duration: Mapped[int] = mapped_column(Integer, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="procedures")
    steps: Mapped[List["ProcedureStep"]] = relationship(
        "ProcedureStep", 
        back_populates="procedure",
        cascade="all, delete-orphan",
        order_by="ProcedureStep.order_index"
    )


class ProcedureStep(Base):
    """Procedure step model."""
    __tablename__ = "procedure_steps"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    procedure_id: Mapped[str] = mapped_column(String, ForeignKey('procedures.id'), nullable=False)
    step_text: Mapped[str] = mapped_column(Text, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Relationships
    procedure: Mapped["Procedure"] = relationship("Procedure", back_populates="steps")


class Document(Base):
    """Document model."""
    __tablename__ = "documents"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    scenario: Mapped[str] = mapped_column(Text, nullable=False)
    rto: Mapped[int] = mapped_column(Integer, nullable=False)  # Recovery Time Objective in minutes
    rpo: Mapped[int] = mapped_column(Integer, nullable=False)  # Recovery Point Objective in minutes
    criticality: Mapped[str] = mapped_column(String(20), nullable=False)  # critical, high, medium, low
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    categories: Mapped[List["Category"]] = relationship(
        "Category", 
        secondary=document_categories, 
        back_populates="documents"
    )
    contacts: Mapped[List["Contact"]] = relationship(
        "Contact", 
        back_populates="document",
        cascade="all, delete-orphan"
    )
    procedures: Mapped[List["Procedure"]] = relationship(
        "Procedure", 
        back_populates="document",
        cascade="all, delete-orphan",
        order_by="Procedure.order_index"
    )
    versions: Mapped[List["DocumentVersion"]] = relationship(
        "DocumentVersion", 
        back_populates="document",
        cascade="all, delete-orphan"
    )


class DocumentVersion(Base):
    """Document version model."""
    __tablename__ = "document_versions"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String, ForeignKey('documents.id'), nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)  # JSON serialized document content
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    previous_version: Mapped[int] = mapped_column(Integer, nullable=True)
    
    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="versions")