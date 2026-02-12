'use client'

import { useState, useEffect } from 'react'
import { Users, Eye, EyeOff } from 'lucide-react'

interface Attendee {
  id: number
  user: {
    id: number
    full_name: string
    email: string
    avatar_url?: string
  }
  status: string
  created_at: string
}

interface AttendeesListProps {
  eventId: string
  userStatus: string // 'attending', 'approved', 'not_attending', etc.
  isOrganizer?: boolean
}

export default function AttendeesList({ eventId, userStatus, isOrganizer = false }: AttendeesListProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    if (userStatus === 'attending' || userStatus === 'approved' || isOrganizer) {
      loadAttendees()
    }
  }, [eventId, userStatus, isOrganizer])

  const loadAttendees = async () => {
    setLoading(true)
    try {
      // Load both attending and approved attendees for the public list
      const [attendingResponse, approvedResponse] = await Promise.all([
        fetch(`http://localhost:8000/events/${eventId}/rsvps?status=attending`),
        fetch(`http://localhost:8000/events/${eventId}/rsvps?status=approved`)
      ])
      if (attendingResponse.ok && approvedResponse.ok) {
        const [attendingData, approvedData] = await Promise.all([
          attendingResponse.json(),
          approvedResponse.json()
        ])
        // Combine both attending and approved attendees
        const allAttendees = [...attendingData, ...approvedData]
        setAttendees(allAttendees)
      }
    } catch (error) {
      console.error('Failed to load attendees:', error)
    } finally {
      setLoading(false)
    }
  }

  // Only show attendees list if user is attending/approved or is organizer
  if (userStatus !== 'attending' && userStatus !== 'approved' && !isOrganizer) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Attendees</h3>
        </div>
        
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <EyeOff className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">
            Join the event to see who else is attending
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Attendees</h3>
        </div>
        
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">
            Attendees ({attendees.length})
          </h3>
        </div>
        
        <button
          onClick={() => setShowList(!showList)}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          {showList ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Hide</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Show</span>
            </>
          )}
        </button>
      </div>

      {showList ? (
        <div className="space-y-3">
          {attendees.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">No attendees yet</p>
            </div>
          ) : (
            <>
              {attendees.slice(0, 10).map((attendee) => (
                <div key={attendee.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {attendee.user.full_name.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{attendee.user.full_name}</p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(attendee.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    attendee.status === 'approved' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {attendee.status === 'approved' ? 'Approved' : 'Attending'}
                  </div>
                </div>
              ))}
              
              {attendees.length > 10 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500">
                    +{attendees.length - 10} more attendees
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex -space-x-2">
          {attendees.slice(0, 5).map((attendee, index) => (
            <div
              key={attendee.id}
              className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center"
              title={attendee.user.full_name}
            >
              <span className="text-xs font-medium text-gray-600">
                {attendee.user.full_name.charAt(0)}
              </span>
            </div>
          ))}
          
          {attendees.length > 5 && (
            <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                +{attendees.length - 5}
              </span>
            </div>
          )}
          
          {attendees.length === 0 && (
            <p className="text-sm text-gray-500">No attendees yet</p>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>You're in!</strong> Connect with other attendees and get excited for the event.
        </p>
      </div>
    </div>
  )
}