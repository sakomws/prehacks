'use client'

import { useState, useEffect } from 'react'
import { Users, Target, Heart, Zap, TrendingUp, Globe, Award, Coffee } from 'lucide-react'

interface TeamMember {
  name: string
  role: string
  bio: string
  avatar: string
  linkedin: string
}

interface AboutData {
  title: string
  subtitle: string
  mission: string
  vision: string
  values: string[]
  team_members: TeamMember[]
  stats: {
    events_hosted: string
    connections_made: string
    cities: string
    success_stories: string
  }
  story: string
}

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAboutData()
  }, [])

  const loadAboutData = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/about')
      const data = await response.json()
      setAboutData(data)
    } catch (error) {
      console.error('Failed to load about data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!aboutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Unable to load content</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-gray-900 mb-6">
          {aboutData.title}
        </h1>
        <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
          {aboutData.subtitle}
        </p>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{aboutData.stats.events_hosted}</div>
            <div className="text-sm text-gray-600 font-medium">Events Hosted</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{aboutData.stats.connections_made}</div>
            <div className="text-sm text-gray-600 font-medium">Connections Made</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{aboutData.stats.cities}</div>
            <div className="text-sm text-gray-600 font-medium">Cities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{aboutData.stats.success_stories}</div>
            <div className="text-sm text-gray-600 font-medium">Success Stories</div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{aboutData.mission}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Our Vision</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{aboutData.vision}</p>
        </div>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aboutData.values.map((value, index) => {
            const icons = [Heart, Zap, Users, Award]
            const colors = ['text-red-600 bg-red-100', 'text-yellow-600 bg-yellow-100', 'text-blue-600 bg-blue-100', 'text-green-600 bg-green-100']
            const Icon = icons[index % icons.length]
            const colorClass = colors[index % colors.length]
            
            return (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700 leading-relaxed flex-1">{value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Team */}
      <section>
        <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {aboutData.team_members.map((member, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-blue-600 font-medium mb-4">{member.role}</p>
              <p className="text-gray-600 leading-relaxed text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <Coffee className="w-8 h-8 text-gray-600" />
            <h2 className="text-3xl font-semibold text-gray-900">Our Story</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            {aboutData.story}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-white rounded-2xl p-12 border border-gray-100 shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Ready to join our mission?</h2>
        <p className="text-xl text-gray-600 font-light mb-8 max-w-2xl mx-auto">
          Help us build the future of meaningful connections in the startup ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-medium text-lg transition-all duration-200 hover:scale-105 shadow-lg">
            Get Started
          </button>
          <a href="/careers" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
            View Open Positions
          </a>
        </div>
      </section>
    </div>
  )
}