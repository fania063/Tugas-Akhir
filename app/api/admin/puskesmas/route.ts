import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabaseServer = await createClient()

    // 1. Verify current user is super_admin
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { kode, nama, alamat, adminEmail, adminPassword } = body

    if (!kode || !nama || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    const { data: puskesmas, error: puskesmasError } = await supabaseAdmin
      .from('puskesmas')
      .insert({ kode, nama, alamat })
      .select()
      .single()

    if (puskesmasError) {
      console.error('Error creating puskesmas:', puskesmasError)
      return NextResponse.json({ error: 'Failed to create Puskesmas' }, { status: 500 })
    }

    // 2b. Create Admin Auth User
    const { data: adminUser, error: adminUserError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    })

    if (adminUserError) {
      console.error('Error creating admin user:', adminUserError)
      // Cleanup the created puskesmas if user creation failed
      await supabaseAdmin.from('puskesmas').delete().eq('id', puskesmas.id)
      return NextResponse.json({ error: adminUserError.message }, { status: 400 })
    }

    // 2c. Update profile for the new admin user
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: 'admin',
        puskesmas_id: puskesmas.id
      })
      .eq('id', adminUser.user.id)

    if (profileError) {
      console.error('Error updating admin profile:', profileError)
      // Since Auth user is already created, cleaning it up requires another admin call
      await supabaseAdmin.auth.admin.deleteUser(adminUser.user.id)
      await supabaseAdmin.from('puskesmas').delete().eq('id', puskesmas.id)
      return NextResponse.json({ error: 'Failed to assign admin role' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      puskesmas,
      adminUser: { id: adminUser.user.id, email: adminUser.user.email }
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
