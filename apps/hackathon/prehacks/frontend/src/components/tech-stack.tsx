'use client'

import { motion } from 'framer-motion'

export function TechStack() {
  const technologies = [
    { name: 'React', category: 'Frontend', color: 'bg-blue-100 text-blue-800' },
    { name: 'Next.js', category: 'Frontend', color: 'bg-gray-100 text-gray-800' },
    { name: 'TypeScript', category: 'Language', color: 'bg-blue-100 text-blue-800' },
    { name: 'Python', category: 'Language', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'FastAPI', category: 'Backend', color: 'bg-green-100 text-green-800' },
    { name: 'PostgreSQL', category: 'Database', color: 'bg-blue-100 text-blue-800' },
    { name: 'Redis', category: 'Cache', color: 'bg-red-100 text-red-800' },
    { name: 'Docker', category: 'DevOps', color: 'bg-blue-100 text-blue-800' },
    { name: 'AWS', category: 'Cloud', color: 'bg-orange-100 text-orange-800' },
    { name: 'GitHub', category: 'Version Control', color: 'bg-gray-100 text-gray-800' },
    { name: 'Tailwind CSS', category: 'Styling', color: 'bg-cyan-100 text-cyan-800' },
    { name: 'Framer Motion', category: 'Animation', color: 'bg-purple-100 text-purple-800' },
  ]

  const categories = ['All', 'Frontend', 'Backend', 'Language', 'Database', 'DevOps', 'Cloud']

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Technologies
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Technologies our community loves to work with
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className="btn-ghost"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="card text-center group cursor-pointer hover:shadow-lg transition-all duration-200"
            >
              <div className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                {tech.name}
              </div>
              <div className={`badge ${tech.color} text-xs`}>
                {tech.category}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
