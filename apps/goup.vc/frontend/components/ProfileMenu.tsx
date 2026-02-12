'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { User, Settings, LogOut } from 'lucide-react'

interface ProfileMenuProps {
  onClose: () => void
}

export default function ProfileMenu({ onClose }: ProfileMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden z-50"
    >
      <div className="px-4 py-3 border-b border-black/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div>
            <div className="font-semibold text-gray-900">Sako M</div>
            <div className="text-sm text-gray-500">sako@gladly.com</div>
          </div>
        </div>
      </div>
      
      <div className="py-2">
        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <User className="w-4 h-4 mr-3" />
          View Profile
        </Link>
        <Link
          href="/settings/account"
          onClick={onClose}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Link>
        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )
}