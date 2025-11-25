"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../../components/Logo";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (token) {
        localStorage.setItem("token", token);
        setTimeout(() => {
          router.push("/roadmap");
        }, 100);
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <Logo size={48} className="transition-transform group-hover:scale-110" />
            <h1 className="text-2xl font-semibold text-gray-900">MentorMap</h1>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome back</h2>
          <p className="text-gray-600">Sign in to continue your learning journey</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Sign in with your professional profile
              </p>
            </div>

            {/* LinkedIn Button */}
            <button
              onClick={() => window.location.href = "http://localhost:8000/api/auth/linkedin"}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#0A66C2] text-white rounded-xl hover:bg-[#004182] transition-all shadow-md hover:shadow-lg font-medium"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continue with LinkedIn
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Why LinkedIn?
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Secure authentication with your professional profile</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>No need to remember another password</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Connect with mentors in your network</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Share your learning progress easily</span>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
