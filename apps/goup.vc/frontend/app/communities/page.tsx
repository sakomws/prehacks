'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Star, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter,
  Globe,
  Lock,
  Crown,
  Activity,
  UserPlus,
  Eye,
  Heart,
  Share2,
  MoreHorizontal
} from 'lucide-react'

interface Community {
  id: number
  name: string
  description: string
  type: 'public' | 'private' | 'invite_only'
  category: string
  member_count: number
  active_members: number
  posts_count: number
  events_count: number
  created_at: string
  cover_image?: string
  avatar?: string
  location?: string
  tags: string[]
  is_member: boolean
  is_admin: boolean
  recent_activity: {
    type: 'post' | 'event' | 'member_joined'
    description: string
    time: string
  }[]
}

const MOCK_COMMUNITIES: Community[] = [
  {
    id: 1,
    name: "SF Tech Founders",
    description: "A community for technology entrepreneurs and startup founders in the San Francisco Bay Area. Share experiences, get advice, and connect with fellow builders.",
    type: "public",
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
    recent_activity: [
      {
        type: "event",
        description: "Monthly Founder Meetup scheduled for Dec 20",
        time: "2 hours ago"
      },
      {
        type: "post",
        description: "Sarah Chen shared insights about Series A fundraising",
        time: "4 hours ago"
      },
      {
        type: "member_joined",
        description: "12 new members joined today",
        time: "6 hours ago"
      }
    ]
  },
  {
    id: 2,
    name: "AI Builders Collective",
    description: "Building the future with artificial intelligence. Share projects, discuss latest research, and collaborate on AI innovations.",
    type: "public",
    category: "AI & Machine Learning",
    member_count: 1923,
    active_members: 287,
    posts_count: 892,
    events_count: 15,
    created_at: "2023-03-22T00:00:00Z",
    cover_image: "/communities/ai-builders-cover.jpg",
    avatar: "/communities/ai-builders-avatar.jpg",
    tags: ["artificial-intelligence", "machine-learning", "deep-learning", "research"],
    is_member: true,
    is_admin: true,
    recent_activity: [
      {
        type: "post",
        description: "New GPT-4 integration tutorial posted",
        time: "1 hour ago"
      },
      {
        type: "event",
        description: "AI Ethics Workshop this Friday",
        time: "3 hours ago"
      }
    ]
  },
  {
    id: 3,
    name: "Design Systems Guild",
    description: "For designers and developers working on design systems. Share components, discuss best practices, and build better user experiences.",
    type: "invite_only",
    category: "Design",
    member_count: 756,
    active_members: 124,
    posts_count: 445,
    events_count: 8,
    created_at: "2023-05-10T00:00:00Z",
    cover_image: "/communities/design-systems-cover.jpg",
    avatar: "/communities/design-systems-avatar.jpg",
    tags: ["design-systems", "ui-ux", "components", "figma"],
    is_member: false,
    is_admin: false,
    recent_activity: [
      {
        type: "post",
        description: "New Figma plugin for design tokens shared",
        time: "5 hours ago"
      }
    ]
  },
  {
    id: 4,
    name: "Climate Tech Innovators",
    description: "Tackling climate change through technology. Connect with entrepreneurs, researchers, and investors focused on sustainability solutions.",
    type: "public",
    category: "Sustainability",
    member_count: 1456,
    active_members: 198,
    posts_count: 623,
    events_count: 12,
    created_at: "2023-02-28T00:00:00Z",
    cover_image: "/communities/climate-tech-cover.jpg",
    avatar: "/communities/climate-tech-avatar.jpg",
    location: "Global",
    tags: ["climate-tech", "sustainability", "clean-energy", "carbon"],
    is_member: false,
    is_admin: false,
    recent_activity: [
      {
        type: "event",
        description: "Clean Energy Startup Pitch Day next week",
        time: "8 hours ago"
      },
      {
        type: "post",
        description: "Carbon capture technology discussion",
        time: "12 hours ago"
      }
    ]
  },
  {
    id: 5,
    name: "Web3 Builders",
    description: "Building the decentralized web. Share DeFi projects, NFT collections, and blockchain innovations with fellow Web3 enthusiasts.",
    type: "public",
    category: "Blockchain",
    member_count: 3241,
    active_members: 445,
    posts_count: 1876,
    events_count: 22,
    created_at: "2022-11-12T00:00:00Z",
    cover_image: "/communities/web3-builders-cover.jpg",
    avatar: "/communities/web3-builders-avatar.jpg",
    tags: ["web3", "blockchain", "defi", "nft", "ethereum"],
    is_member: true,
    is_admin: false,
    recent_activity: [
      {
        type: "post",
        description: "New DeFi protocol launched by community member",
        time: "30 minutes ago"
      },
      {
        type: "member_joined",
        description: "25 new members joined today",
        time: "2 hours ago"
      }
    ]
  },
  {
    id: 6,
    name: "Product Managers United",
    description: "A private community for senior product managers to share strategies, discuss challenges, and advance their careers.",
    type: "private",
    category: "Product Management",
    member_count: 892,
    active_members: 156,
    posts_count: 567,
    events_count: 18,
    created_at: "2023-04-05T00:00:00Z",
    cover_image: "/communities/pm-united-cover.jpg",
    avatar: "/communities/pm-united-avatar.jpg",
    tags: ["product-management", "strategy", "leadership", "growth"],
    is_member: false,
    is_admin: false,
    recent_activity: [
      {
        type: "post",
        description: "Product roadmap template shared",
        time: "4 hours ago"
      }
    ]
  }
]

