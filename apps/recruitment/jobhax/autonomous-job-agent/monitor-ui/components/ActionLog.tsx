'use client'

import { useState } from 'react'
import { 
  MousePointer, 
  Type, 
  ChevronDown, 
  ChevronRight, 
  Camera, 
  Navigation,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

interface AgentAction {
  timestamp: number
  action_type: string
  page: number
  [key: string]: any
}

interface ActionLogProps {
  actions: AgentAction[]
}

export default function ActionLog({ actions }: ActionLogProps) {
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedActions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedActions(newExpanded)
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'navigate':
        return <Navigation className="h-4 w-4 text-blue-600" />
      case 'type_text':
        return <Type className="h-4 w-4 text-green-600" />
      case 'click_radio':
      case 'click_next_button':
        return <MousePointer className="h-4 w-4 text-purple-600" />
      case 'select_dropdown':
        return <ChevronDown className="h-4 w-4 text-orange-600" />
      case 'screenshot':
        return <Camera className="h-4 w-4 text-pink-600" />
      case 'question_detection':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case 'page_transition_detected':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'navigate':
        return 'bg-blue-50 border-blue-200'
      case 'type_text':
        return 'bg-green-50 border-green-200'
      case 'click_radio':
      case 'click_next_button':
        return 'bg-purple-50 border-purple-200'
      case 'select_dropdown':
        return 'bg-orange-50 border-orange-200'
      case 'screenshot':
        return 'bg-pink-50 border-pink-200'
      case 'question_detection':
        return 'bg-emerald-50 border-emerald-200'
      case 'page_transition_detected':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString()
  }

  const formatActionType = (actionType: string) => {
    return actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Action Log</h2>
        <span className="text-sm text-gray-500">{actions.length} actions</span>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {actions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No actions yet. Start the agent to see activity.</p>
          </div>
        ) : (
          actions.map((action, index) => (
            <div
              key={index}
              className={`border rounded-lg p-3 ${getActionColor(action.action_type)}`}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpanded(index)}
              >
                <div className="flex items-center space-x-3">
                  {getActionIcon(action.action_type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatActionType(action.action_type)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Page {action.page} • {formatTimestamp(action.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {Object.keys(action).length > 4 && (
                    expandedActions.has(index) ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )
                  )}
                </div>
              </div>
              
              {expandedActions.has(index) && Object.keys(action).length > 4 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(action)
                      .filter(([key]) => !['timestamp', 'action_type', 'page'].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="text-gray-900 font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
