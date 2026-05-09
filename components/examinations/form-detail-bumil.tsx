'use client'

/**
 * Form Detail Pemeriksaan Ibu Hamil (Bumil)
 * - HPHT + kalkulasi usia kehamilan otomatis
 * - Tanda bahaya
 * - Imunisasi TT1 (7 bln) & TT2 (8 bln) dengan rekomendasi otomatis
 * DIHAPUS: TP, GPA, LILA, Obat, Keterangan
 */

import { useWatch, Control } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { hitungUsiaKehamilan } from '@/types'

interface BumilFormProps {
  register: any
  control: Control<any>
}

function UsiaKehamilanBadge({ hpht }: { hpht: string }) {
  const usia = hitungUsiaKehamilan(hpht)
  if (!usia) return null

  const rekomendasiTT = usia.minggu >= 28 && usia.minggu < 32
    ? 'TT1'
    : usia.minggu >= 32 && usia.minggu < 36
    ? 'TT2'
    : null

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
        🤱 Usia Kehamilan: {usia.minggu} minggu {usia.hari} hari
      </span>
      {rekomendasiTT && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold animate-pulse">
          💉 Rekomendasi: Imunisasi {rekomendasiTT}
        </span>
      )}
    </div>
  )
}

export function BumilDetailForm({ register, control }: BumilFormProps) {
  const hphtValue = useWatch({ control, name: 'detail.hpht', defaultValue: '' })
  const tt1Value = useWatch({ control, name: 'detail.imunisasi_tt1', defaultValue: false })
  const tt2Value = useWatch({ control, name: 'detail.imunisasi_tt2', defaultValue: false })

  return (
    <div className="space-y-6">
      {/* HPHT & Usia Kehamilan */}
      <div className="p-4 bg-pink-50 rounded-xl border border-pink-100 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <h3 className="text-base font-bold text-slate-800">Data Kehamilan</h3>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            HPHT (Hari Pertama Haid Terakhir) <span className="text-red-500">*</span>
          </label>
          <Input
            id="input-hpht"
            type="date"
            className="max-w-xs"
            {...register('detail.hpht')}
          />
          {hphtValue && <UsiaKehamilanBadge hpht={hphtValue} />}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Tanda Bahaya</label>
          <textarea
            id="input-tanda-bahaya"
            rows={2}
            placeholder="Tanda bahaya yang ditemukan (jika ada)..."
            className="w-full px-3 py-2 text-sm border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none bg-white"
            {...register('detail.tanda_bahaya')}
          />
        </div>
      </div>

      {/* Imunisasi TT */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💉</span>
          <div>
            <h3 className="text-base font-bold text-slate-800">Imunisasi Tetanus Toksoid (TT)</h3>
            <p className="text-xs text-slate-500">Direkomendasikan pada usia kehamilan 7 (TT1) dan 8 bulan (TT2)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* TT1 */}
          <div className={`p-3 rounded-lg border-2 transition-colors ${tt1Value ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'}`}>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                id="checkbox-tt1"
                type="checkbox"
                className="w-4 h-4 rounded accent-emerald-600"
                {...register('detail.imunisasi_tt1')}
              />
              <span className="text-sm font-bold text-slate-700">TT1 — Diberikan Kunjungan Ini</span>
            </label>
            {tt1Value && (
              <div className="space-y-1.5 mt-2">
                <label className="text-xs font-medium text-slate-600">Tanggal Pemberian TT1</label>
                <Input
                  id="input-tanggal-tt1"
                  type="date"
                  className="text-sm"
                  {...register('detail.tanggal_tt1')}
                />
              </div>
            )}
            {!tt1Value && (
              <p className="text-xs text-slate-400">Centang jika TT1 diberikan pada kunjungan ini</p>
            )}
          </div>

          {/* TT2 */}
          <div className={`p-3 rounded-lg border-2 transition-colors ${tt2Value ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'}`}>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                id="checkbox-tt2"
                type="checkbox"
                className="w-4 h-4 rounded accent-emerald-600"
                {...register('detail.imunisasi_tt2')}
              />
              <span className="text-sm font-bold text-slate-700">TT2 — Diberikan Kunjungan Ini</span>
            </label>
            {tt2Value && (
              <div className="space-y-1.5 mt-2">
                <label className="text-xs font-medium text-slate-600">Tanggal Pemberian TT2</label>
                <Input
                  id="input-tanggal-tt2"
                  type="date"
                  className="text-sm"
                  {...register('detail.tanggal_tt2')}
                />
              </div>
            )}
            {!tt2Value && (
              <p className="text-xs text-slate-400">Centang jika TT2 diberikan pada kunjungan ini</p>
            )}
          </div>
        </div>
      </div>

      {/* Fields Medis */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-pink-600">🩺</span> Data Medis & Keluhan
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Keluhan Saat Ini</label>
            <textarea
              rows={2}
              placeholder="Keluhan yang dirasakan ibu hamil..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              {...register('detail.keluhan')}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Riwayat Penyakit</label>
            <textarea
              rows={2}
              placeholder="Riwayat penyakit penyerta..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              {...register('detail.riwayat_penyakit')}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Diagnosa / Observasi</label>
            <textarea
              rows={2}
              placeholder="Hasil diagnosa petugas..."
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
    </div>
  )
}
