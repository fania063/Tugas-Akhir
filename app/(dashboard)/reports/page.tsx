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
  const { profile } = useAuth()
  const supabase = createClient()

  // Filters
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [jenis, setJenis] = useState('')
  const [puskesmasFilter, setPuskesmasFilter] = useState('')
  const [puskesmasList, setPuskesmasList] = useState<any[]>([])


  const fetchReportData = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('examinations')
        .select(`
          *,
          patients:patient_id(nik, nama, jenis_kelamin),
          profiles:user_id(nama),
          examination_balita_details(*),
          examination_bumil_details(*),
          examination_busui_details(*),
          examination_lansia_details(*),
          vaccination_records(*)
        `)
        .gte('tanggal_pemeriksaan', `${startDate}T00:00:00Z`)
        .lte('tanggal_pemeriksaan', `${endDate}T23:59:59Z`)

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
    const title = `Laporan Pemeriksaan Posyandu Melati\nPeriode: ${formatDate(startDate)} - ${formatDate(endDate)}`
    exportToPDF(data, filename, title)
  }

  const getExamSummary = (exam: any) => {
    const details = []
    if (exam.berat_badan) details.push(`BB: ${exam.berat_badan}kg`)
    if (exam.tinggi_badan) details.push(`TB: ${exam.tinggi_badan}cm`)
    if (exam.tekanan_darah) details.push(`TD: ${exam.tekanan_darah}`)
    
    switch (exam.jenis_pemeriksaan) {
      case 'Balita':
        const balita = exam.examination_balita_details?.[0]
        if (balita?.status_gizi) details.push(`Gizi: ${balita.status_gizi}`)
        const vaxs = exam.vaccination_records?.map((v: any) => v.jenis_vaksin.replace('_', ' ')).join(', ')
        if (vaxs) details.push(`Imunisasi: ${vaxs}`)
        break
      case 'Ibu_Hamil':
        const bumil = exam.examination_bumil_details?.[0]
        if (bumil?.diagnosa) details.push(`Dx: ${bumil.diagnosa}`)
        if (bumil?.keluhan) details.push(`Keluhan: ${bumil.keluhan}`)
        break
      case 'Ibu_Menyusui':
        const busui = exam.examination_busui_details?.[0]
        if (busui?.kondisi_asi) details.push(`ASI: ${busui.kondisi_asi.replace('_', ' ')}`)
        if (busui?.diagnosa) details.push(`Dx: ${busui.diagnosa}`)
        break
      case 'Lansia':
        const lansia = exam.examination_lansia_details?.[0]
        if (lansia?.diagnosa) details.push(`Dx: ${lansia.diagnosa}`)
        if (lansia?.gula_darah) details.push(`Gula: ${lansia.gula_darah}`)
        break
    }
    return details.join(' | ') || '-'
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
          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 shadow-sm z-10">
                <TableRow>
                  <TableHead className="w-[120px]">Tanggal</TableHead>
                  <TableHead>Pasien</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Ringkasan Informasi</TableHead>
                  <TableHead>Petugas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(exam.tanggal_pemeriksaan)}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{exam.patients?.nama}</div>
                      <div className="text-xs text-slate-500">{exam.patients?.nik}</div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {exam.jenis_pemeriksaan.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-md">
                      {getExamSummary(exam)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {exam.profiles?.nama}
                    </TableCell>
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
