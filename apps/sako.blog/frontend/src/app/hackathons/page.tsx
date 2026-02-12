import Link from 'next/link';

export default function HackathonsPage() {
  const hackathons = [
    {
      name: 'Self-Evolving Agents Hackathon',
      role: 'Hacker',
      focus: 'Product: Agentlinks',
    },
    {
      name: 'Navi AI x GDG DevFest Aviation',
      role: 'Co-Host',
      focus: 'Reports Hackathon',
    },
    {
      name: 'Gemini 3 Build Day',
      role: 'Hacker',
      focus: 'Product: covibe.ai',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-12 transition-colors duration-200 font-medium"
          >
            <span>←</span>
            <span>Back to About</span>
          </Link>

          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h1 className="text-5xl font-semibold tracking-tight mb-6 text-gray-900 dark:text-white">HackEx - Hackathon Experience Evangelist</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4 font-light">
              Q4 Focus: Turning Hackathons into Learning Systems
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
              Insight: Turning Hackathons into Learning Systems
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-3xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">Hackathons Involved</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-4 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Hackathon</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Role</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">Problem Solution Focus</th>
                  </tr>
                </thead>
                <tbody>
                  {hackathons.map((hackathon, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-5 px-4 text-gray-900 dark:text-white font-medium">{hackathon.name}</td>
                      <td className="py-5 px-4">
                        <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                          {hackathon.role}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-gray-600 dark:text-gray-400 text-sm">
                        {hackathon.focus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <h3 className="text-xl font-semibold tracking-tight mb-6 text-gray-900 dark:text-white">Key Projects</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Agentlinks</h4>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                  Product developed during Self-Evolving Agents Hackathon
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">covibe.ai</h4>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                  AI-powered coding agent built during Gemini 3 Build Day
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

