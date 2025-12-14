import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    number: "01",
    title: "Explore Modules",
    description: "Browse our interactive learning modules covering AI ethics fundamentals, bias detection, and practical frameworks",
    bgColor: "bg-blue-500"
  },
  {
    number: "02",
    title: "Join Community",
    description: "Connect with other AI 'parents', share experiences, and learn from expert insights and discussions",
    bgColor: "bg-purple-500"
  },
  {
    number: "03",
    title: "Apply Tools",
    description: "Use our practical tools and checklists to implement ethical AI practices in your own projects",
    bgColor: "bg-pink-500"
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-12 sm:py-24 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Start your ethical AI journey in three simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {steps.map((step, i) => (
            <div key={i} className="relative fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="text-7xl sm:text-8xl font-bold text-gray-100/50 absolute -top-4 -left-4 z-0 tracking-tight">
                {step.number}
              </div>
              <Card variant="elevated" className="relative z-10 p-6 sm:p-8">
                <CardContent className="p-0">
                  <div className={`w-16 h-16 ${step.bgColor} rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-apple-lg`}>
                    {step.number}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
