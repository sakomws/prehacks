'use client'

import { useState } from 'react'
import { 
  Brain, 
  Zap, 
  Target, 
  CheckCircle, 
  Calendar, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Battery,
  Sparkles,
  X,
  Settings
} from 'lucide-react'

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

interface AICalendarInsightsProps {
  insights: WeekInsight
  onOptimizeWeek?: () => void
  onDismiss?: () => void
  userName?: string
}

export default function AICalendarInsights({ 
  insights, 
  onOptimizeWeek, 
  onDismiss, 
  userName = 'Sako' 
}: AICalendarInsightsProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getEnergyScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getEnergyScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Needs Attention'
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl p-8 border border-blue-100 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">
              {getTimeOfDay()}, {userName} 👋
            </h2>
            <p className="text-gray-600 font-light">{insights.recommendation}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-900">
              {insights.energyEvents} high-energy events
            </span>
          </div>
          <div className="text-xs text-gray-600">
            {insights.energyEvents > 3 ? 'Consider spacing them out' : 'Well distributed'}
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">
              {insights.focusBlocks} focus blocks
            </span>
          </div>
          <div className="text-xs text-gray-600">
            {insights.focusBlocks < 2 ? 'Add more deep work time' : 'Good balance'}
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            {insights.conflicts === 0 ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
            <span className="text-sm font-medium text-gray-900">
              {insights.conflicts === 0 ? 'No conflicts' : `${insights.conflicts} conflicts`}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            {insights.conflicts === 0 ? 'Clean schedule' : 'Needs resolution'}
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-900">
              {insights.heaviestDay} is heaviest
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Consider moving flexible items
          </div>
        </div>
      </div>

      {/* Energy Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Battery className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Weekly Energy Score</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEnergyScoreColor(insights.energyScore)}`}>
            {insights.energyScore}/100 · {getEnergyScoreLabel(insights.energyScore)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${insights.energyScore}%` }}
          ></div>
        </div>
      </div>

      {/* Detailed Insights */}
      {showDetails && (
        <div className="mb-6 space-y-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <h4 className="font-medium text-gray-900 mb-3">AI Suggestions</h4>
            <div className="space-y-2">
              {insights.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-gray-900">Time Distribution</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Work & Focus</span>
                  <span>40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Social & Events</span>
                  <span>30%</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin & Tasks</span>
                  <span>20%</span>
                </div>
                <div className="flex justify-between">
                  <span>Recovery</span>
                  <span>10%</span>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-green-500" />
                <span className="font-medium text-gray-900">Cognitive Load</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Monday</span>
                  <span className="text-green-600">Low</span>
                </div>
                <div className="flex justify-between">
                  <span>Tuesday</span>
                  <span className="text-yellow-600">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span>Wednesday</span>
                  <span className="text-yellow-600">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span>Thursday</span>
                  <span className="text-red-600">High</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday</span>
                  <span className="text-green-600">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onOptimizeWeek}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-md"
        >
          Optimize my week
        </button>
        <button 
          onClick={onDismiss}
          className="bg-white/80 hover:bg-white text-gray-700 px-6 py-3 rounded-full font-medium transition-all duration-200 border border-gray-200"
        >
          Just show calendar
        </button>
        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">
          Learn more about AI insights
        </button>
      </div>
    </div>
  )
}