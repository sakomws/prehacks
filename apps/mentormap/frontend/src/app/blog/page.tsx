"use client";

import { useEffect } from "react";

export default function BlogPage() {
  useEffect(() => {
    // Redirect to Vurghun's Substack blog
    window.location.href = "https://vurghun.substack.com";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">📝</div>
        <p className="text-gray-600 dark:text-gray-300">Redirecting to blog...</p>
      </div>
    </div>
  );
}
