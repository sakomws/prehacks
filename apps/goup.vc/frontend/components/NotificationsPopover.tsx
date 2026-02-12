'use client'

import { useEffect, useRef, useState } from 'react'
import { getConversations } from '@/lib/api'

interface NotificationsPopoverProps {
  onClose: () => void
}



export default function NotificationsPopover({ onClose }: NotificationsPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      // Get conversations that need action as notifications
      const conversations = await getConversations(1, 'all', 'focus')
      const notificationData = conversations.map((conv, index) => ({
        id: conv.id,
        name: conv.participants.find(p => p.id !== 1)?.full_name || 'System',
        action: conv.action_type || 'sent a message in',
        event: conv.title,
        time: conv.last_activity,
        note: conv.ai_summary
      }))
      setNotifications(notificationData)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden z-50"
    >
      <div className="px-4 py-3 border-b border-black/5">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No new notifications</div>
        ) : (
          notifications.map((notification, index) => (
          <div key={notification.id}>
            <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-gray-900">{notification.name}</span>
                        <span className="text-gray-600"> {notification.action}</span>
                        {notification.event && (
                          <span className="font-semibold text-gray-900"> {notification.event}</span>
                        )}
                      </p>
                      {notification.note && (
                        <p className="text-xs text-gray-500 mt-1">{notification.note}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-xs text-gray-400">{notification.time}</span>
                      <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {index < notifications.length - 1 && (
              <div className="border-t border-black/5 mx-4"></div>
            )}
          </div>
        )))}
      </div>
    </div>
  )
}