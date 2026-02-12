'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, MessageCircle, Send, Clock, HelpCircle, Users, Newspaper, Wrench } from 'lucide-react'

interface ContactInfo {
  email: string
  phone?: string
  address: string
  social_links: {
    twitter: string
    linkedin: string
    instagram: string
    github: string
  }
}

interface OfficeLocation {
  city: string
  address: string
  description: string
  image: string
}

interface SupportOption {
  title: string
  email: string
  description: string
}

interface FAQ {
  question: string
  answer: string
}

interface ContactData {
  contact_info: ContactInfo
  office_locations: OfficeLocation[]
  support_options: SupportOption[]
  faq: FAQ[]
}

export default function ContactPage() {
  const [contactData, setContactData] = useState<ContactData | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  useEffect(() => {
    loadContactData()
  }, [])

  const loadContactData = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/contact')
      const data = await response.json()
      setContactData(data)
    } catch (error) {
      console.error('Failed to load contact data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const getSupportIcon = (title: string) => {
    if (title.includes('General')) return Users
    if (title.includes('Event')) return MessageCircle
    if (title.includes('Technical')) return Wrench
    if (title.includes('Press')) return Newspaper
    return HelpCircle
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!contactData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Unable to load content</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {/* Header */}
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-gray-900 mb-6">
          Get in Touch
        </h1>
        <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto leading-relaxed">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </section>

      {/* Contact Form & Info */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-md flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <a href={`mailto:${contactData.contact_info.email}`} className="text-blue-600 hover:text-blue-700 transition-colors">
                    {contactData.contact_info.email}
                  </a>
                </div>
              </div>

              {contactData.contact_info.phone && (
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <a href={`tel:${contactData.contact_info.phone}`} className="text-green-600 hover:text-green-700 transition-colors">
                      {contactData.contact_info.phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Address</h3>
                  <p className="text-gray-600">{contactData.contact_info.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Follow Us</h2>
            <div className="flex space-x-4">
              {Object.entries(contactData.contact_info.social_links).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                >
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {platform[0].toUpperCase()}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section>
        <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">How Can We Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contactData.support_options.map((option, index) => {
            const Icon = getSupportIcon(option.title)
            const colors = ['text-blue-600 bg-blue-100', 'text-green-600 bg-green-100', 'text-purple-600 bg-purple-100', 'text-orange-600 bg-orange-100']
            const colorClass = colors[index % colors.length]
            
            return (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-600 mb-3 text-sm">{option.description}</p>
                    <a 
                      href={`mailto:${option.email}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      {option.email}
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Office Locations */}
      <section>
        <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">Our Offices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contactData.office_locations.map((office, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{office.city}</h3>
                <div className="flex items-start space-x-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <p className="text-gray-600 text-sm">{office.address}</p>
                </div>
                <p className="text-gray-700 text-sm">{office.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {contactData.faq.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-2xl"
              >
                <h3 className="font-medium text-gray-900">{item.question}</h3>
                <div className={`transform transition-transform ${expandedFAQ === index ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {expandedFAQ === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Response Time */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12 text-center">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Clock className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-semibold text-gray-900">Response Time</h2>
        </div>
        <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
          We typically respond to all inquiries within 24 hours during business days. 
          For urgent matters, please call us directly.
        </p>
      </section>
    </div>
  )
}