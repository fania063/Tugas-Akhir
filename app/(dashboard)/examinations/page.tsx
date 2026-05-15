'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Loader2, Trash2, Eye, Pencil } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { deleteExamination } from '@/lib/actions/data'

export default function ExaminationsPage() {
  const [examinations, setExaminations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [jenisFilter, setJenisFilter] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null)
  const { profile } = useAuth()
  const supabase = createClient()

  const fetchExaminations = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('examinations')
        .select(`*, patients:patient_id(nama, nik), profiles:user_id(nama)`)

      if (jenisFilter) query = query.eq('jenis_pemeriksaan', jenisFilter)

      const { data, error } = await query.order('tanggal_pemeriksaan', { ascending: false }).limit(100)
      if (error) throw error
      setExaminations(data || [])
    } catch (error) {
      console.error('Error fetching examinations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile) fetchExaminations()
  }, [profile, jenisFilter])

  const handleDelete = async (exam: any) => {
    setDeletingId(exam.id)
    try {
      const result = await deleteExamination(exam.id)
      if (!result.success) throw new Error(result.error)
      setExaminations(prev => prev.filter(e => e.id !== exam.id))
      setConfirmDelete(null)
    } catch (error: any) {
      alert(`Gagal menghapus pemeriksaan: ${error.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const getJenisColor = (jenis: string) => {
    switch(jenis) {
      case 'Balita': return 'bg-pink-100 text-pink-800'
      case 'Ibu_Hamil': return 'bg-purple-100 text-purple-800'
      case 'Ibu_Menyusui': return 'bg-teal-100 text-teal-800'
      case 'Lansia': return 'bg-amber-100 text-amber-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <PageHeader
        title="Daftar Pemeriksaan"
        description="Data pemeriksaan di Posyandu Melati"
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/examinations/wizard">
            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md h-10 px-5">
              <span className="mr-2 text-lg leading-none">👩‍👧</span>
              Pemeriksaan Terpadu (Ibu & Anak)
            </Button>
          </Link>
          <Link href="/examinations/new">
            <Button variant="outline" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 shadow-sm h-10 px-4">
              <Plus className="mr-2 h-4 w-4" />
              Pemeriksaan Individu
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex gap-4">
        <div className="w-64">
          <Select value={jenisFilter} onChange={(e) => setJenisFilter(e.target.value)}>
            <option value="">Semua Jenis Pemeriksaan</option>
            <option value="Balita">Balita</option>
            <option value="Ibu_Hamil">Ibu Hamil</option>
            <option value="Ibu_Menyusui">Ibu Menyusui</option>
            <option value="Lansia">Lansia</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : examinations.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Tidak ada data</h3>
          <p className="mt-1 text-sm text-gray-500">
            {jenisFilter ? `Tidak ada pemeriksaan untuk kategori ${jenisFilter.replace('_', ' ')}.` : 'Belum ada data pemeriksaan.'}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Pasien</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Petugas</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {examinations.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {formatDate(exam.tanggal_pemeriksaan)}
                </TableCell>
                <TableCell>
                  <Link href={`/patients/${exam.patient_id}`} className="text-blue-600 hover:underline font-medium">
                    {exam.patients?.nama}
                  </Link>
                  <div className="text-xs text-gray-500">{exam.patients?.nik}</div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getJenisColor(exam.jenis_pemeriksaan)}`}>
                    {exam.jenis_pemeriksaan.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {exam.profiles?.nama}
                </TableCell>
                <TableCell className="text-center flex justify-center gap-1">
                  <Link href={`/patients/${exam.patient_id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full"
                      title="Detail"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/patients/${exam.patient_id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                    onClick={() => setConfirmDelete(exam)}
                    disabled={deletingId === exam.id}
                    title="Hapus Pemeriksaan"
                  >
                    {deletingId === exam.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal Konfirmasi Hapus Pemeriksaan */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Hapus Pemeriksaan?</h3>
                  <p className="text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 bg-red-50 border border-red-100 rounded-lg p-3">
                Hapus data pemeriksaan <strong>{confirmDelete.jenis_pemeriksaan?.replace('_', ' ')}</strong> milik <strong>{confirmDelete.patients?.nama}</strong> tanggal <strong>{formatDate(confirmDelete.tanggal_pemeriksaan)}</strong>?
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={!!deletingId}>Batal</Button>
              <Button variant="danger" onClick={() => handleDelete(confirmDelete)} disabled={!!deletingId}>
                {deletingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
