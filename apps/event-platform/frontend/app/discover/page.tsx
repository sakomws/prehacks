'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Link from 'next/link'

const API_BASE_URL = 'http://localhost:8002'

interface Event {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location_type: string
  location_address?: string
  location_url?: string
  cover_image_url?: string
  category?: string
  ticket_type: string
  ticket_price_cents?: number
  currency?: string
}

export default function DiscoverPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [popularEvents, setPopularEvents] = useState<Event[]>([])
  const [featuredCalendars, setFeaturedCalendars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')

  const categories = [
    { name: 'Tech', icon: '💻', count: '2K Events' },
    { name: 'Food & Drink', icon: '🍕', count: '11 Events' },
    { name: 'AI', icon: '🤖', count: '1K Events' },
    { name: 'Arts & Culture', icon: '🎨', count: '839 Events' },
    { name: 'Climate', icon: '🌍', count: '290 Events' },
    { name: 'Fitness', icon: '💪', count: '698 Events' },
    { name: 'Wellness', icon: '🧘', count: '945 Events' },
    { name: 'Crypto', icon: '₿', count: '674 Events' }
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    const fetchData = async () => {
      try {
        const [eventsRes, popularRes, calendarsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/discover/events`, {
            headers: { Authorization: `Bearer ${token}` },
            params: searchTerm ? { search: searchTerm } : category ? { category } : {}
          }),
          axios.get(`${API_BASE_URL}/api/discover/events/popular`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 6 }
          }),
          axios.get(`${API_BASE_URL}/api/discover/calendars`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 6 }
          })
        ])
        setEvents(eventsRes.data)
        setPopularEvents(popularRes.data)
        setFeaturedCalendars(calendarsRes.data)
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, searchTerm, category])

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Events</h1>
        <p className="text-gray-600 mb-8">
          Explore popular events near you, browse by category, or check out some of the great
          community calendars.
        </p>

        {/* Popular Events */}
        {popularEvents.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Popular Events</h2>
              <Link href="/discover?filter=popular" className="text-blue-600 hover:text-blue-700">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {event.cover_image_url ? (
                    <img
                      src={`${API_BASE_URL}${event.cover_image_url}`}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                      <span className="text-4xl">🎉</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">
                      {new Date(event.start_time).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {event.location_type === 'online'
                        ? 'Online'
                        : event.location_address || 'TBD'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Browse by Category */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name.toLowerCase())}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="font-semibold text-gray-900 mb-1">{cat.name}</div>
                <div className="text-sm text-gray-500">{cat.count}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Calendars */}
        {featuredCalendars.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Calendars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCalendars.map((calendar) => (
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
                    <div className="w-full h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                      <span className="text-4xl">📅</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{calendar.name}</h3>
                    {calendar.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {calendar.description}
                      </p>
                    )}
                    {calendar.subscriber_count !== undefined && (
                      <p className="text-sm text-gray-500">
                        {calendar.subscriber_count} Subscribers
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {(searchTerm || category) && events.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {event.cover_image_url && (
                    <img
                      src={`${API_BASE_URL}${event.cover_image_url}`}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>
                        📅 {new Date(event.start_time).toLocaleDateString()} at{' '}
                        {new Date(event.start_time).toLocaleTimeString()}
                      </p>
                      <p>
                        📍{' '}
                        {event.location_type === 'online'
                          ? 'Online'
                          : event.location_address || 'TBD'}
                      </p>
                      {event.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {event.category}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && !isLoading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No events found. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </>
  )
}

