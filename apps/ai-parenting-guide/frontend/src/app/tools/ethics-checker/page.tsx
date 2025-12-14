import { Metadata } from 'next'
import { EthicsChecker } from '@/components/tools/ethics-checker'
import { Header } from '@/components/layout/header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Ethics Checker - AI Parenting Guide',
  description: 'Use our AI-powered ethics checker to evaluate the ethical implications of AI systems and decisions.',
}

export default function EthicsCheckerPage() {
  return (
    <>
      <Header />
      <main className="flex-1 min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-ai-blue-600 via-ai-purple-600 to-ai-green-600 bg-clip-text text-transparent">
                Ethics Checker
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light leading-relaxed max-w-3xl mx-auto">
              Evaluate the ethical implications of AI systems and decisions with our interactive assessment tool
            </p>
          </div>
          <EthicsChecker />
        </div>
      </main>
      <Footer />
    </>
  )
}