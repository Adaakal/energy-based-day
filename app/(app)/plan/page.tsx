import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlanView } from './plan-view'
import { Button } from '@/components/ui/button'
import { todayISO } from '@/lib/utils'
import type { DailyLog, Task, Block } from '@/lib/types'

interface Props {
  searchParams: Promise<{ logId?: string; state?: string }>
}

export default async function PlanPage({ searchParams }: Props) {
  const { logId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load today's log (or the specified one)
  let log: DailyLog | null = null

  if (logId) {
    const { data } = await supabase
      .from('daily_logs')
      .select()
      .eq('id', logId)
      .eq('user_id', user.id)
      .single()
    log = data
  } else {
    const { data } = await supabase
      .from('daily_logs')
      .select()
      .eq('user_id', user.id)
      .eq('date', todayISO())
      .single()
    log = data
  }

  if (!log) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🌅</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">No check-in yet today</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Start with your morning check-in to get a personalised day plan
        </p>
        <Link href="/checkin">
          <Button size="lg">Do My Check-In</Button>
        </Link>
      </div>
    )
  }

  // Load all user tasks (not archived/completed)
  const { data: tasks } = await supabase
    .from('tasks')
    .select()
    .eq('user_id', user.id)
    .in('status', ['not_started', 'in_progress'])
    .order('created_at', { ascending: false })

  // Load today's blocks with their tasks
  const { data: blocks } = await supabase
    .from('blocks')
    .select(`
      *,
      block_tasks (
        task_id,
        tasks (*)
      )
    `)
    .eq('daily_log_id', log.id)
    .order('start_time')

  const blocksWithTasks: Block[] = (blocks ?? []).map((b) => {
    const raw = b as Record<string, unknown>
    const { block_tasks, ...rest } = raw
    return {
      ...rest,
      tasks: ((block_tasks as Array<{ tasks: Task }>) ?? []).map(bt => bt.tasks),
    } as Block
  })

  return (
    <PlanView
      log={log as DailyLog}
      allTasks={(tasks ?? []) as Task[]}
      blocks={blocksWithTasks}
    />
  )
}
