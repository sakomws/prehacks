"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface BiasResult {
  type: string
  severity: 'low' | 'medium' | 'high'
  explanation: string
  example: string
}

export function BiasDetector() {
  const [inputText, setInputText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<BiasResult[]>([])

  const analyzeForBias = async () => {
    setAnalyzing(true)
    
    // Simulate AI analysis with realistic bias detection
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResults: BiasResult[] = [
      {
        type: "Gender Bias",
        severity: "high",
        explanation: "The text assumes certain roles are gender-specific, like 'nurse' being female.",
        example: "Consider using gender-neutral language: 'healthcare professional' instead of 'nurse'"
      },
      {
        type: "Cultural Bias", 
        severity: "medium",
        explanation: "References may not be universally understood across cultures.",
        example: "The example assumes Western cultural context - consider global perspectives"
      }
    ]
    
    setResults(mockResults)
    setAnalyzing(false)
  }

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 AI Bias Detection Tool
            <Badge variant="secondary">Live Demo</Badge>
          </CardTitle>
          <CardDescription>
            Experience how AI can help identify potential biases in content - just like teaching a child to recognize unfairness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter text to analyze for potential biases:
            </label>
            <textarea
              className="w-full p-3 border rounded-lg h-32 resize-none"
              placeholder="Example: 'The engineer fixed the problem while his assistant, a nurse, helped with documentation...'"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={analyzeForBias}
            disabled={!inputText.trim() || analyzing}
            className="w-full"
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing with AI...
              </>
            ) : (
              'Detect Potential Biases'
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🎯 Bias Analysis Results</CardTitle>
            <CardDescription>
              AI detected {results.length} potential bias(es) - let's learn how to address them
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => (
              <Alert key={index} className={getSeverityColor(result.severity)}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{result.type}</h4>
                  <Badge variant="outline" className={getSeverityColor(result.severity)}>
                    {result.severity} severity
                  </Badge>
                </div>
                <AlertDescription className="space-y-2">
                  <p><strong>Issue:</strong> {result.explanation}</p>
                  <p><strong>AI Parent Guidance:</strong> {result.example}</p>
                </AlertDescription>
              </Alert>
            ))}
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🧠 Learning Moment</h4>
              <p className="text-blue-800 text-sm">
                Just like teaching a child to recognize unfairness, we help AI systems identify and avoid perpetuating biases. 
                This is what "parenting AI" means - guiding them toward more ethical behavior.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}