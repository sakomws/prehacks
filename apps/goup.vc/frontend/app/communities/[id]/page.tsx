'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Star, 
  Settings, 
  Plus, 
  Globe,
  Crown,
  UserPlus,
  Bell,
  Share2,
  MoreHorizontal,
  Pin,
  Heart,
  Reply,
  Bookmark,
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon,
  Briefcase,
  Shield,
  Handshake,
  GraduationCap,
  Megaphone,
  CheckCircle,
  AlertTriangle,
  Camera,
  Award,
  Target,
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
  Smartphone
} from 'lucide-react'
import WhatsAppSync from '@/components/WhatsAppSync'

interface Post {
  id: number
  author: {
    name: string
    avatar: string
    role?: string
  }
  content: string
  type: 'text' | 'image' | 'video' | 'link' | 'event' | 'hiring' | 'collaboration' | 'education' | 'promotion'
  attachments?: string[]
  likes: number
  comments: number
  shares: number
  created_at: string
  is_pinned?: boolean
  is_liked?: boolean
  is_bookmarked?: boolean
  values_alignment?: string[]
  collaboration_photos?: string[]
  event_learnings?: string
  promotion_context?: string
}

interface Event {
  id: number
  title: string
  description: string
  date: string
  location: string
  attendees: number
  max_attendees?: number
}

interface Member {
  id: number
  name: string
  avatar: string
  role: 'admin' | 'moderator' | 'member' | 'guardian'
  joined_at: string
  posts_count: number
  values_score?: {
    integrity: number
    doer: number
    giver: number
    passion: number
    resilience: number
  }
  help_availability?: 'available' | 'busy' | 'focused'
}

interface HiringReferral {
  id: number
  position: string
  company: string
  referrer: {
    name: string
    avatar: string
  }
  candidate_values: string[]
  description: string
  created_at: string
  status: 'open' | 'reviewing' | 'filled'
}

interface CollaborationMeeting {
  id: number
  title: string
  participants: string[]
  photos: string[]
  context: string
  outcomes: string
  created_at: string
  follow_up_connections: number
}

interface EducationShare {
  id: number
  event_name: string
  sharer: {
    name: string
    avatar: string
  }
  key_learnings: string[]
  resources: string[]
  created_at: string
  helpful_count: number
}

interface PromotionPost {
  id: number
  type: 'event' | 'product' | 'introduction'
  title: string
  description: string
  context: string
  promoter: {
    name: string
    avatar: string
  }
  created_at: string
  engagement_count: number
}

const MOCK_COMMUNITY = {
  id: 1,
  name: "SF Tech Founders",
  description: "A community for technology entrepreneurs and startup founders in the San Francisco Bay Area. Share experiences, get advice, and connect with fellow builders.",
  type: "public" as const,
  category: "Technology",
  member_count: 2847,
  active_members: 342,
  posts_count: 1205,
  events_count: 28,
  created_at: "2023-01-15T00:00:00Z",
  cover_image: "/communities/sf-tech-cover.jpg",
  avatar: "/communities/sf-tech-avatar.jpg",
  location: "San Francisco, CA",
  tags: ["startups", "technology", "networking", "funding"],
  is_member: true,
  is_admin: false,
  rules: [
    "Be respectful and professional in all interactions",
    "No spam or self-promotion without context",
    "Share valuable insights and experiences",
    "Help fellow founders when possible",
    "Keep discussions relevant to entrepreneurship"
  ]
}

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    author: {
      name: "Sarah Chen",
      avatar: "/avatars/sarah.jpg",
      role: "Founder @ TechCorp"
    },
    content: "Just closed our Series A! 🎉 Here are the key lessons I learned during the fundraising process that might help other founders...\n\n1. Start building relationships with investors 6 months before you need funding\n2. Have a clear narrative about your market opportunity\n3. Show strong unit economics and a path to profitability\n4. Be prepared for the emotional rollercoaster\n\nHappy to answer any questions about the process!",
    type: "text",
    likes: 127,
    comments: 23,
    shares: 8,
    created_at: "2024-12-15T10:30:00Z",
    is_pinned: true,
    is_liked: false,
    is_bookmarked: true
  },
  {
    id: 2,
    author: {
      name: "Mike Johnson",
      avatar: "/avatars/mike.jpg",
      role: "CTO @ StartupXYZ"
    },
    content: "Looking for recommendations on the best tools for managing a remote engineering team. We're scaling from 5 to 15 engineers and need better processes. What's worked for you?",
    type: "text",
    likes: 45,
    comments: 18,
    shares: 3,
    created_at: "2024-12-15T08:15:00Z",
    is_liked: true,
    is_bookmarked: false
  },
  {
    id: 3,
    author: {
      name: "Lisa Wang",
      avatar: "/avatars/lisa.jpg",
      role: "Product Manager"
    },
    content: "Excited to share that we're hosting a Product Strategy Workshop next Friday! We'll cover:\n\n• Market research techniques\n• Competitive analysis frameworks\n• Product roadmap planning\n• Metrics that matter\n\nLimited spots available. Link in comments 👇",
    type: "event",
    likes: 89,
    comments: 12,
    shares: 15,
    created_at: "2024-12-14T16:45:00Z",
    is_liked: false,
    is_bookmarked: false
  }
]

