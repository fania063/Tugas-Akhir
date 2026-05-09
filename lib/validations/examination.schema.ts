import { z } from 'zod'

export const examinationSchema = z.object({
  patient_id: z.string().min(1, { message: 'Pasien wajib dipilih' }),
  tanggal_pemeriksaan: z.string().min(1, { message: 'Tanggal wajib diisi' }),
  jenis_pemeriksaan: z.enum(['Balita', 'Ibu_Hamil', 'Ibu_Menyusui', 'Lansia'] as const, { message: 'Pilih jenis pemeriksaan' }),
  berat_badan: z.string().optional(),
  tinggi_badan: z.string().optional(),
  tekanan_darah: z.string().optional(),
  // Field detail spesifik per jenis (diteruskan ke tabel detail masing-masing)
  detail: z.record(z.string(), z.any()).optional(),
  // Imunisasi balita — checkbox array, diinsert ke vaccination_records
  imunisasi_diberikan: z.union([z.array(z.string()), z.string()]).optional(),
})

export type ExaminationFormValues = z.infer<typeof examinationSchema>
