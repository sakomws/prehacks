import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface Feature {
  icon: string
  title: string
  description: string
  iconGradient: string
  bgGradient: string
  link: string
}

const features: Feature[] = [
  {
    icon: "🎓",
    title: "Interactive Learning",
    description: "Explore AI ethics through engaging, personalized content that adapts to your learning style",
    iconGradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    link: "/modules"
  },
  {
    icon: "⚖️",
    title: "Bias Assessment",
    description: "Hands-on simulations that demonstrate how AI systems can inherit human biases",
    iconGradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
    link: "/tools/bias-assessment"
  },
  {
    icon: "💬",
    title: "Community",
    description: "Connect with fellow AI 'parents' to share experiences, insights, and learn together",
    iconGradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50 to-rose-50",
    link: "/community"
  },
  {
    icon: "🧠",
    title: "Expert Insights",
    description: "Access guidance from AI ethics researchers, practitioners, and thought leaders",
    iconGradient: "from-indigo-500 to-purple-500",
    bgGradient: "from-indigo-50 to-purple-50",
    link: "/community/experts"
  },
  {
    icon: "🛠️",
    title: "Practical Tools",
    description: "Download checklists, best practice guides, and implementation strategies",
    iconGradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
    link: "/tools"
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "For Everyone",
    description: "Educational materials designed for different experience levels and backgrounds",
    iconGradient: "from-orange-500 to-amber-500",
    bgGradient: "from-orange-50 to-amber-50",
    link: "/learn/basics"
  },
]

const gradientMap: Record<string, string> = {
  "from-blue-500 to-cyan-500": "bg-gradient-to-br from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500": "bg-gradient-to-br from-purple-500 to-pink-500",
  "from-pink-500 to-rose-500": "bg-gradient-to-br from-pink-500 to-rose-500",
  "from-indigo-500 to-purple-500": "bg-gradient-to-br from-indigo-500 to-purple-500",
  "from-green-500 to-emerald-500": "bg-gradient-to-br from-green-500 to-emerald-500",
  "from-orange-500 to-amber-500": "bg-gradient-to-br from-orange-500 to-amber-500",
  "from-blue-50 to-cyan-50": "bg-gradient-to-br from-blue-50 to-cyan-50",
  "from-purple-50 to-pink-50": "bg-gradient-to-br from-purple-50 to-pink-50",
  "from-pink-50 to-rose-50": "bg-gradient-to-br from-pink-50 to-rose-50",
  "from-indigo-50 to-purple-50": "bg-gradient-to-br from-indigo-50 to-purple-50",
  "from-green-50 to-emerald-50": "bg-gradient-to-br from-green-50 to-emerald-50",
  "from-orange-50 to-amber-50": "bg-gradient-to-br from-orange-50 to-amber-50",
}

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-28 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 sm:mb-20 fade-in-up">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Powerful Features
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Everything you need to understand and practice ethical AI development
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, i) => (
            <Link
              key={i}
              href={feature.link}
              className={`group no-underline fade-in-up`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <Card variant="gradient" className={`p-8 ${gradientMap[feature.bgGradient]} hover:shadow-2xl transition-all duration-500 h-full`}>
                <CardContent className="p-0">
                  <div className={`w-16 h-16 ${gradientMap[feature.iconGradient]} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-[15px] mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
