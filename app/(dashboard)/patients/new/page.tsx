'use client'

import { useState } from 'react'
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
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { PatientCombobox } from '@/components/ui/patient-combobox'
import { Patient } from '@/types'

export default function NewPatientPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const supabase = createClient()
  const [checkingNik, setCheckingNik] = useState(false)
  const [existingPatient, setExistingPatient] = useState<any>(null)
  const [ibuPatients, setIbuPatients] = useState<Patient[]>([])

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      nik: '',
      no_bpjs: '',
      nama: '',
      jenis_kelamin: undefined as any,
      tanggal_lahir: '',
      alamat: '',
      no_hp: '',
      nama_ayah: '',
      nama_ibu: '',
      nama_suami: '',
      id_ibu: '',
    },
  })

  // Fetch data ibu untuk combobox id_ibu
  useEffect(() => {
    async function fetchIbu() {
      const { data } = await supabase
        .from('patients')
        .select('*')
        .eq('jenis_kelamin', 'P')
      if (data) setIbuPatients(data as Patient[])
    }
    fetchIbu()
  }, [])

  // Watch NIK changes to check if patient already exists globally
  const nikValue = form.watch('nik')

  const checkNik = async () => {
    if (nikValue.length !== 16) return

    setCheckingNik(true)
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('nik', nikValue)
        .single()

      if (data) {
        setExistingPatient(data)
        // Auto fill form with existing data
        form.reset({
          nik: data.nik,
          no_bpjs: data.no_bpjs || '',
          nama: data.nama,
          jenis_kelamin: data.jenis_kelamin,
          tanggal_lahir: data.tanggal_lahir,
          alamat: data.alamat || '',
          no_hp: data.no_hp || '',
          nama_ayah: data.nama_ayah || '',
          nama_ibu: data.nama_ibu || '',
          nama_suami: data.nama_suami || '',
          id_ibu: data.id_ibu || '',
        })
      } else {
        setExistingPatient(null)
      }
    } catch (error) {
      console.log('NIK not found or error:', error)
      setExistingPatient(null)
    } finally {
      setCheckingNik(false)
    }
  }

  const onSubmit = async (values: PatientFormValues) => {
    try {
      let patientId = existingPatient?.id

      // 1. Jika pasien belum ada, buat baru
      if (!existingPatient) {
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert(values)
          .select('id')
          .single()

        if (createError) throw createError
        patientId = newPatient.id
      } else {
        // Update data pasien yang sudah ada
        const { error: updateError } = await supabase
          .from('patients')
          .update(values)
          .eq('id', patientId)

        if (updateError) throw updateError
      }

      router.push(`/patients/${patientId}`)
      router.refresh()
    } catch (error: any) {
      alert(`Gagal menyimpan pasien: ${error.message}`)
    }
  }

  return (
    <>
      <PageHeader
        title="Tambah Pasien Baru"
        description="Mendaftarkan pasien baru ke Posyandu Melati"
      />

      <Card className="max-w-3xl">
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* NIK Section with Check */}
            <div className="space-y-4 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Identitas Utama</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK (16 Digit) *</label>
                <div className="flex gap-2">
                  <Input
                    {...form.register('nik')}
                    placeholder="Masukkan 16 digit NIK"
                    maxLength={16}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={checkNik}
                    disabled={nikValue.length !== 16 || checkingNik}
                  >
                    {checkingNik ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cek NIK'}
                  </Button>
                </div>
                {form.formState.errors.nik && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.nik.message}</p>
                )}
              </div>

              {existingPatient && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-amber-700">
                        Pasien dengan NIK ini sudah ada di database global. Data di bawah telah diisi otomatis.
                        Menyimpan form ini akan mendaftarkan pasien tersebut ke puskesmas Anda.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Personal Info */}
            <div className="space-y-4 pb-6 border-b border-gray-200">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                  <Input {...form.register('nama')} placeholder="Nama sesuai KTP" />
                  {form.formState.errors.nama && <p className="mt-1 text-sm text-red-600">{form.formState.errors.nama.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. BPJS</label>
                  <Input {...form.register('no_bpjs')} placeholder="Opsional" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                  <Input {...form.register('alamat')} placeholder="Jalan, RT/RW, Desa/Kelurahan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Handphone</label>
                  <Input {...form.register('no_hp')} placeholder="08xxx" />
                </div>
              </div>
            </div>

            {/* Relatives Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Data Keluarga (Opsional)</h3>
              <p className="text-sm text-gray-500">Diperlukan untuk pemeriksaan Balita / Ibu Hamil</p>

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

              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cari data pasien ibu
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Pilih ibu pasien jika pasien adalah anak. Opsional.
                </p>
                <PatientCombobox
                  patients={ibuPatients}
                  value={form.watch('id_ibu') || ''}
                  onChange={(val) => form.setValue('id_ibu', val)}
                  placeholder="Cari Ibu berdasarkan Nama/NIK..."
                />
              </div>
            </div>

            <div className="pt-5 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan & Daftarkan'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
