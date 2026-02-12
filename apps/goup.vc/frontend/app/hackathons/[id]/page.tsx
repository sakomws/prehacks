'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  DollarSign,
  Star,
  Share2,
  Heart,
  Bookmark,
  ExternalLink,
  Github,
  Globe,
  Award,
  Target,
  Code,
  Lightbulb,
  Zap,
  CheckCircle,
  AlertCircle,
  User,
  MessageSquare,
  Eye,
  ThumbsUp,
  Smartphone,
  Send,
  Building2,
  UserCheck
} from 'lucide-react'
import { whatsappIntegration } from '@/lib/whatsapp-integration'
import WhatsAppCommunityList from '@/components/WhatsAppCommunityList'

interface Hackathon {
  id: number
  title: string
  description: string
  theme: string
  start_date: string
  end_date: string
  location: string
  type: 'in-person' | 'virtual' | 'hybrid'
  status: 'upcoming' | 'ongoing' | 'completed'
  max_participants: number
  registered_participants: number
  prize_pool: number
  organizer: {
    name: string
    avatar: string
    company: string
  }
  sponsors: {
    name: string
    logo?: string
    tier: 'title' | 'platinum' | 'gold' | 'silver' | 'bronze'
    website?: string
    description?: string
    contribution?: string
  }[]
  tracks: {
    id: number
    name: string
    description: string
    color: string
    icon: string
    max_team_size: number
    submission_requirements: string[]
    judging_criteria: {
      name: string
      weight: number
      description: string
    }[]
  }[]
  judges: {
    name: string
    avatar: string
    title: string
    company: string
  }[]
  team: {
    name: string
    avatar?: string
    role: 'organizer' | 'coordinator' | 'mentor' | 'volunteer' | 'speaker'
    title?: string
    company?: string
    bio?: string
    linkedin?: string
    twitter?: string
  }[]
  schedule: {
    time: string
    event: string
    description: string
  }[]
  requirements: string[]
  prizes: {
    place: string
    amount: number
    description: string
  }[]
  submissions?: {
    id: number
    team_name: string
    project_name: string
    description: string
    members: string[]
    demo_url?: string
    github_url?: string
    votes: number
    created_at: string
  }[]
}

