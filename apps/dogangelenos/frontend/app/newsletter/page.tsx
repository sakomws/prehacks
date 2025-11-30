"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../components/Header";

type Tab = "subscribe" | "archive" | "preferences";

interface Newsletter {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  topics: string[];
  is_published: boolean;
}

interface SubscriberCount {
  active: number;
  total: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function NewsletterPage() {
  const [activeTab, setActiveTab] = useState<Tab>("subscribe");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [displayedNewsletters, setDisplayedNewsletters] = useState<Newsletter[]>([]);
  const [newslettersToShow, setNewslettersToShow] = useState(4);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<SubscriberCount>({ active: 0, total: 0 });
  const [preferences, setPreferences] = useState({
    trainingTips: true,
    events: true,
    specialOffers: true,
    communityNews: true,
    productReviews: false,
  });

  // Fetch newsletters on mount
  useEffect(() => {
    fetchNewsletters();
    fetchSubscriberCount();
  }, []);

  // Update displayed newsletters when newsletters or newslettersToShow changes
  useEffect(() => {
    setDisplayedNewsletters(newsletters.slice(0, newslettersToShow));
  }, [newsletters, newslettersToShow]);

  const fetchNewsletters = async () => {
    try {
      const response = await fetch(`${API_URL}/api/newsletter/archive`);
      if (response.ok) {
        const data = await response.json();
        setNewsletters(data);
      }
    } catch (error) {
      console.error("Error fetching newsletters:", error);
    }
  };

  const handleLoadMore = () => {
    setNewslettersToShow(prev => prev + 4);
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubscribed(true);
        setEmail("");
        fetchSubscriberCount(); // Refresh count
        setTimeout(() => setSubscribed(false), 5000);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/newsletter/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          preferences,
          is_active: true,
        }),
      });

      if (response.ok) {
        alert("Preferences saved successfully!");
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to save preferences.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!confirm("Are you sure you want to unsubscribe?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/newsletter/unsubscribe/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Successfully unsubscribed. We're sorry to see you go!");
        setEmail("");
        fetchSubscriberCount(); // Refresh count
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to unsubscribe.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold mb-4">📧 Newsletter Portal</h1>
            <p className="text-xl mb-2">
              Stay connected with Los Angeles' premier dog training community
            </p>
            <p className="text-lg opacity-90">
              Expert tips, exclusive events, and community stories delivered to your inbox
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-2 inline-flex space-x-2">
            <TabButton
              label="Subscribe"
              icon="✉️"
              active={activeTab === "subscribe"}
              onClick={() => setActiveTab("subscribe")}
            />
            <TabButton
              label="Archive"
              icon="📚"
              active={activeTab === "archive"}
              onClick={() => setActiveTab("archive")}
            />
            <TabButton
              label="Preferences"
              icon="⚙️"
              active={activeTab === "preferences"}
              onClick={() => setActiveTab("preferences")}
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === "subscribe" && (
          <SubscribeSection
            email={email}
            setEmail={setEmail}
            subscribed={subscribed}
            loading={loading}
            error={error}
            subscriberCount={subscriberCount}
            onSubscribe={handleSubscribe}
          />
        )}
        {activeTab === "archive" && (
          <ArchiveSection 
            newsletters={displayedNewsletters} 
            totalNewsletters={newsletters.length}
            onLoadMore={handleLoadMore}
            hasMore={newslettersToShow < newsletters.length}
            onReadFull={setSelectedNewsletter}
          />
        )}
        {activeTab === "preferences" && (
          <PreferencesSection
            email={email}
            setEmail={setEmail}
            preferences={preferences}
            setPreferences={setPreferences}
            loading={loading}
            error={error}
            onSave={handleSavePreferences}
            onUnsubscribe={handleUnsubscribe}
          />
        )}

        {/* Stats Section */}
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          <StatCard icon="👥" value={`${subscriberCount.active.toLocaleString()}+`} label="Active Subscribers" />
          <StatCard icon="📨" value={newsletters.length.toString()} label="Newsletters Sent" />
          <StatCard icon="⭐" value="4.9/5" label="Average Rating" />
          <StatCard icon="📈" value="92%" label="Open Rate" />
        </div>

        {/* Testimonials */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            What Our Subscribers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="The training tips in the newsletter have been game-changers for my puppy!"
              author="Sarah M."
              location="West Hollywood"
            />
            <TestimonialCard
              quote="I love getting updates about dog events in LA. Never miss a meetup now!"
              author="Mike T."
              location="Santa Monica"
            />
            <TestimonialCard
              quote="Professional, informative, and always relevant. Best dog newsletter out there!"
              author="Jessica L."
              location="Silver Lake"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold transition flex items-center space-x-2 ${
        active
          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function SubscribeSection({ email, setEmail, subscribed, loading, error, subscriberCount, onSubscribe }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📬</div>
          <h2 className="text-3xl font-bold mb-4">
            Join {subscriberCount.active.toLocaleString()}+ Los Angeles Dog Owners
          </h2>
          <p className="text-lg text-gray-600">
            Get expert training tips, exclusive event invites, and community stories
            delivered weekly to your inbox.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-500 rounded-lg p-4 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {subscribed ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center"
          >
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-2xl font-bold text-green-700 mb-2">
              Welcome to the Pack!
            </h3>
            <p className="text-gray-700">
              Check your email for a confirmation link. You'll receive your first
              newsletter soon!
            </p>
          </motion.div>
        ) : (
          <form onSubmit={onSubscribe} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-pink-500 focus:border-pink-500 text-lg disabled:bg-gray-100"
              />
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="font-bold mb-3">What You'll Get:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">✓</span>
                  <span>Weekly training tips from certified professionals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">✓</span>
                  <span>Early access to events and workshops</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">✓</span>
                  <span>Exclusive discounts on training packages</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">✓</span>
                  <span>LA dog park guides and recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">✓</span>
                  <span>Success stories from our community</span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg font-bold rounded-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Subscribing..." : "Subscribe Now - It's Free! 🎉"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Unsubscribe anytime. We respect your privacy. 🔒
            </p>
          </form>
        )}
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <BenefitCard
          icon="🎓"
          title="Expert Content"
          description="Tips from certified trainers with 15+ years experience"
        />
        <BenefitCard
          icon="🎯"
          title="LA-Focused"
          description="Content tailored specifically for Los Angeles dog owners"
        />
        <BenefitCard
          icon="🤝"
          title="Community"
          description="Connect with 5,000+ local dog lovers"
        />
      </div>
    </motion.div>
  );
}

