"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { DRDocument, DocumentVersion, ValidationResult } from "@/types/document";
import {
  formatDateTime,
  getCriticalityBadgeColor,
  isDocumentOutdated,
  formatDuration,
} from "@/lib/utils";
import { ValidationDisplay } from "@/components/ValidationDisplay";
import { ValidationStatus } from "@/components/ValidationStatus";
import { ValidationIndicator } from "@/components/ValidationIndicator";
import { OutdatedWarning } from "@/components/OutdatedWarning";
import { useToast } from "@/components/ToastProvider";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  const { showToast, showValidationToast, showValidationSuccess } = useToast();

  const [document, setDocument] = useState<DRDocument | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    loadDocument();
    loadVersions();
  }, [documentId]);

  async function loadDocument() {
    try {
      setLoading(true);
      setError(null);
      const doc = await apiClient.getDocument(documentId);
      setDocument(doc);
    } catch (err: any) {
      setError(err.message || "Failed to load document");
    } finally {
      setLoading(false);
    }
  }

  async function loadVersions() {
    try {
      const vers = await apiClient.getVersions(documentId);
      setVersions(vers);
    } catch (err: any) {
      console.error("Failed to load versions:", err);
    }
  }

  async function handleValidate() {
    try {
      setIsValidating(true);
      setShowValidation(true);
      const result = await apiClient.validateDocument(documentId);
      setValidation(result);
      if (result.valid) {
        if (result.warnings.length > 0) {
          showToast("Document is valid but has warnings", "warning", {
            title: "Validation Complete",
            details: result.warnings,
            duration: 6000
          });
        } else {
          showValidationSuccess("Document validation passed successfully");
        }
      } else {
        showValidationToast(result.errors);
      }
    } catch (err: any) {
      setError(err.message || "Failed to validate document");
      showToast(err.message || "Failed to validate document", "error", {
        title: "Validation Failed"
      });
    } finally {
      setIsValidating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await apiClient.deleteDocument(documentId);
      showToast("Document deleted successfully", "success");
      router.push("/documents");
    } catch (err: any) {
      setError(err.message || "Failed to delete document");
      showToast(err.message || "Failed to delete document", "error");
    }
  }

  async function handleExportMarkdown() {
    try {
      const markdown = await apiClient.exportMarkdown(documentId);
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${document?.title || "document"}.md`;
      link.click();
      showToast("Markdown exported successfully", "success");
    } catch (err: any) {
      setError(err.message || "Failed to export markdown");
      showToast(err.message || "Failed to export markdown", "error");
    }
  }

  async function handleExportJson() {
    try {
      const json = await apiClient.exportJson(documentId);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${document?.title || "document"}.json`;
      link.click();
      showToast("JSON exported successfully", "success");
    } catch (err: any) {
      setError(err.message || "Failed to export JSON");
      showToast(err.message || "Failed to export JSON", "error");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md">
          {error || "Document not found"}
        </div>
      </div>
    );
  }

  const isOutdated = isDocumentOutdated(document.updatedAt);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/documents" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Documents
          </Link>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded ${getCriticalityBadgeColor(
                    document.criticality
                  )}`}
                >
                  {document.criticality.toUpperCase()}
                </span>
              </div>
              <OutdatedWarning 
                updatedAt={document.updatedAt} 
                className="mt-2" 
                showActions={true}
                onUpdate={() => router.push(`/documents/${documentId}/edit`)}
              />
            </div>

            <div className="flex gap-2">
              <Link
                href={`/documents/${documentId}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <ValidationIndicator 
              validation={validation || undefined} 
              isValidating={isValidating}
              onValidate={handleValidate}
              className="flex-1"
              showDetails={false}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleValidate}
              disabled={isValidating}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? "Validating..." : "Validate"}
            </button>
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            >
              Version History ({versions.length})
            </button>
            <button
              onClick={handleExportMarkdown}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Export Markdown
            </button>
            <button
              onClick={handleExportJson}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Export JSON
            </button>
            <Link
              href={`/documents/${documentId}/github`}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
            >
              Push to GitHub
            </Link>
          </div>
        </div>

        {/* Validation Results */}
        {showValidation && validation && (
          <div className="mb-6">
            <ValidationDisplay 
              validation={validation} 
              onClose={() => setShowValidation(false)} 
            />
          </div>
        )}

        {/* Version History */}
        {showVersions && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Version History</h2>
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.version}
                  className="border border-gray-200 rounded p-3 flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold">Version {version.version}</span>
                    <span className="text-gray-600 ml-3">{formatDateTime(version.timestamp)}</span>
                  </div>
                  {version.version !== document.version && (
                    <button
                      onClick={async () => {
                        try {
                          await apiClient.revertToVersion(documentId, version.version);
                          showToast(`Reverted to version ${version.version}`, "success");
                          loadDocument();
                          loadVersions();
                        } catch (err: any) {
                          setError(err.message || "Failed to revert");
                          showToast(err.message || "Failed to revert", "error");
                        }
                      }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Revert to this version
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Content */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Metadata</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Categories:</span>
                <span className="ml-2 font-medium">{document.categories.join(", ")}</span>
              </div>
              <div>
                <span className="text-gray-600">Version:</span>
                <span className="ml-2 font-medium">{document.version}</span>
              </div>
              <div>
                <span className="text-gray-600">RTO:</span>
                <span className="ml-2 font-medium">{formatDuration(document.rto)}</span>
              </div>
              <div>
                <span className="text-gray-600">RPO:</span>
                <span className="ml-2 font-medium">{formatDuration(document.rpo)}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium">{formatDateTime(document.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-600">Updated:</span>
                <span className="ml-2 font-medium">{formatDateTime(document.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Disaster Scenario */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Disaster Scenario</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{document.scenario}</p>
          </div>

          {/* Recovery Procedures */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recovery Procedures</h2>
            <div className="space-y-4">
              {document.procedures.map((proc, idx) => (
                <div key={idx} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{proc.name}</h3>
                    <span className="text-sm text-gray-600">
                      Est. {formatDuration(proc.estimatedDuration)}
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1">
                    {proc.steps.map((step, stepIdx) => (
                      <li key={stepIdx} className="text-gray-700">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Emergency Contacts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {document.contacts.map((contact, idx) => (
                <div key={idx} className="border border-gray-200 rounded p-4">
                  <h3 className="font-semibold">{contact.name}</h3>
                  <p className="text-gray-600 text-sm">{contact.role}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <a href={`tel:${contact.phone}`} className="ml-2 text-blue-600">
                        {contact.phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <a href={`mailto:${contact.email}`} className="ml-2 text-blue-600">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
