'use client'

import { useState, useEffect } from 'react'
import EventCard from '@/components/EventCard'
import Link from 'next/link'
import { Event } from '@/types/event'
import { Calendar } from 'lucide-react'

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [activeTab])

  const loadEvents = async () => {
    setLoading(true)
    try {
      console.log('Loading events for tab:', activeTab)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8002'
      const response = await fetch(`${backendUrl}/events?type=${activeTab}`)
      const data = await response.json()
      
      console.log('Events API response:', data)
      
      // Convert API events to Event format
      const eventsData: Event[] = data.events.map((event: {
        id: string;
        title: string;
        time: string;
        dateLabel: string;
        organizer: string;
        location: string;
        attendeeCount: number;
        image: string;
      }) => ({
        id: event.id, // Use the actual database ID
        title: event.title,
        time: event.time,
        dateLabel: event.dateLabel,
        organizer: event.organizer || 'Event Organizer',
        organizerAvatar: '/avatars/organizer.jpg',
        location: event.location || 'Virtual',
        invitedCount: event.attendeeCount || Math.floor(Math.random() * 300) + 50,
        attendeesAvatars: ['/avatars/1.jpg', '/avatars/2.jpg', '/avatars/3.jpg'],
        image: event.image || '/events/default.jpg'
      }))
      
      console.log('Processed events data:', eventsData)
      setEvents(eventsData)
    } catch (error) {
      console.error('Failed to load events:', error)
      // Fallback to mock data
      loadFallbackEvents()
    } finally {
      setLoading(false)
    }
  }

  const loadFallbackEvents = () => {
    const upcomingEvents = [
      {
        id: '1',
        title: 'AI Startup Showcase',
        time: '7:00 PM',
        dateLabel: 'Dec 18',
        organizer: 'Tech Ventures',
        organizerAvatar: '/avatars/organizer.jpg',
        location: 'Mission Bay Conference Center',
        invitedCount: 156,
        attendeesAvatars: ['/avatars/1.jpg', '/avatars/2.jpg', '/avatars/3.jpg'],
        image: '/events/ai-showcase.jpg'
      },
      {
        id: '2',
        title: 'Founder Networking Dinner',
        time: '6:30 PM',
        dateLabel: 'Dec 19',
        organizer: 'Startup Community',
        organizerAvatar: '/avatars/organizer.jpg',
        location: 'The Battery SF',
        invitedCount: 89,
        attendeesAvatars: ['/avatars/1.jpg', '/avatars/2.jpg', '/avatars/3.jpg'],
        image: '/events/founder-dinner.jpg'
      },
      {
        id: '3',
        title: 'Product Management Workshop',
        time: '2:00 PM',
        dateLabel: 'Dec 20',
        organizer: 'PM Guild',
        organizerAvatar: '/avatars/organizer.jpg',
        location: 'Virtual',
        invitedCount: 234,
        attendeesAvatars: ['/avatars/1.jpg', '/avatars/2.jpg', '/avatars/3.jpg'],
        image: '/events/pm-workshop.jpg'
      }
    ]

    const pastEvents = [
      {
        id: '4',
        title: 'Crypto & Web3 Meetup',
        time: '7:30 PM',
        dateLabel: 'Nov 28',
        organizer: 'Web3 Community',
        organizerAvatar: '/avatars/organizer.jpg',
        location: 'Pier 27',
        invitedCount: 178,
        attendeesAvatars: ['/avatars/1.jpg', '/avatars/2.jpg', '/avatars/3.jpg'],
        image: '/events/crypto-meetup.jpg'
      },
      {
        id: '5',
        title: 'Design Systems Conference',
        time: '9:00 AM',
        dateLabel: 'Nov 15',
        organizer: 'Design Guild',
        organizerAvatar: '/avatars/organizer.jpg',
        location: 'Moscone Center',
        invitedCount: 445,
        attendeesAvatars: ['/avatars/1.jpg', '/avatars/2.jpg', '/avatars/3.jpg'],
        image: '/events/design-conf.jpg'
      },
      {
        id: '6',
        title: 'Climate Tech Demo Day',
        time: '4:00 PM',
        dateLabel: 'Oct 30',
        organizer: 'Climate Ventures',
        organizerAvatar: '/avatars/organizer.jpg',
        location: 'UCSF Mission Bay',
        invitedCount: 267,
        attendeesAvatars: ['/avatars/1.jpg', '/avatars/2.jpg', '/avatars/3.jpg'],
        image: '/events/climate-demo.jpg'
      }
    ]

    setEvents(activeTab === 'upcoming' ? upcomingEvents : pastEvents)
  }

  // Group events by date
  const groupedEvents = events.reduce((groups: any[], event) => {
    const existingGroup = groups.find(g => g.dateLabel === event.dateLabel)
    if (existingGroup) {
      existingGroup.events.push(event)
    } else {
      // Determine day of week based on date
      const dayMap: { [key: string]: string } = {
        'Dec 18': 'Wednesday',
        'Dec 19': 'Thursday', 
        'Dec 20': 'Friday',
        'Nov 28': 'Thursday',
        'Nov 15': 'Friday',
        'Oct 30': 'Wednesday'
      }
      groups.push({
        dateLabel: event.dateLabel,
        day: dayMap[event.dateLabel] || 'Day',
        events: [event]
      })
    }
    return groups
  }, [])

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-medium tracking-tight text-gray-900 mb-2">Events</h1>
          <p className="text-gray-600 font-light">Discover and join amazing events in your community</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link 
            href="/create"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-md"
          >
            Create Event
          </Link>
          
          <div className="flex bg-gray-100/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === 'upcoming'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === 'past'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Events List */}
      {!loading && (
        <div className="space-y-6">
          {groupedEvents.map((group) => (
            <div key={group.dateLabel} className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h2 className="text-lg font-medium text-gray-900">{group.dateLabel}</h2>
                  <span className="text-sm text-gray-500 font-light">{group.day}</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
              </div>
              
              <div className="space-y-4">
                {group.events.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <EventCard 
                      event={event} 
                      showOrganizerControls={event.organizer === 'Sako M'} // Demo: show for current user
                      onEventDeleted={loadEvents}
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming events' : 'No past events'}
          </h3>
          <p className="text-gray-500 font-light">
            {activeTab === 'upcoming' 
              ? 'Check back later for new events or create your own' 
              : 'Events you\'ve attended will appear here'
            }
          </p>
        </div>
      )}

      {/* Tab Content Info */}
      {!loading && events.length > 0 && (
        <div className="text-center py-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 font-light">
            Showing {events.length} {activeTab} event{events.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}