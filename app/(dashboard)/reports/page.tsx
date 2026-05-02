'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Loader2, FileSpreadsheet, FileIcon as FilePdf } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { exportToExcel } from '@/lib/export/export-excel'
import { exportToPDF } from '@/lib/export/export-pdf'

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { profile, puskesmas, isSuperAdmin } = useAuth()
  const supabase = createClient()

  // Filters
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [jenis, setJenis] = useState('')
  const [puskesmasFilter, setPuskesmasFilter] = useState('')
  const [puskesmasList, setPuskesmasList] = useState<any[]>([])

  useEffect(() => {
    if (isSuperAdmin) {
      supabase.from('puskesmas').select('id, nama').then(({ data }) => setPuskesmasList(data || []))
    }
  }, [isSuperAdmin, supabase])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('examinations')
        .select(`
          *,
          patients:patient_id(nik, nama, jenis_kelamin),
          profiles:user_id(nama),
          puskesmas:puskesmas_id(nama),
          examination_balita_details(*),
          examination_bumil_details(*),
          examination_busui_details(*),
          examination_lansia_details(*)
        `)
        .gte('tanggal_pemeriksaan', `${startDate}T00:00:00Z`)
        .lte('tanggal_pemeriksaan', `${endDate}T23:59:59Z`)

      // Puskesmas filter
      if (!isSuperAdmin && profile?.puskesmas_id) {
        query = query.eq('puskesmas_id', profile.puskesmas_id)
      } else if (isSuperAdmin && puskesmasFilter) {
        query = query.eq('puskesmas_id', puskesmasFilter)
      }

      // Jenis filter
      if (jenis) {
        query = query.eq('jenis_pemeriksaan', jenis)
      }

      const { data: reportData, error } = await query.order('tanggal_pemeriksaan', { ascending: true })

      if (error) throw error
      setData(reportData || [])
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Gagal mengambil data laporan')
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    if (data.length === 0) return
    const filename = `Laporan_Pemeriksaan_${startDate}_to_${endDate}`
    exportToExcel(data, filename)
  }

  const handleExportPDF = () => {
    if (data.length === 0) return
    const filename = `Laporan_Pemeriksaan_${startDate}_to_${endDate}`
    const title = `Laporan Pemeriksaan ${puskesmas?.nama || 'Puskesmas'}\nPeriode: ${formatDate(startDate)} - ${formatDate(endDate)}`
    exportToPDF(data, filename, title)
  }

  return (
    <>
      <PageHeader 
        title="Laporan & Export Data" 
        description="Filter data pemeriksaan untuk di-export ke Excel atau PDF"
      />

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pemeriksaan</label>
            <Select value={jenis} onChange={(e) => setJenis(e.target.value)}>
              <option value="">Semua Jenis</option>
              <option value="Balita">Balita</option>
              <option value="Ibu_Hamil">Ibu Hamil</option>
              <option value="Ibu_Menyusui">Ibu Menyusui</option>
              <option value="Lansia">Lansia</option>
            </Select>
          </div>
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Puskesmas</label>
              <Select value={puskesmasFilter} onChange={(e) => setPuskesmasFilter(e.target.value)}>
                <option value="">Semua Puskesmas</option>
                {puskesmasList.map(p => (
                  <option key={p.id} value={p.id}>{p.nama}</option>
                ))}
              </Select>
            </div>
          )}
        </div>
        
        <div className="pt-2 flex flex-wrap gap-3">
          <Button onClick={fetchReportData} disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Tampilkan Preview'}
          </Button>
          
          <div className="flex-1"></div>
          
          <Button variant="outline" onClick={handleExportExcel} disabled={data.length === 0 || loading} className="w-full sm:w-auto text-green-700 border-green-200 hover:bg-green-50">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={data.length === 0 || loading} className="w-full sm:w-auto text-red-700 border-red-200 hover:bg-red-50">
            <FilePdf className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Preview Table */}
      {data.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Preview Data ({data.length} baris)</h3>
          <div className="overflow-x-auto max-h-96">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50 shadow-sm z-10">
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pasien</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Diagnosa</TableHead>
                  {isSuperAdmin && <TableHead>Puskesmas</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(exam.tanggal_pemeriksaan)}
                    </TableCell>
                    <TableCell>
                      {exam.patients?.nama}
                    </TableCell>
                    <TableCell>
                      {exam.jenis_pemeriksaan.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {exam.diagnosa || '-'}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-sm text-gray-500">
                        {exam.puskesmas?.nama}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  )
}
