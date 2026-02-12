"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function ShareRoadmapContent() {
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "My Roadmap";
  const progress = searchParams.get("progress") || "0";
  const textParam = searchParams.get("text");
  
  const shareText = textParam || 
    `🎯 I'm ${progress}% through my learning roadmap: "${title}"!\n\nBuilding my skills with MentorMap 🗺️\n#LearningJourney #CareerGrowth #MentorMap`;

  // Set page title and Open Graph meta tags
  useEffect(() => {
    document.title = `Learning Roadmap: ${title}`;
    
    // Set Open Graph meta tags dynamically
    const setMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    setMetaTag("og:title", `🎯 ${progress}% through: ${title}`);
    setMetaTag("og:description", shareText.replace(/\n/g, " "));
    setMetaTag("og:type", "website");
    setMetaTag("og:url", window.location.href);
  }, [title, progress, shareText]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          {progress && (
            <div className="text-5xl font-bold text-blue-600 mb-4">
              {progress}% Complete
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2 font-medium">Share this on LinkedIn:</p>
          <pre className="text-sm whitespace-pre-wrap font-sans text-gray-900 bg-white p-4 rounded border">
            {shareText}
          </pre>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Visit MentorMap
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ShareRoadmapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ShareRoadmapContent />
    </Suspense>
  );
}
