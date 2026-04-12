'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CapacitySlider } from '@/components/ui/capacity-slider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { todayISO } from '@/lib/utils'
import { calculateCapacity as calcCap } from '@/lib/types'

export default function CheckInPage() {
  const router = useRouter()
  const [energy, setEnergy] = useState(3)
  const [focus, setFocus] = useState(3)
  const [pain, setPain] = useState(2)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const preview = calcCap(energy, focus, pain)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { score, state } = calcCap(energy, focus, pain)

    const { data, error } = await supabase
      .from('daily_logs')
      .upsert(
        {
          user_id: user.id,
          date: todayISO(),
          energy_level: energy,
          focus_level: focus,
          pain_level: pain,
          morning_notes: notes || null,
          capacity_score: score,
          capacity_state: state,
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/checkin/result?id=${data.id}`)
  }

  const stateColors = {
    green: 'bg-emerald-50 border-emerald-200',
    yellow: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
  }

  const stateText = {
    green: 'text-emerald-700',
    yellow: 'text-amber-700',
    red: 'text-red-600',
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Good morning!</h1>
        <p className="text-gray-500 mt-1">How are you feeling today?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <CapacitySlider
            label="Energy Level"
            emoji="⚡"
            value={energy}
            onChange={setEnergy}
            description="How physically and mentally energised do you feel?"
          />
          <div className="border-t border-gray-100" />
          <CapacitySlider
            label="Focus Level"
            emoji="🎯"
            value={focus}
            onChange={setFocus}
            description="How well can you concentrate and hold attention?"
          />
          <div className="border-t border-gray-100" />
          <CapacitySlider
            label="Pain / Overwhelm"
            emoji="😰"
            value={pain}
            onChange={setPain}
            description="Physical pain, brain fog, or emotional overwhelm?"
          />
        </div>

        {/* Live preview */}
        <div className={`rounded-xl border p-4 ${stateColors[preview.state]} capacity-transition`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Your capacity today</p>
              <p className={`text-lg font-bold mt-0.5 ${stateText[preview.state]}`}>
                {preview.state === 'green' && '🟢 Green Day'}
                {preview.state === 'yellow' && '🟡 Yellow Day'}
                {preview.state === 'red' && '🔴 Red Day'}
              </p>
            </div>
            <div className={`text-3xl font-bold tabular-nums ${stateText[preview.state]}`}>
              {preview.score}
            </div>
          </div>
        </div>

        {/* Optional notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Morning notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Anything you want to note about today..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate My Capacity →'}
        </Button>
      </form>
    </div>
  )
}
