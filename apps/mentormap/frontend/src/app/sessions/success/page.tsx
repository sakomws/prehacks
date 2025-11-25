"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Session {
  id: number;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  price: number;
  status: string;
  payment_status: string;
  mentor: {
    name?: string;
    title: string;
    expertise: string;
  };
}

export default function SessionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/sessions/latest`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSession(data);
      } else if (response.status === 404) {
        // Session not found yet, retry after a short delay
        console.log("Session not found, retrying in 2 seconds...");
        setTimeout(fetchSession, 2000);
        return;
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCalendarInvite = () => {
    if (!session) {
      console.error("No session data available");
      alert("Session data not loaded. Please refresh the page.");
      return;
    }

    try {
      const startDate = new Date(session.scheduled_at);
      const endDate = new Date(startDate.getTime() + session.duration_minutes * 60000);

      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      // Escape special characters in description
      const escapeICS = (str: string) => {
        return str.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
      };

      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MentorMap//Mentorship Session//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${session.id}@mentormap.ai
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${escapeICS(session.title)}
DESCRIPTION:Mentorship session with ${escapeICS(session.mentor.name || session.mentor.title)} (${escapeICS(session.mentor.title)})\\n\\n${escapeICS(session.description || '')}
LOCATION:Online (Link will be sent via email)
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${escapeICS(session.title)} in 15 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mentorship-session-${session.id}.ics`;
      link.setAttribute('download', `mentorship-session-${session.id}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("Calendar invite downloaded successfully");
    } catch (error) {
      console.error("Error creating calendar invite:", error);
      alert("Failed to download calendar invite. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-600 dark:text-gray-300">Loading session details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-3xl">🗺️</div>
            <h1 className="text-2xl font-bold">MentorMap</h1>
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-5xl">✅</div>
          </div>

          <h2 className="text-3xl font-bold mb-4">Payment Successful!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Your mentorship session has been booked successfully.
          </p>

          {session && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-xl font-semibold mb-4">Session Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Session:</span>
                  <span className="font-medium">{session.title}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mentor:</span>
                  <div className="text-right">
                    <div className="font-bold">{session.mentor.name || session.mentor.title}</div>
                    {session.mentor.name && (
                      <div className="text-sm text-gray-500">{session.mentor.title}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
                  <span className="font-medium">
                    {new Date(session.scheduled_at).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium">{session.duration_minutes} minutes</span>
                </div>
                
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                  <span className="font-bold text-green-600">${session.price.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    ✓ Paid
                  </span>
                </div>
              </div>

              {session.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description:</p>
                  <p className="text-sm">{session.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={downloadCalendarInvite}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
            >
              📅 Download Calendar Invite
            </button>

            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/sessions"
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold text-center"
              >
                View All Sessions
              </Link>
              <Link
                href="/mentors"
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold text-center"
              >
                Book Another
              </Link>
            </div>
          </div>

          {/* Confirmation Email Notice */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              📧 A confirmation email with meeting details has been sent to your email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
