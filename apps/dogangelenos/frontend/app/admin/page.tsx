"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useContent } from "../context/ContentContext";
import { EditTrainerModalNew, AddTrainerModalNew } from "./TrainerModals";

type Tab = "dashboard" | "bookings" | "customers" | "trainers" | "chat" | "calendar" | "events" | "newsletter" | "content";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="/logo.svg"
                alt="Dog Angelenos"
                className="w-16 h-16"
              />
              <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-pink-500">
              Back to Site
            </Link>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button 
              onClick={() => {
                logout();
                router.push("/");
              }}
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
              icon="📊"
              label="Dashboard"
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
            />
            <TabButton
              icon="📅"
              label="Bookings"
              active={activeTab === "bookings"}
              onClick={() => setActiveTab("bookings")}
            />
            <TabButton
              icon="👥"
              label="Customers"
              active={activeTab === "customers"}
              onClick={() => setActiveTab("customers")}
            />
            <TabButton
              icon="🎓"
              label="Trainers"
              active={activeTab === "trainers"}
              onClick={() => setActiveTab("trainers")}
            />
            <TabButton
              icon="💬"
              label="Chat Messages"
              active={activeTab === "chat"}
              onClick={() => setActiveTab("chat")}
            />
            <TabButton
              icon="📆"
              label="Calendar"
              active={activeTab === "calendar"}
              onClick={() => setActiveTab("calendar")}
            />
            <TabButton
              icon="🎉"
              label="Events"
              active={activeTab === "events"}
              onClick={() => setActiveTab("events")}
            />
            <TabButton
              icon="📧"
              label="Newsletter"
              active={activeTab === "newsletter"}
              onClick={() => setActiveTab("newsletter")}
            />
            <TabButton
              icon="📝"
              label="Content"
              active={activeTab === "content"}
              onClick={() => setActiveTab("content")}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "bookings" && <BookingsManager />}
          {activeTab === "customers" && <CustomersManager />}
          {activeTab === "trainers" && <TrainersManager />}
          {activeTab === "chat" && <ChatManager />}
          {activeTab === "calendar" && <CalendarView />}
          {activeTab === "events" && <EventsManager />}
          {activeTab === "newsletter" && <NewsletterManager />}
          {activeTab === "content" && <ContentManager />}
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
          ? "bg-pink-500 text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}



function Dashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard icon="📅" label="Total Bookings" value="156" change="+12%" />
        <StatCard icon="👥" label="Active Customers" value="89" change="+8%" />
        <StatCard icon="🎓" label="Trainers" value="12" change="+2" />
        <StatCard icon="💬" label="Messages Today" value="234" change="+45%" />
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            <ActivityItem
              icon="📅"
              title="New booking from Sarah Martinez"
              time="5 minutes ago"
              status="pending"
            />
            <ActivityItem
              icon="✅"
              title="Booking confirmed for Mike Thompson"
              time="1 hour ago"
              status="confirmed"
            />
            <ActivityItem
              icon="📅"
              title="New booking from Jessica Lee"
              time="2 hours ago"
              status="pending"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Recent Messages</h3>
          <div className="space-y-3">
            <ActivityItem
              icon="💬"
              title="Sarah: Can we reschedule?"
              time="10 minutes ago"
            />
            <ActivityItem
              icon="💬"
              title="Mike: Thank you for the session!"
              time="30 minutes ago"
            />
            <ActivityItem
              icon="💬"
              title="Jessica: What should I bring?"
              time="1 hour ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-green-500 text-sm font-semibold">{change}</span>
      </div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ActivityItem({ icon, title, time, status }: any) {
  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
      {status && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}>
          {status}
        </span>
      )}
    </div>
  );
}

function BookingsManager() {
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [chatBooking, setChatBooking] = useState<any>(null);
  const [showNewBooking, setShowNewBooking] = useState(false);

  const bookings = [
    {
      id: "1",
      customer: "Sarah Martinez",
      email: "sarah@example.com",
      phone: "(310) 555-0101",
      dog: "Max",
      program: "Basic Obedience - $249",
      date: "2024-12-15",
      time: "Morning (9am-12pm)",
      location: "West Hollywood",
      status: "confirmed"
    },
    {
      id: "2",
      customer: "Mike Thompson",
      email: "mike@example.com",
      phone: "(310) 555-0102",
      dog: "Luna",
      program: "Puppy Training - $199",
      date: "2024-12-18",
      time: "Afternoon (12pm-3pm)",
      location: "Santa Monica",
      status: "pending"
    },
    {
      id: "3",
      customer: "Jessica Lee",
      email: "jessica@example.com",
      phone: "(310) 555-0103",
      dog: "Charlie",
      program: "Advanced Training - $349",
      date: "2024-12-20",
      time: "Evening (3pm-6pm)",
      location: "Downtown LA",
      status: "confirmed"
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Bookings Management</h2>
        <button 
          onClick={() => setShowNewBooking(true)}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          + New Booking
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dog</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <BookingRow
                key={booking.id}
                {...booking}
                onEdit={() => setEditingBooking(booking)}
                onChat={() => setChatBooking(booking)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Booking Modal */}
      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSave={(updated: any) => {
            console.log("Saving booking:", updated);
            setEditingBooking(null);
          }}
        />
      )}

      {/* Chat Modal */}
      {chatBooking && (
        <BookingChatModal
          booking={chatBooking}
          onClose={() => setChatBooking(null)}
        />
      )}

      {/* New Booking Modal */}
      {showNewBooking && (
        <NewBookingModal
          onClose={() => setShowNewBooking(false)}
          onSave={(newBooking: any) => {
            console.log("Creating booking:", newBooking);
            setShowNewBooking(false);
          }}
        />
      )}
    </div>
  );
}

