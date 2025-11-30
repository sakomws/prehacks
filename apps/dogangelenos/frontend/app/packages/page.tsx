"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import Header from "../components/Header";
import { useContent } from "../context/ContentContext";

export default function PackagesPage() {
  const { packages } = useContent();
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-pink-600 to-orange-500 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-6">🌟</div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Elite Training Programs
            </h1>
            <p className="text-2xl md:text-3xl mb-6 font-light">
              Where luxury living meets exceptional canine training
            </p>
            <p className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed opacity-95">
              Los Angeles is a city defined by high standards, elevated lifestyles, and dogs that are part of the family. 
              Our signature training programs reflect that same level of intention, quality, and refinement.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Packages Grid */}
        <div className="space-y-12">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              icon={pkg.icon}
              title={pkg.title}
              subtitle={pkg.subtitle}
              description={pkg.description}
              features={pkg.features}
              experience={pkg.experience}
              price={pkg.price}
              color={pkg.color}
              featured={pkg.featured}
              onSelect={() => setSelectedPackage(pkg.id)}
            />
          ))}
        </div>

        {/* Why Choose Us Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg"
          >
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Proven Results</h3>
            <p className="text-gray-600 dark:text-gray-400">
              98% success rate with over 2,500 dogs trained across Los Angeles
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg"
          >
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Expert Trainers</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Certified professionals with 55+ years combined experience
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg"
          >
            <div className="text-5xl mb-4">💎</div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Premium Service</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Luxury training experience tailored to LA's finest families
            </p>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-20 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 text-center text-white shadow-2xl">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Get exclusive training tips, package deals, and LA dog community updates!
          </p>
          <Link
            href="/newsletter"
            className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Subscribe to Newsletter
          </Link>
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-2xl p-12 md:p-16 text-center text-white shadow-2xl">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Begin?</h2>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Schedule a complimentary consultation to discuss your dog's needs and find the perfect program.
          </p>
          <Link
            href="/#booking"
            className="inline-block px-10 py-5 bg-white text-pink-600 rounded-full font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl hover:scale-105"
          >
            Book Your Free Consultation
          </Link>
        </div>
      </div>

      {selectedPackage && (
        <BookingModal
          package={selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}
    </div>
  );
}

function PackageCard({ icon, title, subtitle, description, features, experience, price, color, featured, onSelect }: any) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 ${
        featured ? "border-pink-500 shadow-pink-500/20" : "border-gray-200 dark:border-gray-700"
      } hover:shadow-2xl transition-all duration-300`}
    >
      {/* Collapsed Header - Always Visible */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer"
      >
        <div className="flex items-center justify-between p-8 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
          <div className="flex items-center space-x-6 flex-1">
            <div className="text-5xl">{icon}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
                {featured && (
                  <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg">
                    ⭐ MOST POPULAR
                  </span>
                )}
              </div>
              <p className="text-base text-gray-600 dark:text-gray-400">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{price}</p>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-400 dark:text-gray-500"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-8 pb-8 border-t border-gray-200 dark:border-gray-700">
          <div className="pt-8">
            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed text-lg">{description}</p>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-8">
              <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <span className="mr-2">✨</span> What's Included
              </h4>
              <ul className="space-y-3">
                {features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-pink-500 dark:text-pink-400 mr-3 mt-1 flex-shrink-0 text-lg">✓</span>
                    <span className="text-gray-700 dark:text-gray-300 text-base">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6 mb-8 border-2 border-purple-200 dark:border-purple-700">
              <p className="text-base font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center">
                <span className="mr-2">🎯</span> The Experience
              </p>
              <p className="text-base text-gray-800 dark:text-gray-200 italic leading-relaxed">{experience}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className={`w-full py-4 bg-gradient-to-r ${color} text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}
            >
              Select This Package →
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BookingModal({ package: pkg, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold">Book Your Package</h2>
        </div>
        <div className="p-6">
          <p className="text-lg mb-6">
            Great choice! Let's schedule your complimentary consultation to get started.
          </p>
          <Link
            href="/#booking"
            className="block w-full py-3 bg-pink-500 text-white text-center rounded-lg font-semibold hover:bg-pink-600 transition"
          >
            Continue to Booking
          </Link>
          <button
            onClick={onClose}
            className="block w-full mt-3 py-3 bg-gray-200 text-gray-700 text-center rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
