'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { registerUser, deleteUser, updateUser } from '@/lib/actions/auth'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Plus, X, UserPlus, Trash2, Pencil, Save } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nama: '',
    role: 'petugas' as 'admin' | 'petugas',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { profile, isAdmin } = useAuth()
  const supabase = createClient()

  async function fetchUsers() {
    if (!isAdmin) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile) fetchUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, isAdmin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    if (editingId) {
      const result = await updateUser(editingId, {
        nama: formData.nama,
        role: formData.role,
        password: formData.password || undefined
      })
      if (result.success) {
        alert(result.message)
        setShowForm(false)
        setEditingId(null)
        setFormData({ email: '', password: '', nama: '', role: 'petugas' })
        fetchUsers()
      } else {
        alert('Gagal: ' + result.error)
      }
    } else {
      const result = await registerUser(formData)
      if (result.success) {
        alert(result.message)
        setShowForm(false)
        setFormData({ email: '', password: '', nama: '', role: 'petugas' })
        fetchUsers()
      } else {
        alert('Gagal: ' + result.error)
      }
    }
    setSubmitting(false)
  }

  const handleDelete = async (userId: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus petugas "${nama}"?`)) return
    
    setDeletingId(userId)
    const result = await deleteUser(userId)
    if (result.success) {
      alert(result.message)
      fetchUsers()
    } else {
      alert('Gagal: ' + result.error)
    }
    setDeletingId(null)
  }

  const startEdit = (u: any) => {
    setEditingId(u.id)
    setFormData({
      email: '', // Email not easily available in profiles
      password: '',
      nama: u.nama,
      role: u.role,
    })
    setShowForm(true)
  }

  const toggleForm = () => {
    if (showForm) {
      setEditingId(null)
      setFormData({ email: '', password: '', nama: '', role: 'petugas' })
    }
    setShowForm(!showForm)
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-semibold">Akses ditolak. Hanya Admin yang dapat mengakses halaman ini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Kelola Petugas" 
        description="Manajemen akun petugas Posyandu Melati"
      >
        <Button
          onClick={toggleForm}
          variant={showForm ? 'outline' : 'default'}
          className={`gap-2 ${!showForm ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Batal' : 'Tambah Petugas'}
        </Button>
      </PageHeader>

      {showForm && (
        <div className="p-6 bg-white border border-emerald-100 rounded-3xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-6 text-emerald-700">
            {editingId ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            <h3 className="text-lg font-bold">{editingId ? 'Edit Akun Petugas' : 'Daftarkan Akun Petugas Baru'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
              <Input 
                id="input-nama-petugas"
                required 
                placeholder="Contoh: Siti Rahayu" 
                value={formData.nama}
                onChange={e => setFormData({...formData, nama: e.target.value})}
              />
            </div>
            {!editingId && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Login</label>
                <Input 
                  id="input-email-petugas"
                  required 
                  type="email" 
                  placeholder="siti@posyandumelati.id" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{editingId ? 'Kata Sandi Baru (Kosongkan jika tetap)' : 'Kata Sandi'}</label>
              <Input 
                id="input-password-petugas"
                required={!editingId}
                type="password" 
                placeholder={editingId ? 'Masukkan sandi baru' : 'Minimal 6 karakter'} 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Peran (Role)</label>
              <select 
                id="select-role-petugas"
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as 'admin' | 'petugas'})}
              >
                <option value="petugas">Petugas</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="md:col-span-2 pt-2 flex gap-3">
              <Button
                id="btn-daftarkan-petugas"
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (editingId ? <Save className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />)}
                {editingId ? 'Simpan Perubahan' : 'Daftarkan Akun'}
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={toggleForm}
                  className="rounded-xl"
                >
                  Batal
                </Button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="py-4">Nama Petugas</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-bold text-slate-900 py-4">{u.nama}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'}`}>
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Aktif
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    {u.id !== profile?.id && (
                      <>
                        <button
                          className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit petugas"
                          onClick={() => startEdit(u)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus petugas"
                          onClick={() => handleDelete(u.id, u.nama)}
                          disabled={deletingId === u.id}
                        >
                          {deletingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </>
                    )}
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
