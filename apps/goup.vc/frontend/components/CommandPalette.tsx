'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Home, Calendar, Compass, HelpCircle, MessageSquare } from 'lucide-react'
import { getConversations } from '@/lib/api'

interface CommandPaletteProps {
  onClose: () => void
}

const shortcuts = [
  { icon: Plus, label: 'Create Event', shortcut: '⌘N' },
  { icon: Home, label: 'Open Home', shortcut: '⌘H' },
  { icon: Calendar, label: 'Open Calendars', shortcut: '⌘C' },
  { icon: Compass, label: 'Open Discover', shortcut: '⌘D' },
  { icon: HelpCircle, label: 'Open Help', shortcut: '⌘?' },
]

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const data = await getConversations(1)
      setConversations(data.slice(0, 4)) // Show top 4 conversations
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="flex items-start justify-center pt-20">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden">
          <div className="flex items-center px-6 py-4 border-b border-black/5">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search for events, calendars and more…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-lg outline-none"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            <div className="px-6 py-4">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Shortcuts
              </div>
              <div className="space-y-1">
                {shortcuts.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <item.icon className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">{item.shortcut}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-black/5">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Recent Conversations
              </div>
              <div className="space-y-1">
                {loading ? (
                  <div className="text-sm text-gray-500 px-3 py-2">Loading...</div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400 mr-3" />
                      <div className="w-6 h-6 bg-gray-200 rounded mr-3"></div>
                      <span className="text-sm">{conversation.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}