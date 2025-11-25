import Link from "next/link";
import Logo from "@/components/Logo";

export default function AboutPage() {
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
        <h2 className="text-4xl font-bold mb-8">About Us</h2>
        
        <div className="prose dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              MentorMap is dedicated to democratizing access to high-quality mentorship and career guidance. 
              We believe that everyone deserves the opportunity to learn from experienced professionals and 
              achieve their career goals.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">Our Story</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Founded in 2025, MentorMap was born from the recognition that traditional education and 
              self-study often fall short in preparing individuals for the competitive tech industry.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Our founders, having experienced the challenges of breaking into top tech companies, 
              created a platform that connects aspiring professionals with mentors who have walked 
              the path before them.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">Our Values</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">✅ Integrity</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Doing the right thing, even when no one's watching.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✅ Doer</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  We act, we don't wait.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✅ Giver</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  We share more than we take.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✅ Passion</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  We care deeply.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✅ Resilience</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  We keep going when it's tough.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border p-8">
            <h3 className="text-2xl font-bold mb-4">Join Our Team</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We're always looking for talented individuals who share our passion for education and mentorship.
            </p>
            <Link href="/careers" className="text-blue-600 hover:underline">
              View open positions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
