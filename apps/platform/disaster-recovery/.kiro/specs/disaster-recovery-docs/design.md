# Design Document

## Overview

The disaster recovery documentation repository system is a structured document management system designed to help organizations maintain comprehensive disaster recovery procedures. The system provides document creation, versioning, categorization, validation, search, and export capabilities. The architecture emphasizes data integrity, ease of use, and reliable access to critical information during emergencies.

## Architecture

The system follows a layered architecture with a Python backend and Next.js frontend:

**Backend (Python)**:
- **Data Layer**: Handles persistence of DR documents, versions, and metadata
- **Domain Layer**: Contains core business logic for document management, validation, and versioning
- **Service Layer**: Provides high-level operations for document lifecycle management
- **API Layer**: FastAPI REST endpoints exposing document operations
- **Export/Import Layer**: Handles serialization and deserialization to various formats

**Frontend (Next.js)**:
- **UI Components**: React components for document creation, editing, viewing, and search
- **API Client**: Handles communication with Python backend
- **State Management**: Manages application state and caching
- **Pages**: Next.js pages for different views (list, detail, search, etc.)

The backend uses a repository pattern to abstract data access, making it easy to swap storage backends (file system, database, etc.) without affecting business logic. The frontend communicates with the backend via REST API.

## Components and Interfaces

### Document Model
- Represents a disaster recovery document with all required fields
- Contains disaster scenario, recovery procedures, contacts, RTO, RPO, category, and criticality
- Immutable once created (modifications create new versions)

### Version Manager
- Manages document versioning
- Creates new versions on updates
- Retrieves specific versions or latest version
- Maintains version history with timestamps

### Document Repository
- Persists and retrieves documents
- Supports querying by ID, category, criticality
- Handles document storage and retrieval operations

### Validator
- Validates document completeness
- Checks required fields are present and properly formatted
- Validates contact information (email, phone formats)
- Flags outdated documents based on last update timestamp

### Search Engine
- Indexes document content for fast searching
- Supports keyword-based search across title, scenario, and procedures
- Ranks results by relevance
- Performs case-insensitive matching

### Export/Import Service
- Serializes documents to Markdown and JSON formats
- Deserializes documents from JSON
- Ensures round-trip consistency

### Notion Integration Service
- Authenticates with Notion API
- Retrieves page content from Notion
- Parses Notion blocks and maps to DR document structure
- Extracts disaster scenarios, procedures, and contacts from Notion pages

### GitHub Integration Service
- Authenticates with GitHub API
- Generates PDF from DR documents
- Commits PDF files to specified GitHub repositories
- Returns commit information and file URLs

### PDF Generator
- Converts DR documents to formatted PDF
- Includes all sections with proper styling
- Handles special characters and formatting

## Data Models

### DRDocument
```
{
  id: string (unique identifier)
  title: string
  scenario: string (disaster scenario description)
  procedures: Procedure[]
  contacts: Contact[]
  rto: number (in minutes)
  rpo: number (in minutes)
  category: string
  criticality: "critical" | "high" | "medium" | "low"
  createdAt: timestamp
  updatedAt: timestamp
  version: number
}
```

### Procedure
```
{
  name: string
  steps: string[]
  estimatedDuration: number (in minutes)
}
```

### Contact
```
{
  name: string
  role: string
  phone: string
  email: string
}
```

