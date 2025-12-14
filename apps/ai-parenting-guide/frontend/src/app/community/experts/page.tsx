"use client"

import { useEffect, useState } from "react"
import { User, Award, BookOpen, MessageSquare } from "lucide-react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

interface Expert {
    id: string
    display_name: string
    bio?: string
    expertise?: string[]
    contributions?: number
    role: string
}

export default function ExpertsPage() {
    const [experts, setExperts] = useState<Expert[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setExperts([
                {
                    id: '1',
                    display_name: 'Dr. Sarah Chen',
                    bio: 'AI Ethics Researcher with 15+ years of experience in responsible AI development.',
                    expertise: ['AI Ethics', 'Bias Detection', 'Fairness'],
                    contributions: 42,
                    role: 'expert'
                },
                {
                    id: '2',
                    display_name: 'Prof. Michael Torres',
                    bio: 'Philosophy professor specializing in AI alignment and human values.',
                    expertise: ['Philosophy', 'Value Alignment', 'Ethics'],
                    contributions: 38,
                    role: 'expert'
                },
                {
                    id: '3',
                    display_name: 'Dr. Priya Patel',
                    bio: 'Machine Learning Engineer focused on building ethical AI systems.',
                    expertise: ['ML Engineering', 'Responsible AI', 'Technical Ethics'],
                    contributions: 35,
                    role: 'expert'
                }
            ])
            setLoading(false)
        }, 500)
    }, [])

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header />
            <div className="max-w-[980px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Expert Insights</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                        Learn from leading experts in AI ethics, responsible development, and ethical AI parenting.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-300">Loading experts...</p>
                    </div>
                ) : experts.length === 0 ? (
                    <div className="text-center py-12">
                        <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-300">No experts available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {experts.map((expert) => (
                            <div
                                key={expert.id}
                                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <div className="flex items-center gap-1 text-purple-600">
                                        <Award className="h-5 w-5" />
                                        <span className="text-sm font-medium">Expert</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                    {expert.display_name}
                                </h3>
                                
                                {expert.bio && (
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                        {expert.bio}
                                    </p>
                                )}

                                {expert.expertise && expert.expertise.length > 0 && (
                                    <div className="mb-4">
                                        <div className="text-xs text-gray-500 mb-2">Expertise:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {expert.expertise.map((topic, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                                                >
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{expert.contributions || 0} contributions</span>
                                    </div>
                                    <Link
                                        href={`/community?expert=${expert.id}`}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors no-underline"
                                    >
                                        View Posts →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-200">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                                Become an Expert Contributor
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Are you an expert in AI ethics, responsible AI development, or related fields?
                                Join our community of experts and share your insights.
                            </p>
                            <Link
                                href="/community"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors no-underline"
                            >
                                Learn more about becoming an expert →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
