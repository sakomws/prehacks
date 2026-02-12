'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface EventRSVPProps {
  eventId: string
  userStatus?: string
  onRSVPUpdate?: (status: string) => void
}

export default function EventRSVP({ eventId, userStatus, onRSVPUpdate }: EventRSVPProps) {
  const [status, setStatus] = useState(userStatus || 'not_attending')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleJoinEvent = async () => {
    setIsSubmitting(true)
    try {
      console.log('Joining event:', eventId)
      
      const response = await fetch(`http://localhost:8000/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'attending',
          message: null
        }),
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Join successful:', result)
        setStatus('attending')
        onRSVPUpdate?.('attending')
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        console.error('Join failed:', errorData)
        alert(`Failed to join event: ${errorData.detail}`)
      }
    } catch (error) {
      console.error('Failed to join event:', error)
      alert('Failed to join event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLeaveEvent = async () => {
    setIsSubmitting(true)
    try {
      // For simplicity, we'll just update the local state
      // In a real app, you might want to call a leave endpoint
      setStatus('not_attending')
      onRSVPUpdate?.('not_attending')
    } catch (error) {
      console.error('Failed to leave event:', error)
      alert('Failed to leave event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Join Event</h3>
      
      <div className="space-y-3">
        {status === 'not_attending' ? (
          <button
            onClick={handleJoinEvent}
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Joining...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Join Event</span>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-600 text-white py-3 px-4 rounded-xl flex items-center justify-center space-x-2">
              <Check className="w-4 h-4" />
              <span className="font-medium">You're attending!</span>
            </div>
            
            <button
              onClick={handleLeaveEvent}
              disabled={isSubmitting}
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-2 rounded-xl font-medium transition-colors"
            >
              {isSubmitting ? 'Leaving...' : 'Leave Event'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Free Event:</strong> Join instantly and connect with other attendees.
        </p>
      </div>
    </div>
  )
}