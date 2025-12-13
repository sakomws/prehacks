export type CriticalityLevel = "critical" | "high" | "medium" | "low";

export interface Contact {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface Procedure {
  name: string;
  steps: string[];
  estimatedDuration: number;
}

export interface DRDocument {
  id: string;
  title: string;
  scenario: string;
  procedures: Procedure[];
  contacts: Contact[];
  rto: number;
  rpo: number;
  categories: string[];
  criticality: CriticalityLevel;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface DocumentVersion {
  documentId: string;
  version: number;
  content: DRDocument;
  timestamp: string;
  previousVersion: number | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface SearchParams {
  query?: string;
  category?: string;
  criticality?: CriticalityLevel;
  page?: number;
  limit?: number;
}

export interface NotionImportRequest {
  notionUrl: string;
  apiToken: string;
}

export interface GoogleDocsImportRequest {
  documentUrl: string;
  accessToken?: string;
}

export interface GitHubExportRequest {
  repository: string;
  branch: string;
  path?: string;
  token: string;
  format?: "pdf" | "markdown";
}

export interface GitHubExportResponse {
  commitUrl: string;
  filePath: string;
  fileUrl: string;
  sha: string;
  branch: string;
  format: string;
}

export interface AIReviewRequest {
  openaiApiKey: string;
  focusAreas?: string[];
}

export interface AIReviewResponse {
  overallScore: number;
  summary: string;
  suggestions: Array<{
    section: string;
    priority: string;
    suggestion: string;
    rationale: string;
  }>;
  complianceCheck: Record<string, string>;
  improvedDocument?: DRDocument;
}

export interface DocumentSyncRequest {
  platforms: string[];
  githubConfig?: {
    token: string;
    repoName: string;
    branch?: string;
    format?: string;
  };
  notionConfig?: {
    token: string;
    pageId: string;
  };
  googleDocsConfig?: {
    accessToken?: string;
    documentId: string;
  };
}

export interface DocumentSyncResponse {
  documentId: string;
  syncSummary: {
    successfulSyncs: number;
    failedSyncs: number;
    platformsSynced: string[];
    platformsFailed: string[];
    syncDetails: Array<{
      platform: string;
      status: string;
      message: string;
    }>;
  };
}
