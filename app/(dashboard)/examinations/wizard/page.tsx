'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Loader2, ArrowLeft, Plus } from 'lucide-react'
import { QuickAddPatientDialog } from '@/components/patients/quick-add-patient-dialog'
import { PatientCombobox } from '@/components/ui/patient-combobox'

// Form Detail Components
import { BusuiDetailForm } from '@/components/examinations/form-detail-busui'
import { BalitaDetailForm } from '@/components/examinations/form-detail-balita'

function WizardContent() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  
  const [patients, setPatients] = useState<any[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)

  // State selection
  const [selectedIbuId, setSelectedIbuId] = useState<string>('')
  const [selectedBalitaId, setSelectedBalitaId] = useState<string>('')

  // Toggle form sections
  const [showBusuiForm, setShowBusuiForm] = useState(true)
  const [showBalitaForm, setShowBalitaForm] = useState(true)

  // Forms
  const busuiForm = useForm({
    defaultValues: {
      tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
      berat_badan: '', tinggi_badan: '', tekanan_darah: '',
      detail: {}
    }
  })

  const balitaForm = useForm({
    defaultValues: {
      tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
      berat_badan: '', tinggi_badan: '', tekanan_darah: '',
      detail: {},
      imunisasi_diberikan: []
    }
  })

  // Load patients
  const loadPatients = async () => {
    try {
      setLoadingPatients(true)
      const { data } = await supabase
        .from('patients')
        .select('id, nama, nik, jenis_kelamin, id_ibu, tanggal_lahir')
        .order('nama')
      setPatients(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingPatients(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [supabase])

  // Helper: hitung usia dalam tahun
  const getAgeYears = (tanggalLahir: string) => {
    const today = new Date()
    const birth = new Date(tanggalLahir)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  // Lists
  // Ibu: perempuan, usia > 12 dan < 60 tahun
  const ibuList = patients.filter(p => {
    if (p.jenis_kelamin !== 'P') return false
    if (!p.tanggal_lahir) return false
    const age = getAgeYears(p.tanggal_lahir)
    return age > 12 && age < 60
  })
  // Balita: usia < 5 tahun (L atau P), opsional filter by id_ibu jika dipilih
  const balitaList = patients.filter(p => {
    if (!p.tanggal_lahir) return false
    const age = getAgeYears(p.tanggal_lahir)
    if (age >= 5) return false
    if (selectedIbuId) return p.id_ibu === selectedIbuId
    return true
  })
  
  // Selected Objects
  const selectedIbuObj = patients.find(p => p.id === selectedIbuId)
  const selectedBalitaObj = patients.find(p => p.id === selectedBalitaId)

  // Auto-select balita if ibu has only 1 child
  useEffect(() => {
    if (selectedIbuId) {
      const children = patients.filter(p => p.id_ibu === selectedIbuId)
      if (children.length === 1 && !selectedBalitaId) {
        setSelectedBalitaId(children[0].id)
      } else if (children.length === 0) {
        setSelectedBalitaId('') // reset if no children
      }
    }
  }, [selectedIbuId, patients])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async () => {
    if (!user?.id) return
    
    // Validate
    if (showBusuiForm && !selectedIbuId) return alert('Pilih Ibu terlebih dahulu')
    if (showBalitaForm && !selectedBalitaId) return alert('Pilih Balita terlebih dahulu')
    if (!showBusuiForm && !showBalitaForm) return alert('Pilih minimal satu form untuk disimpan')

    setIsSubmitting(true)
    try {
      // PROSES BUSUI
      if (showBusuiForm && selectedIbuId) {
        const busuiValues = busuiForm.getValues()
        const { data: examData, error: examError } = await supabase
          .from('examinations')
          .insert({
            patient_id: selectedIbuId,
            user_id: user.id,
            tanggal_pemeriksaan: busuiValues.tanggal_pemeriksaan,
            jenis_pemeriksaan: 'Ibu_Menyusui',
            berat_badan: busuiValues.berat_badan ? parseFloat(busuiValues.berat_badan) : null,
            tinggi_badan: busuiValues.tinggi_badan ? parseFloat(busuiValues.tinggi_badan) : null,
            tekanan_darah: busuiValues.tekanan_darah || null,
          })
          .select('id')
          .single()

        if (examError) throw examError

        const detailValues: Record<string, any> = { ...busuiValues.detail, examination_id: examData.id }
        for (const key in detailValues) if (detailValues[key] === '') detailValues[key] = null
        
        await supabase.from('examination_busui_details').insert(detailValues)
      }

      // PROSES BALITA
      if (showBalitaForm && selectedBalitaId) {
        const balitaValues = balitaForm.getValues()
        console.log('[WIZARD] balitaValues:', balitaValues)
        console.log('[WIZARD] imunisasi_diberikan raw:', balitaValues.imunisasi_diberikan)

        const { data: examData, error: examError } = await supabase
          .from('examinations')
          .insert({
            patient_id: selectedBalitaId,
            user_id: user.id,
            tanggal_pemeriksaan: balitaValues.tanggal_pemeriksaan,
            jenis_pemeriksaan: 'Balita',
            berat_badan: balitaValues.berat_badan ? parseFloat(balitaValues.berat_badan) : null,
            tinggi_badan: balitaValues.tinggi_badan ? parseFloat(balitaValues.tinggi_badan) : null,
          })
          .select('id')
          .single()

        if (examError) throw new Error(`Balita exam error: ${examError.message}`)

        const rawDetail = (balitaValues.detail || {}) as Record<string, any>
        const detailValues: Record<string, any> = { examination_id: examData.id }
        for (const key in rawDetail) {
          detailValues[key] = rawDetail[key] === '' ? null : rawDetail[key]
        }
        
        const { error: detailErr } = await supabase.from('examination_balita_details').insert(detailValues)
        if (detailErr) throw new Error(`Balita detail error: ${detailErr.message}`)

        // Normalisasi ke array (react-hook-form bisa return string jika hanya 1 checkbox)
        const imunisasiRaw = balitaValues.imunisasi_diberikan
        const imunisasiList: string[] = Array.isArray(imunisasiRaw)
          ? imunisasiRaw
          : imunisasiRaw
          ? [imunisasiRaw]
          : []

        console.log('[WIZARD] imunisasiList normalized:', imunisasiList)

        if (imunisasiList.length > 0) {
          const vaxRecords = imunisasiList.map((vaksin: string) => ({
            patient_id: selectedBalitaId,
            examination_id: examData.id,
            jenis_vaksin: vaksin,
            tanggal: balitaValues.tanggal_pemeriksaan,
          }))
          console.log('[WIZARD] inserting vax:', vaxRecords)
          const { error: vaxErr } = await supabase.from('vaccination_records').insert(vaxRecords)
          if (vaxErr) throw new Error(`Vaksinasi error: ${vaxErr.message}`)
        }
      }

      router.push('/examinations')
      router.refresh()
    } catch (error: any) {
      console.error('[WIZARD SUBMIT ERROR]', error)
      alert(`Gagal menyimpan: ${error.message}`)
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
      </div>

      <PageHeader 
        title="Pemeriksaan Terpadu (Ibu & Anak)" 
        description="Pencatatan data kesehatan Ibu Menyusui dan anak Balita secara terintegrasi dalam satu alur."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri - Identitas & Pilihan Form */}
        <div className="space-y-6">
          <Card className="border-emerald-100 shadow-sm shadow-emerald-50">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-50">
                <span className="text-xl">👩‍👧</span>
                <h2 className="font-bold text-lg text-emerald-900">Pemilihan Pasien</h2>
              </div>

              {/* Pilih Ibu */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">1. Pilih Pasien Ibu (Opsional)</label>
                  <QuickAddPatientDialog 
                    defaultJenisKelamin="P" 
                    onSuccess={(id) => { loadPatients().then(() => setSelectedIbuId(id)) }}
                    triggerButton={
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-emerald-600 hover:bg-emerald-50">
                        <Plus className="h-3 w-3 mr-1" /> Quick Add
                      </Button>
                    }
                  />
                </div>
                <PatientCombobox 
                  patients={ibuList}
                  value={selectedIbuId}
                  onChange={setSelectedIbuId}
                  placeholder="-- Lewati / Cari Ibu --"
                  disabled={loadingPatients}
                />
                {selectedIbuObj && (
                  <label className="flex items-center gap-2 mt-3 p-2 bg-white border border-emerald-200 rounded-lg cursor-pointer">
                    <input type="checkbox" checked={showBusuiForm} onChange={e => setShowBusuiForm(e.target.checked)} className="accent-emerald-600 w-4 h-4" />
                    <span className="text-sm font-medium text-emerald-800">Lakukan Pemeriksaan Busui (Ibu)</span>
                  </label>
                )}
              </div>

              {/* Pilih Balita */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">2. Pilih Pasien Balita (Opsional)</label>
                  <QuickAddPatientDialog 
                    defaultIbuId={selectedIbuId} 
                    onSuccess={(id) => { loadPatients().then(() => setSelectedBalitaId(id)) }}
                    triggerButton={
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-sky-600 hover:bg-sky-50">
                        <Plus className="h-3 w-3 mr-1" /> Quick Add
                      </Button>
                    }
                  />
                </div>
                <PatientCombobox 
                  patients={balitaList}
                  value={selectedBalitaId}
                  onChange={setSelectedBalitaId}
                  placeholder="-- Lewati / Cari Balita --"
                  disabled={loadingPatients}
                />
                {selectedIbuId && balitaList.length === 0 && (
                  <p className="text-xs text-amber-600">Ibu ini belum memiliki data balita yang terhubung. Gunakan Quick Add.</p>
                )}
                {selectedBalitaObj && (
                  <label className="flex items-center gap-2 mt-3 p-2 bg-white border border-sky-200 rounded-lg cursor-pointer">
                    <input type="checkbox" checked={showBalitaForm} onChange={e => setShowBalitaForm(e.target.checked)} className="accent-sky-600 w-4 h-4" />
                    <span className="text-sm font-medium text-sky-800">Lakukan Pemeriksaan Balita (Anak)</span>
                  </label>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Submit Action */}
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl">
            <h3 className="font-bold mb-2">Konfirmasi Pemeriksaan</h3>
            <p className="text-sm text-slate-300 mb-6">
              Pastikan Anda telah mengisi form untuk pasien yang dicentang. Sistem akan menyimpan kedua form ini sekaligus secara terintegrasi.
            </p>
            <Button 
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold h-12" 
              onClick={onSubmit} 
              disabled={isSubmitting || (!showBusuiForm && !showBalitaForm) || (showBusuiForm && !selectedIbuId) || (showBalitaForm && !selectedBalitaId)}
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : 'Simpan Pemeriksaan'}
            </Button>
          </div>
        </div>

        {/* Kolom Kanan - Forms */}
        <div className="space-y-6">
          {/* Form Busui */}
          {selectedIbuId && showBusuiForm && (
            <Card className="border-violet-200 shadow-md">
              <div className="bg-violet-600 p-4 rounded-t-xl text-white">
                <h3 className="font-bold flex items-center gap-2">🤱 Form Ibu: {selectedIbuObj?.nama}</h3>
              </div>
              <CardContent className="p-6 bg-white space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tanggal</label>
                    <Input type="date" {...busuiForm.register('tanggal_pemeriksaan')} className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tensi</label>
                    <Input placeholder="120/80" {...busuiForm.register('tekanan_darah')} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Berat (kg)</label>
                    <Input type="number" step="0.1" {...busuiForm.register('berat_badan')} className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tinggi (cm)</label>
                    <Input type="number" step="0.1" {...busuiForm.register('tinggi_badan')} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <BusuiDetailForm register={busuiForm.register} control={busuiForm.control as any} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Balita */}
          {selectedBalitaId && showBalitaForm && (
            <Card className="border-sky-200 shadow-md">
              <div className="bg-sky-600 p-4 rounded-t-xl text-white">
                <h3 className="font-bold flex items-center gap-2">👶 Form Balita: {selectedBalitaObj?.nama}</h3>
              </div>
              <CardContent className="p-6 bg-white space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tanggal</label>
                    <Input type="date" {...balitaForm.register('tanggal_pemeriksaan')} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Berat (kg)</label>
                    <Input type="number" step="0.1" {...balitaForm.register('berat_badan')} className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tinggi (cm)</label>
                    <Input type="number" step="0.1" {...balitaForm.register('tinggi_badan')} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <BalitaDetailForm 
                    register={balitaForm.register} 
                    control={balitaForm.control as any} 
                    tanggalLahirPasien={selectedBalitaObj?.tanggal_lahir} 
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {!showBusuiForm && !showBalitaForm && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <p>Pilih minimal satu pasien dan centang form untuk mulai mengisi.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function WizardPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-emerald-600" /></div>}>
      <WizardContent />
    </Suspense>
  )
}
