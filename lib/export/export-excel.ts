import * as XLSX from 'xlsx'
import { formatDate } from '../utils'

export function exportToExcel(data: any[], filename: string) {
  const formattedData = data.map((item, index) => {
    const base: any = {
      'No': index + 1,
      'Tanggal': formatDate(item.tanggal_pemeriksaan),
      'Petugas': item.profiles?.nama || '-',
      'NIK Pasien': item.patients?.nik || '-',
      'Nama Pasien': item.patients?.nama || '-',
      'Jenis Kelamin': item.patients?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      'Jenis Pemeriksaan': item.jenis_pemeriksaan?.replace(/_/g, ' ') || '-',
      'Berat Badan (kg)': item.berat_badan || '-',
      'Tinggi Badan (cm)': item.tinggi_badan || '-',
      'Tekanan Darah': item.tekanan_darah || '-',
    }

    if (item.jenis_pemeriksaan === 'Balita') {
      const detail = Array.isArray(item.examination_balita_details)
        ? item.examination_balita_details[0]
        : item.examination_balita_details
      base['Status Gizi'] = detail?.status_gizi || '-'
      const vaxs = item.vaccination_records?.map((v: any) => v.jenis_vaksin.replace('_', ' ')).join(', ')
      base['Imunisasi Diberikan'] = vaxs || '-'
      base['Catatan Balita'] = detail?.catatan || '-'
    } else if (item.jenis_pemeriksaan === 'Ibu_Hamil') {
      const detail = Array.isArray(item.examination_bumil_details)
        ? item.examination_bumil_details[0]
        : item.examination_bumil_details
      base['HPHT'] = detail?.hpht ? formatDate(detail.hpht) : '-'
      base['Tanda Bahaya'] = detail?.tanda_bahaya || '-'
      base['Imunisasi TT1'] = detail?.imunisasi_tt1 ? 'Ya' : 'Tidak'
      base['Tanggal TT1'] = detail?.tanggal_tt1 ? formatDate(detail.tanggal_tt1) : '-'
      base['Imunisasi TT2'] = detail?.imunisasi_tt2 ? 'Ya' : 'Tidak'
      base['Tanggal TT2'] = detail?.tanggal_tt2 ? formatDate(detail.tanggal_tt2) : '-'
      base['Keluhan'] = detail?.keluhan || '-'
      base['Riwayat Penyakit'] = detail?.riwayat_penyakit || '-'
      base['Diagnosa'] = detail?.diagnosa || '-'
      base['Terapi'] = detail?.terapi || '-'
    } else if (item.jenis_pemeriksaan === 'Ibu_Menyusui') {
      const detail = Array.isArray(item.examination_busui_details)
        ? item.examination_busui_details[0]
        : item.examination_busui_details
      base['Jenis Persalinan'] = detail?.jenis_persalinan || '-'
      base['Kondisi ASI'] = detail?.kondisi_asi?.replace(/_/g, ' ') || '-'
      base['Keluhan'] = detail?.keluhan || '-'
      base['Diagnosa'] = detail?.diagnosa || '-'
      base['Terapi'] = detail?.terapi || '-'
      base['Catatan'] = detail?.catatan || '-'
    } else if (item.jenis_pemeriksaan === 'Lansia') {
      const detail = Array.isArray(item.examination_lansia_details)
        ? item.examination_lansia_details[0]
        : item.examination_lansia_details
      base['Gula Darah (mg/dl)'] = detail?.gula_darah || '-'
      base['Kolesterol (mg/dl)'] = detail?.kolesterol || '-'
      base['Asam Urat (mg/dl)'] = detail?.asam_urat || '-'
      base['Keluhan'] = detail?.keluhan || '-'
      base['Riwayat Penyakit'] = detail?.riwayat_penyakit || '-'
      base['Diagnosa'] = detail?.diagnosa || '-'
      base['Terapi'] = detail?.terapi || '-'
      base['Keterangan'] = detail?.keterangan || '-'
    }

    return base
  })

  const worksheet = XLSX.utils.json_to_sheet(formattedData)

  const colWidths = Object.keys(formattedData[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }))
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pemeriksaan')

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}
