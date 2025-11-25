"use client";

import Link from "next/link";
import Logo from "./Logo";
import DarkModeToggle from "./DarkModeToggle";

interface HeaderProps {
  showAuth?: boolean;
  currentPage?: string;
}

export default function Header({ showAuth = true, currentPage }: HeaderProps) {
  return (
    <header className="border-b bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size="lg" className="transition-transform group-hover:scale-110" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MentorMap</h1>
          </Link>
          <nav className="flex items-center gap-4">
            {currentPage !== "mentors" && (
              <Link href="/mentors" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Mentors
              </Link>
            )}
            {currentPage !== "pricing" && (
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Pricing
              </Link>
            )}
            <DarkModeToggle />
            {showAuth && (
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
