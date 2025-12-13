'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Link from 'next/link'

const API_BASE_URL = 'http://localhost:8002'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  username?: string
  bio?: string
  avatar_url?: string
  social_links?: any
}

interface Event {
  id: string
  title: string
  start_time: string
  end_time: string
  location_type: string
  location_address?: string
  cover_image_url?: string
  status: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [hostedEvents, setHostedEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    const fetchData = async () => {
      try {
        const [userRes, calendarsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/calendars`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])
        setUser(userRes.data)

        // Get events from calendars
        const calendarIds = calendarsRes.data.map((cal: any) => cal.id)
        const allEvents: Event[] = []
        for (const calId of calendarIds) {
          try {
            const eventsRes = await axios.get(
              `${API_BASE_URL}/api/calendars/${calId}/events`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            allEvents.push(...eventsRes.data)
          } catch (error) {
            // Skip calendars without events
          }
        }

        const now = new Date()
        const hosted = allEvents.filter(
          (e) => e.status === 'published' && new Date(e.start_time) > now
        )
        const past = allEvents.filter(
          (e) => e.status === 'published' && new Date(e.start_time) <= now
        )

        setHostedEvents(hosted.slice(0, 10))
        setPastEvents(past.slice(0, 10))
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

  if (!user) return null

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start space-x-6">
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={`${API_BASE_URL}${user.avatar_url}`}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl text-gray-400">
                    {user.first_name[0]}{user.last_name[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.first_name} {user.last_name}
              </h1>
              {user.bio && <p className="text-gray-600 mb-4">{user.bio}</p>}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>Joined {new Date().getFullYear()}</span>
                <span>{hostedEvents.length} Hosted</span>
                <span>{pastEvents.length} Attended</span>
              </div>
              {user.social_links && (
                <div className="flex items-center space-x-4 mt-4">
                  {user.social_links.instagram && (
                    <a
                      href={`https://instagram.com/${user.social_links.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      📷
                    </a>
                  )}
                  {user.social_links.twitter && (
                    <a
                      href={`https://x.com/${user.social_links.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      🐦
                    </a>
                  )}
                  {user.social_links.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${user.social_links.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      💼
                    </a>
                  )}
                  {user.social_links.website && (
                    <a
                      href={user.social_links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      🌐
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hosting Section */}
        {hostedEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hosting</h2>
            <div className="space-y-4">
              {hostedEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex"
                >
                  {event.cover_image_url ? (
                    <img
                      src={`${API_BASE_URL}${event.cover_image_url}`}
                      alt={event.title}
                      className="w-48 h-32 object-cover"
                    />
                  ) : (
                    <div className="w-48 h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-2xl">🎉</span>
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(event.start_time).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
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

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Past Events</h2>
              <Link href="/events" className="text-blue-600 hover:text-blue-700">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
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
                    <div className="w-full h-48 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                      <span className="text-4xl">📅</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(event.start_time).toLocaleDateString()}
                    </p>
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

