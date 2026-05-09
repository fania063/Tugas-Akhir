'use client'

/**
 * Form Detail Pemeriksaan Lansia
 * - Gula darah, kolesterol, asam urat dengan indikator normal/abnormal
 * - Keluhan, diagnosa, terapi
 */

import { useWatch, Control } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { cekNilaiNormal } from '@/types'

function NilaiTag({ nilai, jenis }: { nilai: string; jenis: 'gula_darah' | 'kolesterol' | 'asam_urat' }) {
  const angka = nilai !== '' ? Number(nilai) : null
  const status = cekNilaiNormal(jenis, angka)
  if (angka === null || isNaN(angka)) return null
  return status === 'normal'
    ? <span className="ml-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Normal</span>
    : <span className="ml-2 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">⚠ Abnormal</span>
}

interface LansiaFormProps {
  register: any
  control: Control<any>
}

export function LansiaDetailForm({ register, control }: LansiaFormProps) {
  const gulaDarah = useWatch({ control, name: 'detail.gula_darah', defaultValue: '' })
  const kolesterol = useWatch({ control, name: 'detail.kolesterol', defaultValue: '' })
  const asamUrat = useWatch({ control, name: 'detail.asam_urat', defaultValue: '' })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span className="text-lg">🩺</span>
        <h3 className="text-base font-bold text-slate-800">Pemeriksaan Laboratorium</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Gula Darah */}
        <div className="space-y-2 p-4 bg-amber-50/60 rounded-xl border border-amber-100">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label className="text-sm font-semibold text-slate-700">Gula Darah</label>
            <NilaiTag nilai={gulaDarah} jenis="gula_darah" />
          </div>
          <p className="text-[11px] text-slate-400">Normal: &lt; 180 mg/dl</p>
          <div className="flex items-center gap-2">
            <Input
              id="input-gula-darah"
              type="number"
              step="0.1"
              min="0"
              placeholder="0"
              className="flex-1"
              {...register('detail.gula_darah')}
            />
            <span className="text-xs text-slate-500 whitespace-nowrap">mg/dl</span>
          </div>
        </div>

        {/* Kolesterol */}
        <div className="space-y-2 p-4 bg-purple-50/60 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label className="text-sm font-semibold text-slate-700">Kolesterol</label>
            <NilaiTag nilai={kolesterol} jenis="kolesterol" />
          </div>
          <p className="text-[11px] text-slate-400">Normal: &lt; 180 mg/dl</p>
          <div className="flex items-center gap-2">
            <Input
              id="input-kolesterol"
              type="number"
              step="0.1"
              min="0"
              placeholder="0"
              className="flex-1"
              {...register('detail.kolesterol')}
            />
            <span className="text-xs text-slate-500 whitespace-nowrap">mg/dl</span>
          </div>
        </div>

        {/* Asam Urat */}
        <div className="space-y-2 p-4 bg-sky-50/60 rounded-xl border border-sky-100">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label className="text-sm font-semibold text-slate-700">Asam Urat</label>
            <NilaiTag nilai={asamUrat} jenis="asam_urat" />
          </div>
          <p className="text-[11px] text-slate-400">Normal: 1 – 6 mg/dl</p>
          <div className="flex items-center gap-2">
            <Input
              id="input-asam-urat"
              type="number"
              step="0.1"
              min="0"
              placeholder="0"
              className="flex-1"
              {...register('detail.asam_urat')}
            />
            <span className="text-xs text-slate-500 whitespace-nowrap">mg/dl</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 pt-2">
        <span className="text-lg">📋</span>
        <h3 className="text-base font-bold text-slate-800">Catatan Medis</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Keluhan</label>
          <textarea
            id="input-keluhan-lansia"
            rows={2}
            placeholder="Keluhan yang disampaikan pasien..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            {...register('detail.keluhan')}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Riwayat Penyakit</label>
          <textarea
            id="input-riwayat-penyakit-lansia"
            rows={2}
            placeholder="Riwayat penyakit terdahulu..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            {...register('detail.riwayat_penyakit')}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Diagnosa</label>
            <textarea
              id="input-diagnosa-lansia"
              rows={2}
              placeholder="Diagnosa..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              {...register('detail.diagnosa')}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Terapi / Tindakan</label>
            <textarea
              id="input-terapi-lansia"
              rows={2}
              placeholder="Terapi yang diberikan..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              {...register('detail.terapi')}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Keterangan Tambahan</label>
          <textarea
            id="input-keterangan-lansia"
            rows={2}
            placeholder="Keterangan lainnya (opsional)..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            {...register('detail.keterangan')}
          />
        </div>
      </div>
    </div>
  )
}
