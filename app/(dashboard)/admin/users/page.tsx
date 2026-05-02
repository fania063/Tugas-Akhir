'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { profile, isSuperAdmin, isAdmin } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function fetchUsers() {
      if (!isAdmin) return
      
      setLoading(true)
      try {
        let query = supabase
          .from('profiles')
          .select('*, puskesmas:puskesmas_id(nama)')

        if (!isSuperAdmin && profile?.puskesmas_id) {
          query = query.eq('puskesmas_id', profile.puskesmas_id)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        setUsers(data || [])
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    if (profile) {
      fetchUsers()
    }
  }, [profile, isAdmin, isSuperAdmin, supabase])

  if (!isAdmin) {
    return <div className="p-8 text-center text-red-500">Akses ditolak. Anda bukan admin.</div>
  }

  return (
    <>
      <PageHeader 
        title="Manajemen Petugas" 
        description={isSuperAdmin ? "Kelola akun petugas dan admin" : "Kelola akun petugas puskesmas Anda"}
      >
        <Button>
          Buat Akun Petugas Baru
        </Button>
      </PageHeader>

      {/* Note: In a real app, creating a user requires interacting with Supabase Admin API 
          or an Edge Function because client-side sign up logs the current user out. 
          For this demo, we just display the users list. */}
      
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6 text-sm text-blue-800">
        <strong>Info:</strong> Fitur pembuatan akun baru memerlukan setup API Route dengan <i>service_role</i> key agar tidak me-logout sesi Anda saat ini.
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Role</TableHead>
              {isSuperAdmin && <TableHead>Puskesmas</TableHead>}
              <TableHead>No. HP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nama}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase
                    ${u.role === 'super_admin' ? 'bg-red-100 text-red-800' : 
                      u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </TableCell>
                {isSuperAdmin && (
                  <TableCell className="text-sm text-gray-500">
                    {u.puskesmas?.nama || '-'}
                  </TableCell>
                )}
                <TableCell className="text-sm text-gray-500">{u.no_hp || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  )
}
