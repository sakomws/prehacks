"use client";

import { useState } from "react";
import RulesetConfig, { useRulesetConfig } from "@/components/RulesetConfig";

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const rulesets = useRulesetConfig();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
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
      
      const aiMessage = {
        role: "assistant",
        content: data.response || data.error || "No response",
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage = error?.message || "Could not connect to API";
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errorMessage}. Please check if the backend is running on ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🌱 AI Parenting Chat</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn ethical AI development and responsible coding practices
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

      {/* Ruleset Config */}
      <div className="px-4 pt-4">
        <div className="max-w-4xl mx-auto">
          <RulesetConfig compact />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <h2 className="text-xl font-semibold mb-2">Start learning about AI Parenting</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Ask me about ethical AI development, responsible coding, and how to be a good "AI parent"
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <button
                  onClick={() => setInput("What does it mean to 'parent AI' through code?")}
                  className="p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500"
                >
                  <div className="font-medium">AI Parenting Concept</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Understanding the metaphor
                  </div>
                </button>
                <button
                  onClick={() => setInput("How can I write code that prevents bias in AI systems?")}
                  className="p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500"
                >
                  <div className="font-medium">Bias Prevention</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Ethical coding practices
                  </div>
                </button>
                <button
                  onClick={() => setInput("What are the ethical considerations when building AI features?")}
                  className="p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500"
                >
                  <div className="font-medium">Ethical AI Development</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Best practices and guidelines
                  </div>
                </button>
                <button
                  onClick={() => setInput("How do I ensure my code promotes fairness and transparency?")}
                  className="p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500"
                >
                  <div className="font-medium">Fairness & Transparency</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Responsible AI principles
                  </div>
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {msg.role === "user" ? "👤" : "🌱"}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">
                      {msg.role === "user" ? "You" : "AI Parenting Guide"}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🌱</div>
                  <div>
                    <div className="font-semibold mb-1">AI Parenting Guide</div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && sendMessage()}
              placeholder="Ask about ethical AI development, responsible coding, or AI parenting..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Press Enter to send • Powered by Gemini with AI Parenting principles
          </div>
        </div>
      </div>
    </div>
  );
}