const MOCK_HACKATHON: Hackathon = {
  id: 4,
  title: "AI for Good Hackathon 2024",
  description: "Build innovative AI solutions that address real-world social and environmental challenges. Join developers, designers, and domain experts to create technology that makes a positive impact on society.",
  theme: "Artificial Intelligence for Social Impact",
  start_date: "2024-12-20T09:00:00Z",
  end_date: "2024-12-22T18:00:00Z",
  location: "San Francisco, CA",
  type: "hybrid",
  status: "upcoming",
  max_participants: 200,
  registered_participants: 156,
  prize_pool: 50000,
  organizer: {
    name: "TechForGood Foundation",
    avatar: "/organizers/techforgood.jpg",
    company: "Non-profit"
  },
  sponsors: [
    {
      name: "Google",
      tier: "title",
      website: "https://google.com",
      description: "Leading technology company focused on AI and cloud computing",
      contribution: "Cloud credits and AI/ML APIs"
    },
    {
      name: "Microsoft",
      tier: "platinum",
      website: "https://microsoft.com",
      description: "Global technology leader in productivity and cloud services",
      contribution: "Azure credits and development tools"
    },
    {
      name: "OpenAI",
      tier: "gold",
      website: "https://openai.com",
      description: "AI research and deployment company",
      contribution: "API credits and technical mentorship"
    },
    {
      name: "Anthropic",
      tier: "gold",
      website: "https://anthropic.com",
      description: "AI safety company focused on beneficial AI",
      contribution: "Claude API access and safety guidance"
    },
    {
      name: "Meta",
      tier: "silver",
      website: "https://meta.com",
      description: "Social technology company building the metaverse",
      contribution: "Developer tools and platform access"
    }
  ],
  tracks: [
    {
      id: 1,
      name: "Healthcare & Accessibility",
      description: "Build AI solutions to improve healthcare access and outcomes",
      color: "#10B981",
      icon: "🏥",
      max_team_size: 5,
      submission_requirements: ["Working prototype", "Demo video", "Impact analysis"],
      judging_criteria: [
        { name: "Innovation", weight: 0.3, description: "How innovative is the solution?" },
        { name: "Impact", weight: 0.4, description: "Potential to improve healthcare access" },
        { name: "Technical Quality", weight: 0.3, description: "Quality of implementation" }
      ]
    },
    {
      id: 2,
      name: "Climate & Environment",
      description: "Create technology solutions for environmental challenges",
      color: "#059669",
      icon: "🌍",
      max_team_size: 4,
      submission_requirements: ["Working prototype", "Environmental impact report"],
      judging_criteria: [
        { name: "Environmental Impact", weight: 0.4, description: "Potential environmental benefit" },
        { name: "Scalability", weight: 0.3, description: "Can this solution scale globally?" },
        { name: "Innovation", weight: 0.3, description: "Novel approach to the problem" }
      ]
    },
    {
      id: 3,
      name: "Education & Learning",
      description: "Develop AI tools to enhance education and learning experiences",
      color: "#3B82F6",
      icon: "📚",
      max_team_size: 4,
      submission_requirements: ["Educational demo", "User testing results"],
      judging_criteria: [
        { name: "Educational Value", weight: 0.4, description: "How much does this improve learning?" },
        { name: "User Experience", weight: 0.3, description: "Ease of use for learners" },
        { name: "Innovation", weight: 0.3, description: "Creative approach to education" }
      ]
    },
    {
      id: 4,
      name: "Social Justice & Equity",
      description: "Address social inequalities through technology solutions",
      color: "#8B5CF6",
      icon: "⚖️",
      max_team_size: 5,
      submission_requirements: ["Social impact analysis", "Community feedback"],
      judging_criteria: [
        { name: "Social Impact", weight: 0.5, description: "Potential to address inequality" },
        { name: "Community Engagement", weight: 0.3, description: "Involvement of affected communities" },
        { name: "Feasibility", weight: 0.2, description: "Realistic implementation plan" }
      ]
    },
    {
      id: 5,
      name: "Economic Empowerment",
      description: "Create tools to improve economic opportunities and financial inclusion",
      color: "#F59E0B",
      icon: "💰",
      max_team_size: 4,
      submission_requirements: ["Business model", "Financial impact projection"],
      judging_criteria: [
        { name: "Economic Impact", weight: 0.4, description: "Potential to create economic opportunities" },
        { name: "Sustainability", weight: 0.3, description: "Long-term viability" },
        { name: "Innovation", weight: 0.3, description: "Novel approach to economic challenges" }
      ]
    }
  ],
  judges: [
    {
      name: "Dr. Sarah Chen",
      avatar: "/judges/sarah.jpg",
      title: "AI Research Director",
      company: "Google"
    },
    {
      name: "Marcus Johnson",
      avatar: "/judges/marcus.jpg", 
      title: "VP of Engineering",
      company: "OpenAI"
    },
    {
      name: "Lisa Rodriguez",
      avatar: "/judges/lisa.jpg",
      title: "Head of AI Ethics",
      company: "Microsoft"
    }
  ],
  team: [
    {
      name: "Alex Thompson",
      role: "organizer",
      title: "Event Director",
      company: "TechForGood Foundation",
      bio: "Experienced event organizer with 10+ years in tech conferences and hackathons",
      linkedin: "https://linkedin.com/in/alexthompson",
      twitter: "https://twitter.com/alexthompson"
    },
    {
      name: "Maria Garcia",
      role: "coordinator",
      title: "Program Manager",
      company: "TechForGood Foundation",
      bio: "Specializes in community building and participant experience",
      linkedin: "https://linkedin.com/in/mariagarcia"
    },
    {
      name: "Dr. James Wilson",
      role: "mentor",
      title: "Senior AI Researcher",
      company: "Stanford University",
      bio: "AI researcher with expertise in machine learning and ethics",
      linkedin: "https://linkedin.com/in/jameswilson"
    },
    {
      name: "Sarah Kim",
      role: "mentor",
      title: "Product Manager",
      company: "Google",
      bio: "Product leader focused on AI applications for social good",
      linkedin: "https://linkedin.com/in/sarahkim"
    },
    {
      name: "David Chen",
      role: "speaker",
      title: "Keynote Speaker",
      company: "OpenAI",
      bio: "Leading voice in AI safety and beneficial AI development",
      twitter: "https://twitter.com/davidchen"
    },
    {
      name: "Emily Rodriguez",
      role: "volunteer",
      title: "Community Volunteer",
      company: "Local Tech Community",
      bio: "Passionate about supporting hackathon participants and fostering innovation"
    },
    {
      name: "Michael Brown",
      role: "coordinator",
      title: "Technical Coordinator",
      company: "TechForGood Foundation",
      bio: "Ensures smooth technical operations and infrastructure support"
    }
  ],
  schedule: [
    {
      time: "9:00 AM",
      event: "Registration & Welcome",
      description: "Check-in, breakfast, and opening ceremony"
    },
    {
      time: "10:00 AM", 
      event: "Keynote: AI for Social Impact",
      description: "Inspiring talk about using AI to solve global challenges"
    },
    {
      time: "11:00 AM",
      event: "Team Formation & Ideation",
      description: "Find your team and brainstorm project ideas"
    },
    {
      time: "12:00 PM",
      event: "Hacking Begins!",
      description: "Start building your AI solution"
    },
    {
      time: "6:00 PM",
      event: "Dinner & Networking",
      description: "Fuel up and connect with other participants"
    },
    {
      time: "10:00 AM (Day 2)",
      event: "Mentor Office Hours",
      description: "Get guidance from industry experts"
    },
    {
      time: "2:00 PM (Day 3)",
      event: "Project Submissions Due",
      description: "Submit your final project and demo"
    },
    {
      time: "3:00 PM (Day 3)",
      event: "Presentations & Judging",
      description: "Present your solution to the judges"
    },
    {
      time: "5:00 PM (Day 3)",
      event: "Awards Ceremony",
      description: "Celebrate winners and closing remarks"
    }
  ],
  requirements: [
    "Teams of 2-5 people (individuals welcome, we'll help you find a team)",
    "Must use AI/ML technology as a core component",
    "Project must address a social or environmental challenge",
    "All code must be original work created during the hackathon",
    "Final submission must include working demo and source code",
    "Must be present for final presentations (virtual presentations allowed)"
  ],
  prizes: [
    {
      place: "1st Place",
      amount: 20000,
      description: "Grand prize winner + mentorship program"
    },
    {
      place: "2nd Place", 
      amount: 12000,
      description: "Runner-up prize + startup resources"
    },
    {
      place: "3rd Place",
      amount: 8000,
      description: "Third place + cloud credits"
    },
    {
      place: "Best Social Impact",
      amount: 5000,
      description: "Most impactful solution for society"
    },
    {
      place: "Best Technical Innovation",
      amount: 5000,
      description: "Most innovative use of AI technology"
    }
  ],
  submissions: [
    {
      id: 1,
      team_name: "EcoAI",
      project_name: "Carbon Footprint Optimizer",
      description: "AI-powered platform that helps individuals and businesses reduce their carbon footprint through personalized recommendations and real-time tracking.",
      members: ["Alice Chen", "Bob Wilson", "Carol Davis"],
      demo_url: "https://ecoai-demo.com",
      github_url: "https://github.com/ecoai/carbon-optimizer",
      votes: 47,
      created_at: "2024-12-22T14:30:00Z"
    },
    {
      id: 2,
      team_name: "HealthGuard",
      project_name: "Medical Diagnosis Assistant",
      description: "AI system that helps healthcare workers in underserved areas diagnose common diseases using smartphone cameras and symptom analysis.",
      members: ["David Kim", "Emma Rodriguez", "Frank Zhang", "Grace Liu"],
      demo_url: "https://healthguard-demo.com",
      github_url: "https://github.com/healthguard/diagnosis-ai",
      votes: 52,
      created_at: "2024-12-22T14:15:00Z"
    },
    {
      id: 3,
      team_name: "EduBot",
      project_name: "Personalized Learning Assistant",
      description: "AI tutor that adapts to individual learning styles and provides personalized education content for students in remote areas.",
      members: ["Helen Park", "Ivan Petrov"],
      demo_url: "https://edubot-demo.com",
      votes: 38,
      created_at: "2024-12-22T13:45:00Z"
    }
  ]
}

