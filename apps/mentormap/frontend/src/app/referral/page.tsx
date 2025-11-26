"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    
    // Generate or fetch user's referral code
    if (token) {
      // In a real app, fetch from API
      const userId = Math.random().toString(36).substring(2, 8).toUpperCase();
      setReferralCode(`MENTOR${userId}`);
    }
  }, []);

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header currentPage="referral" />

      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Refer Friends, Get 50% Off!
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Share MentorMap with friends and you both get 50% off your next session
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">1</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Share Your Link</h4>
              <p className="text-gray-600 dark:text-gray-300">Send your unique referral link to friends</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">2</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">They Sign Up</h4>
              <p className="text-gray-600 dark:text-gray-300">Your friend creates an account and books a session</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">3</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">You Both Save!</h4>
              <p className="text-gray-600 dark:text-gray-300">You both get 50% off your next session</p>
            </div>
          </div>
        </div>

        {/* Referral Link Section */}
        {isLoggedIn ? (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white mb-8">
            <h3 className="text-2xl font-bold mb-4">Your Referral Link</h3>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
              <p className="text-sm mb-2 opacity-90">Your unique code:</p>
              <p className="text-2xl font-mono font-bold mb-4">{referralCode}</p>
              <p className="text-sm mb-2 opacity-90">Share this link:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-white/20 backdrop-blur rounded px-4 py-2 text-white font-mono text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-white text-blue-600 px-6 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
                >
                  {copySuccess ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <p className="text-sm opacity-90">
              Share this link with friends via email, social media, or messaging apps!
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center mb-8">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Login to Get Your Referral Link
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create an account or login to start referring friends and earning discounts
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
              >
                Login
              </Link>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Referral Benefits</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">50% Off for You</h4>
                <p className="text-gray-600 dark:text-gray-300">Get 50% off your next session when your friend books their first session</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">50% Off for Your Friend</h4>
                <p className="text-gray-600 dark:text-gray-300">Your friend gets 50% off their first session when they sign up with your link</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Unlimited Referrals</h4>
                <p className="text-gray-600 dark:text-gray-300">Refer as many friends as you want - there's no limit to your savings!</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Easy Tracking</h4>
                <p className="text-gray-600 dark:text-gray-300">Track your referrals and discounts in your dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
