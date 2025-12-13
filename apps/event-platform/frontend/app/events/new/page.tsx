'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Navbar from '../../components/Navbar'

const API_BASE_URL = 'http://localhost:8002'

interface Calendar {
  id: string
  name: string
}

export default function CreateEventPage() {
  const router = useRouter()
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCalendar, setSelectedCalendar] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    location_type: 'offline',
    location_address: '',
    location_url: '',
    capacity: '',
    requires_approval: false,
    ticket_type: 'free',
    ticket_price: '',
    currency: 'USD',
    category: '',
    visibility: 'public'
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    const fetchCalendars = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/calendars`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setCalendars(response.data)
        if (response.data.length > 0) {
          setSelectedCalendar(response.data[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch calendars:', error)
      }
    }

    fetchCalendars()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token || !selectedCalendar) return

    setIsLoading(true)
    try {
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`)
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`)

      const eventData = {
        title: formData.title,
        description: formData.description || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location_type: formData.location_type,
        location_address: formData.location_address || null,
        location_url: formData.location_url || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        requires_approval: formData.requires_approval,
        ticket_type: formData.ticket_type,
        ticket_price_cents:
          formData.ticket_type === 'paid' && formData.ticket_price
            ? Math.round(parseFloat(formData.ticket_price) * 100)
            : null,
        currency: formData.ticket_type === 'paid' ? formData.currency : null,
        category: formData.category || null,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      await axios.post(
        `${API_BASE_URL}/api/calendars/${selectedCalendar}/events`,
        eventData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      router.push('/events')
    } catch (error: any) {
      alert('Failed to create event: ' + (error.response?.data?.detail || error.message))
    } finally {
      setIsLoading(false)
    }
  }

  // Set default dates
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]
    const timeStr = '18:00'

    setFormData((prev) => ({
      ...prev,
      start_date: dateStr,
      start_time: timeStr,
      end_date: dateStr,
      end_time: '19:00'
    }))
  }, [])

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Event</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Calendar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calendar
            </label>
            <select
              value={selectedCalendar}
              onChange={(e) => setSelectedCalendar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {calendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event name"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Type
            </label>
            <select
              value={formData.location_type}
              onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {formData.location_type !== 'online' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Address
              </label>
              <input
                type="text"
                value={formData.location_address}
                onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address"
              />
            </div>
          )}

          {formData.location_type !== 'offline' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting URL
              </label>
              <input
                type="url"
                value={formData.location_url}
                onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your event..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              <option value="tech">Tech</option>
              <option value="business">Business</option>
              <option value="networking">Networking</option>
              <option value="education">Education</option>
              <option value="entertainment">Entertainment</option>
              <option value="food">Food & Drink</option>
              <option value="ai">AI</option>
              <option value="arts">Arts & Culture</option>
            </select>
          </div>

          {/* Ticket Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Type</label>
            <select
              value={formData.ticket_type}
              onChange={(e) => setFormData({ ...formData, ticket_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="donation">Donation</option>
            </select>
          </div>

          {formData.ticket_type === 'paid' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ticket_price}
                  onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          )}

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Leave empty for unlimited"
            />
          </div>

          {/* Requires Approval */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requires_approval"
              checked={formData.requires_approval}
              onChange={(e) =>
                setFormData({ ...formData, requires_approval: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requires_approval" className="ml-2 block text-sm text-gray-700">
              Require approval for registrations
            </label>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

