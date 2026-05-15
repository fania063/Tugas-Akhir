'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Client khusus Admin menggunakan Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** Ambil semua user beserta email dari auth.users, digabung dengan data profiles */
export async function listUsers() {
  try {
    // 1. Ambil semua user dari auth (termasuk email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    if (authError) throw authError

    // 2. Ambil semua profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (profileError) throw profileError

    // 3. Gabungkan: map email dari auth ke profiles
    const emailMap = new Map(authData.users.map(u => [u.id, u.email ?? '']))
    const merged = (profiles || []).map(p => ({
      ...p,
      email: emailMap.get(p.id) ?? '',
    }))

    return { success: true, data: merged }
  } catch (error: any) {
    console.error('Error listing users:', error)
    return { success: false, error: error.message, data: [] }
  }
}

export async function registerUser(formData: {
  email: string
  password?: string
  nama: string
  role: 'admin' | 'petugas'
}) {
  try {
    const { error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password || 'password123',
      email_confirm: true,
      user_metadata: {
        nama: formData.nama,
        role: formData.role,
      }
    })

    if (authError) throw authError

    revalidatePath('/admin/users')
    return { success: true, message: `Akun ${formData.role} atas nama "${formData.nama}" berhasil didaftarkan.` }
  } catch (error: any) {
    console.error('Error registering user:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteUser(userId: string) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) throw error

    revalidatePath('/admin/users')
    return { success: true, message: 'Akun petugas berhasil dihapus.' }
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return { success: false, error: error.message }
  }
}

export async function updateUser(userId: string, data: {
  nama?: string
  role?: 'admin' | 'petugas'
  email?: string
  password?: string
}) {
  try {
    const updateData: any = {
      user_metadata: {}
    }
    
    if (data.email) updateData.email = data.email
    if (data.password) updateData.password = data.password
    if (data.nama) updateData.user_metadata.nama = data.nama
    if (data.role) updateData.user_metadata.role = data.role

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData)
    if (authError) throw authError

    // Manually update profiles table as well to ensure sync
    const profileUpdate: any = {}
    if (data.nama) profileUpdate.nama = data.nama
    if (data.role) profileUpdate.role = data.role
    
    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId)
      if (profileError) throw profileError
    }

    revalidatePath('/admin/users')
    return { success: true, message: 'Data petugas berhasil diperbarui.' }
  } catch (error: any) {
    console.error('Error updating user:', error)
    return { success: false, error: error.message }
  }
}
