import Link from "next/link";
import Logo from "../components/Logo";
import DarkModeToggle from "../components/DarkModeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[980px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo size={36} className="transition-transform group-hover:scale-110" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">MentorMap</h1>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/mentors" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Mentors
              </Link>
              <Link href="/pricing" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Pricing
              </Link>
              <Link href="/mentor-dashboard" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Mentor Dashboard
              </Link>
              <DarkModeToggle />
              <Link href="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-[980px] mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
            Your path to
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              success
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
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
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-[980px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16 tracking-tight">
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
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Community */}
      <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-[980px] mx-auto">
          <div className="bg-white rounded-3xl p-12 md:p-16 shadow-xl border border-green-100">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <span>🌍</span>
                  <span>Global Community</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                  Join Our WhatsApp Community
                </h2>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  Connect with learners and mentors worldwide. Share experiences, get advice, and grow together.
                </p>
                <ul className="space-y-3 mb-8 text-left">
                  {[
                    "💬 Daily tips and resources",
                    "🤝 Network with peers and mentors",
                    "📢 Exclusive opportunities and events",
                    "🎯 Career guidance and support",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <span className="text-green-600">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://chat.whatsapp.com/your-group-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Join WhatsApp Group
                </a>
              </div>
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl blur-2xl opacity-20"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-12 text-white text-center">
                    <div className="text-7xl mb-4">💬</div>
                    <div className="text-4xl font-bold mb-2">1,000+</div>
                    <div className="text-lg opacity-90">Active Members</div>
                  </div>
                </div>
              </div>
            </div>
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
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-[980px] mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { title: "Platform", links: [["Find Mentors", "/mentors"], ["Pricing", "/pricing"], ["Become a Mentor", "/become-mentor"]] },
              { title: "Resources", links: [["Learning Paths", "/learn"], ["Blog", "/blog"], ["FAQ", "/faq"]] },
              { title: "Company", links: [["About Us", "/about"], ["Contact", "/contact"], ["Careers", "/careers"]] },
              { title: "Legal", links: [["Terms", "/terms"], ["Privacy", "/privacy"]] },
            ].map((col, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">© 2025 MentorMap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
