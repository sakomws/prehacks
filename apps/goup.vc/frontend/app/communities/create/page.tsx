'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Users, 
  Globe,
  Lock,
  Crown,
  MapPin,
  Tag,
  Image as ImageIcon,
  FileText,
  Settings,
  Eye,
  Plus,
  X,
  Check
} from 'lucide-react'

interface CommunityFormData {
  name: string
  description: string
  category: string
  type: 'public' | 'private' | 'invite_only'
  location: string
  tags: string[]
  rules: string[]
  cover_image?: string
  avatar?: string
}

const CATEGORIES = [
  'Technology',
  'AI & Machine Learning',
  'Design',
  'Sustainability',
  'Blockchain',
  'Product Management',
  'Marketing',
  'Finance',
  'Healthcare',
  'Education',
  'Gaming',
  'Music',
  'Art',
  'Sports',
  'Travel',
  'Food & Cooking',
  'Books & Literature',
  'Photography',
  'Other'
]

const DEFAULT_RULES = [
  "Be respectful and professional in all interactions",
  "No spam or self-promotion without context",
  "Share valuable insights and experiences",
  "Keep discussions relevant to the community topic",
  "Help fellow members when possible"
]

export default function CreateCommunityPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    description: '',
    category: '',
    type: 'public',
    location: '',
    tags: [],
    rules: [...DEFAULT_RULES]
  })
  const [newTag, setNewTag] = useState('')
  const [newRule, setNewRule] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof CommunityFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      handleInputChange('tags', [...formData.tags, newTag.trim().toLowerCase()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const addRule = () => {
    if (newRule.trim() && !formData.rules.includes(newRule.trim())) {
      handleInputChange('rules', [...formData.rules, newRule.trim()])
      setNewRule('')
    }
  }

  const removeRule = (index: number) => {
    handleInputChange('rules', formData.rules.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Create the new community object
      const newCommunity = {
        id: Date.now(), // Generate a unique ID
        name: formData.name,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        member_count: 1, // Creator is the first member
        active_members: 1,
        posts_count: 0,
        events_count: 0,
        created_at: new Date().toISOString(),
        cover_image: formData.cover_image,
        avatar: formData.avatar,
        location: formData.location,
        tags: formData.tags,
        is_member: true,
        is_admin: true,
        recent_activity: [
          {
            type: "member_joined" as const,
            description: "Community created",
            time: "Just now"
          }
        ]
      }

      // Store in localStorage for persistence across page reloads
      const existingCommunities = JSON.parse(localStorage.getItem('user_communities') || '[]')
      const updatedCommunities = [newCommunity, ...existingCommunities]
      localStorage.setItem('user_communities', JSON.stringify(updatedCommunities))
      
      // Also store the individual community for the detail page
      localStorage.setItem(`community_${newCommunity.id}`, JSON.stringify({
        ...newCommunity,
        rules: formData.rules
      }))

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Redirect to the newly created community
      router.push(`/communities/${newCommunity.id}`)
    } catch (error) {
      console.error('Failed to create community:', error)
      alert('Failed to create community. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Globe className="w-5 h-5" />
      case 'private':
        return <Lock className="w-5 h-5" />
      case 'invite_only':
        return <Crown className="w-5 h-5" />
      default:
        return <Globe className="w-5 h-5" />
    }
  }

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'public':
        return 'Anyone can find and join this community'
      case 'private':
        return 'Only members can see posts and content'
      case 'invite_only':
        return 'People can request to join, but need approval'
      default:
        return ''
    }
  }

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.name.trim() && formData.description.trim() && formData.category
      case 2:
        return formData.type
      case 3:
        return true // Optional step
      case 4:
        return true // Review step
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <section className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/communities"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Create Community</h1>
            <p className="text-gray-600">Build a space for people to connect and share</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Step {step} of 4</span>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        ></div>
      </div>

      {/* Form Steps */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Basic Information</h2>
              <p className="text-gray-600">Let's start with the basics about your community</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., SF Tech Founders"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={50}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.name.length}/50 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what your community is about, who should join, and what value it provides..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.description.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA or Global"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Privacy Settings</h2>
              <p className="text-gray-600">Choose who can see and join your community</p>
            </div>

            <div className="space-y-4">
              {[
                { type: 'public', title: 'Public', description: 'Anyone can find and join this community' },
                { type: 'private', title: 'Private', description: 'Only members can see posts and content' },
                { type: 'invite_only', title: 'Invite Only', description: 'People can request to join, but need approval' }
              ].map(({ type, title, description }) => (
                <div
                  key={type}
                  onClick={() => handleInputChange('type', type)}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.type === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      formData.type === type ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getTypeIcon(type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                      <p className="text-gray-600">{description}</p>
                    </div>
                    {formData.type === type && (
                      <Check className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Customize Your Community</h2>
              <p className="text-gray-600">Add tags and rules to help organize your community</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add a tag (e.g., startups, networking)"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addTag}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Rules
                </label>
                <div className="space-y-3 mb-4">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="flex-1 text-gray-700">{rule}</p>
                      <button
                        onClick={() => removeRule(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRule()}
                    placeholder="Add a community rule"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addRule}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Review & Create</h2>
              <p className="text-gray-600">Review your community details before creating</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {formData.name.charAt(0) || 'C'}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{formData.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(formData.type)}
                      <span className="capitalize">{formData.type.replace('_', ' ')}</span>
                    </div>
                    <span>•</span>
                    <span>{formData.category}</span>
                    {formData.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{formData.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-gray-700 mb-4">{formData.description}</p>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Community Rules ({formData.rules.length})</h4>
                    <div className="space-y-1">
                      {formData.rules.slice(0, 3).map((rule, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                          <span className="font-medium">{index + 1}.</span>
                          <span>{rule}</span>
                        </div>
                      ))}
                      {formData.rules.length > 3 && (
                        <p className="text-sm text-gray-500">+{formData.rules.length - 3} more rules</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Preview Mode</h4>
                  <p className="text-sm text-blue-700">
                    This is how your community will appear to others. You can edit these details anytime after creation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-100">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center space-x-4">
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid(step)}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    <span>Create Community</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}