'use client'

import { useState, useEffect } from 'react'
import { Send, AlertCircle } from 'lucide-react'
import { whatsappIntegration, WhatsAppCommunity } from '@/lib/whatsapp-integration'

interface WhatsAppCommunityListProps {
  onSelect: (communityId: string) => void
}

export default function WhatsAppCommunityList({ onSelect }: WhatsAppCommunityListProps) {
  const [communities, setCommunities] = useState<WhatsAppCommunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    try {
      const data = await whatsappIntegration.getCommunities()
      setCommunities(data)
      setError(null)
    } catch (err) {
      console.error('Failed to load communities:', err)
      setError('Failed to load WhatsApp communities. Please check your backend connection.')
      setCommunities([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900">Connection Error</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={loadCommunities}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (communities.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          No WhatsApp communities available. Make sure your WhatsApp integration is properly configured.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {communities.map((community) => (
        <div
          key={community.id}
          className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onSelect(community.id)}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{community.name}</div>
              <div className="text-sm text-gray-600">{community.member_count} members</div>
              {community.description && (
                <div className="text-xs text-gray-500 mt-1">{community.description}</div>
              )}
            </div>
            <Send className="w-5 h-5 text-green-600" />
          </div>
        </div>
      ))}
    </div>
  )
}