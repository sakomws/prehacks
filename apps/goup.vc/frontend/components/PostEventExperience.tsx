'use client'

import { useState } from 'react'
import { Star, Download, MessageSquare, Calendar, ArrowRight } from 'lucide-react'

interface PostEventExperienceProps {
  eventId: string
  eventTitle: string
}

export default function PostEventExperience({ eventId, eventTitle }: PostEventExperienceProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [showTakeaways, setShowTakeaways] = useState(false)

  const relatedEvents = [
    { id: '2', title: 'Advanced Tax Strategies Workshop', date: 'Jan 15, 2025' },
    { id: '3', title: 'Small Business Accounting Basics', date: 'Jan 22, 2025' },
    { id: '4', title: 'Investment Tax Planning', date: 'Feb 5, 2025' }
  ]

  const keyTakeaways = [
    'New IRS standard deduction amounts for 2024',
    'Home office deduction changes for remote workers',
    'Quarterly tax payment deadlines and penalties',
    'Documentation requirements for business expenses'
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Event Completed Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Completed!</h1>
        <p className="text-lg text-gray-600 mb-6">{eventTitle}</p>
        
        {/* Quick Rating */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-sm text-gray-600 mr-2">How was it?</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`w-8 h-8 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            >
              <Star className="w-full h-full fill-current" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Takeaways */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaways</h2>
          
          {!showTakeaways ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">AI-generated summary of the main points covered</p>
              <button
                onClick={() => setShowTakeaways(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Get Key Takeaways
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {keyTakeaways.map((takeaway, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <p className="text-gray-800">{takeaway}</p>
                </div>
              ))}
              
              <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download Summary</span>
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Download Materials */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Materials</h3>
            <div className="space-y-3">
              <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 p-4 rounded-xl transition-colors flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5" />
                  <span>Tax Deduction Checklist.pdf</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 p-4 rounded-xl transition-colors flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5" />
                  <span>IRS Updates 2024 Slides.pdf</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Follow-up Question */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ask a Follow-up Question</h3>
            <textarea
              placeholder="Have a specific question about something covered in the session?"
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
            />
            <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Send to Organizer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Related Events */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Related Upcoming Events</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {relatedEvents.map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors cursor-pointer">
              <h3 className="font-medium text-gray-900 mb-2">{event.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{event.date}</p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                <span>Learn more</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Your Experience</h2>
        
        <textarea
          placeholder="What did you think of the event? Any suggestions for improvement?"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none mb-4"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-600">Share feedback publicly</span>
            </label>
          </div>
          
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-xl font-medium transition-colors">
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  )
}