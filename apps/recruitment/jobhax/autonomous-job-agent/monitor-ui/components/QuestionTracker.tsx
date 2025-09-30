'use client'

import { 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  FileText, 
  Radio, 
  ChevronDown,
  Calendar,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

interface Question {
  question_id: string
  question_text: string
  field_type: string
  required: boolean
  filled: boolean
  response?: string
  response_type?: string
}

interface QuestionTrackerProps {
  questions: Question[]
  currentPage: number
}

export default function QuestionTracker({ questions, currentPage }: QuestionTrackerProps) {
  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text_input':
        return <FileText className="h-4 w-4" />
      case 'email_input':
        return <Mail className="h-4 w-4" />
      case 'tel_input':
        return <Phone className="h-4 w-4" />
      case 'radio_group':
        return <Radio className="h-4 w-4" />
      case 'dropdown':
        return <ChevronDown className="h-4 w-4" />
      case 'textarea':
        return <FileText className="h-4 w-4" />
      case 'date_input':
        return <Calendar className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getFieldTypeColor = (fieldType: string) => {
    switch (fieldType) {
      case 'text_input':
      case 'textarea':
        return 'text-blue-600 bg-blue-100'
      case 'email_input':
        return 'text-green-600 bg-green-100'
      case 'tel_input':
        return 'text-purple-600 bg-purple-100'
      case 'radio_group':
        return 'text-orange-600 bg-orange-100'
      case 'dropdown':
        return 'text-pink-600 bg-pink-100'
      case 'date_input':
        return 'text-indigo-600 bg-indigo-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const filledQuestions = questions.filter(q => q.filled).length
  const requiredQuestions = questions.filter(q => q.required)
  const filledRequiredQuestions = requiredQuestions.filter(q => q.filled).length

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Question Tracker</h2>
        <div className="text-sm text-gray-500">
          {filledQuestions}/{questions.length} filled
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
          <div className="text-xs text-gray-600">Total Questions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{filledQuestions}</div>
          <div className="text-xs text-gray-600">Filled</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{requiredQuestions.length}</div>
          <div className="text-xs text-gray-600">Required</div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No questions detected yet.</p>
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={question.question_id}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${
                question.filled 
                  ? 'bg-green-50 border-green-200' 
                  : question.required 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {question.filled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : question.required ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {question.question_text}
                  </span>
                  {question.required && (
                    <span className="text-xs text-red-600 font-medium">Required</span>
                  )}
                </div>
                
                {/* Show response if available */}
                {question.filled && question.response && (
                  <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-green-700">Agent Response:</span>
                      {question.response_type && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                          {question.response_type}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-green-800">
                      {question.response}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFieldTypeColor(question.field_type)}`}>
                    {getFieldIcon(question.field_type)}
                    <span className="ml-1 capitalize">
                      {question.field_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    ID: {question.question_id}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Progress Indicator */}
      {questions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Required Questions Progress</span>
            <span>{filledRequiredQuestions}/{requiredQuestions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${requiredQuestions.length > 0 ? (filledRequiredQuestions / requiredQuestions.length) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
