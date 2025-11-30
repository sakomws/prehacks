"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

type Tab = "profile" | "dogs" | "bookings" | "payments";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "customer") {
      // Redirect non-customers to their appropriate portal
      if (user?.role === "trainer") {
        router.push("/trainer");
      } else if (user?.role === "admin") {
        router.push("/admin");
      }
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "customer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64">
            <div className="bg-white rounded-lg shadow p-4 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-3xl">
                  {user?.name.charAt(0)}
                </div>
                <h2 className="font-bold text-lg">{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <nav className="space-y-2">
                <TabButton
                  icon="👤"
                  label="Profile"
                  active={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                />
                <TabButton
                  icon="🐕"
                  label="My Dogs"
                  active={activeTab === "dogs"}
                  onClick={() => setActiveTab("dogs")}
                />
                <TabButton
                  icon="📅"
                  label="Bookings"
                  active={activeTab === "bookings"}
                  onClick={() => setActiveTab("bookings")}
                />
                <TabButton
                  icon="💳"
                  label="Payments"
                  active={activeTab === "payments"}
                  onClick={() => setActiveTab("payments")}
                />
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "profile" && <ProfileSection />}
            {activeTab === "dogs" && <DogsSection />}
            {activeTab === "bookings" && <BookingsSection />}
            {activeTab === "payments" && <PaymentsSection />}
          </main>
        </div>
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



function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="Sarah Martinez"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              defaultValue="sarah@example.com"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Phone</label>
            <input
              type="tel"
              defaultValue="(310) 555-0101"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <input
              type="text"
              defaultValue="West Hollywood, CA"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Address</label>
          <input
            type="text"
            defaultValue="123 Sunset Blvd, West Hollywood, CA 90069"
            disabled={!isEditing}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Account Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-pink-600">3</p>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">1</p>
              <p className="text-sm text-gray-600">Dogs</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">2</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DogsSection() {
  const [showAddDog, setShowAddDog] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Dogs</h2>
        <button
          onClick={() => setShowAddDog(true)}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          + Add Dog
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <DogCard
          name="Max"
          breed="Golden Retriever"
          age="3 years"
          weight="65 lbs"
          program="Basic Obedience"
        />
      </div>

      {showAddDog && (
        <AddDogModal onClose={() => setShowAddDog(false)} />
      )}
    </div>
  );
}

function DogCard({ name, breed, age, weight, program }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl">
            🐕
          </div>
          <div>
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="text-sm text-gray-600">{breed}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">⋮</button>
      </div>

      <div className="space-y-2 text-sm">
        <p><span className="font-semibold">Age:</span> {age}</p>
        <p><span className="font-semibold">Weight:</span> {weight}</p>
        <p><span className="font-semibold">Current Program:</span> {program}</p>
      </div>

      <div className="mt-4 pt-4 border-t">
        <button className="w-full py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
          View Training History
        </button>
      </div>
    </div>
  );
}

function AddDogModal({ onClose }: any) {
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
          <h2 className="text-2xl font-bold">Add New Dog</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Dog's Name</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Breed</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Age</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Weight</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="border-t p-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
          <button className="px-4 py-2 bg-pink-500 text-white rounded-lg">Add Dog</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BookingsSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>

      <div className="space-y-4">
        <BookingCard
          id="1"
          program="Basic Obedience"
          date="December 15, 2024"
          time="Morning (9am-12pm)"
          location="West Hollywood"
          status="confirmed"
          trainer="Alex Rodriguez"
        />
        <BookingCard
          id="2"
          program="Basic Obedience"
          date="December 22, 2024"
          time="Morning (9am-12pm)"
          location="West Hollywood"
          status="confirmed"
          trainer="Alex Rodriguez"
        />
        <BookingCard
          id="3"
          program="Basic Obedience"
          date="December 8, 2024"
          time="Morning (9am-12pm)"
          location="West Hollywood"
          status="completed"
          trainer="Alex Rodriguez"
        />
      </div>
    </div>
  );
}

function BookingCard({ id, program, date, time, location, status, trainer }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{program}</h3>
          <p className="text-sm text-gray-600">Booking #{id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          status === "confirmed" ? "bg-green-100 text-green-700" :
          status === "completed" ? "bg-blue-100 text-blue-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-600">Date & Time</p>
          <p className="font-semibold">{date}</p>
          <p className="text-gray-600">{time}</p>
        </div>
        <div>
          <p className="text-gray-600">Location</p>
          <p className="font-semibold">{location}</p>
          <p className="text-gray-600">Trainer: {trainer}</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {status === "confirmed" && (
          <>
            <button className="flex-1 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
              Reschedule
            </button>
            <button className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
          </>
        )}
        {status === "completed" && (
          <button className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Leave Review
            </button>
        )}
      </div>
    </div>
  );
}

function PaymentsSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment Methods & History</h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Payment Methods</h3>
          <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
            + Add Card
          </button>
        </div>

        <div className="space-y-3">
          <div className="border-2 border-pink-500 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-semibold">•••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/25</p>
              </div>
            </div>
            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">Default</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Payment History</h3>
        <div className="space-y-3">
          <PaymentHistoryItem
            date="Dec 8, 2024"
            description="Basic Obedience - Session 1"
            amount="$249.00"
            status="Paid"
          />
          <PaymentHistoryItem
            date="Dec 1, 2024"
            description="Basic Obedience - Booking Fee"
            amount="$49.00"
            status="Paid"
          />
        </div>
      </div>
    </div>
  );
}

function PaymentHistoryItem({ date, description, amount, status }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="font-semibold">{description}</p>
        <p className="text-sm text-gray-600">{date}</p>
      </div>
      <div className="text-right">
        <p className="font-bold">{amount}</p>
        <p className="text-sm text-green-600">{status}</p>
      </div>
    </div>
  );
}
