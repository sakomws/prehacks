'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'

interface DeleteEventButtonProps {
  eventId: string
  eventTitle: string
  onDelete?: () => void
  className?: string
}

export default function DeleteEventButton({ eventId, eventTitle, onDelete, className = '' }: DeleteEventButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      console.log('Deleting event with ID:', eventId)
      const response = await fetch(`http://localhost:8000/events/${eventId}`, {
        method: 'DELETE',
      })

      console.log('Delete response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Delete successful:', result)
        onDelete?.()
        setShowModal(false)
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        console.error('Delete failed:', errorData)
        alert(`Failed to delete event: ${errorData.detail}`)
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('Failed to delete event. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowModal(true)
        }}
        className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${className}`}
        title="Delete event"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Delete Confirmation Modal */}
      {showModal && (
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
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete <strong>"{eventTitle}"</strong>?
              </p>
              <p className="text-sm text-gray-600">
                This will permanently remove the event and notify all attendees.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}