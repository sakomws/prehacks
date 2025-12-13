"""AI review service for disaster recovery documents."""
import json
import openai
from typing import Dict, List, Optional, Any
from datetime import datetime
from models.document import DRDocument, Procedure, Contact
from services.export_import import export_to_markdown


class AIReviewService:
    """
    Service for AI-powered review and improvement of DR documents.
    
    Uses OpenAI GPT to analyze documents and suggest improvements.
    """
    
    def __init__(self, api_key: str):
        """
        Initialize the AI review service.
        
        Args:
            api_key: OpenAI API key
        """
        self.client = openai.OpenAI(api_key=api_key)
    
    def review_document(self, document: DRDocument) -> Dict[str, Any]:
        """
        Review a DR document and provide improvement suggestions.
        
        Args:
            document: The DR document to review
            
        Returns:
            Dictionary containing:
                - overall_score: Overall quality score (1-10)
                - suggestions: List of improvement suggestions
                - improved_sections: Suggested improvements for specific sections
                - compliance_check: Compliance with DR best practices
        """
        # Convert document to markdown for analysis
        markdown_content = export_to_markdown(document)
        
        # Create the review prompt
        prompt = self._create_review_prompt(document, markdown_content)
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert disaster recovery consultant with 20+ years of experience. You specialize in reviewing and improving disaster recovery documentation to ensure it meets industry best practices and compliance standards."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            # Parse the AI response
            review_content = response.choices[0].message.content
            return self._parse_review_response(review_content)
            
        except Exception as e:
            raise AIReviewError(f"Failed to review document: {str(e)}")
    
    def improve_document(self, document: DRDocument, focus_areas: List[str] = None) -> DRDocument:
        """
        Generate an improved version of the DR document.
        
        Args:
            document: The original DR document
            focus_areas: Optional list of areas to focus on (e.g., ["procedures", "contacts", "scenario"])
            
        Returns:
            Improved DR document
        """
        # Convert document to markdown for analysis
        markdown_content = export_to_markdown(document)
        
        # Create the improvement prompt
        prompt = self._create_improvement_prompt(document, markdown_content, focus_areas)
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert disaster recovery consultant. Your task is to improve disaster recovery documents by enhancing clarity, completeness, and compliance with industry standards. Always maintain the original structure while improving content quality."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=3000
            )
            
            # Parse the AI response and create improved document
            improvement_content = response.choices[0].message.content
            return self._create_improved_document(document, improvement_content)
            
        except Exception as e:
            raise AIReviewError(f"Failed to improve document: {str(e)}")
    
    def _create_review_prompt(self, document: DRDocument, markdown_content: str) -> str:
        """Create a prompt for document review."""
        return f"""
Please review this disaster recovery document and provide a comprehensive analysis:

DOCUMENT DETAILS:
- Title: {document.title}
- Criticality: {document.criticality}
- RTO: {document.rto} minutes
- RPO: {document.rpo} minutes
- Categories: {', '.join(document.categories) if hasattr(document, 'categories') else getattr(document, 'category', 'N/A')}
- Procedures: {len(document.procedures)}
- Contacts: {len(document.contacts)}

DOCUMENT CONTENT:
{markdown_content}

Please provide your review in the following JSON format:
{{
    "overall_score": <1-10 score>,
    "summary": "<brief summary of document quality>",
    "strengths": ["<strength 1>", "<strength 2>", ...],
    "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
    "suggestions": [
        {{
            "section": "<section name>",
            "priority": "<high/medium/low>",
            "suggestion": "<detailed suggestion>",
            "rationale": "<why this improvement is needed>"
        }}
    ],
    "compliance_check": {{
        "iso_22301": "<compliant/partial/non-compliant>",
        "nist_framework": "<compliant/partial/non-compliant>",
        "industry_standards": "<compliant/partial/non-compliant>"
    }},
    "missing_elements": ["<element 1>", "<element 2>", ...],
    "rto_rpo_assessment": "<assessment of RTO/RPO appropriateness>"
}}

Focus on:
1. Completeness and clarity of procedures
2. Contact information adequacy
3. Scenario realism and detail
4. RTO/RPO appropriateness
5. Compliance with DR best practices
6. Missing critical information
7. Actionability of procedures
"""
    
    def _create_improvement_prompt(self, document: DRDocument, markdown_content: str, focus_areas: List[str] = None) -> str:
        """Create a prompt for document improvement."""
        focus_text = ""
        if focus_areas:
            focus_text = f"\nFOCUS AREAS: Please pay special attention to improving: {', '.join(focus_areas)}"
        
        return f"""
Please improve this disaster recovery document while maintaining its original structure and intent:

CURRENT DOCUMENT:
{markdown_content}

IMPROVEMENT GUIDELINES:
1. Enhance clarity and specificity of procedures
2. Improve contact information completeness
3. Make the disaster scenario more detailed and realistic
4. Ensure procedures are actionable and time-bound
5. Add missing critical steps or information
6. Improve technical accuracy
7. Ensure compliance with DR best practices
{focus_text}

Please provide the improved content in the following JSON format:
{{
    "improved_title": "<enhanced title if needed>",
    "improved_scenario": "<enhanced disaster scenario>",
    "improved_procedures": [
        {{
            "name": "<procedure name>",
            "steps": ["<step 1>", "<step 2>", ...],
            "estimated_duration": <minutes>,
            "improvements_made": "<description of improvements>"
        }}
    ],
    "improved_contacts": [
        {{
            "name": "<contact name>",
            "role": "<enhanced role description>",
            "phone": "<phone number>",
            "email": "<email address>",
            "improvements_made": "<description of improvements>"
        }}
    ],
    "suggested_rto": <improved RTO in minutes>,
    "suggested_rpo": <improved RPO in minutes>,
    "improvement_summary": "<summary of all improvements made>",
    "additional_recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
}}

IMPORTANT: 
- Keep all original information unless it's clearly incorrect
- Only suggest RTO/RPO changes if current values are unrealistic
- Ensure all procedures remain actionable and specific
- Maintain the document's original intent and scope
"""
    
    def _parse_review_response(self, review_content: str) -> Dict[str, Any]:
        """Parse the AI review response."""
        try:
            # Try to extract JSON from the response
            start_idx = review_content.find('{')
            end_idx = review_content.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_content = review_content[start_idx:end_idx]
                return json.loads(json_content)
            else:
                # Fallback: create a basic structure from the text
                return {
                    "overall_score": 7,
                    "summary": "AI review completed",
                    "suggestions": [{"section": "general", "priority": "medium", "suggestion": review_content[:500], "rationale": "AI analysis"}],
                    "compliance_check": {"iso_22301": "partial", "nist_framework": "partial", "industry_standards": "partial"},
                    "missing_elements": [],
                    "rto_rpo_assessment": "Review RTO/RPO values for appropriateness"
                }
        except json.JSONDecodeError:
            # Fallback response
            return {
                "overall_score": 7,
                "summary": "AI review completed with parsing issues",
                "suggestions": [{"section": "general", "priority": "medium", "suggestion": "Document reviewed by AI", "rationale": "Automated analysis"}],
                "compliance_check": {"iso_22301": "unknown", "nist_framework": "unknown", "industry_standards": "unknown"},
                "missing_elements": [],
                "rto_rpo_assessment": "Manual review recommended"
            }
    
    def _create_improved_document(self, original_document: DRDocument, improvement_content: str) -> DRDocument:
        """Create an improved document from AI suggestions."""
        try:
            # Try to extract JSON from the response
            start_idx = improvement_content.find('{')
            end_idx = improvement_content.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_content = improvement_content[start_idx:end_idx]
                improvements = json.loads(json_content)
            else:
                # Fallback: return original document with minor updates
                return self._create_fallback_improved_document(original_document)
            
            # Create improved document
            improved_document = DRDocument(
                id=original_document.id,
                title=improvements.get("improved_title", original_document.title),
                scenario=improvements.get("improved_scenario", original_document.scenario),
                procedures=[],
                contacts=[],
                rto=improvements.get("suggested_rto", original_document.rto),
                rpo=improvements.get("suggested_rpo", original_document.rpo),
                categories=getattr(original_document, 'categories', [getattr(original_document, 'category', 'General')]),
                criticality=original_document.criticality,
                created_at=original_document.created_at,
                updated_at=datetime.now(),
                version=original_document.version + 1
            )
            
            # Add improved procedures
            for proc_data in improvements.get("improved_procedures", []):
                procedure = Procedure(
                    name=proc_data.get("name", "Unnamed Procedure"),
                    steps=proc_data.get("steps", []),
                    estimated_duration=proc_data.get("estimated_duration", 30)
                )
                improved_document.procedures.append(procedure)
            
            # Add improved contacts
            for contact_data in improvements.get("improved_contacts", []):
                contact = Contact(
                    name=contact_data.get("name", "Unknown Contact"),
                    role=contact_data.get("role", "Emergency Contact"),
                    phone=contact_data.get("phone", "+1-000-0000"),
                    email=contact_data.get("email", "contact@example.com")
                )
                improved_document.contacts.append(contact)
            
            # If no improved procedures/contacts, use originals
            if not improved_document.procedures:
                improved_document.procedures = original_document.procedures
            if not improved_document.contacts:
                improved_document.contacts = original_document.contacts
            
            return improved_document
            
        except (json.JSONDecodeError, KeyError, ValueError):
            # Fallback: return original document with version increment
            return self._create_fallback_improved_document(original_document)
    
    def _create_fallback_improved_document(self, original_document: DRDocument) -> DRDocument:
        """Create a fallback improved document when AI parsing fails."""
        improved_document = DRDocument(
            id=original_document.id,
            title=f"{original_document.title} (AI Reviewed)",
            scenario=original_document.scenario,
            procedures=original_document.procedures,
            contacts=original_document.contacts,
            rto=original_document.rto,
            rpo=original_document.rpo,
            categories=getattr(original_document, 'categories', [getattr(original_document, 'category', 'General')]),
            criticality=original_document.criticality,
            created_at=original_document.created_at,
            updated_at=datetime.now(),
            version=original_document.version + 1
        )
        return improved_document


class AIReviewError(Exception):
    """Exception raised for AI review errors."""
    pass