const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: "Monthly Founder Meetup",
    description: "Join fellow founders for networking, sharing experiences, and building connections.",
    date: "2024-12-20T19:00:00Z",
    location: "WeWork SOMA, San Francisco",
    attendees: 45,
    max_attendees: 60
  },
  {
    id: 2,
    title: "Fundraising Workshop",
    description: "Learn the ins and outs of raising capital from experienced founders and VCs.",
    date: "2024-12-22T14:00:00Z",
    location: "Virtual Event",
    attendees: 128,
    max_attendees: 150
  }
]

const MOCK_MEMBERS: Member[] = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "/avatars/sarah.jpg",
    role: "admin",
    joined_at: "2023-01-15T00:00:00Z",
    posts_count: 45,
    values_score: { integrity: 95, doer: 92, giver: 88, passion: 96, resilience: 90 },
    help_availability: "available"
  },
  {
    id: 2,
    name: "Mike Johnson",
    avatar: "/avatars/mike.jpg",
    role: "guardian",
    joined_at: "2023-02-10T00:00:00Z",
    posts_count: 32,
    values_score: { integrity: 93, doer: 95, giver: 91, passion: 89, resilience: 94 },
    help_availability: "available"
  },
  {
    id: 3,
    name: "Lisa Wang",
    avatar: "/avatars/lisa.jpg",
    role: "member",
    joined_at: "2023-03-05T00:00:00Z",
    posts_count: 28,
    values_score: { integrity: 91, doer: 88, giver: 94, passion: 92, resilience: 87 },
    help_availability: "busy"
  }
]

const MOCK_HIRING_REFERRALS: HiringReferral[] = [
  {
    id: 1,
    position: "Senior Frontend Engineer",
    company: "TechCorp",
    referrer: {
      name: "Sarah Chen",
      avatar: "/avatars/sarah.jpg"
    },
    candidate_values: ["integrity", "doer", "passion"],
    description: "Looking for a senior frontend engineer who embodies our values. Must have strong React skills and a track record of shipping quality products. Values alignment is more important than years of experience.",
    created_at: "2024-12-14T10:00:00Z",
    status: "open"
  },
  {
    id: 2,
    position: "Product Manager",
    company: "StartupXYZ",
    referrer: {
      name: "Mike Johnson",
      avatar: "/avatars/mike.jpg"
    },
    candidate_values: ["giver", "resilience", "passion"],
    description: "Seeking a PM who can help others succeed while driving product vision. Looking for someone who bounces back from setbacks and genuinely cares about user outcomes.",
    created_at: "2024-12-13T15:30:00Z",
    status: "reviewing"
  }
]

