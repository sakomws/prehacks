"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { DRDocument, CriticalityLevel } from "@/types/document";
import { formatDate, getCriticalityBadgeColor, isDocumentOutdated } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";
import { OutdatedWarning } from "@/components/OutdatedWarning";
import { ValidationIndicator } from "@/components/ValidationIndicator";

type SortField = "title" | "updatedAt" | "criticality" | "category";
type SortOrder = "asc" | "desc";

export default function DocumentsPage() {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<DRDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [criticalityFilter, setCriticalityFilter] = useState<CriticalityLevel | "">("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = Array.from(new Set(documents.flatMap((doc) => doc.categories)));

  useEffect(() => {
    loadDocuments();
  }, [searchQuery, categoryFilter, criticalityFilter]);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError(null);
      const docs = await apiClient.listDocuments({
        query: searchQuery || undefined,
        category: categoryFilter || undefined,
        criticality: criticalityFilter || undefined,
      });
      setDocuments(docs);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
      showToast(err.message || "Failed to load documents", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDuplicate(documentId: string) {
    try {
      const duplicatedDoc = await apiClient.duplicateDocument(documentId);
      showToast(`Document duplicated successfully: "${duplicatedDoc.title}"`, "success");
      // Reload documents to show the new duplicate
      await loadDocuments();
    } catch (err: any) {
      showToast(err.message || "Failed to duplicate document", "error");
    }
  }

  function handleSelectDocument(documentId: string, selected: boolean) {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(documentId);
      } else {
        newSet.delete(documentId);
      }
      return newSet;
    });
  }

  function handleSelectAll(selected: boolean) {
    if (selected) {
      setSelectedDocuments(new Set(paginatedDocuments.map(doc => doc.id)));
    } else {
      setSelectedDocuments(new Set());
    }
  }

  async function handleBulkDelete() {
    if (selectedDocuments.size === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedDocuments.size} document${selectedDocuments.size !== 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const documentIds = Array.from(selectedDocuments);
      const result = await apiClient.bulkDeleteDocuments(documentIds);

      // Show results
      if (result.deletedCount > 0) {
        showToast(
          `Successfully deleted ${result.deletedCount} document${result.deletedCount !== 1 ? 's' : ''}`,
          "success"
        );
      }

      if (result.failedCount > 0) {
        showToast(
          `Failed to delete ${result.failedCount} document${result.failedCount !== 1 ? 's' : ''}`,
          "error",
          {
            details: result.failedIds.map(id => `Document ID: ${id}`)
          }
        );
      }

      // Clear selection and reload documents
      setSelectedDocuments(new Set());
      await loadDocuments();
    } catch (err: any) {
      showToast("Failed to delete documents", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  function clearSelection() {
    setSelectedDocuments(new Set());
  }

  // Sorting logic
  const sortedDocuments = useMemo(() => {
    const sorted = [...documents];
    
    const criticalityOrder: Record<CriticalityLevel, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "criticality":
          comparison = criticalityOrder[a.criticality] - criticalityOrder[b.criticality];
          break;
        case "category":
          comparison = a.categories[0]?.localeCompare(b.categories[0] || "") || 0;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [documents, sortField, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedDocuments.slice(startIndex, endIndex);
  }, [sortedDocuments, currentPage, itemsPerPage]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field with default order
      setSortField(field);
      setSortOrder(field === "updatedAt" || field === "criticality" ? "desc" : "asc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DR Documents</h1>
            <p className="text-gray-600 mt-1">Manage disaster recovery documentation</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/documents/import/notion"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Import from Notion
            </Link>
            <Link
              href="/documents/import/google-docs"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Import from Google Docs
            </Link>
            <Link
              href="/documents/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Document
            </Link>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDocuments.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-blue-800 font-medium">
                  {selectedDocuments.size} document{selectedDocuments.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete Selected'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={criticalityFilter}
                onChange={(e) => setCriticalityFilter(e.target.value as CriticalityLevel | "")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Criticality</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle and Sort Controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-700 font-medium">Sort by:</label>
              <select
                value={sortField}
                onChange={(e) => handleSortChange(e.target.value as SortField)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="updatedAt">Last Updated</option>
                <option value="title">Title</option>
                <option value="criticality">Criticality</option>
                <option value="category">Category</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
            <div className="flex items-center gap-4">
              {viewMode === "card" && paginatedDocuments.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paginatedDocuments.length > 0 && paginatedDocuments.every(doc => selectedDocuments.has(doc.id))}
                    ref={(input) => {
                      if (input) {
                        const allSelected = paginatedDocuments.length > 0 && paginatedDocuments.every(doc => selectedDocuments.has(doc.id));
                        const someSelected = paginatedDocuments.some(doc => selectedDocuments.has(doc.id));
                        input.indeterminate = someSelected && !allSelected;
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label className="text-sm text-gray-700">Select All</label>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("card")}
                  className={`px-3 py-1 rounded ${
                    viewMode === "card" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Card View
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 rounded ${
                    viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Table View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading documents...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Documents List */}
        {!loading && !error && (
          <>
            {sortedDocuments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600">No documents found</p>
                <Link
                  href="/documents/new"
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  Create your first document
                </Link>
              </div>
            ) : (
              <>
                {viewMode === "card" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedDocuments.map((doc) => (
                      <DocumentCard 
                        key={doc.id} 
                        document={doc} 
                        onDuplicate={handleDuplicate}
                        isSelected={selectedDocuments.has(doc.id)}
                        onSelect={handleSelectDocument}
                      />
                    ))}
                  </div>
                ) : (
                  <DocumentTable 
                    documents={paginatedDocuments} 
                    onDuplicate={handleDuplicate}
                    selectedDocuments={selectedDocuments}
                    onSelectDocument={handleSelectDocument}
                    onSelectAll={handleSelectAll}
                  />
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);
                        
                        const showEllipsis =
                          (page === 2 && currentPage > 3) ||
                          (page === totalPages - 1 && currentPage < totalPages - 2);

                        if (showEllipsis) {
                          return (
                            <span key={page} className="px-2 py-2 text-gray-500">
                              ...
                            </span>
                          );
                        }

                        if (!showPage) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg ${
                              currentPage === page
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>

                    <span className="ml-4 text-sm text-gray-600">
                      Page {currentPage} of {totalPages} ({sortedDocuments.length} total documents)
                    </span>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DocumentCard({ 
  document, 
  onDuplicate, 
  isSelected, 
  onSelect 
}: { 
  document: DRDocument; 
  onDuplicate: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}) {
  const isOutdated = isDocumentOutdated(document.updatedAt);

  const handleDuplicate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDuplicate(document.id);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(document.id, e.target.checked);
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow hover:shadow-lg transition h-full relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectChange}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <Link href={`/documents/${document.id}`} className="block pl-8">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition">
            {document.title}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${getCriticalityBadgeColor(
              document.criticality
            )}`}
          >
            {document.criticality.toUpperCase()}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{document.scenario}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Category:</span>
            <span className="font-medium">{document.categories.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">RTO:</span>
            <span className="font-medium">{document.rto} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">RPO:</span>
            <span className="font-medium">{document.rpo} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Updated:</span>
            <span className={`font-medium ${isOutdated ? "text-orange-600" : ""}`}>
              {formatDate(document.updatedAt)}
              {isOutdated && " ⚠️"}
            </span>
          </div>
        </div>
        
        {/* Quick validation status */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <OutdatedWarning 
            updatedAt={document.updatedAt} 
            variant="compact"
            onUpdate={() => window.location.href = `/documents/${document.id}/edit`}
          />
        </div>
      </Link>
      
      {/* Outdated Warning */}
      {isOutdated && (
        <div className="mt-3">
          <OutdatedWarning updatedAt={document.updatedAt} />
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
        <button
          onClick={handleDuplicate}
          className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition flex items-center justify-center gap-1"
          title="Duplicate document"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Duplicate
        </button>
        <Link
          href={`/documents/${document.id}`}
          className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center"
        >
          View
        </Link>
      </div>
    </div>
  );
}

function DocumentTable({ 
  documents, 
  onDuplicate, 
  selectedDocuments, 
  onSelectDocument, 
  onSelectAll 
}: { 
  documents: DRDocument[]; 
  onDuplicate: (id: string) => void;
  selectedDocuments: Set<string>;
  onSelectDocument: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}) {
  const allSelected = documents.length > 0 && documents.every(doc => selectedDocuments.has(doc.id));
  const someSelected = documents.some(doc => selectedDocuments.has(doc.id));

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected && !allSelected;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Criticality
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              RTO/RPO
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => {
            const isOutdated = isDocumentOutdated(doc.updatedAt);
            const isSelected = selectedDocuments.has(doc.id);
            return (
              <tr key={doc.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectDocument(doc.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </td>
                <td className="px-6 py-4">
                  <Link href={`/documents/${doc.id}`} className="text-blue-600 hover:underline">
                    {doc.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{doc.categories.join(", ")}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${getCriticalityBadgeColor(
                      doc.criticality
                    )}`}
                  >
                    {doc.criticality.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {doc.rto}/{doc.rpo} min
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={isOutdated ? "text-orange-600 font-medium" : "text-gray-900"}>
                    {formatDate(doc.updatedAt)}
                    {isOutdated && " ⚠️"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onDuplicate(doc.id);
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition flex items-center gap-1"
                      title="Duplicate document"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Duplicate
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
