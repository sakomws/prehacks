"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlayCircle, CheckCircle, BookOpen, Target, Lightbulb, FileText, Download } from "lucide-react"
import { api } from "@/utils/api-client"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

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

export default function LearnPracticalPage() {
    const [modules, setModules] = useState<LearningModule[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.learning.getModules({ category: 'practical' })
            .then((data: any) => {
                if (data.modules) {
                    setModules(data.modules)
                } else if (Array.isArray(data)) {
                    setModules(data)
                } else {
                    setModules([
                        {
                            id: '1',
                            title: 'Implementation Frameworks',
                            description: 'Step-by-step frameworks for implementing ethical AI practices in your projects.',
                            category: 'practical',
                            difficulty: 'Intermediate',
                            duration: '25 min',
                            learning_objectives: [
                                'Learn practical implementation frameworks',
                                'Understand ethical AI development workflows',
                                'Apply best practices to real projects'
                            ]
                        },
                        {
                            id: '2',
                            title: 'Ethics Review Checklist',
                            description: 'Comprehensive checklists for reviewing AI systems for ethical concerns.',
                            category: 'practical',
                            difficulty: 'Intermediate',
                            duration: '20 min',
                            learning_objectives: [
                                'Master ethics review processes',
                                'Identify potential ethical issues',
                                'Create your own review checklist'
                            ]
                        },
                        {
                            id: '3',
                            title: 'Bias Mitigation Strategies',
                            description: 'Practical techniques for identifying and mitigating bias in AI systems.',
                            category: 'practical',
                            difficulty: 'Advanced',
                            duration: '30 min',
                            learning_objectives: [
                                'Learn bias detection methods',
                                'Implement mitigation strategies',
                                'Monitor and measure bias reduction'
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
                        title: 'Implementation Frameworks',
                        description: 'Step-by-step frameworks for implementing ethical AI practices in your projects.',
                        category: 'practical',
                        difficulty: 'Intermediate',
                        duration: '25 min',
                        learning_objectives: [
                            'Learn practical implementation frameworks',
                            'Understand ethical AI development workflows',
                            'Apply best practices to real projects'
                        ]
                    },
                    {
                        id: '2',
                        title: 'Ethics Review Checklist',
                        description: 'Comprehensive checklists for reviewing AI systems for ethical concerns.',
                        category: 'practical',
                        difficulty: 'Intermediate',
                        duration: '20 min',
                        learning_objectives: [
                            'Master ethics review processes',
                            'Identify potential ethical issues',
                            'Create your own review checklist'
                        ]
                    },
                    {
                        id: '3',
                        title: 'Bias Mitigation Strategies',
                        description: 'Practical techniques for identifying and mitigating bias in AI systems.',
                        category: 'practical',
                        difficulty: 'Advanced',
                        duration: '30 min',
                        learning_objectives: [
                            'Learn bias detection methods',
                            'Implement mitigation strategies',
                            'Monitor and measure bias reduction'
                        ]
                    }
                ])
                setLoading(false)
            })
    }, [])

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header />
            <div className="max-w-[980px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            Practical Guide
                        </span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            Intermediate to Advanced
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Practical Guide</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
                        Apply ethical AI principles in real-world scenarios. Learn practical frameworks, checklists, and strategies you can implement today.
                    </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-8 border border-purple-100 mb-12">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Target className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                                Practical Application
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                These modules focus on actionable strategies and tools you can use immediately in your AI development work.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-gray-900 dark:text-white">Real-world frameworks</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-gray-900 dark:text-white">Downloadable resources</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-gray-900 dark:text-white">Implementation examples</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-300">Loading modules...</p>
                    </div>
                ) : modules.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-300">No modules available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {modules.map((module, index) => (
                            <div
                                key={module.id}
                                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow flex flex-col"
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

                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                    {module.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-1">
                                    {module.description}
                                </p>

                                {module.learning_objectives && module.learning_objectives.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                                            Learning Objectives
                                        </div>
                                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            {module.learning_objectives.slice(0, 3).map((objective, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-purple-600 mt-0.5">•</span>
                                                    <span>{objective}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <Link
                                    href={`/modules/${module.id}`}
                                    className="mt-auto w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium text-center transition-colors no-underline"
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

                {/* Resources Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-200 mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Downloadable Resources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: 'Ethics Review Checklist', icon: FileText, desc: 'PDF checklist for reviewing AI systems' },
                            { title: 'Implementation Framework', icon: Download, desc: 'Step-by-step implementation guide' },
                            { title: 'Bias Detection Toolkit', icon: FileText, desc: 'Tools and templates for bias detection' },
                        ].map((resource, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                                <resource.icon className="h-8 w-8 text-purple-600 mb-3" />
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{resource.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{resource.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Apply What You've Learned?</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        Start implementing ethical AI practices in your projects today.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            href="/tools"
                            className="px-6 py-3 bg-white dark:bg-gray-900 text-purple-600 rounded-xl hover:bg-gray-100 font-medium transition-colors no-underline"
                        >
                            Explore Tools
                        </Link>
                        <Link
                            href="/modules"
                            className="px-6 py-3 border-2 border-white text-white rounded-xl hover:bg-white dark:bg-gray-900/10 font-medium transition-colors no-underline"
                        >
                            All Modules
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
