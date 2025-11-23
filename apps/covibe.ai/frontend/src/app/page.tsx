import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="z-10 max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🤖 Covibe.ai
          </h1>
          <p className="text-2xl mb-4 text-gray-700 dark:text-gray-300">
            AI-Powered Coding Agent
          </p>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Generate code, analyze bugs, and get instant coding help with advanced AI models
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/chat">
            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">💬</div>
              <h2 className="text-xl font-semibold mb-2">Chat Interface</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Natural language coding assistance and debugging help
              </p>
              <div className="mt-4 text-blue-500 font-medium">Start chatting →</div>
            </div>
          </Link>

          <Link href="/generate">
            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🧠</div>
              <h2 className="text-xl font-semibold mb-2">Code Generator</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Generate clean, efficient code from descriptions
              </p>
              <div className="mt-4 text-blue-500 font-medium">Generate code →</div>
            </div>
          </Link>

          <Link href="/analyze">
            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🔍</div>
              <h2 className="text-xl font-semibold mb-2">Code Analysis</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Intelligent bug detection and optimization suggestions
              </p>
              <div className="mt-4 text-blue-500 font-medium">Analyze code →</div>
            </div>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✨</div>
              <div>
                <div className="font-medium">Multi-language Support</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Python, JavaScript, TypeScript, Java, C++, Go, Rust
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <div className="font-medium">Real-time Responses</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Powered by GPT-4 and Claude
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔒</div>
              <div>
                <div className="font-medium">Secure & Private</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Your code stays private
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📚</div>
              <div>
                <div className="font-medium">Best Practices</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Industry-standard code patterns
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <a href="http://localhost:8001/docs" target="_blank" className="hover:text-blue-500">
            API Documentation
          </a>
          {" • "}
          <a href="https://github.com" target="_blank" className="hover:text-blue-500">
            GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
