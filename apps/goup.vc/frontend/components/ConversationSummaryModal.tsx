'use client'

import { useState, useEffect } from 'react'
import { X, Brain, Calendar, AlertCircle, Clock } from 'lucide-react'
import { summarizeConversation, type Conversation } from '@/lib/api'

interface ConversationSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: Conversation | null
}

export default function ConversationSummaryModal({ isOpen, onClose, conversation }: ConversationSummaryModalProps) {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && conversation) {
      loadSummary()
    }
  }, [isOpen, conversation])

  const loadSummary = async () => {
    if (!conversation) return
    
    setLoading(true)
    try {
      const data = await summarizeConversation(conversation.id)
      setSummary(data)
    } catch (error) {
      console.error('Failed to load summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !conversation) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-black/5">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Conversation Summary</h2>
                <p className="text-sm text-gray-500">{conversation.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Brain className="w-8 h-8 text-gray-400 animate-pulse" />
              </div>
            ) : summary ? (
              <div className="space-y-6">
                {/* Main Summary */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Summary</h3>
                  <p className="text-gray-900 bg-gray-50 rounded-xl p-4">{summary.summary}</p>
                </div>

                {/* Key Decisions */}
                {summary.key_decisions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Key Decisions
                    </h3>
                    <div className="space-y-2">
                      {summary.key_decisions.map((decision: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <span className="text-sm text-green-800">{decision}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Open Questions */}
                {summary.open_questions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Open Questions
                    </h3>
                    <div className="space-y-2">
                      {summary.open_questions.map((question: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          <span className="text-sm text-yellow-800">{question}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deadlines */}
                {summary.deadlines.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Deadlines
                    </h3>
                    <div className="space-y-2">
                      {summary.deadlines.map((deadline: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          <span className="text-sm text-red-800">{deadline}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Failed to load summary</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-black/5">
            <button
              onClick={onClose}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}