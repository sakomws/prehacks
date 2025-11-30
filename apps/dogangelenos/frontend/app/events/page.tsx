"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../components/Header";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  description: string;
  price: string;
  spots_total: number;
  spots_available: number;
  image: string;
  is_featured: boolean;
  is_active: boolean;
  registrations_count: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function EventsPage() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [registeringEvent, setRegisteringEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, [selectedType]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedType !== "all" ? `?category=${selectedType}` : "";
      const response = await fetch(`${API_URL}/api/events/${categoryParam}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        setError("Failed to load events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredEvents = events.filter(event => {
    // Type filter (category in API)
    const typeMatch = selectedType === "all" || event.category === selectedType;
    
    // Search filter
    const searchMatch = searchTerm === "" || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Time filter
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    const timeMatch = 
      timeFilter === "all" ||
      (timeFilter === "upcoming" && eventDate >= today) ||
      (timeFilter === "past" && eventDate < today);
    
    return typeMatch && searchMatch && timeMatch;
  });

  const upcomingEvents = events.filter(e => new Date(e.date) >= today);
  const pastEvents = events.filter(e => new Date(e.date) < today);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold mb-4">🎉 Los Angeles Dog Events Calendar</h1>
            <p className="text-xl mb-8">Join the most vibrant dog community in Los Angeles!</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <p className="text-3xl font-bold">{events.length}</p>
                <p className="text-sm">Upcoming Events</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm">Community Members</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <p className="text-3xl font-bold">50+</p>
                <p className="text-sm">Monthly Events</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Search & Filter Events</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="search"
                placeholder="Search events by name, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeFilter("upcoming")}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    timeFilter === "upcoming"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Upcoming ({upcomingEvents.length})
                </button>
                <button
                  onClick={() => setTimeFilter("past")}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    timeFilter === "past"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Past ({pastEvents.length})
                </button>
                <button
                  onClick={() => setTimeFilter("all")}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    timeFilter === "all"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-600">Filter by Type:</h3>
            <div className="flex flex-wrap gap-3">
              <FilterButton
                label="All Types"
                active={selectedType === "all"}
                onClick={() => setSelectedType("all")}
                icon="🎯"
              />
              <FilterButton
                label="Workshops"
                active={selectedType === "workshop"}
                onClick={() => setSelectedType("workshop")}
                icon="🎓"
              />
              <FilterButton
                label="Meetups"
                active={selectedType === "meetup"}
                onClick={() => setSelectedType("meetup")}
                icon="🐶"
              />
              <FilterButton
                label="Training"
                active={selectedType === "training"}
                onClick={() => setSelectedType("training")}
                icon="📚"
              />
              <FilterButton
                label="Competitions"
                active={selectedType === "competition"}
                onClick={() => setSelectedType("competition")}
                icon="🏆"
              />
              <FilterButton
                label="Social"
                active={selectedType === "social"}
                onClick={() => setSelectedType("social")}
                icon="🎉"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-bold text-pink-600">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? "s" : ""}
              {searchTerm && <span> matching "<span className="font-semibold">{searchTerm}</span>"</span>}
            </p>
          </div>
        </div>

        {/* Featured Events - Only show if viewing upcoming */}
        {timeFilter === "upcoming" && events.filter(e => e.is_featured && new Date(e.date) >= today).length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">⭐ Featured Events</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {events.filter(e => e.is_featured && new Date(e.date) >= today).map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  featured 
                  onRegister={() => setRegisteringEvent(event)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Events */}
        <div>
          <h2 className="text-3xl font-bold mb-6">
            {timeFilter === "upcoming" && "📅 Upcoming Events"}
            {timeFilter === "past" && "📚 Past Events"}
            {timeFilter === "all" && "🎯 All Events"}
          </h2>
          
          {filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  onRegister={() => setRegisteringEvent(event)}
                  isPast={new Date(event.date) < today}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setTimeFilter("upcoming");
                }}
                className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {registeringEvent && (
            <EventRegistrationModal
              event={registeringEvent}
              onClose={() => setRegisteringEvent(null)}
            />
          )}
        </div>

        {/* Community Section */}
        <div className="mt-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect with fellow dog lovers, share experiences, and never miss an event!
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:ring-4 focus:ring-white focus:outline-none"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold hover:bg-gray-100 transition whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://instagram.com/dogangelenos"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-transparent border-2 border-white rounded-full font-bold hover:bg-white/10 transition"
            >
              Follow on Instagram
            </a>
          </div>
        </div>

        {/* Popular Locations */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6">🌴 Popular Event Locations</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <LocationCard name="Griffith Park" events={12} />
            <LocationCard name="Santa Monica Beach" events={8} />
            <LocationCard name="Runyon Canyon" events={10} />
            <LocationCard name="Venice Boardwalk" events={6} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ label, active, onClick, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-semibold transition ${
        active
          ? "bg-pink-500 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
}

function EventCard({ event, featured, onRegister, isPast }: { event: Event; featured?: boolean; onRegister: () => void; isPast?: boolean }) {
  const typeColors: Record<string, string> = {
    workshop: "bg-blue-100 text-blue-700",
    meetup: "bg-green-100 text-green-700",
    training: "bg-purple-100 text-purple-700",
    competition: "bg-orange-100 text-orange-700",
    social: "bg-pink-100 text-pink-700"
  };

  const isFull = event.spots_available <= 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${
        featured ? "border-2 border-pink-500" : ""
      } ${isPast ? "opacity-75" : ""}`}
    >
      {featured && (
        <div className="bg-pink-500 text-white text-center py-1 text-sm font-semibold">
          ⭐ Featured Event
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-5xl">{event.image}</div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[event.category] || "bg-gray-100 text-gray-700"}`}>
            {event.category}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{event.description}</p>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center text-gray-700">
            <span className="mr-2">📅</span>
            <span>{new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="mr-2">🕐</span>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="mr-2">📍</span>
            <span>{event.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-pink-600">{event.price}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm ${isFull ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
              {isFull ? 'Event Full' : `${event.spots_available} spots left`}
            </p>
            <p className="text-xs text-gray-500">{event.registrations_count} registered</p>
          </div>
        </div>

        <button 
          onClick={onRegister}
          disabled={isFull || isPast}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            isFull || isPast
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg'
          }`}
        >
          {isFull ? 'Event Full' : isPast ? 'Event Passed' : 'Register Now'}
        </button>
      </div>
    </motion.div>
  );
}

function LocationCard({ name, events }: { name: string; events: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      <div className="text-3xl mb-2">📍</div>
      <h3 className="font-bold mb-1">{name}</h3>
      <p className="text-sm text-gray-600">{events} upcoming events</p>
    </div>
  );
}

function EventRegistrationModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dogName: "",
    dogBreed: "",
    specialRequests: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/events/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dog_name: formData.dogName,
          dog_breed: formData.dogBreed || null,
          special_requirements: formData.specialRequests || null
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          window.location.reload(); // Refresh to show updated spots
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to register. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Register for Event</h2>
              <p className="text-sm text-white/90">{event.title}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-center">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
              <div className="text-5xl mb-2">✅</div>
              <p className="text-green-700 font-semibold">Successfully registered!</p>
              <p className="text-sm text-gray-600">Check your email for confirmation.</p>
            </div>
          )}

          <div className="bg-pink-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold">📅 {new Date(event.date).toLocaleDateString()}</p>
                <p className="text-gray-600">🕐 {event.time}</p>
                <p className="text-gray-600">📍 {event.location}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-pink-600">{event.price}</p>
                <p className="text-xs text-gray-600">{event.spots_available} spots left</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Your Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="(310) 555-0123"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Dog's Name *</label>
              <input
                type="text"
                required
                value={formData.dogName}
                onChange={(e) => setFormData({ ...formData, dogName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Max"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Breed</label>
              <input
                type="text"
                value={formData.dogBreed}
                onChange={(e) => setFormData({ ...formData, dogBreed: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Golden Retriever"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Special Requests or Notes</label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Any special requirements or questions..."
            />
          </div>

          <div className="border-t pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : success ? "Registered!" : "Complete Registration"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
