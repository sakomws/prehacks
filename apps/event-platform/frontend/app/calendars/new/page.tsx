'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Navbar from '../../components/Navbar'

const API_BASE_URL = 'http://localhost:8002'

export default function CreateCalendarPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    visibility: 'public',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }
  }, [router])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50)
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    if (!formData.name || !formData.slug) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/calendars`,
        {
          name: formData.name,
          description: formData.description || null,
          slug: formData.slug,
          visibility: formData.visibility,
          timezone: formData.timezone
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      router.push(`/calendars/${response.data.id}`)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to create calendar'
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Calendar</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Calendar Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calendar Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter calendar name"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              This will be displayed as your calendar's title
            </p>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                event-platform.com/calendars/
              </span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                  })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="my-calendar"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              A unique URL-friendly identifier for your calendar
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what your calendar is about..."
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public - Anyone can find and view your calendar</option>
              <option value="unlisted">
                Unlisted - Only people with the link can view your calendar
              </option>
              <option value="private">Private - Only you and invited members can view</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {formData.visibility === 'public' &&
                'Your calendar will appear in search results and discovery pages'}
              {formData.visibility === 'unlisted' &&
                'Your calendar won\'t appear in search, but anyone with the link can view it'}
              {formData.visibility === 'private' &&
                'Your calendar is only visible to you and members you invite'}
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Australia/Sydney">Sydney (AEST)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              All events in this calendar will be displayed in this timezone
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.slug}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Calendar'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

