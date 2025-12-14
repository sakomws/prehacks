import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { Navigation } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Login - AI Parenting Guide',
  description: 'Sign in to your AI Parenting Guide account and continue your ethical AI learning journey.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}