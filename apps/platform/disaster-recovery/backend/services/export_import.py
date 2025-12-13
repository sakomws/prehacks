"""Export and import services for DR documents."""
import json
from typing import Dict, Any
from models.document import DRDocument, Contact, Procedure


def export_to_markdown(document: DRDocument) -> str:
    """
    Export a DR document to Markdown format.
    
    Args:
        document: The DR document to export
        
    Returns:
        A Markdown-formatted string containing all document sections
    """
    lines = []
    
    # Title
    lines.append(f"# {document.title}")
    lines.append("")
    
    # Metadata
    lines.append("## Document Information")
    lines.append("")
    lines.append(f"- **Categories**: {', '.join(document.categories)}")
    lines.append(f"- **Criticality**: {document.criticality}")
    lines.append(f"- **RTO**: {document.rto} minutes")
    lines.append(f"- **RPO**: {document.rpo} minutes")
    lines.append(f"- **Version**: {document.version}")
    lines.append(f"- **Created**: {document.created_at.isoformat()}")
    lines.append(f"- **Last Updated**: {document.updated_at.isoformat()}")
    lines.append("")
    
    # Disaster Scenario
    lines.append("## Disaster Scenario")
    lines.append("")
    lines.append(document.scenario)
    lines.append("")
    
    # Recovery Procedures
    lines.append("## Recovery Procedures")
    lines.append("")
    for i, procedure in enumerate(document.procedures, 1):
        lines.append(f"### {i}. {procedure.name}")
        lines.append("")
        lines.append(f"**Estimated Duration**: {procedure.estimated_duration} minutes")
        lines.append("")
        lines.append("**Steps**:")
        lines.append("")
        for j, step in enumerate(procedure.steps, 1):
            lines.append(f"{j}. {step}")
        lines.append("")
    
    # Contact Information
    lines.append("## Contact Information")
    lines.append("")
    lines.append("| Name | Role | Phone | Email |")
    lines.append("|------|------|-------|-------|")
    for contact in document.contacts:
        lines.append(f"| {contact.name} | {contact.role} | {contact.phone} | {contact.email} |")
    lines.append("")
    
    return "\n".join(lines)


def export_to_json(document: DRDocument) -> str:
    """
    Export a DR document to JSON format.
    
    Args:
        document: The DR document to export
        
    Returns:
        A JSON string containing all document data
    """
    # Use Pydantic's model_dump to convert to dict, then serialize to JSON
    doc_dict = document.model_dump(mode='json')
    return json.dumps(doc_dict, indent=2, default=str)


def import_from_json(json_str: str) -> DRDocument:
    """
    Import a DR document from JSON format.
    
    Args:
        json_str: A JSON string representing a DR document
        
    Returns:
        A DRDocument instance
        
    Raises:
        ValueError: If JSON is invalid or cannot be parsed into a DRDocument
    """
    try:
        data = json.loads(json_str)
        # Use Pydantic's model_validate to create document from dict
        return DRDocument.model_validate(data)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON: {str(e)}")
    except Exception as e:
        raise ValueError(f"Failed to parse document from JSON: {str(e)}")
