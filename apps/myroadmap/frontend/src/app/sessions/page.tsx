"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Session {
  id: number;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  price: number;
  payment_status: string;
  mentor_id: number;
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8002/api/sessions/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelSession = async (id: number) => {
    const token = localStorage.getItem("token");

    try {
      await fetch(`http://localhost:8002/api/sessions/${id}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSessions();
    } catch (error) {
      console.error("Error cancelling session:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "completed":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-3xl">🗺️</div>
              <h1 className="text-2xl font-bold">MyRoadmap</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/mentors" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
                Find Mentors
              </Link>
              <Link href="/roadmap" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
                My Roadmap
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/");
                }}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Sessions</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage your mentorship sessions
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-600 dark:text-gray-300">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Book your first session with a mentor to get started
            </p>
            <Link
              href="/mentors"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Find a Mentor
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{session.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {session.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">📅 Date</div>
                        <div className="font-medium">
                          {new Date(session.scheduled_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">🕐 Time</div>
                        <div className="font-medium">
                          {new Date(session.scheduled_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">⏱️ Duration</div>
                        <div className="font-medium">{session.duration_minutes} min</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">💰 Price</div>
                        <div className="font-medium">${session.price.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">💳 Payment</div>
                        <div className="font-medium">
                          {session.payment_status === 'paid' ? (
                            <span className="text-green-600">✓ Paid</span>
                          ) : (
                            <span className="text-yellow-600">Pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {session.status === "scheduled" && (
                    <button
                      onClick={() => cancelSession(session.id)}
                      className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
