"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { useContent } from "../context/ContentContext";

export default function AboutPage() {
  const { aboutContent } = useContent();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-br from-purple-900 via-pink-600 to-orange-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {aboutContent.heroTitle}
            </h1>
            <p className="text-2xl text-white/90">{aboutContent.heroSubtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <p className="text-xl leading-relaxed text-gray-700 mb-6">
            {aboutContent.introduction}
          </p>
          <p className="text-xl leading-relaxed text-gray-700 mb-6">
            We are Los Angeles' premier mobile dog training concierge, offering a modern, relationship-driven approach designed for dogs and owners who expect the best. From the hills of Hollywood to the beaches of Santa Monica, we bring elite training directly to your home, your neighborhood, and your daily routine.
          </p>
          <p className="text-xl leading-relaxed text-gray-700 font-semibold text-pink-600">
            {aboutContent.mission}
          </p>
        </motion.div>

        {/* Training Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-8 flex items-center">
            <span className="mr-3">✨</span>
            Our Signature Training Plans
          </h2>

          <div className="space-y-8">
            {/* In-Home Training */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                In-Home Private Training — The Luxury of Convenience
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Tailored, discreet, and deeply personalized. Our in-home sessions create fast, lasting results in the environment your dog knows best, blending modern behavioral science with the lifestyle needs of LA families.
              </p>
            </div>

            {/* Online Training */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Online Training Programs — Guidance Wherever You Go
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                For clients who travel or balance busy schedules, our virtual coaching brings expert instruction to you—complete with custom plans, video breakdowns, and one-on-one support.
              </p>
            </div>

            {/* Outdoor Training */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Outdoor Training — LA's Best Environments, Reimagined
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                From Griffith Park trails to the Venice Boardwalk, our outdoor sessions build real-world obedience and confidence amid the everyday sights and distractions of Los Angeles.
              </p>
            </div>

            {/* Group Classes */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Boutique Group Classes — Social, Stylish, Structured
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Intimate, curated group classes hosted across LA—designed for socialization, foundational skills, and community-building among like-minded dog owners.
              </p>
            </div>

            {/* Workshops */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Specialized Workshops & Seminars — Elevating the LA Dog Lifestyle
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Exclusive events on topics from behavior shaping to wellness, enrichment, and fitness—crafted for dog owners who want more than the basics.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Why Dogangelenos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-8 flex items-center">
            <span className="mr-3">🌟</span>
            Why Dogangelenos?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-pink-200 rounded-xl p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-pink-600 mb-3">
                Elite Trainers With Real Expertise
              </h3>
              <p className="text-gray-700">
                Hand-selected professionals who understand canine behavior—and the unique dynamics of LA living.
              </p>
            </div>

            <div className="bg-white border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-purple-600 mb-3">
                A Bespoke, Dog-Centered Approach
              </h3>
              <p className="text-gray-700">
                Every dog is different. Every home is different. Every training plan is tailored with intention.
              </p>
            </div>

            <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-blue-600 mb-3">
                Luxury Convenience, Anywhere in LA
              </h3>
              <p className="text-gray-700">
                Beverly Hills, Silver Lake, Brentwood, Pasadena, DTLA—we bring high-level training wherever you call home.
              </p>
            </div>

            <div className="bg-white border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-orange-600 mb-3">
                Uncompromised Commitment to Results
              </h3>
              <p className="text-gray-700">
                Your success is our signature. We stay with you from the first session to lasting transformation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-12 text-center text-white shadow-2xl"
        >
          <h2 className="text-4xl font-bold mb-4 flex items-center justify-center">
            <span className="mr-3">🎬</span>
            Begin Your Dog's LA Training Journey
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            In a city built on confidence and charisma, your dog deserves to shine. Take the first step toward a well-mannered, well-balanced companion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#booking"
              className="px-8 py-4 bg-white text-pink-600 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              Schedule Your First Session
            </Link>
            <Link
              href="/#classes"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition"
            >
              Explore Training Options
            </Link>
          </div>
          <p className="mt-6 text-white/90">
            Connect with Dogangelenos today to explore your options and schedule your first luxury training session.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12 px-6 mt-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Dog Angelenos</h3>
            <p className="text-gray-400">Los Angeles' premier dog training service</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>In-Home Private Training</li>
              <li>Online Programs</li>
              <li>Outdoor Training</li>
              <li>Group Classes</li>
              <li>Workshops & Seminars</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Locations</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Beverly Hills</li>
              <li>Hollywood</li>
              <li>Santa Monica</li>
              <li>Silver Lake</li>
              <li>Downtown LA</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📞 (310) 555-DOGS</li>
              <li>📧 woof@dogangelenos.com</li>
              <li>📍 Los Angeles, CA</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between text-gray-400">
            <p className="mb-4 md:mb-0">&copy; 2025 Dog Angelenos. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Follow us:</span>
              <a href="https://instagram.com/dogangelenos" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://facebook.com/dogangelenos" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://linkedin.com/company/dogangelenos" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