function BookingRow({ id, customer, dog, program, date, status, onEdit, onChat }: any) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm">#{id}</td>
      <td className="px-6 py-4 text-sm font-medium">{customer}</td>
      <td className="px-6 py-4 text-sm">{dog}</td>
      <td className="px-6 py-4 text-sm">{program}</td>
      <td className="px-6 py-4 text-sm">{new Date(date).toLocaleDateString()}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs rounded-full ${
          status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm">
        <button 
          onClick={onEdit}
          className="text-pink-500 hover:text-pink-600 mr-3 font-medium"
        >
          Edit
        </button>
        <button 
          onClick={onChat}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Chat
        </button>
      </td>
    </tr>
  );
}

function EditBookingModal({ booking, onClose, onSave }: any) {
  const [formData, setFormData] = useState(booking);

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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit Booking #{booking.id}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Customer Name</label>
              <input
                type="text"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Dog Name</label>
              <input
                type="text"
                value={formData.dog}
                onChange={(e) => setFormData({ ...formData, dog: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Program</label>
            <select
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option>Puppy Training - $199</option>
              <option>Basic Obedience - $249</option>
              <option>Advanced Training - $349</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Time</label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option>Morning (9am-12pm)</option>
                <option>Afternoon (12pm-3pm)</option>
                <option>Evening (3pm-6pm)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option>West Hollywood</option>
              <option>Santa Monica</option>
              <option>Downtown LA</option>
              <option>Silver Lake</option>
              <option>Venice Beach</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BookingChatModal({ booking, onClose }: any) {
  const [message, setMessage] = useState("");

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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Chat with {booking.customer}</h2>
              <p className="text-sm text-white/90">Booking #{booking.id} - {booking.dog}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="space-y-3">
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-3 max-w-[70%] shadow">
                <p className="text-xs font-semibold text-gray-600 mb-1">{booking.customer}</p>
                <p className="text-sm">Hi! Can we reschedule to next week?</p>
                <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-lg p-3 max-w-[70%] shadow">
                <p className="text-xs font-semibold mb-1 opacity-75">Admin</p>
                <p className="text-sm">Of course! What day works best for you?</p>
                <p className="text-xs opacity-75 mt-1">10:32 AM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Send
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NewBookingModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    customer: "",
    email: "",
    phone: "",
    dog: "",
    program: "Basic Obedience - $249",
    date: "",
    time: "Morning (9am-12pm)",
    location: "West Hollywood",
    status: "pending"
  });

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
            <h2 className="text-2xl font-bold">Create New Booking</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Customer Name *</label>
              <input
                type="text"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Dog Name *</label>
              <input
                type="text"
                value={formData.dog}
                onChange={(e) => setFormData({ ...formData, dog: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Buddy"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="(310) 555-0123"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Training Program *</label>
            <select
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option>Puppy Training - $199</option>
              <option>Basic Obedience - $249</option>
              <option>Advanced Training - $349</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Preferred Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Preferred Time *</label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option>Morning (9am-12pm)</option>
                <option>Afternoon (12pm-3pm)</option>
                <option>Evening (3pm-6pm)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">LA Location *</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option>West Hollywood</option>
              <option>Santa Monica</option>
              <option>Downtown LA</option>
              <option>Silver Lake</option>
              <option>Venice Beach</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Create Booking
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CustomersManager() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const customers = [
    {
      id: 1,
      name: "Sarah Martinez",
      email: "sarah@example.com",
      phone: "(310) 555-0101",
      dog: "Max",
      bookings: 3
    },
    {
      id: 2,
      name: "Mike Thompson",
      email: "mike@example.com",
      phone: "(310) 555-0102",
      dog: "Luna",
      bookings: 2
    },
    {
      id: 3,
      name: "Jessica Lee",
      email: "jessica@example.com",
      phone: "(310) 555-0103",
      dog: "Charlie",
      bookings: 4
    }
  ];

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Customers</h2>
        <input
          type="search"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <CustomerCard
            key={customer.id}
            {...customer}
            onViewProfile={() => setSelectedCustomer(customer)}
          />
        ))}
      </div>

      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

function CustomerCard({ name, email, phone, dog, bookings, onViewProfile }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </div>
        <div>
          <h3 className="font-bold">{name}</h3>
          <p className="text-sm text-gray-600">{email}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p><span className="font-semibold">Phone:</span> {phone}</p>
        <p><span className="font-semibold">Dog:</span> {dog}</p>
        <p><span className="font-semibold">Bookings:</span> {bookings}</p>
      </div>
      <div className="mt-4 flex space-x-2">
        <button 
          onClick={onViewProfile}
          className="flex-1 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600"
        >
          View Profile
        </button>
        <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
          💬
        </button>
      </div>
    </div>
  );
}

function CustomerProfileModal({ customer, onClose }: any) {
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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <p className="text-sm text-white/90">{customer.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Email:</span> {customer.email}</p>
                <p><span className="font-semibold">Phone:</span> {customer.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Pet Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Dog Name:</span> {customer.dog}</p>
                <p><span className="font-semibold">Total Bookings:</span> {customer.bookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Recent Bookings</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Basic Obedience - Dec 15, 2024</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Confirmed</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Basic Obedience - Dec 8, 2024</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
          <button className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
            Send Message
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TrainersManager() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [editingTrainer, setEditingTrainer] = useState<any>(null);
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trainers?active_only=false`);
      if (response.ok) {
        const data = await response.json();
        setTrainers(data);
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrainer = async (trainerId: number) => {
    if (!confirm("Are you sure you want to delete this trainer?")) return;
    
    try {
      const response = await fetch(`${API_URL}/api/trainers/${trainerId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTrainers();
      }
    } catch (error) {
      console.error("Error deleting trainer:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trainers...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Trainers Management</h2>
        <button 
          onClick={() => setShowAddTrainer(true)}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          + Add Trainer
        </button>
      </div>

      {trainers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl font-bold mb-2">No trainers yet</h3>
          <p className="text-gray-600 mb-6">Add your first trainer to get started</p>
          <button 
            onClick={() => setShowAddTrainer(true)}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Add Trainer
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <TrainerCard
              key={trainer.id}
              {...trainer}
              onView={() => setSelectedTrainer(trainer)}
              onEdit={() => setEditingTrainer(trainer)}
              onDelete={() => handleDeleteTrainer(trainer.id)}
            />
          ))}
        </div>
      )}

      {/* View Trainer Modal */}
      {selectedTrainer && (
        <ViewTrainerModal
          trainer={selectedTrainer}
          onClose={() => setSelectedTrainer(null)}
          onEdit={() => {
            setEditingTrainer(selectedTrainer);
            setSelectedTrainer(null);
          }}
        />
      )}

      {/* Edit Trainer Modal */}
      {editingTrainer && (
        <EditTrainerModalNew
          trainer={editingTrainer}
          onClose={() => setEditingTrainer(null)}
          onSave={async (updated: any) => {
            try {
              const response = await fetch(`${API_URL}/api/trainers/${editingTrainer.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
              });
              if (response.ok) {
                fetchTrainers();
                setEditingTrainer(null);
              }
            } catch (error) {
              console.error("Error updating trainer:", error);
            }
          }}
        />
      )}

      {/* Add Trainer Modal */}
      {showAddTrainer && (
        <AddTrainerModalNew
          onClose={() => setShowAddTrainer(false)}
          onSave={async (newTrainer: any) => {
            try {
              const response = await fetch(`${API_URL}/api/trainers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTrainer),
              });
              if (response.ok) {
                fetchTrainers();
                setShowAddTrainer(false);
              }
            } catch (error) {
              console.error("Error adding trainer:", error);
            }
          }}
        />
      )}
    </div>
  );
}

