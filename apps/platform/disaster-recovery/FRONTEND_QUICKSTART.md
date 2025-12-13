# Frontend Quick Start Guide

## Task 15: Set up Next.js frontend - COMPLETED ✅

All subtasks have been successfully implemented:

### ✅ 15.1 Initialize Next.js project
- Next.js 16 with TypeScript and App Router
- Tailwind CSS configured
- Directory structure created (components, app, lib, types)
- API client for backend communication
- Environment variables setup

### ✅ 15.2 Create document list and search UI
- Document list page with card/table views
- Search interface with keyword input
- Category and criticality filters
- Document metadata display
- Sorting and view controls

### ✅ 15.3 Create document detail and edit pages
- Document detail page with all sections
- Document creation form
- Document editing interface
- Version history viewer
- Validation status display
- Export and GitHub push buttons

### ✅ 15.4 Implement Notion import UI
- Notion import page with URL input
- API token configuration
- Import progress indicator
- Document preview before saving
- Error handling

### ✅ 15.5 Implement GitHub export UI
- GitHub export form
- Repository, branch, and path configuration
- Export progress indicator
- Commit URL display
- Error handling

### ✅ 15.6 Add validation and feedback UI
- Validation results display
- Outdated document warnings
- Toast notification system
- Form field components with inline validation
- Loading spinners
- Success/error feedback

## Running the Frontend

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local and set your backend URL
   # NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at http://localhost:3000

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Testing the Frontend

### Prerequisites
- Backend API must be running at the configured URL (default: http://localhost:8000)
- Backend should have the following endpoints available:
  - POST /api/documents
  - GET /api/documents
  - GET /api/documents/{id}
  - PUT /api/documents/{id}
  - DELETE /api/documents/{id}
  - And all other endpoints defined in the API client

### Manual Testing Checklist

1. **Home Page**
   - [ ] Navigate to http://localhost:3000
   - [ ] Click "View Documents" and "Create Document" buttons

2. **Document List**
   - [ ] View documents in card and table views
   - [ ] Search for documents by keyword
   - [ ] Filter by category and criticality
   - [ ] Click on a document to view details

3. **Create Document**
   - [ ] Fill out all required fields
   - [ ] Add procedures with steps
   - [ ] Add emergency contacts
   - [ ] Submit and verify creation

4. **Document Detail**
   - [ ] View all document sections
   - [ ] Check version history
   - [ ] Validate document
   - [ ] Export to Markdown/JSON
   - [ ] Navigate to GitHub export

5. **Edit Document**
   - [ ] Modify document fields
   - [ ] Add/remove procedures and contacts
   - [ ] Save changes
   - [ ] Verify version increment

6. **Notion Import**
   - [ ] Navigate to import page
   - [ ] Enter Notion URL and API token
   - [ ] Preview imported document
   - [ ] Save imported document

7. **GitHub Export**
   - [ ] Configure repository settings
   - [ ] Export document as PDF
   - [ ] Verify commit URL

## Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── documents/               # Document-related pages
│   │   ├── [id]/               # Dynamic document routes
│   │   │   ├── edit/           # Edit page
│   │   │   ├── github/         # GitHub export page
│   │   │   └── page.tsx        # Detail page
│   │   ├── import/notion/      # Notion import page
│   │   ├── new/                # Create new document page
│   │   └── page.tsx            # Document list page
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # Reusable React components
│   ├── FormField.tsx
│   ├── LoadingSpinner.tsx
│   ├── OutdatedWarning.tsx
│   ├── Toast.tsx
│   ├── ToastProvider.tsx
│   └── ValidationDisplay.tsx
├── lib/                        # Utility libraries
│   ├── api-client.ts          # Backend API client
│   └── utils.ts               # Helper functions
└── types/                      # TypeScript definitions
    └── document.ts            # DR Document types
```

## Key Features Implemented

### API Integration
- Full CRUD operations for documents
- Version management
- Document validation
- Export/Import (Markdown, JSON, Notion)
- GitHub integration

### User Interface
- Responsive design with Tailwind CSS
- Card and table views for document lists
- Advanced search and filtering
- Real-time validation feedback
- Toast notifications
- Loading states
- Error handling

### Form Management
- Dynamic form fields for procedures and contacts
- Inline validation
- Required field indicators
- Help text and error messages

### Document Management
- Create, read, update, delete documents
- Version history with revert capability
- Document validation
- Export to multiple formats
- Import from Notion
- Push to GitHub as PDF

## Next Steps

The frontend is now complete and ready for integration testing with the backend. To proceed:

1. Ensure the backend API is running
2. Test all features end-to-end
3. Address any integration issues
4. Consider adding:
   - User authentication
   - Role-based access control
   - Advanced search features
   - Bulk operations
   - Document templates

## Troubleshooting

### "Failed to load documents"
- Check that backend API is running
- Verify NEXT_PUBLIC_API_URL in .env.local
- Check browser console for CORS errors

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors with `npx tsc --noEmit`
- Clear .next directory and rebuild: `rm -rf .next && npm run build`

### Styling issues
- Ensure Tailwind CSS is properly configured
- Check that globals.css is imported in layout.tsx
- Verify PostCSS configuration

## Documentation

- Frontend README: `frontend/README.md`
- Setup Guide: `frontend/SETUP.md`
- API Client: `frontend/lib/api-client.ts`
- Type Definitions: `frontend/types/document.ts`
