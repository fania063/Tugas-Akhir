'use client'

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, ClipboardList, Baby, HeartHandshake, UserRound, Leaf, Pencil, Trash2, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

type Stats = {
  total_pasien: number
  pemeriksaan_bulan_ini: number
  ibu_hamil: number
  balita: number
  ibu_menyusui: number
  lansia: number
}

export default function DashboardPage() {
  const { profile, loading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [recentExams, setRecentExams] = useState<any[]>([])
  const [loadingExams, setLoadingExams] = useState(true)
  const [recentPatients, setRecentPatients] = useState<any[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true)
      try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const [pasienRes, examsRes, bumilRes, balitaRes, busuiRes, lansiaRes] = await Promise.all([
          supabase.from('patients').select('id', { count: 'exact', head: true }),
          supabase.from('examinations').select('id', { count: 'exact', head: true })
            .gte('tanggal_pemeriksaan', startOfMonth),
          supabase.from('examinations').select('id', { count: 'exact', head: true })
            .eq('jenis_pemeriksaan', 'Ibu_Hamil'),
          supabase.from('examinations').select('id', { count: 'exact', head: true })
            .eq('jenis_pemeriksaan', 'Balita'),
          supabase.from('examinations').select('id', { count: 'exact', head: true })
            .eq('jenis_pemeriksaan', 'Ibu_Menyusui'),
          supabase.from('examinations').select('id', { count: 'exact', head: true })
            .eq('jenis_pemeriksaan', 'Lansia'),
        ])

        setStats({
          total_pasien: pasienRes.count ?? 0,
          pemeriksaan_bulan_ini: examsRes.count ?? 0,
          ibu_hamil: bumilRes.count ?? 0,
          balita: balitaRes.count ?? 0,
          ibu_menyusui: busuiRes.count ?? 0,
          lansia: lansiaRes.count ?? 0,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingStats(false)
      }
    }
    async function fetchRecentExams() {
      setLoadingExams(true)
      const { data } = await supabase
        .from('examinations')
        .select(`
          *,
          patients:patient_id(nama, nik),
          profiles:user_id(nama)
        `)
        .order('tanggal_pemeriksaan', { ascending: false })
        .limit(5)
      setRecentExams(data || [])
      setLoadingExams(false)
    }

    async function fetchRecentPatients() {
      setLoadingPatients(true)
      const { data } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentPatients(data || [])
      setLoadingPatients(false)
    }

    fetchStats()
    fetchRecentExams()
    fetchRecentPatients()
  }, [supabase])

  const handleDeletePatient = async (id: string, nama: string) => {
    if (!confirm(`Yakin ingin menghapus pasien "${nama}"? Semua riwayat pemeriksaan juga akan terhapus.`)) return
    setDeletingPatientId(id)
    try {
      const { error } = await supabase.from('patients').delete().eq('id', id)
      if (error) throw error
      setRecentPatients(prev => prev.filter(p => p.id !== id))
    } catch (error: any) {
      alert(`Gagal menghapus: ${error.message}`)
    } finally {
      setDeletingPatientId(null)
    }
  }

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data pemeriksaan ini?')) return
    setDeletingId(id)
    try {
      const { error } = await supabase.from('examinations').delete().eq('id', id)
      if (error) throw error
      setRecentExams(prev => prev.filter(e => e.id !== id))
    } catch (error: any) {
      alert(`Gagal menghapus: ${error.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  const statCards = [
    { name: 'Total Pasien Terdaftar', value: stats?.total_pasien ?? '-', icon: Users, href: '/patients', color: 'bg-emerald-600', light: 'bg-emerald-50 text-emerald-700' },
    { name: 'Pemeriksaan Bulan Ini', value: stats?.pemeriksaan_bulan_ini ?? '-', icon: ClipboardList, href: '/examinations', color: 'bg-teal-600', light: 'bg-teal-50 text-teal-700' },
    { name: 'Ibu Hamil (Total)', value: stats?.ibu_hamil ?? '-', icon: HeartHandshake, href: '/examinations', color: 'bg-pink-500', light: 'bg-pink-50 text-pink-700' },
    { name: 'Balita (Total)', value: stats?.balita ?? '-', icon: Baby, href: '/examinations', color: 'bg-sky-500', light: 'bg-sky-50 text-sky-700' },
    { name: 'Ibu Menyusui (Total)', value: stats?.ibu_menyusui ?? '-', icon: UserRound, href: '/examinations', color: 'bg-violet-500', light: 'bg-violet-50 text-violet-700' },
    { name: 'Lansia (Total)', value: stats?.lansia ?? '-', icon: Leaf, href: '/examinations', color: 'bg-amber-500', light: 'bg-amber-50 text-amber-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-100">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Selamat datang kembali 👋</p>
            <h2 className="text-2xl font-black mt-1">{profile?.nama ?? 'Petugas'}</h2>
            <p className="mt-1.5 text-emerald-100 text-sm">
              {profile?.role === 'admin'
                ? 'Anda masuk sebagai Admin — Posyandu Melati'
                : 'Anda bertugas sebagai Petugas — Posyandu Melati'}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-emerald-100 text-xs font-medium">Tanggal Hari Ini</p>
            <p className="text-lg font-bold">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link 
            href="/patients/new" 
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-white text-emerald-700 hover:bg-emerald-50 transition-colors shadow"
          >
            <Users className="mr-2 h-4 w-4" />
            Daftarkan Pasien Baru
          </Link>
          <Link 
            href="/examinations/new" 
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-emerald-700/50 text-white hover:bg-emerald-700 transition-colors border border-white/20"
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Catat Pemeriksaan Baru
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 group hover:shadow-md transition-shadow"
          >
            <div className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.color} text-white flex-shrink-0 shadow`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 truncate">{item.name}</p>
                <p className="text-3xl font-black text-gray-900 mt-0.5">
                  {loadingStats ? (
                    <span className="inline-block w-8 h-7 bg-gray-100 rounded animate-pulse" />
                  ) : item.value}
                </p>
              </div>
            </div>
            <div className={`px-5 py-2 border-t border-gray-50 ${item.light}`}>
              <p className="text-xs font-semibold group-hover:underline">Lihat detail →</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Pemeriksaan Terbaru</h3>
            <Link href="/examinations" className="text-xs font-semibold text-emerald-600 hover:underline">
              Lihat Semua →
            </Link>
          </div>
          
          {loadingExams ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : recentExams.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-400">Belum ada aktivitas pemeriksaan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Pasien</th>
                    <th className="px-6 py-3">Jenis</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(exam.tanggal_pemeriksaan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/patients/${exam.patient_id}`} className="text-sm font-bold text-gray-900 hover:text-emerald-600 transition-colors">
                          {exam.patients?.nama}
                        </Link>
                        <p className="text-[10px] text-gray-400 font-medium">{exam.patients?.nik}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase">
                          {exam.jenis_pemeriksaan.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                        <Link href={`/patients/${exam.patient_id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Detail">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`/patients/${exam.patient_id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDeleteExam(exam.id)}
                          disabled={deletingId === exam.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="Hapus"
                        >
                          {deletingId === exam.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Pasien Baru Terdaftar</h3>
            <Link href="/patients" className="text-xs font-semibold text-emerald-600 hover:underline">
              Lihat Semua →
            </Link>
          </div>
          
          {loadingPatients ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : recentPatients.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-400">Belum ada pasien terdaftar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Nama Pasien</th>
                    <th className="px-6 py-3">NIK</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/patients/${p.id}`} className="text-sm font-bold text-gray-900 hover:text-emerald-600 transition-colors">
                          {p.nama}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {p.nik}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                        <Link href={`/patients/${p.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Detail">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`/patients/${p.id}/edit`}>
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDeletePatient(p.id, p.nama)}
                          disabled={deletingPatientId === p.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="Hapus"
                        >
                          {deletingPatientId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
