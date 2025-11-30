"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Link from "next/link";

interface Trainer {
  id: number;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  experience: string;
  certifications: string[];
  image: string;
  availability: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/trainers`);
      if (response.ok) {
        const data = await response.json();
        setTrainers(data);
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading trainers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">🎓 Meet Our Expert Trainers</h1>
            <p className="text-xl md:text-2xl mb-2">
              Certified professionals dedicated to your dog's success
            </p>
            <p className="text-lg opacity-90">
              Hand-selected trainers with decades of combined experience serving Los Angeles
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-pink-600 mb-2">55+</p>
              <p className="text-gray-600 dark:text-gray-400">Years Combined Experience</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600 mb-2">2,500+</p>
              <p className="text-gray-600 dark:text-gray-400">Dogs Trained</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">98%</p>
              <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-600 mb-2">4.9/5</p>
              <p className="text-gray-600 dark:text-gray-400">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 dark:text-white">Our Training Team</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Each trainer brings unique expertise and a shared commitment to positive, effective training methods
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {trainers.map((trainer, index) => (
              <motion.div
                key={trainer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TrainerCard 
                  trainer={trainer} 
                  onViewProfile={() => setSelectedTrainer(trainer)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Training?</h2>
          <p className="text-xl mb-8">
            Book a session with one of our expert trainers today
          </p>
          <Link
            href="/#booking"
            className="inline-block px-8 py-4 bg-white text-pink-600 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            Book Your First Session
          </Link>
        </div>
      </section>

      {/* Trainer Profile Modal */}
      {selectedTrainer && (
        <TrainerProfileModal
          trainer={selectedTrainer}
          onClose={() => setSelectedTrainer(null)}
        />
      )}
    </div>
  );
}

function TrainerCard({ trainer, onViewProfile }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition">
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-8 text-center">
        <div className="text-8xl mb-4">{trainer.image}</div>
        <h3 className="text-2xl font-bold text-white mb-2">{trainer.name}</h3>
        <p className="text-white/90">{trainer.title}</p>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{trainer.bio}</p>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2">SPECIALTIES</h4>
          <div className="flex flex-wrap gap-2">
            {trainer.specialties.map((specialty: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-sm rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-semibold">Experience</p>
            <p className="text-gray-900 dark:text-white font-bold">{trainer.experience}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-semibold">Availability</p>
            <p className="text-gray-900 dark:text-white font-bold">{trainer.availability}</p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2">CERTIFICATIONS</h4>
          <div className="flex flex-wrap gap-2">
            {trainer.certifications.map((cert: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={onViewProfile}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition"
        >
          View Full Profile
        </button>
      </div>
    </div>
  );
}

function TrainerProfileModal({ trainer, onClose }: any) {
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-8 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-6xl">{trainer.image}</div>
              <div>
                <h2 className="text-3xl font-bold">{trainer.name}</h2>
                <p className="text-white/90 text-lg">{trainer.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-3xl">
              ✕
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">About {trainer.name}</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{trainer.bio}</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {trainer.specialties.map((specialty: string, idx: number) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-full font-semibold"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Experience</h3>
              <p className="text-2xl font-bold text-pink-600">{trainer.experience}</p>
              <p className="text-gray-600 dark:text-gray-400">Professional dog training</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Availability</h3>
              <p className="text-2xl font-bold text-purple-600">{trainer.availability}</p>
              <p className="text-gray-600 dark:text-gray-400">Weekly schedule</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Certifications & Credentials</h3>
            <div className="space-y-2">
              {trainer.certifications.map((cert: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/#booking"
              className="block w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center rounded-lg font-bold text-lg hover:shadow-xl transition"
            >
              Book a Session with {trainer.name}
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
