import { BiasSimulator } from '@/components/tools/bias-simulator'

export default function BiasAssessmentPage() {
    return (
        <div className="container py-8 md:py-12 space-y-8">
            <div className="space-y-4 text-center max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-gray-900 dark:text-white">
                    Bias Assessment Tool
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                    See how an AI "child" learns from its environment. Adjust the training data and observe how the AI inherits biases.
                </p>
            </div>

            <div className="max-w-5xl mx-auto">
                <BiasSimulator />
            </div>

            <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
                <h3>How this works</h3>
                <p>
                    This simulation demonstrates a core concept of AI Parenting: **"You are what you eat."**
                </p>
                <p>
                    If we feed an AI system data that reflects historical inequalities (like a hiring dataset dominated by men), the AI will not only learn those patterns but often **amplify** them. It doesn't know "fairness" unless we explicitly teach it.
                </p>
            </div>
        </div>
    )
}
