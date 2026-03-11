import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { CapacityBadge } from '@/components/ui/capacity-badge'
import { todayISO } from '@/lib/utils'
import type { DailyLog, CapacityState } from '@/lib/types'
import { CAPACITY_CONFIG } from '@/lib/types'
import { CalendarDays, CheckSquare, ListTodo, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'there'

  // Today's log
  const { data: todayLog } = await supabase
    .from('daily_logs')
    .select()
    .eq('user_id', user.id)
    .eq('date', todayISO())
    .single<DailyLog>()

  // Recent logs (last 7 days)
  const { data: recentLogs } = await supabase
    .from('daily_logs')
    .select('id, date, capacity_state, capacity_score')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(7)

  // Task counts
  const { count: taskCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .neq('status', 'archived')

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {name}!</h1>
        <p className="text-gray-500 mt-1 text-sm">How is your capacity today?</p>
      </div>

      {/* Today's status card */}
      {todayLog ? (
        <div className={`rounded-2xl border-2 p-6 mb-6 ${CAPACITY_CONFIG[todayLog.capacity_state as CapacityState].bg} ${CAPACITY_CONFIG[todayLog.capacity_state as CapacityState].border}`}>
          <p className="text-sm font-medium text-gray-600 mb-2">Today&apos;s check-in</p>
          <CapacityBadge state={todayLog.capacity_state as CapacityState} score={todayLog.capacity_score} size="lg" />
          <p className={`mt-2 text-sm ${CAPACITY_CONFIG[todayLog.capacity_state as CapacityState].text}`}>
            {CAPACITY_CONFIG[todayLog.capacity_state as CapacityState].description}
          </p>
          <div className="flex gap-2 mt-4">
            <Link href={`/plan?logId=${todayLog.id}`} className="flex-1">
              <Button variant={todayLog.capacity_state === 'green' ? 'green' : todayLog.capacity_state === 'yellow' ? 'yellow' : 'red'} className="w-full">
                View Day Plan <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/checkin">
              <Button variant="outline">Update</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center mb-6">
          <p className="text-3xl mb-3">🌅</p>
          <h2 className="font-semibold text-gray-900 mb-1">Start your day</h2>
          <p className="text-sm text-gray-500 mb-4">
            Rate your energy, focus, and pain to get a personalised plan
          </p>
          <Link href="/checkin">
            <Button size="lg">Do My Check-In</Button>
          </Link>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{taskCount ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Tasks</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{recentLogs?.length ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Check-ins</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {recentLogs?.filter(l => l.capacity_state === 'green').length ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Green days</p>
        </div>
      </div>

      {/* Recent capacity history */}
      {(recentLogs?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Recent days</h2>
          <div className="space-y-2">
            {recentLogs!.map((log) => {
              const config = CAPACITY_CONFIG[log.capacity_state as CapacityState]
              return (
                <div key={log.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {format(parseISO(log.date), 'EEE, MMM d')}
                  </span>
                  <CapacityBadge state={log.capacity_state as CapacityState} score={log.capacity_score} size="sm" />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick nav */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/tasks">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-gray-300 transition-colors cursor-pointer">
            <ListTodo className="w-5 h-5 text-gray-600 mb-2" />
            <p className="font-medium text-gray-900 text-sm">Task Pool</p>
            <p className="text-xs text-gray-400 mt-0.5">Manage your tasks</p>
          </div>
        </Link>
        <Link href="/checkin">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-gray-300 transition-colors cursor-pointer">
            <CheckSquare className="w-5 h-5 text-gray-600 mb-2" />
            <p className="font-medium text-gray-900 text-sm">Check In</p>
            <p className="text-xs text-gray-400 mt-0.5">Rate your capacity</p>
          </div>
        </Link>
      </div>

      {/* No tasks nudge */}
      {(taskCount ?? 0) === 0 && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm font-medium text-amber-800 mb-1">Set up your task pool</p>
          <p className="text-xs text-amber-700 mb-3">
            Add 10–20 tasks tagged by energy level to get personalised daily plans.
          </p>
          <Link href="/tasks">
            <Button size="sm" variant="yellow">Add Tasks →</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
