"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { DRDocument, GitHubExportRequest, GitHubExportResponse } from "@/types/document";
import { useToast } from "@/components/ToastProvider";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function GitHubExportPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  const { showToast } = useToast();

  const [document, setDocument] = useState<DRDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<GitHubExportResponse | null>(null);

  // Form state
  const [formData, setFormData] = useState<GitHubExportRequest>({
    repository: "",
    branch: "main",
    path: "",
    token: "",
    format: "pdf",
  });

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  async function loadDocument() {
    try {
      setLoading(true);
      setError(null);
      const doc = await apiClient.getDocument(documentId);
      setDocument(doc);
      
      // Set default path based on document title
      setFormData(prev => ({
        ...prev,
        path: `disaster-recovery/${doc.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`
      }));
    } catch (err: any) {
      setError(err.message || "Failed to load document");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field: keyof GitHubExportRequest, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  async function handleExport() {
    if (!formData.repository.trim()) {
      showToast("Repository name is required", "error");
      return;
    }

    if (!formData.token.trim()) {
      showToast("GitHub token is required", "error");
      return;
    }

    if (!formData.branch.trim()) {
      showToast("Branch name is required", "error");
      return;
    }

    try {
      setExporting(true);
      setError(null);
      setExportResult(null);

      const result = await apiClient.exportToGitHub(documentId, formData);
      setExportResult(result);
      showToast("Document exported to GitHub successfully!", "success");
    } catch (err: any) {
      setError(err.message || "Failed to export to GitHub");
      showToast(err.message || "Failed to export to GitHub", "error");
    } finally {
      setExporting(false);
    }
  }

  function handleReset() {
    setExportResult(null);
    setError(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error && !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/documents/${documentId}`} 
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Document
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Export to GitHub</h1>
          </div>
          
          {document && (
            <p className="text-gray-600">
              Export "{document.title}" as a PDF to your GitHub repository
            </p>
          )}
        </div>

        {/* Export Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Repository Configuration</h2>
          
          <div className="space-y-4">
            {/* GitHub Token */}
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Personal Access Token *
              </label>
              <input
                type="password"
                id="token"
                value={formData.token}
                onChange={(e) => handleInputChange("token", e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={exporting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Token needs 'repo' scope to commit files. 
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Create token
                </a>
              </p>
            </div>

            {/* Repository */}
            <div>
              <label htmlFor="repository" className="block text-sm font-medium text-gray-700 mb-1">
                Repository *
              </label>
              <input
                type="text"
                id="repository"
                value={formData.repository}
                onChange={(e) => handleInputChange("repository", e.target.value)}
                placeholder="username/repository-name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={exporting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: owner/repository-name (e.g., "mycompany/disaster-recovery-docs")
              </p>
            </div>

            {/* Branch */}
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                Branch *
              </label>
              <input
                type="text"
                id="branch"
                value={formData.branch}
                onChange={(e) => handleInputChange("branch", e.target.value)}
                placeholder="main"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={exporting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Target branch for the commit (must exist)
              </p>
            </div>

            {/* File Path */}
            <div>
              <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-1">
                File Path
              </label>
              <input
                type="text"
                id="path"
                value={formData.path}
                onChange={(e) => handleInputChange("path", e.target.value)}
                placeholder="docs/disaster-recovery/document.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={exporting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Path where the file will be saved in the repository (optional)
              </p>
            </div>

            {/* Format */}
            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                Export Format
              </label>
              <select
                id="format"
                value={formData.format}
                onChange={(e) => handleInputChange("format", e.target.value as "pdf" | "markdown")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={exporting}
              >
                <option value="pdf">PDF</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Export Button */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exporting && <LoadingSpinner size="sm" />}
              {exporting ? "Exporting..." : "Export to GitHub"}
            </button>
            
            {exportResult && (
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Export Another
              </button>
            )}
          </div>
        </div>

        {/* Export Success */}
        {exportResult && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800">Export Successful!</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-green-800">Commit URL:</span>
                <a 
                  href={exportResult.commitUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline break-all"
                >
                  {exportResult.commitUrl}
                </a>
              </div>
              
              <div>
                <span className="font-medium text-green-800">File URL:</span>
                <a 
                  href={exportResult.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline break-all"
                >
                  {exportResult.fileUrl}
                </a>
              </div>
              
              <div>
                <span className="font-medium text-green-800">File Path:</span>
                <span className="ml-2 text-green-700 font-mono">{exportResult.filePath}</span>
              </div>
              
              <div>
                <span className="font-medium text-green-800">Branch:</span>
                <span className="ml-2 text-green-700">{exportResult.branch}</span>
              </div>
              
              <div>
                <span className="font-medium text-green-800">Format:</span>
                <span className="ml-2 text-green-700 uppercase">{exportResult.format}</span>
              </div>
              
              <div>
                <span className="font-medium text-green-800">Commit SHA:</span>
                <span className="ml-2 text-green-700 font-mono">{exportResult.sha}</span>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>
              <strong>GitHub Token:</strong> Create a personal access token with 'repo' scope at{" "}
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline"
              >
                GitHub Settings
              </a>
            </p>
            <p>
              <strong>Repository:</strong> Use the format "owner/repository-name" (e.g., "mycompany/docs")
            </p>
            <p>
              <strong>Branch:</strong> The target branch must already exist in your repository
            </p>
            <p>
              <strong>File Path:</strong> If not specified, the file will be saved in the root directory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}