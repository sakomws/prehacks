'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Hammer, 
  Megaphone, 
  Sprout,
  Clock,
  Zap,
  Brain,
  Mic,
  UserCheck,
  BookOpen,
  Search,
  Reply,
  Clock3,
  Volume2,
  VolumeX,
  Edit3,
  CalendarDays,
  Bell,
  RefreshCw
} from 'lucide-react'
import SmartMuteModal from '@/components/SmartMuteModal'
import AIReplyModal from '@/components/AIReplyModal'
import ConversationSummaryModal from '@/components/ConversationSummaryModal'
import { getConversations, updateConversation, searchConversations, type Conversation } from '@/lib/api'

type ConversationIntent = '1:1' | 'event' | 'project' | 'community' | 'broadcast'
type ConversationStatus = 'active' | 'dormant' | 'expired'
type InboxMode = 'focus' | 'event' | 'people' | 'catchup'

const intentConfig = {
  '1:1': { icon: UserCheck, label: '1:1 Relationship', color: 'bg-blue-100 text-blue-700' },
  'event': { icon: Mic, label: 'Event / Meetup', color: 'bg-purple-100 text-purple-700' },
  'project': { icon: Hammer, label: 'Project / Build', color: 'bg-orange-100 text-orange-700' },
  'community': { icon: Sprout, label: 'Community', color: 'bg-green-100 text-green-700' },
  'broadcast': { icon: Megaphone, label: 'Broadcast', color: 'bg-gray-100 text-gray-700' }
}



const inboxModes = [
  { key: 'focus' as InboxMode, icon: Brain, label: 'Focus Mode', description: 'Only actionable chats' },
  { key: 'event' as InboxMode, icon: Mic, label: 'Event Mode', description: 'Event-related threads' },
  { key: 'people' as InboxMode, icon: UserCheck, label: 'People Mode', description: 'Only 1:1s' },
  { key: 'catchup' as InboxMode, icon: BookOpen, label: 'Catch-Up Mode', description: 'AI summaries only' }
]

export default function InboxPage() {
  const [activeMode, setActiveMode] = useState<InboxMode>('focus')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIntent, setSelectedIntent] = useState<ConversationIntent | 'all'>('all')
  const [showMuteModal, setShowMuteModal] = useState(false)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<any>(null)

  // Load conversations
  useEffect(() => {
    loadConversations()
  }, [activeMode, selectedIntent])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await getConversations(1, selectedIntent, activeMode)
      setConversations(data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch()
    } else {
      setSearchResults(null)
    }
  }, [searchQuery])

  const handleSearch = async () => {
    try {
      const results = await searchConversations(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const handleMarkAsRead = async (conversationId: number) => {
    try {
      await updateConversation(conversationId, { needs_action: false, action_type: null })
      loadConversations()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const filteredConversations = searchResults ? searchResults.results : conversations
  const needsActionCount = conversations.filter(c => c.needs_action).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-2">Inbox</h1>
        <p className="text-lg text-gray-600">Good evening, Sako 👋</p>
        {needsActionCount > 0 && (
          <p className="text-sm text-orange-600 mt-2">
            You have {needsActionCount} conversations that need action
          </p>
        )}
      </div>

      {/* Mode Selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {inboxModes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => setActiveMode(mode.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeMode === mode.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <mode.icon className="w-4 h-4" />
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Ask your inbox: 'When did we decide on the venue?'"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-black/5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
        />
      </div>

      {/* Intent Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedIntent('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            selectedIntent === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {Object.entries(intentConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setSelectedIntent(key as ConversationIntent)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedIntent === key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <config.icon className="w-4 h-4" />
            <span>{config.label}</span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Search Results */}
      {searchResults && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800">
            Found {searchResults.results.length} results for "{searchResults.query}"
          </p>
        </div>
      )}

      {/* Conversations */}
      <div className="space-y-3">
        {!loading && filteredConversations.map((conversation) => {
          const intentConfig_ = intentConfig[conversation.intent as ConversationIntent]
          const statusColor = {
            active: 'border-l-green-500',
            dormant: 'border-l-yellow-500',
            expired: 'border-l-gray-400'
          }[conversation.status as ConversationStatus]

          return (
            <div
              key={conversation.id}
              className={`bg-white rounded-2xl shadow-sm border border-black/5 border-l-4 ${statusColor} p-6 hover:shadow-md cursor-pointer transition-all group`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900 truncate">{conversation.title}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${intentConfig_.color}`}>
                        <intentConfig_.icon className="w-3 h-3 mr-1" />
                        {intentConfig_.label}
                      </span>
                      {conversation.needs_action && (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700">
                          🔥 Needs Action
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{conversation.last_activity}</span>
                      {conversation.unread_count > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>

                  {conversation.needs_action && conversation.action_type && (
                    <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-800 font-medium">{conversation.action_type}</p>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    <span className="font-medium text-gray-700">TL;DR:</span> {conversation.ai_summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {conversation.participants.length === 1 
                        ? conversation.participants[0].full_name
                        : `${conversation.participants.slice(0, 2).map(p => p.full_name).join(', ')}${conversation.participants.length > 2 ? ` +${conversation.participants.length - 2} others` : ''}`
                      }
                    </div>

                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedConversation(conversation)
                          setShowReplyModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Draft reply"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedConversation(conversation)
                          setShowSummaryModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                        title="Summarize"
                      >
                        <Brain className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Extract dates">
                        <CalendarDays className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Remind me later">
                        <Clock3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedConversation(conversation)
                          setShowMuteModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Smart mute"
                      >
                        <VolumeX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {conversation.needs_action && (
                    <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedConversation(conversation)
                          setShowReplyModal(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Reply
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(conversation.id)
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Mark as Read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredConversations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations found</h3>
          <p className="text-gray-500">
            {activeMode === 'focus' 
              ? 'No conversations need your attention right now.'
              : `No ${activeMode} conversations to show.`
            }
          </p>
        </div>
      )}

      {/* Modals */}
      <SmartMuteModal
        isOpen={showMuteModal}
        onClose={() => {
          setShowMuteModal(false)
          setSelectedConversation(null)
        }}
        conversation={selectedConversation}
        onMuted={loadConversations}
      />
      <AIReplyModal
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false)
          setSelectedConversation(null)
        }}
        conversation={selectedConversation}
      />
      <ConversationSummaryModal
        isOpen={showSummaryModal}
        onClose={() => {
          setShowSummaryModal(false)
          setSelectedConversation(null)
        }}
        conversation={selectedConversation}
      />
    </div>
  )
}