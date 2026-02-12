'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, Users, Heart, Zap, Award, Coffee, Briefcase, Calendar } from 'lucide-react'

interface JobPosting {
  id: number
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
  benefits: string[]
  posted_date: string
}

interface CareersData {
  company_culture: string
  benefits: string[]
  open_positions: JobPosting[]
  values: string[]
  perks: string[]
}

export default function CareersPage() {
  const [careersData, setCareersData] = useState<CareersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All')

  useEffect(() => {
    loadCareersData()
  }, [])

  const loadCareersData = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/careers')
      const data = await response.json()
      setCareersData(data)
    } catch (error) {
      console.error('Failed to load careers data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!careersData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Unable to load content</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  const departments = ['All', ...Array.from(new Set(careersData.open_positions.map(job => job.department)))]
  const filteredJobs = selectedDepartment === 'All' 
    ? careersData.open_positions 
    : careersData.open_positions.filter(job => job.department === selectedDepartment)

  return (
    <div className="space-y-16">
      {/* Header */}
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-gray-900 mb-6">
          Join Our Team
        </h1>
        <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
          Help us build the future of meaningful connections in the startup ecosystem.
        </p>
      </section>

      {/* Company Culture */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <Heart className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-semibold text-gray-900">Our Culture</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            {careersData.company_culture}
          </p>
        </div>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">What We Believe In</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {careersData.values.map((value, index) => {
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

      {/* Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">Benefits & Perks</h2>
          <div className="space-y-4">
            {careersData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <p className="text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">Additional Perks</h2>
          <div className="space-y-4">
            {careersData.perks.map((perk, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <Coffee className="w-3 h-3 text-blue-600" />
                </div>
                <p className="text-gray-700">{perk}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section>
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4 md:mb-0">Open Positions</h2>
          
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDepartment === dept
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No positions available</h3>
            <p className="text-gray-600">Check back soon for new opportunities!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-2xl font-semibold text-gray-900">{job.title}</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {job.department}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Posted {formatDate(job.posted_date)}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-6 leading-relaxed">{job.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                        <ul className="space-y-2">
                          {job.requirements.map((req, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2"></div>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">What You'll Get</h4>
                        <ul className="space-y-2">
                          {job.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 lg:mt-0 lg:ml-8">
                    <button className="w-full lg:w-auto bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-md">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="text-center bg-white rounded-2xl p-12 border border-gray-100 shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Don't see the right role?</h2>
        <p className="text-xl text-gray-600 font-light mb-8 max-w-2xl mx-auto">
          We're always looking for talented people to join our mission. Send us your resume and tell us how you'd like to contribute.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-full font-medium transition-colors">
            Send Resume
          </button>
          <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  )
}