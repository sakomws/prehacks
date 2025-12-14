"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/components/providers/auth-provider'

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await login(formData.email, formData.password)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card className="apple-card">
      <CardHeader className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-ai-blue-600 to-ai-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-2xl">AI</span>
        </div>
        <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
        <CardDescription className="text-lg">
          Continue your AI parenting journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="ai-input w-full"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="ai-input w-full"
              placeholder="Enter your password"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full ai-button-primary"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="text-center space-y-4">
          <Link href="/forgot-password" className="text-sm text-ai-blue-600 hover:underline">
            Forgot your password?
          </Link>
          
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="text-muted-foreground">Don't have an account?</span>
            <Link href="/register" className="text-ai-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}