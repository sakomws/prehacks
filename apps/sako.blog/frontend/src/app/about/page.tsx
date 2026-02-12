import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-semibold tracking-tight mb-4 text-gray-900 dark:text-white">
              About Me
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <div className="flex items-start gap-8 mb-6">
              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-soft-lg flex-shrink-0 relative">
                <Image
                  src="/vurik.jpeg"
                  alt="Vurgun H."
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-semibold tracking-tight mb-2 text-gray-900 dark:text-white">Vurgun H.</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-3 font-medium">
                  Technical Evangelist | Data AI/ML & Cloud Architecture | Open-Source
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  San Francisco Bay Area • 30K+ followers
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-[15px] leading-relaxed">
                  Master's in Robotics Technology, Bachelor's in Computer Science from Azerbaijan State University of Oil and Industry (ASOI)
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-[15px] leading-relaxed">
                  Principal Solution Architect with 15+ years of experience designing and delivering enterprise-scale, cloud-native platforms across public and private sectors. I focus on building scalable, secure, and data-driven solutions, aligning cloud infrastructure, data platforms, and AI enablement with real business needs.
                </p>
                <p className="text-gray-900 dark:text-white font-semibold text-[15px] mb-6">
                  Currently Principal Solution Architect & Technology Advisor @ Innovation and Digital Development Agency (IDDA)
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:vurgunh@gmail.com" className="hover:text-gray-900 dark:hover:text-white transition-colors">vurgunh@gmail.com</a>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://mentormap.ai/mentors/1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm font-medium transition-all duration-200 shadow-soft hover:shadow-soft-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book time with me on Mentormap
                  </a>
                  <a
                    href="https://github.com/vurgunhajiyev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-full text-sm font-medium transition-all duration-200 shadow-soft hover:shadow-soft-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    View GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Connect Section */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-4xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">Connect</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="https://www.linkedin.com/in/vurghun"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-blue-300/50 dark:hover:border-blue-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">LinkedIn</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-4">
                  Connect with me on LinkedIn for professional updates and networking.
                </p>
                <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 gap-1 transition-all duration-200">
                  <span>Visit Profile</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
              </a>

              <a
                href="https://x.com/VurghunH"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">Twitter</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-4">
                  Follow me on X (Twitter) for tech insights and real-time updates.
                </p>
                <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:gap-2 gap-1 transition-all duration-200">
                  <span>Follow on X</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
              </a>

              <a
                href="https://vurghun.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-orange-300/50 dark:hover:border-orange-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24l10.77-6.205L23.23 24V10.812H1.46zM23.23 0H1.46v2.836h21.77V0z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Substack</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-4">
                  Subscribe to my Substack for in-depth articles on tech, AI, and cloud architecture.
                </p>
                <div className="flex items-center text-sm font-medium text-orange-600 dark:text-orange-400 group-hover:gap-2 gap-1 transition-all duration-200">
                  <span>Read Articles</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link
              href="/linkedin"
              className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 p-8"
            >
              <h3 className="text-xl font-semibold tracking-tight mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">LinkedIn in a Year</h3>
              <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                Consistent technical storytelling amplified reach across Cloud Infrastructure, AI, DATA, MLOps, and Community topics.
              </p>
            </Link>

            <Link
              href="/coffee-meets"
              className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 p-8"
            >
              <h3 className="text-xl font-semibold tracking-tight mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Coffee Meets</h3>
              <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                High-trust, low-scale conversations lead to long-term leverage.
              </p>
            </Link>

            <Link
              href="/hackathons"
              className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 p-8"
            >
              <h3 className="text-xl font-semibold tracking-tight mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Hackathon Evangelist</h3>
              <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                Turning Hackathons into Learning Systems
              </p>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-4xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">Community Contributions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-[15px] leading-relaxed">
              Over the past years, targeted community contributions have proven to be a high-leverage mechanism for accelerating knowledge sharing, talent development, and ecosystem collaboration.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-5xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">16</div>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                  Talks delivered & events hosted
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">1,500+</div>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                  Developers trained
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">4</div>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                  Communities co-founded
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">6+</div>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                  Years active in CNCF
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white tracking-tight">AWS User Group Baku</h3>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                  To build a strong local AWS community by sharing knowledge, developing cloud skills, and connecting practitioners to accelerate innovation and real-world impact.
                </p>
              </div>

              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white tracking-tight">Product Tank</h3>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                  Product Tank brings together 1,000+ Product Owners to share experience, strengthen product thinking, and grow product leaders
                </p>
              </div>

              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white tracking-tight">Cloud Native Computing Foundation</h3>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                  An international community that has been actively operating for more than 6 years.
                </p>
              </div>

              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white tracking-tight">Cisco Academy</h3>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                  Built and delivered training for a 1,500+ member Cisco Academy community.
                </p>
              </div>
            </div>
          </div>

          {/* Professional Experience */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-4xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">Professional Experience</h2>
            <div className="space-y-8">
              <div className="border-l-2 border-blue-500 pl-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Principal Solution Architect & Technology Advisor</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">Innovation and Digital Development Agency (IDDA)</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">June 2025 - Present (7 months)</p>
                  </div>
                </div>
              </div>
              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Head of Product Management</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">Innovation and Digital Development Agency (IDDA)</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">July 2023 - May 2025 (1 year 11 months)</p>
                  </div>
                </div>
              </div>
              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Senior Cloud Solutions Architect</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">Santa Clara University</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">March 2022 - June 2023 (1 year 4 months) • California, United States</p>
                  </div>
                </div>
              </div>
              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Senior Solutions Architect</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">WeTravel</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">November 2020 - February 2022 (1 year 4 months) • San Francisco Bay Area</p>
                  </div>
                </div>
              </div>
              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">CTO & Co-Founder</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">ATL Tech</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">May 2013 - September 2020 (7 years 5 months) • Baku, Azerbaijan</p>
                  </div>
                </div>
              </div>
              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Head of Engineering</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">Unibank</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">June 2009 - April 2013 (3 years 11 months) • Baku, Azerbaijan</p>
                  </div>
                </div>
              </div>
              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Senior Software Engineer</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">Unibank</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">September 2007 - June 2009 (1 year 10 months) • Baku, Azerbaijan</p>
                  </div>
                </div>
              </div>
              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Software Engineer</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">Central Bank of the Republic of Azerbaijan</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">2003 - 2007 (4 years) • Baku, Azerbaijan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-4xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Cisco Certified Internetwork Expert (CCIE)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Written • CSCO10999636</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Leading People, Culture, and Innovation</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Stanford School of Engineering</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Certified Cisco Systems Instructor (CCSI)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Cisco Systems</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Digital Transformation</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Certification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Skills */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-4xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">Top Skills</h2>
            <div className="flex flex-wrap gap-3">
              {['Oracle Applications', 'Product Launch', 'Elasticsearch', 'Cloud Architecture', 'AI/ML', 'Data Engineering', 'Solution Architecture', 'Digital Transformation'].map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-4xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">MLOps Book Progress</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-5 text-[15px] leading-relaxed">
              As I started sharing my thoughts regularly on LinkedIn, friends around me often encouraged me to write on a weekly basis, saying that it could open a very different chapter in my life. To be honest, I hesitated at first. I was unsure and a bit afraid. But I decided to begin.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-5 text-[15px] leading-relaxed">
              I wrote my articles on the Substack platform, and by the end of 2025, I had published 61 pieces there.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-5 text-[15px] leading-relaxed">
              One day, when I received a message on LinkedIn from a representative of a well-known publishing house with a proposal to write a book, I paused again. I hesitated. But I wanted this story to become a part of my life and that is how this journey began.
            </p>
            <p className="text-gray-900 dark:text-white font-semibold text-[15px]">
              I am grateful to all the friends who believed in me and encouraged me along the way.
            </p>
          </div>

          {/* DevRel Readiness Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-3xl border border-indigo-200/50 dark:border-indigo-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-4xl font-semibold tracking-tight mb-6 text-gray-900 dark:text-white">Developer Relations Readiness</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-[15px] leading-relaxed">
              A comprehensive view of DevRel capabilities and areas for growth.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Strengths */}
              <div className="p-6 bg-white/80 dark:bg-gray-900/50 rounded-2xl border border-green-200/50 dark:border-green-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Core Strengths
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-[15px]">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span><strong>Content Creation:</strong> 100+ LinkedIn posts, 61 Substack articles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span><strong>Community Building:</strong> Co-founded AWS User Group Baku, Product Tank</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span><strong>Speaking Experience:</strong> 16+ talks and events hosted</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span><strong>Technical Expertise:</strong> 20+ years in cloud, AI, MLOps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span><strong>Writing:</strong> Book in progress, consistent blog output</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span><strong>Mentorship:</strong> Active on Mentormap, Coffee Meets program</span>
                  </li>
                </ul>
              </div>

              {/* Areas to Enhance */}
              <div className="p-6 bg-white/80 dark:bg-gray-900/50 rounded-2xl border border-amber-200/50 dark:border-amber-800/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-amber-500">⚡</span>
                  Areas to Enhance
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-[15px]">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-0.5">→</span>
                    <span><strong>Video Content:</strong> YouTube channel, recorded talks, tutorials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-0.5">→</span>
                    <span><strong>Open Source:</strong> GitHub contributions, maintainer experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-0.5">→</span>
                    <span><strong>Technical Tutorials:</strong> Step-by-step guides, code samples</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-0.5">→</span>
                    <span><strong>Conference Speaking:</strong> Major tech conferences (AWS re:Invent, KubeCon, etc.)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-0.5">→</span>
                    <span><strong>Developer Tools:</strong> Building tools/products for developers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-0.5">→</span>
                    <span><strong>Podcasts/Interviews:</strong> Guest appearances, hosting shows</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-0.5">→</span>
                    <span><strong>Documentation:</strong> Technical docs, API guides, SDK examples</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* DevRel Skills Matrix */}
            <div className="p-6 bg-white/80 dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">DevRel Skills Matrix</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Creation</span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Community Building</span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Public Speaking</span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Video Content</span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">40%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Open Source</span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">50%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Technical Writing</span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">80%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Content Section */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Video Content</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-[15px] leading-relaxed">
              Creating video content to reach developers through tutorials, recorded talks, and technical deep-dives.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Planned Content</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-[15px]">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">▶</span>
                    <span>Technical tutorials on Cloud Infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">▶</span>
                    <span>AI/ML implementation walkthroughs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">▶</span>
                    <span>Recorded conference talks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">▶</span>
                    <span>Community event highlights</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">YouTube Channel</h3>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] mb-4">
                  Coming soon: Technical content, tutorials, and community insights.
                </p>
                <a
                  href="https://www.youtube.com/@vurgunhaciyev2777"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:gap-3 transition-all"
                >
                  <span>Subscribe on YouTube</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Open Source Contributions */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-900 dark:bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Open Source Contributions</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-[15px] leading-relaxed">
              Contributing to open source projects and building tools for the developer community.
            </p>

            {/* Featured Project: Mentormap.ai */}
            <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Mentormap.ai</h3>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                      Founder
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] mb-4 leading-relaxed">
                    Open source platform connecting mentors and mentees. Building a community-driven ecosystem for knowledge sharing and professional growth.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://mentormap.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-soft hover:shadow-soft-lg"
                    >
                      <span>Visit Mentormap.ai</span>
                      <span>→</span>
                    </a>
                    <a
                      href="https://github.com/vurgunhajiyev/mentormap"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      <span>View on GitHub</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Active Contributions</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-[15px]">
                  <li className="flex items-start gap-3">
                    <span className="text-gray-400 dark:text-gray-600 mt-0.5">•</span>
                    <span>Contributing to Cloud Native projects</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-gray-400 dark:text-gray-600 mt-0.5">•</span>
                    <span>MLOps tooling and frameworks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-gray-400 dark:text-gray-600 mt-0.5">•</span>
                    <span>Community infrastructure projects</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Other Projects</h3>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] mb-4">
                  Building developer tools and contributing to open source ecosystems.
                </p>
                <a
                  href="https://github.com/vurgunhajiyev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white hover:gap-3 transition-all"
                >
                  <span>View GitHub Profile</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Technical Tutorials */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Technical Tutorials</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-[15px] leading-relaxed">
              Step-by-step guides and code samples to help developers learn and implement new technologies.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Cloud Architecture', topics: ['AWS Services', 'Infrastructure as Code', 'Serverless'] },
                { title: 'AI & ML', topics: ['Model Deployment', 'MLOps Pipelines', 'AI Integration'] },
                { title: 'DevOps', topics: ['CI/CD', 'Containerization', 'Kubernetes'] },
              ].map((category) => (
                <div key={category.title} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.topics.map((topic) => (
                      <li key={topic} className="text-sm text-gray-600 dark:text-gray-400">• {topic}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Conference Speaking */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Conference Speaking</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-[15px] leading-relaxed">
              Speaking at major tech conferences and community events to share knowledge and connect with developers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Target Conferences</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-[15px]">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 mt-0.5">🎤</span>
                    <span><strong>AWS re:Invent</strong> - Cloud infrastructure and services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 mt-0.5">🎤</span>
                    <span><strong>KubeCon + CloudNativeCon</strong> - Kubernetes and cloud native</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 mt-0.5">🎤</span>
                    <span><strong>MLOps World</strong> - Machine learning operations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 mt-0.5">🎤</span>
                    <span><strong>DevRelCon</strong> - Developer relations best practices</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Speaking Topics</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-[15px]">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>Building scalable cloud architectures</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>MLOps best practices and patterns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>Community building strategies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>Developer advocacy and engagement</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Developer Tools */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Developer Tools</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-[15px] leading-relaxed">
              Building tools and products that help developers be more productive and successful.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">In Development</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-[15px]">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">🔧</span>
                    <span>MLOps automation tools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">🔧</span>
                    <span>Cloud infrastructure templates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">🔧</span>
                    <span>Developer productivity utilities</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Community Tools</h3>
                <p className="text-gray-600 dark:text-gray-400 text-[15px]">
                  Tools built to support community events, hackathons, and developer engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Podcasts & Interviews */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Podcasts & Interviews</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-[15px] leading-relaxed">
              Sharing insights through podcast appearances and interviews with the tech community.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Guest Appearances</h3>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] mb-4">
                  Available for podcast interviews on topics including cloud infrastructure, AI/ML, community building, and developer relations.
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-[15px]">
                  <li>• Tech podcasts and shows</li>
                  <li>• Developer community interviews</li>
                  <li>• Industry thought leadership</li>
                </ul>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Hosting</h3>
                <p className="text-gray-600 dark:text-gray-400 text-[15px]">
                  Planning to launch a podcast focused on developer stories, technical deep-dives, and community insights.
                </p>
              </div>
            </div>
          </div>

          {/* Documentation */}
          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">Documentation & Technical Writing</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-[15px] leading-relaxed">
              Creating comprehensive documentation, API guides, and technical resources for developers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'API Documentation', desc: 'RESTful APIs, SDKs, and integration guides' },
                { title: 'Technical Guides', desc: 'Architecture patterns, best practices, tutorials' },
                { title: 'Developer Resources', desc: 'Code samples, templates, and reference materials' },
              ].map((item) => (
                <div key={item.title} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10">
            <h2 className="text-4xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">Goals Year 2026</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-soft transition-all duration-200">
                <div className="text-3xl mb-3">☕</div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">Coffee Meets</p>
              </div>
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-soft transition-all duration-200">
                <div className="text-3xl mb-3">🚶</div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">Walking</p>
              </div>
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-soft transition-all duration-200">
                <div className="text-3xl mb-3">👥</div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">Community & Hackathon</p>
              </div>
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-soft transition-all duration-200">
                <div className="text-3xl mb-3">📚</div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">Writing Book</p>
              </div>
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-soft transition-all duration-200">
                <div className="text-3xl mb-3">✍️</div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">Continuous Blog</p>
              </div>
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-soft transition-all duration-200">
                <div className="text-3xl mb-3">📖</div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">Continuous Learning</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
