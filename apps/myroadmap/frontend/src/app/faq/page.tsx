import Link from "next/link";

export default function FAQPage() {
  const faqs = [
    {
      category: "General",
      questions: [
        {
          q: "What is MyRoadmap?",
          a: "MyRoadmap is a mentorship platform connecting students with experienced professionals for 1:1 coaching sessions, personalized learning paths, and career guidance.",
        },
        {
          q: "How does mentorship work?",
          a: "You can browse mentor profiles, book sessions, and meet with your mentor via video call. Sessions can be used for mock interviews, concept review, or career advice.",
        },
      ],
    },
    {
      category: "Pricing & Payments",
      questions: [
        {
          q: "How much does it cost?",
          a: "Pricing varies by mentor and package. Single sessions start at $320, with discounted packages available for 3 sessions ($1,200) and 6 sessions ($2,400).",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards, debit cards, and PayPal.",
        },
      ],
    },
    {
      category: "Sessions",
      questions: [
        {
          q: "How long are sessions?",
          a: "Each session is 1 hour long. You can use this time for mock interviews, learning concepts, or getting career advice.",
        },
        {
          q: "Can I cancel or reschedule?",
          a: "Yes, you can cancel or reschedule up to 24 hours before your session for a full refund.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-3xl">🗺️</div>
            <h1 className="text-2xl font-bold">MyRoadmap</h1>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category}>
              <h3 className="text-2xl font-bold mb-4">{section.category}</h3>
              <div className="space-y-4">
                {section.questions.map((faq, idx) => (
                  <details key={idx} className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                    <summary className="font-semibold cursor-pointer">{faq.q}</summary>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
