import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      {/* Hero */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-[980px] mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
            Learn to parent AI
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ethically
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Transform your understanding of AI ethics through interactive learning modules, community discussions, and practical tools.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/modules" className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md">
              Explore Modules
            </Link>
            <Link href="/register" className="px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-full font-medium hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-[980px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16 tracking-tight">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🎓", title: "Interactive Learning", desc: "Explore AI ethics through engaging, personalized content that adapts to your learning style" },
              { icon: "⚖️", title: "Bias Assessment", desc: "Hands-on simulations that demonstrate how AI systems can inherit human biases" },
              { icon: "💬", title: "Community", desc: "Connect with fellow AI 'parents' to share experiences, insights, and learn together" },
              { icon: "🧠", title: "Expert Insights", desc: "Access guidance from AI ethics researchers, practitioners, and thought leaders" },
              { icon: "🛠️", title: "Practical Tools", desc: "Download checklists, best practice guides, and implementation strategies" },
              { icon: "👨‍👩‍👧‍👦", title: "For Everyone", desc: "Educational materials designed for different experience levels and backgrounds" },
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-[980px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl sm:text-6xl font-bold mb-3 tracking-tight">10,000+</div>
              <div className="text-lg opacity-95 font-light">Active Learners</div>
            </div>
            <div>
              <div className="text-5xl sm:text-6xl font-bold mb-3 tracking-tight">500+</div>
              <div className="text-lg opacity-95 font-light">Expert Contributors</div>
            </div>
            <div>
              <div className="text-5xl sm:text-6xl font-bold mb-3 tracking-tight">50+</div>
              <div className="text-lg opacity-95 font-light">Learning Modules</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-[980px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start your ethical AI journey in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "01", title: "Explore Modules", desc: "Browse our interactive learning modules covering AI ethics fundamentals, bias detection, and practical frameworks", bgColor: "bg-blue-500" },
              { number: "02", title: "Join Community", desc: "Connect with other AI 'parents', share experiences, and learn from expert insights and discussions", bgColor: "bg-purple-500" },
              { number: "03", title: "Apply Tools", desc: "Use our practical tools and checklists to implement ethical AI practices in your own projects", bgColor: "bg-pink-500" },
            ].map((step, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className={`w-16 h-16 ${step.bgColor} rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg`}>
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-[980px] mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Ready to start your journey?
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join our community of ethical AI practitioners and start transforming how you develop AI systems today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register" className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
                Get Started
              </Link>
              <Link href="/modules" className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all">
                Explore Modules
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
