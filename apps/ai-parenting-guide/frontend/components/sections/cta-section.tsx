import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-16 sm:py-28 px-4 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center fade-in-up">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
          Ready to start your journey?
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          Join our community of ethical AI practitioners and start transforming how you develop AI systems today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button size="lg" variant="primary" href="/register">
            Get Started
          </Button>
          <Button size="lg" variant="secondary" href="/modules">
            Explore Modules
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Free to start</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Join 10,000+ learners</span>
          </div>
        </div>
      </div>
    </section>
  )
}
