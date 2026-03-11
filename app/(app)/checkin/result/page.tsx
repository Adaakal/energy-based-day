import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CAPACITY_CONFIG } from '@/lib/types'
import { Button } from '@/components/ui/button'
import type { DailyLog, CapacityState } from '@/lib/types'

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function CheckInResultPage({ searchParams }: Props) {
  const { id } = await searchParams
  if (!id) redirect('/checkin')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: log } = await supabase
    .from('daily_logs')
    .select()
    .eq('id', id)
    .eq('user_id', user.id)
    .single<DailyLog>()

  if (!log) notFound()

  const config = CAPACITY_CONFIG[log.capacity_state as CapacityState]

  const bgClasses = {
    green: 'bg-emerald-50',
    yellow: 'bg-amber-50',
    red: 'bg-red-50',
  }

  const borderClasses = {
    green: 'border-emerald-200',
    yellow: 'border-amber-200',
    red: 'border-red-200',
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">Your capacity today</p>
      </div>

      {/* Capacity card */}
      <div className={`rounded-2xl border-2 p-8 text-center mb-6 ${bgClasses[log.capacity_state as CapacityState]} ${borderClasses[log.capacity_state as CapacityState]}`}>
        <div className="text-5xl mb-3">{config.emoji}</div>
        <h1 className={`text-3xl font-bold mb-1 ${config.text}`}>{config.label}</h1>
        <p className="text-gray-500 text-sm">Score: {log.capacity_score}</p>
        <p className={`mt-3 font-medium ${config.text}`}>{config.description}</p>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">What this means for today</h2>
        <ul className="space-y-2">
          {config.tips.map((tip, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                log.capacity_state === 'green' ? 'bg-emerald-500' :
                log.capacity_state === 'yellow' ? 'bg-amber-500' : 'bg-red-400'
              }`} />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Score breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Your ratings</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{log.energy_level}</p>
            <p className="text-xs text-gray-500 mt-0.5">⚡ Energy</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{log.focus_level}</p>
            <p className="text-xs text-gray-500 mt-0.5">🎯 Focus</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{log.pain_level}</p>
            <p className="text-xs text-gray-500 mt-0.5">😰 Pain</p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <Link href={`/plan?logId=${log.id}&state=${log.capacity_state}`} className="block">
          <Button className="w-full" size="lg">
            See My Matched Tasks →
          </Button>
        </Link>
        <Link href="/dashboard" className="block">
          <Button variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
