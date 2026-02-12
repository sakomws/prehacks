'use client'

import { useState } from 'react'
import { Users, UserCheck, Lightbulb, MessageSquare, Share2 } from 'lucide-react'

interface AudienceGuidanceProps {
  userType: 'community_builder' | 'first_timer' | 'regular_attendee'
  eventType: string
}

export default function AudienceGuidance({ userType, eventType }: AudienceGuidanceProps) {
  const [selectedTab, setSelectedTab] = useState<'for_you' | 'first_time'>('for_you')

  const guidanceContent = {
    community_builder: {
      title: 'For you (community / organizer / builder type)',
      suggestions: [
        'Invite community members who asked about taxes recently',
        'Share this in WhatsApp / Telegram',
        'Prepare 1–2 tax questions in advance'
      ],
      icon: Users
    },
    first_timer: {
      title: 'For first-time attendees',
      suggestions: [
        'No prior tax knowledge needed',
        'Casual dress',
        'You can leave early if needed'
      ],
      icon: UserCheck
    },
    regular_attendee: {
      title: 'For regular attendees',
      suggestions: [
        'Consider bringing a friend who needs tax help',
        'Think about follow-up questions from last session',
        'Network with other regular community members'
      ],
      icon: Users
    }
  }

  const currentGuidance = userType === 'first_timer' ? guidanceContent.first_timer : guidanceContent.community_builder
  const alternateGuidance = userType === 'first_timer' ? guidanceContent.community_builder : guidanceContent.first_timer

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Lightbulb className="w-6 h-6 text-yellow-600" />
        <h2 className="text-xl font-semibold text-gray-900">Personalized Guidance</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setSelectedTab('for_you')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'for_you'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          For You
        </button>
        <button
          onClick={() => setSelectedTab('first_time')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'first_time'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          First-Timers
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {selectedTab === 'for_you' ? (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <currentGuidance.icon className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">{currentGuidance.title}</h3>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-900 mb-3">You may want to:</p>
              <ul className="space-y-2">
                {currentGuidance.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-blue-800">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <alternateGuidance.icon className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">{alternateGuidance.title}</h3>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm font-medium text-green-900 mb-3">Good to know:</p>
              <ul className="space-y-2">
                {alternateGuidance.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-green-800">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
          <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share Event</span>
          </button>
          <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>Ask Question</span>
          </button>
        </div>
      </div>
    </div>
  )
}