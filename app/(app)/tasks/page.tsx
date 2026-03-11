import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TaskList } from './task-list'
import type { Task } from '@/lib/types'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tasks } = await supabase
    .from('tasks')
    .select()
    .eq('user_id', user.id)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Pool</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your tasks, tagged by energy level required
          </p>
        </div>
      </div>

      <TaskList tasks={(tasks ?? []) as Task[]} />
    </div>
  )
}
