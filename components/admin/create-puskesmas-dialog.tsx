'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, X } from 'lucide-react'

interface CreatePuskesmasDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreatePuskesmasDialog({ isOpen, onClose, onSuccess }: CreatePuskesmasDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      kode: formData.get('kode'),
      nama: formData.get('nama'),
      alamat: formData.get('alamat'),
      adminEmail: formData.get('adminEmail'),
      adminPassword: formData.get('adminPassword'),
    }

    try {
      const res = await fetch('/api/admin/puskesmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create Puskesmas')
      }

      onSuccess()
      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Tambah Puskesmas & Admin</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 border-b pb-2">Data Puskesmas</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Puskesmas</label>
              <Input name="kode" required placeholder="Contoh: P12345" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Puskesmas</label>
              <Input name="nama" required placeholder="Contoh: Puskesmas Melati" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <Input name="alamat" required placeholder="Alamat lengkap" />
            </div>
          </div>

          <div className="space-y-4 pt-4 mt-4 border-t">
            <h3 className="font-medium text-gray-900 border-b pb-2">Akun Admin Puskesmas</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Admin</label>
              <Input name="adminEmail" type="email" required placeholder="admin@puskesmas.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input name="adminPassword" type="password" required minLength={6} placeholder="Minimal 6 karakter" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
