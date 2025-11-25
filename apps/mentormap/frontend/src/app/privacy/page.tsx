import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-3xl">🗺️</div>
            <h1 className="text-2xl font-bold">MentorMap</h1>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold mb-8">Privacy Policy</h2>
        
        <div className="prose dark:prose-invert max-w-none space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Last updated: November 22, 2025
            </p>
            
            <h3 className="text-xl font-bold mb-3">1. Information We Collect</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We collect information you provide directly to us, including name, email address, and payment information when you create an account or book a session.
            </p>

            <h3 className="text-xl font-bold mb-3">2. How We Use Your Information</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages.
            </p>

            <h3 className="text-xl font-bold mb-3">3. Information Sharing</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We do not share your personal information with third parties except as described in this policy or with your consent.
            </p>

            <h3 className="text-xl font-bold mb-3">4. Data Security</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.
            </p>

            <h3 className="text-xl font-bold mb-3">5. Cookies</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information.
            </p>

            <h3 className="text-xl font-bold mb-3">6. Your Rights</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You have the right to access, update, or delete your personal information at any time through your account settings.
            </p>

            <h3 className="text-xl font-bold mb-3">7. Children's Privacy</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>

            <h3 className="text-xl font-bold mb-3">8. Changes to This Policy</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>

            <h3 className="text-xl font-bold mb-3">9. Contact Us</h3>
            <p className="text-gray-600 dark:text-gray-300">
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@mentormap.ai" className="text-blue-600 hover:underline">
                privacy@mentormap.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
