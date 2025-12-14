"use client"

import { useState } from "react"
import { api } from "@/utils/api-client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"

export function CreateThreadDialog({ onThreadCreated }: { onThreadCreated?: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [category, setCategory] = useState("General")
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    if (!isAuthenticated) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !content) return

        try {
            setLoading(true)
            await api.community.createThread({
                title,
                content,
                category
            })
            setOpen(false)
            setTitle("")
            setContent("")
            if (onThreadCreated) onThreadCreated()
            router.refresh()
        } catch (error) {
            console.error("Failed to create thread", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> New Discussion
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Discussion</DialogTitle>
                        <DialogDescription>
                            Start a conversation with the community.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                className="col-span-3"
                                placeholder="What's on your mind?"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Category
                            </Label>
                            <Input
                                id="category"
                                value={category}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
                                className="col-span-3"
                                placeholder="General, Ethics, Parenting..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="content" className="text-right">
                                Content
                            </Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                                className="col-span-3"
                                placeholder="Share your thoughts..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Posting..." : "Post Discussion"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
