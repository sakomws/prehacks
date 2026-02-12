'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Users, Trophy, Plus, X, Clock, Globe, Zap, Code, Palette, Lightbulb, Target, Briefcase } from 'lucide-react'

interface Track {
  name: string
  description: string
  color: string
  icon: string
  max_team_size: number
  submission_requirements: string[]
  judging_criteria: Array<{
    name: string
    weight: number
    description: string
  }>
}

interface Prize {
  name: string
  description: string
  value: string
  position: number
  track_id?: number
  sponsor?: string
}

interface Resource {
  title: string
  description: string
  type: string
  url: string
  tags: string[]
  track_ids: number[]
}

interface ScheduleItem {
  title: string
  description: string
  start_time: string
  end_time: string
  type: string
  location?: string
  is_mandatory: boolean
  track_ids: number[]
}

export default function CreateHackathonPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form data
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    description: '',
    theme: '',
    hackathon_type: 'public' as 'internal' | 'public',
    format: 'hybrid' as 'in_person' | 'virtual' | 'hybrid',
    location: '',
    virtual_platform: '',
    max_participants: 100,
    start_date: '',
    end_date: '',
    timezone: 'America/Los_Angeles',
    registration_deadline: '',
    submission_deadline: '',
    judging_deadline: ''
  })

  const [teamSettings, setTeamSettings] = useState({
    team_formation_type: 'open' as 'open' | 'invite_only' | 'ai_matchmaking',
    min_team_size: 1,
    max_team_size: 4,
    allow_solo: true
  })

  const [tracks, setTracks] = useState<Track[]>([
    {
      name: 'Technical Innovation',
      description: 'Build innovative technical solutions using cutting-edge technologies',
      color: '#3B82F6',
      icon: '💻',
      max_team_size: 4,
      submission_requirements: ['GitHub Repository', 'Demo Video', 'Presentation Deck'],
      judging_criteria: [
        { name: 'Technical Complexity', weight: 0.25, description: 'Sophistication of implementation' },
        { name: 'Innovation', weight: 0.25, description: 'Novelty and creativity of approach' },
        { name: 'Code Quality', weight: 0.20, description: 'Clean, maintainable, well-documented code' },
        { name: 'Functionality', weight: 0.30, description: 'Does it work as intended?' }
      ]
    }
  ])

  const [prizes, setPrizes] = useState<Prize[]>([
    {
      name: 'Grand Prize',
      description: 'Overall best project across all tracks',
      value: '$10,000',
      position: 1,
      sponsor: ''
    }
  ])

  const [resources, setResources] = useState<Resource[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])

  const trackIcons = ['💻', '🎨', '🤖', '🏥', '🌱', '💰', '🚗', '🎮', '📱', '🔒']
  const trackColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1']

  const steps = [
    { id: 1, name: 'Basic Info', icon: Target },
    { id: 2, name: 'Tracks & Judging', icon: Code },
    { id: 3, name: 'Prizes', icon: Trophy },
    { id: 4, name: 'Resources', icon: Briefcase },
    { id: 5, name: 'Schedule', icon: Calendar },
    { id: 6, name: 'Review', icon: Lightbulb }
  ]

  const addTrack = () => {
    const newTrack: Track = {
      name: '',
      description: '',
      color: trackColors[tracks.length % trackColors.length],
      icon: trackIcons[tracks.length % trackIcons.length],
      max_team_size: 4,
      submission_requirements: ['GitHub Repository', 'Demo Video'],
      judging_criteria: [
        { name: 'Innovation', weight: 0.3, description: 'Novelty and creativity' },
        { name: 'Technical Quality', weight: 0.3, description: 'Implementation quality' },
        { name: 'Impact', weight: 0.4, description: 'Potential real-world impact' }
      ]
    }
    setTracks([...tracks, newTrack])
  }

  const updateTrack = (index: number, field: string, value: any) => {
    const updatedTracks = [...tracks]
    updatedTracks[index] = { ...updatedTracks[index], [field]: value }
    setTracks(updatedTracks)
  }

  const removeTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index))
  }

  const addPrize = () => {
    const newPrize: Prize = {
      name: '',
      description: '',
      value: '',
      position: prizes.length + 1,
      sponsor: ''
    }
    setPrizes([...prizes, newPrize])
  }

  const updatePrize = (index: number, field: string, value: any) => {
    const updatedPrizes = [...prizes]
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: value }
    setPrizes(updatedPrizes)
  }

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index))
  }

  const addResource = () => {
    const newResource: Resource = {
      title: '',
      description: '',
      type: 'dataset',
      url: '',
      tags: [],
      track_ids: []
    }
    setResources([...resources, newResource])
  }

  const addScheduleItem = () => {
    const newItem: ScheduleItem = {
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      type: 'workshop',
      location: '',
      is_mandatory: false,
      track_ids: []
    }
    setSchedule([...schedule, newItem])
  }

  const validateForm = () => {
    const errors = []
    
    if (!basicInfo.title.trim()) errors.push('Title is required')
    if (!basicInfo.description.trim()) errors.push('Description is required')
    if (!basicInfo.start_date) errors.push('Start date is required')
    if (!basicInfo.end_date) errors.push('End date is required')
    if (!basicInfo.registration_deadline) errors.push('Registration deadline is required')
    if (!basicInfo.submission_deadline) errors.push('Submission deadline is required')
    
    if (basicInfo.format === 'in_person' || basicInfo.format === 'hybrid') {
      if (!basicInfo.location.trim()) errors.push('Location is required for in-person/hybrid events')
    }
    
    if (tracks.length === 0) errors.push('At least one track is required')
    if (prizes.length === 0) errors.push('At least one prize is required')
    
    tracks.forEach((track, index) => {
      if (!track.name.trim()) errors.push(`Track ${index + 1} name is required`)
      if (!track.description.trim()) errors.push(`Track ${index + 1} description is required`)
    })
    
    prizes.forEach((prize, index) => {
      if (!prize.name.trim()) errors.push(`Prize ${index + 1} name is required`)
    })
    
    return errors
  }

  const handleSubmit = async () => {
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n' + validationErrors.join('\n'))
      return
    }

    setLoading(true)
    try {
      const hackathonData = {
        ...basicInfo,
        ...teamSettings,
        organizer_id: 1, // Default for demo
        tracks: tracks.map((track, index) => ({ ...track, id: index + 1 })),
        prizes: prizes.map((prize, index) => ({ ...prize, id: index + 1 })),
        resources,
        schedule
      }

      // Try backend API first
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
      const response = await fetch(`${backendUrl}/hackathons/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hackathonData)
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/hackathons/${result.id}`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error creating hackathon:', error)
      
      // Fallback: create hackathon locally if backend is not available
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const shouldCreateLocally = confirm(
          'Cannot connect to the backend server. Would you like to create the hackathon locally for demo purposes?'
        )
        
        if (shouldCreateLocally) {
          try {
            // Create hackathon locally
            const localHackathon = {
              ...basicInfo,
              ...teamSettings,
              organizer_id: 1,
              tracks: tracks.map((track, index) => ({ ...track, id: index + 1 })),
              prizes: prizes.map((prize, index) => ({ ...prize, id: index + 1 })),
              resources,
              schedule,
              id: Date.now(), // Generate unique ID
              status: 'draft',
              participant_count: 0,
              team_count: 0,
              submission_count: 0,
              created_at: new Date().toISOString()
            }
            
            // Store in localStorage
            const existingHackathons = JSON.parse(localStorage.getItem('local_hackathons') || '[]')
            existingHackathons.push(localHackathon)
            localStorage.setItem('local_hackathons', JSON.stringify(existingHackathons))
            
            // Also store individual hackathon
            localStorage.setItem(`hackathon_${localHackathon.id}`, JSON.stringify(localHackathon))
            
            alert('Hackathon created locally! Note: This is a demo version and won\'t be saved to the server.')
            router.push(`/hackathons/${localHackathon.id}`)
            return
          } catch (localError) {
            console.error('Failed to create hackathon locally:', localError)
            alert('Failed to create hackathon locally as well. Please try again.')
          }
        }
      } else {
        alert(`Failed to create hackathon: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hackathon Title *
                </label>
                <input
                  type="text"
                  value={basicInfo.title}
                  onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AI Innovation Challenge 2024"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your hackathon's goals, target audience, and what participants can expect..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme (Optional)
                </label>
                <input
                  type="text"
                  value={basicInfo.theme}
                  onChange={(e) => setBasicInfo({ ...basicInfo, theme: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AI for Good"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hackathon Type *
                </label>
                <select
                  value={basicInfo.hackathon_type}
                  onChange={(e) => setBasicInfo({ ...basicInfo, hackathon_type: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public - Open to everyone</option>
                  <option value="internal">Internal - Company/organization only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format *
                </label>
                <select
                  value={basicInfo.format}
                  onChange={(e) => setBasicInfo({ ...basicInfo, format: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="in_person">In-Person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={basicInfo.max_participants}
                  onChange={(e) => setBasicInfo({ ...basicInfo, max_participants: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="1000"
                />
              </div>

              {(basicInfo.format === 'in_person' || basicInfo.format === 'hybrid') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={basicInfo.location}
                    onChange={(e) => setBasicInfo({ ...basicInfo, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="San Francisco, CA"
                  />
                </div>
              )}

              {(basicInfo.format === 'virtual' || basicInfo.format === 'hybrid') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Virtual Platform
                  </label>
                  <input
                    type="text"
                    value={basicInfo.virtual_platform}
                    onChange={(e) => setBasicInfo({ ...basicInfo, virtual_platform: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Discord, Zoom, Slack"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={basicInfo.start_date}
                  onChange={(e) => setBasicInfo({ ...basicInfo, start_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={basicInfo.end_date}
                  onChange={(e) => setBasicInfo({ ...basicInfo, end_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={basicInfo.registration_deadline}
                  onChange={(e) => setBasicInfo({ ...basicInfo, registration_deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={basicInfo.submission_deadline}
                  onChange={(e) => setBasicInfo({ ...basicInfo, submission_deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Team Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Team Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Formation
                  </label>
                  <select
                    value={teamSettings.team_formation_type}
                    onChange={(e) => setTeamSettings({ ...teamSettings, team_formation_type: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Open - Anyone can join teams</option>
                    <option value="invite_only">Invite Only - Team leaders invite members</option>
                    <option value="ai_matchmaking">AI Matchmaking - AI suggests teammates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    value={teamSettings.min_team_size}
                    onChange={(e) => setTeamSettings({ ...teamSettings, min_team_size: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    value={teamSettings.max_team_size}
                    onChange={(e) => setTeamSettings({ ...teamSettings, max_team_size: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={teamSettings.allow_solo}
                    onChange={(e) => setTeamSettings({ ...teamSettings, allow_solo: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow solo participants</span>
                </label>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Tracks & Judging Criteria</h2>
              <button
                onClick={addTrack}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Track</span>
              </button>
            </div>

            <div className="space-y-6">
              {tracks.map((track, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Track {index + 1}</h3>
                    {tracks.length > 1 && (
                      <button
                        onClick={() => removeTrack(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Track Name *
                      </label>
                      <input
                        type="text"
                        value={track.name}
                        onChange={(e) => updateTrack(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Technical Innovation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Team Size
                      </label>
                      <input
                        type="number"
                        value={track.max_team_size}
                        onChange={(e) => updateTrack(index, 'max_team_size', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="10"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={track.description}
                        onChange={(e) => updateTrack(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe what this track focuses on..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {trackIcons.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => updateTrack(index, 'icon', icon)}
                            className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-colors ${
                              track.icon === icon
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {trackColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateTrack(index, 'color', color)}
                            className={`w-8 h-8 rounded-lg border-2 transition-colors ${
                              track.color === color
                                ? 'border-gray-800'
                                : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submission Requirements
                    </label>
                    <div className="space-y-2">
                      {track.submission_requirements.map((req, reqIndex) => (
                        <div key={reqIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={req}
                            onChange={(e) => {
                              const newReqs = [...track.submission_requirements]
                              newReqs[reqIndex] = e.target.value
                              updateTrack(index, 'submission_requirements', newReqs)
                            }}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="GitHub Repository"
                          />
                          <button
                            onClick={() => {
                              const newReqs = track.submission_requirements.filter((_, i) => i !== reqIndex)
                              updateTrack(index, 'submission_requirements', newReqs)
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newReqs = [...track.submission_requirements, '']
                          updateTrack(index, 'submission_requirements', newReqs)
                        }}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Requirement
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judging Criteria
                    </label>
                    <div className="space-y-3">
                      {track.judging_criteria.map((criteria, criteriaIndex) => (
                        <div key={criteriaIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                          <div>
                            <input
                              type="text"
                              value={criteria.name}
                              onChange={(e) => {
                                const newCriteria = [...track.judging_criteria]
                                newCriteria[criteriaIndex] = { ...criteria, name: e.target.value }
                                updateTrack(index, 'judging_criteria', newCriteria)
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Criteria name"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="1"
                              value={criteria.weight}
                              onChange={(e) => {
                                const newCriteria = [...track.judging_criteria]
                                newCriteria[criteriaIndex] = { ...criteria, weight: parseFloat(e.target.value) }
                                updateTrack(index, 'judging_criteria', newCriteria)
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.3"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={criteria.description}
                              onChange={(e) => {
                                const newCriteria = [...track.judging_criteria]
                                newCriteria[criteriaIndex] = { ...criteria, description: e.target.value }
                                updateTrack(index, 'judging_criteria', newCriteria)
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Description"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newCriteria = track.judging_criteria.filter((_, i) => i !== criteriaIndex)
                              updateTrack(index, 'judging_criteria', newCriteria)
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newCriteria = [...track.judging_criteria, { name: '', weight: 0.25, description: '' }]
                          updateTrack(index, 'judging_criteria', newCriteria)
                        }}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Criteria
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Prizes & Awards</h2>
              <button
                onClick={addPrize}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Prize</span>
              </button>
            </div>

            <div className="space-y-4">
              {prizes.map((prize, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Prize {index + 1}</h3>
                    {prizes.length > 1 && (
                      <button
                        onClick={() => removePrize(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prize Name *
                      </label>
                      <input
                        type="text"
                        value={prize.name}
                        onChange={(e) => updatePrize(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Grand Prize"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value
                      </label>
                      <input
                        type="text"
                        value={prize.value}
                        onChange={(e) => updatePrize(index, 'value', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="$10,000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position
                      </label>
                      <select
                        value={prize.position}
                        onChange={(e) => updatePrize(index, 'position', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>1st Place</option>
                        <option value={2}>2nd Place</option>
                        <option value={3}>3rd Place</option>
                        <option value={4}>Special Award</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sponsor (Optional)
                      </label>
                      <input
                        type="text"
                        value={prize.sponsor}
                        onChange={(e) => updatePrize(index, 'sponsor', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Company Name"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={prize.description}
                        onChange={(e) => updatePrize(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe what this prize is for..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Resources & APIs</h2>
              <button
                onClick={addResource}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>
            </div>

            <div className="space-y-4">
              {resources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No resources added yet. Resources are optional but can help participants get started.</p>
                </div>
              ) : (
                resources.map((resource, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Resource Title
                        </label>
                        <input
                          type="text"
                          value={resource.title}
                          onChange={(e) => {
                            const newResources = [...resources]
                            newResources[index] = { ...resource, title: e.target.value }
                            setResources(newResources)
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="API Documentation"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          value={resource.type}
                          onChange={(e) => {
                            const newResources = [...resources]
                            newResources[index] = { ...resource, type: e.target.value }
                            setResources(newResources)
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="dataset">Dataset</option>
                          <option value="api">API</option>
                          <option value="tool">Tool</option>
                          <option value="tutorial">Tutorial</option>
                          <option value="template">Template</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL
                        </label>
                        <input
                          type="url"
                          value={resource.url}
                          onChange={(e) => {
                            const newResources = [...resources]
                            newResources[index] = { ...resource, url: e.target.value }
                            setResources(newResources)
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://api.example.com/docs"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={resource.description}
                          onChange={(e) => {
                            const newResources = [...resources]
                            newResources[index] = { ...resource, description: e.target.value }
                            setResources(newResources)
                          }}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Describe this resource and how participants can use it..."
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setResources(resources.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Schedule & Events</h2>
              <button
                onClick={addScheduleItem}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>

            <div className="space-y-4">
              {schedule.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No schedule items added yet. Add workshops, presentations, and other events.</p>
                </div>
              ) : (
                schedule.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Title
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const newSchedule = [...schedule]
                            newSchedule[index] = { ...item, title: e.target.value }
                            setSchedule(newSchedule)
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Opening Ceremony"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          value={item.type}
                          onChange={(e) => {
                            const newSchedule = [...schedule]
                            newSchedule[index] = { ...item, type: e.target.value }
                            setSchedule(newSchedule)
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="workshop">Workshop</option>
                          <option value="presentation">Presentation</option>
                          <option value="networking">Networking</option>
                          <option value="judging">Judging</option>
                          <option value="ceremony">Ceremony</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <input
                          type="datetime-local"
                          value={item.start_time}
                          onChange={(e) => {
                            const newSchedule = [...schedule]
                            newSchedule[index] = { ...item, start_time: e.target.value }
                            setSchedule(newSchedule)
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <input
                          type="datetime-local"
                          value={item.end_time}
                          onChange={(e) => {
                            const newSchedule = [...schedule]
                            newSchedule[index] = { ...item, end_time: e.target.value }
                            setSchedule(newSchedule)
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => {
                            const newSchedule = [...schedule]
                            newSchedule[index] = { ...item, description: e.target.value }
                            setSchedule(newSchedule)
                          }}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Describe this event..."
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={item.is_mandatory}
                          onChange={(e) => {
                            const newSchedule = [...schedule]
                            newSchedule[index] = { ...item, is_mandatory: e.target.checked }
                            setSchedule(newSchedule)
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Mandatory attendance</span>
                      </label>
                      <button
                        onClick={() => setSchedule(schedule.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review & Submit</h2>
            
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hackathon Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700">Title:</span>
                  <span className="ml-2 text-gray-900">{basicInfo.title}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Format:</span>
                  <span className="ml-2 text-gray-900 capitalize">{basicInfo.format.replace('_', ' ')}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <span className="ml-2 text-gray-900">
                    {basicInfo.start_date && basicInfo.end_date && 
                      `${new Date(basicInfo.start_date).toLocaleDateString()} - ${new Date(basicInfo.end_date).toLocaleDateString()}`
                    }
                  </span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Tracks:</span>
                  <span className="ml-2 text-gray-900">{tracks.length} track(s)</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Prizes:</span>
                  <span className="ml-2 text-gray-900">{prizes.length} prize(s)</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6">
              <h4 className="font-medium text-blue-900 mb-2">Ready to launch?</h4>
              <p className="text-blue-700 text-sm">
                Your hackathon will be created in draft mode. You can publish it when you're ready to open registration.
              </p>
            </div>
          </div>
        )

      default:
        return <div>Step not implemented</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-medium tracking-tight text-gray-900 mb-2">
          Host a Hackathon
        </h1>
        <p className="text-xl text-gray-600 font-light">
          Create an amazing hackathon experience for your community
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                isActive 
                  ? 'border-blue-500 bg-blue-500 text-white' 
                  : isCompleted
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <div className="flex items-center space-x-4">
          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Hackathon</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}