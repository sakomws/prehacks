'use client'

import { useState } from 'react'
import { Search, Code, Users, Zap, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <section className="relative bg-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Build, Share,{' '}
              <span className="text-gray-600">Ship</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              The ultimate platform for hackathon projects. Discover amazing ideas, 
              collaborate with developers, and turn your concepts into reality.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects, technologies, or ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent shadow-sm"
              />
              <button className="absolute right-2 top-2 bottom-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center">
                Search
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="btn-primary text-lg px-8 py-4">
              Start Building
            </button>
            <button className="btn-outline text-lg px-8 py-4">
              Browse Projects
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Code Together
              </h3>
              <p className="text-gray-600 text-sm">
                Collaborate in real-time with integrated editor and terminal
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Find Team
              </h3>
              <p className="text-gray-600 text-sm">
                Connect with developers who share your passion and skills
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ship Fast
              </h3>
              <p className="text-gray-600 text-sm">
                Deploy to multiple platforms with one-click deployment
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
