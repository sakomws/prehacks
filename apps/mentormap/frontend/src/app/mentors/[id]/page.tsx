"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

interface Mentor {
  id: number;
  title: string;
  bio: string;
  expertise: string;
  hourly_rate: number;
  rating: number;
  total_sessions: number;
  is_available: boolean;
  linkedin_url?: string;
  website_url?: string;
  profile_image_url?: string;
  user?: {
    full_name: string;
  };
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
    promo_code: "",
  });
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  useEffect(() => {
    fetchMentor();
  }, [mentorId]);

  const fetchMentor = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/mentors/${mentorId}`);
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
      const response = await fetch("http://localhost:8000/api/payments/create-checkout-session", {
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
        
        // Handle authentication errors
        if (response.status === 401) {
          alert("Your session has expired. Please log in again.");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        
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

  const basePrice = mentor.hourly_rate * (formData.duration_minutes / 60);
  const price = basePrice * (1 - discount / 100);

  const validatePromoCode = async () => {
    if (!formData.promo_code) {
      setDiscount(0);
      setPromoMessage("");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/payments/validate-promo?promo_code=${formData.promo_code}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setDiscount(data.discount_percent);
        setPromoMessage(`✅ ${data.description} - ${data.discount_percent}% off applied!`);
      } else {
        setDiscount(0);
        setPromoMessage("❌ Invalid or expired promo code");
      }
    } catch (error) {
      setDiscount(0);
      setPromoMessage("❌ Error validating promo code");
    }
  };

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
                {mentor.profile_image_url ? (
                  <img
                    src={mentor.profile_image_url}
                    alt={mentor.user?.full_name || mentor.title}
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                    {mentor.title.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  {mentor.user?.full_name && (
                    <h2 className="text-3xl font-bold mb-1">{mentor.user.full_name}</h2>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{mentor.title}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                      ⭐ {mentor.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 mb-3">
                    {mentor.total_sessions} sessions completed
                  </div>
                  
                  {/* Social Links */}
                  <div className="flex gap-3 mb-3">
                    {mentor.linkedin_url && (
                      <a
                        href={mentor.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {mentor.website_url && (
                      <a
                        href={mentor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 1000 1000">
                          <path d="M764.166 348.371H236.319V419.402H764.166V348.371Z"/>
                          <path d="M764.166 483.752H236.319V554.783H764.166V483.752Z"/>
                          <path d="M236.319 619.133L236.319 960L354.558 960L354.558 619.133L236.319 619.133Z"/>
                          <path d="M764.166 619.133H645.927V960H764.166V619.133Z"/>
                          <path d="M618.127 619.133H382.358V960H618.127V619.133Z"/>
                        </svg>
                        Substack
                      </a>
                    )}
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

              {/* Testimonials Section */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-xl font-semibold mb-4">What People Say</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-1 mb-2 text-yellow-500">
                      ⭐⭐⭐⭐⭐
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      "Vurghun's insights on digital transformation were invaluable. His experience in banking and public sector gave me a unique perspective on how to approach complex technology initiatives. Highly recommend!"
                    </p>
                    <p className="text-sm text-gray-500">— Sarah K., Product Manager</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-1 mb-2 text-yellow-500">
                      ⭐⭐⭐⭐⭐
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      "As a technology executive, Vurghun provided strategic guidance that helped me navigate my career transition. His mentorship was practical, actionable, and exactly what I needed."
                    </p>
                    <p className="text-sm text-gray-500">— Michael T., Engineering Lead</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center gap-1 mb-2 text-yellow-500">
                      ⭐⭐⭐⭐⭐
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      "Working with Vurghun was transformative. His 15+ years of experience in product and technology leadership showed in every conversation. He helped me think strategically about my career path."
                    </p>
                    <p className="text-sm text-gray-500">— Aisha M., Tech Consultant</p>
                  </div>
                </div>
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

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Promo Code (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={formData.promo_code}
                      onChange={(e) => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })}
                      className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
                      placeholder="STUDENT50"
                    />
                    <button
                      type="button"
                      onClick={validatePromoCode}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-xs mt-2 ${promoMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t">
                  {discount > 0 && (
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Original Price:</span>
                      <span className="line-through text-gray-500">${basePrice.toFixed(2)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-green-600">Discount ({discount}%):</span>
                      <span className="text-green-600">-${(basePrice * discount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600 dark:text-gray-300 font-semibold">Total Price:</span>
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
