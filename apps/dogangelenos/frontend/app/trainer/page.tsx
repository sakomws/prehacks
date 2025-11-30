"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

type Tab = "schedule" | "clients" | "sessions" | "earnings";

export default function TrainerPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("schedule");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "trainer" && user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== "trainer" && user?.role !== "admin")) {
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
                className="w-24 h-24"
              />
              <h1 className="text-2xl font-bold text-gray-900">
                Trainer Portal
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-purple-500">
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
              icon="📅"
              label="My Schedule"
              active={activeTab === "schedule"}
              onClick={() => setActiveTab("schedule")}
            />
            <TabButton
              icon="👥"
              label="My Clients"
              active={activeTab === "clients"}
              onClick={() => setActiveTab("clients")}
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
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === "schedule" && <ScheduleView />}
          {activeTab === "clients" && <ClientsView />}
          {activeTab === "sessions" && <SessionsView />}
          {activeTab === "earnings" && <EarningsView />}
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
      client: "Sarah Martinez",
      dog: "Max",
      program: "Basic Obedience",
      location: "West Hollywood",
      status: "confirmed",
    },
    {
      id: 2,
      time: "11:00 AM",
      client: "Mike Thompson",
      dog: "Luna",
      program: "Puppy Training",
      location: "Santa Monica",
      status: "confirmed",
    },
    {
      id: 3,
      time: "2:00 PM",
      client: "Available",
      dog: "-",
      program: "-",
      location: "-",
      status: "available",
    },
    {
      id: 4,
      time: "4:00 PM",
      client: "Jessica Lee",
      dog: "Charlie",
      program: "Advanced Training",
      location: "Downtown LA",
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
                      <h3 className="text-lg font-bold">{session.client}</h3>
                      <p className="text-sm text-gray-600">
                        {session.dog} • {session.program}
                      </p>
                      <p className="text-sm text-gray-500">📍 {session.location}</p>
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

function ClientsView() {
  const clients = [
    { id: 1, name: "Sarah Martinez", dog: "Max", sessions: 8, nextSession: "Today, 9:00 AM" },
    { id: 2, name: "Mike Thompson", dog: "Luna", sessions: 5, nextSession: "Today, 11:00 AM" },
    { id: 3, name: "Jessica Lee", dog: "Charlie", sessions: 12, nextSession: "Today, 4:00 PM" },
    { id: 4, name: "John Smith", dog: "Buddy", sessions: 3, nextSession: "Tomorrow, 10:00 AM" },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">My Clients</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h3 className="font-bold">{client.name}</h3>
                  <p className="text-sm text-gray-600">Dog: {client.dog}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <p>
                <span className="font-semibold">Total Sessions:</span> {client.sessions}
              </p>
              <p>
                <span className="font-semibold">Next Session:</span> {client.nextSession}
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
          <PaymentItem date="Dec 10" client="Sarah Martinez" amount="$150" />
          <PaymentItem date="Dec 10" client="Mike Thompson" amount="$150" />
          <PaymentItem date="Dec 10" client="Jessica Lee" amount="$150" />
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

function PaymentItem({ date, client, amount }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="font-semibold">{client}</p>
        <p className="text-sm text-gray-600">{date}</p>
      </div>
      <p className="font-bold text-purple-600">{amount}</p>
    </div>
  );
}
