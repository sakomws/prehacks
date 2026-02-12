import { NextRequest, NextResponse } from 'next/server'
import { whatsappIntegration } from '@/lib/whatsapp-integration'

// Webhook verification for WhatsApp
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified successfully')
    return new NextResponse(challenge, { status: 200 })
  } else {
    console.error('WhatsApp webhook verification failed')
    return new NextResponse('Forbidden', { status: 403 })
  }
}

// Handle incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Process WhatsApp webhook payload
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            await processWhatsAppMessage(change.value)
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function processWhatsAppMessage(messageData: any) {
  try {
    const { messages, contacts } = messageData

    if (!messages || messages.length === 0) return

    for (const message of messages) {
      const { id, from, timestamp, type, text } = message
      
      // Find contact info
      const contact = contacts?.find((c: any) => c.wa_id === from)
      const senderName = contact?.profile?.name || from

      console.log('Processing WhatsApp message:', {
        id,
        from,
        senderName,
        type,
        content: text?.body || 'Non-text message',
        timestamp
      })

      // Analyze message for LPM values and activities
      await analyzeMessageForLMP({
        id,
        from,
        senderName,
        content: text?.body || '',
        timestamp,
        type
      })

      // Auto-respond to certain keywords
      await handleAutoResponses(from, text?.body || '')
    }
  } catch (error) {
    console.error('Error processing WhatsApp message:', error)
  }
}

async function analyzeMessageForLMP(message: any) {
  const { content, from, senderName } = message

  // Detect help requests
  const helpKeywords = ['help', 'need advice', 'looking for', 'can someone', 'assistance']
  const isHelpRequest = helpKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  )

  if (isHelpRequest) {
    console.log('Help request detected from', senderName, ':', content)
    // Store help request in database or trigger notification
    await storeHelpRequest(message)
  }

  // Detect collaboration opportunities
  const collabKeywords = ['collaborate', 'work together', 'team up', 'partner', 'join forces']
  const isCollaboration = collabKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  )

  if (isCollaboration) {
    console.log('Collaboration opportunity detected from', senderName, ':', content)
    await storeCollaborationOpportunity(message)
  }

  // Detect educational content
  const educationKeywords = ['learned', 'discovered', 'tip', 'tutorial', 'guide', 'lesson']
  const isEducational = educationKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  )

  if (isEducational) {
    console.log('Educational content detected from', senderName, ':', content)
    await storeEducationalContent(message)
  }

  // Analyze for LPM values
  const valuesAnalysis = analyzeForValues(content)
  if (Object.values(valuesAnalysis).some(score => score > 0)) {
    console.log('Values detected for', senderName, ':', valuesAnalysis)
    await updateMemberValues(from, valuesAnalysis)
  }
}

function analyzeForValues(content: string) {
  const valueKeywords = {
    integrity: ['honest', 'transparent', 'ethical', 'truth', 'authentic', 'genuine'],
    doer: ['built', 'created', 'shipped', 'launched', 'implemented', 'delivered'],
    giver: ['help', 'share', 'support', 'mentor', 'teach', 'contribute'],
    passion: ['love', 'excited', 'passionate', 'enthusiastic', 'inspired'],
    resilience: ['overcome', 'persevere', 'challenge', 'difficult', 'persist', 'bounce back']
  }

  const analysis: { [key: string]: number } = {
    integrity: 0, doer: 0, giver: 0, passion: 0, resilience: 0
  }

  const lowerContent = content.toLowerCase()
  
  Object.entries(valueKeywords).forEach(([value, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        analysis[value]++
      }
    })
  })

  return analysis
}

async function handleAutoResponses(phoneNumber: string, content: string) {
  const lowerContent = content.toLowerCase()

  // Auto-respond to hackathon inquiries
  if (lowerContent.includes('hackathon') || lowerContent.includes('competition')) {
    const response = "🚀 Interested in hackathons? Check out our latest events at " + 
                    process.env.NEXT_PUBLIC_APP_URL + "/hackathons"
    
    // Send auto-response (in a real implementation)
    console.log('Auto-response to', phoneNumber, ':', response)
  }

  // Auto-respond to community inquiries
  if (lowerContent.includes('community') || lowerContent.includes('join')) {
    const response = "👥 Welcome! Explore our communities at " + 
                    process.env.NEXT_PUBLIC_APP_URL + "/communities"
    
    console.log('Auto-response to', phoneNumber, ':', response)
  }
}

// Mock database functions (replace with real database operations)
async function storeHelpRequest(message: any) {
  // Store in database
  console.log('Storing help request:', message)
}

async function storeCollaborationOpportunity(message: any) {
  // Store in database
  console.log('Storing collaboration opportunity:', message)
}

async function storeEducationalContent(message: any) {
  // Store in database
  console.log('Storing educational content:', message)
}

async function updateMemberValues(phoneNumber: string, valuesAnalysis: any) {
  // Update member values in database
  console.log('Updating member values for', phoneNumber, ':', valuesAnalysis)
}