export default function HackathonDetailPage() {
  const params = useParams()
  const [hackathon, setHackathon] = useState<Hackathon>(MOCK_HACKATHON)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'submissions' | 'judges' | 'sponsors' | 'team'>('overview')
  const [isRegistered, setIsRegistered] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showWhatsAppSync, setShowWhatsAppSync] = useState(false)
  const [syncingToWhatsApp, setSyncingToWhatsApp] = useState(false)

  useEffect(() => {
    loadHackathon()
  }, [params.id])

  const loadHackathon = async () => {
    try {
      const hackathonId = params.id as string
      
      // Try to load from backend API first
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
        const response = await fetch(`${backendUrl}/hackathons/${hackathonId}`)
        
        if (response.ok) {
          const data = await response.json()
          setHackathon(data)
          return
        }
      } catch (apiError) {
        console.log('Backend API not available, trying localStorage...')
      }
      
      // Fallback to localStorage
      const localHackathon = localStorage.getItem(`hackathon_${hackathonId}`)
      if (localHackathon) {
        const parsedHackathon = JSON.parse(localHackathon)
        setHackathon(parsedHackathon)
        return
      }
      
      // Final fallback to mock data
      setHackathon(MOCK_HACKATHON)
    } catch (error) {
      console.error('Failed to load hackathon:', error)
      setHackathon(MOCK_HACKATHON)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual':
        return <Globe className="w-4 h-4" />
      case 'in-person':
        return <MapPin className="w-4 h-4" />
      case 'hybrid':
        return <Zap className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const handleRegister = () => {
    setIsRegistered(!isRegistered)
    if (!isRegistered) {
      setHackathon(prev => ({
        ...prev,
        registered_participants: prev.registered_participants + 1
      }))
    } else {
      setHackathon(prev => ({
        ...prev,
        registered_participants: prev.registered_participants - 1
      }))
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleWhatsAppSync = async (communityId: string) => {
    setSyncingToWhatsApp(true)
    try {
      const success = await whatsappIntegration.syncHackathonToCommunity(hackathon.id, communityId)
      if (success) {
        alert('Hackathon successfully shared to WhatsApp community!')
      } else {
        alert('Failed to share hackathon. Please try again.')
      }
    } catch (error) {
      console.error('WhatsApp sync failed:', error)
      alert('Failed to share hackathon. Please try again.')
    } finally {
      setSyncingToWhatsApp(false)
      setShowWhatsAppSync(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <section className="flex items-center justify-between">
        <Link 
          href="/hackathons"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Hackathons</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleBookmark}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked ? 'text-yellow-600 bg-yellow-100' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </section>

      {/* Hackathon Header */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 relative">
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(hackathon.status)}`}>
              {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
              {getTypeIcon(hackathon.type)}
              <span className="capitalize">{hackathon.type}</span>
            </span>
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
            <div className="flex-1 mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{hackathon.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{hackathon.theme}</p>
              <p className="text-gray-700 leading-relaxed max-w-3xl">{hackathon.description}</p>
            </div>

            <div className="flex flex-col space-y-4 lg:ml-8">
              <button
                onClick={handleRegister}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-colors ${
                  isRegistered
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isRegistered ? 'Registered ✓' : 'Register Now'}
              </button>
              
              <button
                onClick={() => setShowWhatsAppSync(true)}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Smartphone className="w-5 h-5" />
                <span>Share to WhatsApp</span>
              </button>
              
              <div className="text-center text-sm text-gray-600">
                {hackathon.registered_participants} / {hackathon.max_participants} registered
              </div>
            </div>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-blue-500" />
              <div>
                <div className="font-medium text-gray-900">Start Date</div>
                <div className="text-sm text-gray-600">{formatDate(hackathon.start_date)}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-medium text-gray-900">Duration</div>
                <div className="text-sm text-gray-600">3 Days</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-purple-500" />
              <div>
                <div className="font-medium text-gray-900">Location</div>
                <div className="text-sm text-gray-600">{hackathon.location}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <div>
                <div className="font-medium text-gray-900">Prize Pool</div>
                <div className="text-sm text-gray-600">{formatCurrency(hackathon.prize_pool)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center p-6 border-b border-gray-100">
          <div className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: Eye },
              { key: 'schedule', label: 'Schedule', icon: Calendar },
              { key: 'submissions', label: 'Submissions', icon: Code },
              { key: 'judges', label: 'Judges', icon: Award },
              { key: 'sponsors', label: 'Sponsors', icon: Building2 },
              { key: 'team', label: 'Team', icon: UserCheck }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Tracks */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Challenge Tracks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(hackathon.tracks || []).map((track, index) => (
                    <div key={track.id || index} className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-2xl">{track.icon || '🎯'}</div>
                        <h4 className="font-medium text-gray-900">{track.name}</h4>
                      </div>
                      {track.description && (
                        <p className="text-sm text-gray-600 mb-3">{track.description}</p>
                      )}
                      <div className="text-xs text-gray-500">
                        Max team size: {track.max_team_size} members
                      </div>
                    </div>
                  ))}}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Requirements</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <ul className="space-y-3">
                    {(hackathon.requirements || []).map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Prizes */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Prizes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(hackathon.prizes || []).map((prize, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-yellow-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{prize.place}</h4>
                      <div className="text-2xl font-bold text-green-600 mb-2">{formatCurrency(prize.amount)}</div>
                      <p className="text-sm text-gray-600">{prize.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sponsors */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Sponsors</h3>
                <div className="flex flex-wrap items-center gap-6">
                  {(hackathon.sponsors || []).map((sponsor, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg px-6 py-3">
                      <span className="font-medium text-gray-900">{sponsor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Event Schedule</h3>
              <div className="space-y-4">
                {(hackathon.schedule || []).map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-20 text-sm font-medium text-blue-600 flex-shrink-0">
                      {item.time}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{item.event}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">Project Submissions</h3>
                <span className="text-sm text-gray-600">
                  {hackathon.submissions?.length || 0} submissions
                </span>
              </div>
              
              {hackathon.submissions && hackathon.submissions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {hackathon.submissions.map((submission) => (
                    <div key={submission.id} className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-gray-900 mb-1">{submission.project_name}</h4>
                          <p className="text-blue-600 font-medium mb-2">by {submission.team_name}</p>
                          <p className="text-gray-700 text-sm mb-3">{submission.description}</p>
                          
                          <div className="flex items-center space-x-2 mb-3">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {submission.members.join(", ")}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-4">
                          <ThumbsUp className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">{submission.votes}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {submission.demo_url && (
                          <a
                            href={submission.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Demo</span>
                          </a>
                        )}
                        {submission.github_url && (
                          <a
                            href={submission.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            <Github className="w-4 h-4" />
                            <span>Code</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-600">Project submissions will appear here once the hackathon begins</p>
                </div>
              )}
            </div>
          )}

          {/* Judges Tab */}
          {activeTab === 'judges' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Meet the Judges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(hackathon.judges || []).map((judge, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-500" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{judge.name}</h4>
                    <p className="text-blue-600 font-medium text-sm mb-1">{judge.title}</p>
                    <p className="text-gray-600 text-sm">{judge.company}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* WhatsApp Sync Modal */}
      {showWhatsAppSync && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Share to WhatsApp</h3>
                <p className="text-sm text-gray-600">Select a WhatsApp community to share this hackathon</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <WhatsAppCommunityList onSelect={handleWhatsAppSync} />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowWhatsAppSync(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              
              {syncingToWhatsApp && (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Sharing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}