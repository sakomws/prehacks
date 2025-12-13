'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const API_BASE_URL = 'http://localhost:8002'

interface AuthResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    username?: string
  }
}

export default function AuthForm() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  const [regForm, setRegForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    username: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, loginForm)
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/register`, regForm)
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Event Management Platform
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex mb-4 border-b">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 text-center ${isLogin ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 text-center ${!isLogin ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Register
        </button>
      </div>

      {isLogin ? (
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={regForm.email}
            onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={regForm.password}
            onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="First Name"
            value={regForm.first_name}
            onChange={(e) => setRegForm({ ...regForm, first_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={regForm.last_name}
            onChange={(e) => setRegForm({ ...regForm, last_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Username (optional)"
            value={regForm.username}
            onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      )}
    </div>
  )
}

