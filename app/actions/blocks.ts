'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { BlockType } from '@/lib/types'

export async function createBlock(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const taskIds = formData.getAll('task_ids') as string[]

  const { data: block, error } = await supabase
    .from('blocks')
    .insert({
      user_id: user.id,
      daily_log_id: formData.get('daily_log_id') as string,
      name: formData.get('name') as string,
      block_type: formData.get('block_type') as BlockType,
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
      notes: formData.get('notes') as string || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Associate tasks with this block
  if (taskIds.length > 0) {
    const { error: linkError } = await supabase
      .from('block_tasks')
      .insert(taskIds.map(task_id => ({ block_id: block.id, task_id })))

    if (linkError) return { error: linkError.message }
  }

  revalidatePath('/plan')
  return { success: true }
}

export async function updateBlockCompletion(id: string, completed: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('blocks')
    .update({ completed })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/plan')
  return { success: true }
}

export async function deleteBlock(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/plan')
  return { success: true }
}
