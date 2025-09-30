'use client'

import { Activity, FileText, Camera, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface MetricsProps {
  totalActions: number
  questionsFound: number
  questionsFilled: number
  screenshotsTaken: number
  duration: number
}

export default function Metrics({ 
  totalActions, 
  questionsFound, 
  questionsFilled, 
  screenshotsTaken, 
  duration 
}: MetricsProps) {
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
  }

  const completionRate = questionsFound > 0 ? Math.round((questionsFilled / questionsFound) * 100) : 0

  const metrics = [
    {
      name: 'Total Actions',
      value: totalActions,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Questions Found',
      value: questionsFound,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Questions Filled',
      value: questionsFilled,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      name: 'Screenshots',
      value: screenshotsTaken,
      icon: Camera,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Duration',
      value: formatDuration(duration),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      name: 'Completion Rate',
      value: `${completionRate}%`,
      icon: AlertCircle,
      color: completionRate >= 80 ? 'text-green-600' : 'text-yellow-600',
      bgColor: completionRate >= 80 ? 'bg-green-100' : 'bg-yellow-100'
    }
  ]

  return (
    <div className="card animate-fade-in">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Metrics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center space-x-3">
              <div className={`metric-icon ${metric.bgColor.replace('bg-', 'metric-icon-').replace('-100', '')}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{metric.name}</p>
                <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
