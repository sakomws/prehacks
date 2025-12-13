"""API routes for disaster recovery documentation system."""
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from api.models import (
    CreateDocumentRequest,
    UpdateDocumentRequest,
    NotionImportRequest,
    GoogleDocsImportRequest,
    GitHubExportRequest,
    AIReviewRequest,
    AIReviewResponse,
    DocumentSyncRequest,
    DocumentSyncResponse,
    DocumentResponse,
    DocumentListResponse,
    ValidationResponse,
    ValidationIssueResponse,
    VersionResponse,
    VersionListResponse,
    GitHubExportResponse,
    ExportResponse,
    ErrorResponse,
    SuccessResponse,
    ContactResponse,
    ProcedureResponse,
)
from models.document import DRDocument, Contact, Procedure, CriticalityLevel
from services.document_service import DocumentService
from services.notion_integration import NotionIntegrationService
from services.google_docs_integration import GoogleDocsIntegrationService
from services.github_export import export_to_github
from services.ai_review_service import AIReviewService, AIReviewError
from services.document_sync_service import DocumentSyncService
from services.notion_client import NotionAPIError
from services.notion_parser import NotionParseError
from services.google_docs_client import GoogleDocsAPIError
from services.google_docs_parser import GoogleDocsParseError


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/documents", tags=["documents"])

# Initialize service with SQLite repository
from repositories.sqlite_document_repository import SQLiteDocumentRepository

sqlite_repository = SQLiteDocumentRepository()
document_service = DocumentService(repository=sqlite_repository)


# Helper functions

def convert_to_document_response(doc: DRDocument) -> DocumentResponse:
    """Convert DRDocument to DocumentResponse."""
    return DocumentResponse(
        id=doc.id,
        title=doc.title,
        scenario=doc.scenario,
        procedures=[
            ProcedureResponse(
                name=p.name,
                steps=p.steps,
                estimated_duration=p.estimated_duration
            ) for p in doc.procedures
        ],
        contacts=[
            ContactResponse(
                name=c.name,
                role=c.role,
                phone=c.phone,
                email=c.email
            ) for c in doc.contacts
        ],
        rto=doc.rto,
        rpo=doc.rpo,
        categories=doc.categories,
        criticality=doc.criticality,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        version=doc.version
    )


def convert_request_to_document(req: CreateDocumentRequest) -> DRDocument:
    """Convert CreateDocumentRequest to DRDocument."""
    return DRDocument(
        title=req.title,
        scenario=req.scenario,
        procedures=[
            Procedure(
                name=p.name,
                steps=p.steps,
                estimated_duration=p.estimated_duration
            ) for p in req.procedures
        ],
        contacts=[
            Contact(
                name=c.name,
                role=c.role,
                phone=c.phone,
                email=c.email
            ) for c in req.contacts
        ],
        rto=req.rto,
        rpo=req.rpo,
        categories=req.categories,
        criticality=req.criticality
    )


# Endpoints

