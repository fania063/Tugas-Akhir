import { z } from 'zod'

export const patientSchema = z.object({
  nik: z.string().length(16, { message: 'NIK harus 16 digit' }).regex(/^\d+$/, { message: 'NIK hanya boleh angka' }),
  no_bpjs: z.string().optional(),
  nama: z.string().min(2, { message: 'Nama minimal 2 karakter' }),
  jenis_kelamin: z.enum(['L', 'P'] as const, { message: 'Pilih jenis kelamin' }),
  tanggal_lahir: z.string().min(1, { message: 'Tanggal lahir wajib diisi' }),
  alamat: z.string().optional(),
  no_hp: z.string().optional(),
  nama_ayah: z.string().optional(),
  nama_ibu: z.string().optional(),
  nama_suami: z.string().optional(),
})

export type PatientFormValues = z.infer<typeof patientSchema>
