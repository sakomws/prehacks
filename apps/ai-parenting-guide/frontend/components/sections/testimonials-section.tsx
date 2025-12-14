const testimonials = [
  {
    quote: "This platform transformed how I think about AI development. The 'parenting' metaphor makes complex ethics concepts so much more relatable and actionable.",
    author: "Dr. Sarah Chen",
    role: "AI Researcher, Stanford University",
    avatar: "SC"
  },
  {
    quote: "As a developer, I finally understand my responsibility in shaping AI behavior. The interactive tools helped me identify biases I never noticed before.",
    author: "Marcus Rodriguez",
    role: "Software Engineer, Tech Startup",
    avatar: "MR"
  },
  {
    quote: "The community discussions are invaluable. Learning from other AI 'parents' has given me confidence to implement ethical practices in my work.",
    author: "Dr. Aisha Patel",
    role: "Machine Learning Engineer",
    avatar: "AP"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-[980px] mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-4 tracking-tight">
          What AI Parents Say
        </h2>
        <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-16 max-w-2xl mx-auto">
          Join thousands of learners who are transforming their approach to AI development
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-lg transition-shadow"
            >
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}