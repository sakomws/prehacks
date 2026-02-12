"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

type Tab = "schedule" | "mentees" | "sessions" | "earnings" | "packages";

export default function MentorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("schedule");
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for token in URL query params (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      // Save token to localStorage
      localStorage.setItem('token', tokenFromUrl);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // TODO: Replace with actual auth check
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push("/login");
        return;
      }
      // Mock user for now
      setUser({ name: "Mentor User", role: "mentor" });
      setIsAuthenticated(true);
    };
    
    checkAuth();
  }, [router]);

  const logout = () => {
    localStorage.removeItem('token');
    router.push("/");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mentor Portal
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-purple-500">
              Back to Site
            </Link>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-screen shadow-sm">
          <nav className="p-4 space-y-2">
            <TabButton
              icon="📅"
              label="My Schedule"
              active={activeTab === "schedule"}
              onClick={() => setActiveTab("schedule")}
            />
            <TabButton
              icon="👥"
              label="My Mentees"
              active={activeTab === "mentees"}
              onClick={() => setActiveTab("mentees")}
            />
            <TabButton
              icon="📝"
              label="Sessions"
              active={activeTab === "sessions"}
              onClick={() => setActiveTab("sessions")}
            />
            <TabButton
              icon="💰"
              label="Earnings"
              active={activeTab === "earnings"}
              onClick={() => setActiveTab("earnings")}
            />
            <TabButton
              icon="📦"
              label="Packages"
              active={activeTab === "packages"}
              onClick={() => setActiveTab("packages")}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === "schedule" && <ScheduleView />}
          {activeTab === "mentees" && <MenteesView />}
          {activeTab === "sessions" && <SessionsView />}
          {activeTab === "earnings" && <EarningsView />}
          {activeTab === "packages" && <PackagesView />}
        </main>
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
        active
          ? "bg-purple-500 text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ScheduleView() {
  const sessions = [
    {
      id: 1,
      time: "9:00 AM",
      mentee: "Sarah Johnson",
      topic: "Career Guidance",
      type: "Video Call",
      status: "confirmed",
    },
    {
      id: 2,
      time: "11:00 AM",
      mentee: "Mike Chen",
      topic: "Technical Interview Prep",
      type: "Video Call",
      status: "confirmed",
    },
    {
      id: 3,
      time: "2:00 PM",
      mentee: "Available",
      topic: "-",
      type: "-",
      status: "available",
    },
    {
      id: 4,
      time: "4:00 PM",
      mentee: "Emma Davis",
      topic: "Leadership Coaching",
      type: "Video Call",
      status: "confirmed",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Today's Schedule</h2>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard icon="📅" label="Sessions Today" value="3" />
        <StatCard icon="✅" label="Completed" value="0" />
        <StatCard icon="⏰" label="Upcoming" value="3" />
        <StatCard icon="🕐" label="Hours Today" value="6" />
      </div>

      {/* Schedule List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`bg-white rounded-lg shadow p-6 ${
              session.status === "available" ? "border-2 border-dashed border-gray-300" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {session.time.split(" ")[0]}
                  </div>
                  <div className="text-xs text-gray-600">
                    {session.time.split(" ")[1]}
                  </div>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div>
                  {session.status === "available" ? (
                    <p className="text-lg font-semibold text-gray-400">
                      Available Slot
                    </p>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold">{session.mentee}</h3>
                      <p className="text-sm text-gray-600">
                        {session.topic} • {session.type}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {session.status === "confirmed" ? (
                  <>
                    <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                      Start Session
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                      Contact
                    </button>
                  </>
                ) : (
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    Mark Available
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenteesView() {
  const mentees = [
    { id: 1, name: "Sarah Johnson", goal: "Career Transition", sessions: 8, nextSession: "Today, 9:00 AM" },
    { id: 2, name: "Mike Chen", goal: "Technical Skills", sessions: 5, nextSession: "Today, 11:00 AM" },
    { id: 3, name: "Emma Davis", goal: "Leadership Development", sessions: 12, nextSession: "Today, 4:00 PM" },
    { id: 4, name: "John Smith", goal: "Startup Guidance", sessions: 3, nextSession: "Tomorrow, 10:00 AM" },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">My Mentees</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {mentees.map((mentee) => (
          <div key={mentee.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h3 className="font-bold">{mentee.name}</h3>
                  <p className="text-sm text-gray-600">Goal: {mentee.goal}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <p>
                <span className="font-semibold">Total Sessions:</span> {mentee.sessions}
              </p>
              <p>
                <span className="font-semibold">Next Session:</span> {mentee.nextSession}
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm">
                View Details
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                💬
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionsView() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Session History</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Session history and notes will appear here.</p>
      </div>
    </div>
  );
}

function EarningsView() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Earnings</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">This Month</p>
          <p className="text-3xl font-bold text-purple-600">$4,250</p>
          <p className="text-sm text-green-600 mt-1">+12% from last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">This Week</p>
          <p className="text-3xl font-bold text-purple-600">$980</p>
          <p className="text-sm text-gray-500 mt-1">18 sessions</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Today</p>
          <p className="text-3xl font-bold text-purple-600">$450</p>
          <p className="text-sm text-gray-500 mt-1">3 sessions</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-4">Recent Payments</h3>
        <div className="space-y-3">
          <PaymentItem date="Dec 10" mentee="Sarah Johnson" amount="$150" />
          <PaymentItem date="Dec 10" mentee="Mike Chen" amount="$150" />
          <PaymentItem date="Dec 10" mentee="Emma Davis" amount="$150" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function PaymentItem({ date, mentee, amount }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="font-semibold">{mentee}</p>
        <p className="text-sm text-gray-600">{date}</p>
      </div>
      <p className="font-bold text-purple-600">{amount}</p>
    </div>
  );
}

function PackagesView() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sessions_count: 1,
    price: 100,
    features: "",
    is_popular: false,
    chat_weeks: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/mentors/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const mentor = await response.json();
        const packagesResponse = await fetch(`${API_URL}/api/packages/mentor/${mentor.id}`);
        if (packagesResponse.ok) {
          const data = await packagesResponse.json();
          setPackages(data);
        }
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please log in to create packages");
      return;
    }
    
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      alert("Please enter a package name");
      return;
    }
    
    if (formData.sessions_count < 1) {
      alert("Sessions count must be at least 1");
      return;
    }
    
    if (formData.price < 0) {
      alert("Price must be 0 or greater");
      return;
    }
    
    const features = formData.features.split("\n").filter((f) => f.trim());

    const packageData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      sessions_count: Number(formData.sessions_count),
      price: Number(formData.price),
      features: features.length > 0 ? features : null,
      is_popular: Boolean(formData.is_popular),
      chat_weeks: Number(formData.chat_weeks) || 0,
    };

    try {
      const url = editingPackage
        ? `${API_URL}/api/packages/${editingPackage.id}`
        : `${API_URL}/api/packages/`;
      const method = editingPackage ? "PUT" : "POST";

      console.log("=== PACKAGE SAVE REQUEST ===");
      console.log("URL:", url);
      console.log("Method:", method);
      console.log("Package data:", JSON.stringify(packageData, null, 2));
      console.log("Token (first 20 chars):", token.substring(0, 20) + "...");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(packageData),
      });

      console.log("=== RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("OK:", response.ok);
      console.log("Headers:", Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        setShowModal(false);
        setEditingPackage(null);
        setFormData({
          name: "",
          description: "",
          sessions_count: 1,
          price: 100,
          features: "",
          is_popular: false,
          chat_weeks: 0,
        });
        fetchPackages();
      } else {
        let errorMessage = "Unknown error";
        let errorData = null;
        try {
          const text = await response.text();
          console.error("Error response text:", text);
          try {
            errorData = JSON.parse(text);
            errorMessage = errorData.detail || errorData.message || errorData.error || JSON.stringify(errorData);
          } catch (parseError) {
            errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          console.error("Error reading response:", e);
        }
        console.error("Full error details:", { status: response.status, statusText: response.statusText, errorData });
        alert(`Failed to save package:\n\n${errorMessage}\n\nStatus: ${response.status}\n\nCheck console for details.`);
      }
    } catch (error) {
      console.error("Error saving package:", error);
      const errorMessage = error instanceof Error ? error.message : "Network error or unknown issue";
      alert(`Failed to save package: ${errorMessage}`);
    }
  };

  const handleEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      sessions_count: pkg.sessions_count,
      price: pkg.price,
      features: pkg.features.join("\n"),
      is_popular: pkg.is_popular,
      chat_weeks: pkg.chat_weeks,
    });
    setShowModal(true);
  };

  const handleDelete = async (packageId: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/packages/${packageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchPackages();
      }
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading packages...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">My Packages</h2>
        <button
          onClick={() => {
            setEditingPackage(null);
            setFormData({
              name: "",
              description: "",
              sessions_count: 1,
              price: 100,
              features: "",
              is_popular: false,
              chat_weeks: 0,
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          + Add Package
        </button>
      </div>

      {packages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">No packages yet. Create your first package!</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Create Package
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-lg shadow p-6 ${
                pkg.is_popular ? "border-2 border-purple-500" : ""
              }`}
            >
              {pkg.is_popular && (
                <div className="bg-purple-500 text-white text-xs font-semibold px-2 py-1 rounded mb-2 inline-block">
                  Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
              <p className="text-3xl font-bold text-purple-600 mb-2">${pkg.price}</p>
              <p className="text-sm text-gray-600 mb-4">
                {pkg.sessions_count} session{pkg.sessions_count > 1 ? "s" : ""}
                {pkg.chat_weeks > 0 && ` • ${pkg.chat_weeks} weeks chat`}
              </p>
              {pkg.description && (
                <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
              )}
              {pkg.features && pkg.features.length > 0 && (
                <ul className="text-sm text-gray-600 mb-4 space-y-1">
                  {pkg.features.slice(0, 3).map((feature: string, idx: number) => (
                    <li key={idx}>• {feature}</li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4">
              {editingPackage ? "Edit Package" : "Create Package"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Package Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sessions</label>
                  <input
                    type="number"
                    value={formData.sessions_count}
                    onChange={(e) =>
                      setFormData({ ...formData, sessions_count: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Features (one per line)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chat Weeks</label>
                <input
                  type="number"
                  value={formData.chat_weeks}
                  onChange={(e) =>
                    setFormData({ ...formData, chat_weeks: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_popular}
                  onChange={(e) =>
                    setFormData({ ...formData, is_popular: e.target.checked })
                  }
                  className="mr-2"
                />
                <label className="text-sm">Mark as popular</label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  {editingPackage ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPackage(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}