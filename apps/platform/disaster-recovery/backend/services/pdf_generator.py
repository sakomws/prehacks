"""PDF generation service for DR documents."""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from io import BytesIO
from models.document import DRDocument


def generate_pdf(document: DRDocument) -> bytes:
    """
    Generate a PDF from a DR document.
    
    Args:
        document: The DR document to convert to PDF
        
    Returns:
        PDF content as bytes
    """
    # Create a BytesIO buffer to hold the PDF
    buffer = BytesIO()
    
    # Create the PDF document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18,
    )
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubHeading',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=colors.HexColor('#34495e'),
        spaceAfter=10,
        spaceBefore=10
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        leading=14,
        spaceAfter=10
    )
    
    # Helper function to escape special characters for XML/HTML
    def escape_text(text: str) -> str:
        """Escape special characters for ReportLab Paragraph."""
        return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    
    # Title
    elements.append(Paragraph(escape_text(document.title), title_style))
    elements.append(Spacer(1, 0.2 * inch))
    
    # Document Information Section
    elements.append(Paragraph("Document Information", heading_style))
    
    # Create metadata table
    metadata = [
        ["Categories:", escape_text(", ".join(document.categories))],
        ["Criticality:", escape_text(document.criticality)],
        ["RTO:", f"{document.rto} minutes"],
        ["RPO:", f"{document.rpo} minutes"],
        ["Version:", str(document.version)],
        ["Created:", document.created_at.strftime("%Y-%m-%d %H:%M:%S")],
        ["Last Updated:", document.updated_at.strftime("%Y-%m-%d %H:%M:%S")],
    ]
    
    metadata_table = Table(metadata, colWidths=[1.5 * inch, 4 * inch])
    metadata_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2c3e50')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(metadata_table)
    elements.append(Spacer(1, 0.3 * inch))
    
    # Disaster Scenario Section
    elements.append(Paragraph("Disaster Scenario", heading_style))
    elements.append(Paragraph(escape_text(document.scenario), body_style))
    elements.append(Spacer(1, 0.2 * inch))
    
    # Recovery Procedures Section
    elements.append(Paragraph("Recovery Procedures", heading_style))
    
    for i, procedure in enumerate(document.procedures, 1):
        # Procedure name
        elements.append(Paragraph(f"{i}. {escape_text(procedure.name)}", subheading_style))
        
        # Estimated duration
        elements.append(Paragraph(
            f"<b>Estimated Duration:</b> {procedure.estimated_duration} minutes",
            body_style
        ))
        
        # Steps
        elements.append(Paragraph("<b>Steps:</b>", body_style))
        
        for j, step in enumerate(procedure.steps, 1):
            elements.append(Paragraph(f"{j}. {escape_text(step)}", body_style))
        
        elements.append(Spacer(1, 0.15 * inch))
    
    elements.append(Spacer(1, 0.2 * inch))
    
    # Contact Information Section
    elements.append(Paragraph("Contact Information", heading_style))
    
    # Create contacts table
    contact_data = [["Name", "Role", "Phone", "Email"]]
    
    for contact in document.contacts:
        contact_data.append([
            escape_text(contact.name),
            escape_text(contact.role),
            escape_text(contact.phone),
            escape_text(contact.email)
        ])
    
    contacts_table = Table(contact_data, colWidths=[1.5 * inch, 1.5 * inch, 1.3 * inch, 2.2 * inch])
    contacts_table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        
        # Data rows
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')]),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))
    
    elements.append(contacts_table)
    
    # Build the PDF
    doc.build(elements)
    
    # Get the PDF content from the buffer
    pdf_content = buffer.getvalue()
    buffer.close()
    
    return pdf_content
