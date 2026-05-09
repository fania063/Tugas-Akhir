'use client'

/**
 * Form Detail Pemeriksaan Ibu Menyusui (Busui)
 * DIHAPUS: Riwayat penyakit, keterangan, nama bayi
 * DIUBAH: kondisi_asi → Select enum + "Lainnya" custom
 */

import { useWatch, Control } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { KONDISI_ASI_LABELS, KondisiAsi } from '@/types'

interface BusuiFormProps {
  register: any
  control: Control<any>
}

const KONDISI_ASI_OPTIONS: { value: KondisiAsi; label: string; desc: string }[] = [
  { value: 'eksklusif', label: '🤱 ASI Eksklusif (Lancar)', desc: 'Bayi mendapat ASI penuh tanpa tambahan' },
  { value: 'tidak_lancar', label: '😟 ASI Tidak Lancar / Kurang', desc: 'Produksi ASI kurang dari kebutuhan bayi' },
  { value: 'campuran', label: '🍼 Campuran (ASI + Susu Formula)', desc: 'Bayi mendapat ASI dan susu formula' },
  { value: 'tidak_menyusui', label: '🚫 Tidak Menyusui (Hanya Formula)', desc: 'Bayi tidak mendapat ASI sama sekali' },
  { value: 'lainnya', label: '✏️ Lainnya...', desc: 'Kondisi lain, isi keterangan di bawah' },
]

export function BusuiDetailForm({ register, control }: BusuiFormProps) {
  const kondisiAsi = useWatch({ control, name: 'detail.kondisi_asi', defaultValue: '' })

  return (
    <div className="space-y-6">
      {/* Kondisi ASI */}
      <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤱</span>
          <div>
            <h3 className="text-base font-bold text-slate-800">Kondisi Menyusui</h3>
            <p className="text-xs text-slate-500">Pilih kondisi ASI yang paling sesuai dengan keadaan ibu saat ini</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {KONDISI_ASI_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                kondisiAsi === opt.value
                  ? 'border-violet-400 bg-violet-100/60'
                  : 'border-slate-200 hover:border-violet-200 hover:bg-violet-50/50'
              }`}
            >
              <input
                type="radio"
                value={opt.value}
                className="mt-0.5 accent-violet-600"
                {...register('detail.kondisi_asi')}
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                <p className="text-xs text-slate-500">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Field kustom jika pilih "Lainnya" */}
        {kondisiAsi === 'lainnya' && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="text-sm font-medium text-slate-700">
              Keterangan Kondisi ASI <span className="text-red-500">*</span>
            </label>
            <Input
              id="input-kondisi-asi-kustom"
              placeholder="Jelaskan kondisi menyusui secara spesifik..."
              {...register('detail.kondisi_asi_kustom')}
            />
          </div>
        )}
      </div>

      {/* Jenis Persalinan */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Jenis Persalinan</label>
        <div className="flex gap-3">
          {['Normal', 'Caesar (SC)', 'Vakum', 'Forcep'].map((jp) => (
            <label
              key={jp}
              className="flex items-center gap-1.5 text-sm cursor-pointer"
            >
              <input
                type="radio"
                value={jp}
                className="accent-emerald-600"
                {...register('detail.jenis_persalinan')}
              />
              {jp}
            </label>
          ))}
        </div>
      </div>

      {/* Fields Medis */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-violet-600">🩺</span> Data Medis & Keluhan
        </h4>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Keluhan Saat Ini</label>
          <textarea
            rows={2}
            placeholder="Keluhan yang dirasakan..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            {...register('detail.keluhan')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Diagnosa / Observasi</label>
            <textarea
              rows={2}
              placeholder="Hasil observasi petugas..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              {...register('detail.diagnosa')}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tindakan / Terapi</label>
            <textarea
              rows={2}
              placeholder="Tindakan atau obat yang diberikan..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              {...register('detail.terapi')}
            />
          </div>
        </div>
      </div>

      {/* Catatan */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Catatan Tambahan</label>
        <textarea
          id="input-catatan-busui"
          rows={2}
          placeholder="Catatan kondisi ibu menyusui (opsional)..."
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          {...register('detail.catatan')}
        />
      </div>
    </div>
  )
}
