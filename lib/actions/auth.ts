'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Client khusus Admin menggunakan Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function registerUser(formData: {
  email: string
  password?: string
  nama: string
  role: 'admin' | 'petugas'
  puskesmas_id?: string
}) {
  try {
    // 1. Buat User di Auth Supabase menggunakan Admin API
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password || 'password123',
      email_confirm: true,
      user_metadata: {
        nama: formData.nama,
        role: formData.role,
        puskesmas_id: formData.puskesmas_id
      }
    })

    if (authError) throw authError

    revalidatePath('/admin/users')
    return { success: true, message: `Akun ${formData.role} berhasil didaftarkan` }
  } catch (error: any) {
    console.error('Error registering user:', error)
    return { success: false, error: error.message }
  }
}
