'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Shuffle, ChevronDown, Edit3, ToggleLeft, ToggleRight, Plus, X, Users } from 'lucide-react'

export default function CreatePage() {
  const router = useRouter()
  const [requireApproval, setRequireApproval] = useState(false)
  const [eventName, setEventName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [cohosts, setCohosts] = useState<string[]>([])
  const [cohostInput, setCohostInput] = useState('')
  
  // New state for additional fields
  const [startDate, setStartDate] = useState('2024-12-18')
  const [startTime, setStartTime] = useState('19:00')
  const [endDate, setEndDate] = useState('2024-12-18')
  const [endTime, setEndTime] = useState('22:00')
  const [ticketPrice, setTicketPrice] = useState('Free')
  const [capacity, setCapacity] = useState<string>('Unlimited')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  
  // Modal states
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showCapacityModal, setShowCapacityModal] = useState(false)

  const addCohost = () => {
    if (cohostInput.trim() && !cohosts.includes(cohostInput.trim())) {
      setCohosts([...cohosts, cohostInput.trim()])
      setCohostInput('')
    }
  }

  const removeCohost = (cohostToRemove: string) => {
    setCohosts(cohosts.filter(cohost => cohost !== cohostToRemove))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCoverImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateEvent = async () => {
    if (!eventName.trim()) {
      setError('Please enter an event name')
      return
    }

    setIsCreating(true)
    setError('')
    
    try {
      // For demo purposes, we'll use mock cohost IDs (2, 3, 4, 5 for existing users)
      const cohostIds = cohosts.slice(0, 4).map((_, index) => index + 2)
      
      // Combine date and time for start/end times
      const startDateTime = new Date(`${startDate}T${startTime}:00Z`).toISOString()
      const endDateTime = new Date(`${endDate}T${endTime}:00Z`).toISOString()
      
      const eventData = {
        title: eventName.trim(),
        description: description.trim() || null,
        start_time: startDateTime,
        end_time: endDateTime,
        location: location.trim() || 'Virtual',
        organizer_id: 1,
        requires_approval: requireApproval,
        is_public: true,
        capacity: capacity === 'Unlimited' ? null : parseInt(capacity),
        ticket_price: ticketPrice,
        cover_image_url: coverImagePreview, // In a real app, you'd upload to a CDN first
        cohost_ids: cohostIds
      }

      console.log('Creating event with data:', eventData)

      const response = await fetch('http://localhost:8000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Event created successfully:', result)
        // Redirect to events page
        router.push('/events')
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(errorData.detail || 'Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      setError(error instanceof Error ? error.message : 'Failed to create event. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-semibold tracking-tight text-gray-900">Create Event</h1>
      
      <div className="grid grid-cols-2 gap-12">
        {/* Left Column - Cover & Theme */}
        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl aspect-video flex items-center justify-center overflow-hidden">
            {coverImagePreview ? (
              <img 
                src={coverImagePreview} 
                alt="Event cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <p className="text-white/80">Add Cover Image</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button 
              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
              className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <Camera className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3">
              <span className="text-sm font-medium text-gray-700">Theme — Minimal</span>
            </div>
            <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
              <Shuffle className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="space-y-6">
          {/* Calendar & Visibility */}
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <span>Personal Calendar</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <span>Public</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Event Name */}
          <div>
            <input
              type="text"
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full text-5xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent focus:outline-none"
            />
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 w-16">Start</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors border-none outline-none"
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors border-none outline-none"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 w-16">End</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors border-none outline-none"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors border-none outline-none"
              />
              <button className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl text-xs text-gray-600 ml-auto">
                GMT-08:00 Los Angeles
              </button>
            </div>
          </div>

          {/* Location */}
          <div>
            <input
              type="text"
              placeholder="Add Event Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-2">Offline location or virtual link</p>
          </div>

          {/* Description */}
          <div>
            <textarea
              placeholder="Add Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
            />
          </div>

          {/* Co-hosts */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Co-hosts</h3>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add co-host by name or email"
                value={cohostInput}
                onChange={(e) => setCohostInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCohost()}
                className="flex-1 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              />
              <button
                onClick={addCohost}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {cohosts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cohosts.map((cohost, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{cohost}</span>
                    <button
                      onClick={() => removeCohost(cohost)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              Co-hosts can help manage RSVPs and event details
            </p>
          </div>

          {/* Event Options */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Event Options</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Ticket Price</span>
              <button
                onClick={() => setShowTicketModal(true)}
                className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium">{ticketPrice}</span>
                <Edit3 className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Require Approval</span>
              <button
                onClick={() => setRequireApproval(!requireApproval)}
                className="transition-colors"
              >
                {requireApproval ? (
                  <ToggleRight className="w-8 h-8 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Capacity</span>
              <button
                onClick={() => setShowCapacityModal(true)}
                className="flex items-center space-x-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium">{capacity}</span>
                <Edit3 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Create Button */}
          <button 
            onClick={handleCreateEvent}
            disabled={isCreating || !eventName.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition-colors"
          >
            {isCreating ? 'Creating Event...' : 'Create Event'}
          </button>
        </div>
      </div>

      {/* Ticket Price Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Set Ticket Price</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setTicketPrice('Free')
                  setShowTicketModal(false)
                }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  ticketPrice === 'Free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">Free</div>
                <div className="text-sm text-gray-500">No charge for attendees</div>
              </button>
              
              <button
                onClick={() => {
                  setTicketPrice('$10')
                  setShowTicketModal(false)
                }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  ticketPrice === '$10' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">$10</div>
                <div className="text-sm text-gray-500">Standard pricing</div>
              </button>
              
              <button
                onClick={() => {
                  setTicketPrice('$25')
                  setShowTicketModal(false)
                }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  ticketPrice === '$25' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">$25</div>
                <div className="text-sm text-gray-500">Premium event</div>
              </button>
              
              <div className="p-3 rounded-xl border-2 border-gray-200">
                <input
                  type="text"
                  placeholder="Custom price (e.g., $15)"
                  className="w-full outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value
                      if (value.trim()) {
                        setTicketPrice(value.trim())
                        setShowTicketModal(false)
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTicketModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capacity Modal */}
      {showCapacityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Set Event Capacity</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setCapacity('Unlimited')
                  setShowCapacityModal(false)
                }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  capacity === 'Unlimited' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">Unlimited</div>
                <div className="text-sm text-gray-500">No limit on attendees</div>
              </button>
              
              <button
                onClick={() => {
                  setCapacity('50')
                  setShowCapacityModal(false)
                }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  capacity === '50' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">50 people</div>
                <div className="text-sm text-gray-500">Small intimate gathering</div>
              </button>
              
              <button
                onClick={() => {
                  setCapacity('100')
                  setShowCapacityModal(false)
                }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  capacity === '100' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">100 people</div>
                <div className="text-sm text-gray-500">Medium sized event</div>
              </button>
              
              <button
                onClick={() => {
                  setCapacity('200')
                  setShowCapacityModal(false)
                }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${
                  capacity === '200' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">200 people</div>
                <div className="text-sm text-gray-500">Large event</div>
              </button>
              
              <div className="p-3 rounded-xl border-2 border-gray-200">
                <input
                  type="number"
                  placeholder="Custom capacity"
                  className="w-full outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value
                      if (value.trim() && parseInt(value) > 0) {
                        setCapacity(value.trim())
                        setShowCapacityModal(false)
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCapacityModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}