'use client'

import { motion } from 'framer-motion'
import { Star, GitFork, Eye, ExternalLink } from 'lucide-react'

export function FeaturedProjects() {
  const projects = [
    {
      id: 1,
      title: 'AI-Powered Code Review',
      description: 'Automated code review system using machine learning to detect bugs and suggest improvements.',
      tech: ['Python', 'TensorFlow', 'React', 'FastAPI'],
      stars: 1247,
      forks: 89,
      views: 15420,
      category: 'AI/ML',
      thumbnail: '/api/placeholder/400/200',
    },
    {
      id: 2,
      title: 'Real-time Collaboration Platform',
      description: 'A platform for real-time code collaboration with integrated video calls and screen sharing.',
      tech: ['TypeScript', 'WebRTC', 'Socket.io', 'Next.js'],
      stars: 892,
      forks: 156,
      views: 12300,
      category: 'Web App',
      thumbnail: '/api/placeholder/400/200',
    },
    {
      id: 3,
      title: 'Blockchain Voting System',
      description: 'Secure and transparent voting system built on Ethereum blockchain with smart contracts.',
      tech: ['Solidity', 'Web3.js', 'React', 'Node.js'],
      stars: 634,
      forks: 78,
      views: 8900,
      category: 'Blockchain',
      thumbnail: '/api/placeholder/400/200',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing projects built by our community of developers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card group cursor-pointer"
            >
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Project Preview</span>
                </div>
              </div>
              
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {project.title}
                </h3>
                <span className="badge badge-primary">
                  {project.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((tech) => (
                  <span key={tech} className="badge badge-primary text-xs">
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    {project.stars}
                  </div>
                  <div className="flex items-center">
                    <GitFork className="h-4 w-4 mr-1" />
                    {project.forks}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {project.views}
                  </div>
                </div>
                <button className="btn-ghost text-xs">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="btn-outline">
            View All Projects
          </button>
        </div>
      </div>
    </section>
  )
}
