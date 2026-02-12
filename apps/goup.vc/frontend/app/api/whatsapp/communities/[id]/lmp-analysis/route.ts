import { NextRequest, NextResponse } from 'next/server'

// Get LMP analysis for a specific WhatsApp community
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communityId = params.id
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    
    const response = await fetch(`${backendUrl}/api/whatsapp/communities/${communityId}/lmp-analysis`, {
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
    console.error('Failed to fetch LMP analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch LMP analysis' },
      { status: 500 }
    )
  }
}

// Trigger new LMP analysis for a community
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const communityId = params.id
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    
    const response = await fetch(`${backendUrl}/api/whatsapp/communities/${communityId}/lmp-analysis`, {
      method: 'POST',
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
    console.error('Failed to trigger LMP analysis:', error)
    return NextResponse.json(
      { error: 'Failed to trigger LMP analysis' },
      { status: 500 }
    )
  }
}