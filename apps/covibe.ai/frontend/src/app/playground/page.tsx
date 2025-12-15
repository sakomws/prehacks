"use client";

import { useState, useEffect } from "react";
import RulesetConfig, { useRulesetConfig } from "@/components/RulesetConfig";

interface ParentingScore {
  ethicalFoundation: number;
  biasAwareness: number;
  safetyFirst: number;
  responsibleDesign: number;
  overall: number;
}

interface AnalysisResult {
  score: ParentingScore;
  feedback: string;
  improvements: string[];
  strengths: string[];
}

export default function PlaygroundPage() {
  const [code, setCode] = useState(`def process_user_data(users):
    """Process user data for recommendations"""
    results = []
    for user in users:
        score = calculate_score(user)
        results.append(score)
    return results

def calculate_score(user):
    return user.age * 0.3 + user.income * 0.7`);
  
  const [language, setLanguage] = useState("python");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [improvedCode, setImprovedCode] = useState("");
  const rulesets = useRulesetConfig();

  const analyzeCode = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setAnalysis(null);

    try {
      // Get parenting score
      const scoreResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/code/parenting-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code, 
          language,
          rulesets: {
            ethicalFoundation: rulesets.ethicalFoundation,
            biasAwareness: rulesets.biasAwareness,
            safetyFirst: rulesets.safetyFirst,
            responsibleDesign: rulesets.responsibleDesign,
          }
        }),
      });

      const scoreData = await scoreResponse.json();
      
      // Get detailed analysis
      const analysisResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/code/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code, 
          language,
          rulesets: {
            ethicalFoundation: rulesets.ethicalFoundation,
            biasAwareness: rulesets.biasAwareness,
            safetyFirst: rulesets.safetyFirst,
            responsibleDesign: rulesets.responsibleDesign,
          }
        }),
      });

      const analysisData = await analysisResponse.json();
      
      const analysisText = analysisData.analysis || scoreData.feedback || "";
      
      // Use scores from API or calculate fallback
      const score: ParentingScore = scoreData.score || {
        ethicalFoundation: calculateScore(analysisText, ["ethical", "fairness", "transparency", "responsible"]),
        biasAwareness: calculateScore(analysisText, ["bias", "discrimination", "fair", "unbiased"]),
        safetyFirst: calculateScore(analysisText, ["security", "error", "safety", "validation", "exception"]),
        responsibleDesign: calculateScore(analysisText, ["long-term", "impact", "sustainable", "maintainable"]),
        overall: 0,
      };
      
      if (!scoreData.score) {
        score.overall = Math.round(
          (score.ethicalFoundation + score.biasAwareness + score.safetyFirst + score.responsibleDesign) / 4
        );
      }

      // Extract improvements and strengths
      const improvements = scoreData.improvements || extractList(analysisText, ["improvement", "suggestion", "recommendation", "should", "consider"]);
      const strengths = extractList(analysisText, ["good", "excellent", "well", "strong", "positive"]);

      setAnalysis({
        score,
        feedback: analysisText,
        improvements: improvements.slice(0, 5),
        strengths: strengths.slice(0, 3),
      });

      // Generate improved code
      generateImprovedCode();
    } catch (error) {
      setAnalysis({
        score: { ethicalFoundation: 0, biasAwareness: 0, safetyFirst: 0, responsibleDesign: 0, overall: 0 },
        feedback: "Error: Could not connect to API",
        improvements: [],
        strengths: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const generateImprovedCode = async () => {
    try {
      const prompt = `Improve this ${language} code following AI parenting principles. Make it more ethical, safe, and responsible. Return only the improved code:\n\n${code}`;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/code/generate`, {
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

      const data = await response.json();
      setImprovedCode(data.code || "");
      setShowComparison(true);
    } catch (error) {
      console.error("Failed to generate improved code:", error);
    }
  };

  const calculateScore = (text: string, keywords: string[]): number => {
    const lowerText = text.toLowerCase();
    const matches = keywords.filter(kw => lowerText.includes(kw.toLowerCase())).length;
    return Math.min(100, Math.max(0, (matches / keywords.length) * 100 + 40));
  };

  const extractList = (text: string, keywords: string[]): string[] => {
    const sentences = text.split(/[.!?]\s+/);
    return sentences
      .filter(s => keywords.some(kw => s.toLowerCase().includes(kw.toLowerCase())))
      .slice(0, 5)
      .map(s => s.trim());
  };

  useEffect(() => {
    // Auto-analyze after 2 seconds of no typing
    const timer = setTimeout(() => {
      if (code.trim() && code.length > 20 && !loading) {
        analyzeCode();
      }
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, language]);

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

  const shareScore = () => {
    if (!analysis) return;
    
    const text = `🌱 My AI Parenting Score: ${analysis.score.overall}/100\n\n` +
      `Ethical Foundation: ${analysis.score.ethicalFoundation}/100\n` +
      `Bias Awareness: ${analysis.score.biasAwareness}/100\n` +
      `Safety First: ${analysis.score.safetyFirst}/100\n` +
      `Responsible Design: ${analysis.score.responsibleDesign}/100\n\n` +
      `Try it at: ${window.location.origin}/playground`;
    
    if (navigator.share) {
      navigator.share({
        title: "My AI Parenting Score",
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert("Score copied to clipboard!");
    }
  };

  const exportReport = () => {
    if (!analysis) return;
    
    const report = `AI Parenting Code Analysis Report
${"=".repeat(50)}

Overall Score: ${analysis.score.overall}/100

Principle Scores:
- Ethical Foundation: ${analysis.score.ethicalFoundation}/100
- Bias Awareness: ${analysis.score.biasAwareness}/100
- Safety First: ${analysis.score.safetyFirst}/100
- Responsible Design: ${analysis.score.responsibleDesign}/100

${analysis.strengths.length > 0 ? `Strengths:\n${analysis.strengths.map(s => `✓ ${s}`).join("\n")}\n\n` : ""}
${analysis.improvements.length > 0 ? `Improvements:\n${analysis.improvements.map(i => `→ ${i}`).join("\n")}\n\n` : ""}
Detailed Analysis:
${analysis.feedback}

Code Analyzed:
\`\`\`${language}
${code}
\`\`\`

Generated by Covibe.ai - AI Parenting for Code
`;
    
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-parenting-score-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🌱</span> AI Parenting Playground
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Live code analysis with real-time AI parenting scores
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              ← Home
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Ruleset Config */}
        <div className="mb-6">
          <RulesetConfig compact />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Code Editor</h2>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 font-mono text-sm p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100"
                placeholder="Write your code here... It will be analyzed automatically!"
              />
              <button
                onClick={analyzeCode}
                disabled={loading || !code.trim()}
                className="mt-4 w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Analyzing..." : "🔍 Analyze Code"}
              </button>
            </div>

            {/* Comparison View */}
            {showComparison && improvedCode && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>✨</span> Improved Code (AI Parenting Enhanced)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">Original</div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                      <code>{code}</code>
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">Improved</div>
                    <pre className="bg-green-900/20 border-2 border-green-500 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                      <code>{improvedCode}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Score Dashboard */}
          <div className="space-y-4">
            {/* Overall Score */}
            {analysis && (
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10">
                  <div className="text-sm opacity-90 mb-2">AI Parenting Score</div>
                  <div className="text-5xl font-bold mb-2">{analysis.score.overall}</div>
                  <div className="text-sm opacity-90 mb-4">
                    {analysis.score.overall >= 80 ? "🌟 Excellent AI Parent" : 
                     analysis.score.overall >= 60 ? "👍 Good AI Parent" : 
                     "🌱 Needs Improvement"}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={shareScore}
                      className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      📤 Share
                    </button>
                    <button
                      onClick={exportReport}
                      className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      💾 Export
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Scores */}
            {analysis && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4">Principle Scores</h3>
                <div className="space-y-4">
                  {[
                    { key: "ethicalFoundation", icon: "🌱", label: "Ethical Foundation" },
                    { key: "biasAwareness", icon: "⚖️", label: "Bias Awareness" },
                    { key: "safetyFirst", icon: "🛡️", label: "Safety First" },
                    { key: "responsibleDesign", icon: "📚", label: "Responsible Design" },
                  ].map(({ key, icon, label }) => {
                    const score = analysis.score[key as keyof ParentingScore] as number;
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
            )}

            {/* Strengths */}
            {analysis && analysis.strengths.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>✨</span> Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {analysis && analysis.improvements.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>💡</span> Suggested Improvements
                </h3>
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty State */}
            {!analysis && !loading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🌱</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Write code to see your AI Parenting Score
                  </p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4 animate-pulse">🌱</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Analyzing your code...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
