'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { 
  Home, 
  Users, 
  ClipboardList, 
  FileText, 
  Settings, 
  Building2,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean
  setIsOpen: (open: boolean) => void 
}) {
  const pathname = usePathname()
  const { isSuperAdmin, isAdmin, signOut, profile, puskesmas } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, show: true },
    { name: 'Pasien', href: '/patients', icon: Users, show: true },
    { name: 'Pemeriksaan', href: '/examinations', icon: ClipboardList, show: true },
    { name: 'Laporan', href: '/reports', icon: FileText, show: true },
    { name: 'Petugas', href: '/admin/users', icon: Settings, show: isAdmin },
    { name: 'Puskesmas', href: '/admin/puskesmas', icon: Building2, show: isSuperAdmin },
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo area */}
          <div className="h-16 flex items-center px-6 bg-blue-600 text-white justify-between">
            <span className="text-xl font-bold">PuskesmasLink</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.nama || 'Loading...'}
            </p>
            <p className="text-xs text-gray-500 capitalize mt-1">
              {profile?.role === 'super_admin' ? 'Super Admin' : (profile?.role || '')}
            </p>
            {puskesmas && (
              <p className="text-xs text-blue-600 font-medium mt-1 truncate">
                {puskesmas.nama}
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (!item.show) return null;
              
              const isActive = pathname === item.href || 
                              (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon 
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-700" : "text-gray-400"
                    )} 
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Keluar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
