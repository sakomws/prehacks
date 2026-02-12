import { NextRequest, NextResponse } from 'next/server'

// Send message to WhatsApp community
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { communityId, message } = body

    if (!communityId || !message) {
      return NextResponse.json(
        { error: 'Community ID and message are required' },
        { status: 400 }
      )
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    
    const response = await fetch(`${backendUrl}/api/whatsapp/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY || ''}`
      },
      body: JSON.stringify({
        communityId,
        message
      })
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error)
    return NextResponse.json(
      { error: 'Failed to send WhatsApp message' },
      { status: 500 }
    )
  }
}