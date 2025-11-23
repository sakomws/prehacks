"use client";

import { useState } from "react";

export default function AnalyzePage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeCode = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setAnalysis("");

    try {
      const response = await fetch("http://localhost:8001/api/code/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();
      setAnalysis(data.analysis || data.error || "No analysis available");
    } catch (error) {
      setAnalysis("Error: Could not connect to API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🔍 Code Analyzer</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Find bugs, security issues, and optimization opportunities
            </p>
          </div>
          <a
            href="/"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            ← Home
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Paste your code</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Code to analyze</label>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="def factorial(n):&#10;    return n * factorial(n-1)"
                    className="w-full h-96 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 font-mono text-sm"
                  />
                </div>

                <button
                  onClick={analyzeCode}
                  disabled={loading || !code.trim()}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Analyzing..." : "Analyze Code"}
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Analysis Results</h2>

            {!analysis && !loading && (
              <div className="h-96 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <p>Analysis results will appear here</p>
                  <p className="text-sm mt-2">We'll check for:</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>🐛 Bugs and errors</li>
                    <li>🔒 Security vulnerabilities</li>
                    <li>⚡ Performance issues</li>
                    <li>📚 Best practices</li>
                  </ul>
                </div>
              </div>
            )}

            {loading && (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-pulse">🔍</div>
                  <p className="text-gray-600 dark:text-gray-400">Analyzing your code...</p>
                </div>
              </div>
            )}

            {analysis && (
              <div className="prose dark:prose-invert max-w-none">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg whitespace-pre-wrap">
                  {analysis}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
