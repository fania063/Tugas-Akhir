'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ExaminationsPage() {
  const [examinations, setExaminations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [jenisFilter, setJenisFilter] = useState('')
  const { profile, puskesmas, isSuperAdmin } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function fetchExaminations() {
      setLoading(true)
      try {
        let query = supabase
          .from('examinations')
          .select(`
            *,
            patients:patient_id(nama, nik),
            profiles:user_id(nama),
            puskesmas:puskesmas_id(nama)
          `)

        if (!isSuperAdmin && profile?.puskesmas_id) {
          query = query.eq('puskesmas_id', profile.puskesmas_id)
        }

        if (jenisFilter) {
          query = query.eq('jenis_pemeriksaan', jenisFilter)
        }

        const { data, error } = await query.order('tanggal_pemeriksaan', { ascending: false }).limit(50)

        if (error) throw error
        setExaminations(data || [])
      } catch (error) {
        console.error('Error fetching examinations:', error)
      } finally {
        setLoading(false)
      }
    }

    if (profile) {
      fetchExaminations()
    }
  }, [profile, isSuperAdmin, jenisFilter, supabase])

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
        description={isSuperAdmin ? "Semua pemeriksaan dari seluruh puskesmas" : `Pemeriksaan di ${puskesmas?.nama || 'Puskesmas'}`}
      >
        <Link href="/examinations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Pemeriksaan Baru
          </Button>
        </Link>
      </PageHeader>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex gap-4">
        <div className="w-64">
          <Select 
            value={jenisFilter} 
            onChange={(e) => setJenisFilter(e.target.value)}
          >
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
              <TableHead>Diagnosa</TableHead>
              {isSuperAdmin && <TableHead>Puskesmas</TableHead>}
              <TableHead>Petugas</TableHead>
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
                <TableCell className="max-w-xs truncate" title={exam.diagnosa}>
                  {exam.diagnosa || '-'}
                </TableCell>
                {isSuperAdmin && (
                  <TableCell className="text-sm text-gray-500">
                    {exam.puskesmas?.nama}
                  </TableCell>
                )}
                <TableCell className="text-sm text-gray-500">
                  {exam.profiles?.nama}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  )
}
