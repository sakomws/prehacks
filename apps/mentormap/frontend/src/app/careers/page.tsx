import Link from "next/link";
import Logo from "@/components/Logo";

export default function CareersPage() {
  const positions: any[] = [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size="lg" className="transition-transform group-hover:scale-110" />
            <h1 className="text-2xl font-bold">MentorMap</h1>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold mb-4">Careers at MentorMap</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          Join us in our mission to democratize access to quality mentorship
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-8 mb-12">
          <h3 className="text-2xl font-bold mb-4">Why Work With Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl mb-2">🚀</div>
              <h4 className="font-semibold mb-2">Fast-Growing Startup</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Be part of a rapidly growing company making real impact
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-semibold mb-2">Competitive Compensation</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Salary, equity, and comprehensive benefits
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🏠</div>
              <h4 className="font-semibold mb-2">Remote-First</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Work from anywhere with flexible hours
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">📚</div>
              <h4 className="font-semibold mb-2">Learning Budget</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Annual budget for courses, books, and conferences
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6">Open Positions</h3>
        {positions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-12 text-center">
            <div className="text-5xl mb-4">💼</div>
            <h4 className="text-xl font-semibold mb-2">No Open Positions</h4>
            <p className="text-gray-600 dark:text-gray-300">
              We don't have any open positions at the moment, but we're always looking for talented people.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.title} className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-bold mb-2">{position.title}</h4>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>📁 {position.department}</span>
                      <span>📍 {position.location}</span>
                      <span>⏰ {position.type}</span>
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Don't see a position that fits?
          </p>
          <Link href="/contact" className="text-blue-600 hover:underline">
            Send us your resume anyway →
          </Link>
        </div>
      </div>
    </div>
  );
}
