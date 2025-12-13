'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  username?: string
  avatar_url?: string
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    // Update time every minute
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    router.push('/')
  }

  if (!user) {
    return null
  }

  const API_BASE_URL = 'http://localhost:8002'

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link
              href="/events"
              className={`flex items-center space-x-2 ${
                pathname === '/events' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <span>📅</span>
              <span>Events</span>
            </Link>
            <Link
              href="/calendars"
              className={`flex items-center space-x-2 ${
                pathname === '/calendars' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <span>📆</span>
              <span>Calendars</span>
            </Link>
            <Link
              href="/discover"
              className={`flex items-center space-x-2 ${
                pathname === '/discover' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <span>🔍</span>
              <span>Discover</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{currentTime || '10:05 PM PST'}</span>
            <Link
              href="/events/new"
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
            >
              Create Event
            </Link>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              {user.avatar_url ? (
                <img
                  src={`${API_BASE_URL}${user.avatar_url}`}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                  {user.first_name[0]}{user.last_name[0]}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

