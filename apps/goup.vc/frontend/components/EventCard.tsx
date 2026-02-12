import { useState } from 'react'
import Image from 'next/image'
import { Event } from '@/types/event'
import DeleteEventButton from './DeleteEventButton'
import { Check } from 'lucide-react'

interface EventCardProps {
  event: Event
  showOrganizerControls?: boolean
  onEventDeleted?: () => void
}

export default function EventCard({ event, showOrganizerControls = false, onEventDeleted }: EventCardProps) {
  const [rsvpStatus, setRsvpStatus] = useState<'none' | 'joining' | 'joined'>('none')

  const handleQuickJoin = async () => {
    if (rsvpStatus === 'joined') return
    
    setRsvpStatus('joining')
    try {
      console.log('Joining event from card:', event.id)
      
      const response = await fetch(`http://localhost:8000/events/${event.id}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'attending',
          message: null
        }),
      })

      console.log('Join response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Join successful:', result)
        setRsvpStatus('joined')
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        console.error('Join failed:', errorData)
        setRsvpStatus('none')
      }
    } catch (error) {
      console.error('Failed to join event:', error)
      setRsvpStatus('none')
    }
  }

  const getJoinButtonContent = () => {
    switch (rsvpStatus) {
      case 'joining':
        return { text: 'Joining...', className: 'bg-gray-400 cursor-not-allowed', disabled: true }
      case 'joined':
        return { 
          text: (
            <span className="flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Joined</span>
            </span>
          ), 
          className: 'bg-green-600 cursor-default', 
          disabled: true 
        }
      default:
        return { text: 'Join', className: 'bg-green-600 hover:bg-green-700', disabled: false }
    }
  }

  const joinButton = getJoinButtonContent()
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-8 cursor-pointer group border border-gray-100 hover:border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-gray-500 font-medium tracking-wide bg-gray-50 px-3 py-1 rounded-full">
              {event.time}
            </span>
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
              {event.dateLabel}
            </span>
          </div>
          
          <h3 className="text-xl font-medium text-gray-900 mb-4 group-hover:text-blue-600 transition-colors tracking-tight leading-tight">
            {event.title}
          </h3>
          
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {event.organizer.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-gray-600 font-light">By {event.organizer}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              </div>
              <span className="text-sm text-gray-600 font-light">{event.location}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {event.attendeesAvatars.slice(0, 3).map((avatar, index) => (
                    <div
                      key={index}
                      className="w-7 h-7 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-xs font-medium text-gray-600">
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                  ))}
                </div>
                {event.invitedCount > 3 && (
                  <span className="text-sm text-gray-500 font-light">
                    +{event.invitedCount - 3} attending
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleQuickJoin()
              }}
              disabled={joinButton.disabled}
              className={`px-4 py-2 text-white text-sm font-medium rounded-full transition-all duration-200 hover:scale-105 shadow-md ${joinButton.className}`}
            >
              {joinButton.text}
            </button>
          </div>
        </div>
        
        <div className="ml-8 flex-shrink-0 relative">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-md">
            <Image
              src={event.image}
              alt={event.title}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          
          {showOrganizerControls && (
            <div className="absolute -top-2 -right-2">
              <DeleteEventButton
                eventId={event.id}
                eventTitle={event.title}
                onDelete={onEventDeleted}
                className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}