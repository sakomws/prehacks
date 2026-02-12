'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Clock, 
  MapPin, 
  Users, 
  Calendar,
  Share2,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Brain,
  Car,
  MessageSquare,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Crown,
  X
} from 'lucide-react'
import AudienceGuidance from '@/components/AudienceGuidance'
import EventRSVP from '@/components/EventRSVP'
import AttendeesList from '@/components/AttendeesList'

interface EventDetails {
  id: string
  title: string
  description: string
  tldr: string
  startTime: string
  endTime: string
  location: string
  organizer: {
    name: string
    bio: string
    avatar: string
    expertise: string[]
    hostingStyle: string
  }
  attendeeCount: number
  capacity: number
  userStatus: 'attending' | 'not_attending' | 'maybe'
  aiInsights: {
    matchesInterests: string[]
    expectedFormat: string
    avgDuration: string
    recommendation: string
    fitScore: number
    warnings: string[]
  }
  agenda: {
    time: string
    activity: string
  }[]
  locationTips: {
    bestArrivalTime: string
    parkingInfo: string
    venueNotes: string
  }
  preparation: {
    title: string
    description: string
    timeNeeded: string
  }[]
}

export default function EventDetailsPage() {
  const params = useParams()
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [timeUntilEvent, setTimeUntilEvent] = useState('')

  useEffect(() => {
    loadEventDetails()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [params.id])

  const loadEventDetails = async () => {
    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8002'
      const response = await fetch(`${backendUrl}/events/${params.id}`)
      const eventData: EventDetails = await response.json()
      
      setEvent(eventData)
    } catch (error) {
      console.error('Failed to load event details:', error)
      // Fallback to mock data
      const eventData: EventDetails = {
        id: params.id as string,
        title: 'Tax Season Prep: IRS Updates & Deductions Workshop',
        description: 'Join us for a comprehensive tax preparation session with CPA candidate Vusal Ibrahimli. We\'ll cover the latest IRS updates, deduction strategies, and answer your tax-related questions. This is an informational session designed to help you prepare for the upcoming tax season. Light refreshments including tea and desserts will be provided. The session will be conducted in English with some explanations available in other languages as needed. Please bring any specific tax questions you\'d like addressed during the Q&A portion.',
        tldr: 'A relaxed in-person tax info session with CPA candidate Vusal Ibrahimli, focused on IRS updates, deductions, and tax-season prep. Tea & light desserts provided.',
        startTime: '2024-12-18T17:30:00Z',
        endTime: '2024-12-18T19:15:00Z',
        location: 'Redwood City Public Library – Downtown',
        organizer: {
          name: 'Vusal Ibrahimli',
          bio: 'CPA candidate specializing in individual tax preparation and small business accounting.',
          avatar: '/avatars/vusal.jpg',
          expertise: ['Individual Taxes', 'IRS Updates', 'Deduction Strategies'],
          hostingStyle: 'Educational, practical, Q&A focused'
        },
        attendeeCount: 23,
        capacity: 40,
        userStatus: 'attending',
        aiInsights: {
          matchesInterests: ['Community', 'Finance'],
          expectedFormat: 'Talk + Q&A (low networking pressure)',
          avgDuration: '~1.5h',
          recommendation: 'Worth attending if you have tax questions this year',
          fitScore: 85,
          warnings: ['This is informational, not 1:1 consulting']
        },
        agenda: [
          { time: '5:30 PM', activity: 'Welcome & introductions' },
          { time: '5:40 PM', activity: 'Tax season overview' },
          { time: '6:10 PM', activity: 'IRS updates & deductions' },
          { time: '6:45 PM', activity: 'Q&A session' },
          { time: '7:15 PM', activity: 'Wrap-up & networking' }
        ],
        locationTips: {
          bestArrivalTime: '5:15–5:25 PM',
          parkingInfo: 'Parking usually available nearby after 5 PM',
          venueNotes: 'Quiet venue — conversations stay respectful'
        },
        preparation: [
          {
            title: 'Add 1 tax question you want answered',
            description: 'Think of a specific tax situation you\'d like clarity on',
            timeNeeded: '1 min'
          },
          {
            title: 'Save location (parking info available)',
            description: 'Get directions and parking details',
            timeNeeded: '30 sec'
          },
          {
            title: 'Enable reminder 30 mins before',
            description: 'Get notified when it\'s time to leave',
            timeNeeded: '10 sec'
          }
        ]
      }
      
      setEvent(eventData)
    } finally {
      setLoading(false)
    }
  }

  const updateCountdown = () => {
    if (!event) return
    
    const now = new Date()
    const eventStart = new Date(event.startTime)
    const diff = eventStart.getTime() - now.getTime()
    
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      setTimeUntilEvent(`${days}d ${hours}h`)
    } else {
      setTimeUntilEvent('Event started')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Event not found</h2>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* AI Event Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-lg font-semibold text-gray-900">You're attending</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Starts in {timeUntilEvent}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium mb-2">AI says:</p>
                {event.aiInsights ? (
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• This event matches your interests: {event.aiInsights.matchesInterests?.join(' + ') || 'Loading...'}</li>
                    <li>• Expected format: {event.aiInsights.expectedFormat || 'Loading...'}</li>
                    <li>• Avg. duration people stay: {event.aiInsights.avgDuration || 'Loading...'}</li>
                  </ul>
                ) : (
                  <p className="text-sm text-blue-800">Loading AI insights...</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Event Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
          
          {/* AI-generated TL;DR */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="bg-gray-200 rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                TL;DR
              </div>
              <p className="text-gray-800 flex-1">{event.tldr}</p>
            </div>
          </div>

          {/* Event Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {new Date(event.startTime).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(event.startTime).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })} - {new Date(event.endTime).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{event.location}</p>
                <p className="text-sm text-gray-500">In-person event</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{event.attendeeCount} attending</p>
                <p className="text-sm text-gray-500">
                  {event.capacity ? `${event.capacity - event.attendeeCount} spots left` : 'Unlimited capacity'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Add to Calendar</span>
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Invite a Friend</span>
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
            
            {/* Organizer Controls - Demo: Show for user ID 1 */}
            <div className="flex items-center space-x-3">
              <Link 
                href={`/events/${event.id}/manage`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Event</span>
              </Link>
            </div>
          </div>
          
          {/* Demo: Post-Event Experience Link */}
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800 mb-2">Demo: See post-event experience</p>
            <Link 
              href={`/events/${event.id}/feedback`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <span>View Post-Event Page</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Event Fit Check */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">AI Event Fit Check</h2>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">You like community meetups</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">You attended similar sessions before</span>
                </div>
                {event.aiInsights.warnings.map((warning, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-700">{warning}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-green-800 font-medium">
                  Recommendation: {event.aiInsights.recommendation}
                </p>
              </div>
            </div>

            {/* Smart Agenda */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Likely agenda</h2>
              <div className="space-y-3">
                {event.agenda.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-sm font-medium text-gray-600">{item.time}</div>
                    <div className="flex-1 text-gray-900">{item.activity}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audience-Aware Personalization */}
            <AudienceGuidance 
              userType="community_builder" 
              eventType="educational"
            />

            {/* Full Description (Collapsible) */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="text-xl font-semibold text-gray-900">Full Description</h2>
                {showFullDescription ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {showFullDescription && (
                <div className="mt-4 text-gray-700 leading-relaxed">
                  {event.description}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* RSVP Component */}
            <EventRSVP 
              eventId={event.id}
              userStatus="not_attending" // Demo: would come from user data
              onRSVPUpdate={(status) => console.log('RSVP updated:', status)}
            />
            
            {/* Attendees List */}
            <AttendeesList 
              eventId={event.id}
              userStatus="attending" // Demo: show as attending to see the list
              isOrganizer={false} // Demo: set to true to test organizer view
            />
            
            {/* Host Intelligence Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the speaker</h3>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">{event.organizer.name}</p>
                  <p className="text-sm text-gray-500">Event Host</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {event.organizer.expertise.map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Hosting Style</p>
                  <p className="text-sm text-gray-600">{event.organizer.hostingStyle}</p>
                </div>
              </div>
            </div>

            {/* Arrival Assistant */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Arrival Assistant</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Best arrival time</p>
                  <p className="text-sm text-gray-600">{event.locationTips.bestArrivalTime}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Parking</p>
                  <p className="text-sm text-gray-600">{event.locationTips.parkingInfo}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Venue notes</p>
                  <p className="text-sm text-gray-600">{event.locationTips.venueNotes}</p>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
                <Car className="w-4 h-4" />
                <span>Get Directions</span>
              </button>
            </div>

            {/* AI Prepare for Event */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Get ready <span className="text-sm font-normal text-gray-500">(2 mins)</span>
              </h3>
              
              <div className="space-y-3">
                {event.preparation.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.timeNeeded}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Thread */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Event Updates</h3>
              </div>
              
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">Auto-muted until 24h before event</p>
                <p className="text-xs text-gray-400">You'll be notified of important updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}