'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SettingsLayoutProps {
  children: React.ReactNode
}

const tabs = [
  { href: '/settings/account', label: 'Account' },
  { href: '/settings/preferences', label: 'Preferences' },
  { href: '/settings/payment', label: 'Payment' }
]

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-semibold tracking-tight text-gray-900">Settings</h1>
      
      <div className="flex space-x-8 border-b border-black/5">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-4 text-lg font-medium transition-colors relative ${
              pathname === tab.href
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {pathname === tab.href && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            )}
          </Link>
        ))}
      </div>

      {children}
    </div>
  )
}