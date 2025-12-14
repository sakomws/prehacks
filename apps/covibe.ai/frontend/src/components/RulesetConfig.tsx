"use client";

import { useState, useEffect } from "react";

export interface RulesetConfig {
  ethicalFoundation: boolean;
  biasAwareness: boolean;
  safetyFirst: boolean;
  responsibleDesign: boolean;
}

const defaultRulesets: RulesetConfig = {
  ethicalFoundation: true,
  biasAwareness: true,
  safetyFirst: true,
  responsibleDesign: true,
};

interface RulesetConfigProps {
  onConfigChange?: (config: RulesetConfig) => void;
  compact?: boolean;
}

export default function RulesetConfig({ onConfigChange, compact = false }: RulesetConfigProps) {
  const [config, setConfig] = useState<RulesetConfig>(defaultRulesets);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("aiParentingRulesets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ ...defaultRulesets, ...parsed });
      } catch (e) {
        // Use defaults if parsing fails
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever config changes
    localStorage.setItem("aiParentingRulesets", JSON.stringify(config));
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  const toggleRule = (key: keyof RulesetConfig) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const rulesets = [
    {
      key: "ethicalFoundation" as keyof RulesetConfig,
      icon: "🌱",
      title: "Ethical Foundation",
      description: "Code that promotes fairness and responsible AI development",
    },
    {
      key: "biasAwareness" as keyof RulesetConfig,
      icon: "⚖️",
      title: "Bias Awareness",
      description: "Detect and prevent biases that AI systems might inherit",
    },
    {
      key: "safetyFirst" as keyof RulesetConfig,
      icon: "🛡️",
      title: "Safety First",
      description: "Prioritize security, error handling, and safe defaults",
    },
    {
      key: "responsibleDesign" as keyof RulesetConfig,
      icon: "📚",
      title: "Responsible Design",
      description: "Consider long-term impact on AI systems and users",
    },
  ];

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>🌱</span> AI Parenting Rulesets
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {rulesets.map((rule) => (
            <button
              key={rule.key}
              onClick={() => toggleRule(rule.key)}
              className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                config[rule.key]
                  ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400"
                  : "bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600"
              }`}
            >
              <span className="text-lg">{rule.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{rule.title}</div>
              </div>
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  config[rule.key]
                    ? "bg-blue-500 border-blue-500"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                }`}
              >
                {config[rule.key] && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span>🌱</span> Configure AI Parenting Rulesets
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Toggle the principles you want to apply when generating or analyzing code
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rulesets.map((rule) => (
          <button
            key={rule.key}
            onClick={() => toggleRule(rule.key)}
            className={`flex items-start gap-3 p-4 rounded-lg text-left transition-all ${
              config[rule.key]
                ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400 shadow-sm"
                : "bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <div className="text-2xl flex-shrink-0">{rule.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium mb-1">{rule.title}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</div>
            </div>
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                config[rule.key]
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              }`}
            >
              {config[rule.key] && (
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function useRulesetConfig(): RulesetConfig {
  const [config, setConfig] = useState<RulesetConfig>(defaultRulesets);

  useEffect(() => {
    const saved = localStorage.getItem("aiParentingRulesets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ ...defaultRulesets, ...parsed });
      } catch (e) {
        // Use defaults
      }
    }
  }, []);

  return config;
}
