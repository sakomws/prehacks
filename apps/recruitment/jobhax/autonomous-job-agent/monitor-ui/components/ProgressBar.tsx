'use client'

import { CheckCircle, Circle } from 'lucide-react'

interface ProgressBarProps {
  progress: number
  currentPage: number
}

export default function ProgressBar({ progress, currentPage }: ProgressBarProps) {
  const steps = [
    { id: 1, name: 'Page 1', description: 'Form Detection & Filling' },
    { id: 2, name: 'Page 2', description: 'Completion & Review' }
  ]

  return (
    <div className="card animate-fade-in">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 Progress</h2>
      
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-center">
          <span className="text-sm font-medium text-gray-900">{progress}% Complete</span>
        </div>
        
        {/* Step Indicators */}
        <div className="flex justify-between">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center animate-slide-up" style={{ animationDelay: `${step.id * 0.2}s` }}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentPage >= step.id 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-110' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {currentPage > step.id ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-900">{step.name}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
