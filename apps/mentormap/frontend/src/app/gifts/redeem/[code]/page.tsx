"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

interface GiftDetails {
  mentor_name: string;
  mentor_title: string;
  sender_name: string;
  message: string;
  expires_at: string;
}

export default function GiftRedeemPage() {
  const params = useParams();
  const router = useRouter();
  const giftCode = params.code as string;

  const [giftDetails, setGiftDetails] = useState<GiftDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    session_title: "",
    session_description: "",
    preferred_date: "",
    preferred_time: ""
  });

  useEffect(() => {
    verifyGiftCode();
  }, [giftCode]);

  const verifyGiftCode = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/gifts/verify/${giftCode}`);
      
      if (response.ok) {
        const data = await response.json();
        setGiftDetails(data.gift_details);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Invalid gift code");
      }
    } catch (error) {
      console.error("Error verifying gift code:", error);
      setError("Failed to verify gift code");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemGift = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeeming(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/gifts/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gift_code: giftCode,
          ...formData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Gift session redeemed successfully! You'll receive a confirmation email shortly.");
        router.push("/account");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to redeem gift");
      }
    } catch (error) {
      console.error("Error redeeming gift:", error);
      setError("Failed to redeem gift");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🎁</div>
          <p className="text-gray-600 dark:text-gray-300">Verifying gift code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Gift Code</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo size="lg" className="transition-transform group-hover:scale-110" />
              <h1 className="text-2xl font-bold">MentorMap</h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Gift Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h1 className="text-3xl font-bold mb-2">You've Received a Gift!</h1>
            <p className="text-purple-100">
              A mentoring session has been gifted to you
            </p>
          </div>

          <div className="p-8">
            {/* Gift Details */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">Gift Details</h2>
              <div className="space-y-3 text-purple-800 dark:text-purple-200">
                <div className="flex justify-between">
                  <span className="font-medium">Mentor:</span>
                  <span>{giftDetails?.mentor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Title:</span>
                  <span>{giftDetails?.mentor_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">From:</span>
                  <span>{giftDetails?.sender_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Expires:</span>
                  <span>{new Date(giftDetails?.expires_at || "").toLocaleDateString()}</span>
                </div>
              </div>
              
              {giftDetails?.message && (
                <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
                  <p className="font-medium text-purple-900 dark:text-purple-100 mb-2">Personal Message:</p>
                  <p className="text-purple-800 dark:text-purple-200 italic">"{giftDetails.message}"</p>
                </div>
              )}
            </div>

            {/* Redemption Form */}
            <form onSubmit={handleRedeemGift} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.session_title}
                  onChange={(e) => setFormData({ ...formData, session_title: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g., Career Guidance Session"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  What would you like to discuss?
                </label>
                <textarea
                  required
                  value={formData.session_description}
                  onChange={(e) => setFormData({ ...formData, session_description: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={4}
                  placeholder="Describe what you'd like to cover in your mentoring session..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.preferred_time}
                    onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Next Steps</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Your session request will be sent to the mentor</li>
                  <li>• You'll receive a confirmation email with meeting details</li>
                  <li>• The mentor will reach out to confirm the time</li>
                  <li>• Join the session at the scheduled time</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={redeeming}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 font-semibold text-lg"
              >
                {redeeming ? "Redeeming Gift..." : "Redeem Gift Session"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact Support</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}