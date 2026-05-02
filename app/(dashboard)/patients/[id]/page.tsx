'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Patient, Examination } from '@/types'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Plus, Loader2, Calendar, Phone, MapPin, UserSquare2 } from 'lucide-react'

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [examinations, setExaminations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { profile, isSuperAdmin } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function fetchPatientData() {
      try {
        // 1. Fetch patient
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .single()
          
        if (patientError) throw patientError
        setPatient(patientData as Patient)

        // 2. Fetch examinations
        let examQuery = supabase
          .from('examinations')
          .select(`
            *,
            profiles:user_id(nama),
            puskesmas:puskesmas_id(nama)
          `)
          .eq('patient_id', id)
          .order('tanggal_pemeriksaan', { ascending: false })

        // Filter by puskesmas if not super admin
        if (!isSuperAdmin && profile?.puskesmas_id) {
          examQuery = examQuery.eq('puskesmas_id', profile.puskesmas_id)
        }

        const { data: examData, error: examError } = await examQuery
        if (examError) throw examError
        setExaminations(examData || [])
        
      } catch (error) {
        console.error('Error fetching patient data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id && profile) {
      fetchPatientData()
    }
  }, [id, profile, isSuperAdmin, supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center bg-white p-12 rounded-xl border border-gray-200 shadow-sm mt-8">
        <h3 className="text-lg font-semibold text-gray-900">Pasien tidak ditemukan</h3>
        <p className="mt-2 text-gray-500">Pasien mungkin telah dihapus atau Anda tidak memiliki akses.</p>
        <div className="mt-6">
          <Link href="/patients">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar
            </Button>
          </Link>
        </div>
      </div>
    )
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

  const formatJenis = (jenis: string) => {
    return jenis.replace('_', ' ')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/patients">
          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>

      <PageHeader 
        title={patient.nama}
        description={`NIK: ${patient.nik}`}
      >
        <Link href={`/examinations/new?patientId=${patient.id}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Pemeriksaan Baru
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserSquare2 className="h-5 w-5 text-gray-500" />
                Profil Pasien
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="divide-y divide-gray-100">
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> TTL
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {formatDate(patient.tanggal_lahir)}
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">J. Kelamin</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Phone className="h-4 w-4" /> No. HP
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {patient.no_hp || '-'}
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Alamat
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {patient.alamat || '-'}
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">BPJS</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {patient.no_bpjs || '-'}
                  </dd>
                </div>
                {patient.nama_ayah || patient.nama_ibu || patient.nama_suami ? (
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                    <dt className="text-sm font-medium text-gray-500">Keluarga</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 space-y-1">
                      {patient.nama_ayah && <div>Ayah: {patient.nama_ayah}</div>}
                      {patient.nama_ibu && <div>Ibu: {patient.nama_ibu}</div>}
                      {patient.nama_suami && <div>Suami: {patient.nama_suami}</div>}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Examination History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Riwayat Pemeriksaan</CardTitle>
              <Badge variant="secondary" className="font-normal">{examinations.length} total</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {examinations.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-sm text-gray-500 mb-4">Belum ada riwayat pemeriksaan.</p>
                  <Link href={`/examinations/new?patientId=${patient.id}`}>
                    <Button variant="outline" size="sm">Tambah Pemeriksaan</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Diagnosa</TableHead>
                        {isSuperAdmin && <TableHead>Puskesmas</TableHead>}
                        <TableHead>Petugas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {examinations.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">
                            {formatDate(exam.tanggal_pemeriksaan)}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getJenisColor(exam.jenis_pemeriksaan)}`}>
                              {formatJenis(exam.jenis_pemeriksaan)}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={exam.diagnosa}>
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