const MOCK_COLLABORATIONS: CollaborationMeeting[] = [
  {
    id: 1,
    title: "AI Ethics Discussion Group",
    participants: ["Sarah Chen", "Mike Johnson", "Lisa Wang", "Alex Rodriguez"],
    photos: ["/collaboration/ai-ethics-1.jpg", "/collaboration/ai-ethics-2.jpg"],
    context: "Small group discussion about implementing ethical AI practices in startups. Covered bias detection, transparency, and user consent.",
    outcomes: "Created shared framework for AI ethics review. Planning follow-up workshop for broader community.",
    created_at: "2024-12-14T18:00:00Z",
    follow_up_connections: 12
  },
  {
    id: 2,
    title: "Fundraising Strategy Session",
    participants: ["Lisa Wang", "David Kim", "Emma Thompson"],
    photos: ["/collaboration/fundraising-1.jpg"],
    context: "Three founders shared their fundraising experiences and created a mutual support system for upcoming rounds.",
    outcomes: "Established weekly check-ins and shared investor contact list. Two members got warm intros.",
    created_at: "2024-12-12T14:00:00Z",
    follow_up_connections: 8
  }
]

const MOCK_EDUCATION_SHARES: EducationShare[] = [
  {
    id: 1,
    event_name: "YC Demo Day 2024",
    sharer: {
      name: "Sarah Chen",
      avatar: "/avatars/sarah.jpg"
    },
    key_learnings: [
      "Focus on clear problem-solution fit in pitch",
      "Traction metrics matter more than vanity metrics",
      "Team chemistry is crucial for investor confidence",
      "Market timing can make or break a startup"
    ],
    resources: [
      "YC pitch deck template",
      "Demo day presentation tips",
      "Investor follow-up email templates"
    ],
    created_at: "2024-12-13T20:00:00Z",
    helpful_count: 23
  },
  {
    id: 2,
    event_name: "React Conf 2024",
    sharer: {
      name: "Mike Johnson",
      avatar: "/avatars/mike.jpg"
    },
    key_learnings: [
      "React Server Components are production-ready",
      "New concurrent features improve UX significantly",
      "Performance optimization strategies for large apps"
    ],
    resources: [
      "React 18 migration guide",
      "Server Components examples",
      "Performance monitoring tools"
    ],
    created_at: "2024-12-11T16:30:00Z",
    helpful_count: 18
  }
]

const MOCK_PROMOTIONS: PromotionPost[] = [
  {
    id: 1,
    type: "event",
    title: "Lisa's Product Strategy Workshop",
    description: "Join Lisa Wang for an intensive workshop on product roadmap planning and user research techniques.",
    context: "Lisa has been incredibly helpful to our community, sharing insights from her time at Google and Facebook. This workshop is her way of giving back - she's not charging for it and genuinely wants to help fellow PMs grow.",
    promoter: {
      name: "Sarah Chen",
      avatar: "/avatars/sarah.jpg"
    },
    created_at: "2024-12-14T12:00:00Z",
    engagement_count: 15
  },
  {
    id: 2,
    type: "product",
    title: "Mike's Open Source Tool: DevFlow",
    description: "A developer productivity tool that helps manage microservices development workflow.",
    context: "Mike built this after struggling with our own dev processes. He's open-sourced it and is looking for feedback from fellow CTOs. No monetization - just wants to help the community build better software.",
    promoter: {
      name: "Lisa Wang",
      avatar: "/avatars/lisa.jpg"
    },
    created_at: "2024-12-12T09:15:00Z",
    engagement_count: 22
  }
]

