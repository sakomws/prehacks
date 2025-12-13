"""Parser for converting Google Docs content to DR documents."""
from typing import Dict, Any, List, Optional
import re
from models.document import DRDocument, Procedure, Contact
from models.validation import validate_email, validate_phone


class GoogleDocsParser:
    """
    Parser for extracting DR document data from Google Docs.
    
    Maps Google Docs structure to DR document fields.
    """
    
    def parse_document_to_dr_document(
        self,
        document_data: Dict[str, Any],
        categories: List[str] = None,
        criticality: str = "medium"
    ) -> DRDocument:
        """
        Parse a Google Doc into a DR document.
        
        Args:
            document_data: The Google Docs document data
            categories: Document categories (default: ["General"])
            criticality: Document criticality level (default: "medium")
            
        Returns:
            A DR document created from the Google Doc
            
        Raises:
            GoogleDocsParseError: If required fields cannot be extracted
        """
        # Extract title
        title = self._extract_title(document_data)
        
        # Parse document content
        content = self._parse_document_content(document_data)
        
        # Extract scenario
        scenario = self._extract_scenario(content)
        if not scenario:
            raise GoogleDocsParseError("Could not extract disaster scenario from Google Doc")
        
        # Extract procedures
        procedures = self._extract_procedures(content)
        if not procedures:
            raise GoogleDocsParseError("Could not extract recovery procedures from Google Doc")
        
        # Extract contacts
        contacts = self._extract_contacts(content)
        if not contacts:
            # Provide a default contact if none could be extracted
            contacts = [Contact(
                name="Default Contact",
                role="Disaster Recovery Coordinator",
                phone="+1-000-0000",
                email="dr-coordinator@example.com"
            )]
        
        # Extract RTO and RPO
        rto = self._extract_rto(content)
        rpo = self._extract_rpo(content)
        
        # Create and return the document
        if categories is None:
            categories = ["General"]
        
        return DRDocument(
            title=title,
            scenario=scenario,
            procedures=procedures,
            contacts=contacts,
            rto=rto,
            rpo=rpo,
            categories=categories,
            criticality=criticality
        )
    
    def _extract_title(self, document_data: Dict[str, Any]) -> str:
        """Extract title from Google Docs document."""
        return document_data.get("title", "Untitled Document")
    
    def _parse_document_content(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse Google Docs content into structured data.
        
        Returns a dictionary with extracted text organized by element type.
        """
        content = {
            "headings": [],
            "paragraphs": [],
            "lists": [],
            "tables": [],
            "all_text": []
        }
        
        body = document_data.get("body", {})
        content_elements = body.get("content", [])
        
        for element in content_elements:
            if "paragraph" in element:
                self._parse_paragraph(element["paragraph"], content)
            elif "table" in element:
                self._parse_table(element["table"], content)
        
        return content
    
    def _parse_paragraph(self, paragraph: Dict[str, Any], content: Dict[str, Any]):
        """Parse a paragraph element and add to content."""
        # Extract text from paragraph
        text = self._extract_text_from_paragraph(paragraph)
        if not text.strip():
            return
        
        # Check if this is a heading based on style
        paragraph_style = paragraph.get("paragraphStyle", {})
        named_style_type = paragraph_style.get("namedStyleType", "")
        
        if named_style_type.startswith("HEADING"):
            level = named_style_type.replace("HEADING_", "").replace("_", "")
            content["headings"].append({"level": level, "text": text})
        else:
            # Check if this is a list item
            bullet = paragraph.get("bullet")
            if bullet:
                content["lists"].append(text)
            else:
                content["paragraphs"].append(text)
        
        content["all_text"].append(text)
    
    def _parse_table(self, table: Dict[str, Any], content: Dict[str, Any]):
        """Parse a table element and add to content."""
        table_rows = table.get("tableRows", [])
        table_data = []
        
        for row in table_rows:
            row_data = []
            table_cells = row.get("tableCells", [])
            
            for cell in table_cells:
                cell_content = cell.get("content", [])
                cell_text = ""
                
                for element in cell_content:
                    if "paragraph" in element:
                        cell_text += self._extract_text_from_paragraph(element["paragraph"])
                
                row_data.append(cell_text.strip())
            
            if any(cell for cell in row_data):  # Only add non-empty rows
                table_data.append(row_data)
        
        if table_data:
            content["tables"].append(table_data)
            # Also add table text to all_text for searching
            for row in table_data:
                content["all_text"].extend(row)
    
    def _extract_text_from_paragraph(self, paragraph: Dict[str, Any]) -> str:
        """Extract plain text from a paragraph element."""
        elements = paragraph.get("elements", [])
        text_parts = []
        
        for element in elements:
            text_run = element.get("textRun", {})
            content = text_run.get("content", "")
            text_parts.append(content)
        
        return "".join(text_parts)
    
    def _extract_scenario(self, content: Dict[str, Any]) -> str:
        """
        Extract disaster scenario from content.
        
        Looks for headings or paragraphs containing scenario information.
        """
        # Look for heading with "scenario" keyword
        for heading in content["headings"]:
            if "scenario" in heading["text"].lower():
                # Find the next paragraph after this heading
                try:
                    heading_idx = content["all_text"].index(heading["text"])
                    if heading_idx + 1 < len(content["all_text"]):
                        return content["all_text"][heading_idx + 1]
                except ValueError:
                    continue
        
        # Look for paragraph with "scenario:" prefix
        for para in content["paragraphs"]:
            if para.lower().startswith("scenario:"):
                return para.split(":", 1)[1].strip()
        
        # Fallback: use first substantial paragraph
        for para in content["paragraphs"]:
            if len(para.strip()) > 20:
                return para.strip()
        
        return ""
    
    def _extract_procedures(self, content: Dict[str, Any]) -> List[Procedure]:
        """
        Extract recovery procedures from content.
        
        Looks for sections with procedure headings and steps.
        """
        procedures = []
        
        # Look for headings that indicate procedures
        procedure_keywords = ["procedure", "step", "recovery", "action", "process"]
        
        current_procedure_name = None
        current_steps = []
        
        for i, text in enumerate(content["all_text"]):
            # Check if this is a procedure heading
            is_heading = any(h["text"] == text for h in content["headings"])
            is_procedure_heading = is_heading and any(kw in text.lower() for kw in procedure_keywords)
            
            if is_procedure_heading:
                # Save previous procedure if exists
                if current_procedure_name and current_steps:
                    procedures.append(Procedure(
                        name=current_procedure_name,
                        steps=current_steps,
                        estimated_duration=len(current_steps) * 5  # Estimate 5 min per step
                    ))
                
                # Start new procedure
                current_procedure_name = text
                current_steps = []
            
            elif current_procedure_name and text in content["lists"]:
                # Add step to current procedure
                current_steps.append(text)
        
        # Save last procedure
        if current_procedure_name and current_steps:
            procedures.append(Procedure(
                name=current_procedure_name,
                steps=current_steps,
                estimated_duration=len(current_steps) * 5
            ))
        
        # If no procedures found with headings, try to extract from lists
        if not procedures and content["lists"]:
            procedures.append(Procedure(
                name="Recovery Procedure",
                steps=content["lists"],
                estimated_duration=len(content["lists"]) * 5
            ))
        
        # If still no procedures, create one from paragraphs
        if not procedures and content["paragraphs"]:
            # Use paragraphs as steps
            steps = [p for p in content["paragraphs"] if len(p.strip()) > 10][:10]  # Limit to 10 steps
            if steps:
                procedures.append(Procedure(
                    name="Recovery Procedure",
                    steps=steps,
                    estimated_duration=len(steps) * 5
                ))
        
        return procedures
    
    def _extract_contacts(self, content: Dict[str, Any]) -> List[Contact]:
        """
        Extract contact information from content.
        
        Looks for contact patterns in text and tables.
        """
        contacts = []
        
        # First, try to extract from tables (common format for contact info)
        for table in content["tables"]:
            contacts.extend(self._extract_contacts_from_table(table))
        
        # If no contacts from tables, search in text
        if not contacts:
            contacts.extend(self._extract_contacts_from_text(content["all_text"]))
        
        return contacts
    
    def _extract_contacts_from_table(self, table: List[List[str]]) -> List[Contact]:
        """Extract contacts from a table structure."""
        contacts = []
        
        # Look for table headers to identify columns
        if not table:
            return contacts
        
        headers = [h.lower().strip() for h in table[0]]
        
        # Find column indices
        name_col = self._find_column_index(headers, ["name", "contact", "person"])
        role_col = self._find_column_index(headers, ["role", "title", "position", "job"])
        phone_col = self._find_column_index(headers, ["phone", "tel", "telephone", "mobile"])
        email_col = self._find_column_index(headers, ["email", "mail", "e-mail"])
        
        # Extract contacts from data rows
        for row in table[1:]:  # Skip header row
            if len(row) <= max(name_col or 0, role_col or 0, phone_col or 0, email_col or 0):
                continue
            
            name = row[name_col].strip() if name_col is not None and name_col < len(row) else ""
            role = row[role_col].strip() if role_col is not None and role_col < len(row) else "Contact"
            phone = row[phone_col].strip() if phone_col is not None and phone_col < len(row) else ""
            email = row[email_col].strip() if email_col is not None and email_col < len(row) else ""
            
            # Validate and add contact
            if name and email and phone:
                try:
                    validate_email(email)
                    validate_phone(phone)
                    contacts.append(Contact(
                        name=name,
                        role=role,
                        phone=phone,
                        email=email
                    ))
                except Exception:
                    # Skip invalid contacts
                    continue
        
        return contacts
    
    def _find_column_index(self, headers: List[str], keywords: List[str]) -> Optional[int]:
        """Find the index of a column based on keywords."""
        for i, header in enumerate(headers):
            if any(keyword in header for keyword in keywords):
                return i
        return None
    
    def _extract_contacts_from_text(self, all_text: List[str]) -> List[Contact]:
        """Extract contacts from plain text."""
        contacts = []
        
        # Pattern to match contact information
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}'
        
        # Search through all text for contact information
        for text in all_text:
            # Find emails and phones
            emails = re.findall(email_pattern, text)
            phones = re.findall(phone_pattern, text)
            
            # If we found both email and phone, try to extract name and role
            if emails and phones:
                # Simple heuristic: text before email/phone is likely name and role
                lines = text.split("\n")
                for line in lines:
                    if any(email in line for email in emails):
                        # Try to parse the line
                        parts = [p.strip() for p in line.split(",") if p.strip()]
                        if len(parts) >= 2:
                            name = parts[0]
                            role = parts[1] if len(parts) > 1 else "Contact"
                            
                            # Find email and phone in this line or nearby
                            line_emails = re.findall(email_pattern, line)
                            line_phones = re.findall(phone_pattern, line)
                            
                            if line_emails and line_phones:
                                email = line_emails[0]
                                phone = line_phones[0]
                                
                                # Validate before adding
                                try:
                                    validate_email(email)
                                    validate_phone(phone)
                                    contacts.append(Contact(
                                        name=name,
                                        role=role,
                                        phone=phone,
                                        email=email
                                    ))
                                except Exception:
                                    # Skip invalid contacts
                                    continue
        
        return contacts
    
    def _extract_rto(self, content: Dict[str, Any]) -> int:
        """
        Extract RTO (Recovery Time Objective) from content.
        
        Looks for RTO mentions with time values.
        """
        all_text = " ".join(content["all_text"]).lower()
        
        # Pattern to match RTO with time values
        rto_pattern = r'rto[:\s]+(\d+)\s*(minute|min|hour|hr|h)'
        match = re.search(rto_pattern, all_text)
        
        if match:
            value = int(match.group(1))
            unit = match.group(2)
            
            # Convert to minutes
            if unit in ["hour", "hr", "h"]:
                return value * 60
            return value
        
        # Default RTO if not found
        return 60  # 1 hour default
    
    def _extract_rpo(self, content: Dict[str, Any]) -> int:
        """
        Extract RPO (Recovery Point Objective) from content.
        
        Looks for RPO mentions with time values.
        """
        all_text = " ".join(content["all_text"]).lower()
        
        # Pattern to match RPO with time values
        rpo_pattern = r'rpo[:\s]+(\d+)\s*(minute|min|hour|hr|h)'
        match = re.search(rpo_pattern, all_text)
        
        if match:
            value = int(match.group(1))
            unit = match.group(2)
            
            # Convert to minutes
            if unit in ["hour", "hr", "h"]:
                return value * 60
            return value
        
        # Default RPO if not found
        return 15  # 15 minutes default


class GoogleDocsParseError(Exception):
    """Exception raised for Google Docs parsing errors."""
    pass