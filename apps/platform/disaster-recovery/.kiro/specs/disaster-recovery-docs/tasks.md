# Implementation Plan

- [x] 1. Set up backend project structure
  - Create Python project with FastAPI
  - Set up directory structure: models, services, repositories, api, tests
  - Configure pytest and Hypothesis for property-based testing
  - Create requirements.txt with dependencies (fastapi, uvicorn, pydantic, hypothesis, pytest)
  - _Requirements: 1.1, 3.1_

- [x] 2. Implement core document model and validation
- [x] 2.1 Create document model with all required fields
  - Implement DRDocument class with id, title, scenario, procedures, contacts, RTO, RPO, category, criticality, timestamps, and version
  - Implement Procedure and Contact interfaces
  - _Requirements: 1.1, 3.1_

- [x] 2.2 Write property test for document structure completeness
  - **Property 1: Document structure completeness**
  - **Validates: Requirements 1.1, 3.1**

- [x] 2.3 Implement input validation for document fields
  - Create validation functions for scenario (non-empty, non-whitespace)
  - Create validation for RTO/RPO (positive numbers)
  - Create validation for criticality levels (enum check)
  - _Requirements: 1.2, 1.5, 2.2_

- [x] 2.4 Write property test for scenario validation
  - **Property 2: Non-empty scenario validation**
  - **Validates: Requirements 1.2**

- [x] 2.5 Write property test for RTO/RPO validation
  - **Property 5: RTO and RPO validation**
  - **Validates: Requirements 1.5**

- [x] 2.6 Write property test for criticality validation
  - **Property 6: Criticality level validation**
  - **Validates: Requirements 2.2**

- [x] 2.7 Implement procedure validation
  - Create validation to ensure procedures have names and steps
  - _Requirements: 1.3_

- [x] 2.8 Write property test for procedure structure
  - **Property 3: Procedure structure validation**
  - **Validates: Requirements 1.3**

- [x] 3. Implement contact management and validation
- [x] 3.1 Create contact validation functions
  - Implement email format validation (regex-based)
  - Implement phone number format validation
  - _Requirements: 3.2, 3.3_

- [x] 3.2 Write property test for phone validation
  - **Property 9: Phone number format validation**
  - **Validates: Requirements 3.2**

- [x] 3.3 Write property test for email validation
  - **Property 10: Email format validation**
  - **Validates: Requirements 3.3**

- [x] 3.4 Write property test for contact retrieval completeness
  - **Property 11: Contact information retrieval completeness**
  - **Validates: Requirements 3.4**

- [x] 4. Implement document repository and persistence
- [x] 4.1 Create document repository interface
  - Define methods: save, findById, findByCategory, findByCriticality, findAll, update, delete
  - _Requirements: 1.4, 2.1, 2.3, 2.4_

- [x] 4.2 Implement in-memory repository implementation
  - Create concrete repository using Map for storage
  - Generate unique IDs for documents
  - Implement all CRUD operations
  - _Requirements: 1.4, 2.1_

- [x] 4.3 Write property test for persistence round-trip
  - **Property 4: Document persistence round-trip**
  - **Validates: Requirements 1.4, 2.1**

- [x] 4.4 Implement filtering by category and criticality
  - Add filter logic to repository methods
  - _Requirements: 2.3, 2.4_

- [x] 4.5 Write property test for attribute-based filtering
  - **Property 7: Attribute-based filtering**
  - **Validates: Requirements 2.3, 2.4**

- [x] 4.6 Implement document listing with criticality sorting
  - Create sorting logic for criticality levels
  - _Requirements: 2.5_

- [x] 4.7 Write property test for criticality sorting
  - **Property 8: Criticality-based sorting**
  - **Validates: Requirements 2.5**

- [x] 5. Implement version management
- [x] 5.1 Create version manager component
  - Implement version storage and retrieval
  - Create methods: createVersion, getLatestVersion, getVersion, listVersions, revertToVersion
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5.2 Implement version creation on document updates
  - Store previous version when document is updated
  - Increment version numbers automatically
  - _Requirements: 4.1_

- [x] 5.3 Write property test for version preservation
  - **Property 12: Version history preservation on update**
  - **Validates: Requirements 3.5, 4.1**

- [x] 5.4 Implement latest version retrieval
  - Return highest version number by default
  - _Requirements: 4.2_

- [x] 5.5 Write property test for latest version retrieval
  - **Property 13: Latest version retrieval**
  - **Validates: Requirements 4.2**

- [x] 5.6 Implement specific version retrieval
  - Allow retrieval by version number
  - _Requirements: 4.3_

- [x] 5.7 Write property test for specific version accuracy
  - **Property 14: Specific version retrieval accuracy**
  - **Validates: Requirements 4.3**

