'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Calendar, 
  Users, 
  Sparkles, 
  Brain, 
  Zap, 
  CheckCircle,
  Star,
  Play,
  ChevronRight,
  Globe,
  TrendingUp,
  Target,
  MessageCircle
} from 'lucide-react'
import AuthModal from '@/components/AuthModal'

export default function Home() {
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-8 pt-20 pb-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Event Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-gray-900 mb-8 leading-tight">
              Connect with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> founders</span>,
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">investors</span>, and
              <span className="bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent"> innovators</span>
            </h1>
            
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover meaningful events, build lasting relationships, and grow your startup ecosystem. 
              Powered by AI to help you find the right connections at the right time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button 
                onClick={() => setShowAuth(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-medium text-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <Link 
                href="/events"
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Explore Events</span>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                  <Calendar className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Smart Calendar</h3>
                  <p className="text-sm text-gray-600">AI-powered scheduling that understands your energy and goals</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                  <Users className="w-8 h-8 text-purple-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Quality Events</h3>
                  <p className="text-sm text-gray-600">Curated meetups, talks, and networking opportunities</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
                  <Brain className="w-8 h-8 text-green-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">AI Insights</h3>
                  <p className="text-sm text-gray-600">Personalized recommendations and networking guidance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium text-gray-900 mb-6">
              Why founders choose Goup.VC
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
              More than just events. It's your intelligent companion for building meaningful connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 h-full transition-all duration-300 group-hover:shadow-lg">
                <Zap className="w-10 h-10 text-blue-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Energy-Aware Scheduling</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI learns when you're most productive and suggests optimal times for different types of events.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 h-full transition-all duration-300 group-hover:shadow-lg">
                <Target className="w-10 h-10 text-purple-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Recommendations</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get personalized event suggestions based on your interests, goals, and networking history.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 h-full transition-all duration-300 group-hover:shadow-lg">
                <MessageCircle className="w-10 h-10 text-green-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-First Inbox</h3>
                <p className="text-gray-600 leading-relaxed">
                  Intelligent conversation management that helps you stay on top of important connections.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 h-full transition-all duration-300 group-hover:shadow-lg">
                <Globe className="w-10 h-10 text-orange-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Community</h3>
                <p className="text-gray-600 leading-relaxed">
                  Connect with founders, investors, and innovators from around the world in your local area.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-8 h-full transition-all duration-300 group-hover:shadow-lg">
                <TrendingUp className="w-10 h-10 text-pink-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Growth Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Monitor your networking progress and see how events contribute to your professional growth.
                </p>
              </div>
            </div>

            <div className="group">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 h-full transition-all duration-300 group-hover:shadow-lg">
                <CheckCircle className="w-10 h-10 text-indigo-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quality Assurance</h3>
                <p className="text-gray-600 leading-relaxed">
                  All events are curated and verified to ensure high-quality networking opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-medium text-gray-900 mb-6">
              Trusted by founders worldwide
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Join thousands of entrepreneurs building the future
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Goup.VC transformed how I network. The AI recommendations are spot-on, and I've made more meaningful connections in 3 months than in the past year."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">S</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Chen</p>
                  <p className="text-sm text-gray-600">Founder, TechFlow</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The energy-aware scheduling is a game changer. It helps me balance high-energy networking with focused work time perfectly."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">M</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Marcus Rodriguez</p>
                  <p className="text-sm text-gray-600">CEO, InnovateLab</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Finally, a platform that understands the startup ecosystem. The quality of events and connections is unmatched."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">A</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Alex Kim</p>
                  <p className="text-sm text-gray-600">Partner, Venture Capital</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-medium text-gray-900 mb-6">
            Ready to transform your networking?
          </h2>
          <p className="text-xl text-gray-600 font-light mb-12">
            Join the community of founders, investors, and innovators building the future.
          </p>
          
          <button 
            onClick={() => setShowAuth(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-medium text-lg transition-all duration-200 hover:scale-105 shadow-lg inline-flex items-center space-x-2"
          >
            <span>Get Started Today</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        mode="signup"
      />
    </div>
  )
}