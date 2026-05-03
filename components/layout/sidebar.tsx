'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
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
  const router = useRouter()
  const { isSuperAdmin, isAdmin, signOut, profile, puskesmas } = useAuth()

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      await signOut()
      router.replace('/login')
      router.refresh()
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, show: true },
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
            <span className="text-xl font-bold tracking-tight">Puskesmas<span className="text-blue-200">Digital</span></span>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-bold text-slate-900 truncate">
                {profile?.nama || 'Memuat...'}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {profile?.role?.replace('_', ' ') || 'Petugas'}
                </p>
              </div>
            </div>
            {puskesmas && (
              <p className="text-[11px] text-blue-600 font-semibold mt-2 px-2 py-0.5 bg-blue-50 rounded-md inline-block max-w-full truncate">
                {puskesmas.nama}
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              if (!item.show) return null;
              
              const isActive = pathname === item.href || 
                              (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon 
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                    )} 
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-3 text-sm font-bold text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 group"
            >
              <LogOut className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Keluar Sistem
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
