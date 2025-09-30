'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import Header from '@/components/Header'
import AgentStatus from '@/components/AgentStatus'
import ActionLog from '@/components/ActionLog'
import QuestionTracker from '@/components/QuestionTracker'
import ScreenshotGallery from '@/components/ScreenshotGallery'
import ProgressBar from '@/components/ProgressBar'
import Metrics from '@/components/Metrics'

interface AgentAction {
  timestamp: number
  action_type: string
  page: number
  [key: string]: any
}

interface Question {
  question_id: string
  question_text: string
  field_type: string
  required: boolean
  filled: boolean
}

interface AgentState {
  status: 'idle' | 'running' | 'completed' | 'error'
  currentPage: number
  totalActions: number
  questionsEncountered: Question[]
  actions: AgentAction[]
  screenshots: string[]
  startTime?: number
  endTime?: number
  error?: string
  progress: number
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [agentState, setAgentState] = useState<AgentState>({
    status: 'idle',
    currentPage: 1,
    totalActions: 0,
    questionsEncountered: [],
    actions: [],
    screenshots: [],
    progress: 0
  })
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [jobUrl, setJobUrl] = useState('https://apply.appcast.io/jobs/50590620606/applyboard/apply')
  const [showUrlInput, setShowUrlInput] = useState(false)

  useEffect(() => {
    // Check for auto-start parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const autoStart = urlParams.get('autostart')
    const jobUrlParam = urlParams.get('joburl')
    
    if (jobUrlParam) {
      setJobUrl(jobUrlParam)
    }
    
    // Initialize socket connection
    const newSocket = io('http://localhost:8081', {
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true
    })

    newSocket.on('connect', () => {
      console.log('✅ Connected to monitoring server')
      console.log('Socket ID:', newSocket.id)
      setIsConnected(true)
      
           // Auto-start agent if autostart parameter is present
           if (autoStart === 'true' && jobUrlParam) {
             console.log('🚀 Auto-starting agent with URL:', jobUrlParam)
             setTimeout(() => {
               newSocket.emit('start_agent', {
                 job_url: jobUrlParam
               })
               setCurrentSessionId(null) // Reset session ID
               setAgentState(prev => ({
                 ...prev,
                 status: 'running',
                 startTime: Date.now(),
                 progress: 0,
                 actions: [],
                 screenshots: [],
                 questionsEncountered: []
               }))
             }, 1000) // Wait 1 second for connection to stabilize
           }
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from monitoring server:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('🚨 Connection error:', error)
      setIsConnected(false)
    })

    newSocket.on('error', (error) => {
      console.error('🚨 Socket error:', error)
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts')
      setIsConnected(true)
    })

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber)
    })

    newSocket.on('agent_status', (data) => {
      setAgentState(prev => ({
        ...prev,
        status: data.status,
        currentPage: data.currentPage || prev.currentPage,
        progress: data.progress || prev.progress
      }))
    })

        newSocket.on('agent_action', (action: AgentAction) => {
          console.log(`🎬 Received action:`, action)
          setAgentState(prev => ({
            ...prev,
            actions: [...prev.actions, action],
            totalActions: prev.totalActions + 1
          }))
        })

        newSocket.on('questions_detected', (questions: Question[]) => {
          console.log(`📋 Received ${questions.length} questions:`, questions)
          setAgentState(prev => ({
            ...prev,
            questionsEncountered: questions
          }))
        })

        newSocket.on('screenshot_taken', (data: { filename: string; sessionId: string; jobUrl: string }) => {
          console.log(`📸 Received screenshot: ${data.filename} for session: ${data.sessionId}, current session: ${currentSessionId}`)
          // Always accept screenshots - don't filter by session for now
          console.log(`✅ Accepting screenshot`)
          setAgentState(prev => ({
            ...prev,
            screenshots: [...prev.screenshots, data.filename]
          }))
        })

    newSocket.on('page_transition', (page: number) => {
      setAgentState(prev => ({
        ...prev,
        currentPage: page,
        progress: page === 2 ? 100 : 50
      }))
    })

    newSocket.on('agent_completed', (result: any) => {
      setAgentState(prev => ({
        ...prev,
        status: 'completed',
        endTime: Date.now(),
        progress: 100
      }))
    })

    newSocket.on('agent_error', (error: string) => {
      setAgentState(prev => ({
        ...prev,
        status: 'error',
        error,
        endTime: Date.now()
      }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const startAgent = () => {
    if (socket && jobUrl.trim()) {
      socket.emit('start_agent', {
        job_url: jobUrl.trim()
      })
      setCurrentSessionId(null) // Reset session ID
      setAgentState(prev => ({
        ...prev,
        status: 'running',
        startTime: Date.now(),
        progress: 0,
        actions: [],
        screenshots: [],
        questionsEncountered: []
      }))
      setShowUrlInput(false)
    }
  }

  const stopAgent = () => {
    if (socket) {
      socket.emit('stop_agent')
      setAgentState(prev => ({
        ...prev,
        status: 'idle',
        endTime: Date.now()
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isConnected={isConnected}
        onStart={startAgent}
        onStop={stopAgent}
        agentStatus={agentState.status}
        jobUrl={jobUrl}
        setJobUrl={setJobUrl}
        showUrlInput={showUrlInput}
        setShowUrlInput={setShowUrlInput}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Status and Progress */}
          <div className="lg:col-span-1 space-y-6">
            <AgentStatus 
              status={agentState.status}
              currentPage={agentState.currentPage}
              totalActions={agentState.totalActions}
              startTime={agentState.startTime}
              endTime={agentState.endTime}
              error={agentState.error}
            />
            
            <ProgressBar 
              progress={agentState.progress}
              currentPage={agentState.currentPage}
            />
            
            <Metrics 
              totalActions={agentState.totalActions}
              questionsFound={agentState.questionsEncountered.length}
              questionsFilled={agentState.questionsEncountered.filter(q => q.filled).length}
              screenshotsTaken={agentState.screenshots.length}
              duration={agentState.startTime && agentState.endTime ? 
                agentState.endTime - agentState.startTime : 0}
            />
          </div>
          
          {/* Right Column - Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            <ActionLog actions={agentState.actions} />
            
            <QuestionTracker 
              questions={agentState.questionsEncountered}
              currentPage={agentState.currentPage}
            />
            
            <ScreenshotGallery screenshots={agentState.screenshots} />
          </div>
        </div>
      </main>
    </div>
  )
}
