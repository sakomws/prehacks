import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Register - AI Parenting Guide',
  description: 'Join our community of ethical AI practitioners and start your journey toward responsible AI development.',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <RegisterForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}