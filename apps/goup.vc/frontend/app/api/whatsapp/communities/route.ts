import { NextRequest, NextResponse } from 'next/server'

// Get all WhatsApp communities
export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    
    const response = await fetch(`${backendUrl}/api/whatsapp/communities`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY || ''}`
      }
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch WhatsApp communities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp communities' },
      { status: 500 }
    )
  }
}