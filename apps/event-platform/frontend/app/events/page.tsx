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
  cover_image_url?: string
  status: string
  host_user_id?: string
  calendar_id?: string
}

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        setEvents([]) // Clear previous events when filter changes
        
        // Get user's registrations to find their events
        const registrationsRes = await axios.get(`${API_BASE_URL}/api/users/registrations`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const eventIds = registrationsRes.data.map((reg: any) => reg.event_id)
        
        if (eventIds.length > 0) {
          const eventsData = await Promise.all(
            eventIds.map((id: string) =>
              axios.get(`${API_BASE_URL}/api/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              }).catch((err) => {
                console.error(`Failed to fetch event ${id}:`, err)
                return null
              })
            )
          )
          const allEvents = eventsData.filter(Boolean).map(res => res!.data)
          
          // Filter by upcoming/past
          const now = new Date()
          now.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
          
          let filteredEvents: Event[] = []
          if (filter === 'upcoming') {
            filteredEvents = allEvents.filter(e => {
              const eventDate = new Date(e.start_time)
              eventDate.setHours(0, 0, 0, 0)
              return eventDate >= now
            })
          } else {
            filteredEvents = allEvents.filter(e => {
              const eventDate = new Date(e.start_time)
              eventDate.setHours(0, 0, 0, 0)
              return eventDate < now
            })
          }
          
          // Sort events: upcoming by start_time ascending, past by start_time descending
          filteredEvents.sort((a, b) => {
            const dateA = new Date(a.start_time).getTime()
            const dateB = new Date(b.start_time).getTime()
            return filter === 'upcoming' ? dateA - dateB : dateB - dateA
          })
          
          setEvents(filteredEvents)
        } else {
          setEvents([])
        }
      } catch (error) {
        console.error('Failed to fetch events:', error)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [router, filter])

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-12">Loading...</div>
      </>
    )
  }

  // Generate timeline dates
  const getTimelineDates = () => {
    const dates = []
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    dates.push({
      label: 'Tomorrow',
      date: tomorrow,
      dayName: tomorrow.toLocaleDateString('en-US', { weekday: 'long' })
    })
    
    // Add next few days
    for (let i = 2; i <= 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      dates.push({
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' })
      })
    }
    
    return dates
  }

  const timelineDates = getTimelineDates()

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-50">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Events</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {timelineDates.map((item, index) => (
                <div key={index} className="relative flex items-start">
                  <div className="absolute left-3 w-2 h-2 bg-gray-400 rounded-full -ml-1"></div>
                  <div className="ml-8 cursor-pointer hover:text-blue-600 transition-colors">
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.dayName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex justify-end mb-6">
            <div className="flex space-x-2 bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => {
                  if (filter !== 'upcoming') {
                    setFilter('upcoming')
                  }
                }}
                disabled={isLoading}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'upcoming'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isLoading && filter === 'upcoming' ? 'Loading...' : 'Upcoming'}
              </button>
              <button
                onClick={() => {
                  if (filter !== 'past') {
                    setFilter('past')
                  }
                }}
                disabled={isLoading}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'past'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isLoading && filter === 'past' ? 'Loading...' : 'Past'}
              </button>
            </div>
          </div>

          {events.length === 0 && !isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500 mb-4">
                {filter === 'upcoming'
                  ? "You haven't registered for any upcoming events yet."
                  : "You don't have any past events."}
              </p>
              {filter === 'upcoming' && (
                <Link
                  href="/discover"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Discover Events
                </Link>
              )}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex border border-gray-100"
                >
                  {/* Time Column */}
                  <div className="w-24 flex-shrink-0 flex items-center justify-center bg-gray-50 text-gray-600 text-sm font-medium border-r border-gray-100">
                    {new Date(event.start_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 flex items-center p-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <span className="font-medium">By</span>
                        <span className="text-gray-900">Event Organizer</span>
                        <span>•</span>
                        <span>
                          {event.location_type === 'online'
                            ? 'Online'
                            : event.location_address || 'TBD'}
                        </span>
                      </div>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors">
                        Invited
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-32 h-32 flex-shrink-0 ml-6">
                      {event.cover_image_url ? (
                        <img
                          src={`${API_BASE_URL}${event.cover_image_url}`}
                          alt={event.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🎉</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {/* Right Floating Sidebar */}
        <div className="w-16 flex flex-col items-center py-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-md">
            <span className="text-xl">🥞</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-md">
            <span className="text-xs text-white font-medium">M</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-md">
            <span className="text-xl">👥</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-md">
            <span className="text-white text-xs">+</span>
          </div>
        </div>
      </div>
    </>
  )
}

