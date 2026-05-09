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
  UserCog,
  Menu,
  X,
  LogOut,
  HeartPulse
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
  const { isAdmin, signOut, profile } = useAuth()

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      await signOut()
      router.replace('/login')
      router.refresh()
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, show: true },
    { name: 'Data Pasien', href: '/patients', icon: Users, show: true },
    { name: 'Pemeriksaan', href: '/examinations', icon: ClipboardList, show: true },
    { name: 'Laporan', href: '/reports', icon: FileText, show: true },
    { name: 'Kelola Petugas', href: '/admin/users', icon: UserCog, show: isAdmin },
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo area — Hijau */}
          <div className="h-16 flex items-center px-5 bg-gradient-to-r from-emerald-700 to-emerald-500 text-white justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-black tracking-tight">Posyandu Melati</p>
                <p className="text-[10px] text-emerald-100 font-medium">Sistem Informasi Kesehatan</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          <div className="px-5 py-4 border-b border-gray-100 bg-emerald-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {profile?.nama?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {profile?.nama ?? 'Memuat...'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">
                    {profile?.role?.replace('_', ' ') ?? 'Petugas'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-2.5 px-2 py-1 bg-emerald-100 rounded-lg">
              <p className="text-[11px] text-emerald-700 font-semibold text-center">
                🌸 Posyandu Melati
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (!item.show) return null;
              
              const isActive = pathname === item.href || 
                              (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon 
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-600"
                    )} 
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Logout button */}
          <div className="p-3 border-t border-gray-100">
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
