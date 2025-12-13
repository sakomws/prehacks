"""Document validator for DR documents."""
from datetime import datetime, timedelta
from typing import List
from models.document import DRDocument
from models.validation import validate_email, validate_phone, ValidationError


class ValidationIssue:
    """Represents a validation issue found in a document."""
    
    def __init__(self, field: str, message: str):
        """
        Initialize a validation issue.
        
        Args:
            field: The field that has the issue
            message: Description of the issue
        """
        self.field = field
        self.message = message
    
    def __repr__(self):
        return f"ValidationIssue(field='{self.field}', message='{self.message}')"
    
    def __eq__(self, other):
        if not isinstance(other, ValidationIssue):
            return False
        return self.field == other.field and self.message == other.message


class DocumentValidator:
    """Validates DR documents for completeness and correctness."""
    
    def __init__(self, outdated_threshold_days: int = 90):
        """
        Initialize the validator.
        
        Args:
            outdated_threshold_days: Number of days after which a document is considered outdated
        """
        self.outdated_threshold_days = outdated_threshold_days
    
    def validate(self, document: DRDocument) -> List[ValidationIssue]:
        """
        Validate a DR document and return all validation issues.
        
        Args:
            document: The document to validate
            
        Returns:
            List of ValidationIssue objects (empty if document is valid)
        """
        issues = []
        
        # Check required sections
        issues.extend(self._validate_required_sections(document))
        
        # Check contact information validity
        issues.extend(self._validate_contacts(document))
        
        # Check RTO/RPO are defined
        issues.extend(self._validate_rto_rpo(document))
        
        # Check if document is outdated
        issues.extend(self._check_outdated(document))
        
        return issues
    
    def _validate_required_sections(self, document: DRDocument) -> List[ValidationIssue]:
        """
        Validate that all required sections are present and non-empty.
        
        Args:
            document: The document to validate
            
        Returns:
            List of validation issues
        """
        issues = []
        
        # Check scenario
        if not document.scenario or not document.scenario.strip():
            issues.append(ValidationIssue(
                field="scenario",
                message="Scenario is required and must not be empty"
            ))
        
        # Check procedures
        if not document.procedures or len(document.procedures) == 0:
            issues.append(ValidationIssue(
                field="procedures",
                message="At least one procedure is required"
            ))
        
        # Check contacts
        if not document.contacts or len(document.contacts) == 0:
            issues.append(ValidationIssue(
                field="contacts",
                message="At least one contact is required"
            ))
        
        return issues
    
    def _validate_contacts(self, document: DRDocument) -> List[ValidationIssue]:
        """
        Validate that all contacts have valid email and phone formats.
        
        Args:
            document: The document to validate
            
        Returns:
            List of validation issues
        """
        issues = []
        
        for i, contact in enumerate(document.contacts):
            # Validate email
            try:
                validate_email(contact.email)
            except ValidationError as e:
                issues.append(ValidationIssue(
                    field=f"contacts[{i}].email",
                    message=f"Contact '{contact.name}': {str(e)}"
                ))
            
            # Validate phone
            try:
                validate_phone(contact.phone)
            except ValidationError as e:
                issues.append(ValidationIssue(
                    field=f"contacts[{i}].phone",
                    message=f"Contact '{contact.name}': {str(e)}"
                ))
        
        return issues
    
    def _validate_rto_rpo(self, document: DRDocument) -> List[ValidationIssue]:
        """
        Validate that RTO and RPO are defined and positive.
        
        Args:
            document: The document to validate
            
        Returns:
            List of validation issues
        """
        issues = []
        
        # RTO validation
        if document.rto is None:
            issues.append(ValidationIssue(
                field="rto",
                message="RTO (Recovery Time Objective) is required"
            ))
        elif document.rto <= 0:
            issues.append(ValidationIssue(
                field="rto",
                message="RTO must be a positive number"
            ))
        
        # RPO validation
        if document.rpo is None:
            issues.append(ValidationIssue(
                field="rpo",
                message="RPO (Recovery Point Objective) is required"
            ))
        elif document.rpo <= 0:
            issues.append(ValidationIssue(
                field="rpo",
                message="RPO must be a positive number"
            ))
        
        return issues
    
    def _check_outdated(self, document: DRDocument) -> List[ValidationIssue]:
        """
        Check if the document is outdated (not updated in the threshold period).
        
        Args:
            document: The document to validate
            
        Returns:
            List of validation issues
        """
        issues = []
        
        # Calculate the threshold date
        threshold_date = datetime.now() - timedelta(days=self.outdated_threshold_days)
        
        # Check if document's last update is before the threshold
        if document.updated_at < threshold_date:
            days_since_update = (datetime.now() - document.updated_at).days
            issues.append(ValidationIssue(
                field="updated_at",
                message=f"Document is potentially outdated (last updated {days_since_update} days ago, threshold is {self.outdated_threshold_days} days)"
            ))
        
        return issues
    
    def is_valid(self, document: DRDocument) -> bool:
        """
        Check if a document is valid (has no validation issues).
        
        Args:
            document: The document to validate
            
        Returns:
            True if document is valid, False otherwise
        """
        issues = self.validate(document)
        return len(issues) == 0
