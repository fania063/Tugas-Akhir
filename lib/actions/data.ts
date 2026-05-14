'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function deleteExamination(examinationId: string) {
  try {
    await supabaseAdmin.from('examination_balita_details').delete().eq('examination_id', examinationId)
    await supabaseAdmin.from('examination_bumil_details').delete().eq('examination_id', examinationId)
    await supabaseAdmin.from('examination_busui_details').delete().eq('examination_id', examinationId)
    await supabaseAdmin.from('examination_lansia_details').delete().eq('examination_id', examinationId)
    await supabaseAdmin.from('vaccination_records').delete().eq('examination_id', examinationId)
    const { error } = await supabaseAdmin.from('examinations').delete().eq('id', examinationId)
    if (error) throw error

    revalidatePath('/examinations')
    return { success: true }
  } catch (error: any) {
    console.error('[deleteExamination] Error:', error)
    return { success: false, error: error.message }
  }
}

export async function deletePatient(patientId: string) {
  try {
    const { data: exams } = await supabaseAdmin
      .from('examinations')
      .select('id')
      .eq('patient_id', patientId)

    const examIds = (exams || []).map(e => e.id)

    if (examIds.length > 0) {
      await supabaseAdmin.from('examination_balita_details').delete().in('examination_id', examIds)
      await supabaseAdmin.from('examination_bumil_details').delete().in('examination_id', examIds)
      await supabaseAdmin.from('examination_busui_details').delete().in('examination_id', examIds)
      await supabaseAdmin.from('examination_lansia_details').delete().in('examination_id', examIds)
    }

    await supabaseAdmin.from('vaccination_records').delete().eq('patient_id', patientId)

    await supabaseAdmin.from('examinations').delete().eq('patient_id', patientId)

    const { error } = await supabaseAdmin.from('patients').delete().eq('id', patientId)
    if (error) throw error

    revalidatePath('/patients')
    return { success: true }
  } catch (error: any) {
    console.error('[deletePatient] Error:', error)
    return { success: false, error: error.message }
  }
}
