"""Quick test to verify JSON export functionality."""
from models.document import DRDocument, Contact, Procedure
from services.export_import import export_to_json
import json

# Create a test document
doc = DRDocument(
    title='Test Document',
    scenario='Test scenario',
    procedures=[
        Procedure(name='Test Procedure', steps=['Step 1', 'Step 2'], estimated_duration=10)
    ],
    contacts=[
        Contact(name='John Doe', role='Admin', phone='+1-555-0100', email='john@example.com')
    ],
    rto=60,
    rpo=30,
    categories=['Test'],
    criticality='high'
)

# Export to JSON
json_str = export_to_json(doc)

# Verify it's valid JSON
parsed = json.loads(json_str)

# Check key fields are present
assert 'title' in parsed
assert 'scenario' in parsed
assert 'procedures' in parsed
assert 'contacts' in parsed
assert 'rto' in parsed
assert 'rpo' in parsed
assert 'categories' in parsed
assert 'criticality' in parsed

print('✓ JSON export function works correctly')
print('✓ All required fields are present in the JSON output')
print('✓ JSON is valid and parseable')
print('\nSample JSON output:')
print(json_str[:200] + '...')
