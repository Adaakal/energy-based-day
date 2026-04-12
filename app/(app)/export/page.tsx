import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'

export default async function ExportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Export Your Data</h1>
      <p className="text-gray-500 text-sm mb-8">
        Download everything — your check-ins, tasks, and plans as JSON.
        Your data is yours.
      </p>

      <div className="space-y-4">
        <ExportCard
          title="All Data"
          description="Check-ins, tasks, and blocks in one file"
          href="/api/export?type=all"
          accent="bg-gray-900 text-white hover:bg-gray-800"
        />
        <ExportCard
          title="Check-in History"
          description="All daily logs with capacity scores and reflections"
          href="/api/export?type=logs"
          accent="bg-emerald-600 text-white hover:bg-emerald-700"
        />
        <ExportCard
          title="Task Pool"
          description="All your tasks and their settings"
          href="/api/export?type=tasks"
          accent="bg-amber-500 text-white hover:bg-amber-600"
        />
      </div>

      <p className="text-xs text-gray-400 text-center mt-8">
        Data exported as JSON · Includes all history
      </p>
    </div>
  )
}

function ExportCard({ title, description, href, accent }: {
  title: string
  description: string
  href: string
  accent: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
      <a href={href} download>
        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${accent}`}>
          <Download className="w-4 h-4" />
          Export
        </button>
      </a>
    </div>
  )
}
