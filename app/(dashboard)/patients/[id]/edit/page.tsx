'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { patientSchema, type PatientFormValues } from '@/lib/validations/patient.schema'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PatientCombobox } from '@/components/ui/patient-combobox'
import { Patient } from '@/types'

export default function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { profile } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [ibuPatients, setIbuPatients] = useState<Patient[]>([])

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
  })

  useEffect(() => {
    async function loadData() {
      const [{ data: patientData }, { data: ibuData }] = await Promise.all([
        supabase.from('patients').select('*').eq('id', id).single(),
        supabase.from('patients').select('*').eq('jenis_kelamin', 'P'),
      ])

      if (patientData) {
        form.reset({
          nik: patientData.nik,
          no_bpjs: patientData.no_bpjs || '',
          nama: patientData.nama,
          jenis_kelamin: patientData.jenis_kelamin,
          tanggal_lahir: patientData.tanggal_lahir,
          alamat: patientData.alamat || '',
          no_hp: patientData.no_hp || '',
          nama_ayah: patientData.nama_ayah || '',
          nama_ibu: patientData.nama_ibu || '',
          nama_suami: patientData.nama_suami || '',
          id_ibu: patientData.id_ibu || '',
        })
      }
      if (ibuData) setIbuPatients(ibuData as Patient[])
      setLoading(false)
    }

    if (id && profile) loadData()
  }, [id, profile])

  const onSubmit = async (values: PatientFormValues) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ ...values, id_ibu: values.id_ibu || null })
        .eq('id', id)
      if (error) throw error
      router.push(`/patients/${id}`)
      router.refresh()
    } catch (error: any) {
      alert(`Gagal menyimpan: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Link href={`/patients/${id}`}>
          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent text-gray-500 hover:text-emerald-700">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Detail
          </Button>
        </Link>
      </div>

      <PageHeader title="Edit Data Pasien" description="Perbarui informasi pasien" />

      <Card className="max-w-3xl mt-4">
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Identitas Utama</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIK (16 Digit) *</label>
                  <Input {...form.register('nik')} maxLength={16} placeholder="16 digit NIK" />
                  {form.formState.errors.nik && <p className="mt-1 text-sm text-red-600">{form.formState.errors.nik.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. BPJS</label>
                  <Input {...form.register('no_bpjs')} placeholder="Opsional" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pb-6 border-b border-gray-200">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                  <Input {...form.register('nama')} placeholder="Nama sesuai KTP" />
                  {form.formState.errors.nama && <p className="mt-1 text-sm text-red-600">{form.formState.errors.nama.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin *</label>
                  <Select {...form.register('jenis_kelamin')}>
                    <option value="">Pilih...</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </Select>
                  {form.formState.errors.jenis_kelamin && <p className="mt-1 text-sm text-red-600">{form.formState.errors.jenis_kelamin.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir *</label>
                  <Input type="date" {...form.register('tanggal_lahir')} />
                  {form.formState.errors.tanggal_lahir && <p className="mt-1 text-sm text-red-600">{form.formState.errors.tanggal_lahir.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Handphone</label>
                  <Input {...form.register('no_hp')} placeholder="08xxx" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                  <Input {...form.register('alamat')} placeholder="Jalan, RT/RW, Desa/Kelurahan" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Data Keluarga (Opsional)</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ayah</label>
                  <Input {...form.register('nama_ayah')} placeholder="Untuk balita" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ibu</label>
                  <Input {...form.register('nama_ibu')} placeholder="Untuk balita" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Suami</label>
                  <Input {...form.register('nama_suami')} placeholder="Untuk bumil/busui" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Relasi Ibu (id_ibu)</label>
                <p className="text-xs text-slate-500 mb-2">Pilih ibu pasien jika pasien adalah anak. Opsional.</p>
                <PatientCombobox
                  patients={ibuPatients}
                  value={form.watch('id_ibu') || ''}
                  onChange={(val) => form.setValue('id_ibu', val)}
                  placeholder="Cari Ibu berdasarkan Nama/NIK..."
                />
              </div>
            </div>

            <div className="pt-5 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                ) : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
