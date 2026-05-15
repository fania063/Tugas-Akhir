// Tipe data utama sistem Posyandu Melati (Single-Tenant)

export type Role = 'admin' | 'petugas'

export type Profile = {
  id: string
  nama: string
  no_hp: string | null
  role: Role
  created_at: string
  updated_at: string
}

export type Patient = {
  id: string
  nik: string
  no_bpjs: string | null
  nama: string
  jenis_kelamin: 'L' | 'P'
  tanggal_lahir: string
  alamat: string | null
  no_hp: string | null
  nama_ayah: string | null
  nama_ibu: string | null
  nama_suami: string | null
  /** UUID pasien Ibu — diisi jika pasien ini adalah Balita */
  id_ibu: string | null
  created_at: string
  updated_at: string
}

export type JenisPemeriksaan = 'Balita' | 'Ibu_Hamil' | 'Ibu_Menyusui' | 'Lansia'

export type Examination = {
  id: string
  patient_id: string
  user_id: string
  tanggal_pemeriksaan: string
  jenis_pemeriksaan: JenisPemeriksaan
  berat_badan: number | null
  tinggi_badan: number | null
  tekanan_darah: string | null
  created_at: string
  updated_at: string
}

// =========================================
// TABEL DETAIL PER JENIS PEMERIKSAAN
// =========================================

export type ExaminationBalitaDetail = {
  examination_id: string
  status_gizi: string | null  // 'Normal' | 'Gizi Kurang' | 'Gizi Buruk' | 'Gizi Lebih'
  catatan: string | null
}

export type ExaminationBumilDetail = {
  examination_id: string
  hpht: string | null         // Hari Pertama Haid Terakhir (ISO Date)
  tanda_bahaya: string | null
  keluhan: string | null
  diagnosa: string | null
  riwayat_penyakit: string | null
  terapi: string | null
  imunisasi_tt1: boolean
  tanggal_tt1: string | null
  imunisasi_tt2: boolean
  tanggal_tt2: string | null
}

export type KondisiAsi =
  | 'eksklusif'
  | 'tidak_lancar'
  | 'campuran'
  | 'tidak_menyusui'
  | 'lainnya'

export const KONDISI_ASI_LABELS: Record<KondisiAsi, string> = {
  eksklusif: 'ASI Eksklusif (Lancar)',
  tidak_lancar: 'ASI Tidak Lancar / Kurang',
  campuran: 'Campuran (ASI + Susu Formula)',
  tidak_menyusui: 'Tidak Menyusui (Hanya Formula)',
  lainnya: 'Lainnya...',
}

export type ExaminationBusuiDetail = {
  examination_id: string
  jenis_persalinan: string | null
  kondisi_asi: KondisiAsi | null
  kondisi_asi_kustom: string | null
  keluhan: string | null
  diagnosa: string | null
  terapi: string | null
  catatan: string | null
}

export type ExaminationLansiaDetail = {
  examination_id: string
  gula_darah: number | null
  kolesterol: number | null
  asam_urat: number | null
  riwayat_penyakit: string | null
  keluhan: string | null
  diagnosa: string | null
  terapi: string | null
  keterangan: string | null
}

// =========================================
// IMUNISASI BALITA
// =========================================

export type JenisVaksin =
  | 'BCG'
  | 'DPT1' | 'DPT2' | 'DPT3'
  | 'Polio1' | 'Polio2' | 'Polio3' | 'Polio4'
  | 'HB0' | 'HB1' | 'HB2' | 'HB3'
  | 'Campak'
  | 'Vit_A'

/** Jadwal imunisasi nasional (dalam bulan usia) — sebagai rekomendasi UI */
export const JADWAL_IMUNISASI: { vaksin: JenisVaksin; usia_bulan: number; label: string }[] = [
  { vaksin: 'BCG',    usia_bulan: 1,  label: 'BCG (1 Bulan)' },
  { vaksin: 'HB0',    usia_bulan: 0,  label: 'Hepatitis B0 (0-7 Hari)' },
  { vaksin: 'DPT1',   usia_bulan: 2,  label: 'DPT-HB-Hib 1 (2 Bulan)' },
  { vaksin: 'Polio1', usia_bulan: 2,  label: 'Polio 1 (2 Bulan)' },
  { vaksin: 'DPT2',   usia_bulan: 3,  label: 'DPT-HB-Hib 2 (3 Bulan)' },
  { vaksin: 'Polio2', usia_bulan: 3,  label: 'Polio 2 (3 Bulan)' },
  { vaksin: 'DPT3',   usia_bulan: 4,  label: 'DPT-HB-Hib 3 (4 Bulan)' },
  { vaksin: 'Polio3', usia_bulan: 4,  label: 'Polio 3 (4 Bulan)' },
  { vaksin: 'Polio4', usia_bulan: 4,  label: 'Polio 4 IPV (4 Bulan)' },
  { vaksin: 'Campak', usia_bulan: 9,  label: 'Campak-Rubela (9 Bulan)' },
  { vaksin: 'Vit_A',  usia_bulan: 6,  label: 'Vitamin A (6 Bulan, tiap 6 bln s.d. 5 Thn)' },
]

export type VaccinationRecord = {
  id: string
  patient_id: string
  examination_id: string | null
  jenis_vaksin: JenisVaksin | string
  tanggal: string
  usia_bulan: number | null
  usia_hari: number | null
  catatan: string | null
  created_at: string
}

// =========================================
// HELPER: Indikator Nilai Normal
// =========================================

export type NilaiStatus = 'normal' | 'abnormal' | 'unknown'

export function cekNilaiNormal(
  jenis: 'gula_darah' | 'kolesterol' | 'asam_urat',
  nilai: number | null | undefined
): NilaiStatus {
  if (nilai == null) return 'unknown'
  if (jenis === 'gula_darah' || jenis === 'kolesterol') {
    return nilai <= 180 ? 'normal' : 'abnormal'
  }
  if (jenis === 'asam_urat') {
    return nilai >= 1 && nilai <= 6 ? 'normal' : 'abnormal'
  }
  return 'unknown'
}

// =========================================
// HELPER: Kalkulasi Usia Kehamilan
// =========================================

/** Hitung usia kehamilan dalam minggu dari HPHT */
export function hitungUsiaKehamilan(hpht: string | null, targetDate?: string): { minggu: number; hari: number } | null {
  if (!hpht) return null
  const hphtDate = new Date(hpht)
  const target = targetDate ? new Date(targetDate) : new Date()
  const diffMs = target.getTime() - hphtDate.getTime()
  if (diffMs < 0) return null
  const totalHari = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return { minggu: Math.floor(totalHari / 7), hari: totalHari % 7 }
}

// =========================================
// HELPER: Kalkulasi Usia Balita
// =========================================

/** Hitung usia balita dalam bulan dan hari dari tanggal lahir */
export function hitungUsiaBalita(tanggalLahir: string, targetDate?: string): { bulan: number; hari: number } {
  const lahir = new Date(tanggalLahir)
  const target = targetDate ? new Date(targetDate) : new Date()
  let bulan = (target.getFullYear() - lahir.getFullYear()) * 12 + (target.getMonth() - lahir.getMonth())
  const hariLahirBulanIni = new Date(target.getFullYear(), target.getMonth(), lahir.getDate())
  const selisihHari = Math.floor(
    (target.getTime() - hariLahirBulanIni.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (selisihHari < 0) bulan -= 1
  return { bulan: Math.max(0, bulan), hari: Math.max(0, selisihHari < 0 ? 0 : selisihHari) }
}
