import * as XLSX from 'xlsx'
import { formatDate } from '../utils'

export function exportToExcel(data: any[], filename: string) {
  // Format data
  const formattedData = data.map((item, index) => {
    // Common columns
    const base: any = {
      'No': index + 1,
      'Tanggal': formatDate(item.tanggal_pemeriksaan),
      'Puskesmas': item.puskesmas?.nama || '-',
      'Petugas': item.profiles?.nama || '-',
      'NIK Pasien': item.patients?.nik,
      'Nama Pasien': item.patients?.nama,
      'Jenis Kelamin': item.patients?.jenis_kelamin,
      'Jenis Pemeriksaan': item.jenis_pemeriksaan.replace('_', ' '),
      'Berat Badan (kg)': item.berat_badan || '-',
      'Tinggi Badan (cm)': item.tinggi_badan || '-',
      'Tekanan Darah': item.tekanan_darah || '-',
      'Keluhan': item.keluhan || '-',
      'Diagnosa': item.diagnosa || '-',
      'Terapi': item.terapi || '-',
    }

    // Detail columns based on type
    if (item.jenis_pemeriksaan === 'Balita' && item.examination_balita_details?.[0]) {
      const detail = item.examination_balita_details[0]
      base['Ket NTOB'] = detail.ket_ntob || '-'
      base['Vitamin A'] = detail.vit_a || '-'
      base['BGM'] = detail.is_bgm ? 'Ya' : 'Tidak'
      base['BGT'] = detail.is_bgt ? 'Ya' : 'Tidak'
      base['HB < 7'] = detail.hb_less_7 ? 'Ya' : 'Tidak'
    } else if (item.jenis_pemeriksaan === 'Ibu_Hamil' && item.examination_bumil_details?.[0]) {
      const detail = item.examination_bumil_details[0]
      base['HPHT'] = detail.hpht ? formatDate(detail.hpht) : '-'
      base['TP'] = detail.tp ? formatDate(detail.tp) : '-'
      base['GPA'] = detail.gpa || '-'
      base['LILA (cm)'] = detail.lila_cm || '-'
    } else if (item.jenis_pemeriksaan === 'Ibu_Menyusui' && item.examination_busui_details?.[0]) {
      const detail = item.examination_busui_details[0]
      base['Nama Bayi'] = detail.nama_bayi || '-'
      base['Jenis Persalinan'] = detail.jenis_persalinan || '-'
      base['Kondisi ASI'] = detail.kondisi_asi || '-'
    } else if (item.jenis_pemeriksaan === 'Lansia' && item.examination_lansia_details?.[0]) {
      const detail = item.examination_lansia_details[0]
      base['Gula Darah'] = detail.gula_darah || '-'
      base['Kolesterol'] = detail.kolesterol || '-'
    }

    return base
  })

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pemeriksaan")

  // Download
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}
