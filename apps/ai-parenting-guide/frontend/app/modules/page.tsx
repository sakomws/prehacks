import { modules } from '@/data/modules'
import { ModuleCard } from '@/components/modules/module-card'
import { Navigation } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'

export default function ModulesPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navigation />
            <div className="container py-8 md:py-12 space-y-8">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl ai-gradient-text w-fit">
                    Educational Modules
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Learn how to guide and nurture AI systems through our interactive curriculum.
                    Start your journey as an ethical AI guide today.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {modules.map((module) => (
                    <ModuleCard key={module.id} module={module} />
                ))}
            </div>
            </div>
            <Footer />
        </div>
    )
}
