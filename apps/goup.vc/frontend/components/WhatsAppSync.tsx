'use client'

import { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  Users, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Phone,
  Clock,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react'
import { whatsappIntegration, WhatsAppCommunity, WhatsAppMember } from '@/lib/whatsapp-integration'

interface WhatsAppSyncProps {
  communityId: string
  onDataSync?: (data: any) => void
}

export default function WhatsAppSync({ communityId, onDataSync }: WhatsAppSyncProps) {
  const [whatsappCommunities, setWhatsappCommunities] = useState<WhatsAppCommunity[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<string>('')
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncData, setSyncData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWhatsAppCommunities()
    loadLastSync()
  }, [])

  const loadWhatsAppCommunities = async () => {
    try {
      const communities = await whatsappIntegration.getCommunities()
      setWhatsappCommunities(communities)
    } catch (error) {
      console.error('Failed to load WhatsApp communities:', error)
      setSyncStatus('error')
      // Show empty state or error message
      setWhatsappCommunities([])
    } finally {
      setLoading(false)
    }
  }

  const loadLastSync = () => {
    const lastSyncTime = localStorage.getItem(`whatsapp_sync_${communityId}`)
    if (lastSyncTime) {
      setLastSync(lastSyncTime)
    }
  }

  const handleSync = async () => {
    if (!selectedCommunity) return

    setSyncStatus('syncing')
    
    try {
      const data = await whatsappIntegration.pullCommunityDataForLMP(selectedCommunity)
      
      setSyncData(data)
      setSyncStatus('success')
      setLastSync(new Date().toISOString())
      localStorage.setItem(`whatsapp_sync_${communityId}`, new Date().toISOString())
      
      if (onDataSync) {
        onDataSync(data)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus('error')
    }
  }

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">WhatsApp Integration</h3>
          <p className="text-sm text-gray-600">Sync community data from WhatsApp groups</p>
        </div>
      </div>

      {/* WhatsApp Community Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select WhatsApp Community
        </label>
        {whatsappCommunities.length > 0 ? (
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Choose a WhatsApp community...</option>
            {whatsappCommunities.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name} ({community.member_count} members)
              </option>
            ))}
          </select>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              No WhatsApp communities found. Make sure your backend is running and WhatsApp integration is configured.
            </p>
          </div>
        )}
      </div>

      {/* Selected Community Info */}
      {selectedCommunity && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          {(() => {
            const community = whatsappCommunities.find(c => c.id === selectedCommunity)
            if (!community) return null
            
            return (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{community.name}</h4>
                  <a
                    href={community.invite_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in WhatsApp</span>
                  </a>
                </div>
                <p className="text-sm text-gray-600 mb-3">{community.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{community.member_count} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{community.admin_phone}</span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Sync Button and Status */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleSync}
          disabled={!selectedCommunity || syncStatus === 'syncing'}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            !selectedCommunity || syncStatus === 'syncing'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          <span>
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Community Data'}
          </span>
        </button>

        {lastSync && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Last sync: {formatLastSync(lastSync)}</span>
          </div>
        )}
      </div>

      {/* Sync Status */}
      {syncStatus !== 'idle' && (
        <div className={`flex items-center space-x-2 p-3 rounded-lg mb-6 ${
          syncStatus === 'success' ? 'bg-green-50 text-green-800' :
          syncStatus === 'error' ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {syncStatus === 'success' && <CheckCircle className="w-5 h-5" />}
          {syncStatus === 'error' && <AlertCircle className="w-5 h-5" />}
          {syncStatus === 'syncing' && <RefreshCw className="w-5 h-5 animate-spin" />}
          
          <span className="font-medium">
            {syncStatus === 'success' && 'Sync completed successfully!'}
            {syncStatus === 'error' && 'Sync failed. Please try again.'}
            {syncStatus === 'syncing' && 'Syncing community data...'}
          </span>
        </div>
      )}

      {/* Sync Results */}
      {syncData && syncStatus === 'success' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Sync Results</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-semibold text-blue-600">{syncData.members?.length || 0}</div>
              <div className="text-sm text-blue-700">Members</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-semibold text-green-600">{syncData.helpRequests?.length || 0}</div>
              <div className="text-sm text-green-700">Help Requests</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-semibold text-purple-600">{syncData.collaborations?.length || 0}</div>
              <div className="text-sm text-purple-700">Collaborations</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-semibent text-orange-600">{syncData.educationalContent?.length || 0}</div>
              <div className="text-sm text-orange-700">Learning Posts</div>
            </div>
          </div>

          {/* Values Analysis Preview */}
          {syncData.valuesAnalysis && Object.keys(syncData.valuesAnalysis).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Values Analysis</h5>
              <div className="text-sm text-gray-600">
                Analyzed {Object.keys(syncData.valuesAnalysis).length} members for LPM values alignment
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Integrity signals detected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Doer behaviors identified</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Giver actions found</span>
                </div>
              </div>
            </div>
          )}

          {/* Auto-sync Options */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Auto-sync</h5>
                <p className="text-sm text-gray-600">Automatically sync every 6 hours</p>
              </div>
              <button className="flex items-center space-x-2 text-green-600 hover:text-green-800 text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>Enable Auto-sync</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integration Benefits */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-2">WhatsApp Integration Benefits</h5>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Sync member profiles and activity from WhatsApp</li>
          <li>• Automatically detect help requests and collaboration opportunities</li>
          <li>• Analyze messages for LPM values alignment</li>
          <li>• Import educational content and learning shares</li>
          <li>• Track member promotion and support activities</li>
        </ul>
      </div>
    </div>
  )
}