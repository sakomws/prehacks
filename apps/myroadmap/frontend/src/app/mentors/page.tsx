"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Mentor {
  id: number;
  title: string;
  bio: string;
  expertise: string;
  hourly_rate: number;
  rating: number;
  total_sessions: number;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch("http://localhost:8002/api/mentors/");
      const data = await response.json();
      setMentors(data);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-3xl">🗺️</div>
              <h1 className="text-2xl font-bold">MyRoadmap</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/sessions" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
                My Sessions
              </Link>
              <Link href="/roadmap" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
                My Roadmap
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Find Your Mentor</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Connect with expert mentors to accelerate your learning journey
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-600 dark:text-gray-300">Loading mentors...</p>
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-600 dark:text-gray-300">No mentors available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {mentor.title.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    ⭐ {mentor.rating.toFixed(1)}
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{mentor.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {mentor.bio}
                </p>

                <div className="mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expertise:</div>
                  <div className="text-sm font-medium">{mentor.expertise}</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">${mentor.hourly_rate}</div>
                    <div className="text-xs text-gray-500">per hour</div>
                  </div>
                  <Link
                    href={`/mentors/${mentor.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Book Session
                  </Link>
                </div>

                <div className="mt-3 text-xs text-gray-500 text-center">
                  {mentor.total_sessions} sessions completed
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
