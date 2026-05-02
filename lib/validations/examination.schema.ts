import { z } from 'zod'

export const examinationSchema = z.object({
  patient_id: z.string().min(1, { message: 'Pasien wajib dipilih' }),
  tanggal_pemeriksaan: z.string().min(1, { message: 'Tanggal wajib diisi' }),
  jenis_pemeriksaan: z.enum(['Balita', 'Ibu_Hamil', 'Ibu_Menyusui', 'Lansia'] as const, { message: 'Pilih jenis pemeriksaan' }),
  berat_badan: z.string().optional(),
  tinggi_badan: z.string().optional(),
  tekanan_darah: z.string().optional(),
  riwayat_penyakit: z.string().optional(),
  keluhan: z.string().optional(),
  diagnosa: z.string().optional(),
  terapi: z.string().optional(),
  keterangan: z.string().optional(),
})

export type ExaminationFormValues = z.infer<typeof examinationSchema>
