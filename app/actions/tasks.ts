'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { TaskCapacityBand, TaskType, EffortLevel, BrainPower, Priority, TaskStatus } from '@/lib/types'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const timeEstimate = formData.get('time_estimate')

  const { error } = await supabase.from('tasks').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    capacity_band: formData.get('capacity_band') as TaskCapacityBand,
    task_type: formData.get('task_type') as TaskType,
    effort_level: formData.get('effort_level') as EffortLevel,
    brain_power: formData.get('brain_power') as BrainPower,
    priority: formData.get('priority') as Priority || null,
    time_estimate: timeEstimate ? parseInt(timeEstimate as string) : null,
    notes: formData.get('notes') as string || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  return { success: true }
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const timeEstimate = formData.get('time_estimate')

  const { error } = await supabase
    .from('tasks')
    .update({
      name: formData.get('name') as string,
      capacity_band: formData.get('capacity_band') as TaskCapacityBand,
      task_type: formData.get('task_type') as TaskType,
      effort_level: formData.get('effort_level') as EffortLevel,
      brain_power: formData.get('brain_power') as BrainPower,
      priority: formData.get('priority') as Priority || null,
      time_estimate: timeEstimate ? parseInt(timeEstimate as string) : null,
      notes: formData.get('notes') as string || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  return { success: true }
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const updates: Record<string, unknown> = { status }
  if (status === 'completed') updates.completed_at = new Date().toISOString()

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  revalidatePath('/plan')
  return { success: true }
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  return { success: true }
}
