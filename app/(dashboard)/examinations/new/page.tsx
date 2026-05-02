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

// Detail Components
function BalitaDetails({ register }: { register: any }) {
  const immunizations = ['bcg', 'dpt1', 'dpt2', 'dpt3', 'polio1', 'polio2', 'polio3', 'hb1', 'hb2', 'hb3', 'campak']
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Detail Pemeriksaan Balita</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm mb-1">Ket NTOB</label><Input {...register('detail.ket_ntob')} /></div>
        <div><label className="block text-sm mb-1">Vitamin A</label><Input {...register('detail.vit_a')} /></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <label className="flex items-center space-x-2"><input type="checkbox" {...register('detail.is_bgm')} /> <span>BGM</span></label>
        <label className="flex items-center space-x-2"><input type="checkbox" {...register('detail.is_bgt')} /> <span>BGT</span></label>
        <label className="flex items-center space-x-2"><input type="checkbox" {...register('detail.hb_less_7')} /> <span>HB {'<'} 7</span></label>
        <label className="flex items-center space-x-2"><input type="checkbox" {...register('detail.hb_more_7')} /> <span>HB {'>='} 7</span></label>
      </div>
      <div>
        <label className="block text-sm mb-2 font-medium">Imunisasi Diberikan Kunjungan Ini:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {immunizations.map(imun => (
            <label key={imun} className="flex items-center space-x-2">
              <input type="checkbox" {...register(`detail.imun_${imun}`)} /> 
              <span className="uppercase">{imun}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function BumilDetails({ register }: { register: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Detail Pemeriksaan Ibu Hamil</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm mb-1">HPHT</label><Input type="date" {...register('detail.hpht')} /></div>
        <div><label className="block text-sm mb-1">Tafsiran Persalinan (TP)</label><Input type="date" {...register('detail.tp')} /></div>
        <div><label className="block text-sm mb-1">GPA</label><Input {...register('detail.gpa')} placeholder="G... P... A..." /></div>
        <div><label className="block text-sm mb-1">LILA (cm)</label><Input type="number" step="0.1" {...register('detail.lila_cm')} /></div>
        <div className="sm:col-span-2"><label className="block text-sm mb-1">Tanda Bahaya</label><Input {...register('detail.tanda_bahaya')} /></div>
        <div className="sm:col-span-2"><label className="block text-sm mb-1">Obat yang Dikonsumsi</label><Input {...register('detail.obat_dikonsumsi')} /></div>
      </div>
    </div>
  )
}

function BusuiDetails({ register }: { register: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Detail Pemeriksaan Ibu Menyusui</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm mb-1">Nama Bayi</label><Input {...register('detail.nama_bayi')} /></div>
        <div><label className="block text-sm mb-1">Jenis Persalinan</label><Input {...register('detail.jenis_persalinan')} /></div>
        <div className="sm:col-span-2"><label className="block text-sm mb-1">Kondisi ASI</label><Input {...register('detail.kondisi_asi')} /></div>
      </div>
    </div>
  )
}

function LansiaDetails({ register }: { register: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Detail Pemeriksaan Lansia</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm mb-1">Gula Darah (mg/dL)</label><Input type="number" step="0.1" {...register('detail.gula_darah')} /></div>
        <div><label className="block text-sm mb-1">Kolesterol (mg/dL)</label><Input type="number" step="0.1" {...register('detail.kolesterol')} /></div>
      </div>
    </div>
  )
}

function ExaminationFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultPatientId = searchParams.get('patientId')
  
  const { profile, user } = useAuth()
  const supabase = createClient()
  const [patients, setPatients] = useState<any[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)

  const form = useForm<any>({ // using any to allow dynamic detail fields
    resolver: zodResolver(examinationSchema),
    defaultValues: {
      patient_id: defaultPatientId || '',
      tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
      jenis_pemeriksaan: undefined,
      berat_badan: '',
      tinggi_badan: '',
      tekanan_darah: '',
      riwayat_penyakit: '',
      keluhan: '',
      diagnosa: '',
      terapi: '',
      keterangan: '',
      detail: {}
    },
  })

  const selectedJenis = form.watch('jenis_pemeriksaan')

  useEffect(() => {
    async function loadPatients() {
      if (!profile?.puskesmas_id) return
      try {
        const { data } = await supabase
          .from('patients')
          .select('id, nama, nik, puskesmas_patients!inner(puskesmas_id)')
          .eq('puskesmas_patients.puskesmas_id', profile.puskesmas_id)
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
    if (!profile?.puskesmas_id || !user?.id) return

    try {
      // 1. Insert main examination
      const { data: examData, error: examError } = await supabase
        .from('examinations')
        .insert({
          patient_id: values.patient_id,
          user_id: user.id,
          puskesmas_id: profile.puskesmas_id,
          tanggal_pemeriksaan: values.tanggal_pemeriksaan,
          jenis_pemeriksaan: values.jenis_pemeriksaan,
          berat_badan: values.berat_badan ? parseFloat(values.berat_badan) : null,
          tinggi_badan: values.tinggi_badan ? parseFloat(values.tinggi_badan) : null,
          tekanan_darah: values.tekanan_darah || null,
          riwayat_penyakit: values.riwayat_penyakit || null,
          keluhan: values.keluhan || null,
          diagnosa: values.diagnosa || null,
          terapi: values.terapi || null,
          keterangan: values.keterangan || null,
        })
        .select('id')
        .single()

      if (examError) throw examError
      const examId = examData.id

      // 2. Insert detail based on jenis
      const detailValues = { ...values.detail, examination_id: examId }
      
      let detailTable = ''
      switch(values.jenis_pemeriksaan) {
        case 'Balita': detailTable = 'examination_balita_details'; break;
        case 'Ibu_Hamil': detailTable = 'examination_bumil_details'; break;
        case 'Ibu_Menyusui': detailTable = 'examination_busui_details'; break;
        case 'Lansia': detailTable = 'examination_lansia_details'; break;
      }

      if (detailTable) {
        // clean up empty string numbers
        for (const key in detailValues) {
          if (detailValues[key] === '') detailValues[key] = null
        }
        
        const { error: detailError } = await supabase
          .from(detailTable)
          .insert(detailValues)
          
        if (detailError) throw detailError
      }

      router.push('/examinations')
      router.refresh()
    } catch (error: any) {
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
              <div>
                <label className="block text-sm font-medium mb-1">Pasien *</label>
                <Select {...form.register('patient_id')} disabled={loadingPatients || !!defaultPatientId}>
                  <option value="">{loadingPatients ? 'Loading...' : 'Pilih Pasien'}</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.nama} ({p.nik})</option>
                  ))}
                </Select>
                {form.formState.errors.patient_id && <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.patient_id.message)}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Pemeriksaan *</label>
                <Input type="date" {...form.register('tanggal_pemeriksaan')} />
                {form.formState.errors.tanggal_pemeriksaan && <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.tanggal_pemeriksaan.message)}</p>}
              </div>
            </div>

            <div className="pb-6 border-b border-gray-200">
              <label className="block text-sm font-medium mb-2">Jenis Pemeriksaan *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['Balita', 'Ibu_Hamil', 'Ibu_Menyusui', 'Lansia'].map((jenis) => (
                  <label key={jenis} className={`
                    border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors
                    ${selectedJenis === jenis ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}
                  `}>
                    <input type="radio" value={jenis} {...form.register('jenis_pemeriksaan')} className="sr-only" />
                    <span className="font-medium text-sm text-center">{jenis.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
              {form.formState.errors.jenis_pemeriksaan && <p className="text-sm text-red-500 mt-1">{String(form.formState.errors.jenis_pemeriksaan.message)}</p>}
            </div>

            {selectedJenis && (
              <div className="space-y-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-medium">Tanda Vital & Umum</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className="block text-sm mb-1">Berat Badan (kg)</label><Input type="number" step="0.1" {...form.register('berat_badan')} /></div>
                  <div><label className="block text-sm mb-1">Tinggi Badan (cm)</label><Input type="number" step="0.1" {...form.register('tinggi_badan')} /></div>
                  <div><label className="block text-sm mb-1">Tekanan Darah</label><Input placeholder="120/80" {...form.register('tekanan_darah')} /></div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div><label className="block text-sm mb-1">Keluhan</label><Input {...form.register('keluhan')} /></div>
                  <div><label className="block text-sm mb-1">Riwayat Penyakit</label><Input {...form.register('riwayat_penyakit')} /></div>
                  <div><label className="block text-sm mb-1">Diagnosa</label><Input {...form.register('diagnosa')} /></div>
                  <div><label className="block text-sm mb-1">Terapi / Tindakan</label><Input {...form.register('terapi')} /></div>
                  <div><label className="block text-sm mb-1">Keterangan</label><Input {...form.register('keterangan')} /></div>
                </div>
              </div>
            )}

            {selectedJenis === 'Balita' && <BalitaDetails register={form.register} />}
            {selectedJenis === 'Ibu_Hamil' && <BumilDetails register={form.register} />}
            {selectedJenis === 'Ibu_Menyusui' && <BusuiDetails register={form.register} />}
            {selectedJenis === 'Lansia' && <LansiaDetails register={form.register} />}

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
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>}>
      <ExaminationFormContent />
    </Suspense>
  )
}
