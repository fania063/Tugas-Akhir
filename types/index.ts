export type Role = 'super_admin' | 'admin' | 'petugas'

export type Puskesmas = {
  id: string
  nama: string
  alamat: string | null
  kode: string | null
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  nama: string
  no_hp: string | null
  role: Role
  puskesmas_id: string | null
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
  created_at: string
  updated_at: string
}

export type JenisPemeriksaan = 'Balita' | 'Ibu_Hamil' | 'Ibu_Menyusui' | 'Lansia'

export type Examination = {
  id: string
  patient_id: string
  user_id: string
  puskesmas_id: string
  tanggal_pemeriksaan: string
  jenis_pemeriksaan: JenisPemeriksaan
  berat_badan: number | null
  tinggi_badan: number | null
  tekanan_darah: string | null
  riwayat_penyakit: string | null
  keluhan: string | null
  diagnosa: string | null
  terapi: string | null
  keterangan: string | null
  created_at: string
  updated_at: string
}
