"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-apple border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 hidden sm:inline tracking-tight">AI Parenting Guide</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/modules" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 font-medium no-underline relative group whitespace-nowrap px-1"
            >
              Modules
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/tools" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 font-medium no-underline relative group whitespace-nowrap px-1"
            >
              Tools
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/community" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 font-medium no-underline relative group whitespace-nowrap px-1"
            >
              Community
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/learn/basics" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 font-medium no-underline relative group whitespace-nowrap px-1"
            >
              Learn
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-all duration-200 font-medium no-underline whitespace-nowrap px-1"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md no-underline transform hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-all duration-200 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 py-4 space-y-2 animate-fade-in">
            <Link 
              href="/modules" 
              className="block text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium no-underline py-2.5 px-3 rounded-lg transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Modules
            </Link>
            <Link 
              href="/tools" 
              className="block text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium no-underline py-2.5 px-3 rounded-lg transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tools
            </Link>
            <Link 
              href="/community" 
              className="block text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium no-underline py-2.5 px-3 rounded-lg transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Community
            </Link>
            <Link 
              href="/learn/basics" 
              className="block text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium no-underline py-2.5 px-3 rounded-lg transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Learn
            </Link>
            <div className="pt-4 border-t border-gray-200/50 space-y-2">
              <Link 
                href="/login" 
                className="block text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium no-underline py-2.5 px-3 rounded-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="block px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-all duration-200 text-center no-underline shadow-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
