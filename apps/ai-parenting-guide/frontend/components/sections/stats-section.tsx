export function StatsSection() {
  const stats = [
    { value: "10,000+", label: "Active Learners" },
    { value: "500+", label: "Expert Contributors" },
    { value: "50+", label: "Learning Modules" },
  ]

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/5"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-center text-white">
          {stats.map((stat, i) => (
            <div key={i} className="fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-5xl sm:text-6xl font-bold mb-3 tracking-tight">{stat.value}</div>
              <div className="text-base sm:text-lg opacity-95 font-light">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
