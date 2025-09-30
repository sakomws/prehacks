'use client'

import { Bot, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface AgentStatusProps {
  status: 'idle' | 'running' | 'completed' | 'error'
  currentPage: number
  totalActions: number
  startTime?: number
  endTime?: number
  error?: string
}

export default function AgentStatus({ 
  status, 
  currentPage, 
  totalActions, 
  startTime, 
  endTime, 
  error 
}: AgentStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Bot className="h-6 w-6 text-blue-600 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <Bot className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'status-running'
      case 'completed':
        return 'status-success'
      case 'error':
        return 'status-error'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = () => {
    if (!startTime) return '0s'
    const end = endTime || Date.now()
    const duration = Math.floor((end - startTime) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Agent Status</h2>
        {getStatusIcon()}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`status-indicator ${getStatusColor()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Current Page</span>
          <span className="text-sm font-medium text-gray-900">{currentPage}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Actions</span>
          <span className="text-sm font-medium text-gray-900">{totalActions}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Duration</span>
          <div className="flex items-center text-sm text-gray-900">
            <Clock className="h-4 w-4 mr-1" />
            {formatDuration()}
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-red-800 font-medium">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
