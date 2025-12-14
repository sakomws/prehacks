"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlayCircle, CheckCircle, BookOpen, Target, Lightbulb } from "lucide-react"
import { api } from "@/utils/api-client"
import { Navigation } from "@/components/layout/nav"
import { Footer } from "@/components/layout/footer"

interface LearningModule {
    id: string
    title: string
    description: string
    category: string
    difficulty: string
    duration?: string
    learning_objectives?: string[]
    content?: string
}

export default function LearnBasicsPage() {
    const [modules, setModules] = useState<LearningModule[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.learning.getModules({ category: 'ai-ethics-basics' })
            .then((data: any) => {
                if (data.modules) {
                    setModules(data.modules)
                } else if (Array.isArray(data)) {
                    setModules(data)
                } else {
                    setModules([
                        {
                            id: '1',
                            title: 'Introduction to AI Ethics',
                            description: 'Learn the fundamental principles of ethical AI development and why they matter.',
                            category: 'ai-ethics-basics',
                            difficulty: 'Beginner',
                            duration: '15 min',
                            learning_objectives: [
                                'Understand core AI ethics principles',
                                'Recognize ethical dilemmas in AI',
                                'Learn the basics of responsible AI development'
                            ]
                        },
                        {
                            id: '2',
                            title: 'Understanding Bias in AI',
                            description: 'Explore how bias enters AI systems and how to identify and mitigate it.',
                            category: 'ai-ethics-basics',
                            difficulty: 'Beginner',
                            duration: '20 min',
                            learning_objectives: [
                                'Identify sources of bias in AI',
                                'Understand impact of biased AI systems',
                                'Learn basic bias mitigation strategies'
                            ]
                        },
                        {
                            id: '3',
                            title: 'Privacy and Data Ethics',
                            description: 'Understand the importance of privacy in AI systems and ethical data handling.',
                            category: 'ai-ethics-basics',
                            difficulty: 'Beginner',
                            duration: '18 min',
                            learning_objectives: [
                                'Learn privacy principles for AI',
                                'Understand data collection ethics',
                                'Explore consent and transparency'
                            ]
                        }
                    ])
                }
                setLoading(false)
            })
            .catch(() => {
                setModules([
                    {
                        id: '1',
                        title: 'Introduction to AI Ethics',
                        description: 'Learn the fundamental principles of ethical AI development and why they matter.',
                        category: 'ai-ethics-basics',
                        difficulty: 'Beginner',
                        duration: '15 min',
                        learning_objectives: [
                            'Understand core AI ethics principles',
                            'Recognize ethical dilemmas in AI',
                            'Learn the basics of responsible AI development'
                        ]
                    },
                    {
                        id: '2',
                        title: 'Understanding Bias in AI',
                        description: 'Explore how bias enters AI systems and how to identify and mitigate it.',
                        category: 'ai-ethics-basics',
                        difficulty: 'Beginner',
                        duration: '20 min',
                        learning_objectives: [
                            'Identify sources of bias in AI',
                            'Understand impact of biased AI systems',
                            'Learn basic bias mitigation strategies'
                        ]
                    },
                    {
                        id: '3',
                        title: 'Privacy and Data Ethics',
                        description: 'Understand the importance of privacy in AI systems and ethical data handling.',
                        category: 'ai-ethics-basics',
                        difficulty: 'Beginner',
                        duration: '18 min',
                        learning_objectives: [
                            'Learn privacy principles for AI',
                            'Understand data collection ethics',
                            'Explore consent and transparency'
                        ]
                    }
                ])
                setLoading(false)
            })
    }, [])

    return (
        <div className="min-h-screen bg-white">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            AI Ethics Basics
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Beginner Friendly
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Ethics Basics</h1>
                    <p className="text-xl text-gray-600 max-w-3xl">
                        Start your journey into ethical AI development with these foundational modules.
                        Learn the core principles, understand common challenges, and build a strong ethical foundation.
                    </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-8 border border-blue-100 mb-12">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Target className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2 text-gray-900">
                                Learning Path Overview
                            </h2>
                            <p className="text-gray-600">
                                Complete these modules in order to build a comprehensive understanding of AI ethics fundamentals.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-gray-900">Self-paced learning</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-gray-900">Interactive exercises</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-gray-900">Real-world examples</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Loading modules...</p>
                    </div>
                ) : modules.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">No modules available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {modules.map((module, index) => (
                            <div
                                key={module.id}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                        Module {index + 1}
                                    </span>
                                    {module.duration && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <PlayCircle className="h-3.5 w-3.5" />
                                            {module.duration}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold mb-2 text-gray-900">
                                    {module.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 flex-1">
                                    {module.description}
                                </p>

                                {module.learning_objectives && module.learning_objectives.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                                            Learning Objectives
                                        </div>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            {module.learning_objectives.slice(0, 3).map((objective, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-blue-600 mt-0.5">•</span>
                                                    <span>{objective}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <Link
                                    href={`/modules/${module.id}`}
                                    className="mt-auto w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-center transition-colors no-underline"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        Start Module
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">What's Next?</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        After completing the basics, explore more advanced topics and practical applications.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            href="/modules"
                            className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 font-medium transition-colors no-underline"
                        >
                            All Modules
                        </Link>
                        <Link
                            href="/tools"
                            className="px-6 py-3 border-2 border-white text-white rounded-xl hover:bg-white/10 font-medium transition-colors no-underline"
                        >
                            Explore Tools
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
