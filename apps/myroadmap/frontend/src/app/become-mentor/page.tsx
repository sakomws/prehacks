import Link from "next/link";

export default function BecomeMentorPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-3xl">🗺️</div>
              <h1 className="text-2xl font-bold">MyRoadmap</h1>
            </Link>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Become a Mentor</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Share your expertise and help others succeed in their careers
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6">Why Become a Mentor?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-semibold mb-2">Earn Extra Income</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Set your own rates and earn $300-500+ per hour sharing your knowledge
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold mb-2">Flexible Schedule</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Choose when you want to mentor - work around your schedule
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🌟</div>
              <h4 className="font-semibold mb-2">Make an Impact</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Help aspiring professionals achieve their career goals
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">📈</div>
              <h4 className="font-semibold mb-2">Grow Your Network</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with talented individuals and expand your professional network
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6">Requirements</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="text-green-500 mt-1">✓</div>
              <span>3+ years of professional experience in your field</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="text-green-500 mt-1">✓</div>
              <span>Experience at top tech companies or equivalent expertise</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="text-green-500 mt-1">✓</div>
              <span>Strong communication and teaching skills</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="text-green-500 mt-1">✓</div>
              <span>Passion for helping others succeed</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="text-green-500 mt-1">✓</div>
              <span>Availability for at least 5 hours per week</span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6">How It Works</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Apply</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Submit your application with your background and expertise
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Interview</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Complete a brief interview to assess your mentoring skills
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Create Profile</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Set up your mentor profile and set your availability
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Start Mentoring</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Begin accepting sessions and helping students succeed
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
          >
            Apply to Become a Mentor
          </Link>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Questions? <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
