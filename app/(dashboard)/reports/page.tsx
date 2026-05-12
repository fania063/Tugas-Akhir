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
  const [filterMode, setFilterMode] = useState<'month' | 'range'>('month')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [jenis, setJenis] = useState('')
  const [puskesmasFilter, setPuskesmasFilter] = useState('')
  const [puskesmasList, setPuskesmasList] = useState<any[]>([])
  const [previewTitle, setPreviewTitle] = useState('')
  const [exportDateRange, setExportDateRange] = useState({ start: '', end: '' })


  const fetchReportData = async () => {
    setLoading(true)
    try {
      let activeStart = startDate
      let activeEnd = endDate
      let title = ''

      if (filterMode === 'month') {
        const year = parseInt(selectedMonth.split('-')[0])
        const month = parseInt(selectedMonth.split('-')[1])
        activeStart = `${year}-${String(month).padStart(2, '0')}-01`
        const lastDay = new Date(year, month, 0).getDate()
        activeEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
        
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
        title = `Bulan ${monthNames[month - 1]} ${year}`
      } else {
        title = `Periode ${formatDate(startDate)} - ${formatDate(endDate)}`
      }
      
      setPreviewTitle(title)
      setExportDateRange({ start: activeStart, end: activeEnd })

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
        .gte('tanggal_pemeriksaan', `${activeStart}T00:00:00Z`)
        .lte('tanggal_pemeriksaan', `${activeEnd}T23:59:59Z`)

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
    const filename = `Laporan_Pemeriksaan_${exportDateRange.start}_to_${exportDateRange.end}`
    exportToExcel(data, filename)
  }

  const handleExportPDF = () => {
    if (data.length === 0) return
    const filename = `Laporan_Pemeriksaan_${exportDateRange.start}_to_${exportDateRange.end}`
    const title = `Laporan Pemeriksaan Posyandu Melati\n${previewTitle}`
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

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 border-r pr-6 border-slate-100">
            <label className="block text-sm font-semibold text-slate-800 mb-2">Mode Waktu</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${filterMode === 'month' ? 'bg-white shadow text-emerald-700' : 'text-slate-500 hover:text-slate-900'}`}
                onClick={() => setFilterMode('month')}
              >Per Bulan</button>
              <button 
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${filterMode === 'range' ? 'bg-white shadow text-emerald-700' : 'text-slate-500 hover:text-slate-900'}`}
                onClick={() => setFilterMode('range')}
              >Rentang</button>
            </div>
          </div>
          
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterMode === 'month' ? (
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pilih Bulan</label>
                <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full sm:w-1/2" />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Dari Tanggal</label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Sampai Tanggal</label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Pemeriksaan</label>
              <Select value={jenis} onChange={(e) => setJenis(e.target.value)}>
                <option value="">Semua Jenis</option>
                <option value="Balita">Balita</option>
                <option value="Ibu_Hamil">Ibu Hamil</option>
                <option value="Ibu_Menyusui">Ibu Menyusui</option>
                <option value="Lansia">Lansia</option>
              </Select>
            </div>
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
      {data.length > 0 && previewTitle && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-lg font-bold text-slate-800">
              Hasil Laporan <span className="text-emerald-600">— {previewTitle}</span>
            </h3>
            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
              Total: {data.length} Data
            </span>
          </div>
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
