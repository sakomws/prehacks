import Link from "next/link";
import Logo from "../components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200">
        <div className="max-w-[980px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo size={36} className="transition-transform group-hover:scale-110" />
              <h1 className="text-xl font-semibold text-gray-900">MentorMap</h1>
            </Link>
            <nav className="flex items-center gap-8">
              <Link href="/mentors" className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                Mentors
              </Link>
              <Link href="/pricing" className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-[980px] mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            Your path to
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              success
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Connect with expert mentors and create personalized learning roadmaps to achieve your career goals.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/mentors" className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md">
              Find a Mentor
            </Link>
            <Link href="/pricing" className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-full font-medium hover:bg-blue-600 hover:text-white transition-all">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-[980px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16 tracking-tight">
            Why MentorMap?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "👥", title: "Expert Mentorship", desc: "Connect with experienced professionals from top tech companies" },
              { icon: "📚", title: "Personalized Learning", desc: "Get customized roadmaps tailored to your goals and experience" },
              { icon: "📅", title: "Flexible Scheduling", desc: "Book sessions at times that work for you" },
              { icon: "💰", title: "Affordable Pricing", desc: "Quality mentorship at competitive rates" },
              { icon: "📊", title: "Track Progress", desc: "Monitor your learning journey and achievements" },
              { icon: "🌍", title: "Global Community", desc: "Connect with learners and mentors worldwide" },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-[980px] mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Ready to start your journey?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
              Connect with expert mentors and accelerate your career growth
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/mentors" className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
                Browse Mentors
              </Link>
              <Link href="/pricing" className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-[980px] mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { title: "Platform", links: [["Find Mentors", "/mentors"], ["Pricing", "/pricing"], ["Become a Mentor", "/become-mentor"]] },
              { title: "Resources", links: [["Learning Paths", "/learn"], ["Blog", "/blog"], ["FAQ", "/faq"]] },
              { title: "Company", links: [["About Us", "/about"], ["Contact", "/contact"], ["Careers", "/careers"]] },
              { title: "Legal", links: [["Terms", "/terms"], ["Privacy", "/privacy"]] },
            ].map((col, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">© 2025 MentorMap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