function ArchiveSection({ newsletters, totalNewsletters, onLoadMore, hasMore, onReadFull }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Newsletter Archive</h2>
        <p className="text-gray-600">
          Browse our past newsletters and catch up on what you missed
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Showing {newsletters.length} of {totalNewsletters} newsletters
        </p>
      </div>

      {newsletters.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No newsletters available yet</p>
          <p className="text-sm">Check back soon for our latest content!</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {newsletters.map((newsletter: Newsletter) => (
              <NewsletterCard 
                key={newsletter.id} 
                newsletter={newsletter}
                onReadFull={() => onReadFull(newsletter)}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-8">
              <button 
                onClick={onLoadMore}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Load More Newsletters
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

function PreferencesSection({ email, setEmail, preferences, setPreferences, loading, error, onSave, onUnsubscribe }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-3xl font-bold mb-2">Email Preferences</h2>
          <p className="text-gray-600">
            Customize what you want to receive in your inbox
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-500 rounded-lg p-4 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Your Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100"
          />
        </div>

        <div className="space-y-4">
          <PreferenceToggle
            label="Training Tips & Techniques"
            description="Weekly expert advice on dog training and behavior"
            checked={preferences.trainingTips}
            onChange={(checked: boolean) =>
              setPreferences({ ...preferences, trainingTips: checked })
            }
          />
          <PreferenceToggle
            label="Events & Workshops"
            description="Notifications about upcoming dog events in LA"
            checked={preferences.events}
            onChange={(checked: boolean) =>
              setPreferences({ ...preferences, events: checked })
            }
          />
          <PreferenceToggle
            label="Special Offers & Discounts"
            description="Exclusive deals on training packages and services"
            checked={preferences.specialOffers}
            onChange={(checked: boolean) =>
              setPreferences({ ...preferences, specialOffers: checked })
            }
          />
          <PreferenceToggle
            label="Community News & Stories"
            description="Success stories and updates from our dog community"
            checked={preferences.communityNews}
            onChange={(checked: boolean) =>
              setPreferences({ ...preferences, communityNews: checked })
            }
          />
          <PreferenceToggle
            label="Product Reviews & Recommendations"
            description="Reviews of dog products, gear, and services"
            checked={preferences.productReviews}
            onChange={(checked: boolean) =>
              setPreferences({ ...preferences, productReviews: checked })
            }
          />
        </div>

        <div className="mt-8 pt-8 border-t">
          <button
            onClick={onSave}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Preferences"}
          </button>
          <button
            onClick={onUnsubscribe}
            disabled={loading}
            className="w-full mt-3 py-3 text-gray-600 hover:text-gray-900 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unsubscribe from all emails
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function NewsletterCard({ newsletter, onReadFull }: any) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden">
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 text-center">
        <div className="text-6xl mb-2">{newsletter.image}</div>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {newsletter.topics.map((topic: string, index: number) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-bold mb-2">{newsletter.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{newsletter.date}</p>
        <p className="text-gray-700 mb-4">{newsletter.excerpt}</p>
        <button 
          onClick={onReadFull}
          className="w-full py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-semibold"
        >
          Read Full Newsletter →
        </button>
      </div>
    </div>
  );
}

function PreferenceToggle({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div className="flex-1">
        <h4 className="font-semibold mb-1">{label}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pink-500"></div>
      </label>
    </div>
  );
}

function BenefitCard({ icon, title, description }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ icon, value, label }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-3xl font-bold text-pink-600 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, location }: any) {
  return (
    <div className="bg-purple-50 rounded-lg p-6">
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-yellow-400">
            ⭐
          </span>
        ))}
      </div>
      <p className="text-gray-700 mb-4 italic">"{quote}"</p>
      <p className="font-semibold">
        {author}
        <span className="text-gray-600 font-normal"> - {location}</span>
      </p>
    </div>
  );
}
