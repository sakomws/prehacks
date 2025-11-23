"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Mentor {
  id: number;
  title: string;
  bio: string;
  expertise: string;
  hourly_rate: number;
  rating: number;
  total_sessions: number;
  is_available: boolean;
}

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params.id;

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduled_at: "",
    duration_minutes: 60,
  });

  useEffect(() => {
    fetchMentor();
  }, [mentorId]);

  const fetchMentor = async () => {
    try {
      const response = await fetch(`http://localhost:8002/api/mentors/${mentorId}`);
      if (response.ok) {
        const data = await response.json();
        setMentor(data);
      }
    } catch (error) {
      console.error("Error fetching mentor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setBooking(true);

    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token ? "exists" : "missing");
      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }
      
      console.log("Booking data:", {
        mentor_id: parseInt(mentorId as string),
        ...formData,
      });

      // Create Stripe checkout session
      const response = await fetch("http://localhost:8002/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentor_id: parseInt(mentorId as string),
          ...formData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe checkout
        window.location.href = data.checkout_url;
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert(`Failed to create checkout session: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error booking session:", error);
      alert("Error booking session");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-600 dark:text-gray-300">Loading mentor...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-600 dark:text-gray-300">Mentor not found</p>
          <Link href="/mentors" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to mentors
          </Link>
        </div>
      </div>
    );
  }

  const price = mentor.hourly_rate * (formData.duration_minutes / 60);

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
            <Link href="/mentors" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
              ← Back to Mentors
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mentor Info */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                  {mentor.title.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold">{mentor.title}</h2>
                    <div className="flex items-center gap-1 text-yellow-500">
                      ⭐ {mentor.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 mb-2">
                    {mentor.total_sessions} sessions completed
                  </div>
                  {!mentor.is_available && (
                    <div className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      Currently Unavailable
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">About</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {mentor.bio}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Expertise</h3>
                <p className="text-gray-600 dark:text-gray-300">{mentor.expertise}</p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 sticky top-4">
              <div className="text-center mb-6 pb-6 border-b">
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  ${mentor.hourly_rate}
                </div>
                <div className="text-sm text-gray-500">per hour</div>
              </div>

              <form onSubmit={handleBookSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Session Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    placeholder="e.g., System Design Review"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    rows={3}
                    placeholder="What would you like to discuss?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Duration
                  </label>
                  <select
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600 dark:text-gray-300">Total Price:</span>
                    <span className="text-2xl font-bold text-blue-600">${price.toFixed(2)}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={!mentor.is_available || booking}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                  >
                    {booking ? "Processing..." : "Book & Pay with Stripe"}
                  </button>
                </div>
              </form>

              <div className="mt-4 text-xs text-gray-500 text-center">
                🔒 Secure payment powered by Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
