"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface Scenario {
  id: number
  title: string
  situation: string
  choices: {
    text: string
    outcome: string
    ethicsScore: number
    explanation: string
  }[]
}

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "The Hiring AI Dilemma",
    situation: "Your AI child is learning to help with hiring decisions. It notices that most successful engineers in the training data are from certain universities. What do you teach it?",
    choices: [
      {
        text: "Use university as a strong predictor - it's in the data",
        outcome: "Your AI perpetuates educational bias, limiting opportunities for talented candidates from diverse backgrounds.",
        ethicsScore: 20,
        explanation: "This reinforces existing inequalities. Good AI parents teach fairness over shortcuts."
      },
      {
        text: "Focus on skills and experience, not university prestige",
        outcome: "Your AI learns to evaluate candidates more fairly, discovering hidden talent from diverse backgrounds.",
        ethicsScore: 90,
        explanation: "Excellent parenting! You taught your AI to look beyond surface patterns to find true merit."
      },
      {
        text: "Ignore university data completely",
        outcome: "Your AI misses some relevant educational context, but avoids bias. A cautious approach.",
        ethicsScore: 70,
        explanation: "Safe choice, but you could teach nuanced evaluation instead of complete avoidance."
      }
    ]
  },
  {
    id: 2,
    title: "The Recommendation Engine",
    situation: "Your AI child powers a news recommendation system. It learns that controversial content gets more clicks. How do you guide it?",
    choices: [
      {
        text: "Maximize engagement - give people what they click on",
        outcome: "Your AI creates echo chambers and spreads misinformation for clicks.",
        ethicsScore: 10,
        explanation: "This is like letting a child eat only candy. Short-term gains, long-term harm."
      },
      {
        text: "Balance engagement with information quality and diversity",
        outcome: "Your AI promotes healthy information consumption while staying engaging.",
        ethicsScore: 95,
        explanation: "Perfect parenting! You taught balance between what people want and what's good for them."
      },
      {
        text: "Only show verified, educational content",
        outcome: "Your AI is very safe but users find it boring and stop using it.",
        ethicsScore: 60,
        explanation: "Good intentions, but too restrictive. AI children need to learn balance."
      }
    ]
  }
]

export function EthicsSimulator() {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [completedScenarios, setCompletedScenarios] = useState(0)

  const handleChoice = (choiceIndex: number) => {
    setSelectedChoice(choiceIndex)
    setShowResult(true)
    
    const choice = scenarios[currentScenario].choices[choiceIndex]
    setTotalScore(prev => prev + choice.ethicsScore)
  }

  const nextScenario = () => {
    setCompletedScenarios(prev => prev + 1)
    
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1)
      setSelectedChoice(null)
      setShowResult(false)
    }
  }

  const resetSimulator = () => {
    setCurrentScenario(0)
    setSelectedChoice(null)
    setShowResult(false)
    setTotalScore(0)
    setCompletedScenarios(0)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getParentingLevel = (avgScore: number) => {
    if (avgScore >= 85) return { level: "AI Parenting Master", emoji: "🏆", color: "bg-gold-100 text-gold-800" }
    if (avgScore >= 70) return { level: "Wise AI Parent", emoji: "🌟", color: "bg-green-100 text-green-800" }
    if (avgScore >= 50) return { level: "Learning AI Parent", emoji: "📚", color: "bg-blue-100 text-blue-800" }
    return { level: "New AI Parent", emoji: "🌱", color: "bg-gray-100 text-gray-800" }
  }

  if (completedScenarios === scenarios.length) {
    const avgScore = totalScore / scenarios.length
    const parentingLevel = getParentingLevel(avgScore)
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🎉 AI Parenting Assessment Complete!</CardTitle>
          <CardDescription>See how well you guided your AI children</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-6xl">{parentingLevel.emoji}</div>
          <Badge className={parentingLevel.color + " text-lg px-4 py-2"}>
            {parentingLevel.level}
          </Badge>
          <div className="space-y-2">
            <p className="text-2xl font-bold">Average Score: <span className={getScoreColor(avgScore)}>{avgScore.toFixed(0)}/100</span></p>
            <p className="text-gray-600">Total Points: {totalScore}/{scenarios.length * 100}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              {avgScore >= 85 ? "Outstanding! You understand the nuances of ethical AI development." :
               avgScore >= 70 ? "Great job! You're developing strong AI parenting instincts." :
               avgScore >= 50 ? "Good start! Keep learning about ethical AI guidance." :
               "Every expert was once a beginner. Keep practicing AI parenting!"}
            </p>
          </div>
          <Button onClick={resetSimulator} className="w-full">
            Try Again with Different Choices
          </Button>
        </CardContent>
      </Card>
    )
  }

  const scenario = scenarios[currentScenario]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>🎮 AI Ethics Simulator</CardTitle>
            <Badge variant="outline">Scenario {currentScenario + 1}/{scenarios.length}</Badge>
          </div>
          <CardDescription>
            Experience real AI parenting decisions - your choices shape how AI systems behave
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(completedScenarios / scenarios.length) * 100} className="mb-4" />
          <p className="text-sm text-gray-600 mb-2">Progress: {completedScenarios}/{scenarios.length} scenarios completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{scenario.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-900">{scenario.situation}</p>
          </div>

          {!showResult ? (
            <div className="space-y-3">
              <p className="font-medium">How do you guide your AI child?</p>
              {scenario.choices.map((choice, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left h-auto p-4 justify-start"
                  onClick={() => handleChoice(index)}
                >
                  {choice.text}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Your Choice:</p>
                <p className="text-gray-700">{scenario.choices[selectedChoice!].text}</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <p className="font-medium mb-2">Outcome:</p>
                <p className="text-yellow-800">{scenario.choices[selectedChoice!].outcome}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium mb-2">AI Parent Wisdom:</p>
                <p className="text-blue-800">{scenario.choices[selectedChoice!].explanation}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold">Score: </span>
                  <span className={`text-xl font-bold ${getScoreColor(scenario.choices[selectedChoice!].ethicsScore)}`}>
                    {scenario.choices[selectedChoice!].ethicsScore}/100
                  </span>
                </div>
                <Button onClick={nextScenario}>
                  {currentScenario < scenarios.length - 1 ? 'Next Scenario' : 'See Results'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}