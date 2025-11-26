"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header showAuth={false} />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Welcome back, {user?.full_name || user?.username}!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/mentors"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Find Mentors</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Browse and connect with expert mentors
            </p>
          </Link>

          <Link
            href="/sessions"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">My Sessions</h3>
            <p className="text-gray-600 dark:text-gray-300">
              View and manage your mentorship sessions
            </p>
          </Link>

          <Link
            href="/roadmap"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Learning Roadmap</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track your progress and goals
            </p>
          </Link>

          <Link
            href="/referral"
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-bold mb-2">Refer & Earn</h3>
            <p className="opacity-90">
              Get 50% off by referring friends
            </p>
          </Link>

          <Link
            href="/pricing"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Pricing</h3>
            <p className="text-gray-600 dark:text-gray-300">
              View session packages and pricing
            </p>
          </Link>

          <button
            onClick={handleLogout}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-4">🚪</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Logout</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sign out of your account
            </p>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Account Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Name:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{user?.full_name}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Email:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Username:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{user?.username}</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
