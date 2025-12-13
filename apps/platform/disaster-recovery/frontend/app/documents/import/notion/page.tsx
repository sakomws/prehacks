"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { DRDocument } from "@/types/document";
import { formatDate, getCriticalityBadgeColor } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

export default function NotionImportPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [notionUrl, setNotionUrl] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<DRDocument | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setImporting(true);
    setError(null);
    setPreview(null);
    setShowPreview(false);

    try {
      const doc = await apiClient.importFromNotion({
        notionUrl,
        apiToken,
      });
      setPreview(doc);
      setShowPreview(true);
      showToast("Successfully imported from Notion", "success");
    } catch (err: any) {
      setError(err.message || "Failed to import from Notion");
      showToast(err.message || "Failed to import from Notion", "error");
    } finally {
      setImporting(false);
    }
  }

  function handleSaveDocument() {
    if (preview) {
      showToast("Navigating to document", "info");
      router.push(`/documents/${preview.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/documents" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Documents
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Import from Notion</h1>

        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold mb-1">Before you start:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Make sure you have a Notion integration set up with read permissions</li>
            <li>Share the page you want to import with your integration</li>
            <li>Have your Notion API token ready</li>
          </ul>
        </div>

        {!showPreview ? (
          <form onSubmit={handleImport} className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Import Configuration</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notion Page URL *
                  </label>
                  <input
                    type="url"
                    value={notionUrl}
                    onChange={(e) => setNotionUrl(e.target.value)}
                    required
                    placeholder="https://www.notion.so/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The full URL of the Notion page you want to import
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notion API Token *
                  </label>
                  <input
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    required
                    placeholder="secret_..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your Notion integration token (starts with "secret_")
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link
                href="/documents"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={importing}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {importing && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {importing ? "Importing..." : "Import from Notion"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✓ Successfully imported from Notion! Review the document below and save it.
            </div>

            {preview && (
              <>
                {/* Document Preview */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{preview.title}</h2>
                      <span
                        className={`inline-block mt-2 px-3 py-1 text-sm font-semibold rounded ${getCriticalityBadgeColor(
                          preview.criticality
                        )}`}
                      >
                        {preview.criticality.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="text-gray-600">Categories:</span>
                      <span className="ml-2 font-medium">{preview.categories.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <span className="ml-2 font-medium">{preview.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">RTO:</span>
                      <span className="ml-2 font-medium">{preview.rto} minutes</span>
                    </div>
                    <div>
                      <span className="text-gray-600">RPO:</span>
                      <span className="ml-2 font-medium">{preview.rpo} minutes</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Disaster Scenario</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{preview.scenario}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Recovery Procedures</h3>
                    <div className="space-y-3">
                      {preview.procedures.map((proc, idx) => (
                        <div key={idx} className="border border-gray-200 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{proc.name}</h4>
                            <span className="text-sm text-gray-600">
                              {proc.estimatedDuration} min
                            </span>
                          </div>
                          <ol className="list-decimal list-inside space-y-1 text-sm">
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

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Emergency Contacts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {preview.contacts.map((contact, idx) => (
                        <div key={idx} className="border border-gray-200 rounded p-3">
                          <h4 className="font-semibold">{contact.name}</h4>
                          <p className="text-gray-600 text-sm">{contact.role}</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <div>
                              <span className="text-gray-600">Phone:</span>
                              <span className="ml-2">{contact.phone}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <span className="ml-2">{contact.email}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      setPreview(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Import Another
                  </button>
                  <button
                    onClick={handleSaveDocument}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    View Document
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
