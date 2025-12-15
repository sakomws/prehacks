"use client";

import { useState } from "react";
import RulesetConfig, { useRulesetConfig } from "@/components/RulesetConfig";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const rulesets = useRulesetConfig();

  const generateCode = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setCode("");

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/code/generate`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          language,
          rulesets: {
            ethicalFoundation: rulesets.ethicalFoundation,
            biasAwareness: rulesets.biasAwareness,
            safetyFirst: rulesets.safetyFirst,
            responsibleDesign: rulesets.responsibleDesign,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      const generatedCode = data.code || data.error || "No code generated";
      
      // Check if code appears truncated
      if (generatedCode && !generatedCode.includes("Error") && !generatedCode.includes("Demo Mode")) {
        // Check for common truncation indicators
        const isTruncated = (
          generatedCode.trim().endsWith("...") ||
          (language === "python" && generatedCode.includes("def ") && 
           !generatedCode.match(/def\s+\w+\([^)]*\):\s*$/m) && 
           generatedCode.split("def ").length > 1 && 
           !generatedCode.trim().endsWith(":"))
        );
        
        if (isTruncated) {
          setCode(generatedCode + "\n\n# ⚠️ Code may be incomplete. Please regenerate if needed.");
        } else {
          setCode(generatedCode);
        }
      } else {
        setCode(generatedCode);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Could not connect to API";
      console.error("Code generation API error:", error);
      setCode(`Error: ${errorMessage}. Please check if the backend is running on ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🧠 Ethical Code Generator</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate code that promotes responsible AI development and ethical practices
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
        <div className="mb-6">
          <RulesetConfig compact />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">What ethical code do you want to generate?</h2>
              
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
                  <label className="block text-sm font-medium mb-2">Describe what you need</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create a function to process user data with fairness checks and bias detection"
                    className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>

                <button
                  onClick={generateCode}
                  disabled={loading || !prompt.trim()}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Generating ethical code..." : "Generate Ethical Code"}
                </button>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold mb-3">Example Prompts (AI Parenting Focus)</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setPrompt("Create a function to validate user input with fairness checks and bias prevention")}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                >
                  Fair input validation with bias checks
                </button>
                <button
                  onClick={() => setPrompt("Implement a recommendation system with transparency and explainability features")}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                >
                  Transparent recommendation system
                </button>
                <button
                  onClick={() => setPrompt("Create an API endpoint for AI model inference with safety checks and error handling")}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                >
                  Safe AI inference endpoint
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Generated Ethical Code</h2>
              {code && (
                <button
                  onClick={copyCode}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  📋 Copy
                </button>
              )}
            </div>

            {!code && !loading && (
              <div className="h-96 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌱</div>
                  <p>Your ethical code will appear here</p>
                  <p className="text-sm mt-2 text-gray-500">Generated with AI parenting principles</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-pulse">🌱</div>
                  <p className="text-gray-600 dark:text-gray-400">Generating ethical code...</p>
                </div>
              </div>
            )}

            {code && (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{code}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
