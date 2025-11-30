"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Redirect based on role will be handled by the pages
        router.push("/");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
    setLoading(true);

    try {
      const success = await login(demoEmail, demoPassword);
      if (success) {
        router.push("/");
      } else {
        setError("Login failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-600 to-orange-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <img
              src="/logo.svg"
              alt="Dog Angelenos Logo"
              className="w-48 h-48 mx-auto"
            />
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-white/90">Sign in to Dog Angelenos</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Demo Users Section */}
        {showDemoUsers && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">🎭 Demo Accounts</h3>
              <button
                onClick={() => setShowDemoUsers(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Click to quickly sign in with a demo account:
            </p>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin("customer@demo.com", "customer123")}
                disabled={loading}
                className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 transition text-left disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="font-semibold text-sm">Customer Account</p>
                    <p className="text-xs text-gray-600">customer@demo.com</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => quickLogin("trainer@demo.com", "trainer123")}
                disabled={loading}
                className="w-full p-3 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 transition text-left disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎓</span>
                  <div>
                    <p className="font-semibold text-sm">Trainer Account</p>
                    <p className="text-xs text-gray-600">trainer@demo.com</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => quickLogin("admin@demo.com", "admin123")}
                disabled={loading}
                className="w-full p-3 bg-white border-2 border-pink-200 rounded-lg hover:border-pink-400 transition text-left disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-semibold text-sm">Admin Account</p>
                    <p className="text-xs text-gray-600">admin@demo.com</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
