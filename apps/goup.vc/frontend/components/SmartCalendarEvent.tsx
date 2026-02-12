'use client'

import { useState } from 'react'
import { 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Battery,
  Coffee,
  Brain,
  Users,
  BookOpen,
  Settings,
  Calendar,
  ArrowRight
} from 'lucide-react'

interface SmartEventProps {
  event: {
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
  onOptimize?: (eventId: string) => void
  onReschedule?: (eventId: string) => void
}

export default function SmartCalendarEvent({ event, onOptimize, onReschedule }: SmartEventProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showOptimizations, setShowOptimizations] = useState(false)

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'high': return <Zap className="w-4 h-4 text-red-500" />
      case 'medium': return <Battery className="w-4 h-4 text-yellow-500" />
      case 'low': return <Coffee className="w-4 h-4 text-green-500" />
      default: return <Battery className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work': return <Brain className="w-4 h-4 text-blue-500" />
      case 'social': return <Users className="w-4 h-4 text-purple-500" />
      case 'learning': return <BookOpen className="w-4 h-4 text-green-500" />
      case 'admin': return <Settings className="w-4 h-4 text-gray-500" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'work': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'social': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'learning': return 'bg-green-50 text-green-700 border-green-200'
      case 'admin': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getOutputBadge = (output: string) => {
    const colors = {
      decision: 'bg-orange-100 text-orange-700',
      knowledge: 'bg-blue-100 text-blue-700',
      relationship: 'bg-pink-100 text-pink-700'
    }
    return colors[output as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Main Event Info */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              {getTypeIcon(event.type)}
              <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(event.type)}`}>
                {event.type}
              </span>
              {getEnergyIcon(event.energy)}
            </div>
            
            <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{event.time} · {event.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
              {event.travelTime && (
                <div className="flex items-center space-x-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{event.travelTime}min travel</span>
                </div>
              )}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOutputBadge(event.output)}`}>
                {event.output}
              </span>
            </div>

            {/* AI Insight - Always Visible */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-blue-100">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Brain className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">AI Insight</p>
                  <p className="text-sm text-gray-700">{event.aiInsight}</p>
                </div>
              </div>
            </div>

            {/* Smart Buffers */}
            {event.smartBuffers && (
              <div className="flex items-center space-x-4 mb-4">
                {event.smartBuffers.before && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Buffer: {event.smartBuffers.before}</span>
                  </div>
                )}
                {event.smartBuffers.after && (
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Recovery: {event.smartBuffers.after}</span>
                  </div>
                )}
              </div>
            )}

            {/* Conflict Warning */}
            {event.conflictRisk && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">Cognitive overload detected</p>
                </div>
                <p className="text-sm text-yellow-700 mt-1">{event.conflictRisk}</p>
                <button 
                  onClick={() => setShowOptimizations(!showOptimizations)}
                  className="text-xs text-yellow-700 hover:text-yellow-800 font-medium mt-2 flex items-center space-x-1"
                >
                  <span>View suggestions</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end space-y-3">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <div className={`w-3 h-3 rounded-full ${
              event.flexibility === 'fixed' ? 'bg-red-400' : 'bg-green-400'
            }`} title={`${event.flexibility} timing`}></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onOptimize?.(event.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Optimize
          </button>
          {event.flexibility === 'movable' && (
            <button 
              onClick={() => onReschedule?.(event.id)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Reschedule
            </button>
          )}
          <button className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
            View Details
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-6 bg-gray-50/50">
          {event.preparation && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">Preparation Checklist</p>
              <div className="space-y-2">
                {event.preparation.map((item, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {event.energyImpact && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-2">Energy Impact</p>
              <p className="text-sm text-gray-600">{event.energyImpact}</p>
            </div>
          )}

          {/* AI Optimizations */}
          {showOptimizations && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-3">AI Suggestions</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Leave previous meeting 10 minutes early</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Add 15-minute buffer for context switching</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Schedule recovery time after high-energy event</span>
                </div>
              </div>
              <button className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                Apply All Suggestions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}