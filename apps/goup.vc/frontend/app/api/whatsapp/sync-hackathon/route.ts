import { NextRequest, NextResponse } from 'next/server'

// Sync hackathon to WhatsApp community
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hackathonId, communityId } = body

    if (!hackathonId || !communityId) {
      return NextResponse.json(
        { error: 'Hackathon ID and Community ID are required' },
        { status: 400 }
      )
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    
    const response = await fetch(`${backendUrl}/api/whatsapp/sync-hackathon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY || ''}`
      },
      body: JSON.stringify({
        hackathonId,
        communityId
      })
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to sync hackathon to WhatsApp:', error)
    return NextResponse.json(
      { error: 'Failed to sync hackathon to WhatsApp' },
      { status: 500 }
    )
  }
}