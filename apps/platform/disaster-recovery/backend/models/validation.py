"""Validation functions for DR document fields."""
import re
from typing import List


class ValidationError(Exception):
    """Custom validation error."""
    pass


def validate_scenario(scenario: str) -> None:
    """
    Validate that scenario is non-empty and contains meaningful content.
    
    Args:
        scenario: The disaster scenario description
        
    Raises:
        ValidationError: If scenario is empty or contains only whitespace
    """
    if not scenario or not scenario.strip():
        raise ValidationError("Scenario must be non-empty and contain meaningful content")


def validate_rto_rpo(value: int, field_name: str) -> None:
    """
    Validate that RTO/RPO values are positive numbers.
    
    Args:
        value: The RTO or RPO value in minutes
        field_name: Name of the field being validated (for error messages)
        
    Raises:
        ValidationError: If value is not positive
    """
    if value <= 0:
        raise ValidationError(f"{field_name} must be a positive number")


def validate_criticality(criticality: str) -> None:
    """
    Validate that criticality level is one of the predefined values.
    
    Args:
        criticality: The criticality level
        
    Raises:
        ValidationError: If criticality is not a valid level
    """
    valid_levels = ["critical", "high", "medium", "low"]
    if criticality not in valid_levels:
        raise ValidationError(
            f"Criticality must be one of {valid_levels}, got '{criticality}'"
        )


def validate_procedure(name: str, steps: List[str]) -> None:
    """
    Validate that procedure has a name and steps.
    
    Args:
        name: The procedure name
        steps: List of procedure steps
        
    Raises:
        ValidationError: If name is empty or steps list is empty
    """
    if not name or not name.strip():
        raise ValidationError("Procedure name must be non-empty")
    
    if not steps or len(steps) == 0:
        raise ValidationError("Procedure must have at least one step")
    
    # Check that steps are not empty strings
    for i, step in enumerate(steps):
        if not step or not step.strip():
            raise ValidationError(f"Procedure step {i+1} must be non-empty")


def validate_email(email: str) -> None:
    """
    Validate email address format.
    
    Args:
        email: The email address to validate
        
    Raises:
        ValidationError: If email format is invalid
    """
    # Basic email regex pattern: local@domain
    # Requires @ symbol with non-empty local and domain parts
    email_pattern = r'^[^@\s]+@[^@\s]+\.[^@\s]+$'
    
    if not email or not email.strip():
        raise ValidationError("Email address cannot be empty")
    
    if not re.match(email_pattern, email.strip()):
        raise ValidationError(f"Invalid email format: '{email}'")


def validate_phone(phone: str) -> None:
    """
    Validate phone number format.
    
    Args:
        phone: The phone number to validate
        
    Raises:
        ValidationError: If phone format is invalid
    """
    if not phone or not phone.strip():
        raise ValidationError("Phone number cannot be empty")
    
    # Phone pattern: allows digits, spaces, hyphens, parentheses, and + prefix
    # Must contain at least some digits
    phone_pattern = r'^[\+]?[\d\s\-\(\)]+$'
    
    cleaned_phone = phone.strip()
    
    if not re.match(phone_pattern, cleaned_phone):
        raise ValidationError(f"Invalid phone number format: '{phone}'")
    
    # Ensure there are at least some digits in the phone number
    if not re.search(r'\d', cleaned_phone):
        raise ValidationError(f"Phone number must contain digits: '{phone}'")
