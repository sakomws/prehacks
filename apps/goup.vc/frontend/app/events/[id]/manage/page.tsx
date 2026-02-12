'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Check, X, Clock, Users, Mail, MessageSquare, UserPlus, Crown, Trash2, AlertTriangle } from 'lucide-react'

interface RSVP {
  id: number
  user: {
    id: number
    full_name: string
    email: string
    avatar_url?: string
  }
  status: string
  message?: string
  response_message?: string
  created_at: string
  updated_at: string
}

interface HostRequest {
  id: number
  requester: {
    id: number
    full_name: string
    email: string
    avatar_url?: string
  }
  requested_user: {
    id: number
    full_name: string
    email: string
    avatar_url?: string
  }
  request_type: string
  status: string
  message?: string
  response_message?: string
  created_at: string
}

export default function EventManagePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  const [activeTab, setActiveTab] = useState<'rsvps' | 'requests'>('rsvps')
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [hostRequests, setHostRequests] = useState<HostRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [eventId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load RSVPs
      const rsvpResponse = await fetch(`http://localhost:8000/events/${eventId}/rsvps`)
      if (rsvpResponse.ok) {
        const rsvpData = await rsvpResponse.json()
        setRsvps(rsvpData)
      }

      // Load host requests
      const requestResponse = await fetch(`http://localhost:8000/host-requests?event_id=${eventId}`)
      if (requestResponse.ok) {
        const requestData = await requestResponse.json()
        setHostRequests(requestData)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRSVPAction = async (rsvpId: number, status: string, responseMessage?: string) => {
    try {
      const response = await fetch(`http://localhost:8000/rsvps/${rsvpId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          response_message: responseMessage
        }),
      })

      if (response.ok) {
        loadData() // Reload data
      }
    } catch (error) {
      console.error('Failed to update RSVP:', error)
    }
  }

  const handleHostRequestAction = async (requestId: number, status: string, responseMessage?: string) => {
    try {
      const response = await fetch(`http://localhost:8000/host-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          response_message: responseMessage
        }),
      })

      if (response.ok) {
        loadData() // Reload data
      }
    } catch (error) {
      console.error('Failed to update host request:', error)
    }
  }

  const handleDeleteEvent = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`http://localhost:8000/events/${eventId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Redirect to events page after successful deletion
        router.push('/events')
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        alert(`Failed to delete event: ${errorData.detail}`)
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('Failed to delete event. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'attending': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <Check className="w-4 h-4" />
      case 'declined': return <X className="w-4 h-4" />
      case 'attending': return <Users className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-1">
            {rsvps.filter(r => r.status === 'attending').length} attending • {rsvps.filter(r => r.status === 'pending').length} pending approval
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Event</span>
          </button>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('rsvps')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'rsvps'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Attendees ({rsvps.filter(r => r.status === 'attending').length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'requests'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending ({rsvps.filter(r => r.status === 'pending').length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'rsvps' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Confirmed Attendees</h2>
          
          {rsvps.filter(r => r.status === 'attending').length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No confirmed attendees yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rsvps.filter(r => r.status === 'attending').map((rsvp) => (
                <div key={rsvp.id} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {rsvp.user.full_name.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{rsvp.user.full_name}</h3>
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rsvp.status)}`}>
                            {getStatusIcon(rsvp.status)}
                            <span className="capitalize">{rsvp.status}</span>
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-500">{rsvp.user.email}</p>
                        
                        {rsvp.message && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-500">Message</span>
                            </div>
                            <p className="text-sm text-gray-700">{rsvp.message}</p>
                          </div>
                        )}
                        
                        {rsvp.response_message && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Mail className="w-4 h-4 text-blue-400" />
                              <span className="text-xs font-medium text-blue-500">Your Response</span>
                            </div>
                            <p className="text-sm text-blue-700">{rsvp.response_message}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {rsvp.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRSVPAction(rsvp.id, 'approved', 'Welcome! Looking forward to seeing you at the event.')}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRSVPAction(rsvp.id, 'declined', 'Thank you for your interest. Unfortunately, we cannot accommodate your request at this time.')}
                          className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
          
          {rsvps.filter(r => r.status === 'pending').length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rsvps.filter(r => r.status === 'pending').map((rsvp) => (
                <div key={rsvp.id} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {rsvp.user.full_name.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{rsvp.user.full_name}</h3>
                          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-500">{rsvp.user.email}</p>
                        
                        {rsvp.message && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-500">Message</span>
                            </div>
                            <p className="text-sm text-gray-700">{rsvp.message}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRSVPAction(rsvp.id, 'approved', 'Welcome! Looking forward to seeing you at the event.')}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRSVPAction(rsvp.id, 'declined', 'Thank you for your interest. Unfortunately, we cannot accommodate your request at this time.')}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-sm mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete this event? This will:
              </p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Remove the event permanently</li>
                <li>• Cancel all RSVPs</li>
                <li>• Delete all event data</li>
                <li>• Notify all attendees</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}