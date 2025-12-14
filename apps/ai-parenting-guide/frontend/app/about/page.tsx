import Link from "next/link"
import { Target, Users, BookOpen, Lightbulb, Heart, Shield } from "lucide-react"
import { Navigation } from "@/components/layout/nav"
import { Footer } from "@/components/layout/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            About AI Parenting Guide
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Transforming how we understand and guide AI development through the powerful metaphor of parenting.
            Learn to raise AI systems with care, wisdom, and ethical responsibility.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white">
            <div className="flex items-start gap-4">
              <Target className="h-8 w-8 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-base sm:text-lg leading-relaxed opacity-95">
                  To make ethical AI development accessible to everyone by treating AI systems as entities that require 
                  moral guidance and responsible nurturing. We believe that understanding AI development through the 
                  lens of parenting helps us create more ethical, fair, and beneficial artificial intelligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is AI Parenting Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What is &quot;Raising AI&quot;?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Inspired by De Kai&apos;s groundbreaking work, we use the parenting metaphor to make AI ethics relatable and actionable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="apple-card p-6 sm:p-8 fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Lightbulb className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">The Core Concept</h3>
              <p className="text-gray-600 leading-relaxed text-[15px]">
                Just as children learn from their environment and caregivers, AI systems learn from the data and 
                guidance we provide. By treating AI development as a nurturing process, we can better understand 
                our responsibility in shaping AI behavior and values.
              </p>
            </div>
            
            <div className="apple-card p-6 sm:p-8 fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Why It Matters</h3>
              <p className="text-gray-600 leading-relaxed text-[15px]">
                Every interaction with AI shapes its development. Whether you&apos;re a developer, user, or educator, 
                you play a role in &quot;raising&quot; AI systems. Understanding this responsibility is crucial for creating 
                ethical AI that benefits all of humanity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Who Is This For?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              AI Parenting Guide is designed for anyone who wants to understand and practice ethical AI development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Users,
                title: "General Audience",
                desc: "Curious individuals who want to understand their role in shaping AI systems and learn about ethical AI development.",
                bgClass: "bg-blue-100",
                iconClass: "text-blue-600"
              },
              {
                icon: BookOpen,
                title: "Developers & Engineers",
                desc: "Technical professionals building AI systems who want to implement ethical practices and responsible development frameworks.",
                bgClass: "bg-purple-100",
                iconClass: "text-purple-600"
              },
              {
                icon: Shield,
                title: "Educators & Parents",
                desc: "Teachers and parents who want to prepare the next generation for an AI-powered future with ethical understanding.",
                bgClass: "bg-pink-100",
                iconClass: "text-pink-600"
              },
            ].map((audience, i) => (
              <div 
                key={i} 
                className="apple-card p-6 sm:p-8 fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-16 h-16 ${audience.bgClass} rounded-xl flex items-center justify-center mb-6 shadow-sm`}>
                  <audience.icon className={`h-8 w-8 ${audience.iconClass}`} />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">{audience.title}</h3>
                <p className="text-gray-600 leading-relaxed text-[15px]">{audience.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Accessibility", desc: "Making complex AI ethics concepts understandable for everyone, regardless of technical background." },
              { title: "Responsibility", desc: "Emphasizing our collective responsibility in shaping AI systems ethically." },
              { title: "Community", desc: "Building a supportive community where we learn and grow together." },
              { title: "Practicality", desc: "Providing actionable tools and frameworks you can use in real-world scenarios." },
              { title: "Transparency", desc: "Promoting openness and clarity in AI development processes." },
              { title: "Empathy", desc: "Understanding AI systems through the lens of care and nurturing." },
            ].map((value, i) => (
              <div 
                key={i} 
                className="apple-card p-6 fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed text-[15px]">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines education, community, and practical tools to help you become an ethical AI guide.
            </p>
          </div>
          
          <div className="space-y-6 sm:space-y-8">
            {[
              {
                number: "01",
                title: "Learn Through Modules",
                desc: "Explore interactive learning modules covering AI ethics fundamentals, bias detection, transparency, and more. Each module is designed to be accessible yet comprehensive.",
              },
              {
                number: "02",
                title: "Use Practical Tools",
                desc: "Apply what you learn with hands-on tools like bias assessment checklists, ethics review frameworks, and implementation guides.",
              },
              {
                number: "03",
                title: "Join the Community",
                desc: "Connect with fellow AI &apos;parents&apos;, share experiences, ask questions, and learn from expert insights and real-world case studies.",
              },
              {
                number: "04",
                title: "Practice & Apply",
                desc: "Take your knowledge into the real world. Use our frameworks and checklists to guide ethical AI development in your own projects.",
              },
            ].map((step, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {step.number}
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg sm:text-xl mb-10 opacity-95 max-w-2xl mx-auto">
            Join thousands of learners who are discovering how to guide AI development with ethics and responsibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/register" 
              className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 no-underline w-full sm:w-auto text-center"
            >
              Get Started Free
            </Link>
            <Link 
              href="/modules" 
              className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all no-underline w-full sm:w-auto text-center"
            >
              Explore Modules
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
