'use client'

/**
 * Form Detail Pemeriksaan Ibu Hamil (Bumil)
 * - HPHT + kalkulasi usia kandungan otomatis dari tanggal pemeriksaan
 * - Rekomendasi TT1 pada usia kandungan 7 bulan (≥ 28 minggu)
 * - Rekomendasi TT2 pada usia kandungan 8 bulan (≥ 32 minggu)
 * - Semua istilah menggunakan "usia kandungan"
 */

import { useWatch, Control } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { hitungUsiaKehamilan } from '@/types'

interface BumilFormProps {
  register: any
  control: Control<any>
  /** Tanggal pemeriksaan — dipakai sebagai acuan hitung usia kandungan */
  tanggalPemeriksaan?: string
}

// ============================================================
// Konversi minggu → bulan kandungan obstetrik
// 1 bulan kandungan = 4 minggu 3 hari ≈ 4.3 minggu
// Konvensi umum: 4 minggu per bulan obstetrik
// ============================================================
function mingguKeBulan(minggu: number): { bulan: number; sisaMinggu: number } {
  return {
    bulan: Math.floor(minggu / 4),
    sisaMinggu: minggu % 4,
  }
}

// ============================================================
// Tentukan status rekomendasi TT berdasarkan usia kandungan (minggu)
//   TT1 : usia kandungan ≥ 28 minggu (7 bulan) dan < 32 minggu
//   TT2 : usia kandungan ≥ 32 minggu (8 bulan)
// ============================================================
function getRekomendasiTT(minggu: number): 'TT1' | 'TT2' | 'keduanya' | null {
  if (minggu >= 32) return 'TT2'
  if (minggu >= 28) return 'TT1'
  return null
}

