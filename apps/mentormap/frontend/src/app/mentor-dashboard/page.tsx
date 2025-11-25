"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

interface Session {
  id: number;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  price: number;
  status: string;
  payment_status: string;
  student_id: number;
  created_at: string;
}

export default function MentorDashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingSession, setCompletingSession] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isMentor, setIsMentor] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    checkMentorAccess();
  }, []);

  const checkMentorAccess = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Check if user has a mentor profile
      const response = await fetch("http://localhost:8000/api/mentors/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsMentor(true);
        fetchMentorSessions();
      } else if (response.status === 404) {
        // User is not a mentor
        setIsMentor(false);
        setCheckingAccess(false);
        setLoading(false);
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error checking mentor access:", error);
      setCheckingAccess(false);
      setLoading(false);
    }
  };

  const fetchMentorSessions = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Get mentor's sessions
      const response = await fetch("http://localhost:8000/api/sessions/mentor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setCheckingAccess(false);
      setLoading(false);
    }
  };

  const markAsComplete = async (sessionId: number) => {
    const token = localStorage.getItem("token");
    setCompletingSession(sessionId);

    try {
      const response = await fetch(`http://localhost:8000/api/sessions/${sessionId}/complete`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("✅ Session marked as complete!");
        fetchMentorSessions();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error("Error completing session:", error);
      alert("Error marking session as complete");
    } finally {
      setCompletingSession(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      scheduled: "bg-blue-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduled_at);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-24 bg-gray-50 dark:bg-gray-900"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const daySessions = getSessionsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`min-h-24 border border-gray-200 dark:border-gray-700 p-2 ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {daySessions.map(session => {
              const time = new Date(session.scheduled_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
              return (
                <div
                  key={session.id}
                  className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getStatusColor(session.status)} text-white`}
                  title={`${session.title} - ${time}`}
                >
                  <div className="font-medium truncate">{time}</div>
                  <div className="truncate">{session.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={previousMonth}
            className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            ← Previous
          </button>
          <h3 className="text-lg font-semibold">{monthName}</h3>
          <button
            onClick={nextMonth}
            className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Next →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-semibold text-sm bg-gray-100 dark:bg-gray-700 border-b">
              {day}
            </div>
          ))}
          {days}
        </div>
        <div className="p-4 border-t flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo size="lg" className="transition-transform group-hover:scale-110" />
              <h1 className="text-2xl font-bold">MentorMap</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/sessions" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
                My Sessions
              </Link>
              <Link href="/roadmap" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
                Roadmaps
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Mentor Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your mentorship sessions
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === "calendar"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                📅 Calendar
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                📋 List
              </button>
            </div>
          </div>
        </div>

        {checkingAccess ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-600 dark:text-gray-300">Checking access...</p>
          </div>
        ) : !isMentor ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This page is only accessible to mentors.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/become-mentor"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Become a Mentor
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Go Home
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-600 dark:text-gray-300">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your upcoming mentorship sessions will appear here
            </p>
          </div>
        ) : viewMode === "calendar" ? (
          renderCalendar()
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white dark:bg-gray-800 rounded-lg border p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{session.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {session.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">📅 Scheduled:</span>
                        <span className="ml-2 font-medium">
                          {new Date(session.scheduled_at).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">⏱️ Duration:</span>
                        <span className="ml-2 font-medium">{session.duration_minutes} minutes</span>
                      </div>
                      <div>
                        <span className="text-gray-500">💰 Price:</span>
                        <span className="ml-2 font-medium">${session.price}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">💳 Payment:</span>
                        <span className="ml-2 font-medium capitalize">{session.payment_status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {session.status === "scheduled" && session.payment_status === "paid" && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={() => markAsComplete(session.id)}
                      disabled={completingSession === session.id}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                      {completingSession === session.id ? "Completing..." : "✓ Mark as Complete"}
                    </button>
                  </div>
                )}

                {session.status === "completed" && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="text-2xl">✓</span>
                      <span className="font-medium">Session completed</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
