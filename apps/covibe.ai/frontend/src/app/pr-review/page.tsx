"use client";

import { useState } from "react";
import RulesetConfig, { useRulesetConfig } from "@/components/RulesetConfig";

interface PRReview {
  title: string;
  description: string;
  ethicalScore: number;
  biasScore: number;
  safetyScore: number;
  designScore: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  ethicalIssues: string[];
}

export default function PRReviewPage() {
  const [mode, setMode] = useState<"generate" | "review">("generate");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [codeChanges, setCodeChanges] = useState("");
  const [review, setReview] = useState<PRReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedPR, setGeneratedPR] = useState<{ title: string; description: string; body: string } | null>(null);
  const rulesets = useRulesetConfig();

  const generatePR = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please provide both title and description");
      return;
    }

    setLoading(true);
    setGeneratedPR(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/pr/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          codeChanges: codeChanges || undefined,
          rulesets: {
            ethicalFoundation: rulesets.ethicalFoundation,
            biasAwareness: rulesets.biasAwareness,
            safetyFirst: rulesets.safetyFirst,
            responsibleDesign: rulesets.responsibleDesign,
          }
        }),
      });

      const data = await response.json();
      setGeneratedPR({
        title: data.title || title,
        description: data.description || description,
        body: data.body || data.pr_description || "",
      });
    } catch (error) {
      alert("Error generating PR. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reviewPR = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please provide both title and description");
      return;
    }

    setLoading(true);
    setReview(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/pr/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          codeChanges: codeChanges || undefined,
          rulesets: {
            ethicalFoundation: rulesets.ethicalFoundation,
            biasAwareness: rulesets.biasAwareness,
            safetyFirst: rulesets.safetyFirst,
            responsibleDesign: rulesets.responsibleDesign,
          }
        }),
      });

      const data = await response.json();
      setReview(data);
    } catch (error) {
      alert("Error reviewing PR. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🔍</span> AI Parenting PR Review
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate ethical PRs or review existing ones with AI Parenting principles
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
        {/* Mode Toggle */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => {
              setMode("generate");
              setReview(null);
              setGeneratedPR(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === "generate"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            ✨ Generate PR
          </button>
          <button
            onClick={() => {
              setMode("review");
              setReview(null);
              setGeneratedPR(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === "review"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            🔍 Review PR
          </button>
        </div>

        {/* Ruleset Config */}
        <div className="mb-6">
          <RulesetConfig compact />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">
                {mode === "generate" ? "PR Details" : "PR to Review"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">PR Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Add user authentication feature"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">PR Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this PR does, why it's needed, and any important context..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Code Changes (Optional)
                  </label>
                  <textarea
                    value={codeChanges}
                    onChange={(e) => setCodeChanges(e.target.value)}
                    placeholder="Paste key code changes, diff snippets, or file paths..."
                    rows={8}
                    className="w-full px-4 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                </div>

                <button
                  onClick={mode === "generate" ? generatePR : reviewPR}
                  disabled={loading || !title.trim() || !description.trim()}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading
                    ? mode === "generate"
                      ? "Generating PR..."
                      : "Reviewing PR..."
                    : mode === "generate"
                    ? "✨ Generate Ethical PR"
                    : "🔍 Review PR"}
                </button>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span>💡</span> Tips
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                {mode === "generate" ? (
                  <>
                    <li>Describe the feature or fix clearly</li>
                    <li>Include context about why it's needed</li>
                    <li>Mention any ethical considerations</li>
                    <li>PR will be enhanced with AI Parenting principles</li>
                  </>
                ) : (
                  <>
                    <li>Paste the full PR description</li>
                    <li>Include code changes if available</li>
                    <li>Review will check for ethical issues</li>
                    <li>Get actionable improvement suggestions</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            {/* Generated PR */}
            {generatedPR && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span>✨</span> Generated PR
                  </h2>
                  <button
                    onClick={() => copyToClipboard(generatedPR.body)}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Title</div>
                    <div className="text-lg font-semibold">{generatedPR.title}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Description</div>
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {generatedPR.body}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PR Review Results */}
            {review && (
              <>
                {/* Overall Score */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="text-sm opacity-90 mb-2">AI Parenting PR Score</div>
                  <div className="text-5xl font-bold mb-2">{review.overallScore}</div>
                  <div className="text-sm opacity-90">
                    {review.overallScore >= 80
                      ? "🌟 Excellent - Ready to merge"
                      : review.overallScore >= 60
                      ? "👍 Good - Minor improvements needed"
                      : "🌱 Needs Work - Review recommendations"}
                  </div>
                </div>

                {/* Individual Scores */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold mb-4">Principle Scores</h3>
                  <div className="space-y-4">
                    {[
                      { key: "ethicalScore", icon: "🌱", label: "Ethical Foundation" },
                      { key: "biasScore", icon: "⚖️", label: "Bias Awareness" },
                      { key: "safetyScore", icon: "🛡️", label: "Safety First" },
                      { key: "designScore", icon: "📚", label: "Responsible Design" },
                    ].map(({ key, icon, label }) => {
                      const score = review[key as keyof PRReview] as number;
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span>{icon}</span>
                              <span className="text-sm font-medium">{label}</span>
                            </div>
                            <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                              {score}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getScoreBgColor(score)}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Strengths */}
                {review.strengths && review.strengths.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span>✨</span> Strengths
                    </h3>
                    <ul className="space-y-2">
                      {review.strengths.map((strength, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                        >
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ethical Issues */}
                {review.ethicalIssues && review.ethicalIssues.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                      <span>⚠️</span> Ethical Concerns
                    </h3>
                    <ul className="space-y-2">
                      {review.ethicalIssues.map((issue, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                        >
                          <span className="text-red-500 mt-1">!</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {review.improvements && review.improvements.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span>💡</span> Suggested Improvements
                    </h3>
                    <ul className="space-y-2">
                      {review.improvements.map((improvement, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                        >
                          <span className="text-blue-500 mt-1">→</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {review.recommendations && review.recommendations.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span>📋</span> Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {review.recommendations.map((rec, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                        >
                          <span className="text-purple-500 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!generatedPR && !review && !loading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {mode === "generate"
                    ? "Fill in PR details and generate an ethical PR description"
                    : "Fill in PR details to get AI Parenting review"}
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="text-6xl mb-4 animate-pulse">🌱</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {mode === "generate" ? "Generating ethical PR..." : "Analyzing PR..."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
