import Link from "next/link";
import Logo from "@/components/Logo";

export default function TermsPage() {
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
        <h2 className="text-4xl font-bold mb-8">Terms and Conditions</h2>
        
        <div className="prose dark:prose-invert max-w-none space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Last updated: November 22, 2025
            </p>
            
            <h3 className="text-xl font-bold mb-3">1. Acceptance of Terms</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              By accessing and using MentorMap, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3 className="text-xl font-bold mb-3">2. Use License</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Permission is granted to temporarily access the materials on MentorMap for personal, non-commercial transitory viewing only.
            </p>

            <h3 className="text-xl font-bold mb-3">3. User Accounts</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>

            <h3 className="text-xl font-bold mb-3">4. Mentorship Sessions</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              All mentorship sessions must be conducted professionally. Both mentors and students are expected to maintain respectful communication.
            </p>

            <h3 className="text-xl font-bold mb-3">5. Payment Terms</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Payment is required at the time of booking. Refunds are available up to 24 hours before the scheduled session.
            </p>

            <h3 className="text-xl font-bold mb-3">6. Cancellation Policy</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Sessions can be cancelled or rescheduled up to 24 hours in advance for a full refund. Late cancellations may not be eligible for refunds.
            </p>

            <h3 className="text-xl font-bold mb-3">7. Intellectual Property</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              All content on MentorMap, including text, graphics, logos, and software, is the property of MentorMap and protected by copyright laws.
            </p>

            <h3 className="text-xl font-bold mb-3">8. Limitation of Liability</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              MentorMap shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>

            <h3 className="text-xl font-bold mb-3">9. Changes to Terms</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>

            <h3 className="text-xl font-bold mb-3">10. Contact Information</h3>
            <p className="text-gray-600 dark:text-gray-300">
              For questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@mentormap.ai" className="text-blue-600 hover:underline">
                legal@mentormap.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
