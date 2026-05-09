'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema, type PatientFormValues } from '@/lib/validations/patient.schema'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, X } from 'lucide-react'
import { useEffect } from 'react'
import { PatientCombobox } from '@/components/ui/patient-combobox'
import { Patient } from '@/types'

interface QuickAddPatientProps {
  onSuccess?: (patientId: string) => void
  defaultJenisKelamin?: 'L' | 'P'
  defaultIbuId?: string
  triggerButton?: React.ReactNode
}

export function QuickAddPatientDialog({ onSuccess, defaultJenisKelamin, defaultIbuId, triggerButton }: QuickAddPatientProps) {
  const [open, setOpen] = useState(false)
  const [ibuPatients, setIbuPatients] = useState<Patient[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      async function fetchIbu() {
        const { data } = await supabase
          .from('patients')
          .select('*')
          .eq('jenis_kelamin', 'P')
        if (data) setIbuPatients(data as Patient[])
      }
      fetchIbu()
    }
  }, [open])

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      nik: '',
      nama: '',
      jenis_kelamin: defaultJenisKelamin,
      tanggal_lahir: '',
      no_hp: '',
      id_ibu: defaultIbuId || undefined
    } as Partial<PatientFormValues>,
  })

  const onSubmit = async (values: PatientFormValues) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          nik: values.nik,
          nama: values.nama,
          jenis_kelamin: values.jenis_kelamin,
          tanggal_lahir: values.tanggal_lahir,
          no_hp: values.no_hp || null,
          id_ibu: values.id_ibu || null
        })
        .select('id')
        .single()

      if (error) throw error

      form.reset()
      setOpen(false)
      if (onSuccess) onSuccess(data.id)
    } catch (error: any) {
      alert(`Gagal menambah pasien: ${error.message}`)
    }
  }

  return (
    <>
      <div onClick={() => setOpen(true)} className="inline-block">
        {triggerButton || (
          <Button variant="outline" size="sm" type="button">
            <Plus className="h-4 w-4 mr-1" />
            Pasien Baru
          </Button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[425px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Quick Add Pasien</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">NIK (16 Digit) *</label>
                <Input {...form.register('nik')} maxLength={16} placeholder="16 Digit NIK..." />
                {form.formState.errors.nik && <p className="text-xs text-red-500">{form.formState.errors.nik.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nama Lengkap *</label>
                <Input {...form.register('nama')} placeholder="Nama Pasien..." />
                {form.formState.errors.nama && <p className="text-xs text-red-500">{form.formState.errors.nama.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">J. Kelamin *</label>
                  <Select {...form.register('jenis_kelamin')} disabled={!!defaultJenisKelamin}>
                    <option value="">Pilih...</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Tgl Lahir *</label>
                  <Input type="date" {...form.register('tanggal_lahir')} />
                  {form.formState.errors.tanggal_lahir && <p className="text-xs text-red-500">{form.formState.errors.tanggal_lahir.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">No HP (Opsional)</label>
                <Input {...form.register('no_hp')} placeholder="08..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Relasi Ibu (id_ibu)</label>
                <PatientCombobox 
                  patients={ibuPatients}
                  value={form.watch('id_ibu') || ''}
                  onChange={(val) => form.setValue('id_ibu', val)}
                  placeholder="Cari Ibu (Opsional)..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                  {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Pasien'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
