"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/config/api";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleUnsubscribe = async () => {
    if (!email) {
      setStatus("error");
      setMessage("Email parameter is required");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/admin/newsletter/unsubscribe?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setStatus("success");
        setMessage("You have been successfully unsubscribed from our newsletter.");
      } else {
        const errorData = await response.json().catch(() => ({ detail: "Failed to unsubscribe" }));
        setStatus("error");
        setMessage(errorData.detail || "Failed to unsubscribe. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
      console.error("Unsubscribe error:", error);
    }
  };

  useEffect(() => {
    if (email && status === "idle") {
      handleUnsubscribe();
    }
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {status === "success" ? "✅" : status === "error" ? "❌" : "📧"}
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {status === "success" 
              ? "Unsubscribed Successfully" 
              : status === "error" 
              ? "Unsubscribe Failed" 
              : "Unsubscribing..."}
          </h1>
          
          {status === "loading" && (
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {message && (
            <p className={`mb-6 ${
              status === "success" 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
              {message}
            </p>
          )}

          {status === "error" && email && (
            <button
              onClick={handleUnsubscribe}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
            >
              Try Again
            </button>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                You will no longer receive newsletter emails from MentorMap.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If you change your mind, you can subscribe again anytime.
              </p>
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}

