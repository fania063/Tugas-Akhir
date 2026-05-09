'use client'

import { Menu, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { profile } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sm:px-6 z-30 relative">
      <button
        id="mobile-menu-button"
        onClick={onMenuClick}
        className="text-gray-500 hover:text-emerald-600 focus:outline-none lg:hidden mr-4 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>
      
      <div className="flex-1 flex justify-between items-center">
        {/* Mobile title */}
        <h1 className="text-base font-bold text-emerald-700 lg:hidden">
          🌸 Posyandu Melati
        </h1>

        {/* Desktop breadcrumb area — bisa diisi dinamis */}
        <div className="hidden lg:block" />

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {profile?.nama?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {profile?.nama ?? ''}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