const CATEGORIES = [
  "All",
  "Technology", 
  "AI & Machine Learning",
  "Design",
  "Sustainability",
  "Blockchain",
  "Product Management",
  "Marketing",
  "Finance"
]

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [filter, setFilter] = useState<'all' | 'my_communities' | 'recommended'>('all')

  useEffect(() => {
    loadCommunities()
  }, [])

  // Refresh communities when the page becomes visible (e.g., when navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadCommunities()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const loadCommunities = () => {
    try {
      // Load user-created communities from localStorage
      const userCommunities = JSON.parse(localStorage.getItem('user_communities') || '[]')
      
      // Combine with mock communities
      const allCommunities = [...userCommunities, ...MOCK_COMMUNITIES]
      setCommunities(allCommunities)
    } catch (error) {
      console.error('Failed to load communities:', error)
      // Fallback to mock communities
      setCommunities(MOCK_COMMUNITIES)
    } finally {
      setLoading(false)
    }
  }

  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Globe className="w-4 h-4 text-green-600" />
      case 'private':
        return <Lock className="w-4 h-4 text-red-600" />
      case 'invite_only':
        return <Crown className="w-4 h-4 text-yellow-600" />
      default:
        return <Globe className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'public':
        return 'Public'
      case 'private':
        return 'Private'
      case 'invite_only':
        return 'Invite Only'
      default:
        return type
    }
  }

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || community.category === selectedCategory
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'my_communities' && community.is_member) ||
                         (filter === 'recommended' && !community.is_member)
    
    return matchesSearch && matchesCategory && matchesFilter
  })

  const handleJoinCommunity = async (communityId: number) => {
    // In a real app, this would make an API call
    setCommunities(prev => prev.map(community => 
      community.id === communityId 
        ? { ...community, is_member: true, member_count: community.member_count + 1 }
        : community
    ))
  }

  const handleLeaveCommunity = async (communityId: number) => {
    // In a real app, this would make an API call
    setCommunities(prev => prev.map(community => 
      community.id === communityId 
        ? { ...community, is_member: false, member_count: community.member_count - 1 }
        : community
    ))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-4xl font-medium tracking-tight text-gray-900 mb-2">
            Communities
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Connect with like-minded people and grow together
          </p>
        </div>
        
        <Link 
          href="/communities/create"
          className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Community</span>
        </Link>
      </section>

      {/* Search and Filters */}
      <section className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search communities, topics, or interests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Communities' },
              { key: 'my_communities', label: 'My Communities' },
              { key: 'recommended', label: 'Recommended' }
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

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Communities Grid */}
      <section>
        {filteredCommunities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a community!'}
            </p>
            <Link 
              href="/communities/create"
              className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Community</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCommunities.map((community) => (
              <div key={community.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200">
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 relative">
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    {getTypeIcon(community.type)}
                    <span className="text-xs font-medium text-gray-700 bg-white/80 px-2 py-1 rounded-lg">
                      {getTypeText(community.type)}
                    </span>
                  </div>
                  
                  {community.is_admin && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Crown className="w-3 h-3 mr-1" />
                        Admin
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Community Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link href={`/communities/${community.id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer mb-1">
                          {community.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        {community.category}
                      </p>
                      {community.location && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{community.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {community.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {community.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                    {community.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                        +{community.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{formatMemberCount(community.member_count)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Members</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                        <MessageCircle className="w-4 h-4" />
                        <span>{community.posts_count}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Posts</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                        <Activity className="w-4 h-4" />
                        <span>{community.active_members}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Active</p>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Activity</h4>
                    <div className="space-y-2">
                      {community.recent_activity.slice(0, 2).map((activity, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-gray-700">{activity.description}</p>
                            <p className="text-gray-500 text-xs">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {community.is_member ? (
                      <div className="flex items-center space-x-3">
                        <Link 
                          href={`/communities/${community.id}`}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                          View Community
                        </Link>
                        <button
                          onClick={() => handleLeaveCommunity(community.id)}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                        >
                          Leave
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        {community.type === 'private' ? (
                          <button className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-medium text-sm cursor-not-allowed">
                            Private
                          </button>
                        ) : community.type === 'invite_only' ? (
                          <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                            Request Invite
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinCommunity(community.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center space-x-1"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Join</span>
                          </button>
                        )}
                        
                        <Link 
                          href={`/communities/${community.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Preview</span>
                        </Link>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Heart className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Share2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      {filteredCommunities.length > 0 && (
        <section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Users className="w-8 h-8 text-purple-600" />
            <h2 className="text-3xl font-semibold text-gray-900">Build Your Network</h2>
          </div>
          <p className="text-xl text-gray-600 font-light mb-8 max-w-2xl mx-auto">
            Join communities that match your interests and connect with people who share your passions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              href="/communities/create"
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-full font-medium text-lg transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Start Your Community
            </Link>
            <Link 
              href="/communities?filter=recommended"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Discover Recommended
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}