// ============================================================
// Badge usia kandungan + rekomendasi TT
// ============================================================
function UsiaKandunganBadge({
  hpht,
  tanggalPemeriksaan,
}: {
  hpht: string
  tanggalPemeriksaan?: string
}) {
  // Hitung usia kandungan pada tanggal pemeriksaan (bukan hari ini)
  const usia = hitungUsiaKehamilan(hpht, tanggalPemeriksaan)
  if (!usia) return null

  const { bulan, sisaMinggu } = mingguKeBulan(usia.minggu)
  const rekomendasi = getRekomendasiTT(usia.minggu)

  return (
    <div className="mt-3 space-y-2">
      {/* Badge usia kandungan */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-100 text-pink-800 text-xs font-bold">
          🤰 Usia Kandungan: {bulan} bulan {sisaMinggu} minggu
          <span className="font-normal text-pink-600">({usia.minggu} minggu {usia.hari} hari)</span>
        </span>
      </div>

      {/* Rekomendasi TT */}
      {rekomendasi && (
        <div className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs font-semibold
          ${rekomendasi === 'TT2'
            ? 'bg-orange-50 border-orange-200 text-orange-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}
        >
          <span className="text-base mt-0.5">💉</span>
          <div>
            {rekomendasi === 'TT1' && (
              <>
                <span className="font-bold">Rekomendasi: Imunisasi TT1</span>
                <span className="font-normal ml-1">
                  (usia kandungan saat ini {bulan} bulan — waktu ideal TT1 adalah usia 7 bulan)
                </span>
              </>
            )}
            {rekomendasi === 'TT2' && (
              <>
                <span className="font-bold">Rekomendasi: Imunisasi TT2</span>
                <span className="font-normal ml-1">
                  (usia kandungan saat ini {bulan} bulan — waktu ideal TT2 adalah usia 8 bulan)
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Info jika belum waktunya */}
      {!rekomendasi && usia.minggu < 28 && (
        <p className="text-xs text-slate-400 italic">
          Imunisasi TT1 direkomendasikan saat usia kandungan mencapai 7 bulan (28 minggu).
          Saat ini: {bulan} bulan {sisaMinggu} minggu.
        </p>
      )}
    </div>
  )
}

// ============================================================
// Hitung usia kandungan saat TT diberikan (untuk label ringkas)
// ============================================================
function UsiaSaatTT({
  hpht,
  tanggalTT,
}: {
  hpht: string
  tanggalTT: string
}) {
  const usia = hitungUsiaKehamilan(hpht, tanggalTT)
  if (!usia) return null
  const { bulan, sisaMinggu } = mingguKeBulan(usia.minggu)
  return (
    <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
      Usia kandungan saat diberikan: {bulan} bulan {sisaMinggu} minggu ({usia.minggu} mgg)
    </span>
  )
}

// ============================================================
// Komponen Utama
// ============================================================
export function BumilDetailForm({ register, control, tanggalPemeriksaan }: BumilFormProps) {
  const hphtValue        = useWatch({ control, name: 'detail.hpht',          defaultValue: '' })
  const tt1Value         = useWatch({ control, name: 'detail.imunisasi_tt1', defaultValue: false })
  const tt2Value         = useWatch({ control, name: 'detail.imunisasi_tt2', defaultValue: false })
  const tanggalTT1Value  = useWatch({ control, name: 'detail.tanggal_tt1',   defaultValue: '' })
  const tanggalTT2Value  = useWatch({ control, name: 'detail.tanggal_tt2',   defaultValue: '' })

  return (
    <div className="space-y-6">
      {/* HPHT & Usia Kandungan */}
      <div className="p-4 bg-pink-50 rounded-xl border border-pink-100 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <h3 className="text-base font-bold text-slate-800">Data Kehamilan</h3>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            HPHT (Hari Pertama Haid Terakhir) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-400">
            Usia kandungan dihitung dari HPHT hingga tanggal pemeriksaan ini.
          </p>
          <Input
            id="input-hpht"
            type="date"
            className="max-w-xs"
            {...register('detail.hpht')}
          />
          {hphtValue && (
            <UsiaKandunganBadge
              hpht={hphtValue}
              tanggalPemeriksaan={tanggalPemeriksaan}
            />
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Tanda Bahaya</label>
          <textarea
            id="input-tanda-bahaya"
            rows={2}
            placeholder="Tanda bahaya yang ditemukan pada ibu hamil (jika ada)..."
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
            <p className="text-xs text-slate-500">
              TT1 direkomendasikan pada usia kandungan <strong>7 bulan (28 minggu)</strong>,
              TT2 pada usia kandungan <strong>8 bulan (32 minggu)</strong>.
            </p>
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
              <div className="space-y-1 mt-2">
                <label className="text-xs font-medium text-slate-600">Tanggal Pemberian TT1</label>
                <Input
                  id="input-tanggal-tt1"
                  type="date"
                  className="text-sm"
                  {...register('detail.tanggal_tt1')}
                />
                {hphtValue && tanggalTT1Value && (
                  <UsiaSaatTT hpht={hphtValue} tanggalTT={tanggalTT1Value} />
                )}
              </div>
            )}
            {!tt1Value && (
              <p className="text-xs text-slate-400">
                Centang jika TT1 diberikan pada kunjungan ini
                {hphtValue && (() => {
                  const u = hitungUsiaKehamilan(hphtValue, tanggalPemeriksaan)
                  if (!u) return null
                  const { bulan } = mingguKeBulan(u.minggu)
                  if (bulan >= 7) return <strong className="text-amber-600"> ← Direkomendasikan!</strong>
                  return null
                })()}
              </p>
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
              <div className="space-y-1 mt-2">
                <label className="text-xs font-medium text-slate-600">Tanggal Pemberian TT2</label>
                <Input
                  id="input-tanggal-tt2"
                  type="date"
                  className="text-sm"
                  {...register('detail.tanggal_tt2')}
                />
                {hphtValue && tanggalTT2Value && (
                  <UsiaSaatTT hpht={hphtValue} tanggalTT={tanggalTT2Value} />
                )}
              </div>
            )}
            {!tt2Value && (
              <p className="text-xs text-slate-400">
                Centang jika TT2 diberikan pada kunjungan ini
                {hphtValue && (() => {
                  const u = hitungUsiaKehamilan(hphtValue, tanggalPemeriksaan)
                  if (!u) return null
                  const { bulan } = mingguKeBulan(u.minggu)
                  if (bulan >= 8) return <strong className="text-amber-600"> ← Direkomendasikan!</strong>
                  return null
                })()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Fields Medis */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-pink-600">🩺</span> Data Medis &amp; Keluhan
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