- [x] 5.8 Implement version listing with chronological ordering
  - Return all versions sorted by timestamp
  - _Requirements: 4.4_

- [x] 5.9 Write property test for version list ordering
  - **Property 15: Version list completeness and ordering**
  - **Validates: Requirements 4.4**

- [x] 5.10 Implement version revert functionality
  - Create new version with content from specified previous version
  - _Requirements: 4.5_

- [x] 5.11 Write property test for version revert
  - **Property 16: Version revert creates new version**
  - **Validates: Requirements 4.5**

- [x] 6. Implement export and import functionality
- [x] 6.1 Create Markdown export function
  - Format document as Markdown with all sections
  - Include proper Markdown syntax for headings, lists, etc.
  - _Requirements: 5.1_

- [x] 6.2 Write property test for Markdown export completeness
  - **Property 17: Markdown export completeness**
  - **Validates: Requirements 5.1**

- [x] 6.3 Create JSON export function
  - Serialize document to JSON string
  - _Requirements: 5.2_

- [x] 6.4 Write property test for JSON export validity
  - **Property 18: JSON export validity**
  - **Validates: Requirements 5.2**

- [x] 6.5 Create JSON import function
  - Parse JSON string and create document object
  - Handle parse errors gracefully
  - _Requirements: 5.3_

- [x] 6.6 Write property test for JSON import validity
  - **Property 19: JSON import validity**
  - **Validates: Requirements 5.3**

- [x] 6.7 Write property test for JSON round-trip
  - **Property 20: JSON serialization round-trip**
  - **Validates: Requirements 5.4**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement document validation service
- [x] 8.1 Create validator component
  - Implement validation for required sections
  - Check contact information validity
  - Verify RTO/RPO are defined
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 8.2 Write property test for missing sections detection
  - **Property 21: Validation detects missing required sections**
  - **Validates: Requirements 6.1, 6.3**

- [x] 8.3 Write property test for invalid contact detection
  - **Property 22: Validation detects invalid contacts**
  - **Validates: Requirements 6.2**

- [x] 8.4 Implement comprehensive validation reporting
  - Collect all validation errors, not just first one
  - Return detailed error messages
  - _Requirements: 6.4_

- [x] 8.5 Write property test for validation completeness
  - **Property 23: Validation reports all issues**
  - **Validates: Requirements 6.4**

- [x] 8.6 Implement outdated document flagging
  - Check if last update is more than 90 days ago
  - _Requirements: 6.5_

- [x] 8.7 Write property test for outdated flagging
  - **Property 24: Outdated document flagging**
  - **Validates: Requirements 6.5**

- [x] 9. Implement search functionality
- [x] 9.1 Create search engine component
  - Implement keyword search across title, scenario, and procedures
  - Support case-insensitive matching
  - Handle multiple keywords (OR logic)
  - _Requirements: 7.1, 7.2, 7.5_

- [x] 9.2 Write property test for keyword search completeness
  - **Property 25: Keyword search completeness**
  - **Validates: Requirements 7.1, 7.2, 7.5**

- [x] 9.3 Implement search result ranking
  - Rank exact title matches first
  - Then scenario matches, then procedure matches
  - _Requirements: 7.4_

- [x] 9.4 Write property test for search ranking
  - **Property 26: Search result ranking by title match**
  - **Validates: Requirements 7.4**

- [x] 9.5 Write unit test for empty query handling
  - Test that empty search returns all documents
  - _Requirements: 7.3_

- [x] 10. Create document service layer
- [x] 10.1 Implement high-level document service
  - Combine repository, version manager, validator, and search
  - Provide methods: createDocument, updateDocument, getDocument, searchDocuments, validateDocument, exportDocument, importDocument
  - Wire all components together
  - _Requirements: All_

- [x] 10.2 Write integration tests for document service
  - Test complete workflows: create, update, search, export/import
  - Test error handling paths
  - _Requirements: All_

- [x] 11. Implement Notion integration
- [x] 11.1 Create Notion API client
  - Implement authentication with Notion API using API token
  - Create methods to retrieve page content by URL or page ID
  - Handle API errors and rate limiting
  - _Requirements: 8.1, 8.2_

- [x] 11.2 Implement Notion page parser
  - Parse Notion blocks and extract text content
  - Map Notion structure to DR document fields (title, scenario, procedures, contacts)
  - Extract disaster scenarios from Notion pages
  - Parse contact information from Notion tables/databases
  - Validate extracted contact details
  - _Requirements: 8.3, 8.4, 8.5_

- [x] 11.3 Write property test for Notion import validity
  - **Property 27: Notion import creates valid documents**
  - **Validates: Requirements 8.2, 8.3**

