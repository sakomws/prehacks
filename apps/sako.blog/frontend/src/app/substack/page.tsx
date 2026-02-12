import Link from 'next/link';

export default function SubstackPage() {
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
            <h1 className="text-5xl font-semibold tracking-tight mb-6 text-gray-900 dark:text-white">Substack Impact</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed">
              Writing clarified thinking and built a durable knowledge asset.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-soft-lg p-10">
            <div className="text-center mb-10">
              <div className="text-7xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">61</div>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                Articles published by end of 2025
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
              <h3 className="text-xl font-semibold tracking-tight mb-6 text-gray-900 dark:text-white">Impact</h3>
              <ul className="space-y-4 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 dark:text-gray-600 mt-0.5">✓</span>
                  <span>Clarified thinking through regular writing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 dark:text-gray-600 mt-0.5">✓</span>
                  <span>Built a durable knowledge asset</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 dark:text-gray-600 mt-0.5">✓</span>
                  <span>Led to book publishing opportunity</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

