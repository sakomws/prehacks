"use client"

import { useEffect, useState } from "react"
import { api } from "@/utils/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { CreateThreadDialog } from "@/components/community/create-thread-dialog"
import { Navigation } from "@/components/layout/nav"
import { Footer } from "@/components/layout/footer"

export default function CommunityPage() {
    const [threads, setThreads] = useState<any[]>([])
    const { isAuthenticated } = useAuth()

    useEffect(() => {
        api.community.getThreads()
            .then(setThreads)
            .catch(console.error)
    }, [])

    return (
        <div className="min-h-screen bg-white">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl ai-gradient-text w-fit">
                        Community Forum
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Discuss AI ethics, share parenting tips, and connect with other AI guides.
                    </p>
                </div>
                {isAuthenticated && (
                    <CreateThreadDialog onThreadCreated={() => {
                        api.community.getThreads().then(setThreads)
                    }} />
                )}
            </div>

            <div className="grid gap-4">
                {threads.map((thread) => (
                    <Link key={thread.id} href={`/community/${thread.id}`} className="no-underline">
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">{thread.title}</CardTitle>
                                        <CardDescription>
                                            Posted by {thread.author?.display_name || 'Anonymous'} • {new Date(thread.created_at).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center text-muted-foreground">
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        {thread.comments?.length || 0}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {thread.content}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {threads.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No discussions yet. Be the first to start one!
                    </div>
                )}
            </div>
            </div>
            <Footer />
        </div>
    )
}
