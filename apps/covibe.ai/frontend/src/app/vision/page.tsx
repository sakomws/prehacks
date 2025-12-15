"use client";

import { useState, useRef } from "react";
import RulesetConfig, { useRulesetConfig } from "@/components/RulesetConfig";

export default function VisionPage() {
  const [image, setImage] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<string>("auto");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rulesets = useRulesetConfig();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    setCode("");
    setAnalysis("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/code/analyze-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: image,
          language: language === "auto" ? null : language,
          rulesets: {
            ethicalFoundation: rulesets.ethicalFoundation,
            biasAwareness: rulesets.biasAwareness,
            safetyFirst: rulesets.safetyFirst,
            responsibleDesign: rulesets.responsibleDesign,
          }
        }),
      });

      const data = await response.json();
      
      setCode(data.code || "");
      
      // Ensure analysis is shown - prioritize analysis field
      if (data.analysis && data.analysis.trim() && data.analysis !== "Analysis completed.") {
        setAnalysis(data.analysis);
      } else if (data.error) {
        setAnalysis(`Error: ${data.error}`);
      } else if (data.code && (!data.analysis || data.analysis.trim() === "")) {
        // If we have code but no analysis, trigger a fallback analysis
        setAnalysis("Code extracted. Generating detailed analysis...");
        // Try to get analysis for the extracted code
        setTimeout(async () => {
          try {
            const analysisResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/code/analyze`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: data.code,
                language: language === "auto" ? "python" : language,
                rulesets: {
                  ethicalFoundation: rulesets.ethicalFoundation,
                  biasAwareness: rulesets.biasAwareness,
                  safetyFirst: rulesets.safetyFirst,
                  responsibleDesign: rulesets.responsibleDesign,
                }
              }),
            });
            const analysisData = await analysisResponse.json();
            if (analysisData.analysis) {
              setAnalysis(analysisData.analysis);
            }
          } catch (e) {
            console.error("Fallback analysis failed:", e);
          }
        }, 1000);
      } else {
        setAnalysis(data.analysis || "No analysis available. Please try again.");
      }
    } catch (error) {
      setAnalysis("Error: Could not connect to API");
    } finally {
      setLoading(false);
    }
  };

  const generateFromImage = async () => {
    if (!image) return;

    setLoading(true);
    setCode("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/code/generate-from-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: image,
          language: language === "auto" ? null : language,
          rulesets: {
            ethicalFoundation: rulesets.ethicalFoundation,
            biasAwareness: rulesets.biasAwareness,
            safetyFirst: rulesets.safetyFirst,
            responsibleDesign: rulesets.responsibleDesign,
          }
        }),
      });

      const data = await response.json();
      setCode(data.code || data.error || "No code generated");
      setAnalysis("Code extracted and improved with AI Parenting principles!");
    } catch (error) {
      setCode("Error: Could not connect to API");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setCode("");
    setAnalysis("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>📸</span> Multimodal Code Analysis
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload screenshots of code and get AI Parenting analysis
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Ruleset Config */}
        <div className="mb-6">
          <RulesetConfig compact />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Upload */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Upload Code Screenshot</h2>
              
              {!image ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <div className="text-4xl mb-4">📷</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={image}
                      alt="Uploaded code"
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ✕ Remove
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Language (optional)</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    >
                      <option value="auto">Auto-detect</option>
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={analyzeImage}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? "Analyzing..." : "🔍 Analyze Code"}
                    </button>
                    <button
                      onClick={generateFromImage}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? "Generating..." : "✨ Extract & Improve"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span>💡</span> How to Test Multimodality
              </h3>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
                <li>Take a screenshot of code (from your IDE, GitHub, or anywhere)</li>
                <li>Upload the image using the upload area above</li>
                <li>Click "Analyze Code" to extract and analyze the code</li>
                <li>Or click "Extract & Improve" to get improved ethical code</li>
                <li>The AI will extract code from the image and provide AI Parenting analysis</li>
              </ol>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Extracted Code */}
            {code && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>📝</span> Extracted Code
                </h2>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{code}</code>
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="mt-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  📋 Copy Code
                </button>
              </div>
            )}

            {/* Analysis */}
            {(analysis || code) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🌱</span> AI Parenting Analysis
                </h2>
                {analysis ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {analysis}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 italic">
                    Analysis is being generated... If this persists, the image may not contain readable code.
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!code && !analysis && !loading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload a code screenshot to see analysis
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="text-6xl mb-4 animate-pulse">🌱</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Analyzing image with multimodal AI...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
