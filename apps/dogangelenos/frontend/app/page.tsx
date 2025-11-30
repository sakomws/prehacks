"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import StructuredData from "./components/StructuredData";
import Header from "./components/Header";
import Chat from "./components/Chat";
import { useContent } from "./context/ContentContext";
import { useTheme } from "./context/ThemeContext";

export default function Home() {
  const { classes } = useContent();
  const { overlayOpacity } = useTheme();

  return (
    <>
      <StructuredData />
      <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      
      {/* Hero Section - Apple-inspired Dark Theme */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/da.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Hero Content */}
        <div className="relative z-20 flex flex-col items-center justify-end h-full text-center px-4 pb-32">
          {/* Content */}
          <div>
            <motion.h2 
              className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Los Angeles' Premier Dog Training
            </motion.h2>
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Expert trainers, proven methods, and personalized programs for your furry friend
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link 
                href="#booking"
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg font-semibold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Book Your First Class
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Training Classes Section */}
      <section id="classes" className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 dark:text-white">Our Training Programs</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Certified trainers with 15+ years experience serving Los Angeles communities
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {classes.map((classItem) => (
              <motion.div 
                key={classItem.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition ${
                  classItem.featured ? "border-4 border-pink-500" : ""
                }`}
                whileHover={{ y: -5 }}
              >
                {classItem.featured && (
                  <div className="bg-pink-500 text-white text-center py-2 font-semibold">
                    MOST POPULAR
                  </div>
                )}
                <div className={`h-48 bg-gradient-to-br ${classItem.color} flex items-center justify-center`}>
                  <span className="text-8xl">{classItem.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{classItem.name}</h3>
                  <p className="text-gray-600 mb-4">{classItem.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-pink-600">{classItem.price}</span>
                    <span className="text-gray-600">/{classItem.duration}</span>
                  </div>
                  <Link 
                    href="#booking" 
                    className="block w-full py-3 bg-pink-500 text-white text-center rounded-lg font-semibold hover:bg-pink-600 transition"
                  >
                    Book Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Teaser */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">🎉 Join Our Los Angeles Dog Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover exciting dog events, meetups, and workshops happening across Los Angeles!
          </p>
          <Link 
            href="/events"
            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            View Events Calendar
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 dark:text-white">Why Los Angeles Dog Owners Choose Us</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">Certified Trainers</h3>
              <p className="text-gray-600">CPDT-KA certified professionals</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="text-xl font-bold mb-2">Los Angeles Locations</h3>
              <p className="text-gray-600">Convenient spots across Los Angeles</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">5-Star Rated</h3>
              <p className="text-gray-600">500+ happy clients</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💯</div>
              <h3 className="text-xl font-bold mb-2">Results Guaranteed</h3>
              <p className="text-gray-600">Or your money back</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-20 px-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-4xl font-bold text-center mb-4 dark:text-white">Book Your Training Session</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Select your preferred class and schedule</p>
          
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Dog's Name</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="Max" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Your Name</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="John Doe" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="you@example.com" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Phone</label>
              <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="(310) 555-0123" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Training Program</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                <option>Puppy Training - $199</option>
                <option>Basic Obedience - $249</option>
                <option>Advanced Training - $349</option>
              </select>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Preferred Date</label>
                <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Preferred Time</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                  <option>Morning (9am-12pm)</option>
                  <option>Afternoon (12pm-3pm)</option>
                  <option>Evening (3pm-6pm)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">LA Location</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                <option>West Hollywood</option>
                <option>Santa Monica</option>
                <option>Downtown LA</option>
                <option>Silver Lake</option>
                <option>Venice Beach</option>
              </select>
            </div>
            
            <button type="submit" className="w-full py-4 bg-pink-500 text-white text-lg font-semibold rounded-lg hover:bg-pink-600 transition shadow-lg">
              Complete Booking
            </button>
            
            <div className="text-center">
              <button type="button" className="text-gray-600 hover:text-gray-900 flex items-center justify-center mx-auto space-x-2">
                <span>Or sign in with</span>
                <span className="font-semibold">Gmail</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">What Los Angeles Dog Owners Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">⭐</span>)}
              </div>
              <p className="mb-4">"Best dog training in Los Angeles! My puppy learned so much in just 6 weeks."</p>
              <p className="font-semibold">- Sarah M., West Hollywood</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">⭐</span>)}
              </div>
              <p className="mb-4">"Professional, patient, and effective. Highly recommend for any LA dog owner!"</p>
              <p className="font-semibold">- Mike T., Santa Monica</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">⭐</span>)}
              </div>
              <p className="mb-4">"Transformed my reactive dog into a well-behaved companion. Thank you!"</p>
              <p className="font-semibold">- Jessica L., Silver Lake</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">📧 Join Our Newsletter</h2>
          <p className="text-lg text-gray-300 mb-8">
            Get expert dog training tips, Los Angeles dog events, exclusive offers, and more delivered to your inbox!
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:ring-4 focus:ring-pink-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold hover:shadow-lg transition whitespace-nowrap"
            >
              Subscribe Now
            </button>
          </form>
          <p className="text-sm text-gray-400 mb-2">
            Join 5,000+ Los Angeles dog owners. Unsubscribe anytime. 🐕
          </p>
          <Link 
            href="/newsletter"
            className="text-sm text-pink-400 hover:text-pink-300 underline"
          >
            View newsletter archive & manage preferences →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Dog Angelenos</h3>
            <p className="text-gray-400">Los Angeles' premier dog training service</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Puppy Training</li>
              <li>Basic Obedience</li>
              <li>Advanced Training</li>
              <li>Private Sessions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Locations</h4>
            <ul className="space-y-2 text-gray-400">
              <li>West Hollywood</li>
              <li>Santa Monica</li>
              <li>Downtown LA</li>
              <li>Silver Lake</li>
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
            <p className="mb-4 md:mb-0">&copy; 2025 Dog Angelenos. All rights reserved. | Dog Training Los Angeles | LA Dog Trainers</p>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Follow us:</span>
              <a 
                href="https://instagram.com/dogangelenos" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-pink-400 transition"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://facebook.com/dogangelenos" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://linkedin.com/company/dogangelenos" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>
      
      {/* Chat Component - Always visible in bottom right */}
      <Chat
        bookingId={1}
        userEmail="customer@example.com"
        userName="Demo Customer"
        userType="customer"
      />
    </>
  );
}
