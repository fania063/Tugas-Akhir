'use client'

/**
 * Form Detail Pemeriksaan Balita
 * DIHAPUS: tekanan darah, keluhan, riwayat penyakit, diagnosa, terapi
 * DITAMBAH: Jadwal imunisasi nasional (rekomendasi) + pencatatan vaccination_records
 */

import { useWatch, Control } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { JADWAL_IMUNISASI, JenisVaksin, hitungUsiaBalita } from '@/types'

interface BalitaFormProps {
  register: any
  control: Control<any>
  tanggalLahirPasien?: string | null
}



export function BalitaDetailForm({ register, control, tanggalLahirPasien }: BalitaFormProps) {
  const selectedImunisasi: JenisVaksin[] = useWatch({
    control,
    name: 'imunisasi_diberikan',
    defaultValue: [],
  })


  // Hitung usia balita dari tanggal lahir pasien
  const usiaBalita = tanggalLahirPasien ? hitungUsiaBalita(tanggalLahirPasien) : null

  // Tentukan imunisasi yang direkomendasikan berdasarkan usia
  const rekomendasiVaksin = usiaBalita
    ? JADWAL_IMUNISASI.filter((j) => j.usia_bulan <= usiaBalita.bulan)
    : []

  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-400 bg-emerald-50/70',
    amber: 'border-amber-400 bg-amber-50/70',
    red: 'border-red-400 bg-red-50/70',
    sky: 'border-sky-400 bg-sky-50/70',
  }

  return (
    <div className="space-y-6">
      {/* Usia Balita Badge */}
      {usiaBalita && (
        <div className="flex items-center gap-2 p-3 bg-sky-50 border border-sky-100 rounded-xl">
          <span className="text-xl">👶</span>
          <div>
            <p className="text-sm font-bold text-sky-700">
              Usia Balita: {usiaBalita.bulan} Bulan {usiaBalita.hari} Hari
            </p>
            <p className="text-xs text-sky-500">
              Dihitung otomatis dari tanggal lahir pasien
            </p>
          </div>
        </div>
      )}



      {/* Imunisasi */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💉</span>
          <div>
            <h3 className="text-base font-bold text-slate-800">Imunisasi Kunjungan Ini</h3>
            <p className="text-xs text-slate-500">
              Centang imunisasi yang <strong>benar-benar diberikan</strong> pada kunjungan ini.
              {usiaBalita && <> Jadwal nasional untuk usia {usiaBalita.bulan} bulan ditampilkan sebagai rekomendasi (⭐).</>}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {JADWAL_IMUNISASI.map((jadwal) => {
            const isRekomendasi = rekomendasiVaksin.some((r) => r.vaksin === jadwal.vaksin)
            const isChecked = selectedImunisasi?.includes(jadwal.vaksin)

            return (
              <label
                key={jadwal.vaksin}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-100'
                    : isRekomendasi
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-slate-200 bg-white hover:border-emerald-200'
                }`}
              >
                <input
                  type="checkbox"
                  value={jadwal.vaksin}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 flex-shrink-0"
                  {...register('imunisasi_diberikan')}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    {isRekomendasi && '⭐ '}{jadwal.vaksin.replace('_', ' ')}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-snug">{jadwal.label.replace(/\(.*?\)/, '').trim()}</p>
                </div>
              </label>
            )
          })}
        </div>

        {selectedImunisasi && selectedImunisasi.length > 0 && (
          <div className="mt-2 p-3 bg-white rounded-lg border border-emerald-200">
            <p className="text-xs font-bold text-emerald-700 mb-2">
              ✅ Dipilih: {selectedImunisasi.length} imunisasi
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedImunisasi.map((v) => (
                <span key={v} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-full">
                  {v.replace('_', ' ')}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Akan dicatat di riwayat imunisasi dengan usia {usiaBalita?.bulan ?? '?'} bulan {usiaBalita?.hari ?? '?'} hari
            </p>
          </div>
        )}
      </div>

      {/* Catatan */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Catatan Tambahan</label>
        <textarea
          id="input-catatan-balita"
          rows={2}
          placeholder="Catatan kondisi atau perkembangan balita (opsional)..."
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          {...register('detail.catatan')}
        />
      </div>
    </div>
  )
}