### DocumentVersion
```
{
  documentId: string
  version: number
  content: DRDocument
  timestamp: timestamp
  previousVersion: number | null
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Core Document Properties

### Property 1: Document structure completeness
*For any* DR document created by the system, the document should contain all required sections: disaster scenario, recovery procedures list, contacts list, RTO value, RPO value, category, and criticality level.
**Validates: Requirements 1.1, 3.1**

### Property 2: Non-empty scenario validation
*For any* string input for disaster scenario, the system should reject inputs that are empty or contain only whitespace characters.
**Validates: Requirements 1.2**

### Property 3: Procedure structure validation
*For any* procedure added to a document, the procedure should have a non-empty name and a non-empty list of steps.
**Validates: Requirements 1.3**

### Property 4: Document persistence round-trip
*For any* valid DR document, saving the document and then retrieving it by its ID should return a document with equivalent content and a unique identifier.
**Validates: Requirements 1.4, 2.1**

### Property 5: RTO and RPO validation
*For any* numeric input for RTO or RPO, the system should accept only positive values and reject zero or negative values.
**Validates: Requirements 1.5**

### Property 6: Criticality level validation
*For any* criticality level input, the system should accept only the values "critical", "high", "medium", or "low" and reject all other values.
**Validates: Requirements 2.2**

### Property 7: Attribute-based filtering
*For any* collection of documents and any attribute value (category or criticality), filtering by that attribute should return exactly the documents that have that attribute value and no others.
**Validates: Requirements 2.3, 2.4**

### Property 8: Criticality-based sorting
*For any* collection of documents, listing them should return documents ordered by criticality in the sequence: critical, high, medium, low.
**Validates: Requirements 2.5**

### Property 9: Phone number format validation
*For any* phone number input, the system should accept valid phone number formats and reject invalid formats (including empty strings and non-numeric characters in inappropriate positions).
**Validates: Requirements 3.2**

### Property 10: Email format validation
*For any* email address input, the system should accept valid email formats (containing @ symbol with local and domain parts) and reject invalid formats.
**Validates: Requirements 3.3**

### Property 11: Contact information retrieval completeness
*For any* DR document with contacts, retrieving the document should return all contacts with all their fields (name, role, phone, email) intact.
**Validates: Requirements 3.4**

### Property 12: Version history preservation on update
*For any* DR document that is updated, the previous version should remain accessible with its original content unchanged, including all contact information.
**Validates: Requirements 3.5, 4.1**

### Property 13: Latest version retrieval
*For any* DR document with multiple versions, retrieving the document without specifying a version should return the version with the highest version number.
**Validates: Requirements 4.2**

### Property 14: Specific version retrieval accuracy
*For any* DR document and any valid version number, requesting that specific version should return the document content exactly as it was at that version.
**Validates: Requirements 4.3**

### Property 15: Version list completeness and ordering
*For any* DR document with multiple versions, listing versions should return all versions in chronological order with correct timestamps and version numbers.
**Validates: Requirements 4.4**

### Property 16: Version revert creates new version
*For any* DR document, reverting to a previous version should create a new version (with incremented version number) whose content matches the specified previous version.
**Validates: Requirements 4.5**

### Property 17: Markdown export completeness
*For any* DR document, exporting to Markdown should produce a string that contains all document sections (title, scenario, procedures, contacts, RTO, RPO, category, criticality).
**Validates: Requirements 5.1**

### Property 18: JSON export validity
*For any* DR document, exporting to JSON should produce a valid JSON string that can be parsed back into a JSON object.
**Validates: Requirements 5.2**

### Property 19: JSON import validity
*For any* valid JSON representation of a DR document, importing should successfully create a DR document with all fields populated.
**Validates: Requirements 5.3**

### Property 20: JSON serialization round-trip
*For any* DR document, exporting to JSON and then importing from that JSON should produce a document equivalent to the original.
**Validates: Requirements 5.4**

### Property 21: Validation detects missing required sections
*For any* DR document, validation should report an error if any required section (scenario, procedures, contacts, RTO, RPO) is missing or empty.
**Validates: Requirements 6.1, 6.3**

### Property 22: Validation detects invalid contacts
*For any* DR document with contacts, validation should report an error if any contact has invalid email or phone number formats.
**Validates: Requirements 6.2**

### Property 23: Validation reports all issues
*For any* DR document with multiple validation issues, validation should report all issues, not just the first one encountered.
**Validates: Requirements 6.4**

### Property 24: Outdated document flagging
*For any* DR document, if the document's last update timestamp is more than 90 days before the current date, the system should flag it as potentially outdated.
**Validates: Requirements 6.5**

### Property 25: Keyword search completeness
*For any* collection of documents and any search keyword, the search should return all and only those documents where the keyword appears (case-insensitive) in the title, scenario description, or procedure text.
**Validates: Requirements 7.1, 7.2, 7.5**

### Property 26: Search result ranking by title match
*For any* search results, documents with the keyword in the title should appear before documents with the keyword only in scenario or procedures.
**Validates: Requirements 7.4**

### Integration Properties

### Property 27: Notion import creates valid documents
*For any* valid Notion page content, importing from Notion should create a DR document that passes all validation rules.
**Validates: Requirements 8.2, 8.3**

### Property 28: Notion contact parsing preserves data
*For any* Notion page containing contact information, importing should extract all contacts with properly formatted email and phone numbers.
**Validates: Requirements 8.5**

### Property 29: PDF export completeness
*For any* DR document, generating a PDF should produce a valid PDF file containing all document sections (title, scenario, procedures, contacts, RTO, RPO).
**Validates: Requirements 9.2**

### Property 30: GitHub commit success verification
*For any* successful GitHub export, the system should return a valid commit URL that points to the uploaded PDF file.
**Validates: Requirements 9.5**

## Error Handling

The system will handle errors gracefully with clear error messages:

- **Validation Errors**: Return detailed messages indicating which fields are invalid and why
- **Not Found Errors**: Return clear messages when documents or versions don't exist
- **Parse Errors**: Return informative messages when JSON import fails, including the location of the error
- **Storage Errors**: Handle persistence failures with retry logic and clear error reporting
- **Concurrent Modification**: Use optimistic locking to detect and handle concurrent updates

All errors should be logged for debugging while presenting user-friendly messages to the caller.

## Testing Strategy

The system will employ a comprehensive testing approach combining unit tests and property-based tests.

### Unit Testing

Unit tests will cover:
- Specific examples of document creation with known inputs
- Edge cases like empty contact lists, single-version documents
- Error conditions such as invalid IDs, malformed JSON
- Integration between components (e.g., repository and version manager)

### Property-Based Testing

Property-based testing will be implemented using **Hypothesis** for the Python backend.

**Configuration**:
- Each property-based test MUST run a minimum of 100 iterations
- Each test MUST be tagged with a comment referencing the correctness property from this design document
- Tag format: `# Feature: disaster-recovery-docs, Property {number}: {property_text}`

**Property Test Coverage**:
Each correctness property listed above will be implemented as a property-based test. The tests will:
- Generate random valid and invalid inputs
- Verify the specified property holds across all generated inputs
- Use smart generators that constrain inputs to realistic values (e.g., valid date ranges, realistic document structures)
- Include edge cases in the generation strategy (empty strings, special characters, boundary values)

**Generator Strategy**:
- Document generator: Creates random documents with varying numbers of procedures and contacts
- Contact generator: Creates contacts with valid and invalid email/phone formats
- Version generator: Creates documents with multiple versions
- Search term generator: Creates keywords that may or may not appear in documents
- Timestamp generator: Creates dates within realistic ranges for testing outdated flagging

The property-based tests will catch bugs that unit tests might miss by exploring a large input space automatically.
