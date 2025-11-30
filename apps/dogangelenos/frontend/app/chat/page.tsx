"use client";

import { useState } from "react";
import Chat from "../components/Chat";
import Link from "next/link";

export default function ChatDemo() {
  const [bookingId, setBookingId] = useState(1);
  const [userType, setUserType] = useState<"customer" | "trainer">("customer");
  const [userName, setUserName] = useState("John Doe");
  const [userEmail, setUserEmail] = useState("john@example.com");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-pink-500 hover:text-pink-600 mb-4 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Chat Demo</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Chat Settings</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Booking ID</label>
              <input
                type="number"
                value={bookingId}
                onChange={(e) => setBookingId(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">User Type</label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as "customer" | "trainer")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="customer">Customer</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Your Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">How to Test</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Open this page in two browser windows</li>
            <li>In one window, set User Type to "Customer"</li>
            <li>In the other window, set User Type to "Trainer"</li>
            <li>Use the same Booking ID in both windows</li>
            <li>Click the chat button (💬) in the bottom right</li>
            <li>Start chatting in real-time!</li>
          </ol>
          
          <div className="mt-6 p-4 bg-pink-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Make sure the backend server is running on port 8000.
              The chat uses WebSockets for real-time communication.
            </p>
          </div>
        </div>
      </div>
      
      {/* Chat Component */}
      <Chat
        bookingId={bookingId}
        userEmail={userEmail}
        userName={userName}
        userType={userType}
      />
    </div>
  );
}
