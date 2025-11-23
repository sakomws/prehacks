import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-3xl">🗺️</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MyRoadmap
              </h1>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/mentors" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
                Find Mentors
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
                Pricing
              </Link>
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold mb-6">
            Hello Interview <span className="text-blue-600">Mentorship</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Dedicated 1:1 sessions with one of our best coaches to help you with everything from learning concepts, creating a study plan, to mock interviews.
          </p>
          <Link
            href="/mentors"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
          >
            🔍 Find A Mentor
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Keep the Same Coach</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Build continuity in your preparation with 1, 3, or 6 hour-long sessions with the same dedicated mentor.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Our Best Coaches</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Only our best coaches qualify for mentorship so you're guaranteed to get someone who can help take you to the next level.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Flexible Sessions</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Use your sessions for mock interviews, concept review, resume feedback, or any relevant interview preparation needs.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Personalized Study Plans</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Work with your mentor to create a personalized study plan to help you prepare for your target companies.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold mb-2">Company Insights</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Learn insider tips and key signals that your target company looks for in candidates.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">1:1 Chat Support</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Communicate with your mentor asynchronously with private chat support when buying a package of 3 or 6 sessions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Connect with expert mentors and accelerate your career growth
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/mentors"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium"
            >
              Browse Mentors
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 font-medium"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/mentors">Find Mentors</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/become-mentor">Become a Mentor</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/learn">Learning Paths</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/terms">Terms</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-gray-600 dark:text-gray-300">
            <p>© 2025 MyRoadmap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
