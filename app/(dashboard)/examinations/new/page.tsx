'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { examinationSchema, type ExaminationFormValues } from '@/lib/validations/examination.schema'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PatientCombobox } from '@/components/ui/patient-combobox'

// Form Detail Components
import { LansiaDetailForm } from '@/components/examinations/form-detail-lansia'
import { BumilDetailForm } from '@/components/examinations/form-detail-bumil'
import { BusuiDetailForm } from '@/components/examinations/form-detail-busui'
import { BalitaDetailForm } from '@/components/examinations/form-detail-balita'

function ExaminationFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultPatientId = searchParams.get('patientId')
  
  const { profile, user } = useAuth()
  const supabase = createClient()
  const [patients, setPatients] = useState<any[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)

  const form = useForm<any>({
    resolver: zodResolver(examinationSchema),
    defaultValues: {
      patient_id: defaultPatientId || '',
      tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
      jenis_pemeriksaan: undefined,
      berat_badan: '',
      tinggi_badan: '',
      tekanan_darah: '',
      detail: {},
      imunisasi_diberikan: []
    },
  })

  const selectedJenis = form.watch('jenis_pemeriksaan')
  const selectedPatientId = form.watch('patient_id')
  
  // Ambil tanggal lahir pasien untuk perhitungan usia balita
  const selectedPatient = patients.find(p => p.id === selectedPatientId)
  const [recommendationMsg, setRecommendationMsg] = useState('')

  useEffect(() => {
    if (selectedPatient && selectedPatient.tanggal_lahir) {
      const today = new Date()
      const birth = new Date(selectedPatient.tanggal_lahir)
      let ageYears = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        ageYears--
      }
      
      let ageMonths = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth()
      if (today.getDate() < birth.getDate()) {
        ageMonths--
      }

      const jk = selectedPatient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'
      
      let recommendedType: any = null
      
      if (ageYears < 5) {
        recommendedType = 'Balita'
        setRecommendationMsg(`${jk}, Usia ${ageYears} Tahun (${ageMonths} Bulan). Rekomendasi: Balita`)
      } else if (ageYears >= 60) {
        recommendedType = 'Lansia'
        setRecommendationMsg(`${jk}, Usia ${ageYears} Tahun. Rekomendasi: Lansia`)
      } else {
        if (selectedPatient.jenis_kelamin === 'P') {
          setRecommendationMsg(`${jk}, Usia ${ageYears} Tahun. Silakan pilih Ibu Hamil atau Ibu Menyusui (jika relevan).`)
        } else {
          setRecommendationMsg(`${jk}, Usia ${ageYears} Tahun. Tidak ada jenis pemeriksaan khusus.`)
        }
      }

      // Auto select only if the current value is not already a valid choice or we are switching to a new recommended type
      // Actually it's better to always set it if there is a recommendation to save clicks
      if (recommendedType) {
        form.setValue('jenis_pemeriksaan', recommendedType, { shouldValidate: true })
      } else {
        // Jangan auto-reset jika perempuan dewasa karena mereka mungkin sudah memilih bumil/busui
        if (selectedPatient.jenis_kelamin !== 'P') {
          form.setValue('jenis_pemeriksaan', undefined)
        }
      }
    } else {
      setRecommendationMsg('')
    }
  }, [selectedPatient, form])

  useEffect(() => {
    async function loadPatients() {
      try {
        const { data } = await supabase
          .from('patients')
          .select('id, nama, nik, tanggal_lahir, jenis_kelamin')
          .order('nama')
          
        setPatients(data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingPatients(false)
      }
    }
    if (profile) loadPatients()
  }, [profile, supabase])

  const onSubmit = async (values: any) => {
    if (!user?.id) return

    console.log('[SUBMIT] Form values:', values)
    console.log('[SUBMIT] imunisasi_diberikan:', values.imunisasi_diberikan)

    try {
      // 1. Insert main examination
      const { data: examData, error: examError } = await supabase
        .from('examinations')
        .insert({
          patient_id: values.patient_id,
          user_id: user.id,
          tanggal_pemeriksaan: values.tanggal_pemeriksaan,
          jenis_pemeriksaan: values.jenis_pemeriksaan,
          berat_badan: values.berat_badan ? parseFloat(values.berat_badan) : null,
          tinggi_badan: values.tinggi_badan ? parseFloat(values.tinggi_badan) : null,
          tekanan_darah: values.tekanan_darah || null,
        })
        .select('id')
        .single()

      if (examError) throw examError
      const examId = examData.id
      console.log('[SUBMIT] examId created:', examId)

      // 2. Insert detail based on jenis
      const rawDetail = values.detail || {}
      const detailValues: Record<string, any> = { examination_id: examId }
      for (const key in rawDetail) {
        detailValues[key] = rawDetail[key] === '' ? null : rawDetail[key]
      }
      
      let detailTable = ''
      switch(values.jenis_pemeriksaan) {
        case 'Balita': detailTable = 'examination_balita_details'; break;
        case 'Ibu_Hamil': detailTable = 'examination_bumil_details'; break;
        case 'Ibu_Menyusui': detailTable = 'examination_busui_details'; break;
        case 'Lansia': detailTable = 'examination_lansia_details'; break;
      }

      if (detailTable) {
        console.log('[SUBMIT] Inserting detail to:', detailTable, detailValues)
        const { error: detailError } = await supabase
          .from(detailTable)
          .insert(detailValues)
          
        if (detailError) throw new Error(`Detail error [${detailTable}]: ${detailError.message}`)
      }

      // 3. Insert vaccination records for Balita
      const imunisasiList: string[] = Array.isArray(values.imunisasi_diberikan)
        ? values.imunisasi_diberikan
        : values.imunisasi_diberikan
        ? [values.imunisasi_diberikan]
        : []

      console.log('[SUBMIT] imunisasiList to insert:', imunisasiList)

      if (values.jenis_pemeriksaan === 'Balita' && imunisasiList.length > 0) {
        const vaccinationRecords = imunisasiList.map((vaksin: string) => ({
          patient_id: values.patient_id,
          examination_id: examId,
          jenis_vaksin: vaksin,
          tanggal: values.tanggal_pemeriksaan,
        }))

        console.log('[SUBMIT] Inserting vaccinations:', vaccinationRecords)
        const { error: vaxError } = await supabase
          .from('vaccination_records')
          .insert(vaccinationRecords)
        
        if (vaxError) throw new Error(`Vaksinasi error: ${vaxError.message}`)
      }

      router.push('/examinations')
      router.refresh()
    } catch (error: any) {
      console.error('[SUBMIT ERROR]', error)
      alert(`Gagal menyimpan: ${error.message}`)
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
      </div>

      <PageHeader title="Pemeriksaan Baru" />

      <Card className="max-w-4xl">
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
              <div>
                <label className="block text-sm font-medium mb-1">Pasien <span className="text-red-500">*</span></label>
                {loadingPatients ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500 border rounded-lg px-3 py-2 bg-slate-50">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading Pasien...
                  </div>
                ) : (
                  <div>
                    <PatientCombobox 
                      patients={patients}
                      value={form.watch('patient_id')}
                      onChange={(val) => form.setValue('patient_id', val, { shouldValidate: true })}
                      placeholder="Cari NIK / Nama Pasien..."
                      disabled={!!defaultPatientId}
                      error={form.formState.errors.patient_id?.message as string | undefined}
                    />
                    {recommendationMsg && (
                      <div className="mt-2 text-xs font-medium text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-start gap-1.5">
                        <span className="text-emerald-500">ℹ️</span>
                        <span>{recommendationMsg}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Pemeriksaan <span className="text-red-500">*</span></label>
                <Input type="date" {...form.register('tanggal_pemeriksaan')} />
                {form.formState.errors.tanggal_pemeriksaan && <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.tanggal_pemeriksaan.message)}</p>}
              </div>
            </div>

            <div className="pb-6 border-b border-slate-200">
              <label className="block text-sm font-medium mb-3">Jenis Pemeriksaan <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { value: 'Balita', label: 'Balita', emoji: '👶' },
                  { value: 'Ibu_Hamil', label: 'Ibu Hamil', emoji: '🤰' },
                  { value: 'Ibu_Menyusui', label: 'Ibu Menyusui', emoji: '🤱' },
                  { value: 'Lansia', label: 'Lansia', emoji: '👵' }
                ].map((jenis) => (
                  <label key={jenis.value} className={`
                    border-2 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all
                    ${selectedJenis === jenis.value 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                      : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50 text-slate-700'}
                  `}>
                    <input type="radio" value={jenis.value} {...form.register('jenis_pemeriksaan')} className="sr-only" />
                    <span className="text-2xl mb-2">{jenis.emoji}</span>
                    <span className="font-bold text-sm text-center">{jenis.label}</span>
                  </label>
                ))}
              </div>
              {form.formState.errors.jenis_pemeriksaan && <p className="text-sm text-red-500 mt-2">{String(form.formState.errors.jenis_pemeriksaan.message)}</p>}
            </div>

            {selectedJenis && (
              <div className="space-y-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📏</span>
                  <h3 className="text-base font-bold text-slate-800">Tanda Vital & Umum</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Berat Badan</label>
                    <div className="flex items-center gap-2">
                      <Input type="number" step="0.1" placeholder="0" className="flex-1" {...form.register('berat_badan')} />
                      <span className="text-xs text-slate-500 font-medium">kg</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Tinggi Badan</label>
                    <div className="flex items-center gap-2">
                      <Input type="number" step="0.1" placeholder="0" className="flex-1" {...form.register('tinggi_badan')} />
                      <span className="text-xs text-slate-500 font-medium">cm</span>
                    </div>
                  </div>
                  {selectedJenis !== 'Balita' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Tekanan Darah</label>
                      <Input placeholder="Contoh: 120/80" {...form.register('tekanan_darah')} />
                    </div>
                  )}
                </div>

                </div>
            )}

            {/* Spesifik Detail Component */}
            {selectedJenis === 'Balita' && <BalitaDetailForm register={form.register} control={form.control} tanggalLahirPasien={selectedPatient?.tanggal_lahir} />}
            {selectedJenis === 'Ibu_Hamil' && <BumilDetailForm register={form.register} control={form.control} />}
            {selectedJenis === 'Ibu_Menyusui' && <BusuiDetailForm register={form.register} control={form.control} />}
            {selectedJenis === 'Lansia' && <LansiaDetailForm register={form.register} control={form.control} />}

            <div className="pt-5 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
              <Button type="submit" disabled={form.formState.isSubmitting || !selectedJenis}>
                {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : 'Simpan Pemeriksaan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default function NewExaminationPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-emerald-600" /></div>}>
      <ExaminationFormContent />
    </Suspense>
  )
}
