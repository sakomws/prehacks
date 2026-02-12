'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  Mic, 
  Hammer, 
  Leaf, 
  Calendar, 
  Clock, 
  Zap, 
  Users, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Search,
  Settings,
  ChevronDown,
  Sparkles,
  Target,
  Battery,
  Coffee
} from 'lucide-react'
import SmartCalendarEvent from '@/components/SmartCalendarEvent'
import CalendarModeSelector from '@/components/CalendarModeSelector'
import AICalendarInsights from '@/components/AICalendarInsights'

interface CalendarEvent {
  id: string
  title: string
  time: string
  duration: string
  location: string
  type: 'work' | 'social' | 'learning' | 'admin'
  energy: 'high' | 'medium' | 'low'
  flexibility: 'fixed' | 'movable'
  output: 'decision' | 'knowledge' | 'relationship'
  aiInsight: string
  preparation?: string[]
  travelTime?: number
  conflictRisk?: string
  energyImpact?: string
  smartBuffers?: {
    before?: string
    after?: string
  }
}

interface WeekInsight {
  energyEvents: number
  adminBlocks: number
  conflicts: number
  heaviestDay: string
  recommendation: string
  energyScore: number
  focusBlocks: number
  socialEvents: number
  suggestions: string[]
}

export default function CalendarsPage() {
  const [calendarMode, setCalendarMode] = useState<'focus' | 'event' | 'build' | 'life'>('life')
  const [showAIEntry, setShowAIEntry] = useState(true)
  const [naturalQuery, setNaturalQuery] = useState('')
  const [selectedView, setSelectedView] = useState<'week' | 'day'>('week')

  // Mock data for the AI-driven calendar
  const weekInsight: WeekInsight = {
    energyEvents: 2,
    adminBlocks: 1,
    conflicts: 0,
    heaviestDay: 'Thursday',
    recommendation: 'Your week looks balanced with good energy distribution.',
    energyScore: 85,
    focusBlocks: 3,
    socialEvents: 2,
    suggestions: [
      'Move admin tasks to Friday afternoon for better energy flow',
      'Add 15-minute buffer after high-energy networking event',
      'Schedule recovery time Thursday evening after heavy day',
      'Consider batching similar tasks on Tuesday morning'
    ]
  }

  const upcomingEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Tea, Treats & Tax Talk',
      time: '5:30 PM',
      duration: '2h',
      location: 'Redwood City Public Library',
      type: 'learning',
      energy: 'low',
      flexibility: 'fixed',
      output: 'knowledge',
      aiInsight: 'Low networking pressure • Mostly listening + Q&A • Good recovery event after workday',
      preparation: ['Bring 1 tax question (optional)', 'Arrive ~10 min early'],
      travelTime: 25,
      energyImpact: 'This event will help you recharge after a busy workday while gaining useful knowledge.',
      smartBuffers: {
        before: '15 min travel buffer',
        after: '30 min wind-down time'
      }
    },
    {
      id: '2',
      title: 'AI Startup Pitch Review',
      time: '2:00 PM',
      duration: '1.5h',
      location: 'Virtual',
      type: 'work',
      energy: 'high',
      flexibility: 'movable',
      output: 'decision',
      aiInsight: 'High cognitive load • Decision-making required • Schedule buffer after',
      preparation: ['Review pitch decks', 'Prepare evaluation criteria'],
      conflictRisk: 'Back-to-back with team standup',
      energyImpact: 'High-stakes decision making will drain cognitive energy. Plan lighter tasks afterward.',
      smartBuffers: {
        before: '10 min prep time',
        after: '20 min processing buffer'
      }
    },
    {
      id: '3',
      title: 'Founder Networking Dinner',
      time: '7:00 PM',
      duration: '3h',
      location: 'The Battery SF',
      type: 'social',
      energy: 'high',
      flexibility: 'fixed',
      output: 'relationship',
      aiInsight: 'High energy required • Networking focused • Plan recovery time',
      preparation: ['Review attendee list', 'Prepare conversation starters'],
      travelTime: 45,
      energyImpact: 'Intensive networking will be energizing but exhausting. Block recovery time tomorrow.',
      smartBuffers: {
        before: '45 min travel + prep',
        after: 'Next day morning recovery'
      }
    },
    {
      id: '4',
      title: 'Weekly Admin Block',
      time: '10:00 AM',
      duration: '2h',
      location: 'Home Office',
      type: 'admin',
      energy: 'low',
      flexibility: 'movable',
      output: 'decision',
      aiInsight: 'Low energy task • Good for Friday afternoon • Can be split into smaller blocks',
      energyImpact: 'Administrative tasks are low-energy but important. Best scheduled during natural energy dips.',
      smartBuffers: {
        after: '15 min transition time'
      }
    }
  ]

  const getFilteredEvents = () => {
    switch (calendarMode) {
      case 'focus':
        return upcomingEvents.filter(e => e.type === 'work' || e.type === 'admin')
      case 'event':
        return upcomingEvents.filter(e => e.type === 'social' || e.type === 'learning')
      case 'build':
        return upcomingEvents.filter(e => e.type === 'work')
      case 'life':
      default:
        return upcomingEvents
    }
  }



  return (
    <div className="space-y-8">
      {/* AI-First Entry State */}
      {showAIEntry && (
        <AICalendarInsights
          insights={weekInsight}
          onOptimizeWeek={() => {
            // Handle week optimization
            console.log('Optimizing week...')
          }}
          onDismiss={() => setShowAIEntry(false)}
          userName="Sako"
        />
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-3xl font-medium tracking-tight text-gray-900">Calendar</h1>
          
          <CalendarModeSelector
            currentMode={calendarMode}
            onModeChange={setCalendarMode}
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setSelectedView('week')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedView === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setSelectedView('day')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedView === 'day'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Natural Language Calendar Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Ask your calendar... (e.g., 'When should I prep for Thursday's talk?')"
            value={naturalQuery}
            onChange={(e) => setNaturalQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
            Ask
          </button>
        </div>
        
        {naturalQuery && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700 font-medium">AI Suggestion:</p>
            <p className="text-sm text-blue-600 mt-1">
              Schedule 30 minutes Wednesday evening for talk preparation. I'll block your calendar and send a reminder.
            </p>
          </div>
        )}
      </div>

      {/* AI-Generated Event Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-medium text-gray-900">
          {calendarMode === 'focus' && 'Focus Events'}
          {calendarMode === 'event' && 'Community Events'}
          {calendarMode === 'build' && 'Build Sessions'}
          {calendarMode === 'life' && 'This Week'}
        </h2>
        
        {getFilteredEvents().map((event) => (
          <SmartCalendarEvent
            key={event.id}
            event={event}
            onOptimize={(eventId) => {
              console.log('Optimizing event:', eventId)
              // Handle event optimization
            }}
            onReschedule={(eventId) => {
              console.log('Rescheduling event:', eventId)
              // Handle event rescheduling
            }}
          />
        ))}
      </div>

      {/* Weekly AI Reflection */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-3xl p-8 border border-purple-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-medium text-gray-900">Weekly AI Reflection</h3>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-700">You attended 3 community events</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-700">Skipped 1 low-value meeting (good call)</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-700">Energy dipped Thursday night</span>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <p className="text-sm font-medium text-gray-900 mb-2">Next week suggestion:</p>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>→ Keep Friday evening open</li>
            <li>→ Avoid back-to-back social events</li>
          </ul>
        </div>
      </div>
    </div>
  )
}