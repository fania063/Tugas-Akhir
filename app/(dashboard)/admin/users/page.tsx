'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { registerUser } from '@/lib/actions/auth'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Plus, X, UserPlus } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [puskesmasList, setPuskesmasList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nama: '',
    role: 'petugas' as 'admin' | 'petugas',
    puskesmas_id: ''
  })

  const { profile, isSuperAdmin, isAdmin } = useAuth()
  const supabase = createClient()

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

  async function fetchPuskesmas() {
    if (!isSuperAdmin) return
    const { data } = await supabase.from('puskesmas').select('id, nama')
    setPuskesmasList(data || [])
  }

  useEffect(() => {
    if (profile) {
      fetchUsers()
      fetchPuskesmas()
    }
  }, [profile, isAdmin, isSuperAdmin])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    const result = await registerUser({
      ...formData,
      puskesmas_id: (isSuperAdmin ? formData.puskesmas_id : profile?.puskesmas_id) || undefined
    })

    if (result.success) {
      alert(result.message)
      setShowForm(false)
      setFormData({ email: '', password: '', nama: '', role: 'petugas', puskesmas_id: '' })
      fetchUsers()
    } else {
      alert('Gagal: ' + result.error)
    }
    setSubmitting(false)
  }

  if (!isAdmin) {
    return <div className="p-8 text-center text-red-500">Akses ditolak. Anda bukan admin.</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Manajemen Petugas" 
        description={isSuperAdmin ? "Kelola akun petugas dan admin seluruh puskesmas" : "Kelola akun petugas puskesmas Anda"}
      >
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} className="gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Batal' : 'Tambah Petugas Baru'}
        </Button>
      </PageHeader>

      {showForm && (
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-6 text-blue-600">
            <UserPlus className="w-5 h-5" />
            <h3 className="text-lg font-bold">Pendaftaran Akun Baru</h3>
          </div>
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
              <Input 
                required 
                placeholder="Contoh: Budi Santoso" 
                value={formData.nama}
                onChange={e => setFormData({...formData, nama: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Login</label>
              <Input 
                required 
                type="email" 
                placeholder="budi@puskesmas.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Kata Sandi</label>
              <Input 
                required 
                type="password" 
                placeholder="Minimal 6 karakter" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Peran (Role)</label>
              <select 
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as any})}
              >
                <option value="petugas">Petugas (Poli/Puskesmas)</option>
                {isSuperAdmin && <option value="admin">Admin Puskesmas</option>}
              </select>
            </div>
            {isSuperAdmin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Penempatan Puskesmas</label>
                <select 
                  required
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.puskesmas_id}
                  onChange={e => setFormData({...formData, puskesmas_id: e.target.value})}
                >
                  <option value="">-- Pilih Puskesmas --</option>
                  {puskesmasList.map(p => (
                    <option key={p.id} value={p.id}>{p.nama}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="md:col-span-2 pt-4">
              <Button type="submit" disabled={submitting} className="w-full md:w-auto px-8 py-6 rounded-2xl text-base shadow-lg shadow-blue-100">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                Daftarkan Akun
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="py-4">Nama Petugas</TableHead>
                <TableHead>Peran</TableHead>
                {isSuperAdmin && <TableHead>Unit Puskesmas</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Terdaftar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-bold text-slate-900 py-4">{u.nama}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${u.role === 'super_admin' ? 'bg-red-100 text-red-700' : 
                        u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="text-sm text-slate-600 font-medium">
                      {u.puskesmas?.nama || '-'}
                    </TableCell>
                  )}
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Aktif
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                    Belum ada petugas yang terdaftar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
