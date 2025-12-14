import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-50/80 backdrop-blur-apple border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {[
            { title: "Learn", links: [["Basics", "/learn/basics"], ["Modules", "/modules"], ["Tools", "/tools"]] },
            { title: "Community", links: [["Discussions", "/community"], ["Experts", "/community/experts"], ["Join", "/register"]] },
            { title: "Tools", links: [["Bias Assessment", "/tools/bias-assessment"], ["Ethics Checker", "/tools/ethics-checker"], ["All Tools", "/tools"]] },
            { title: "Account", links: [["Login", "/login"], ["Register", "/register"], ["Demo", "/demo"]] },
          ].map((col, i) => (
            <div key={i} className="fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <h3 className="text-xs font-semibold text-gray-900 mb-4 uppercase tracking-wider">{col.title}</h3>
              <ul className="space-y-2.5 sm:space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link 
                      href={href} 
                      className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 no-underline hover:translate-x-1 inline-block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-gray-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">AI Parenting Guide</span>
          </div>
          <p className="text-sm text-gray-500 text-center sm:text-left">Copyright © 2024 AI Parenting Guide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
