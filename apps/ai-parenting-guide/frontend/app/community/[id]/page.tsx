"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/utils/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, User, Send } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { Navigation } from "@/components/layout/nav"
import { Footer } from "@/components/layout/footer"

export default function ThreadPage() {
    const { id } = useParams()
    const [thread, setThread] = useState<any>(null)
    const [newComment, setNewComment] = useState("")
    const { isAuthenticated, user } = useAuth()

    useEffect(() => {
        if (id) {
            api.community.getThread(id as string)
                .then(setThread)
                .catch(console.error)
        }
    }, [id])

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        try {
            const comment = await api.community.createComment(id as string, { content: newComment })
            // Optimistically update or refetch
            setThread((prev: any) => ({
                ...prev,
                comments: [...(prev.comments || []), { ...comment, author: user }]
            }))
            setNewComment("")
        } catch (e) {
            console.error(e)
        }
    }

    if (!thread) {
        return (
            <div className="min-h-screen bg-white">
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">Loading...</div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-6">
                <Link href="/community" className="no-underline">
                    <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forum
                    </Button>
                </Link>

            <Card className="border-primary/20 bg-muted/10">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl mb-2">{thread.title}</CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground space-x-2">
                                <User className="h-4 w-4" />
                                <span>{thread.author?.display_name || 'Anonymous'}</span>
                                <span>•</span>
                                <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{thread.category}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="text-lg leading-relaxed">
                    {thread.content}
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Comments ({thread.comments?.length || 0})</h3>

                {thread.comments?.map((comment: any) => (
                    <Card key={comment.id} className="bg-background">
                        <CardHeader className="pb-2 py-3">
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground flex items-center">
                                    <User className="mr-1 h-3 w-3" />
                                    {comment.author?.display_name || 'Anonymous'}
                                </span>
                                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="py-2 text-sm">
                            {comment.content}
                        </CardContent>
                    </Card>
                ))}

                {isAuthenticated ? (
                    <div className="pt-4 space-y-2">
                        <Textarea
                            placeholder="Add to the discussion..."
                            value={newComment}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                        />
                        <Button onClick={handlePostComment} disabled={!newComment.trim()}>
                            <Send className="mr-2 h-4 w-4" /> Post Comment
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-4 bg-muted/50 rounded-lg">
                        <p>Please <Link href="/login" className="text-primary no-underline">login</Link> to join the discussion.</p>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}
