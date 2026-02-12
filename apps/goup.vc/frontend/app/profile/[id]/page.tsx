'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  MessageCircle,
  Star,
  Crown,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Mail,
  Phone,
  ExternalLink,
  Edit,
  Share2,
  MoreHorizontal,
  Briefcase,
  GraduationCap,
  Award,
  Heart,
  UserPlus,
  MessageSquare,
  Youtube,
  Facebook
} from 'lucide-react'

interface SocialLink {
  platform: string
  url: string
  icon: React.ComponentType<any>
}

interface Experience {
  id: number
  title: string
  company: string
  duration: string
  description?: string
  current?: boolean
}

interface Education {
  id: number
  degree: string
  school: string
  year: string
}

interface Achievement {
  id: number
  title: string
  description: string
  date: string
}

interface UserProfile {
  id: number
  name: string
  avatar: string
  bio: string
  location: string
  joined_date: string
  role: 'admin' | 'moderator' | 'member'
  posts_count: number
  communities_count: number
  connections_count: number
  social_links: SocialLink[]
  experience: Experience[]
  education: Education[]
  achievements: Achievement[]
  skills: string[]
  interests: string[]
  is_own_profile: boolean
  is_connected: boolean
}

const MOCK_PROFILES: { [key: string]: UserProfile } = {
  "1": {
    id: 1,
    name: "Sarah Chen",
    avatar: "/avatars/sarah.jpg",
    bio: "Passionate entrepreneur building the future of AI-powered healthcare solutions. Previously founded two successful startups and love mentoring early-stage founders.",
    location: "San Francisco, CA",
    joined_date: "2023-01-15T00:00:00Z",
    role: "admin",
    posts_count: 45,
    communities_count: 8,
    connections_count: 234,
  social_links: [
    {
      platform: "LinkedIn",
      url: "https://linkedin.com/in/sarahchen",
      icon: Linkedin
    },
    {
      platform: "Twitter",
      url: "https://twitter.com/sarahchen",
      icon: Twitter
    },
    {
      platform: "GitHub",
      url: "https://github.com/sarahchen",
      icon: Github
    },
    {
      platform: "Website",
      url: "https://sarahchen.com",
      icon: Globe
    },
    {
      platform: "Instagram",
      url: "https://instagram.com/sarahchen",
      icon: Instagram
    }
  ],
  experience: [
    {
      id: 1,
      title: "Founder & CEO",
      company: "HealthTech AI",
      duration: "2022 - Present",
      description: "Building AI-powered diagnostic tools for early disease detection. Raised $5M Series A.",
      current: true
    },
    {
      id: 2,
      title: "Co-Founder & CTO",
      company: "MedConnect",
      duration: "2019 - 2022",
      description: "Telemedicine platform connecting patients with specialists. Successfully acquired by HealthCorp."
    },
    {
      id: 3,
      title: "Senior Software Engineer",
      company: "Google",
      duration: "2017 - 2019",
      description: "Worked on machine learning infrastructure for Google Cloud Platform."
    }
  ],
  education: [
    {
      id: 1,
      degree: "MS Computer Science",
      school: "Stanford University",
      year: "2017"
    },
    {
      id: 2,
      degree: "BS Electrical Engineering",
      school: "UC Berkeley",
      year: "2015"
    }
  ],
  achievements: [
    {
      id: 1,
      title: "Forbes 30 Under 30",
      description: "Healthcare category for innovative AI diagnostic solutions",
      date: "2023"
    },
    {
      id: 2,
      title: "TechCrunch Disrupt Winner",
      description: "First place in Healthcare & Biotech category",
      date: "2022"
    }
  ],
  skills: ["Artificial Intelligence", "Machine Learning", "Healthcare Technology", "Startup Leadership", "Product Strategy", "Fundraising"],
    interests: ["AI Ethics", "Digital Health", "Mentoring", "Rock Climbing", "Photography"],
    is_own_profile: false,
    is_connected: false
  },
  "2": {
    id: 2,
    name: "Mike Johnson",
    avatar: "/avatars/mike.jpg",
    bio: "Experienced CTO with 10+ years building scalable systems. Currently leading engineering at a fast-growing startup. Love mentoring junior developers and contributing to open source.",
    location: "Austin, TX",
    joined_date: "2023-02-10T00:00:00Z",
    role: "moderator",
    posts_count: 32,
    communities_count: 5,
    connections_count: 156,
    social_links: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/mikejohnson",
        icon: Linkedin
      },
      {
        platform: "GitHub",
        url: "https://github.com/mikejohnson",
        icon: Github
      },
      {
        platform: "Twitter",
        url: "https://twitter.com/mikejohnson",
        icon: Twitter
      }
    ],
    experience: [
      {
        id: 1,
        title: "CTO",
        company: "StartupXYZ",
        duration: "2021 - Present",
        description: "Leading engineering team of 15+ developers. Built scalable architecture serving 1M+ users.",
        current: true
      },
      {
        id: 2,
        title: "Senior Engineering Manager",
        company: "TechCorp",
        duration: "2018 - 2021",
        description: "Managed multiple engineering teams and delivered key product features."
      }
    ],
    education: [
      {
        id: 1,
        degree: "BS Computer Science",
        school: "University of Texas",
        year: "2013"
      }
    ],
    achievements: [
      {
        id: 1,
        title: "Open Source Contributor",
        description: "Maintainer of popular React library with 10k+ stars",
        date: "2020"
      }
    ],
    skills: ["React", "Node.js", "System Architecture", "Team Leadership", "DevOps", "Microservices"],
    interests: ["Open Source", "System Design", "Mentoring", "Hiking", "Coffee"],
    is_own_profile: false,
    is_connected: false
  },
  "3": {
    id: 3,
    name: "Lisa Wang",
    avatar: "/avatars/lisa.jpg",
    bio: "Product Manager passionate about building user-centric solutions. Previously at Google and Facebook. Currently working on fintech products that democratize investing.",
    location: "New York, NY",
    joined_date: "2023-03-05T00:00:00Z",
    role: "member",
    posts_count: 28,
    communities_count: 6,
    connections_count: 189,
    social_links: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/lisawang",
        icon: Linkedin
      },
      {
        platform: "Twitter",
        url: "https://twitter.com/lisawang",
        icon: Twitter
      },
      {
        platform: "Website",
        url: "https://lisawang.com",
        icon: Globe
      }
    ],
    experience: [
      {
        id: 1,
        title: "Senior Product Manager",
        company: "FinTech Startup",
        duration: "2022 - Present",
        description: "Leading product strategy for investment platform. Grew user base by 300%.",
        current: true
      },
      {
        id: 2,
        title: "Product Manager",
        company: "Facebook",
        duration: "2020 - 2022",
        description: "Worked on Instagram Shopping features, driving significant revenue growth."
      },
      {
        id: 3,
        title: "Associate Product Manager",
        company: "Google",
        duration: "2018 - 2020",
        description: "Launched new features for Google Pay, improving user engagement by 40%."
      }
    ],
    education: [
      {
        id: 1,
        degree: "MBA",
        school: "Wharton School",
        year: "2018"
      },
      {
        id: 2,
        degree: "BS Economics",
        school: "University of Pennsylvania",
        year: "2016"
      }
    ],
    achievements: [
      {
        id: 1,
        title: "Product Leader of the Year",
        description: "Internal recognition at Facebook for outstanding product impact",
        date: "2021"
      }
    ],
    skills: ["Product Strategy", "User Research", "Data Analysis", "A/B Testing", "Fintech", "Mobile Products"],
    interests: ["Product Design", "Behavioral Economics", "Yoga", "Travel", "Cooking"],
    is_own_profile: false,
    is_connected: false
  }
}

