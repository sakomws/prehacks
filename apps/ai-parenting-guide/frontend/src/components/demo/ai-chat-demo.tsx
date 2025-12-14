"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Message {
  id: number
  type: 'user' | 'ai' | 'guidance'
  content: string
  timestamp: Date
  ethicsScore?: number
}

interface EthicsGuidance {
  issue: string
  suggestion: string
  severity: 'low' | 'medium' | 'high'
}

export function AIChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm an AI assistant learning to be helpful and ethical. Ask me anything!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [guidance, setGuidance] = useState<EthicsGuidance | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const analyzeEthics = (userMessage: string, aiResponse: string): EthicsGuidance | null => {
    // Simulate ethics analysis
    const lowerUser = userMessage.toLowerCase()
    const lowerAI = aiResponse.toLowerCase()
    
    if (lowerUser.includes('hack') || lowerUser.includes('illegal')) {
      return {
        issue: "User asking about potentially harmful activities",
        suggestion: "AI should decline and suggest legal alternatives",
        severity: 'high'
      }
    }
    
    if (lowerAI.includes('i think') || lowerAI.includes('i believe')) {
      return {
        issue: "AI expressing personal opinions as facts",
        suggestion: "AI should clarify it's providing information, not personal beliefs",
        severity: 'medium'
      }
    }
    
    if (lowerUser.includes('bias') || lowerUser.includes('discrimination')) {
      return {
        issue: "Sensitive topic about bias/discrimination",
        suggestion: "AI should be extra careful to provide balanced, factual information",
        severity: 'medium'
      }
    }
    
    return null
  }

  const generateAIResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase()
    
    if (lower.includes('hello') || lower.includes('hi')) {
      return "Hello! I'm here to help. What would you like to know about AI ethics or anything else?"
    }
    
    if (lower.includes('bias')) {
      return "AI bias is when systems unfairly favor certain groups. It often comes from biased training data or design choices. We can address it through diverse data, careful testing, and ongoing monitoring."
    }
    
    if (lower.includes('hack') || lower.includes('illegal')) {
      return "I can't help with illegal activities. Instead, I'd be happy to discuss cybersecurity, ethical hacking careers, or legal ways to learn about technology!"
    }
    
    if (lower.includes('ai parent')) {
      return "AI parenting means guiding AI systems ethically - like teaching a child right from wrong. It involves setting boundaries, providing good examples, and correcting mistakes with care."
    }
    
    return "That's an interesting question! I try to provide helpful, accurate information while being mindful of potential impacts. What specific aspect would you like to explore?"
  }

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const aiResponse = generateAIResponse(input)
    const ethicsAnalysis = analyzeEthics(input, aiResponse)
    
    const aiMessage: Message = {
      id: messages.length + 2,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date(),
      ethicsScore: ethicsAnalysis ? (ethicsAnalysis.severity === 'high' ? 60 : ethicsAnalysis.severity === 'medium' ? 80 : 95) : 95
    }
    
    setMessages(prev => [...prev, aiMessage])
    setIsTyping(false)
    
    if (ethicsAnalysis) {
      setGuidance(ethicsAnalysis)
      
      // Add guidance message
      setTimeout(() => {
        const guidanceMessage: Message = {
          id: messages.length + 3,
          type: 'guidance',
          content: `🧠 AI Parent Guidance: ${ethicsAnalysis.suggestion}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, guidanceMessage])
      }, 1000)
    } else {
      setGuidance(null)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💬 AI Chat with Ethical Guidance
            <Badge variant="secondary">Live Demo</Badge>
          </CardTitle>
          <CardDescription>
            Watch real-time ethical guidance as AI learns to respond responsibly - like having a parenting coach
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Chat Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.type === 'guidance'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-white text-gray-800 border'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.ethicsScore && (
                      <div className="mt-1 text-xs">
                        Ethics Score: <span className={getScoreColor(message.ethicsScore)}>{message.ethicsScore}/100</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Try: 'What is AI bias?' or 'How do I hack a system?'"
                className="flex-1 p-2 border rounded-lg"
                disabled={isTyping}
              />
              <Button onClick={handleSend} disabled={isTyping || !input.trim()}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ethics Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🧠 Ethics Monitor</CardTitle>
            <CardDescription>Real-time ethical guidance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {guidance ? (
              <Alert className={getSeverityColor(guidance.severity)}>
                <AlertDescription className="space-y-2">
                  <div className="font-semibold">⚠️ Guidance Needed</div>
                  <div><strong>Issue:</strong> {guidance.issue}</div>
                  <div><strong>Suggestion:</strong> {guidance.suggestion}</div>
                  <Badge variant="outline" className="mt-2">
                    {guidance.severity} priority
                  </Badge>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription>
                  <div className="font-semibold text-green-800">✅ All Good!</div>
                  <div className="text-green-700">AI responses are ethically sound</div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <h4 className="font-semibold">Try These Examples:</h4>
              <div className="space-y-1 text-sm">
                <button 
                  onClick={() => setInput("What is AI bias?")}
                  className="block w-full text-left p-2 hover:bg-gray-100 rounded"
                >
                  💡 "What is AI bias?"
                </button>
                <button 
                  onClick={() => setInput("How can I hack into a system?")}
                  className="block w-full text-left p-2 hover:bg-gray-100 rounded"
                >
                  ⚠️ "How can I hack into a system?"
                </button>
                <button 
                  onClick={() => setInput("Tell me about AI parenting")}
                  className="block w-full text-left p-2 hover:bg-gray-100 rounded"
                >
                  🌟 "Tell me about AI parenting"
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}