@router.post(
    "",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new DR document",
    responses={
        201: {"description": "Document created successfully"},
        400: {"model": ErrorResponse, "description": "Invalid request data"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def create_document(request: CreateDocumentRequest) -> DocumentResponse:
    """
    Create a new disaster recovery document.
    
    Args:
        request: Document creation request with all required fields
        
    Returns:
        The created document with generated ID and version
    """
    try:
        logger.info(f"Creating new document: {request.title}")
        document = convert_request_to_document(request)
        created_doc = document_service.create_document(document)
        logger.info(f"Document created successfully: {created_doc.id}")
        return convert_to_document_response(created_doc)
    except ValueError as e:
        logger.error(f"Validation error creating document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create document"
        )


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Get a DR document by ID",
    responses={
        200: {"description": "Document retrieved successfully"},
        404: {"model": ErrorResponse, "description": "Document not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def get_document(
    document_id: str,
    version: Optional[int] = Query(None, description="Specific version number")
) -> DocumentResponse:
    """
    Retrieve a disaster recovery document by ID.
    
    Args:
        document_id: Unique identifier of the document
        version: Optional version number (defaults to latest)
        
    Returns:
        The requested document
    """
    try:
        logger.info(f"Retrieving document: {document_id}, version: {version}")
        document = document_service.get_document(document_id, version)
        
        if not document:
            logger.warning(f"Document not found: {document_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found: {document_id}"
            )
        
        return convert_to_document_response(document)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve document"
        )


@router.put(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Update a DR document",
    responses={
        200: {"description": "Document updated successfully"},
        404: {"model": ErrorResponse, "description": "Document not found"},
        400: {"model": ErrorResponse, "description": "Invalid request data"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def update_document(
    document_id: str,
    request: UpdateDocumentRequest
) -> DocumentResponse:
    """
    Update an existing disaster recovery document.
    
    Creates a new version while preserving the previous version.
    
    Args:
        document_id: Unique identifier of the document
        request: Document update request with fields to update
        
    Returns:
        The updated document with incremented version
    """
    try:
        logger.info(f"Updating document: {document_id}")
        
        # Get existing document
        existing_doc = document_service.get_document(document_id)
        if not existing_doc:
            logger.warning(f"Document not found: {document_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found: {document_id}"
            )
        
        # Update fields
        update_data = existing_doc.model_dump()
        if request.title is not None:
            update_data["title"] = request.title
        if request.scenario is not None:
            update_data["scenario"] = request.scenario
        if request.procedures is not None:
            update_data["procedures"] = [
                Procedure(
                    name=p.name,
                    steps=p.steps,
                    estimated_duration=p.estimated_duration
                ) for p in request.procedures
            ]
        if request.contacts is not None:
            update_data["contacts"] = [
                Contact(
                    name=c.name,
                    role=c.role,
                    phone=c.phone,
                    email=c.email
                ) for c in request.contacts
            ]
        if request.rto is not None:
            update_data["rto"] = request.rto
        if request.rpo is not None:
            update_data["rpo"] = request.rpo
        if request.categories is not None:
            update_data["categories"] = request.categories
        if request.criticality is not None:
            update_data["criticality"] = request.criticality
        
        # Create updated document
        updated_doc = DRDocument(**update_data)
        result = document_service.update_document(updated_doc)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update document"
            )
        
        logger.info(f"Document updated successfully: {document_id}")
        return convert_to_document_response(result)
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update document"
        )


@router.delete(
    "/{document_id}",
    response_model=SuccessResponse,
    summary="Delete a DR document",
    responses={
        200: {"description": "Document deleted successfully"},
        404: {"model": ErrorResponse, "description": "Document not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def delete_document(document_id: str) -> SuccessResponse:
    """
    Delete a disaster recovery document.
    
    Args:
        document_id: Unique identifier of the document
        
    Returns:
        Success message
    """
    try:
        logger.info(f"Deleting document: {document_id}")
        success = document_service.delete_document(document_id)
        
        if not success:
            logger.warning(f"Document not found: {document_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found: {document_id}"
            )
        
        logger.info(f"Document deleted successfully: {document_id}")
        return SuccessResponse(message="Document deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )


@router.delete(
    "/bulk",
    response_model=SuccessResponse,
    summary="Delete multiple DR documents",
    responses={
        200: {"description": "Documents deleted successfully"},
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def bulk_delete_documents(document_ids: List[str]) -> SuccessResponse:
    """
    Delete multiple disaster recovery documents.
    
    Args:
        document_ids: List of document IDs to delete
        
    Returns:
        Success message with deletion results
    """
    try:
        if not document_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No document IDs provided"
            )
        
        logger.info(f"Bulk deleting {len(document_ids)} documents")
        
        success_count = 0
        failed_ids = []
        
        for document_id in document_ids:
            try:
                success = document_service.delete_document(document_id)
                if success:
                    success_count += 1
                else:
                    failed_ids.append(document_id)
            except Exception as e:
                logger.error(f"Failed to delete document {document_id}: {str(e)}")
                failed_ids.append(document_id)
        
        message = f"Successfully deleted {success_count} document(s)"
        if failed_ids:
            message += f", failed to delete {len(failed_ids)} document(s)"
        
        logger.info(f"Bulk delete completed: {message}")
        return SuccessResponse(
            message=message,
            data={
                "deleted_count": success_count,
                "failed_count": len(failed_ids),
                "failed_ids": failed_ids
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk delete: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete documents"
        )


@router.post(
    "/{document_id}/duplicate",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Duplicate a DR document",
    responses={
        201: {"description": "Document duplicated successfully"},
        404: {"model": ErrorResponse, "description": "Document not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def duplicate_document(document_id: str) -> DocumentResponse:
    """
    Create a duplicate of an existing disaster recovery document.
    
    The duplicate will have:
    - A new unique ID
    - Title prefixed with "Copy of "
    - New creation and update timestamps
    - Version reset to 1
    - All other content identical to the original
    
    Args:
        document_id: Unique identifier of the document to duplicate
        
    Returns:
        The newly created duplicate document
    """
    try:
        logger.info(f"Duplicating document: {document_id}")
        
        # Duplicate the document using the service
        created_doc = document_service.duplicate_document(document_id)
        if not created_doc:
            logger.warning(f"Document not found for duplication: {document_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found: {document_id}"
            )
        logger.info(f"Document duplicated successfully: {document_id} -> {created_doc.id}")
        
        return convert_to_document_response(created_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error duplicating document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to duplicate document"
        )


@router.get(
    "",
    response_model=DocumentListResponse,
    summary="List or search DR documents",
    responses={
        200: {"description": "Documents retrieved successfully"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def list_documents(
    query: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    criticality: Optional[CriticalityLevel] = Query(None, description="Filter by criticality"),
    sort_by_criticality: bool = Query(False, description="Sort by criticality level")
) -> DocumentListResponse:
    """
    List or search disaster recovery documents.
    
    Args:
        query: Optional search query for keyword search
        category: Optional category filter
        criticality: Optional criticality filter
        sort_by_criticality: Sort results by criticality level
        
    Returns:
        List of matching documents
    """
    try:
        logger.info(f"Listing documents - query: {query}, category: {category}, criticality: {criticality}")
        
        if query:
            # Perform search
            documents = document_service.search_documents(query)
        else:
            # List with filters
            documents = document_service.list_documents(
                category=category,
                criticality=criticality,
                sort_by_criticality=sort_by_criticality
            )
        
        response_docs = [convert_to_document_response(doc) for doc in documents]
        return DocumentListResponse(documents=response_docs, total=len(response_docs))
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list documents"
        )


@router.post(
    "/import/notion",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Import a DR document from Notion",
    responses={
        201: {"description": "Document imported successfully"},
        400: {"model": ErrorResponse, "description": "Invalid request or import failed"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def import_from_notion(request: NotionImportRequest) -> DocumentResponse:
    """
    Import a disaster recovery document from Notion.
    
    Args:
        request: Notion import request with page URL/ID and API token
        
    Returns:
        The imported document
    """
    try:
        logger.info(f"Importing from Notion - URL: {request.page_url}, ID: {request.page_id}")
        
        if not request.page_url and not request.page_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either page_url or page_id must be provided"
            )
        
        # Initialize Notion service
        notion_service = NotionIntegrationService(request.api_token)
        
        # Import document
        if request.page_url:
            document = notion_service.import_from_url(
                request.page_url,
                categories=request.categories,
                criticality=request.criticality
            )
        else:
            document = notion_service.import_from_page_id(
                request.page_id,
                categories=request.categories,
                criticality=request.criticality
            )
        
        # Save the imported document
        created_doc = document_service.create_document(document)
        logger.info(f"Document imported successfully from Notion: {created_doc.id}")
        return convert_to_document_response(created_doc)
    except NotionAPIError as e:
        logger.error(f"Notion API error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Notion API error: {str(e)}"
        )
    except NotionParseError as e:
        logger.error(f"Notion parse error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse Notion page: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error importing from Notion: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to import from Notion"
        )


@router.post(
    "/import/google-docs",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Import a DR document from Google Docs",
    responses={
        201: {"description": "Document imported successfully"},
        400: {"model": ErrorResponse, "description": "Invalid request or import failed"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def import_from_google_docs(request: GoogleDocsImportRequest) -> DocumentResponse:
    """
    Import a disaster recovery document from Google Docs.
    
    Args:
        request: Google Docs import request with document URL/ID and access token
        
    Returns:
        The imported document
    """
    try:
        logger.info(f"Importing from Google Docs - URL: {request.document_url}, ID: {request.document_id}")
        
        if not request.document_url and not request.document_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either document_url or document_id must be provided"
            )
        
        # Initialize Google Docs service
        google_docs_service = GoogleDocsIntegrationService(request.access_token)
        
        # Import document
        if request.document_url:
            document = google_docs_service.import_from_url(
                request.document_url,
                categories=request.categories,
                criticality=request.criticality
            )
        else:
            document = google_docs_service.import_from_document_id(
                request.document_id,
                categories=request.categories,
                criticality=request.criticality
            )
        
        # Save the imported document
        created_doc = document_service.create_document(document)
        logger.info(f"Document imported successfully from Google Docs: {created_doc.id}")
        return convert_to_document_response(created_doc)
    except GoogleDocsAPIError as e:
        logger.error(f"Google Docs API error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google Docs API error: {str(e)}"
        )
    except GoogleDocsParseError as e:
        logger.error(f"Google Docs parse error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse Google Docs document: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error importing from Google Docs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to import from Google Docs"
        )


@router.post(
    "/{document_id}/export/github",
    response_model=GitHubExportResponse,
    summary="Export a DR document to GitHub as PDF",
    responses={
        200: {"description": "Document exported successfully"},
        404: {"model": ErrorResponse, "description": "Document not found"},
        400: {"model": ErrorResponse, "description": "Invalid request or export failed"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def export_to_github_endpoint(
    document_id: str,
    request: GitHubExportRequest
) -> GitHubExportResponse:
    """
    Export a disaster recovery document to GitHub as a PDF.
    
    Args:
        document_id: Unique identifier of the document
        request: GitHub export request with repository details
        
    Returns:
        Export result with commit URL and file path
    """
    try:
        logger.info(f"Exporting document {document_id} to GitHub: {request.repo_name}")
        
        # Get document
        document = document_service.get_document(document_id)
        if not document:
            logger.warning(f"Document not found: {document_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found: {document_id}"
            )
        
        # Export to GitHub
        result = export_to_github(
            document=document,
            github_token=request.github_token,
            repo_name=request.repo_name,
            file_path=request.file_path,
            branch=request.branch,
            format=request.format
        )
        
        logger.info(f"Document exported successfully to GitHub: {result['commit_url']}")
        return GitHubExportResponse(**result)
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error exporting to GitHub: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error exporting to GitHub: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export to GitHub: {str(e)}"
        )


@router.get(
    "/{document_id}/versions",
    response_model=VersionListResponse,
    summary="List all versions of a DR document",
    responses={
        200: {"description": "Versions retrieved successfully"},
        404: {"model": ErrorResponse, "description": "Document not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def list_versions(document_id: str) -> VersionListResponse:
    """
    List all versions of a disaster recovery document.
    
    Args:
        document_id: Unique identifier of the document
        
    Returns:
        List of document versions in chronological order
    """
    try:
        logger.info(f"Listing versions for document: {document_id}")
        versions = document_service.get_document_versions(document_id)
        
        if not versions:
            # Check if document exists
            document = document_service.get_document(document_id)
            if not document:
                logger.warning(f"Document not found: {document_id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Document not found: {document_id}"
                )
        
        response_versions = [
            VersionResponse(
                document_id=v.document_id,
                version=v.version,
                timestamp=v.timestamp,
                previous_version=v.previous_version
            ) for v in versions
        ]
        
        return VersionListResponse(versions=response_versions, total=len(response_versions))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing versions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list versions"
        )


@router.post(
    "/{document_id}/revert/{version}",
    response_model=DocumentResponse,
    summary="Revert a DR document to a previous version",
    responses={
        200: {"description": "Document reverted successfully"},
        404: {"model": ErrorResponse, "description": "Document or version not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def revert_to_version(document_id: str, version: int) -> DocumentResponse:
    """
    Revert a disaster recovery document to a previous version.
    
    Creates a new version with content from the specified previous version.
    
    Args:
        document_id: Unique identifier of the document
        version: Version number to revert to
        
    Returns:
        The new document with reverted content
    """
    try:
        logger.info(f"Reverting document {document_id} to version {version}")
        
        reverted_doc = document_service.revert_document(document_id, version)
        
        if not reverted_doc:
            logger.warning(f"Document or version not found: {document_id}, version {version}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document or version not found: {document_id}, version {version}"
            )
        
        logger.info(f"Document reverted successfully: {document_id}")
        return convert_to_document_response(reverted_doc)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reverting document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revert document"
        )


@router.post(
    "/{document_id}/validate",
    response_model=ValidationResponse,
    summary="Validate a DR document",
    responses={
        200: {"description": "Validation completed"},
        404: {"model": ErrorResponse, "description": "Document not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def validate_document(document_id: str) -> ValidationResponse:
    """
    Validate a disaster recovery document for completeness and correctness.
    
    Args:
        document_id: Unique identifier of the document
        
    Returns:
        Validation result with list of issues
    """
    try:
        logger.info(f"Validating document: {document_id}")
        
        document = document_service.get_document(document_id)
        if not document:
            logger.warning(f"Document not found: {document_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found: {document_id}"
            )
        
        issues = document_service.validate_document(document)
        
        response_issues = [
            ValidationIssueResponse(
                field=issue.field,
                message=issue.message,
                severity=issue.severity
            ) for issue in issues
        ]
        
        return ValidationResponse(
            is_valid=len(issues) == 0,
            issues=response_issues
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate document"
        )


@router.get(
    "/{document_id}/export/markdown",
    response_model=ExportResponse,
    summary="Export a DR document as Markdown",
    responses={
        200: {"description": "Document exported successfully"},
        404: {"model": ErrorResponse, "description": "Document not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def export_markdown(document_id: str) -> ExportResponse:
    """
    Export a disaster recovery document as Markdown.
    
    Args:
        document_id: Unique identifier of the document
        
    Returns:
        Markdown representation of the document
    """
    try:
        logger.info(f"Exporting document {document_id} as Markdown")
        
        content = document_service.export_document(document_id, format="markdown")
        
        if content is None:
            logger.warning(f"Document not found: {document_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found: {document_id}"
            )
        
        return ExportResponse(content=content, format="markdown")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting as Markdown: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export as Markdown"
        )


@router.get(
    "/{document_id}/export/json",
    response_model=ExportResponse,
    summary="Export a DR document as JSON",
    responses={
        200: {"description": "Document exported successfully"},
        404: {"model": ErrorResponse, "description": "Document not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def export_json(document_id: str) -> ExportResponse:
    """
    Export a disaster recovery document as JSON.
    
    Args:
        document_id: Unique identifier of the document
        
    Returns:
        JSON representation of the document
    """
    try:
        logger.info(f"Exporting document {document_id} as JSON")
        
        content = document_service.export_document(document_id, format="json")
        
        if content is None:
            logger.warning(f"Document not found: {document_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found: {document_id}"
            )
        
        return ExportResponse(content=content, format="json")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting as JSON: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export as JSON"
        )


@router.post(
    "/{document_id}/ai-review",
    response_model=AIReviewResponse,
    summary="AI-powered review of a DR document",
    responses={
        200: {"description": "Document reviewed successfully"},
        404: {"model": ErrorResponse, "description": "Document not found"},
        400: {"model": ErrorResponse, "description": "Invalid request or review failed"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def ai_review_document(
    document_id: str,
    request: AIReviewRequest
) -> AIReviewResponse:
    """
    Perform AI-powered review and improvement of a disaster recovery document.
    
    Args:
        document_id: Unique identifier of the document
        request: AI review request with OpenAI API key and optional focus areas
        
    Returns:
        AI review results with suggestions and optionally improved document
    """
    try:
        logger.info(f"Starting AI review for document {document_id}")
        
        # Get document
        document = document_service.get_document(document_id)
        if not document:
            logger.warning(f"Document not found: {document_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found: {document_id}"
            )
        
        # Initialize AI review service
        ai_service = AIReviewService(request.openai_api_key)
        
        # Perform review
        review_result = ai_service.review_document(document)
        
        # Generate improved document if requested
        improved_document = None
        try:
            improved_doc = ai_service.improve_document(document, request.focus_areas)
            improved_document = convert_to_document_response(improved_doc)
        except Exception as e:
            logger.warning(f"Failed to generate improved document: {str(e)}")
        
        logger.info(f"AI review completed for document {document_id}")
        
        return AIReviewResponse(
            overall_score=review_result.get("overall_score", 7),
            summary=review_result.get("summary", "AI review completed"),
            suggestions=review_result.get("suggestions", []),
            compliance_check=review_result.get("compliance_check", {}),
            improved_document=improved_document
        )
        
    except AIReviewError as e:
        logger.error(f"AI review error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"AI review failed: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during AI review: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform AI review"
        )


@router.post(
    "/{document_id}/sync",
    response_model=DocumentSyncResponse,
    summary="Sync improved document to external platforms",
    responses={
        200: {"description": "Document synced successfully"},
        404: {"model": ErrorResponse, "description": "Document not found"},
        400: {"model": ErrorResponse, "description": "Invalid request or sync failed"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def sync_document(
    document_id: str,
    request: DocumentSyncRequest
) -> DocumentSyncResponse:
    """
    Sync an improved document to external platforms (GitHub, Notion, Google Docs).
    
    Args:
        document_id: Unique identifier of the document
        request: Sync request with platform configurations
        
    Returns:
        Sync results for all requested platforms
    """
    try:
        logger.info(f"Starting document sync for {document_id} to platforms: {request.platforms}")
        
        # Get document
        document = document_service.get_document(document_id)
        if not document:
            logger.warning(f"Document not found: {document_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found: {document_id}"
            )
        
        # Initialize sync service
        sync_service = DocumentSyncService()
        sync_results = []
        
        # Sync to each requested platform
        for platform in request.platforms:
            if platform == "github" and request.github_config:
                config = request.github_config
                result = sync_service.sync_to_github(
                    document=document,
                    github_token=config.get("token", ""),
                    repo_name=config.get("repo_name", ""),
                    file_path=config.get("file_path"),
                    branch=config.get("branch", "main"),
                    format=config.get("format", "markdown")
                )
                sync_results.append(result)
                
            elif platform == "notion" and request.notion_config:
                config = request.notion_config
                result = sync_service.sync_to_notion(
                    document=document,
                    notion_token=config.get("token", ""),
                    page_id=config.get("page_id", "")
                )
                sync_results.append(result)
                
            elif platform == "google_docs" and request.google_docs_config:
                config = request.google_docs_config
                result = sync_service.sync_to_google_docs(
                    document=document,
                    access_token=config.get("access_token"),
                    document_id=config.get("document_id", "")
                )
                sync_results.append(result)
        
        # Create sync summary
        sync_summary = sync_service.create_sync_summary(document, sync_results)
        
        logger.info(f"Document sync completed for {document_id}")
        
        return DocumentSyncResponse(
            document_id=document_id,
            sync_summary=sync_summary
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during document sync: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync document: {str(e)}"
        )