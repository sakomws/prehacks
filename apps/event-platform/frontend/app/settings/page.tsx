'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Navbar from '../components/Navbar'

const API_BASE_URL = 'http://localhost:8002'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  username?: string
  bio?: string
  avatar_url?: string
  social_links?: any
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'payment'>('account')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    bio: '',
    social_links: {
      instagram: '',
      twitter: '',
      youtube: '',
      linkedin: '',
      website: ''
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data)
        setProfileData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          username: response.data.username || '',
          bio: response.data.bio || '',
          social_links: response.data.social_links || {
            instagram: '',
            twitter: '',
            youtube: '',
            linkedin: '',
            website: ''
          }
        })
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setIsSaving(true)
    try {
      await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Profile saved successfully!')
    } catch (error: any) {
      alert('Failed to save profile: ' + (error.response?.data?.detail || error.message))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="text-center py-12">Loading...</div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Tabs */}
        <div className="flex space-x-8 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('account')}
            className={`pb-4 px-1 border-b-2 font-medium ${
              activeTab === 'account'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-4 px-1 border-b-2 font-medium ${
              activeTab === 'preferences'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`pb-4 px-1 border-b-2 font-medium ${
              activeTab === 'payment'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Payment
          </button>
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Profile</h2>
              <p className="text-gray-600 mb-6">
                Choose how you are displayed as a host or guest.
              </p>

              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {user?.avatar_url ? (
                        <img
                          src={`${API_BASE_URL}${user.avatar_url}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-gray-400">
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </span>
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white">
                      ↑
                    </button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, first_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, last_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      @
                    </span>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData({ ...profileData, username: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Social Links</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">📷</span>
                      <span className="text-sm text-gray-600 w-24">instagram.com/</span>
                      <input
                        type="text"
                        value={profileData.social_links.instagram}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            social_links: {
                              ...profileData.social_links,
                              instagram: e.target.value
                            }
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">🐦</span>
                      <span className="text-sm text-gray-600 w-24">x.com/</span>
                      <input
                        type="text"
                        value={profileData.social_links.twitter}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            social_links: {
                              ...profileData.social_links,
                              twitter: e.target.value
                            }
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">📺</span>
                      <span className="text-sm text-gray-600 w-24">youtube.com/@</span>
                      <input
                        type="text"
                        value={profileData.social_links.youtube}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            social_links: {
                              ...profileData.social_links,
                              youtube: e.target.value
                            }
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">💼</span>
                      <span className="text-sm text-gray-600 w-24">linkedin.com/in/</span>
                      <input
                        type="text"
                        value={profileData.social_links.linkedin}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            social_links: {
                              ...profileData.social_links,
                              linkedin: e.target.value
                            }
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">🌐</span>
                      <span className="text-sm text-gray-600 w-24">https://</span>
                      <input
                        type="text"
                        value={profileData.social_links.website}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            social_links: {
                              ...profileData.social_links,
                              website: e.target.value
                            }
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Display</h2>
              <p className="text-gray-600 mb-6">Choose your desired interface theme.</p>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {['System', 'Light', 'Dark'].map((theme) => (
                    <div
                      key={theme}
                      className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300"
                    >
                      <div className="h-24 bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <span className="text-gray-400">Aa</span>
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-medium text-gray-700">{theme}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Notifications</h2>
              <p className="text-gray-600 mb-6">
                Choose how you would like to be notified about updates, invites and subscriptions.
              </p>

              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Events You Attend</h3>
                  <div className="space-y-3">
                    {[
                      { icon: '✉️', label: 'Event Invites', default: 'Push' },
                      { icon: '⏰', label: 'Event Reminders', default: 'Off' },
                      { icon: '📢', label: 'Event Updates', default: 'Push' }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between py-2 border-b border-gray-100"
                      >
                        <div className="flex items-center space-x-3">
                          <span>{item.icon}</span>
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </div>
                        <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                          <option>{item.default}</option>
                          <option>Email</option>
                          <option>Push</option>
                          <option>Off</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Methods</h2>
              <p className="text-gray-600 mb-6">
                Your saved payment methods are encrypted and stored securely by Stripe.
              </p>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2">
                  <span>+</span>
                  <span>Add Card</span>
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Calendar Plus</h2>
              <p className="text-gray-600 mb-6">
                Enjoy 0% platform fees, higher invite and admin limits, priority support, and more.
              </p>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    Calendar Plus applies on the calendar level. Choose the desired calendar above
                    to manage its Calendar Plus membership.
                  </span>
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Learn More →
                  </button>
                </div>
                <div className="space-y-2">
                  {['Personal', 'Work Events'].map((name) => (
                    <div
                      key={name}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          📅
                        </div>
                        <span className="text-sm font-medium text-gray-900">{name}</span>
                      </div>
                      <span>→</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment History</h2>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Sample Event</div>
                    <div className="text-xs text-gray-500 mt-1">Card ending in 9173</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">$2.00</div>
                    <div className="text-xs text-gray-500">Apr 22, 2024</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

