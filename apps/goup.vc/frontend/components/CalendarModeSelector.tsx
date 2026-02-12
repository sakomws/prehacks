'use client'

import { Brain, Mic, Hammer, Leaf } from 'lucide-react'

interface CalendarModeSelectorProps {
  currentMode: 'focus' | 'event' | 'build' | 'life'
  onModeChange: (mode: 'focus' | 'event' | 'build' | 'life') => void
}

export default function CalendarModeSelector({ currentMode, onModeChange }: CalendarModeSelectorProps) {
  const modes = [
    {
      key: 'focus' as const,
      label: 'Focus Mode',
      icon: Brain,
      description: 'Hide social events, show only work and admin tasks',
      color: 'from-blue-500 to-blue-600'
    },
    {
      key: 'event' as const,
      label: 'Event Mode',
      icon: Mic,
      description: 'Only meetups, talks, and community events',
      color: 'from-purple-500 to-purple-600'
    },
    {
      key: 'build' as const,
      label: 'Build Mode',
      icon: Hammer,
      description: 'Work blocks, deep focus sessions, and project time',
      color: 'from-orange-500 to-orange-600'
    },
    {
      key: 'life' as const,
      label: 'Life Mode',
      icon: Leaf,
      description: 'Personal events, recovery time, and life balance',
      color: 'from-green-500 to-green-600'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Compact Mode Selector */}
      <div className="flex bg-gray-100/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
        {modes.map((mode) => {
          const Icon = mode.icon
          return (
            <button
              key={mode.key}
              onClick={() => onModeChange(mode.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                currentMode === mode.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{mode.label.split(' ')[0]}</span>
            </button>
          )
        })}
      </div>

      {/* Mode Description */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 bg-gradient-to-br ${modes.find(m => m.key === currentMode)?.color} rounded-xl flex items-center justify-center`}>
            {(() => {
              const Icon = modes.find(m => m.key === currentMode)?.icon || Brain
              return <Icon className="w-4 h-4 text-white" />
            })()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {modes.find(m => m.key === currentMode)?.label}
            </h3>
            <p className="text-sm text-gray-600 font-light">
              {modes.find(m => m.key === currentMode)?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}