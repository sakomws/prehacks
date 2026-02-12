'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, Instagram, Twitter, Youtube, Globe, ChevronRight } from 'lucide-react'

interface HostingEvent {
  title: string
  date: string
  time: string
  organizer: string
  location: string
  thumbnail: string
}

interface PastEvent {
  title: string
  date: string
  time: string
  thumbnail: string
}

interface ProfileData {
  name: string
  bio: string
  joinDate: string
  hostedCount: number
  attendedCount: number
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [hostingEvents, setHostingEvents] = useState<HostingEvent[]>([])
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/users/1/profile')
      const profile = await response.json()

      const hosting = [
        {
          title: 'AI Startup Showcase',
          date: 'Dec 18',
          time: '7:00 PM',
          organizer: 'Sako M',
          location: 'Mission Bay Conference Center',
          thumbnail: '/events/ai-showcase.jpg'
        }
      ]

      const past = [
        {
          title: 'Founder Networking Dinner',
          date: 'Nov 15',
          time: '6:30 PM',
          thumbnail: '/events/founder-dinner.jpg'
        },
        {
          title: 'Product Management Workshop',
          date: 'Oct 22',
          time: '2:00 PM',
          thumbnail: '/events/pm-workshop.jpg'
        },
        {
          title: 'Crypto & Web3 Meetup',
          date: 'Oct 8',
          time: '7:30 PM',
          thumbnail: '/events/crypto-meetup.jpg'
        },
        {
          title: 'Design Systems Conference',
          date: 'Sep 30',
          time: '9:00 AM',
          thumbnail: '/events/design-conf.jpg'
        }
      ]
      
      setProfileData(profile)
      setHostingEvents(hosting)
      setPastEvents(past)
    } catch (error) {
      console.error('Failed to load profile data:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="space-y-8">
      {/* Profile Header */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
        </div>
      ) : profileData ? (
        <div className="text-center space-y-6">
          <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto"></div>
          
          <div>
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-2">{profileData.name}</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {profileData.bio}
            </p>
            <p className="text-sm text-gray-500 mt-2">Joined {profileData.joinDate}</p>
          </div>

          <div className="flex items-center justify-center space-x-8 text-center">
            <div>
              <div className="text-2xl font-semibold text-gray-900">{profileData.hostedCount}</div>
              <div className="text-sm text-gray-500">Hosted</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{profileData.attendedCount}</div>
              <div className="text-sm text-gray-500">Attended</div>
            </div>
          </div>

        <div className="flex items-center justify-center space-x-4">
          <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <Instagram className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <Twitter className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <Youtube className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <Globe className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      ) : null}

      <div className="border-t border-black/5"></div>

      {/* Hosting */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Hosting</h2>
        
        <div className="bg-white rounded-2xl shadow-sm border border-black/5">
          {hostingEvents.map((event, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">{event.date} • {event.time}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                  <div className="text-sm text-gray-500">By {event.organizer}</div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {event.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Events */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Past Events</h2>
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 divide-y divide-black/5">
          {pastEvents.map((event, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">{event.date} • {event.time}</div>
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}