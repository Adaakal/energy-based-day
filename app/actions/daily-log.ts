'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { todayISO } from '@/lib/utils'

export async function createOrUpdateDailyLog(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const energy_level = parseInt(formData.get('energy_level') as string)
  const focus_level = parseInt(formData.get('focus_level') as string)
  const pain_level = parseInt(formData.get('pain_level') as string)
  const morning_notes = formData.get('morning_notes') as string || null
  const date = todayISO()

  const { data, error } = await supabase
    .from('daily_logs')
    .upsert(
      {
        user_id: user.id,
        date,
        energy_level,
        focus_level,
        pain_level,
        morning_notes,
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/plan')
  redirect(`/checkin/result?id=${data.id}`)
}

export async function updateMinimumViableWin(logId: string, minimumViableWin: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('daily_logs')
    .update({ minimum_viable_win: minimumViableWin })
    .eq('id', logId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/plan')
  return { success: true }
}

export async function updateEveningReflection(logId: string, reflection: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('daily_logs')
    .update({ evening_reflection: reflection })
    .eq('id', logId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/plan')
  return { success: true }
}
