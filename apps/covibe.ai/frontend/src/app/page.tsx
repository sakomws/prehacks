import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="z-10 max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🌱 Covibe.ai
          </h1>
          <p className="text-2xl mb-4 text-gray-700 dark:text-gray-300">
            AI Parenting for Code
          </p>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Generate ethical code, analyze with AI parenting principles, and learn to be a responsible "AI parent" through your code
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/chat">
            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">💬</div>
              <h2 className="text-xl font-semibold mb-2">AI Parenting Chat</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Learn ethical AI development with guidance on responsible coding practices
              </p>
              <div className="mt-4 text-blue-500 font-medium">Start chatting →</div>
            </div>
          </Link>

          <Link href="/generate">
            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🧠</div>
              <h2 className="text-xl font-semibold mb-2">Ethical Code Generator</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Generate code that promotes fairness, transparency, and responsible AI development
              </p>
              <div className="mt-4 text-blue-500 font-medium">Generate code →</div>
            </div>
          </Link>

          <Link href="/analyze">
            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-3">🔍</div>
              <h2 className="text-xl font-semibold mb-2">AI Parenting Analysis</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Analyze code for ethical implications, bias detection, and responsible AI practices
              </p>
              <div className="mt-4 text-blue-500 font-medium">Analyze code →</div>
            </div>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">AI Parenting Principles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🌱</div>
              <div>
                <div className="font-medium">Ethical Foundation</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Code that promotes fairness and responsible AI development
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚖️</div>
              <div>
                <div className="font-medium">Bias Awareness</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Detect and prevent biases that AI systems might inherit
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🛡️</div>
              <div>
                <div className="font-medium">Safety First</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Prioritize security, error handling, and safe defaults
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📚</div>
              <div>
                <div className="font-medium">Responsible Design</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Consider long-term impact on AI systems and users
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">What is AI Parenting?</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Just as children learn from their environment, AI systems learn from the code and data we provide. 
            AI Parenting means writing code with the awareness that it will influence how AI systems behave, 
            making ethical considerations and responsible design central to development.
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`} target="_blank" className="hover:text-blue-500">
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
