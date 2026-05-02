'use client'

import { Menu } from 'lucide-react'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sm:px-6 lg:px-8 z-30 relative">
      <button
        onClick={onMenuClick}
        className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden mr-4"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex-1 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800 lg:hidden">
          PuskesmasLink
        </h1>
        {/* We can add a user dropdown, search, or notification bell here later */}
        <div className="ml-auto">
          {/* Add elements here if needed on the right side of header */}
        </div>
      </div>
    </header>
  )
}
