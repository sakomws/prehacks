'use client'

import { useState, useEffect } from 'react'
import { X, Clock, User, Calendar, Zap } from 'lucide-react'
import { muteConversation, type Conversation } from '@/lib/api'

interface SmartMuteModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: Conversation | null
  onMuted?: () => void
}

const muteOptions = [
  {
    id: 'mention',
    icon: User,
    title: 'Until someone mentions you',
    description: 'Get notified when your name or @username appears'
  },
  {
    id: 'event-day',
    icon: Calendar,
    title: 'Until event day',
    description: 'Automatically unmute on the day of the event'
  },
  {
    id: 'decision',
    icon: Zap,
    title: 'Until a decision is needed',
    description: 'AI will detect when input is required from you'
  },
  {
    id: 'custom',
    icon: Clock,
    title: 'Custom time',
    description: 'Set a specific date and time'
  }
]

export default function SmartMuteModal({ isOpen, onClose, conversation, onMuted }: SmartMuteModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleApplyMute = async () => {
    if (!conversation || !selectedOption) return
    
    setIsApplying(true)
    try {
      let muteUntil: string | undefined
      
      if (selectedOption === 'custom' && customDate && customTime) {
        muteUntil = `${customDate}T${customTime}:00Z`
      }
      
      await muteConversation(conversation.id, selectedOption, muteUntil)
      onMuted?.()
      onClose()
    } catch (error) {
      console.error('Failed to mute conversation:', error)
    } finally {
      setIsApplying(false)
    }
  }

  if (!isOpen || !conversation) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-black/5">
            <h2 className="text-lg font-semibold text-gray-900">Smart Mute</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-600 mb-6">
              Mute <span className="font-medium">{conversation.title}</span> until:
            </p>

            <div className="space-y-3">
              {muteOptions.map((option) => (
                <div key={option.id}>
                  <label className="flex items-start space-x-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="muteOption"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="mt-1"
                    />
                    <option.icon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.title}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>

                  {selectedOption === 'custom' && option.id === 'custom' && (
                    <div className="mt-3 ml-12 grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                      />
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-black/5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyMute}
              disabled={!selectedOption || isApplying}
              className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white px-6 py-2 rounded-xl font-medium transition-colors"
            >
              {isApplying ? 'Applying...' : 'Apply Mute'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}