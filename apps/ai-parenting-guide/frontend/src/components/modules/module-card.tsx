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
        <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10" />
                {/* Placeholder for actual image */}
                <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />

                <div className="absolute top-2 right-2 z-20 flex gap-2">
                    {module.isNew && (
                        <Badge className="bg-blue-600 text-white hover:bg-blue-700 border-0">
                            New
                        </Badge>
                    )}
                    <Badge variant="outline" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                        {module.category}
                    </Badge>
                </div>
            </div>

            <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
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
                <CardTitle className="line-clamp-1 text-gray-900 dark:text-white">{module.title}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                    {module.description}
                </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-4">
                {module.progress !== undefined && module.progress > 0 && (
                    <div className="w-full space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-1.5" />
                    </div>
                )}

                <Link href={`/modules/${module.slug}`} className="w-full">
                    <Button className="w-full group" variant={module.progress ? "primary" : "outline"}>
                        {module.progress ? 'Continue Learning' : 'Start Module'}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
