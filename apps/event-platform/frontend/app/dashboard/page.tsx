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
}

interface Event {
  id: string
  title: string
  start_time: string
  end_time: string
  location_type: string
  location_address?: string
  status: string
}

export default function Dashboard() {
  const router = useRouter()
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    const fetchData = async () => {
      try {
        const [calendarsRes, eventsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/calendars`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/users/registrations`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])
        setCalendars(calendarsRes.data)
        // Get events from registrations
        const eventIds = eventsRes.data.map((reg: any) => reg.event_id)
        if (eventIds.length > 0) {
          const eventsData = await Promise.all(
            eventIds.slice(0, 5).map((id: string) =>
              axios.get(`${API_BASE_URL}/api/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            )
          )
          setEvents(eventsData.map(res => res.data))
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Calendars</h2>
            {calendars.length === 0 ? (
              <p className="text-gray-500 mb-4">No calendars yet. Create your first calendar!</p>
            ) : (
              <div className="space-y-3">
                {calendars.slice(0, 5).map((calendar) => (
                  <Link
                    key={calendar.id}
                    href={`/calendars/${calendar.id}`}
                    className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <h3 className="font-medium text-gray-900">{calendar.name}</h3>
                    {calendar.description && (
                      <p className="text-sm text-gray-500 mt-1">{calendar.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/calendars"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              View all calendars →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
            {events.length === 0 ? (
              <p className="text-gray-500 mb-4">No upcoming events. Discover events to attend!</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(event.start_time).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/discover"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              Discover more events →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/calendars/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 text-center"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-medium text-gray-900">Create Calendar</div>
            </Link>
            <Link
              href="/discover"
              className="p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 text-center"
            >
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-medium text-gray-900">Discover Events</div>
            </Link>
            <Link
              href="/events/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 text-center"
            >
              <div className="text-2xl mb-2">➕</div>
              <div className="font-medium text-gray-900">Create Event</div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

