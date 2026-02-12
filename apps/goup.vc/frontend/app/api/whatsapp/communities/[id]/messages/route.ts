import { NextRequest, NextResponse } from 'next/server'

// Get messages from a specific WhatsApp community
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communityId = params.id
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || '50'
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    
    const response = await fetch(`${backendUrl}/api/whatsapp/communities/${communityId}/messages?limit=${limit}`, {
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
    console.error('Failed to fetch community messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch community messages' },
      { status: 500 }
    )
  }
}