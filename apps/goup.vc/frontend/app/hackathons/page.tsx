'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Users, Trophy, Clock, Plus, Filter, Search, Zap, Code, Palette, Lightbulb } from 'lucide-react'

interface Hackathon {
  id: number
  title: string
  description: string
  theme?: string
  hackathon_type: 'internal' | 'public'
  format: 'in_person' | 'virtual' | 'hybrid'
  status: string
  start_date: string
  end_date: string
  location?: string
  virtual_platform?: string
  max_participants?: number
  participant_count: number
  team_count: number
  submission_count: number
  cover_image_url?: string
  organizer: {
    full_name: string
    avatar_url?: string
  }
  tracks: Array<{
    id: number
    name: string
    color: string
    icon: string
  }>
  prizes: Array<{
    name: string
    value?: string
    position: number
  }>
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'in_progress' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadHackathons()
  }, [filter])

  const loadHackathons = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter === 'upcoming' ? 'published' : filter)
      }
      
      let hackathonsLoaded = false
      
      // Try backend API first
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
        const response = await fetch(`${backendUrl}/hackathons/?${params}`)
        
        if (response.ok) {
          const data = await response.json()
          
          // Merge with local hackathons
          const localHackathons = JSON.parse(localStorage.getItem('local_hackathons') || '[]')
          const allHackathons = [...(data.hackathons || []), ...localHackathons]
          
          setHackathons(allHackathons)
          hackathonsLoaded = true
        }
      } catch (apiError) {
        console.log('Backend API not available, loading local hackathons...')
      }
      
      // Fallback to localStorage + mock data if API didn't work
      if (!hackathonsLoaded) {
        const localHackathons = JSON.parse(localStorage.getItem('local_hackathons') || '[]')
        const mockHackathons = [
        {
          id: 1,
          title: "AI Innovation Challenge 2024",
          description: "Build the next generation of AI applications that solve real-world problems. Focus on practical implementations with measurable impact.",
          theme: "AI for Good",
          hackathon_type: "public",
          format: "hybrid",
          status: "registration_open",
          start_date: "2024-12-20T09:00:00Z",
          end_date: "2024-12-22T18:00:00Z",
          location: "San Francisco, CA",
          virtual_platform: "Discord",
          max_participants: 200,
          participant_count: 156,
          team_count: 42,
          submission_count: 0,
          cover_image_url: "/hackathons/ai-challenge.jpg",
          organizer: {
            full_name: "Tech Innovators",
            avatar_url: "/avatars/tech-innovators.jpg"
          },
          tracks: [
            { id: 1, name: "AI/ML", color: "#8B5CF6", icon: "🤖" },
            { id: 2, name: "Healthcare", color: "#10B981", icon: "🏥" },
            { id: 3, name: "Climate", color: "#059669", icon: "🌱" }
          ],
          prizes: [
            { name: "Grand Prize", value: "$10,000", position: 1 },
            { name: "Runner Up", value: "$5,000", position: 2 },
            { name: "People's Choice", value: "$2,500", position: 3 }
          ]
        },
        {
          id: 2,
          title: "Fintech Revolution Hackathon",
          description: "Reimagine the future of financial services. Build solutions that make finance more accessible, secure, and user-friendly.",
          theme: "Financial Inclusion",
          hackathon_type: "public",
          format: "in_person",
          status: "in_progress",
          start_date: "2024-12-15T09:00:00Z",
          end_date: "2024-12-17T18:00:00Z",
          location: "New York, NY",
          max_participants: 150,
          participant_count: 134,
          team_count: 38,
          submission_count: 25,
          cover_image_url: "/hackathons/fintech.jpg",
          organizer: {
            full_name: "FinTech Alliance",
            avatar_url: "/avatars/fintech-alliance.jpg"
          },
          tracks: [
            { id: 4, name: "Payments", color: "#3B82F6", icon: "💳" },
            { id: 5, name: "DeFi", color: "#F59E0B", icon: "🪙" },
            { id: 6, name: "RegTech", color: "#EF4444", icon: "📊" }
          ],
          prizes: [
            { name: "Winner", value: "$15,000", position: 1 },
            { name: "Second Place", value: "$7,500", position: 2 }
          ]
        },
        {
          id: 4,
          title: "AI for Good Hackathon 2024",
          description: "Build innovative AI solutions that address real-world social and environmental challenges. Join developers, designers, and domain experts to create technology that makes a positive impact on society.",
          theme: "Artificial Intelligence for Social Impact",
          hackathon_type: "public",
          format: "hybrid",
          status: "registration_open",
          start_date: "2024-12-20T09:00:00Z",
          end_date: "2024-12-22T18:00:00Z",
          location: "San Francisco, CA",
          virtual_platform: "Discord",
          max_participants: 200,
          participant_count: 156,
          team_count: 0,
          submission_count: 0,
          cover_image_url: "/hackathons/ai-for-good.jpg",
          organizer: {
            full_name: "TechForGood Foundation",
            avatar_url: "/avatars/techforgood.jpg"
          },
          tracks: [
            { id: 10, name: "Healthcare", color: "#10B981", icon: "🏥" },
            { id: 11, name: "Climate", color: "#059669", icon: "🌱" },
            { id: 12, name: "Education", color: "#8B5CF6", icon: "📚" },
            { id: 13, name: "Social Justice", color: "#EF4444", icon: "⚖️" }
          ],
          prizes: [
            { name: "Grand Prize", value: "$20,000", position: 1 },
            { name: "Runner Up", value: "$12,000", position: 2 },
            { name: "Third Place", value: "$8,000", position: 3 },
            { name: "Best Social Impact", value: "$5,000", position: 4 }
          ]
        },
        {
          id: 3,
          title: "Sustainable Tech Challenge",
          description: "Create technology solutions that address environmental challenges and promote sustainability across industries.",
          theme: "Green Innovation",
          hackathon_type: "public",
          format: "virtual",
          status: "completed",
          start_date: "2024-11-10T09:00:00Z",
          end_date: "2024-11-12T18:00:00Z",
          virtual_platform: "Zoom + Slack",
          max_participants: 300,
          participant_count: 287,
          team_count: 76,
          submission_count: 68,
          cover_image_url: "/hackathons/sustainable-tech.jpg",
          organizer: {
            full_name: "Green Tech Collective",
            avatar_url: "/avatars/green-tech.jpg"
          },
          tracks: [
            { id: 7, name: "Energy", color: "#F59E0B", icon: "⚡" },
            { id: 8, name: "Agriculture", color: "#10B981", icon: "🌾" },
            { id: 9, name: "Transportation", color: "#6366F1", icon: "🚗" }
          ],
          prizes: [
            { name: "Grand Prize", value: "$12,000", position: 1 },
            { name: "Innovation Award", value: "$6,000", position: 2 },
            { name: "Impact Award", value: "$3,000", position: 3 }
          ]
        }
      ]
      
        setHackathons([...localHackathons, ...mockHackathons])
      }
    } catch (error) {
      console.error('Failed to load hackathons:', error)
      // Final fallback to empty array
      setHackathons([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'judging':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registration_open':
        return 'Registration Open'
      case 'in_progress':
        return 'In Progress'
      case 'judging':
        return 'Judging Phase'
      case 'completed':
        return 'Completed'
      default:
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'in_person':
        return <MapPin className="w-4 h-4" />
      case 'virtual':
        return <Zap className="w-4 h-4" />
      case 'hybrid':
        return <Users className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const filteredHackathons = (hackathons || []).filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hackathon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hackathon.theme?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    
    const statusMatch = filter === 'upcoming' 
      ? ['draft', 'published', 'registration_open'].includes(hackathon.status)
      : hackathon.status === filter
    
    return matchesSearch && statusMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-4xl font-medium tracking-tight text-gray-900 mb-2">
            Hackathons
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Join innovative challenges and build the future
          </p>
        </div>
        
        <Link 
          href="/hackathons/create"
          className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Host Hackathon</span>
        </Link>
      </section>

      {/* Filters and Search */}
      <section className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search hackathons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'in_progress', label: 'Active' },
              { key: 'completed', label: 'Completed' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Hackathons Grid */}
      <section>
        {filteredHackathons.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hackathons found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to host a hackathon!'}
            </p>
            <Link 
              href="/hackathons/create"
              className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Host Hackathon</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHackathons.map((hackathon) => (
              <Link key={hackathon.id} href={`/hackathons/${hackathon.id}`}>
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                  {/* Cover Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative">
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(hackathon.status)}`}>
                        {getStatusText(hackathon.status)}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/80 text-gray-700">
                        {hackathon.hackathon_type === 'public' ? '🌍 Public' : '🏢 Internal'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Title and Theme */}
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {hackathon.title}
                      </h3>
                      {hackathon.theme && (
                        <p className="text-sm text-blue-600 font-medium">
                          Theme: {hackathon.theme}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {hackathon.description}
                    </p>

                    {/* Tracks */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(hackathon.tracks || []).slice(0, 3).map((track) => (
                        <span
                          key={track.id}
                          className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: `${track.color}20`, color: track.color }}
                        >
                          <span className="mr-1">{track.icon}</span>
                          {track.name}
                        </span>
                      ))}
                      {(hackathon.tracks || []).length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                          +{(hackathon.tracks || []).length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {getFormatIcon(hackathon.format)}
                        <span>
                          {hackathon.format === 'in_person' && hackathon.location}
                          {hackathon.format === 'virtual' && hackathon.virtual_platform}
                          {hackathon.format === 'hybrid' && `${hackathon.location} + Virtual`}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{hackathon.participant_count} participants</span>
                        {hackathon.team_count > 0 && (
                          <span>• {hackathon.team_count} teams</span>
                        )}
                      </div>
                    </div>

                    {/* Prizes */}
                    {(hackathon.prizes || []).length > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-700 font-medium">
                          {hackathon.prizes[0]?.value || 'Prizes available'}
                        </span>
                      </div>
                    )}

                    {/* Progress Bar for Active Hackathons */}
                    {hackathon.status === 'in_progress' && hackathon.submission_count > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Submissions</span>
                          <span>{hackathon.submission_count}/{hackathon.team_count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(hackathon.submission_count / hackathon.team_count) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      {filteredHackathons.length > 0 && (
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Lightbulb className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-semibold text-gray-900">Ready to innovate?</h2>
          </div>
          <p className="text-xl text-gray-600 font-light mb-8 max-w-2xl mx-auto">
            Join a hackathon to build amazing projects, learn new skills, and connect with fellow innovators.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              href="/hackathons/create"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-medium text-lg transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Host Your Hackathon
            </Link>
            <Link 
              href="/hackathons?filter=upcoming"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Browse Upcoming Events
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}