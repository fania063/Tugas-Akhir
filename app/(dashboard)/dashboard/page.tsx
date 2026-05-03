'use client'

import { useAuth } from '@/hooks/use-auth'
import { Users, ClipboardList, Activity, FileText } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { profile, puskesmas, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = [
    { name: 'Total Pasien', value: '...', icon: Users, href: '/patients', color: 'bg-blue-500' },
    { name: 'Pemeriksaan Bulan Ini', value: '...', icon: ClipboardList, href: '/examinations', color: 'bg-emerald-500' },
    { name: 'Ibu Hamil & Menyusui', value: '...', icon: Activity, href: '/reports', color: 'bg-purple-500' },
    { name: 'Total Laporan', value: '...', icon: FileText, href: '/reports', color: 'bg-amber-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Selamat datang, {profile?.nama}!
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            {profile?.role === 'super_admin' 
              ? 'Anda masuk sebagai Super Admin. Anda dapat mengelola semua data puskesmas dan petugas di dalam sistem.' 
              : `Anda bertugas di ${puskesmas?.nama || 'Puskesmas'}. Jangan lupa untuk selalu memeriksa kembali data sebelum menyimpan.`}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link 
              href="/patients/new" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Users className="mr-2 h-4 w-4" />
              Pasien Baru
            </Link>
            <Link 
              href="/examinations/new" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ClipboardList className="mr-2 h-4 w-4 text-gray-500" />
              Pemeriksaan Baru
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 relative group">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${item.color} text-white`}>
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd>
                      <div className="text-2xl font-semibold text-gray-900">
                        {item.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
              <div className="text-sm">
                <Link href={item.href} className="font-medium text-blue-600 hover:text-blue-900 group-hover:underline">
                  Lihat detail
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Recent Activity or Charts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Aktivitas Terakhir</h3>
        <div className="flex h-48 items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500">Belum ada aktivitas yang dapat ditampilkan.</p>
        </div>
      </div>
    </div>
  )
}
