'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Link from 'next/link'

const API_BASE_URL = 'http://localhost:8002'

interface Calendar {
  id: string
  name: string
  slug: string
  description?: string
  visibility: string
  cover_image_url?: string
  is_plus_active: boolean
}

export default function CalendarsPage() {
  const router = useRouter()
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [subscribedCalendars, setSubscribedCalendars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    const fetchData = async () => {
      try {
        const [calendarsRes, subscriptionsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/calendars`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/users/subscriptions`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])
        setCalendars(calendarsRes.data)
        
        // Get calendar details for subscriptions
        const subscribedCalendarIds = subscriptionsRes.data.map((sub: any) => sub.calendar_id)
        if (subscribedCalendarIds.length > 0) {
          const subscribedCalendarsData = await Promise.all(
            subscribedCalendarIds.map((id: string) =>
              axios.get(`${API_BASE_URL}/api/calendars/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              }).catch(() => null)
            )
          )
          setSubscribedCalendars(subscribedCalendarsData.filter(Boolean).map(res => res!.data))
        }
      } catch (error) {
        console.error('Failed to fetch calendars:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-12">Loading...</div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Calendars</h1>
          <Link
            href="/calendars/new"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            + Create
          </Link>
        </div>

        {/* My Calendars Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Calendars</h2>
          {calendars.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 mb-4">You don't have any calendars yet.</p>
              <Link
                href="/calendars/new"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Create Your First Calendar
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calendars.map((calendar) => (
                <Link
                  key={calendar.id}
                  href={`/calendars/${calendar.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {calendar.cover_image_url ? (
                    <img
                      src={`${API_BASE_URL}${calendar.cover_image_url}`}
                      alt={calendar.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-4xl">📅</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{calendar.name}</h3>
                      {calendar.is_plus_active && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Plus
                        </span>
                      )}
                    </div>
                    {calendar.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {calendar.description}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs capitalize">{calendar.visibility}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Subscribed Calendars Section */}
        {subscribedCalendars.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscribed Calendars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscribedCalendars.map((calendar) => (
                <Link
                  key={calendar.id}
                  href={`/calendars/${calendar.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {calendar.cover_image_url ? (
                    <img
                      src={`${API_BASE_URL}${calendar.cover_image_url}`}
                      alt={calendar.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-4xl">📅</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{calendar.name}</h3>
                    <button className="mt-4 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                      View Calendar →
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

