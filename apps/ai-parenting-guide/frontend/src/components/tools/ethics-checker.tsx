"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface EthicsQuestion {
  id: string
  category: string
  question: string
  weight: number
}

interface EthicsResult {
  category: string
  score: number
  maxScore: number
  issues: string[]
  recommendations: string[]
}

const ethicsQuestions: EthicsQuestion[] = [
  {
    id: 'fairness-1',
    category: 'Fairness',
    question: 'Does your AI system treat all user groups equally?',
    weight: 10
  },
  {
    id: 'fairness-2',
    category: 'Fairness',
    question: 'Have you tested for bias across different demographics?',
    weight: 10
  },
  {
    id: 'transparency-1',
    category: 'Transparency',
    question: 'Can users understand how the AI makes decisions?',
    weight: 8
  },
  {
    id: 'transparency-2',
    category: 'Transparency',
    question: 'Do you clearly disclose when AI is being used?',
    weight: 9
  },
  {
    id: 'privacy-1',
    category: 'Privacy',
    question: 'Do you minimize data collection to what is necessary?',
    weight: 9
  },
  {
    id: 'privacy-2',
    category: 'Privacy',
    question: 'Do users have control over their data?',
    weight: 8
  },
  {
    id: 'accountability-1',
    category: 'Accountability',
    question: 'Is there a clear process for handling AI errors?',
    weight: 7
  },
  {
    id: 'accountability-2',
    category: 'Accountability',
    question: 'Can decisions be reviewed by humans when needed?',
    weight: 8
  },
  {
    id: 'safety-1',
    category: 'Safety',
    question: 'Have you tested for potential harmful outputs?',
    weight: 10
  },
  {
    id: 'safety-2',
    category: 'Safety',
    question: 'Are there safeguards against misuse?',
    weight: 9
  }
]

export function EthicsChecker() {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [results, setResults] = useState<EthicsResult[] | null>(null)
  const [showResults, setShowResults] = useState(false)

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }))
  }

  const nextQuestion = () => {
    if (currentStep < ethicsQuestions.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      calculateResults()
    }
  }

  const prevQuestion = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const calculateResults = () => {
    const categories = ['Fairness', 'Transparency', 'Privacy', 'Accountability', 'Safety']
    const categoryResults: EthicsResult[] = []

    categories.forEach(category => {
      const categoryQuestions = ethicsQuestions.filter(q => q.category === category)
      const totalScore = categoryQuestions.reduce((sum, q) => {
        return sum + (answers[q.id] || 0) * q.weight
      }, 0)
      const maxScore = categoryQuestions.reduce((sum, q) => sum + 5 * q.weight, 0)
      const percentage = (totalScore / maxScore) * 100

      const issues: string[] = []
      const recommendations: string[] = []

      if (percentage < 60) {
        issues.push(`${category} score is below acceptable threshold`)
        recommendations.push(`Immediate attention needed for ${category.toLowerCase()} practices`)
      } else if (percentage < 80) {
        recommendations.push(`Consider improvements in ${category.toLowerCase()} implementation`)
      }

      categoryResults.push({
        category,
        score: totalScore,
        maxScore,
        issues,
        recommendations
      })
    })

    setResults(categoryResults)
    setShowResults(true)
  }

  const resetChecker = () => {
    setAnswers({})
    setCurrentStep(0)
    setResults(null)
    setShowResults(false)
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (percentage >= 80) return { text: 'Good', color: 'bg-blue-100 text-blue-800' }
    if (percentage >= 60) return { text: 'Needs Improvement', color: 'bg-yellow-100 text-yellow-800' }
    return { text: 'Critical Issues', color: 'bg-red-100 text-red-800' }
  }

  if (showResults && results) {
    const overallScore = results.reduce((sum, r) => sum + r.score, 0)
    const overallMax = results.reduce((sum, r) => sum + r.maxScore, 0)
    const overallPercentage = (overallScore / overallMax) * 100
    const overallBadge = getScoreBadge(overallPercentage)

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="apple-card">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">🎯 Ethics Assessment Results</CardTitle>
            <CardDescription className="text-lg">
              Your AI system's ethical evaluation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">
                {overallPercentage >= 80 ? '🏆' : overallPercentage >= 60 ? '⚠️' : '🚨'}
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  <span className={getScoreColor(overallPercentage)}>
                    {overallPercentage.toFixed(0)}%
                  </span>
                </div>
                <Badge className={overallBadge.color + " text-lg px-4 py-2"}>
                  {overallBadge.text}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => {
                const percentage = (result.score / result.maxScore) * 100
                const badge = getScoreBadge(percentage)
                
                return (
                  <Card key={result.category} className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{result.category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                          {percentage.toFixed(0)}%
                        </div>
                        <Badge className={badge.color + " text-xs"}>
                          {badge.text}
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      
                      {result.issues.length > 0 && (
                        <Alert variant="destructive" className="text-xs">
                          <AlertDescription>
                            {result.issues[0]}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {result.recommendations.length > 0 && (
                        <Alert className="text-xs">
                          <AlertDescription>
                            {result.recommendations[0]}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="text-center space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                  🧠 AI Parenting Insight
                </h4>
                <p className="text-blue-800 dark:text-blue-200">
                  {overallPercentage >= 80 
                    ? "Excellent work! Your AI system demonstrates strong ethical foundations. Continue monitoring and improving."
                    : overallPercentage >= 60
                    ? "Good progress! Focus on the areas needing improvement to strengthen your AI's ethical behavior."
                    : "Critical attention needed. Address the highlighted issues before deploying your AI system."
                  }
                </p>
              </div>
              
              <Button onClick={resetChecker} className="ai-button-primary">
                Run Another Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = ethicsQuestions[currentStep]
  const progress = ((currentStep + 1) / ethicsQuestions.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="apple-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>AI Ethics Assessment</CardTitle>
            <Badge variant="outline">
              {currentStep + 1} of {ethicsQuestions.length}
            </Badge>
          </div>
          <CardDescription>
            Evaluate your AI system across key ethical dimensions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <Badge className="mb-3" variant="outline">
                {currentQuestion.category}
              </Badge>
              <h3 className="text-lg font-semibold mb-2">
                {currentQuestion.question}
              </h3>
            </div>

            <div className="space-y-3">
              <Label>Rate your AI system (1 = Poor, 5 = Excellent):</Label>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <Button
                    key={score}
                    variant={answers[currentQuestion.id] === score ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleAnswer(currentQuestion.id, score)}
                  >
                    {score}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={nextQuestion}
              disabled={!answers[currentQuestion.id]}
              className="ai-button-primary"
            >
              {currentStep === ethicsQuestions.length - 1 ? 'Get Results' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}