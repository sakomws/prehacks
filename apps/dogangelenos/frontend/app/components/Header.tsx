"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => {
    if (path === "/#classes" || path === "/#booking") {
      return pathname === "/";
    }
    return pathname === path;
  };

  const linkClass = (path: string) => {
    return isActive(path)
      ? "text-pink-500 font-semibold"
      : "text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition";
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push("/");
  };

  const canAccessAdmin = user?.role === "admin";
  const canAccessTrainer = user?.role === "trainer" || user?.role === "admin";

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-1 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition">
          <img
            src="/logo.png"
            alt="Dog Angelenos"
            className="w-16 h-16"
          />
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/#classes" className={linkClass("/#classes")}>
            Classes
          </Link>

          <Link href="/packages" className={linkClass("/packages")}>
            Packages
          </Link>

          <Link href="/trainers" className={linkClass("/trainers")}>
            Trainers
          </Link>

          <Link href="/events" className={linkClass("/events")}>
            Events
          </Link>

          <Link href="/newsletter" className={linkClass("/newsletter")}>
            Newsletter
          </Link>

          <Link href="/about" className={linkClass("/about")}>
            About
          </Link>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          <Link
            href="/#booking"
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Book Now
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === "customer" && (
                <Link href="/account" className={linkClass("/account")}>
                  My Account
                </Link>
              )}
              {canAccessTrainer && (
                <Link href="/trainer" className={linkClass("/trainer")}>
                  Trainer Portal
                </Link>
              )}
              {canAccessAdmin && (
                <Link href="/admin" className={linkClass("/admin")}>
                  Admin
                </Link>
              )}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs">▼</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-pink-600 capitalize">
                        {user?.role}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Sign In
            </Link>
          )}
        </div>
        <div className="md:hidden">
          <button className="text-gray-700 text-2xl">☰</button>
        </div>
      </div>
    </nav>
  );
}
