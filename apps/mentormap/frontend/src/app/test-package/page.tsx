"use client";

import { useState } from "react";

export default function TestPackagePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCreatePackage = async () => {
    setLoading(true);
    setResult(null);
    
    const token = localStorage.getItem("token");
    if (!token) {
      setResult({ error: "No token found. Please log in first." });
      setLoading(false);
      return;
    }

    const testData = {
      name: "Test Package",
      description: "Test description",
      sessions_count: 1,
      price: 100,
      features: ["Feature 1", "Feature 2"],
      is_popular: false,
      chat_weeks: 0,
    };

    try {
      console.log("Testing package creation...");
      console.log("Token:", token.substring(0, 20) + "...");
      console.log("Data:", testData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/packages/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(testData),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setResult({ success: true, data });
      } else {
        setResult({ error: data.detail || data.message || JSON.stringify(data) });
      }
    } catch (error) {
      console.error("Error:", error);
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Package Creation Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={testCreatePackage}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Create Package"}
          </button>
        </div>

        {result && (
          <div
            className={`bg-white rounded-lg shadow p-6 ${
              result.success ? "border-green-500 border-2" : "border-red-500 border-2"
            }`}
          >
            <h2 className="text-xl font-bold mb-4">
              {result.success ? "✅ Success" : "❌ Error"}
            </h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Debug Info</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Token exists:</strong>{" "}
              {localStorage.getItem("token") ? "Yes" : "No"}
            </p>
            <p>
              <strong>Token preview:</strong>{" "}
              {localStorage.getItem("token")?.substring(0, 30) || "N/A"}...
            </p>
            <p>
              <strong>API URL:</strong>{" "}
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


