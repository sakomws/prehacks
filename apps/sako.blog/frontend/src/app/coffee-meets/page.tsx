import Link from 'next/link';

export default function CoffeeMeetsPage() {
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
            <h1 className="text-5xl font-semibold tracking-tight mb-6 text-gray-900 dark:text-white">Coffee Meets</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 font-light">
              High-trust, low-scale conversations lead to long-term leverage.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
              As a yearly tradition, I regularly host coffee chats with aspiring technologists, career switchers, and professionals seeking growth, creating a space for open conversation, guidance, and shared learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft p-8">
              <h2 className="text-2xl font-semibold tracking-tight mb-4 text-gray-900 dark:text-white">Across Career Tech</h2>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-[15px]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>Product</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>Data</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>AI & Cloud domains</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft p-8">
              <h2 className="text-2xl font-semibold tracking-tight mb-4 text-gray-900 dark:text-white">Inbound Channels</h2>
              <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                Open conversations through various communication channels
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10 mb-8">
            <h2 className="text-4xl font-semibold tracking-tight mb-8 text-gray-900 dark:text-white">Impact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <div className="text-5xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">75</div>
                <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Early Stage</p>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                  Career entry & transition guidance
                </p>
              </div>

              <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-6">
                <div className="text-5xl font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">18</div>
                <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Senior Stage</p>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed">
                  Leadership exchange & peer mentoring
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
              <h3 className="text-xl font-semibold tracking-tight mb-6 text-gray-900 dark:text-white">Talent & Ecosystem Development</h3>
              <ul className="space-y-4 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 dark:text-gray-600 mt-1">→</span>
                  <span>Co-founded a national tech community: AWS User Group Baku</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 dark:text-gray-600 mt-1">→</span>
                  <span>Enabled 4 senior role transitions into new leadership or technical positions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 dark:text-gray-600 mt-1">→</span>
                  <span>Supported early-stage career shifts, with ~3.5% moving into new tech roles</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

