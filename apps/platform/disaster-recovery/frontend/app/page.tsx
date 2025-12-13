import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Disaster Recovery Documentation System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage and maintain comprehensive disaster recovery procedures
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/documents"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              View Documents
            </Link>
            <Link
              href="/documents/new"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Create Document
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Document Management</h3>
            <p className="text-gray-600">
              Create, edit, and organize disaster recovery documents with version control
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Search & Filter</h3>
            <p className="text-gray-600">
              Quickly find relevant procedures by keyword, category, or criticality
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Integration</h3>
            <p className="text-gray-600">
              Import from Notion and export to GitHub for seamless workflow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
