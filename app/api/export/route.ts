import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = req.nextUrl.searchParams.get('type') ?? 'all'

  const result: Record<string, unknown> = {
    exported_at: new Date().toISOString(),
    user_id: user.id,
  }

  if (type === 'all' || type === 'logs') {
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    result.daily_logs = logs ?? []
  }

  if (type === 'all' || type === 'tasks') {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    result.tasks = tasks ?? []
  }

  if (type === 'all') {
    const { data: blocks } = await supabase
      .from('blocks')
      .select('*, block_tasks(task_id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    result.blocks = blocks ?? []
  }

  const filename = `energy-day-designer-${type}-${new Date().toISOString().split('T')[0]}.json`

  return new NextResponse(JSON.stringify(result, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