export default function ProfilePage() {
  const params = useParams()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'posts' | 'communities'>('about')

  useEffect(() => {
    loadProfile()
  }, [params.id])

  const loadProfile = () => {
    try {
      const profileId = params.id as string
      const foundProfile = MOCK_PROFILES[profileId]
      
      if (foundProfile) {
        setProfile(foundProfile)
      } else {
        // Fallback to first profile if ID not found
        setProfile(MOCK_PROFILES["1"])
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      setProfile(MOCK_PROFILES["1"])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const handleConnect = () => {
    setProfile(prev => {
      if (!prev) return prev
      return {
        ...prev,
        is_connected: !prev.is_connected,
        connections_count: prev.is_connected ? prev.connections_count - 1 : prev.connections_count + 1
      }
    })
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <section className="flex items-center justify-between">
        <Link 
          href="/communities"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Communities</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </section>

      {/* Profile Header */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100"></div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 -mt-16 md:-mt-12">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                {profile.name.charAt(0)}
              </div>
              {profile.role === 'admin' && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
              {profile.role === 'moderator' && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Star className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">{profile.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profile.joined_date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="capitalize font-medium text-gray-700">{profile.role}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-6 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>

              {/* Social Links */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {profile.social_links.map((link) => {
                  const IconComponent = link.icon
                  return (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{link.platform}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {profile.is_own_profile ? (
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
                  <Edit className="w-5 h-5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleConnect}
                    className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                      profile.is_connected
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {profile.is_connected ? (
                      <>
                        <Users className="w-5 h-5" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Message</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 mt-8 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{profile.posts_count}</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{profile.communities_count}</div>
              <div className="text-sm text-gray-600">Communities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{profile.connections_count}</div>
              <div className="text-sm text-gray-600">Connections</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center p-6 border-b border-gray-100">
          <div className="flex space-x-8">
            {[
              { key: 'about', label: 'About', icon: Users },
              { key: 'experience', label: 'Experience', icon: Briefcase },
              { key: 'posts', label: 'Posts', icon: MessageCircle },
              { key: 'communities', label: 'Communities', icon: Users }
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
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-8">
              {/* Skills */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              {profile.achievements.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Achievements</h3>
                  <div className="space-y-4">
                    {profile.achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                          <p className="text-gray-700 mb-2">{achievement.description}</p>
                          <p className="text-sm text-gray-600">{achievement.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-8">
              {/* Work Experience */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Work Experience</h3>
                <div className="space-y-6">
                  {profile.experience.map((exp) => (
                    <div key={exp.id} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                            <p className="text-blue-600 font-medium">{exp.company}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{exp.duration}</p>
                            {exp.current && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                Current
                              </span>
                            )}
                          </div>
                        </div>
                        {exp.description && (
                          <p className="text-gray-700">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Education</h3>
                <div className="space-y-6">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                            <p className="text-purple-600 font-medium">{edu.school}</p>
                          </div>
                          <p className="text-sm text-gray-600">{edu.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">Posts from this user will appear here</p>
            </div>
          )}

          {/* Communities Tab */}
          {activeTab === 'communities' && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Communities</h3>
              <p className="text-gray-600">Member of {profile.communities_count} communities</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}