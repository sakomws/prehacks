"""Parser for converting Notion page content to DR documents."""
from typing import Dict, Any, List, Optional
import re
from models.document import DRDocument, Procedure, Contact
from models.validation import validate_email, validate_phone


class NotionPageParser:
    """
    Parser for extracting DR document data from Notion pages.
    
    Maps Notion page structure to DR document fields.
    """
    
    def parse_page_to_document(
        self,
        page_data: Dict[str, Any],
        blocks: List[Dict[str, Any]],
        categories: List[str] = None,
        criticality: str = "medium"
    ) -> DRDocument:
        """
        Parse a Notion page into a DR document.
        
        Args:
            page_data: The Notion page metadata
            blocks: The Notion page blocks (content)
            categories: Document categories (default: ["General"])
            criticality: Document criticality level (default: "medium")
            
        Returns:
            A DR document created from the Notion page
            
        Raises:
            NotionParseError: If required fields cannot be extracted
        """
        # Extract title from page properties
        title = self._extract_title(page_data)
        
        # Parse blocks to extract content
        content = self._parse_blocks(blocks)
        
        # Extract scenario
        scenario = self._extract_scenario(content)
        if not scenario:
            raise NotionParseError("Could not extract disaster scenario from Notion page")
        
        # Extract procedures
        procedures = self._extract_procedures(content)
        if not procedures:
            raise NotionParseError("Could not extract recovery procedures from Notion page")
        
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
    
    def _extract_title(self, page_data: Dict[str, Any]) -> str:
        """Extract title from Notion page properties."""
        properties = page_data.get("properties", {})
        
        # Try to get title from various property types
        for prop_name, prop_value in properties.items():
            if prop_value.get("type") == "title":
                title_array = prop_value.get("title", [])
                if title_array:
                    return "".join(item.get("plain_text", "") for item in title_array)
        
        # Fallback to page ID if no title found
        return page_data.get("id", "Untitled Document")
    
    def _parse_blocks(self, blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Parse Notion blocks into structured content.
        
        Returns a dictionary with extracted text organized by block type.
        """
        content = {
            "headings": [],
            "paragraphs": [],
            "lists": [],
            "tables": [],
            "all_text": []
        }
        
        for block in blocks:
            block_type = block.get("type")
            
            if block_type in ["heading_1", "heading_2", "heading_3"]:
                text = self._extract_text_from_block(block, block_type)
                if text:
                    content["headings"].append({"level": block_type, "text": text})
                    content["all_text"].append(text)
            
            elif block_type == "paragraph":
                text = self._extract_text_from_block(block, block_type)
                if text:
                    content["paragraphs"].append(text)
                    content["all_text"].append(text)
            
            elif block_type in ["bulleted_list_item", "numbered_list_item"]:
                text = self._extract_text_from_block(block, block_type)
                if text:
                    content["lists"].append(text)
                    content["all_text"].append(text)
            
            elif block_type == "table":
                # Tables are handled separately with child blocks
                content["tables"].append(block)
        
        return content
    
    def _extract_text_from_block(self, block: Dict[str, Any], block_type: str) -> str:
        """Extract plain text from a Notion block."""
        block_content = block.get(block_type, {})
        rich_text = block_content.get("rich_text", [])
        return "".join(item.get("plain_text", "") for item in rich_text)
    
    def _extract_scenario(self, content: Dict[str, Any]) -> str:
        """
        Extract disaster scenario from content.
        
        Looks for headings or paragraphs containing scenario information.
        """
        # Look for heading with "scenario" keyword
        for heading in content["headings"]:
            if "scenario" in heading["text"].lower():
                # Find the next paragraph after this heading
                heading_idx = content["all_text"].index(heading["text"])
                if heading_idx + 1 < len(content["all_text"]):
                    return content["all_text"][heading_idx + 1]
        
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
        
        return procedures
    
    def _extract_contacts(self, content: Dict[str, Any]) -> List[Contact]:
        """
        Extract contact information from content.
        
        Looks for contact patterns in text and tables.
        """
        contacts = []
        
        # Pattern to match contact information
        # Looking for: Name, Role, Phone, Email patterns
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}'
        
        # Search through all text for contact information
        for text in content["all_text"]:
            # Find emails
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
        
        # If no contacts found, create a default one if we found any email
        if not contacts:
            all_text = " ".join(content["all_text"])
            emails = re.findall(email_pattern, all_text)
            phones = re.findall(phone_pattern, all_text)
            
            if emails and phones:
                # Use first valid email and phone
                for email in emails:
                    for phone in phones:
                        try:
                            validate_email(email)
                            validate_phone(phone)
                            contacts.append(Contact(
                                name="Emergency Contact",
                                role="Disaster Recovery Coordinator",
                                phone=phone,
                                email=email
                            ))
                            break
                        except Exception:
                            # Try next combination
                            continue
                    if contacts:
                        break
        
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


class NotionParseError(Exception):
    """Exception raised for Notion parsing errors."""
    pass
