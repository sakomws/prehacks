'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Compass, Home, Search, Bell, User, LogIn, Users } from 'lucide-react'
import CommandPalette from './CommandPalette'
import NotificationsPopover from './NotificationsPopover'
import ProfileMenu from './ProfileMenu'
import AuthModal from './AuthModal'

export default function AppTopNav() {
  const pathname = usePathname()
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  
  // In a real app, this would come from auth context/state
  const isAuthenticated = false // Change this based on actual auth state

  const navItems = [
    { href: '/inbox', label: 'Inbox', icon: Home },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/hackathons', label: 'Hackathons', icon: Calendar },
    { href: '/communities', label: 'Communities', icon: Users },
    { href: '/calendars', label: 'Calendars', icon: Calendar },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-sm">G</span>
              </div>
              <span className="text-xl font-medium text-gray-900 tracking-tight">Goup.VC</span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center space-x-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    pathname === href
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
            
            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/create"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-all duration-200 hover:scale-105 shadow-md"
                  >
                    Create Event
                  </Link>
                  
                  <button
                    onClick={() => setShowCommandPalette(true)}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
                    >
                      <Bell className="w-4 h-4" />
                      <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                    </button>
                    {showNotifications && (
                      <NotificationsPopover onClose={() => setShowNotifications(false)} />
                    )}
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center shadow-sm"
                    >
                      <User className="w-4 h-4 text-gray-600" />
                    </button>
                    {showProfileMenu && (
                      <ProfileMenu onClose={() => setShowProfileMenu(false)} />
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/events"
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-full transition-colors"
                  >
                    Explore Events
                  </Link>
                  <button
                    onClick={() => setShowAuth(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-all duration-200 hover:scale-105 shadow-md"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}
      
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        mode="login"
      />
    </>
  )
}