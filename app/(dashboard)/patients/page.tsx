'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Eye, Loader2 } from 'lucide-react'
import { Patient } from '@/types'
import { formatDate } from '@/lib/utils'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { profile, puskesmas, isSuperAdmin } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function fetchPatients() {
      setLoading(true)
      try {
        let query = supabase.from('patients').select('*, puskesmas_patients!inner(puskesmas_id)')
        
        // If not super admin, filter by puskesmas_id
        if (!isSuperAdmin && profile?.puskesmas_id) {
          query = query.eq('puskesmas_patients.puskesmas_id', profile.puskesmas_id)
        }

        if (search) {
          query = query.or(`nama.ilike.%${search}%,nik.ilike.%${search}%`)
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(50)

        if (error) throw error
        setPatients(data as Patient[] || [])
      } catch (error) {
        console.error('Error fetching patients:', error)
      } finally {
        setLoading(false)
      }
    }

    if (profile) {
      fetchPatients()
    }
  }, [profile, isSuperAdmin, search, supabase])

  return (
    <>
      <PageHeader 
        title="Daftar Pasien" 
        description={isSuperAdmin ? "Semua pasien dari seluruh puskesmas" : `Pasien terdaftar di ${puskesmas?.nama || 'Puskesmas'}`}
      >
        <Link href="/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pasien
          </Button>
        </Link>
      </PageHeader>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Cari nama atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Tidak ada pasien</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search ? 'Tidak ada pasien yang cocok dengan pencarian Anda.' : 'Mulai dengan menambahkan pasien baru.'}
          </p>
          {!search && (
            <div className="mt-6">
              <Link href="/patients/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pasien Baru
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIK</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>L/P</TableHead>
              <TableHead>Tanggal Lahir</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium text-gray-900">{patient.nik}</TableCell>
                <TableCell>{patient.nama}</TableCell>
                <TableCell>{patient.jenis_kelamin}</TableCell>
                <TableCell>{formatDate(patient.tanggal_lahir)}</TableCell>
                <TableCell>{patient.no_hp || '-'}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/patients/${patient.id}`}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4 mr-1" />
                      Detail
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  )
}
