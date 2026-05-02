import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate } from '../utils'

export function exportToPDF(data: any[], filename: string, title: string) {
  const doc = new jsPDF('l', 'mm', 'a4') // Landscape A4
  
  // Add title
  doc.setFontSize(16)
  doc.text(title, 14, 15)
  doc.setFontSize(10)
  doc.text(`Dicetak pada: ${formatDate(new Date())}`, 14, 22)

  // Define table columns based on data type or general
  const tableColumn = ["No", "Tanggal", "Pasien", "Jenis", "Diagnosa", "Petugas"]
  const tableRows: any[] = []

  data.forEach((item, index) => {
    const rowData = [
      index + 1,
      formatDate(item.tanggal_pemeriksaan),
      `${item.patients?.nama}\n(${item.patients?.nik})`,
      item.jenis_pemeriksaan.replace('_', ' '),
      item.diagnosa || '-',
      item.profiles?.nama || '-'
    ]
    tableRows.push(rowData)
  })

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 28,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] } // Blue-600
  })

  doc.save(`${filename}.pdf`)
}
