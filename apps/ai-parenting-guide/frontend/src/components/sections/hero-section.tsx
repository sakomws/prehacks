import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative pt-24 sm:pt-32 pb-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50"></div>
      <div className="max-w-6xl mx-auto text-center relative z-10 fade-in-up">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-apple border border-gray-200/50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm">
          <span>✨</span>
          <span>New: Interactive Learning Modules</span>
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.05]">
          Learn to parent AI
          <br />
          <span className="text-gradient">
            ethically
          </span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          Transform your understanding of AI ethics through interactive learning modules, 
          community discussions, and practical tools. Guide AI systems with care, wisdom, and responsibility.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" variant="primary" href="/modules">
            Learn more
          </Button>
          <Button size="lg" variant="secondary" href="/register">
            Get Started
          </Button>
        </div>
      </div>
    </section>
  )
}
