import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PricingPage() {
  const packages = [
    {
      name: "Single Session",
      price: 100,
      sessions: 1,
      features: [
        "1 hour long mentorship session with your mentor",
        "Sessions can be spent on mock interviews, teaching concepts, personalized planning, etc.",
      ],
    },
    {
      name: "3 Sessions",
      price: 300,
      sessions: 3,
      popular: true,
      features: [
        "3 hour long mentorship sessions with your mentor",
        "Sessions can be spent on mock interviews, teaching concepts, personalized planning, etc.",
        "Access to a personal chat with your mentor for 6 weeks",
      ],
    },
    {
      name: "6 Sessions",
      price: 600,
      sessions: 6,
      features: [
        "6 hour long mentorship sessions with your mentor",
        "Sessions can be spent on mock interviews, teaching concepts, personalized planning, etc.",
        "Access to a personal chat with your mentor for 12 weeks",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header currentPage="pricing" />

      {/* Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Pricing</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the package that fits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-8 relative ${
                pkg.popular
                  ? "border-blue-600 shadow-xl scale-105"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  ${pkg.price.toLocaleString()}
                </div>
                <div className="text-gray-500">{pkg.sessions} session{pkg.sessions > 1 ? "s" : ""}</div>
              </div>

              <ul className="space-y-4 mb-8">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="text-green-500 mt-1">✓</div>
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/mentors"
                className={`block w-full text-center px-6 py-3 rounded-lg font-medium ${
                  pkg.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* Referral Banner */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Get 50% Off with Referrals!</h3>
            <p className="text-xl mb-6 opacity-90">
              Refer a friend and you both get 50% off your next session
            </p>
            <Link
              href="/referral"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Your Referral Link
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              {
                q: "What is the difference between mentorship and mock interviews?",
                a: "Mentorship provides a more comprehensive, long-term approach to interview preparation with the same coach, while mock interviews are typically one-off practice sessions.",
              },
              {
                q: "Can I choose my mentor?",
                a: "Yes, you can browse available mentors and select the one that best fits your needs and target companies.",
              },
              {
                q: "How long are the sessions?",
                a: "Each session is 1 hour long and can be used flexibly for mock interviews, concept teaching, or personalized planning.",
              },
              {
                q: "How does the chat support work?",
                a: "For 3 and 6 session packages, you get access to private asynchronous chat with your mentor for 6 or 12 weeks respectively.",
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <summary className="font-semibold cursor-pointer">{faq.q}</summary>
                <p className="mt-4 text-gray-600 dark:text-gray-300">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
