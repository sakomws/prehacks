import Link from 'next/link'
import { Mail, MessageCircle, Camera, Code } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-100 mt-24">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-lg">G</span>
              </div>
              <span className="text-2xl font-medium text-gray-900 tracking-tight">Goup.VC</span>
            </div>
            <p className="text-gray-600 mb-8 max-w-md leading-relaxed font-light">
              Connect with founders, investors, and innovators. Build meaningful relationships 
              and discover opportunities in the startup ecosystem.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105">
                <Mail className="w-4 h-4 text-gray-600" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105">
                <MessageCircle className="w-4 h-4 text-gray-600" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105">
                <Camera className="w-4 h-4 text-gray-600" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105">
                <Code className="w-4 h-4 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-6 tracking-wide">
              Platform
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/events" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/discover" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
                  Discover
                </Link>
              </li>
              <li>
                <Link href="/calendars" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
                  Calendars
                </Link>
              </li>
              <li>
                <Link href="/inbox" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
                  Inbox
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
                  Create Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-6 tracking-wide">
              Company
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-100 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-4 md:mb-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 font-light">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 font-light">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 font-light">
                Cookie Policy
              </a>
            </div>
            <div className="text-sm text-gray-400 font-light">
              © 2024 Goup.VC. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}