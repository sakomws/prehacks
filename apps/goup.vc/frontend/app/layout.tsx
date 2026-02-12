import type { Metadata } from 'next'
import './globals.css'
import AppTopNav from '@/components/AppTopNav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Goup.VC',
  description: 'Venture Capital Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-system antialiased bg-white text-gray-900">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
          <AppTopNav />
          <main className="flex-1 max-w-6xl mx-auto px-8 py-12 w-full">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}