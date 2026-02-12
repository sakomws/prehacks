"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for token in URL query params (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      // Save token to localStorage
      localStorage.setItem('token', tokenFromUrl);
      // Redirect to account page
      router.push('/account');
    }
  }, [router]);

  const handleLinkedInLogin = () => {
    setLoading(true);
    // Redirect to LinkedIn OAuth
    window.location.href = "http://localhost:8000/api/auth/linkedin";
  };

  const handleDirectAccess = async (role: string) => {
    // For development, try to login with a test user
    let username = "";
    let password = "password123";
    
    switch (role) {
      case 'admin':
        // Try to login as any mentor user (they can access admin)
        username = "vurghun_mentor";
        break;
      case 'mentor':
        username = "vurghun_mentor";
        break;
      case 'customer':
        username = "testmentee";
        break;
      default:
        username = "vurghun_mentor";
    }
    
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        
        // Redirect based on role
        switch (role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'mentor':
            router.push('/mentor');
            break;
          case 'customer':
            router.push('/account');
            break;
        }
      } else {
        alert("Auto-login failed. Please use the login form or visit /login-form");
        // Fallback: redirect to login form
        router.push('/login-form');
      }
    } catch (error) {
      console.error("Auto-login error:", error);
      alert("Auto-login failed. Please use the login form or visit /login-form");
      router.push('/login-form');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to MentorMap</h1>
            <p className="text-gray-600">Choose how you'd like to access the platform</p>
          </div>

          {/* LinkedIn OAuth Login */}
          <div className="mb-6">
            <button
              onClick={handleLinkedInLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 text-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              {loading ? "Connecting..." : "Continue with LinkedIn"}
            </button>
            <p className="text-center text-sm text-gray-500 mt-3">
              We use LinkedIn to verify your professional identity
            </p>
          </div>

          {/* Admin Access (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Development Access</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDirectAccess('admin')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all"
                >
                  <span className="text-xl">👑</span>
                  Admin Dashboard (Dev)
                </button>
                
                <button
                  onClick={() => handleDirectAccess('mentor')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                >
                  <span className="text-xl">🎓</span>
                  Mentor Portal (Dev)
                </button>
                
                <button
                  onClick={() => handleDirectAccess('customer')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
                >
                  <span className="text-xl">👤</span>
                  Mentee Account (Dev)
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 text-sm">
          <div className="bg-white/80 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">🔐 Authentication Options:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• <strong>LinkedIn OAuth:</strong> Real authentication flow</li>
              <li>• <strong>Direct Access:</strong> Quick access for testing</li>
            </ul>
          </div>
          
          <div className="bg-white/80 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Available Dashboards:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• <strong>Admin:</strong> Full platform management</li>
              <li>• <strong>Mentor:</strong> Schedule & mentee management</li>
              <li>• <strong>Customer:</strong> Goals & session booking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}