function TrainerCard({ name, title, image, specialties, experience, certifications, availability, is_active, onView, onEdit, onDelete }: any) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${!is_active ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-4xl">{image}</div>
          <div>
            <h3 className="font-bold">{name}</h3>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
        </div>
        {!is_active && (
          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">Inactive</span>
        )}
      </div>
      <div className="space-y-2 text-sm mb-4">
        <p><span className="font-semibold">Experience:</span> {experience}</p>
        <p><span className="font-semibold">Availability:</span> {availability}</p>
        <div>
          <p className="font-semibold mb-1">Specialties:</p>
          <div className="flex flex-wrap gap-1">
            {specialties.slice(0, 2).map((s: string, i: number) => (
              <span key={i} className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded">
                {s}
              </span>
            ))}
            {specialties.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                +{specialties.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <button 
          onClick={onView}
          className="w-full py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition"
        >
          View Details
        </button>
        <button 
          onClick={onEdit}
          className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
        >
          Edit
        </button>
        <button 
          onClick={onDelete}
          className="w-full py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function ViewTrainerModal({ trainer, onClose, onEdit }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-5xl">{trainer.image}</div>
              <div>
                <h2 className="text-2xl font-bold">{trainer.name}</h2>
                <p className="text-white/90">{trainer.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-3xl">✕</button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-2">Bio</h3>
            <p className="text-gray-700">{trainer.bio}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {trainer.specialties.map((s: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-bold mb-2">Experience</h3>
              <p className="text-gray-700">{trainer.experience}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Availability</h3>
              <p className="text-gray-700">{trainer.availability}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-2">Certifications</h3>
            <ul className="space-y-1">
              {trainer.certifications.map((cert: string, i: number) => (
                <li key={i} className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  {cert}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={onEdit}
              className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
            >
              Edit Trainer
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditTrainerModal({ trainer, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: trainer.name,
    title: trainer.title,
    bio: trainer.bio,
    specialties: trainer.specialties,
    experience: trainer.experience,
    certifications: trainer.certifications,
    image: trainer.image,
    availability: trainer.availability,
    is_active: trainer.is_active,
    order: trainer.order
  });
  
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [certInput, setCertInput] = useState("");

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
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Trainer Profile</h2>
                <p className="text-sm text-white/90">{trainer.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Specialty *</label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option>Basic Obedience</option>
                <option>Puppy Training</option>
                <option>Advanced Training</option>
                <option>Behavioral Training</option>
                <option>Agility Training</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Years of Experience *</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 10 years"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Certifications</label>
            <input
              type="text"
              value={formData.certifications?.join(", ")}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value.split(", ") })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., CPDT-KA, AKC CGC Evaluator"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple certifications with commas</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Brief description of expertise and training philosophy..."
            />
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-gray-600 mb-1">Active Clients</label>
                <input
                  type="number"
                  value={formData.clients}
                  onChange={(e) => setFormData({ ...formData, clients: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AddTrainerModal({ onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "Basic Obedience",
    experience: "",
    rating: 5.0,
    clients: 0,
    certifications: [],
    bio: ""
  });

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
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Add New Trainer</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name *</label>
              <input
                type="text"
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="john@dogangelenos.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="(310) 555-0123"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Specialty *</label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option>Basic Obedience</option>
                <option>Puppy Training</option>
                <option>Advanced Training</option>
                <option>Behavioral Training</option>
                <option>Agility Training</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Years of Experience *</label>
            <input
              type="text"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., 10 years"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Certifications</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., CPDT-KA, AKC CGC Evaluator"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple certifications with commas</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Brief description of expertise and training philosophy..."
            />
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Add Trainer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ChatManager() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Chat Messages</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <input
              type="search"
              placeholder="Search conversations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="divide-y">
            <ChatConversationItem
              name="Sarah Martinez"
              lastMessage="Can we reschedule?"
              time="10m ago"
              unread={2}
              active
            />
            <ChatConversationItem
              name="Mike Thompson"
              lastMessage="Thank you!"
              time="30m ago"
              unread={0}
            />
            <ChatConversationItem
              name="Jessica Lee"
              lastMessage="What should I bring?"
              time="1h ago"
              unread={1}
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg shadow flex flex-col h-[600px]">
          <div className="p-4 border-b">
            <h3 className="font-bold">Sarah Martinez</h3>
            <p className="text-sm text-gray-600">Booking #1 - Basic Obedience</p>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <ChatMessage
              sender="Sarah Martinez"
              message="Hi! Can we reschedule to next week?"
              time="10:30 AM"
              isCustomer
            />
            <ChatMessage
              sender="Admin"
              message="Of course! What day works best for you?"
              time="10:32 AM"
            />
          </div>
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatConversationItem({ name, lastMessage, time, unread, active }: any) {
  return (
    <div className={`p-4 cursor-pointer hover:bg-gray-50 ${active ? "bg-pink-50" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{name}</h4>
          <p className="text-xs text-gray-600 truncate">{lastMessage}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{time}</p>
          {unread > 0 && (
            <span className="inline-block mt-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ sender, message, time, isCustomer }: any) {
  return (
    <div className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[70%] rounded-lg p-3 ${
        isCustomer ? "bg-gray-100" : "bg-pink-500 text-white"
      }`}>
        <p className="text-xs font-semibold mb-1 opacity-75">{sender}</p>
        <p className="text-sm">{message}</p>
        <p className="text-xs mt-1 opacity-60">{time}</p>
      </div>
    </div>
  );
}

function TrainerScheduleModal({ trainer, onClose }: any) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Sample schedule data
  const scheduleData = [
    { time: "9:00 AM", customer: "Sarah Martinez", dog: "Max", program: "Basic Obedience", location: "West Hollywood" },
    { time: "10:30 AM", customer: "Mike Thompson", dog: "Luna", program: "Puppy Training", location: "Santa Monica" },
    { time: "1:00 PM", customer: "Jessica Lee", dog: "Charlie", program: "Advanced Training", location: "Downtown LA" },
    { time: "3:00 PM", customer: "Available", dog: "-", program: "-", location: "-" },
    { time: "4:30 PM", customer: "Available", dog: "-", program: "-", location: "-" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎓</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{trainer.name}</h2>
                <p className="text-white/90">{trainer.specialty}</p>
                <p className="text-sm text-white/80">{trainer.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Date Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Schedule for {selectedDate.toLocaleDateString()}</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                  ← Prev
                </button>
                <button className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">
                  Today
                </button>
                <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-purple-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Dog</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Program</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scheduleData.map((slot, index) => (
                  <tr key={index} className={slot.customer === "Available" ? "bg-green-50" : "bg-white"}>
                    <td className="px-4 py-3 text-sm font-semibold">{slot.time}</td>
                    <td className="px-4 py-3 text-sm">{slot.customer}</td>
                    <td className="px-4 py-3 text-sm">{slot.dog}</td>
                    <td className="px-4 py-3 text-sm">{slot.program}</td>
                    <td className="px-4 py-3 text-sm">{slot.location}</td>
                    <td className="px-4 py-3 text-sm">
                      {slot.customer === "Available" ? (
                        <button className="text-purple-500 hover:text-purple-600 font-semibold">
                          Book
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <button className="text-blue-500 hover:text-blue-600">View</button>
                          <button className="text-pink-500 hover:text-pink-600">Chat</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">5</p>
              <p className="text-sm text-gray-600">Sessions Today</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">2</p>
              <p className="text-sm text-gray-600">Available Slots</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">45</p>
              <p className="text-sm text-gray-600">Total Clients</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
          <button className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
            Export Schedule
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EventsManager() {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const events = [
    {
      id: 1,
      title: "Puppy Socialization Meetup",
      date: "2024-12-15",
      time: "10:00 AM - 12:00 PM",
      location: "Griffith Park Dog Park",
      type: "meetup",
      price: "Free",
      spots: 15,
      registered: 8,
      description: "Join us for a fun puppy socialization event!"
    },
    {
      id: 2,
      title: "Advanced Agility Workshop",
      date: "2024-12-18",
      time: "2:00 PM - 4:00 PM",
      location: "Santa Monica Dog Beach",
      type: "workshop",
      price: "$45",
      spots: 8,
      registered: 5,
      description: "Learn advanced agility techniques."
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Events Management</h2>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          + Create Event
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{event.title}</h3>
                <p className="text-sm text-gray-600">{event.type}</p>
              </div>
              <button
                onClick={() => setEditingEvent(event)}
                className="text-pink-500 hover:text-pink-600"
              >
                Edit
              </button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <p><span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
              <p><span className="font-semibold">Time:</span> {event.time}</p>
              <p><span className="font-semibold">Location:</span> {event.location}</p>
              <p><span className="font-semibold">Price:</span> {event.price}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Registrations</span>
                <span className="text-lg font-bold text-pink-600">
                  {event.registered} / {event.spots}
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-pink-500 h-2 rounded-full"
                  style={{ width: `${(event.registered / event.spots) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                View Registrations
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateEvent && (
        <CreateEventModal
          onClose={() => setShowCreateEvent(false)}
          onSave={(event: any) => {
            console.log("Creating event:", event);
            setShowCreateEvent(false);
          }}
        />
      )}

      {editingEvent && (
        <CreateEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={(event: any) => {
            console.log("Updating event:", event);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}

function CreateEventModal({ event, onClose, onSave }: any) {
  const [formData, setFormData] = useState(event || {
    title: "",
    date: "",
    time: "",
    location: "",
    type: "meetup",
    price: "Free",
    spots: 20,
    description: "",
    featured: false
  });

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
          <h2 className="text-2xl font-bold">{event ? "Edit Event" : "Create New Event"}</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Event Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Puppy Socialization Meetup"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Time *</label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="10:00 AM - 12:00 PM"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Griffith Park Dog Park"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="meetup">Meetup</option>
                <option value="workshop">Workshop</option>
                <option value="training">Training</option>
                <option value="competition">Competition</option>
                <option value="social">Social</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Price</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Free or $45"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Max Spots</label>
              <input
                type="number"
                value={formData.spots}
                onChange={(e) => setFormData({ ...formData, spots: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Event description..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-semibold">Featured Event</label>
          </div>
        </div>

        <div className="border-t p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            {event ? "Update Event" : "Create Event"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showNewEvent, setShowNewEvent] = useState(false);

  const goToToday = () => setCurrentMonth(new Date());
  const previousMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };
  const nextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Calendar</h2>
        <div className="flex space-x-2">
          <button 
            onClick={goToToday}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Today
          </button>
          <button 
            onClick={() => setShowNewEvent(true)}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            + New Event
          </button>
        </div>
      </div>

      {showNewEvent && (
        <NewBookingModal
          onClose={() => setShowNewEvent(false)}
          onSave={(event: any) => {
            console.log("Creating event:", event);
            setShowNewEvent(false);
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={previousMonth}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <h3 className="text-xl font-bold">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={nextMonth}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
          
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 2;
            const hasEvent = [15, 18, 20].includes(day);
            return (
              <div
                key={i}
                className={`aspect-square border rounded-lg p-2 text-sm ${
                  day < 1 || day > 31 ? "bg-gray-50 text-gray-400" : "hover:bg-gray-50 cursor-pointer"
                } ${hasEvent ? "bg-pink-50 border-pink-300" : ""}`}
              >
                {day > 0 && day <= 31 && (
                  <>
                    <div className="font-semibold">{day}</div>
                    {hasEvent && (
                      <div className="text-xs text-pink-600 mt-1">• Training</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


function NewsletterManager() {
  const [activeSubTab, setActiveSubTab] = useState<"subscribers" | "compose" | "sent">("subscribers");
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [subscriberCount, setSubscriberCount] = useState({ active: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetchSubscribers();
    fetchNewsletters();
    fetchSubscriberCount();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/newsletter/subscribers`);
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    }
  };

  const fetchNewsletters = async () => {
    try {
      const response = await fetch(`${API_URL}/api/newsletter/archive`);
      if (response.ok) {
        const data = await response.json();
        setNewsletters(data);
      }
    } catch (error) {
      console.error("Error fetching newsletters:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriberCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/newsletter/subscribers/count`);
      if (response.ok) {
        const data = await response.json();
        setSubscriberCount(data);
      }
    } catch (error) {
      console.error("Error fetching subscriber count:", error);
    }
  };

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSubscribers = subscriberCount.active;
  const totalSubscribers = subscriberCount.total;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Newsletter Management</h2>
        <button
          onClick={() => setShowComposeModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition font-semibold"
        >
          ✉️ Compose Newsletter
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-gray-600 text-sm">Total Subscribers</p>
          <p className="text-3xl font-bold mt-1">{totalSubscribers}</p>
          <p className="text-sm text-green-600 mt-1">{activeSubscribers} active</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📨</span>
          </div>
          <p className="text-gray-600 text-sm">Newsletters Published</p>
          <p className="text-3xl font-bold mt-1">{newsletters.length}</p>
          <p className="text-sm text-gray-500 mt-1">In archive</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-gray-600 text-sm">Avg Open Rate</p>
          <p className="text-3xl font-bold mt-1">92%</p>
          <p className="text-sm text-green-600 mt-1">Above industry avg</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🎯</span>
          </div>
          <p className="text-gray-600 text-sm">Avg Click Rate</p>
          <p className="text-3xl font-bold mt-1">60%</p>
          <p className="text-sm text-green-600 mt-1">Excellent engagement</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveSubTab("subscribers")}
            className={`px-6 py-4 font-semibold transition ${
              activeSubTab === "subscribers"
                ? "border-b-2 border-pink-500 text-pink-500"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📋 Subscribers ({activeSubscribers})
          </button>
          <button
            onClick={() => setActiveSubTab("sent")}
            className={`px-6 py-4 font-semibold transition ${
              activeSubTab === "sent"
                ? "border-b-2 border-pink-500 text-pink-500"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📤 Published Newsletters ({newsletters.length})
          </button>
        </div>

        <div className="p-6">
          {activeSubTab === "subscribers" && (
            <SubscribersTab
              subscribers={filteredSubscribers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedSubscribers={selectedSubscribers}
              setSelectedSubscribers={setSelectedSubscribers}
            />
          )}
          {activeSubTab === "sent" && (
            <SentNewslettersTab newsletters={newsletters} />
          )}
        </div>
      </div>

      {showComposeModal && (
        <ComposeNewsletterModal
          onClose={() => setShowComposeModal(false)}
          onSend={(newsletter: any) => {
            console.log("Sending newsletter:", newsletter);
            setShowComposeModal(false);
          }}
          totalSubscribers={activeSubscribers}
        />
      )}
    </div>
  );
}

function SubscribersTab({ subscribers, searchTerm, setSearchTerm, selectedSubscribers, setSelectedSubscribers }: any) {
  const [showExportModal, setShowExportModal] = useState(false);

  const toggleSubscriber = (id: number) => {
    if (selectedSubscribers.includes(id)) {
      setSelectedSubscribers(selectedSubscribers.filter((sid: number) => sid !== id));
    } else {
      setSelectedSubscribers([...selectedSubscribers, id]);
    }
  };

  const toggleAll = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map((s: any) => s.id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 max-w-md">
          <input
            type="search"
            placeholder="Search subscribers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            📥 Export
          </button>
          {selectedSubscribers.length > 0 && (
            <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition">
              Send to Selected ({selectedSubscribers.length})
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedSubscribers.length === subscribers.length}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preferences</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subscribers.map((subscriber: any) => (
              <tr key={subscriber.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedSubscribers.includes(subscriber.id)}
                    onChange={() => toggleSubscriber(subscriber.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium">{subscriber.email.split('@')[0]}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{subscriber.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {subscriber.subscribed_at ? new Date(subscriber.subscribed_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {subscriber.preferences && Object.entries(subscriber.preferences).filter(([_, v]) => v).map(([key, _]: any, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        {key}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    subscriber.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {subscriber.is_active ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button className="text-pink-500 hover:text-pink-600 mr-3">Edit</button>
                  <button className="text-gray-500 hover:text-gray-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
}

function SentNewslettersTab({ newsletters }: any) {
  return (
    <div className="space-y-4">
      {newsletters.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No newsletters published yet</p>
          <p className="text-sm">Create your first newsletter to get started</p>
        </div>
      ) : (
        newsletters.map((newsletter: any) => (
          <div key={newsletter.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-4xl">{newsletter.image}</span>
                <div>
                  <h3 className="text-lg font-bold mb-1">{newsletter.title}</h3>
                  <p className="text-sm text-gray-600">
                    Published on {newsletter.date}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {newsletter.is_published ? 'Published' : 'Draft'}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{newsletter.excerpt}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {newsletter.topics.map((topic: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {topic}
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm">
                View Full Content
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                Edit
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ComposeNewsletterModal({ onClose, onSend, totalSubscribers }: any) {
  const [formData, setFormData] = useState({
    subject: "",
    preheader: "",
    content: "",
    sendTo: "all",
    scheduledDate: "",
    scheduledTime: "",
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(formData);
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
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">✉️ Compose Newsletter</h2>
              <p className="text-sm text-white/90">Send to {totalSubscribers} active subscribers</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">✕</button>
          </div>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Subject Line *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Top 5 Training Tips for LA Dog Owners"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Preheader Text</label>
            <input
              type="text"
              value={formData.preheader}
              onChange={(e) => setFormData({ ...formData, preheader: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              placeholder="Preview text that appears in email clients..."
            />
            <p className="text-xs text-gray-500 mt-1">This text appears next to the subject line in inboxes</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Newsletter Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-64"
              placeholder="Write your newsletter content here... You can use HTML for formatting."
              required
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">HTML formatting supported</p>
              <button type="button" className="text-sm text-pink-500 hover:text-pink-600">
                Use Template
              </button>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Send Options</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sendTo"
                  value="all"
                  checked={formData.sendTo === "all"}
                  onChange={(e) => setFormData({ ...formData, sendTo: e.target.value })}
                  className="mr-2"
                />
                <span>Send to all active subscribers ({totalSubscribers})</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sendTo"
                  value="selected"
                  checked={formData.sendTo === "selected"}
                  onChange={(e) => setFormData({ ...formData, sendTo: e.target.value })}
                  className="mr-2"
                />
                <span>Send to selected subscribers only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sendTo"
                  value="test"
                  checked={formData.sendTo === "test"}
                  onChange={(e) => setFormData({ ...formData, sendTo: e.target.value })}
                  className="mr-2"
                />
                <span>Send test email to myself</span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Schedule (Optional)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Date</label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Time</label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Leave empty to send immediately</p>
          </div>

          <div className="border-t pt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition font-semibold"
            >
              {formData.scheduledDate ? "Schedule Send" : "Send Now"} 🚀
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ExportModal({ onClose }: any) {
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
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold">📥 Export Subscribers</h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600">Choose export format:</p>
          <div className="space-y-2">
            <button className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold">
              Export as CSV
            </button>
            <button className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold">
              Export as Excel
            </button>
            <button className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold">
              Export as JSON
            </button>
          </div>
        </div>

        <div className="border-t p-4">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}


function ContentManager() {
  const [activeSection, setActiveSection] = useState<"about" | "classes" | "packages">("about");
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Content Management</h2>

      {/* Section Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveSection("about")}
            className={`px-6 py-4 font-semibold transition ${
              activeSection === "about"
                ? "border-b-2 border-pink-500 text-pink-500"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📄 About Page
          </button>
          <button
            onClick={() => setActiveSection("classes")}
            className={`px-6 py-4 font-semibold transition ${
              activeSection === "classes"
                ? "border-b-2 border-pink-500 text-pink-500"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🎓 Classes
          </button>
          <button
            onClick={() => setActiveSection("packages")}
            className={`px-6 py-4 font-semibold transition ${
              activeSection === "packages"
                ? "border-b-2 border-pink-500 text-pink-500"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📦 Packages
          </button>
        </div>
      </div>

      {activeSection === "about" && (
        <AboutContentEditor editing={editingAbout} setEditing={setEditingAbout} />
      )}
      {activeSection === "classes" && (
        <ClassesContentEditor editingClass={editingClass} setEditingClass={setEditingClass} />
      )}
      {activeSection === "packages" && (
        <PackagesContentEditor editingPackage={editingPackage} setEditingPackage={setEditingPackage} />
      )}
    </div>
  );
}

function AboutContentEditor({ editing, setEditing }: any) {
  const { aboutContent, updateAboutContent } = useContent();
  const [content, setContent] = useState(aboutContent);

  useEffect(() => {
    setContent(aboutContent);
  }, [aboutContent]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">About Page Content</h3>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          {editing ? "Cancel" : "Edit Content"}
        </button>
      </div>

      {editing ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Hero Title</label>
            <input
              type="text"
              value={content.heroTitle}
              onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Hero Subtitle</label>
            <input
              type="text"
              value={content.heroSubtitle}
              onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Introduction Text</label>
            <textarea
              value={content.introduction}
              onChange={(e) => setContent({ ...content, introduction: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-32"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Mission Statement</label>
            <textarea
              value={content.mission}
              onChange={(e) => setContent({ ...content, mission: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-24"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setEditing(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  await updateAboutContent(content);
                  setEditing(false);
                  alert("About page content saved successfully!");
                } catch (error) {
                  alert("Failed to save content. Please try again.");
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Hero Title</h4>
            <p className="text-gray-700">{content.heroTitle}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Hero Subtitle</h4>
            <p className="text-gray-700">{content.heroSubtitle}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Introduction</h4>
            <p className="text-gray-700">{content.introduction}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Mission Statement</h4>
            <p className="text-gray-700">{content.mission}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ClassesContentEditor({ editingClass, setEditingClass }: any) {
  const { classes, updateClass, deleteClass } = useContent();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Training Classes</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          + Add New Class
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {classes.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{classItem.icon}</span>
                <div>
                  <h4 className="text-xl font-bold">{classItem.name}</h4>
                  {classItem.featured && (
                    <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded">
                      MOST POPULAR
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingClass(classItem)}
                  className="text-pink-500 hover:text-pink-600"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this class?")) {
                      try {
                        await deleteClass(classItem.id);
                        alert("Class deleted successfully!");
                      } catch (error) {
                        alert("Failed to delete class. Please try again.");
                      }
                    }
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{classItem.description}</p>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-pink-600">{classItem.price}</span>
                <span className="text-gray-600 text-sm">/{classItem.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingClass && (
        <EditClassModal
          classItem={editingClass}
          onClose={() => setEditingClass(null)}
          onSave={async (updated: any) => {
            try {
              await updateClass(updated);
              setEditingClass(null);
              alert("Class updated successfully!");
            } catch (error) {
              alert("Failed to update class. Please try again.");
            }
          }}
        />
      )}

      {showAddModal && (
        <AddClassModal
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function PackagesContentEditor({ editingPackage, setEditingPackage }: any) {
  const { packages, updatePackage, deletePackage } = useContent();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Training Packages</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          + Add New Package
        </button>
      </div>

      <div className="space-y-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <span className="text-4xl">{pkg.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-xl font-bold">{pkg.title}</h4>
                    {pkg.featured && (
                      <span className="px-2 py-1 bg-pink-500 text-white text-xs font-semibold rounded-full">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{pkg.subtitle}</p>
                  <p className="text-gray-700 mb-3">{pkg.description}</p>
                  <p className="text-2xl font-bold text-pink-600 mb-3">{pkg.price}</p>
                  
                  {pkg.features && pkg.features.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">What's Included:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {pkg.features.slice(0, 3).map((feature: string, idx: number) => (
                          <li key={idx}>• {feature.substring(0, 50)}{feature.length > 50 ? '...' : ''}</li>
                        ))}
                        {pkg.features.length > 3 && (
                          <li className="text-pink-500">+ {pkg.features.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {pkg.experience && (
                    <div className="bg-purple-50 rounded p-2 mt-2">
                      <p className="text-xs font-semibold text-purple-900 mb-1">Experience:</p>
                      <p className="text-xs text-gray-700 italic">{pkg.experience.substring(0, 100)}{pkg.experience.length > 100 ? '...' : ''}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => setEditingPackage(pkg)}
                  className="text-pink-500 hover:text-pink-600"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this package?")) {
                      try {
                        await deletePackage(pkg.id);
                        alert("Package deleted successfully!");
                      } catch (error) {
                        alert("Failed to delete package. Please try again.");
                      }
                    }
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingPackage && (
        <EditPackageModal
          package={editingPackage}
          onClose={() => setEditingPackage(null)}
          onSave={async (updated: any) => {
            try {
              await updatePackage(updated);
              setEditingPackage(null);
              alert("Package updated successfully!");
            } catch (error) {
              alert("Failed to update package. Please try again.");
            }
          }}
        />
      )}

      {showAddModal && (
        <AddPackageModal
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function EditClassModal({ classItem, onClose, onSave }: any) {
  const [formData, setFormData] = useState(classItem);

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
          <h2 className="text-2xl font-bold">Edit Class</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Class Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Icon (Emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Price *</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="$199"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Duration *</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="6 weeks"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.featured || false}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-semibold">Mark as Featured</span>
            </label>
          </div>
        </div>

        <div className="border-t p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EditPackageModal({ package: pkg, onClose, onSave }: any) {
  const [formData, setFormData] = useState(pkg);

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
          <h2 className="text-2xl font-bold">Edit Package</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Package Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Icon (Emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Subtitle *</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Price *</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="$1,199"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">What's Included (Features)</label>
            <p className="text-xs text-gray-500 mb-2">One feature per line</p>
            <textarea
              value={formData.features?.join('\n') || ''}
              onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n').filter((f: string) => f.trim()) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 font-mono text-sm"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">The Experience</label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
              placeholder="Describe the overall experience..."
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.featured || false}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-semibold">Mark as Featured</span>
            </label>
          </div>
        </div>

        <div className="border-t p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}


function AddClassModal({ onClose, onSave }: any) {
  const { addClass } = useContent();
  const [formData, setFormData] = useState({
    name: "",
    icon: "🐕",
    description: "",
    price: "$",
    duration: "weeks",
    color: "from-blue-400 to-blue-600",
    featured: false,
  });

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
          <h2 className="text-2xl font-bold">Add New Class</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Class Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Puppy Training"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Icon (Emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
              placeholder="Brief description of the class..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Price *</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="$199"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Duration *</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="6 weeks"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-semibold">Mark as Featured</span>
            </label>
          </div>
        </div>

        <div className="border-t p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!formData.name || !formData.description) {
                alert("Please fill in all required fields");
                return;
              }
              try {
                await addClass(formData);
                onClose();
                alert("Class added successfully!");
              } catch (error) {
                alert("Failed to add class. Please try again.");
              }
            }}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Add Class
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AddPackageModal({ onClose, onSave }: any) {
  const { addPackage } = useContent();
  const [formData, setFormData] = useState({
    icon: "📦",
    title: "",
    subtitle: "",
    price: "$",
    description: "",
    features: [] as string[],
    experience: "",
    color: "from-blue-500 to-cyan-500",
    featured: false,
  });

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
          <h2 className="text-2xl font-bold">Add New Package</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Package Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Puppy Training Package"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Icon (Emoji)</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Subtitle *</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., 6 Sessions — First Session Complimentary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
              placeholder="Brief description of the package..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Price *</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="$1,199"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">What's Included (Features)</label>
            <p className="text-xs text-gray-500 mb-2">One feature per line</p>
            <textarea
              value={formData.features?.join('\n') || ''}
              onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n').filter((f: string) => f.trim()) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 font-mono text-sm"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">The Experience</label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
              placeholder="Describe the overall experience..."
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-semibold">Mark as Featured</span>
            </label>
          </div>
        </div>

        <div className="border-t p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!formData.title || !formData.description) {
                alert("Please fill in all required fields");
                return;
              }
              try {
                await addPackage(formData);
                onClose();
                alert("Package added successfully!");
              } catch (error) {
                alert("Failed to add package. Please try again.");
              }
            }}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Add Package
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
