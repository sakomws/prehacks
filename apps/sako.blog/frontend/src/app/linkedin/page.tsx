import Link from 'next/link';

export default function LinkedInPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-12 transition-colors duration-200 font-medium"
          >
            <span>←</span>
            <span>Back to About</span>
          </Link>

          {/* Hero Section */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-5xl font-semibold tracking-tight mb-2 text-gray-900 dark:text-white">LinkedIn in a Year</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                  One year of consistent technical storytelling
                </p>
              </div>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed">
              Consistent technical storytelling amplified reach across Cloud Infrastructure, AI, DATA, MLOps, and Community topics, building a strong professional network and establishing thought leadership in the tech space.
            </p>
          </div>

          {/* Stats Section */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-3xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">Impact Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="text-4xl font-semibold text-blue-600 dark:text-blue-400 mb-2 tracking-tight">100+</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Posts Published</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200/50 dark:border-green-800/50">
                <div className="text-4xl font-semibold text-green-600 dark:text-green-400 mb-2 tracking-tight">50K+</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Impressions</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
                <div className="text-4xl font-semibold text-purple-600 dark:text-purple-400 mb-2 tracking-tight">5K+</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Engagements</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl border border-orange-200/50 dark:border-orange-800/50">
                <div className="text-4xl font-semibold text-orange-600 dark:text-orange-400 mb-2 tracking-tight">2K+</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">New Connections</p>
              </div>
            </div>
          </div>

          {/* Topics Covered */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-3xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">Topics Covered</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[
                { name: 'Cloud Infrastructure', icon: '☁️' },
                { name: 'AI', icon: '🤖' },
                { name: 'DATA', icon: '📊' },
                { name: 'MLOps', icon: '⚙️' },
                { name: 'Community', icon: '👥' },
                { name: 'Architecture', icon: '🏗️' },
              ].map((topic) => (
                <div
                  key={topic.name}
                  className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 text-center hover:shadow-soft hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{topic.icon}</div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{topic.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Achievements */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-3xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">Key Achievements</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent rounded-2xl border-l-4 border-blue-500">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Viral Content</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                    Multiple posts reached 10K+ impressions, with top-performing content on AI transformation and cloud architecture gaining significant traction.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/10 dark:to-transparent rounded-2xl border-l-4 border-green-500">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Network Growth</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                    Built meaningful connections with industry leaders, startup founders, and technical experts across the globe, expanding professional network by 2,000+ connections.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/10 dark:to-transparent rounded-2xl border-l-4 border-purple-500">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Thought Leadership</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                    Established credibility as a technical evangelist through consistent, high-quality content that sparked meaningful discussions and knowledge sharing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-900/10 dark:to-transparent rounded-2xl border-l-4 border-orange-500">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Community Engagement</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                    Fostered active community discussions, with posts generating hundreds of comments and shares, creating value for the tech community.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Strategy */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-3xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">Content Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Types</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-[15px]">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Technical deep-dives on cloud architecture</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>AI and ML insights and trends</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Industry analysis and predictions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Community stories and experiences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Career and leadership advice</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Posting Frequency</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-[15px]">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>2-3 posts per week consistently</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Strategic timing for maximum reach</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Engagement-focused content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Visual content with diagrams and charts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Interactive polls and questions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lessons Learned */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl border border-blue-200/50 dark:border-blue-800/50 shadow-soft-lg p-10">
            <h2 className="text-3xl font-semibold tracking-tight mb-6 text-gray-900 dark:text-white">Key Learnings</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
              <p>
                <strong className="text-gray-900 dark:text-white">Consistency is key:</strong> Regular posting builds audience trust and keeps you top-of-mind in your network.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Value-first approach:</strong> Focus on providing actionable insights and real-world experiences rather than self-promotion.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Engage authentically:</strong> Responding to comments and engaging with others' content creates meaningful connections.
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Storytelling matters:</strong> Technical content wrapped in stories and real experiences resonates more than pure technical documentation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

