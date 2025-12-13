import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prehacks - Hackathon Project Platform',
  description: 'Discover, manage, and showcase hackathon projects. Build, collaborate, and ship amazing ideas.',
  keywords: ['hackathon', 'projects', 'collaboration', 'development', 'platform'],
  authors: [{ name: 'Prehacks Team' }],
  openGraph: {
    title: 'Prehacks - Hackathon Project Platform',
    description: 'Discover, manage, and showcase hackathon projects.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prehacks - Hackathon Project Platform',
    description: 'Discover, manage, and showcase hackathon projects.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
