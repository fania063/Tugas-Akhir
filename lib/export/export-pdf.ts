import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate } from '../utils'

export function exportToPDF(data: any[], filename: string, title: string) {
  const doc = new jsPDF('l', 'mm', 'a4')

  doc.setFontSize(16)
  doc.setTextColor(5, 122, 85)
  doc.text('🌸 Posyandu Melati', 14, 12)
  doc.setFontSize(12)
  doc.setTextColor(30, 30, 30)
  doc.text(title.replace(/\\n/g, ' | '), 14, 20)
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Dicetak pada: ${formatDate(new Date().toISOString())}  |  Total: ${data.length} data`, 14, 27)

  const tableColumn = ['No', 'Tanggal', 'Pasien', 'NIK', 'Jenis Pemeriksaan', 'BB/TB', 'Detail Medis', 'Diagnosa', 'Terapi', 'Petugas']
  const tableRows: any[] = []

  data.forEach((item, index) => {
    let detail = ''
    let diagnosa = '-'
    let terapi = '-'

    if (item.jenis_pemeriksaan === 'Balita') {
      const d = Array.isArray(item.examination_balita_details) ? item.examination_balita_details[0] : item.examination_balita_details
      const statusGizi = d?.status_gizi ? `Gizi: ${d.status_gizi}` : ''
      const vaxs = item.vaccination_records?.map((v: any) => v.jenis_vaksin.replace('_', ' ')).join(', ')
      detail = [statusGizi, vaxs ? `Imunisasi: ${vaxs}` : ''].filter(Boolean).join('\n') || '-'
    } else if (item.jenis_pemeriksaan === 'Ibu_Hamil') {
      const d = Array.isArray(item.examination_bumil_details) ? item.examination_bumil_details[0] : item.examination_bumil_details
      const usia = d?.hpht ? `Usia Kandungan dihitung dari HPHT ${formatDate(d.hpht)}` : ''
      const tt = [d?.imunisasi_tt1 && 'TT1', d?.imunisasi_tt2 && 'TT2'].filter(Boolean).join(', ')
      detail = [usia, tt ? `Imunisasi: ${tt}` : ''].filter(Boolean).join('\n') || '-'
      diagnosa = d?.diagnosa || '-'
      terapi = d?.terapi || '-'
    } else if (item.jenis_pemeriksaan === 'Ibu_Menyusui') {
      const d = Array.isArray(item.examination_busui_details) ? item.examination_busui_details[0] : item.examination_busui_details
      detail = [d?.jenis_persalinan && `Persalinan: ${d.jenis_persalinan}`, d?.kondisi_asi && `ASI: ${d.kondisi_asi?.replace(/_/g, ' ')}`].filter(Boolean).join('\n') || '-'
      diagnosa = d?.diagnosa || '-'
      terapi = d?.terapi || '-'
    } else if (item.jenis_pemeriksaan === 'Lansia') {
      const d = Array.isArray(item.examination_lansia_details) ? item.examination_lansia_details[0] : item.examination_lansia_details
      const labs = [
        d?.gula_darah && `GD: ${d.gula_darah}`,
        d?.kolesterol && `Kol: ${d.kolesterol}`,
        d?.asam_urat && `AU: ${d.asam_urat}`,
      ].filter(Boolean).join(' | ')
      detail = labs || '-'
      diagnosa = d?.diagnosa || '-'
      terapi = d?.terapi || '-'
    }

    const bbTb = [item.berat_badan && `${item.berat_badan}kg`, item.tinggi_badan && `${item.tinggi_badan}cm`].filter(Boolean).join(' / ') || '-'

    tableRows.push([
      index + 1,
      formatDate(item.tanggal_pemeriksaan),
      item.patients?.nama || '-',
      item.patients?.nik || '-',
      item.jenis_pemeriksaan?.replace(/_/g, ' ') || '-',
      bbTb,
      detail,
      diagnosa,
      terapi,
      item.profiles?.nama || '-',
    ])
  })

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 32,
    styles: { fontSize: 7.5, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fillColor: [5, 122, 85], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 255, 250] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 22 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 18 },
      6: { cellWidth: 35 },
      7: { cellWidth: 35 },
      8: { cellWidth: 30 },
      9: { cellWidth: 25 },
    },
  })

  doc.save(`${filename}.pdf`)
}
