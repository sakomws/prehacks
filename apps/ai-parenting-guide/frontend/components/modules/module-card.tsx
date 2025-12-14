"use client"

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, BarChart, ArrowRight } from 'lucide-react'
import { Module } from '@/data/modules'

interface ModuleCardProps {
    module: Module
}

export function ModuleCard({ module }: ModuleCardProps) {
    return (
        <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="aspect-video w-full bg-muted relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                {/* Placeholder for actual image */}
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />

                <div className="absolute top-2 right-2 z-20 flex gap-2">
                    {module.isNew && (
                        <Badge variant="secondary" className="bg-ai-blue-500 text-white hover:bg-ai-blue-600">
                            New
                        </Badge>
                    )}
                    <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                        {module.category}
                    </Badge>
                </div>
            </div>

            <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {module.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <BarChart className="h-3 w-3" />
                        {module.difficulty}
                    </span>
                </div>
                <CardTitle className="line-clamp-1">{module.title}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {module.description}
                </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 border-t bg-muted/20 p-4">
                {module.progress !== undefined && module.progress > 0 && (
                    <div className="w-full space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-1.5" />
                    </div>
                )}

                <Link href={`/modules/${module.slug}`} className="w-full">
                    <Button className="w-full group" variant={module.progress ? "default" : "outline"}>
                        {module.progress ? 'Continue Learning' : 'Start Module'}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
