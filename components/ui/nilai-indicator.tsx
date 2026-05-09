'use client'

import { cekNilaiNormal } from '@/types'

type JenisNilai = 'gula_darah' | 'kolesterol' | 'asam_urat'

interface NilaiIndicatorProps {
  jenis: JenisNilai
  nilai: string | number | null | undefined
  label: string
  satuan: string
  normalInfo: string
}

export function NilaiIndicator({ jenis, nilai, label, satuan, normalInfo }: NilaiIndicatorProps) {
  const angka = nilai !== '' && nilai !== null && nilai !== undefined ? Number(nilai) : null
  const status = cekNilaiNormal(jenis, angka)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          {label} <span className="text-slate-400 font-normal">({satuan})</span>
        </label>
        {status === 'normal' && (
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            ✓ Normal
          </span>
        )}
        {status === 'abnormal' && (
          <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">
            ⚠ Tidak Normal
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-400">Nilai normal: {normalInfo}</p>
    </div>
  )
}
