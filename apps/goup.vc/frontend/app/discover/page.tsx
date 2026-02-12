'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, MapPin } from 'lucide-react'

interface PopularEvent {
  title: string
  time: string
  venue?: string
  thumbnail: string
}

interface Category {
  name: string
  count: string
  color: string
  icon: string
}


export default function DiscoverPage() {
  const [popularEvents, setPopularEvents] = useState<PopularEvent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDiscoverData()
  }, [])

  const loadDiscoverData = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/discover/events')
      const data = await response.json()
      
      setPopularEvents(data.popularEvents)
      setCategories(data.categories)
    } catch (error) {
      console.error('Failed to load discover data:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-4">Discover Events</h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          Find amazing events happening in your area. Connect with like-minded people and discover new opportunities.
        </p>
      </div>

      {/* Popular Events */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Popular Events</h2>
            <p className="text-sm text-gray-500 mt-1">San Francisco</p>
          </div>
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 text-center">
            <p className="text-gray-500">Loading events...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 divide-y divide-black/5">
            {popularEvents.map((event, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">{event.time}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                  {event.venue && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.venue}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      <div className="border-t border-black/5"></div>

      {/* Browse by Category */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
        
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${category.color}`}>
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-black/5"></div>

      {/* Featured Calendars */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured Calendars</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
          <p className="text-gray-500 text-center">Featured calendars coming soon...</p>
        </div>
      </div>
    </div>
  )
}