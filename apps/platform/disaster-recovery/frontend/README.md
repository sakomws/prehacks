# Disaster Recovery Documentation - Frontend

This is the frontend application for the Disaster Recovery Documentation System, built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (default: http://localhost:8000)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set the backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── documents/         # Document-related pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utility functions and API client
│   ├── api-client.ts     # Backend API client
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript type definitions
│   └── document.ts       # DR Document types
└── public/               # Static assets
```

## Features

- Document list and search interface
- Document creation and editing
- Version history viewer
- Notion import integration
- GitHub export functionality
- Validation and feedback UI
- Responsive design with Tailwind CSS

## API Client

The `lib/api-client.ts` module provides a typed interface to the backend API:

```typescript
import { apiClient } from '@/lib/api-client';

// List documents
const documents = await apiClient.listDocuments({ query: 'database' });

// Get a document
const doc = await apiClient.getDocument(id);

// Create a document
const newDoc = await apiClient.createDocument({ ... });
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:8000)
