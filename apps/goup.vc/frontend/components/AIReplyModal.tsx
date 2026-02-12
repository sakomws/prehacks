'use client'

import { useState, useEffect } from 'react'
import { X, Wand2, Send, Copy, RefreshCw } from 'lucide-react'
import { generateAIReply, type Conversation } from '@/lib/api'

interface AIReplyModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: Conversation | null
}

const replyTemplates = [
  {
    id: 'polite-decline',
    title: 'Politely decline but keep door open',
    preview: 'Thanks for thinking of me! Unfortunately I can\'t commit to this right now, but I\'d love to stay in touch for future opportunities.'
  },
  {
    id: 'request-more-info',
    title: 'Request more information',
    preview: 'This sounds interesting! Could you share more details about the timeline and what would be expected from my end?'
  },
  {
    id: 'schedule-follow-up',
    title: 'Schedule a follow-up',
    preview: 'I\'d love to discuss this further. Are you available for a quick call this week? I have some time on Thursday or Friday afternoon.'
  },
  {
    id: 'express-interest',
    title: 'Express interest and next steps',
    preview: 'This aligns perfectly with what I\'m working on! I\'m definitely interested. What are the next steps to move forward?'
  }
]

export default function AIReplyModal({ isOpen, onClose, conversation }: AIReplyModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generatedReply, setGeneratedReply] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const generateReply = async () => {
    if (!conversation) return
    
    setIsGenerating(true)
    try {
      const response = await generateAIReply({
        conversation_id: conversation.id,
        template_id: selectedTemplate || undefined,
        custom_prompt: customPrompt || undefined
      })
      setGeneratedReply(response.generated_reply)
    } catch (error) {
      console.error('Failed to generate reply:', error)
      // Fallback to template preview
      const template = replyTemplates.find(t => t.id === selectedTemplate)
      if (template) {
        setGeneratedReply(template.preview)
      } else if (customPrompt) {
        setGeneratedReply(`Generated reply based on: "${customPrompt}"\n\nHi there! Thanks for your message. I've reviewed the details and here's my response...`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReply)
  }

  if (!isOpen || !conversation) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-black/5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Reply Assistant</h2>
              <p className="text-sm text-gray-500">Replying to {conversation.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Context */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Conversation Context</h3>
              <p className="text-sm text-gray-600">{conversation.ai_summary}</p>
            </div>

            {/* Templates */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Templates</h3>
              <div className="grid grid-cols-1 gap-2">
                {replyTemplates.map((template) => (
                  <label
                    key={template.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.id}
                      checked={selectedTemplate === template.id}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{template.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{template.preview}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Instructions</h3>
              <textarea
                placeholder="Describe how you want to respond... (e.g., 'Be enthusiastic but mention I need to check my calendar')"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={generateReply}
              disabled={!selectedTemplate && !customPrompt.trim() || isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Reply</span>
                </>
              )}
            </button>

            {/* Generated Reply */}
            {generatedReply && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-blue-900">Generated Reply</h3>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-blue-600 hover:text-blue-800 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-blue-800 whitespace-pre-wrap">{generatedReply}</div>
              </div>
            )}
          </div>

          {generatedReply && (
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-black/5">
              <button
                onClick={generateReply}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Regenerate</span>
              </button>
              <button
                onClick={onClose}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Reply</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}