export default function CommunityDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState<'posts' | 'hiring' | 'moderation' | 'collaboration' | 'education' | 'promotion' | 'whatsapp' | 'events' | 'members' | 'about'>('posts')
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [newPost, setNewPost] = useState('')
  const [showPostComposer, setShowPostComposer] = useState(false)
  const [community, setCommunity] = useState(MOCK_COMMUNITY)
  const [loading, setLoading] = useState(true)
  const [whatsappData, setWhatsappData] = useState<any>(null)

  useEffect(() => {
    loadCommunity()
  }, [params.id])

  const loadCommunity = () => {
    try {
      const communityId = params.id as string
      
      // Try to load from localStorage first (user-created communities)
      const storedCommunity = localStorage.getItem(`community_${communityId}`)
      
      if (storedCommunity) {
        const parsedCommunity = JSON.parse(storedCommunity)
        setCommunity(parsedCommunity)
      } else {
        // Fallback to mock community for demo
        setCommunity(MOCK_COMMUNITY)
      }
    } catch (error) {
      console.error('Failed to load community:', error)
      setCommunity(MOCK_COMMUNITY)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const handleLikePost = (postId: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            is_liked: !post.is_liked,
            likes: post.is_liked ? post.likes - 1 : post.likes + 1
          }
        : post
    ))
  }

  const handleBookmarkPost = (postId: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, is_bookmarked: !post.is_bookmarked }
        : post
    ))
  }

  const handleCreatePost = () => {
    if (!newPost.trim()) return
    
    const post: Post = {
      id: Date.now(),
      author: {
        name: "You",
        avatar: "/avatars/default.jpg"
      },
      content: newPost,
      type: "text",
      likes: 0,
      comments: 0,
      shares: 0,
      created_at: new Date().toISOString(),
      is_liked: false,
      is_bookmarked: false
    }
    
    setPosts(prev => [post, ...prev])
    setNewPost('')
    setShowPostComposer(false)
  }

  const handleWhatsAppSync = (data: any) => {
    setWhatsappData(data)
    
    // Update community members with WhatsApp data
    if (data.members) {
      // Merge WhatsApp members with existing members
      // In a real app, this would update the backend
      console.log('WhatsApp sync completed:', data)
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
      {/* Community Header */}
      <section className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative">
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <button className="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            {MOCK_COMMUNITY.is_admin && (
              <button className="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Manage</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {community.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 mb-1">
                    {community.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4 text-green-600" />
                      <span>{community.type === 'public' ? 'Public' : community.type === 'private' ? 'Private' : 'Invite Only'} Community</span>
                    </div>
                    {community.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{community.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 max-w-2xl">
                {community.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {community.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {community.is_member ? (
                <>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Following</span>
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 font-medium transition-colors">
                    Leave Community
                  </button>
                </>
              ) : (
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
                  <UserPlus className="w-5 h-5" />
                  <span>Join Community</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-8 py-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{community.member_count.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{community.posts_count.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{community.events_count}</div>
              <div className="text-sm text-gray-600">Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{community.active_members}</div>
              <div className="text-sm text-gray-600">Active Today</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex space-x-4 overflow-x-auto">
            {[
              { key: 'posts', label: 'Posts', icon: MessageCircle },
              { key: 'hiring', label: 'Hiring', icon: Briefcase },
              { key: 'moderation', label: 'Moderation', icon: Shield },
              { key: 'collaboration', label: 'Collaboration', icon: Handshake },
              { key: 'education', label: 'Education', icon: GraduationCap },
              { key: 'promotion', label: 'Promotion', icon: Megaphone },
              { key: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
              { key: 'events', label: 'Events', icon: Calendar },
              { key: 'members', label: 'Members', icon: Users },
              { key: 'about', label: 'About', icon: FileText }
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

          {activeTab === 'posts' && community.is_member && (
            <button
              onClick={() => setShowPostComposer(!showPostComposer)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Post</span>
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Post Composer */}
          {showPostComposer && activeTab === 'posts' && (
            <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  Y
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share something with the community..."
                    className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                        <ImageIcon className="w-5 h-5" />
                        <span>Photo</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                        <Video className="w-5 h-5" />
                        <span>Video</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                        <LinkIcon className="w-5 h-5" />
                        <span>Link</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowPostComposer(false)}
                        className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPost.trim()}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white border border-gray-100 rounded-xl p-6">
                  {post.is_pinned && (
                    <div className="flex items-center space-x-2 mb-4 text-sm text-blue-600">
                      <Pin className="w-4 h-4" />
                      <span>Pinned Post</span>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {post.author.name.charAt(0)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{post.author.name}</h4>
                          {post.author.role && (
                            <p className="text-sm text-gray-600">{post.author.role}</p>
                          )}
                          <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-6">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center space-x-2 transition-colors ${
                              post.is_liked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <Reply className="w-5 h-5" />
                            <span>{post.comments}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                            <Share2 className="w-5 h-5" />
                            <span>{post.shares}</span>
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleBookmarkPost(post.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            post.is_bookmarked 
                              ? 'text-yellow-600 bg-yellow-100' 
                              : 'text-gray-400 hover:text-yellow-600 hover:bg-gray-100'
                          }`}
                        >
                          <Bookmark className={`w-5 h-5 ${post.is_bookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hiring Tab - Values-based referrals */}
          {activeTab === 'hiring' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Values-Based Hiring</h3>
                    <p className="text-blue-700 mb-4">
                      Review and add referrals that align with our 5 core values: integrity, doer, giver, passion, and resilience.
                    </p>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Add Referral</span>
                    </button>
                  </div>
                </div>
              </div>

              {MOCK_HIRING_REFERRALS.map((referral) => (
                <div key={referral.id} className="bg-white border border-gray-100 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{referral.position}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          referral.status === 'open' ? 'bg-green-100 text-green-800' :
                          referral.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {referral.status}
                        </span>
                      </div>
                      <p className="text-blue-600 font-medium mb-3">{referral.company}</p>
                      
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm text-gray-600">Referred by:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">{referral.referrer.name.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{referral.referrer.name}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-sm text-gray-600">Values focus:</span>
                        {referral.candidate_values.map((value) => (
                          <span key={value} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800">
                            {value}
                          </span>
                        ))}
                      </div>

                      <p className="text-gray-700">{referral.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Refer Someone
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Posted {formatDate(referral.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Moderation Tab - Quality control */}
          {activeTab === 'moderation' && (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-2">Community Moderation</h3>
                    <p className="text-orange-700 mb-4">
                      Ensure quality discussions and prevent selling behavior. Focus on preserving signal, not removing people.
                    </p>
                    <div className="flex items-center space-x-3">
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Review Queue
                      </button>
                      <span className="text-sm text-orange-700">2 items pending review</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h3 className="font-semibold text-gray-900">Quality Signals</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Shares personal experiences</li>
                    <li>• Asks specific, actionable questions</li>
                    <li>• Offers help without expecting return</li>
                    <li>• Provides context for recommendations</li>
                    <li>• Admits mistakes and shares learnings</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <h3 className="font-semibold text-gray-900">Warning Signs</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Cold pitches without context</li>
                    <li>• Generic promotional content</li>
                    <li>• Asks for help but never offers</li>
                    <li>• Credential flexing without value</li>
                    <li>• Engagement farming behavior</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Moderation Actions</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <strong>Gentle correction sent</strong> to member about adding context to product recommendation
                      </p>
                      <p className="text-xs text-gray-600 mt-1">2 hours ago • Resolved positively</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <strong>Private conversation</strong> with member about balancing self-promotion with value
                      </p>
                      <p className="text-xs text-gray-600 mt-1">1 day ago • Follow-up scheduled</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collaboration Tab - Meeting and connecting */}
          {activeTab === 'collaboration' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Handshake className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">Collaboration Hub</h3>
                    <p className="text-green-700 mb-4">
                      Meet members, help each other, and share moments so others can connect later.
                    </p>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Share Collaboration</span>
                    </button>
                  </div>
                </div>
              </div>

              {MOCK_COLLABORATIONS.map((collab) => (
                <div key={collab.id} className="bg-white border border-gray-100 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{collab.title}</h3>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {collab.participants.join(", ")}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Context</h4>
                        <p className="text-gray-700 text-sm">{collab.context}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Outcomes</h4>
                        <p className="text-gray-700 text-sm">{collab.outcomes}</p>
                      </div>

                      {collab.photos.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                            <Camera className="w-4 h-4" />
                            <span>Photos</span>
                          </h4>
                          <div className="flex space-x-2">
                            {collab.photos.map((photo, index) => (
                              <div key={index} className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Camera className="w-6 h-6 text-gray-400" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatDate(collab.created_at)}</span>
                        <span>•</span>
                        <span>{collab.follow_up_connections} follow-up connections made</span>
                      </div>
                    </div>
                    
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Connect with Participants
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Education Tab - Learning sharing */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-2">Education Loop</h3>
                    <p className="text-purple-700 mb-4">
                      Share learnings from events so those who couldn't attend can still benefit.
                    </p>
                    <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Share Learning</span>
                    </button>
                  </div>
                </div>
              </div>

              {MOCK_EDUCATION_SHARES.map((share) => (
                <div key={share.id} className="bg-white border border-gray-100 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{share.sharer.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{share.event_name}</h3>
                          <p className="text-sm text-gray-600">Shared by {share.sharer.name}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Key Learnings</h4>
                        <ul className="space-y-1">
                          {share.key_learnings.map((learning, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                              <span className="text-purple-500 mt-1">•</span>
                              <span>{learning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {share.resources.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Resources Shared</h4>
                          <div className="space-y-2">
                            {share.resources.map((resource, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <ExternalLink className="w-4 h-4 text-blue-500" />
                                <span className="text-blue-600 hover:text-blue-800 cursor-pointer">{resource}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatDate(share.created_at)}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{share.helpful_count} found this helpful</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Helpful
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg transition-colors">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Promotion Tab - Supporting members */}
          {activeTab === 'promotion' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-indigo-900 mb-2">Member Promotion</h3>
                    <p className="text-indigo-700 mb-4">
                      Support fellow members' events, promote their products with context, and make warm introductions.
                    </p>
                    <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Promote Member</span>
                    </button>
                  </div>
                </div>
              </div>

              {MOCK_PROMOTIONS.map((promotion) => (
                <div key={promotion.id} className="bg-white border border-gray-100 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{promotion.promoter.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-semibold text-gray-900">{promotion.title}</h3>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              promotion.type === 'event' ? 'bg-blue-100 text-blue-800' :
                              promotion.type === 'product' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {promotion.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Promoted by {promotion.promoter.name}</p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{promotion.description}</p>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Why I'm promoting this:</h4>
                        <p className="text-sm text-gray-700">{promotion.context}</p>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{formatDate(promotion.created_at)}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{promotion.engagement_count} people engaged</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Support
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* WhatsApp Integration Tab */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">WhatsApp Community Integration</h3>
                    <p className="text-green-700 mb-4">
                      Connect your WhatsApp community to sync members, messages, and activities. Automatically pull data to enhance your LPM community features.
                    </p>
                  </div>
                </div>
              </div>

              <WhatsAppSync 
                communityId={params.id as string} 
                onDataSync={handleWhatsAppSync}
              />

              {/* WhatsApp Data Preview */}
              {whatsappData && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Synced WhatsApp Data</h3>
                  
                  {/* Members from WhatsApp */}
                  {whatsappData.members && whatsappData.members.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-medium text-gray-900 mb-4">WhatsApp Members ({whatsappData.members.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {whatsappData.members.slice(0, 6).map((member: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-700">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-600">{member.whatsapp_phone}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {whatsappData.members.length > 6 && (
                        <div className="mt-4 text-center">
                          <span className="text-sm text-gray-600">
                            +{whatsappData.members.length - 6} more members
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Help Requests from WhatsApp */}
                  {whatsappData.helpRequests && whatsappData.helpRequests.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Help Requests from WhatsApp</h4>
                      <div className="space-y-4">
                        {whatsappData.helpRequests.slice(0, 3).map((request: any, index: number) => (
                          <div key={index} className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm text-gray-600 mb-1">From: {request.author}</div>
                                <div className="text-gray-800">{request.content}</div>
                                <div className="text-xs text-gray-500 mt-2">
                                  {new Date(request.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collaborations from WhatsApp */}
                  {whatsappData.collaborations && whatsappData.collaborations.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Collaboration Opportunities</h4>
                      <div className="space-y-4">
                        {whatsappData.collaborations.slice(0, 3).map((collab: any, index: number) => (
                          <div key={index} className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Handshake className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm text-gray-600 mb-1">From: {collab.author}</div>
                                <div className="text-gray-800">{collab.content}</div>
                                <div className="text-xs text-gray-500 mt-2">
                                  {new Date(collab.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Educational Content from WhatsApp */}
                  {whatsappData.educationalContent && whatsappData.educationalContent.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Educational Content</h4>
                      <div className="space-y-4">
                        {whatsappData.educationalContent.slice(0, 3).map((content: any, index: number) => (
                          <div key={index} className="p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm text-gray-600 mb-1">From: {content.author}</div>
                                <div className="text-gray-800">{content.content}</div>
                                <div className="text-xs text-gray-500 mt-2">
                                  {new Date(content.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Values Analysis */}
                  {whatsappData.valuesAnalysis && Object.keys(whatsappData.valuesAnalysis).length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="font-medium text-gray-900 mb-4">LPM Values Analysis</h4>
                      <div className="text-sm text-gray-600 mb-4">
                        Analyzed WhatsApp messages for alignment with LPM values
                      </div>
                      <div className="grid grid-cols-5 gap-4">
                        {['integrity', 'doer', 'giver', 'passion', 'resilience'].map((value) => (
                          <div key={value} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold text-gray-900 mb-1">
                              {Object.values(whatsappData.valuesAnalysis).reduce((sum: number, member: any) => 
                                sum + (member[value] || 0), 0
                              )}
                            </div>
                            <div className="text-xs text-gray-600 capitalize">{value}</div>
                            <div className="text-xs text-gray-500">signals</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              {MOCK_EVENTS.map((event) => (
                <div key={event.id} className="bg-white border border-gray-100 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-600 mb-4">{event.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.attendees} attending
                            {event.max_attendees && ` • ${event.max_attendees - event.attendees} spots left`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      RSVP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_MEMBERS.map((member) => (
                <div key={member.id} className="bg-white border border-gray-100 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-lg">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-1">{member.name}</h3>
                  
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {member.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
                    {member.role === 'guardian' && <Shield className="w-4 h-4 text-orange-500" />}
                    {member.role === 'moderator' && <Star className="w-4 h-4 text-blue-500" />}
                    <span className="text-sm text-gray-600 capitalize">{member.role}</span>
                  </div>

                  {/* Values Alignment */}
                  {member.values_score && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-2">Values Alignment</div>
                      <div className="grid grid-cols-5 gap-1">
                        {Object.entries(member.values_score).map(([value, score]) => (
                          <div key={value} className="text-center">
                            <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-medium ${
                              score >= 90 ? 'bg-green-500 text-white' :
                              score >= 80 ? 'bg-yellow-500 text-white' :
                              'bg-gray-300 text-gray-700'
                            }`}>
                              {score}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">{value.charAt(0)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Help Availability */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.help_availability === 'available' ? 'bg-green-100 text-green-800' :
                      member.help_availability === 'busy' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.help_availability === 'available' ? '🟢 Available to help' :
                       member.help_availability === 'busy' ? '🔴 Busy' :
                       '🟡 Focused on projects'}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      href={`/profile/${member.id}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors text-center block text-sm"
                    >
                      View Profile
                    </Link>
                    {member.help_availability === 'available' && (
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm">
                        Ask for Help
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">About This Community</h3>
                <p className="text-gray-600 leading-relaxed">
                  {community.description}
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Rules</h3>
                <div className="space-y-3">
                  {(community.rules || []).map((rule, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-semibold text-gray-900">{community.member_count}</div>
                    <div className="text-sm text-gray-600">Total Members</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-semibold text-gray-900">{community.posts_count}</div>
                    <div className="text-sm text-gray-600">Posts Shared</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-semibold text-gray-900">{community.events_count}</div>
                    <div className="text-sm text-gray-600">Events Hosted</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-semibold text-gray-900">{formatDate(community.created_at)}</div>
                    <div className="text-sm text-gray-600">Founded</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}