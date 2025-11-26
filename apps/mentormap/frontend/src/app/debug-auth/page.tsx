"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DebugAuthPage() {
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (storedToken) {
      // Try to fetch user info
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/me`, {
        headers: {
          "Authorization": `Bearer ${storedToken}`,
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
        })
        .then((data) => setUserInfo(data))
        .catch((err) => setError(err.message));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">Token Status</h2>
            {token ? (
              <div>
                <p className="text-green-600 font-semibold mb-2">✅ Token exists</p>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-x-auto">
                  <code className="text-sm break-all">{token}</code>
                </div>
              </div>
            ) : (
              <p className="text-red-600 font-semibold">❌ No token found in localStorage</p>
            )}
          </div>

          {token && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-4">User Info</h2>
              {userInfo ? (
                <div>
                  <p className="text-green-600 font-semibold mb-2">✅ Token is valid</p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                    <pre className="text-sm">{JSON.stringify(userInfo, null, 2)}</pre>
                  </div>
                </div>
              ) : error ? (
                <div>
                  <p className="text-red-600 font-semibold mb-2">❌ Token validation failed</p>
                  <p className="text-gray-600 dark:text-gray-300">{error}</p>
                </div>
              ) : (
                <p className="text-gray-600">Loading...</p>
              )}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            <div className="space-y-3">
              {!token && (
                <Link
                  href="/login"
                  className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                >
                  Go to Login
                </Link>
              )}
              {token && (
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.reload();
                  }}
                  className="block w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear Token
                </button>
              )}
              <Link
                href="/"
                className="block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
