"use client"

import { useEffect, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/utils/api-client'
import { ChevronLeft, CheckCircle, PlayCircle, Clock, BookOpen, Target } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface LearningModule {
    id: string
    slug: string
    title: string
    description: string
    category: string
    difficulty: string
    estimated_duration: number
    learning_objectives: string[]
    content_sections: Array<{
        type: string
        title?: string
        content: string
        order: number
    }>
    tags: string[]
    view_count: number
    completion_count: number
    average_rating: number
}

export default function ModulePage() {
    const params = useParams()
    const slug = params.slug as string
    const [module, setModule] = useState<LearningModule | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchModule() {
            try {
                setLoading(true)
                // First, get all modules to find by slug
                const modulesResponse = await api.learning.getModules({})
                const modules = modulesResponse.modules || modulesResponse || []
                
                // Find module by slug
                const foundModule = Array.isArray(modules) 
                    ? modules.find((m: any) => m.slug === slug)
                    : null
                
                if (!foundModule) {
                    setError("Module not found")
                    setLoading(false)
                    return
                }
                
                // Fetch full module details by ID
                const fullModule = await api.learning.getModule(foundModule.id)
                setModule(fullModule)
            } catch (err: any) {
                console.error("Error fetching module:", err)
                setError(err.message || "Failed to load module")
            } finally {
                setLoading(false)
            }
        }
        
        if (slug) {
            fetchModule()
        }
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header />
                <div className="max-w-[980px] mx-auto px-4 sm:px-6 py-12">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-300">Loading module...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !module) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header />
                <div className="max-w-[980px] mx-auto px-4 sm:px-6 py-12">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <p className="text-xl text-gray-900 dark:text-white mb-4">Module not found</p>
                            <p className="text-gray-600 dark:text-gray-300 mb-8">{error || "The module you're looking for doesn't exist."}</p>
                            <Link 
                                href="/modules" 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors no-underline"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to Modules
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    const duration = module.estimated_duration ? `${module.estimated_duration} min` : "N/A"

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header />
            <main className="max-w-[980px] mx-auto px-4 sm:px-6 py-8 md:py-12">
                {/* Module Header */}
                <div className="space-y-6 mb-12">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {module.category}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {module.difficulty}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <Clock className="h-4 w-4" />
                            <span>{duration}</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {module.title}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                        {module.description}
                    </p>
                    
                    {/* Learning Objectives */}
                    {module.learning_objectives && module.learning_objectives.length > 0 && (
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex items-start gap-3 mb-4">
                                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Learning Objectives</h2>
                            </div>
                            <ul className="space-y-2">
                                {module.learning_objectives.map((objective: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <span>{objective}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="space-y-8 mb-12">
                    {module.content_sections && module.content_sections.length > 0 ? (
                        module.content_sections
                            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                            .map((section: any, idx: number) => (
                                <div 
                                    key={idx} 
                                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-8 shadow-sm"
                                >
                                    {section.title && (
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                            {section.title}
                                        </h2>
                                    )}
                                    <div className="prose prose-lg max-w-none text-gray-700">
                                        {section.type === 'text' ? (
                                            <div className="whitespace-pre-wrap leading-relaxed">
                                                {section.content}
                                            </div>
                                        ) : (
                                            <div className="whitespace-pre-wrap leading-relaxed">
                                                {section.content}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-12 text-center">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Content coming soon</p>
                            <p className="text-sm text-gray-500">
                                This module is being prepared. Check back soon for interactive content!
                            </p>
                        </div>
                    )}
                </div>

                {/* Tags */}
                {module.tags && module.tags.length > 0 && (
                    <div className="mb-12">
                        <div className="flex flex-wrap gap-2">
                            {module.tags.map((tag: string, idx: number) => (
                                <span 
                                    key={idx}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Bar */}
                <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Link 
                        href="/modules"
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 dark:bg-gray-800 transition-colors no-underline"
                    >
                        Back to Modules
                    </Link>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                        Mark as Complete
                        <CheckCircle className="h-4 w-4" />
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    )
}
