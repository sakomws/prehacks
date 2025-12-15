"use client";

import { useState } from "react";
import RulesetConfig, { useRulesetConfig } from "@/components/RulesetConfig";

const principles = [
  {
    id: "ethicalFoundation",
    icon: "🌱",
    title: "Ethical Foundation",
    description: "Code that promotes fairness and responsible AI development",
  },
  {
    id: "biasAwareness",
    icon: "⚖️",
    title: "Bias Awareness",
    description: "Detect and prevent biases that AI systems might inherit",
  },
  {
    id: "safetyFirst",
    icon: "🛡️",
    title: "Safety First",
    description: "Prioritize security, error handling, and safe defaults",
  },
  {
    id: "responsibleDesign",
    icon: "📚",
    title: "Responsible Design",
    description: "Consider long-term impact on AI systems and users",
  },
];

const styles = [
  { id: "illustration", label: "🎨 Illustration", desc: "Artistic illustration" },
  { id: "infographic", label: "📊 Infographic", desc: "Data visualization" },
  { id: "storyboard", label: "🎬 Storyboard", desc: "Video storyboard" },
  { id: "diagram", label: "📐 Diagram", desc: "Technical diagram" },
];

export default function ImagesPage() {
  const [selectedPrinciple, setSelectedPrinciple] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("illustration");
  const [imageResult, setImageResult] = useState<{
    imageUrl: string;
    imagePrompt: string;
    principle: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const rulesets = useRulesetConfig();

  const generateImage = async () => {
    if (!selectedPrinciple) {
      alert("Please select an AI Parenting principle");
      return;
    }

    setLoading(true);
    setImageResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/image/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principle: selectedPrinciple,
          style: selectedStyle,
        }),
      });

      const data = await response.json();
      setImageResult({
        imageUrl: data.imageUrl || "",
        imagePrompt: data.imagePrompt || "",
        principle: data.principle || selectedPrinciple,
      });
    } catch (error) {
      alert("Error generating image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = () => {
    if (imageResult?.imagePrompt) {
      navigator.clipboard.writeText(imageResult.imagePrompt);
      alert("Prompt copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🖼️</span> AI Parenting Image Generator
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generate images for AI Parenting principles
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
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Select Principle & Style</h2>

              <div className="space-y-4">
                {/* Principle Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">AI Parenting Principle *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {principles.map((principle) => (
                      <button
                        key={principle.id}
                        onClick={() => setSelectedPrinciple(principle.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedPrinciple === principle.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <div className="text-2xl mb-2">{principle.icon}</div>
                        <div className="font-medium">{principle.title}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {principle.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Image Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {styles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          selectedStyle === style.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-sm">{style.label}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {style.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateImage}
                  disabled={loading || !selectedPrinciple}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Generating Image..." : "🖼️ Generate Image"}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span>💡</span> About Image Generation
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                <li>Generates optimized prompts for image generation</li>
                <li>Creates actual images if DALL-E API key is configured</li>
                <li>Supports multiple styles: illustration, infographic, storyboard, diagram</li>
                <li>Copy prompts to use with other image generation tools</li>
              </ul>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            {/* Generated Image */}
            {imageResult && (
              <>
                {imageResult.imageUrl ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span>🖼️</span> Generated Image
                    </h3>
                    <img
                      src={imageResult.imageUrl}
                      alt={`${imageResult.principle} illustration`}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <div className="mt-4 flex gap-2">
                      <a
                        href={imageResult.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
                      >
                        🔗 Open Full Size
                      </a>
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = imageResult.imageUrl;
                          link.download = `${imageResult.principle}-image.png`;
                          link.click();
                        }}
                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        💾 Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <span>⚠️</span> Image Generation Prompt
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      No image generation API key configured. Use the prompt below with image generation tools like DALL-E, Midjourney, or Stable Diffusion.
                    </p>
                  </div>
                )}

                {/* Image Prompt */}
                {imageResult.imagePrompt && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span>📝</span> Image Generation Prompt
                      </h3>
                      <button
                        onClick={copyPrompt}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {imageResult.imagePrompt}
                      </p>
                    </div>
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      💡 Tip: Use this prompt with DALL-E, Midjourney, Stable Diffusion, or other image generation tools
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!imageResult && !loading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Select a principle and style to generate image
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="text-6xl mb-4 animate-pulse">🎨</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Generating image...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
