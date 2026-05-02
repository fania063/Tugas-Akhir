'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import { CreatePuskesmasDialog } from '@/components/admin/create-puskesmas-dialog'

export default function PuskesmasPage() {
  const [puskesmas, setPuskesmas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { isSuperAdmin } = useAuth()
  const supabase = createClient()

  const fetchPuskesmas = useCallback(async () => {
    if (!isSuperAdmin) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('puskesmas')
        .select('*')
        .order('nama')

      if (error) throw error
      setPuskesmas(data || [])
    } catch (error) {
      console.error('Error fetching puskesmas:', error)
    } finally {
      setLoading(false)
    }
  }, [isSuperAdmin, supabase])

  useEffect(() => {
    fetchPuskesmas()
  }, [fetchPuskesmas])

  if (!isSuperAdmin) {
    return <div className="p-8 text-center text-red-500">Akses ditolak. Anda bukan super admin.</div>
  }

  return (
    <>
      <PageHeader 
        title="Manajemen Puskesmas" 
        description="Kelola daftar puskesmas di sistem"
      >
        <Button onClick={() => setIsDialogOpen(true)}>
          Tambah Puskesmas
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Puskesmas</TableHead>
              <TableHead>Alamat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {puskesmas.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium text-gray-500">{p.kode || '-'}</TableCell>
                <TableCell className="font-semibold text-gray-900">{p.nama}</TableCell>
                <TableCell className="text-sm text-gray-500">{p.alamat || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreatePuskesmasDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchPuskesmas}
      />
    </>
  )
}
