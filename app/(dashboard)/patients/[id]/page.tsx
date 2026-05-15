'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Patient, hitungUsiaBalita, hitungUsiaKehamilan } from '@/types'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Plus, Loader2, Calendar, Phone, MapPin, UserSquare2, Syringe, Activity, X, Eye, Pencil, Trash2 } from 'lucide-react'
import { deleteExamination, deletePatient } from '@/lib/actions/data'

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [examinations, setExaminations] = useState<any[]>([])
  const [vaccinations, setVaccinations] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'riwayat' | 'imunisasi'>('riwayat')
  const [selectedExam, setSelectedExam] = useState<any | null>(null)
  
  const { profile } = useAuth()
  const supabase = createClient()
  const router = useRouter()
  const [deletingPatient, setDeletingPatient] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null)
  const [confirmDeleteExam, setConfirmDeleteExam] = useState<any | null>(null)

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

        // 2. Fetch examinations with ALL details
        const { data: examData, error: examError } = await supabase
          .from('examinations')
          .select(`
            *,
            profiles:user_id(nama),
            examination_bumil_details(*),
            examination_balita_details(*),
            examination_busui_details(*),
            examination_lansia_details(*)
          `)
          .eq('patient_id', id)
          .order('tanggal_pemeriksaan', { ascending: false })

        if (examError) throw examError
        setExaminations(examData || [])
        
        // 3. Fetch vaccinations
        const { data: vaxData, error: vaxError } = await supabase
          .from('vaccination_records')
          .select('*')
          .eq('patient_id', id)
          .order('tanggal', { ascending: false })
          
        if (vaxError) throw vaxError
        setVaccinations(vaxData || [])

      } catch (error) {
        console.error('Error fetching patient data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id && profile) {
      fetchPatientData()
    }
  }, [id, profile, supabase])

  const handleDeletePatient = async () => {
    setDeletingPatient(true)
    try {
      const result = await deletePatient(id)
      if (!result.success) throw new Error(result.error)
      router.push('/patients')
      router.refresh()
    } catch (error: any) {
      alert(`Gagal menghapus pasien: ${error.message}`)
    } finally {
      setDeletingPatient(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleDeleteExam = async (exam: any) => {
    setDeletingExamId(exam.id)
    try {
      const result = await deleteExamination(exam.id)
      if (!result.success) throw new Error(result.error)
      setExaminations(prev => prev.filter(e => e.id !== exam.id))
      setConfirmDeleteExam(null)
      if (selectedExam?.id === exam.id) setSelectedExam(null)
    } catch (error: any) {
      alert(`Gagal menghapus pemeriksaan: ${error.message}`)
    } finally {
      setDeletingExamId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
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
      case 'Balita': return 'bg-sky-100 text-sky-800'
      case 'Ibu_Hamil': return 'bg-pink-100 text-pink-800'
      case 'Ibu_Menyusui': return 'bg-violet-100 text-violet-800'
      case 'Lansia': return 'bg-amber-100 text-amber-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getExamResult = (exam: any) => {
    let result = []
    
    switch(exam.jenis_pemeriksaan) {
      case 'Balita':
        const balita = Array.isArray(exam.examination_balita_details) ? exam.examination_balita_details[0] : exam.examination_balita_details
        if (balita?.status_gizi) result.push(`Gizi: ${balita.status_gizi}`)
        
        const vaxs = vaccinations.filter(v => v.examination_id === exam.id)
        if (vaxs.length > 0) {
          result.push(`Imunisasi: ${vaxs.map(v => v.jenis_vaksin).join(', ')}`)
        }
        break;
      case 'Lansia':
        const lansia = Array.isArray(exam.examination_lansia_details) ? exam.examination_lansia_details[0] : exam.examination_lansia_details
        if (lansia?.diagnosa) result.push(`Dx: ${lansia.diagnosa}`)
        if (lansia?.gula_darah) result.push(`Gula: ${lansia.gula_darah}`)
        if (lansia?.asam_urat) result.push(`Asam Urat: ${lansia.asam_urat}`)
        break;
      case 'Ibu_Hamil':
        const bumil = Array.isArray(exam.examination_bumil_details) ? exam.examination_bumil_details[0] : exam.examination_bumil_details
        if (bumil?.tanda_bahaya) result.push(`Tanda Bahaya: ${bumil.tanda_bahaya}`)
        if (bumil?.imunisasi_tt1) result.push('Suntik TT1')
        if (bumil?.imunisasi_tt2) result.push('Suntik TT2')
        break;
      case 'Ibu_Menyusui':
        const busui = Array.isArray(exam.examination_busui_details) ? exam.examination_busui_details[0] : exam.examination_busui_details
        if (busui?.kondisi_asi) result.push(`ASI: ${busui.kondisi_asi.replace('_', ' ')}`)
        break;
    }
    
    return result.length > 0 ? result.join(' | ') : '-'
  }

  const renderExamDetailContent = (exam: any) => {
    switch(exam.jenis_pemeriksaan) {
      case 'Balita':
        const balita = Array.isArray(exam.examination_balita_details) ? exam.examination_balita_details[0] : exam.examination_balita_details
        const vaxs = vaccinations.filter(v => v.examination_id === exam.id)
        return (
          <div className="space-y-4">
            {balita?.status_gizi && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Status Gizi</p>
                <p className="text-sm font-medium text-slate-800">{balita.status_gizi}</p>
              </div>
            )}
            {vaxs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Vaksinasi Diberikan</p>
                <div className="flex flex-wrap gap-2">
                  {vaxs.map(v => (
                    <span key={v.id} className="px-2 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-md">{v.jenis_vaksin.replace('_', ' ')}</span>
                  ))}
                </div>
              </div>
            )}
            {balita?.catatan && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Catatan Tambahan</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{balita.catatan}</p>
              </div>
            )}
            {!balita?.status_gizi && vaxs.length === 0 && !balita?.catatan && (
              <p className="text-sm text-slate-500 italic">Tidak ada detail tambahan yang dicatat.</p>
            )}
          </div>
        )
      case 'Ibu_Hamil':
        const bumil = Array.isArray(exam.examination_bumil_details) ? exam.examination_bumil_details[0] : exam.examination_bumil_details
        const usiaKandunganSaatPemeriksaan = hitungUsiaKehamilan(bumil?.hpht, exam.tanggal_pemeriksaan);
        const bulanKandungan = usiaKandunganSaatPemeriksaan ? Math.floor(usiaKandunganSaatPemeriksaan.minggu / 4) : null
        const sisaMingguKandungan = usiaKandunganSaatPemeriksaan ? usiaKandunganSaatPemeriksaan.minggu % 4 : null
        return (
          <div className="space-y-4">
            {bumil?.hpht && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-0.5">HPHT</p>
                  <p className="text-sm font-medium text-slate-800">{formatDate(bumil.hpht)}</p>
                </div>
                {usiaKandunganSaatPemeriksaan && (
                  <div className="bg-pink-100/50 px-3 py-1.5 rounded-lg border border-pink-100 text-right">
                    <p className="text-[10px] font-bold text-pink-600 uppercase tracking-wide">Usia Kandungan Saat Diperiksa</p>
                    <p className="text-sm font-bold text-pink-900">
                      {bulanKandungan} Bulan {sisaMingguKandungan} Minggu
                    </p>
                    <p className="text-[10px] text-pink-400">({usiaKandunganSaatPemeriksaan.minggu} minggu {usiaKandunganSaatPemeriksaan.hari} hari)</p>
                  </div>
                )}
              </div>
            )}
            {bumil?.tanda_bahaya && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Tanda Bahaya</p>
                <p className="text-sm font-medium text-rose-600 bg-rose-50 p-2 rounded-md">{bumil.tanda_bahaya}</p>
              </div>
            )}

           {(bumil?.imunisasi_tt1 || bumil?.imunisasi_tt2) && (
  <div>
    <p className="text-xs font-semibold text-slate-500 mb-2">Imunisasi TT</p>
    <div className="space-y-2">

      {bumil.imunisasi_tt1 && bumil.tanggal_tt1 && (
        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-800 font-medium">
            ✓ TT1 ({formatDate(bumil.tanggal_tt1)})
          </p>

          {hitungUsiaKehamilan(
            bumil.hpht,
            bumil.tanggal_tt1
          ) && (
            <span className="text-xs font-semibold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-md">
              Usia {
                hitungUsiaKehamilan(
                  bumil.hpht,
                  bumil.tanggal_tt1
                )?.minggu
              } mgg
            </span>
          )}
        </div>
      )}

    
  
            {(bumil?.imunisasi_tt1 || bumil?.imunisasi_tt2) && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Imunisasi TT</p>
                <div className="space-y-2">
                  {bumil.imunisasi_tt1 && (() => {
                    const tgl = bumil.tanggal_tt1 || exam.tanggal_pemeriksaan
                    const u = hitungUsiaKehamilan(bumil.hpht, tgl)
                    const bl = u ? Math.floor(u.minggu / 4) : null
                    const sm = u ? u.minggu % 4 : null
                    return (
                      <div className="flex justify-between items-center bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                        <p className="text-sm text-slate-800 font-medium">✓ TT1 ({formatDate(tgl)})</p>
                        {u && (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Usia kandungan: {bl} bln {sm} mgg
                          </span>
                        )}
                      </div>
                    )
                  })()}
                  {bumil.imunisasi_tt2 && (() => {
                    const tgl = bumil.tanggal_tt2 || exam.tanggal_pemeriksaan
                    const u = hitungUsiaKehamilan(bumil.hpht, tgl)
                    const bl = u ? Math.floor(u.minggu / 4) : null
                    const sm = u ? u.minggu % 4 : null
                    return (
                      <div className="flex justify-between items-center bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                        <p className="text-sm text-slate-800 font-medium">✓ TT2 ({formatDate(tgl)})</p>
                        {u && (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Usia kandungan: {bl} bln {sm} mgg
                          </span>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            
            {/* Medis Bumil */}
            {bumil?.riwayat_penyakit && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Riwayat Penyakit</p>
                <p className="text-sm font-medium text-slate-800">{bumil.riwayat_penyakit}</p>
              </div>
            )}
            {bumil?.keluhan && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Keluhan</p>
                <p className="text-sm font-medium text-slate-800">{bumil.keluhan}</p>
              </div>
            )}
            {bumil?.diagnosa && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Diagnosa / Observasi</p>
                <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded-md border border-slate-200">{bumil.diagnosa}</p>
              </div>
            )}
            {bumil?.terapi && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Terapi / Tindakan</p>
                <p className="text-sm font-medium text-emerald-700 bg-emerald-50 p-2 rounded-md border border-emerald-100">{bumil.terapi}</p>
              </div>
            )}

            {!bumil?.hpht && !bumil?.tanda_bahaya && !bumil?.imunisasi_tt1 && !bumil?.imunisasi_tt2 && !bumil?.keluhan && !bumil?.diagnosa && !bumil?.terapi && !bumil?.riwayat_penyakit && (
              <p className="text-sm text-slate-500 italic">Tidak ada detail tambahan yang dicatat.</p>
            )}
          </div>
        )
      case 'Lansia':
        const lansia = Array.isArray(exam.examination_lansia_details) ? exam.examination_lansia_details[0] : exam.examination_lansia_details
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {lansia?.gula_darah && (
                <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">Gula Darah</span>
                  <span className="text-sm font-bold">{lansia.gula_darah}</span>
                </div>
              )}
              {lansia?.kolesterol && (
                <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                  <span className="text-[10px] uppercase font-bold text-rose-600 block">Kolesterol</span>
                  <span className="text-sm font-bold">{lansia.kolesterol}</span>
                </div>
              )}
              {lansia?.asam_urat && (
                <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                  <span className="text-[10px] uppercase font-bold text-purple-600 block">Asam Urat</span>
                  <span className="text-sm font-bold">{lansia.asam_urat}</span>
                </div>
              )}
            </div>
            {lansia?.keluhan && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Keluhan</p>
                <p className="text-sm font-medium text-slate-800">{lansia.keluhan}</p>
              </div>
            )}
            {lansia?.riwayat_penyakit && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Riwayat Penyakit</p>
                <p className="text-sm font-medium text-slate-800">{lansia.riwayat_penyakit}</p>
              </div>
            )}
            {lansia?.diagnosa && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Diagnosa / Observasi</p>
                <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded-md border border-slate-200">{lansia.diagnosa}</p>
              </div>
            )}
            {lansia?.terapi && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Terapi / Tindakan</p>
                <p className="text-sm font-medium text-emerald-700 bg-emerald-50 p-2 rounded-md border border-emerald-100">{lansia.terapi}</p>
              </div>
            )}
            {lansia?.keterangan && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Keterangan Tambahan</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{lansia.keterangan}</p>
              </div>
            )}
          </div>
        )
      case 'Ibu_Menyusui':
        const busui = Array.isArray(exam.examination_busui_details) ? exam.examination_busui_details[0] : exam.examination_busui_details
        return (
          <div className="space-y-4">
            {busui?.jenis_persalinan && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Jenis Persalinan</p>
                <p className="text-sm font-medium text-slate-800">{busui.jenis_persalinan}</p>
              </div>
            )}
            {busui?.kondisi_asi && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Kondisi ASI</p>
                <p className="text-sm font-medium text-slate-800">{busui.kondisi_asi.replace('_', ' ')}</p>
                {busui.kondisi_asi === 'lainnya' && busui.kondisi_asi_kustom && (
                  <p className="text-sm text-slate-500 mt-1">Detail: {busui.kondisi_asi_kustom}</p>
                )}
              </div>
            )}
            {/* Medis Busui */}
            {busui?.keluhan && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Keluhan</p>
                <p className="text-sm font-medium text-slate-800">{busui.keluhan}</p>
              </div>
            )}
            {busui?.diagnosa && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Diagnosa / Observasi</p>
                <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded-md border border-slate-200">{busui.diagnosa}</p>
              </div>
            )}
            {busui?.terapi && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Terapi / Tindakan</p>
                <p className="text-sm font-medium text-emerald-700 bg-emerald-50 p-2 rounded-md border border-emerald-100">{busui.terapi}</p>
              </div>
            )}

            {busui?.catatan && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Catatan</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{busui.catatan}</p>
              </div>
            )}
          </div>
        )
      default:
        return <p className="text-sm text-slate-500 italic">Tidak ada detail khusus untuk jenis pemeriksaan ini.</p>
    }
  }

  const hasImunisasiTab = vaccinations.length > 0 || examinations.some(e => e.jenis_pemeriksaan === 'Balita' || e.jenis_pemeriksaan === 'Ibu_Hamil')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/patients">
          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent text-gray-500 hover:text-emerald-700 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar
          </Button>
        </Link>
      </div>

      <PageHeader 
        title={patient.nama}
        description={`NIK: ${patient.nik} • Pasien Posyandu Melati`}
      >
        <div className="flex gap-2">
          <Link href={`/examinations/wizard?patientId=${patient.id}`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
              <span className="mr-2 text-lg">👩‍👧</span>
              Pemeriksaan Terpadu (Ibu & Anak)
            </Button>
          </Link>
          <Link href={`/examinations/new?patientId=${patient.id}`}>
            <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Plus className="mr-2 h-4 w-4" />
              Pemeriksaan Individu
            </Button>
          </Link>
          <Link href={`/patients/${patient.id}/edit`}>
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Data
            </Button>
          </Link>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="">
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <UserSquare2 className="h-5 w-5 text-emerald-600" />
                Profil Pasien
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="divide-y divide-slate-100">
                <div className="px-5 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> TTL
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900 sm:col-span-2 sm:mt-0">
                    {formatDate(patient.tanggal_lahir)}
                  </dd>
                </div>
                <div className="px-5 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-slate-500">J. Kelamin</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900 sm:col-span-2 sm:mt-0">
                    {patient.jenis_kelamin === 'L' ? 'Laki-laki 👦' : 'Perempuan 👧'}
                  </dd>
                </div>
                <div className="px-5 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Phone className="h-4 w-4" /> No. HP
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900 sm:col-span-2 sm:mt-0">
                    {patient.no_hp || '-'}
                  </dd>
                </div>
                <div className="px-5 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Alamat
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900 sm:col-span-2 sm:mt-0 leading-relaxed">
                    {patient.alamat || '-'}
                  </dd>
                </div>
                <div className="px-5 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-slate-500">BPJS</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900 sm:col-span-2 sm:mt-0">
                    {patient.no_bpjs || '-'}
                  </dd>
                </div>
                {patient.nama_ayah || patient.nama_ibu || patient.nama_suami ? (
                  <div className="px-5 py-4 sm:grid sm:grid-cols-3 sm:gap-4 bg-emerald-50/50">
                    <dt className="text-sm font-medium text-emerald-800">Keluarga</dt>
                    <dd className="mt-1 text-sm font-semibold text-emerald-900 sm:col-span-2 sm:mt-0 space-y-1.5">
                      {patient.nama_ayah && <div className="flex items-center justify-between"><span className="text-emerald-700 font-medium text-xs">Ayah</span> {patient.nama_ayah}</div>}
                      {patient.nama_ibu && <div className="flex items-center justify-between"><span className="text-emerald-700 font-medium text-xs">Ibu</span> {patient.nama_ibu}</div>}
                      {patient.nama_suami && <div className="flex items-center justify-between"><span className="text-emerald-700 font-medium text-xs">Suami</span> {patient.nama_suami}</div>}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* History Area */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Custom Tabs */}
          {hasImunisasiTab && (
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('riwayat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'riwayat' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <Activity className="w-4 h-4" /> Riwayat Pemeriksaan
              </button>
              <button
                onClick={() => setActiveTab('imunisasi')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'imunisasi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <Syringe className="w-4 h-4" /> Status Imunisasi (Balita / TT)
              </button>
            </div>
          )}

          {activeTab === 'riwayat' && (
            <Card className="border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-slate-800">Riwayat Pemeriksaan</CardTitle>
                <Badge variant="secondary" className="font-bold bg-slate-100 text-slate-600">{examinations.length} Kunjungan</Badge>
              </CardHeader>
              <CardContent className="p-0">
                {examinations.length === 0 ? (
                  <div className="text-center p-12">
                    <p className="text-sm text-slate-500 mb-4">Belum ada riwayat pemeriksaan.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50">
                          <TableHead className="font-semibold text-slate-700">Tanggal</TableHead>
                          <TableHead className="font-semibold text-slate-700">Kategori</TableHead>
                          <TableHead className="font-semibold text-slate-700">Hasil / Tindakan</TableHead>
                          <TableHead className="font-semibold text-slate-700">Petugas</TableHead>
                          <TableHead className="w-[110px] text-center font-semibold text-slate-700">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {examinations.map((exam) => {
                          const result = getExamResult(exam);
                          return (
                          <TableRow key={exam.id} className="hover:bg-slate-50/50">
                            <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                              {formatDate(exam.tanggal_pemeriksaan)}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${getJenisColor(exam.jenis_pemeriksaan)}`}>
                                {exam.jenis_pemeriksaan.replace('_', ' ')}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-slate-600" title={result}>
                              {result}
                            </TableCell>
                            <TableCell className="text-sm text-slate-500">
                              {exam.profiles?.nama}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setSelectedExam(exam)} 
                                  className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full flex items-center justify-center"
                                  title="Lihat Detail"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setConfirmDeleteExam(exam)}
                                  disabled={deletingExamId === exam.id}
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full flex items-center justify-center"
                                  title="Hapus Pemeriksaan"
                                >
                                  {deletingExamId === exam.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'imunisasi' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Balita Vaccinations */}
              {vaccinations.length > 0 && (
                <Card className="border-sky-100 shadow-sm border-t-4 border-t-sky-500">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      <span className="text-2xl">👶</span> Riwayat Imunisasi Balita
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-sky-50/30">
                          <TableHead className="font-semibold text-slate-700">Tanggal Diberikan</TableHead>
                          <TableHead className="font-semibold text-slate-700">Jenis Vaksin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vaccinations.map((vax) => {
                          const usiaSaatVaksin = hitungUsiaBalita(patient.tanggal_lahir, vax.tanggal);
                          return (
                          <TableRow key={vax.id}>
                            <TableCell className="font-medium text-slate-900">
                              {formatDate(vax.tanggal)}
                              <div className="text-xs font-normal text-slate-500 mt-0.5">
                                Usia saat diberi: {usiaSaatVaksin.bulan} bln {usiaSaatVaksin.hari} hr
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="px-2.5 py-1 bg-sky-100 text-sky-800 font-bold text-xs rounded-lg uppercase tracking-wider">
                                {vax.jenis_vaksin.replace('_', ' ')}
                              </span>
                            </TableCell>
                          </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Bumil TT Status */}
              {examinations.some(e => e.jenis_pemeriksaan === 'Ibu_Hamil') && (
                <Card className="border-pink-100 shadow-sm border-t-4 border-t-pink-500">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      <span className="text-2xl">🤰</span> Status Imunisasi TT (Ibu Hamil)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {examinations.filter(e => e.jenis_pemeriksaan === 'Ibu_Hamil' && (Array.isArray(e.examination_bumil_details) ? e.examination_bumil_details[0] : e.examination_bumil_details)).map(exam => {
                        const ttDetails = Array.isArray(exam.examination_bumil_details) ? exam.examination_bumil_details[0] : exam.examination_bumil_details
                        if (!ttDetails.imunisasi_tt1 && !ttDetails.imunisasi_tt2) return null
                        
                        const usiaPemeriksaan = hitungUsiaKehamilan(ttDetails.hpht, exam.tanggal_pemeriksaan);
                        
                        return (
                          <div key={exam.id} className="p-4 bg-pink-50/50 rounded-xl border border-pink-100">
                            <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
                              <p className="text-xs font-bold text-pink-700">Pemeriksaan: {formatDate(exam.tanggal_pemeriksaan)}</p>
                              {usiaPemeriksaan && (
                                <span className="text-[10px] font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-md">
                                  Kandungan: {usiaPemeriksaan.minggu} mgg {usiaPemeriksaan.hari} hr
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {ttDetails.imunisasi_tt1 && (() => {
                                const tglTT1 = ttDetails.tanggal_tt1 || exam.tanggal_pemeriksaan;
                                const usiaTT1 = hitungUsiaKehamilan(ttDetails.hpht, tglTT1);
                                const bl1 = usiaTT1 ? Math.floor(usiaTT1.minggu / 4) : null
                                const sm1 = usiaTT1 ? usiaTT1.minggu % 4 : null
                                return (
                                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold z-10">✓</div>
                                  <div className="z-10">
                                    <p className="text-sm font-bold text-slate-800">Imunisasi TT1</p>
                                    <p className="text-xs text-slate-500">Diberikan: {formatDate(tglTT1)}</p>
                                    {usiaTT1 && <p className="text-xs font-semibold text-pink-600 mt-0.5">Usia Kandungan: {bl1} bulan {sm1} minggu ({usiaTT1.minggu} mgg)</p>}
                                  </div>
                                </div>
                                );
                              })()}
                              {ttDetails.imunisasi_tt2 && (() => {
                                const tglTT2 = ttDetails.tanggal_tt2 || exam.tanggal_pemeriksaan;
                                const usiaTT2 = hitungUsiaKehamilan(ttDetails.hpht, tglTT2);
                                const bl2 = usiaTT2 ? Math.floor(usiaTT2.minggu / 4) : null
                                const sm2 = usiaTT2 ? usiaTT2.minggu % 4 : null
                                return (
                                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold z-10">✓</div>
                                  <div className="z-10">
                                    <p className="text-sm font-bold text-slate-800">Imunisasi TT2</p>
                                    <p className="text-xs text-slate-500">Diberikan: {formatDate(tglTT2)}</p>
                                    {usiaTT2 && <p className="text-xs font-semibold text-pink-600 mt-0.5">Usia Kandungan: {bl2} bulan {sm2} minggu ({usiaTT2.minggu} mgg)</p>}
                                  </div>
                                </div>
                                );
                              })()}
                            </div>
                          </div>
                        )
                      })}
                      
                      {!examinations.some(e => {
                         if (e.jenis_pemeriksaan !== 'Ibu_Hamil') return false;
                         const d = Array.isArray(e.examination_bumil_details) ? e.examination_bumil_details[0] : e.examination_bumil_details;
                         return d?.imunisasi_tt1 || d?.imunisasi_tt2;
                      }) && (
                        <p className="text-sm text-slate-500 text-center py-4">Belum ada riwayat Imunisasi TT yang dicatat.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {vaccinations.length === 0 && !examinations.some(e => e.jenis_pemeriksaan === 'Ibu_Hamil') && (
                <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-500">Tidak ada riwayat imunisasi yang relevan untuk pasien ini.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Modal Detail Pemeriksaan */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Detail Pemeriksaan</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {formatDate(selectedExam.tanggal_pemeriksaan)} • {selectedExam.jenis_pemeriksaan.replace('_', ' ')}
                </p>
              </div>
              <button onClick={() => setSelectedExam(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Data Umum TTV */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">Berat Badan</span>
                  <span className="text-sm font-bold text-slate-800">{selectedExam.berat_badan ? `${selectedExam.berat_badan} kg` : '-'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">Tinggi Badan</span>
                  <span className="text-sm font-bold text-slate-800">{selectedExam.tinggi_badan ? `${selectedExam.tinggi_badan} cm` : '-'}</span>
                </div>
                {selectedExam.tekanan_darah && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                    <span className="text-xs font-semibold text-slate-500 block mb-1">Tekanan Darah</span>
                    <span className="text-sm font-bold text-slate-800">{selectedExam.tekanan_darah}</span>
                  </div>
                )}
              </div>

              {/* Data Detail Spesifik */}
              <div className="pt-4 border-t border-slate-100">
                {renderExamDetailContent(selectedExam)}
              </div>
              
              {/* Info Petugas */}
              <div className="pt-4 mt-2">
                <p className="text-xs text-slate-400 text-center">
                  Diperiksa oleh: <span className="font-semibold text-slate-500">{selectedExam.profiles?.nama || '-'}</span>
                </p>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button onClick={() => setSelectedExam(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pasien */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Hapus Pasien?</h3>
                  <p className="text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 bg-red-50 border border-red-100 rounded-lg p-3">
                Anda akan menghapus data pasien <strong>{patient.nama}</strong> (NIK: {patient.nik}) beserta seluruh riwayat pemeriksaan dan imunisasi yang terkait.
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deletingPatient}>Batal</Button>
              <Button variant="danger" onClick={handleDeletePatient} disabled={deletingPatient}>
                {deletingPatient ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Ya, Hapus Pasien
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pemeriksaan */}
      {confirmDeleteExam && (
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
                Hapus data pemeriksaan <strong>{confirmDeleteExam.jenis_pemeriksaan?.replace('_', ' ')}</strong> tanggal <strong>{formatDate(confirmDeleteExam.tanggal_pemeriksaan)}</strong>?
                <br /><span className="text-xs text-red-500 mt-1 block">Seluruh detail dan catatan pemeriksaan ini akan dihapus permanen.</span>
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDeleteExam(null)} disabled={!!deletingExamId}>Batal</Button>
              <Button variant="danger" onClick={() => handleDeleteExam(confirmDeleteExam)} disabled={!!deletingExamId}>
                {deletingExamId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Ya, Hapus Pemeriksaan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
