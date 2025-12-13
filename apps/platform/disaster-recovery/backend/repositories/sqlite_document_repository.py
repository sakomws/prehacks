"""SQLite implementation of document repository."""
import json
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc

from database.config import SessionLocal, create_tables
from database.models import Document as DBDocument, Category as DBCategory, Contact as DBContact, Procedure as DBProcedure, ProcedureStep as DBProcedureStep, DocumentVersion as DBDocumentVersion
from models.document import DRDocument, Contact, Procedure, CriticalityLevel
from repositories.document_repository import DocumentRepository


class SQLiteDocumentRepository(DocumentRepository):
    """SQLite implementation of document repository."""
    
    def __init__(self):
        """Initialize the repository and create tables."""
        # Ensure db directory exists
        os.makedirs("db", exist_ok=True)
        create_tables()
    
    def _get_session(self) -> Session:
        """Get a database session."""
        return SessionLocal()
    
    def _get_or_create_category(self, session: Session, category_name: str) -> DBCategory:
        """Get or create a category."""
        category = session.query(DBCategory).filter(DBCategory.name == category_name).first()
        if not category:
            category = DBCategory(name=category_name)
            session.add(category)
            session.flush()  # Get the ID
        return category
    
    def _document_to_model(self, db_doc: DBDocument) -> DRDocument:
        """Convert database document to domain model."""
        # Convert contacts
        contacts = [
            Contact(
                name=contact.name,
                role=contact.role,
                phone=contact.phone,
                email=contact.email
            )
            for contact in db_doc.contacts
        ]
        
        # Convert procedures
        procedures = []
        for proc in db_doc.procedures:
            steps = [step.step_text for step in sorted(proc.steps, key=lambda s: s.order_index)]
            procedures.append(
                Procedure(
                    name=proc.name,
                    steps=steps,
                    estimated_duration=proc.estimated_duration
                )
            )
        
        # Convert categories
        categories = [cat.name for cat in db_doc.categories]
        
        return DRDocument(
            id=db_doc.id,
            title=db_doc.title,
            scenario=db_doc.scenario,
            procedures=procedures,
            contacts=contacts,
            rto=db_doc.rto,
            rpo=db_doc.rpo,
            categories=categories,
            criticality=CriticalityLevel(db_doc.criticality),
            created_at=db_doc.created_at,
            updated_at=db_doc.updated_at,
            version=db_doc.version
        )
    
    def _model_to_document(self, session: Session, document: DRDocument, db_doc: Optional[DBDocument] = None) -> DBDocument:
        """Convert domain model to database document."""
        if db_doc is None:
            db_doc = DBDocument()
        
        # Update basic fields
        db_doc.title = document.title
        db_doc.scenario = document.scenario
        db_doc.rto = document.rto
        db_doc.rpo = document.rpo
        db_doc.criticality = document.criticality.value
        db_doc.version = document.version
        
        if hasattr(document, 'id') and document.id:
            db_doc.id = document.id
        
        # Handle categories
        db_doc.categories.clear()
        for category_name in document.categories:
            category = self._get_or_create_category(session, category_name)
            db_doc.categories.append(category)
        
        # Handle contacts
        db_doc.contacts.clear()
        for contact in document.contacts:
            db_contact = DBContact(
                name=contact.name,
                role=contact.role,
                phone=contact.phone,
                email=contact.email
            )
            db_doc.contacts.append(db_contact)
        
        # Handle procedures
        db_doc.procedures.clear()
        for i, procedure in enumerate(document.procedures):
            db_procedure = DBProcedure(
                name=procedure.name,
                estimated_duration=procedure.estimated_duration,
                order_index=i
            )
            
            # Add steps
            for j, step_text in enumerate(procedure.steps):
                db_step = DBProcedureStep(
                    step_text=step_text,
                    order_index=j
                )
                db_procedure.steps.append(db_step)
            
            db_doc.procedures.append(db_procedure)
        
        return db_doc
    
    def save(self, document: DRDocument) -> DRDocument:
        """Save a document to the database."""
        session = self._get_session()
        try:
            db_doc = self._model_to_document(session, document)
            session.add(db_doc)
            session.commit()
            session.refresh(db_doc)
            
            # Load relationships
            db_doc = session.query(DBDocument).options(
                joinedload(DBDocument.categories),
                joinedload(DBDocument.contacts),
                joinedload(DBDocument.procedures).joinedload(DBProcedure.steps)
            ).filter(DBDocument.id == db_doc.id).first()
            
            return self._document_to_model(db_doc)
        finally:
            session.close()
    
    def find_by_id(self, document_id: str) -> Optional[DRDocument]:
        """Find a document by ID."""
        session = self._get_session()
        try:
            db_doc = session.query(DBDocument).options(
                joinedload(DBDocument.categories),
                joinedload(DBDocument.contacts),
                joinedload(DBDocument.procedures).joinedload(DBProcedure.steps)
            ).filter(DBDocument.id == document_id).first()
            
            if db_doc:
                return self._document_to_model(db_doc)
            return None
        finally:
            session.close()
    
    def find_by_category(self, category: str) -> List[DRDocument]:
        """Find documents by category."""
        session = self._get_session()
        try:
            db_docs = session.query(DBDocument).options(
                joinedload(DBDocument.categories),
                joinedload(DBDocument.contacts),
                joinedload(DBDocument.procedures).joinedload(DBProcedure.steps)
            ).join(DBDocument.categories).filter(DBCategory.name == category).all()
            
            return [self._document_to_model(doc) for doc in db_docs]
        finally:
            session.close()
    
    def find_by_criticality(self, criticality: CriticalityLevel) -> List[DRDocument]:
        """Find documents by criticality level."""
        session = self._get_session()
        try:
            db_docs = session.query(DBDocument).options(
                joinedload(DBDocument.categories),
                joinedload(DBDocument.contacts),
                joinedload(DBDocument.procedures).joinedload(DBProcedure.steps)
            ).filter(DBDocument.criticality == criticality.value).all()
            
            return [self._document_to_model(doc) for doc in db_docs]
        finally:
            session.close()
    
    def find_all(self) -> List[DRDocument]:
        """Find all documents."""
        session = self._get_session()
        try:
            db_docs = session.query(DBDocument).options(
                joinedload(DBDocument.categories),
                joinedload(DBDocument.contacts),
                joinedload(DBDocument.procedures).joinedload(DBProcedure.steps)
            ).all()
            
            return [self._document_to_model(doc) for doc in db_docs]
        finally:
            session.close()
    
    def find_all_sorted_by_criticality(self) -> List[DRDocument]:
        """Find all documents sorted by criticality level in descending order."""
        session = self._get_session()
        try:
            # Define criticality order
            criticality_order = {
                'critical': 4,
                'high': 3,
                'medium': 2,
                'low': 1
            }
            
            db_docs = session.query(DBDocument).options(
                joinedload(DBDocument.categories),
                joinedload(DBDocument.contacts),
                joinedload(DBDocument.procedures).joinedload(DBProcedure.steps)
            ).all()
            
            documents = [self._document_to_model(doc) for doc in db_docs]
            
            # Sort by criticality
            documents.sort(
                key=lambda doc: criticality_order.get(doc.criticality.value, 0),
                reverse=True
            )
            
            return documents
        finally:
            session.close()
    
    def update(self, document: DRDocument) -> Optional[DRDocument]:
        """Update an existing document."""
        session = self._get_session()
        try:
            db_doc = session.query(DBDocument).filter(DBDocument.id == document.id).first()
            if not db_doc:
                return None
            
            # Store previous version
            self._create_version(session, db_doc)
            
            # Update document
            db_doc = self._model_to_document(session, document, db_doc)
            db_doc.version += 1
            db_doc.updated_at = datetime.utcnow()
            
            session.commit()
            session.refresh(db_doc)
            
            # Load relationships
            db_doc = session.query(DBDocument).options(
                joinedload(DBDocument.categories),
                joinedload(DBDocument.contacts),
                joinedload(DBDocument.procedures).joinedload(DBProcedure.steps)
            ).filter(DBDocument.id == db_doc.id).first()
            
            return self._document_to_model(db_doc)
        finally:
            session.close()
    
    def delete(self, document_id: str) -> bool:
        """Delete a document."""
        session = self._get_session()
        try:
            db_doc = session.query(DBDocument).filter(DBDocument.id == document_id).first()
            if db_doc:
                session.delete(db_doc)
                session.commit()
                return True
            return False
        finally:
            session.close()
    
    def _create_version(self, session: Session, db_doc: DBDocument):
        """Create a version snapshot of the current document."""
        # Convert current document to JSON
        current_doc = self._document_to_model(db_doc)
        content = {
            "title": current_doc.title,
            "scenario": current_doc.scenario,
            "procedures": [
                {
                    "name": proc.name,
                    "steps": proc.steps,
                    "estimated_duration": proc.estimated_duration
                }
                for proc in current_doc.procedures
            ],
            "contacts": [
                {
                    "name": contact.name,
                    "role": contact.role,
                    "phone": contact.phone,
                    "email": contact.email
                }
                for contact in current_doc.contacts
            ],
            "rto": current_doc.rto,
            "rpo": current_doc.rpo,
            "categories": current_doc.categories,
            "criticality": current_doc.criticality.value
        }
        
        # Get previous version number
        latest_version = session.query(DBDocumentVersion).filter(
            DBDocumentVersion.document_id == db_doc.id
        ).order_by(desc(DBDocumentVersion.version_number)).first()
        
        previous_version_num = latest_version.version_number if latest_version else None
        
        # Create version record
        version = DBDocumentVersion(
            document_id=db_doc.id,
            version_number=db_doc.version,
            content=json.dumps(content),
            previous_version=previous_version_num
        )
        session.add(version)