- [x] 11.4 Write property test for Notion contact parsing
  - **Property 28: Notion contact parsing preserves data**
  - **Validates: Requirements 8.5**

- [x] 12. Implement PDF generation and GitHub integration
- [x] 12.1 Create PDF generator
  - Implement PDF generation using ReportLab or WeasyPrint
  - Format all document sections with proper styling (headings, lists, tables)
  - Handle special characters and formatting
  - Include document metadata (title, dates, version)
  - _Requirements: 9.2_

- [x] 12.2 Write property test for PDF completeness
  - **Property 29: PDF export completeness**
  - **Validates: Requirements 9.2**

- [x] 12.3 Create GitHub API client
  - Implement authentication with GitHub API using access token
  - Create methods to commit files to repositories
  - Handle branch specification and commit messages
  - Support creating commits with file content
  - _Requirements: 9.1, 9.3, 9.4_

- [x] 12.4 Implement GitHub export workflow
  - Generate PDF from document
  - Commit PDF to specified GitHub repository and branch
  - Create descriptive commit message with document title and timestamp
  - Return commit URL and file path in repository
  - _Requirements: 9.5_

- [x] 12.5 Write property test for GitHub commit verification
  - **Property 30: GitHub commit success verification**
  - **Validates: Requirements 9.5**

- [x] 12.6 Write unit tests for GitHub integration
  - Test authentication failures
  - Test invalid repository specifications
  - Test commit message formatting
  - _Requirements: 9.1, 9.3, 9.4_

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Create FastAPI endpoints
- [x] 14.1 Implement REST API endpoints
  - POST /api/documents - Create document
  - GET /api/documents/{id} - Get document
  - PUT /api/documents/{id} - Update document
  - DELETE /api/documents/{id} - Delete document
  - GET /api/documents - List/search documents with query parameters
  - POST /api/documents/import/notion - Import from Notion
  - POST /api/documents/{id}/export/github - Export to GitHub as PDF
  - GET /api/documents/{id}/versions - List versions
  - POST /api/documents/{id}/revert/{version} - Revert to version
  - POST /api/documents/{id}/validate - Validate document
  - GET /api/documents/{id}/export/markdown - Export as Markdown
  - GET /api/documents/{id}/export/json - Export as JSON
  - _Requirements: All_

- [x] 14.2 Implement request/response models with Pydantic
  - Define API request schemas for all endpoints
  - Define response schemas with proper typing
  - Add validation for all inputs
  - Create error response models
  - _Requirements: All_

- [x] 14.3 Add error handling and HTTP status codes
  - Return appropriate status codes (200, 201, 400, 404, 500)
  - Format error responses consistently
  - Handle validation errors from Pydantic
  - Add logging for errors
  - _Requirements: All_

- [x] 14.4 Write API integration tests
  - Test all endpoints with valid and invalid inputs
  - Test error responses and status codes
  - Test Notion and GitHub integration endpoints
  - Test authentication and authorization
  - _Requirements: All_

- [x] 15. Set up Next.js frontend
- [x] 15.1 Initialize Next.js project
  - Create Next.js app with TypeScript and App Router
  - Set up directory structure (components, app, lib, types)
  - Configure Tailwind CSS for styling
  - Create API client for backend communication
  - Set up environment variables for API URL
  - _Requirements: All_

- [x] 15.2 Create document list and search UI
  - Build document list page with card/table view
  - Implement search interface with keyword input
  - Add category and criticality filter dropdowns
  - Show document metadata (title, category, criticality, last updated)
  - Add sorting controls
  - Implement pagination or infinite scroll
  - _Requirements: 2.3, 2.4, 2.5, 7.1, 7.2, 7.4, 7.5_

- [x] 15.3 Create document detail and edit pages
  - Build document view page showing all sections
  - Create document creation form with all required fields
  - Implement document editing interface
  - Add version history viewer with timeline
  - Show validation status and warnings
  - Add buttons for export and GitHub push
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4_

- [x] 15.4 Implement Notion import UI
  - Create Notion import page/modal with URL input
  - Add API token configuration
  - Show import progress indicator
  - Display imported document preview before saving
  - Handle import errors with user-friendly messages
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 15.5 Implement GitHub export UI
  - Create GitHub export form with repository configuration
  - Add fields for repository, branch, and path
  - Show export progress indicator
  - Display commit URL after successful export
  - Handle export errors with user-friendly messages
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 15.6 Add validation and feedback UI
  - Display validation results with detailed error messages
  - Show outdated document warnings with visual indicators
  - Provide inline validation feedback on forms
  - Add success/error toast notifications
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 16. Complete remaining property-based tests
- [x] 16.1 Write property test for JSON round-trip
  - **Property 20: JSON serialization round-trip**
  - **Validates: Requirements 5.4**

- [x] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
