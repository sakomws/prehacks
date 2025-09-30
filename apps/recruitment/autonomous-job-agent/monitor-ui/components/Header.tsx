'use client'

import { Play, Square, Wifi, WifiOff, Settings, Check, X } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  isConnected: boolean
  onStart: () => void
  onStop: () => void
  agentStatus: 'idle' | 'running' | 'completed' | 'error'
  jobUrl: string
  setJobUrl: (url: string) => void
  showUrlInput: boolean
  setShowUrlInput: (show: boolean) => void
}

export default function Header({ 
  isConnected, 
  onStart, 
  onStop, 
  agentStatus, 
  jobUrl, 
  setJobUrl, 
  showUrlInput, 
  setShowUrlInput 
}: HeaderProps) {
  const [tempUrl, setTempUrl] = useState(jobUrl)

  const handleUrlSubmit = () => {
    setJobUrl(tempUrl)
    setShowUrlInput(false)
  }

  const handleUrlCancel = () => {
    setTempUrl(jobUrl)
    setShowUrlInput(false)
  }
  return (
    <header className="header-gradient shadow-lg border-b border-blue-300/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white animate-fade-in">
              🤖 Autonomous Agent Monitor
            </h1>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center text-green-200 glass-effect px-3 py-1 rounded-full">
                  <Wifi className="h-4 w-4 animate-bounce-slow" />
                  <span className="text-sm font-medium ml-1">Connected</span>
                </div>
              ) : (
                <div className="flex items-center text-red-200 glass-effect px-3 py-1 rounded-full">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm font-medium ml-1">Disconnected</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-white/80 glass-effect px-3 py-1 rounded-full">
              Status: <span className="font-medium capitalize text-white">{agentStatus}</span>
            </div>
            
            {/* Job URL Input */}
            {showUrlInput ? (
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="Enter job application URL"
                  className="px-4 py-2 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent min-w-80 text-gray-800 placeholder-gray-500"
                />
                <button
                  onClick={handleUrlSubmit}
                  className="p-2 text-green-200 hover:text-green-100 hover:bg-green-500/20 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Confirm URL"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleUrlCancel}
                  className="p-2 text-red-200 hover:text-red-100 hover:bg-red-500/20 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-sm text-white/80 max-w-xs truncate glass-effect px-3 py-1 rounded-lg" title={jobUrl}>
                  {jobUrl}
                </div>
                <button
                  onClick={() => setShowUrlInput(true)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Change URL"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <div className="flex space-x-2">
              {agentStatus === 'idle' || agentStatus === 'completed' || agentStatus === 'error' ? (
                <button
                  onClick={onStart}
                  disabled={!isConnected || !jobUrl.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Agent
                </button>
              ) : (
                <button
                  onClick={onStop}
                  className="btn-danger"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Agent
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
