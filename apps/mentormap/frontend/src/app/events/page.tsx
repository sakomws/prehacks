"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  date: string;
  time: string;
  duration_minutes: number;
  location: string;
  is_virtual: boolean;
  max_attendees?: number;
  price: number;
  image_url?: string;
  tags?: string;
  requirements?: string;
  status: string;
  registration_count: number;
  spots_remaining?: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/events/`;
      const params = new URLSearchParams();
      
      params.append("status", "active");
      params.append("upcoming_only", "true");
      
      if (filter !== "all") {
        params.append("event_type", filter);
      }
      
      url += `?${params.toString()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (event: Event) => {
    setSelectedEvent(event);
    setShowRegistration(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header currentPage="events" />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8">
            Join our community events, workshops, and networking sessions
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                filter === "all"
                  ? "bg-purple-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter("workshop")}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                filter === "workshop"
                  ? "bg-purple-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              🛠️ Workshops
            </button>
            <button
              onClick={() => setFilter("webinar")}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                filter === "webinar"
                  ? "bg-purple-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              💻 Webinars
            </button>
            <button
              onClick={() => setFilter("networking")}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                filter === "networking"
                  ? "bg-purple-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              🤝 Networking
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-600 dark:text-gray-300">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-600 dark:text-gray-300">No upcoming events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Event Image */}
                <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl text-white">
                      {event.event_type === 'workshop' ? '🛠️' :
                       event.event_type === 'webinar' ? '💻' :
                       event.event_type === 'networking' ? '🤝' : '🎯'}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Event Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold capitalize">
                      {event.event_type}
                    </span>
                    <span className="text-2xl font-bold text-purple-600">
                      {event.price === 0 ? 'FREE' : `$${event.price}`}
                    </span>
                  </div>

                  {/* Event Title */}
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {event.title}
                  </h3>

                  {/* Event Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <span className="mr-2">📅</span>
                      <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <span className="mr-2">📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <span className="mr-2">⏱️</span>
                      <span>{event.duration_minutes} minutes</span>
                    </div>
                    {event.max_attendees && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <span className="mr-2">👥</span>
                        <span>
                          {event.registration_count}/{event.max_attendees} registered
                          {event.spots_remaining && event.spots_remaining > 0 && (
                            <span className="text-green-600 ml-1">
                              ({event.spots_remaining} spots left)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {event.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.tags.split(',').map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Register Button */}
                  <button
                    onClick={() => handleRegister(event)}
                    disabled={event.spots_remaining === 0}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      event.spots_remaining === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-purple-500 text-white hover:bg-purple-600"
                    }`}
                  >
                    {event.spots_remaining === 0 ? "Event Full" : "Register Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showRegistration && selectedEvent && (
        <EventRegistrationModal
          event={selectedEvent}
          onClose={() => {
            setShowRegistration(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            fetchEvents(); // Refresh events to update registration count
            setShowRegistration(false);
            setSelectedEvent(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

function EventRegistrationModal({ 
  event, 
  onClose, 
  onSuccess 
}: { 
  event: Event; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [formData, setFormData] = useState({
    attendee_name: "",
    attendee_email: "",
    phone: "",
    company: "",
    dietary_requirements: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/events/${event.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          ...formData
        })
      });

      if (response.ok) {
        alert("Registration successful! You'll receive a confirmation email shortly.");
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      alert(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Register for Event</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
          </div>
          <p className="text-purple-100 mt-2">{event.title}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={formData.attendee_name}
              onChange={(e) => setFormData({...formData, attendee_name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.attendee_email}
              onChange={(e) => setFormData({...formData, attendee_email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Your Company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Dietary Requirements</label>
            <textarea
              value={formData.dietary_requirements}
              onChange={(e) => setFormData({...formData, dietary_requirements: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20"
              placeholder="Any dietary restrictions or requirements..."
            />
          </div>

          {/* Event Summary */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">Event Details</h4>
            <div className="text-sm text-purple-800 space-y-1">
              <p>📅 {new Date(event.date).toLocaleDateString()} at {event.time}</p>
              <p>📍 {event.location}</p>
              <p>⏱️ {event.duration_minutes} minutes</p>
              <p>💰 {event.price === 0 ? 'Free' : `$${event.price}`}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 font-semibold"
            >
              {loading ? "Registering..." : `Register ${event.price > 0 ? `($${event.price})` : '(Free)'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}