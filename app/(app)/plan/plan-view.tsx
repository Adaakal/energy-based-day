'use client'

import { useState, useTransition } from 'react'
import { Plus, Check, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CapacityBadge } from '@/components/ui/capacity-badge'
import { Badge } from '@/components/ui/badge'
import { createBlock, updateBlockCompletion, deleteBlock } from '@/app/actions/blocks'
import { updateMinimumViableWin } from '@/app/actions/daily-log'
import {
  getTasksForCapacity, CAPACITY_CONFIG, CAPACITY_BAND_LABELS,
  BLOCK_TYPE_LABELS, TASK_TYPE_LABELS,
  type DailyLog, type Task, type Block, type CapacityState, type BlockType
} from '@/lib/types'
import { cn, formatTime, calculateDuration, formatDuration } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

// ── Block card ─────────────────────────────────────────────────────────────

function BlockCard({ block, capacityState, onDelete }: {
  block: Block
  capacityState: CapacityState
  onDelete: (id: string) => void
}) {
  const [completed, setCompleted] = useState(block.completed)
  const [expanded, setExpanded] = useState(false)
  const [pending, startTransition] = useTransition()
  const config = CAPACITY_CONFIG[capacityState]
  const duration = calculateDuration(block.start_time, block.end_time)

  function toggleComplete() {
    const next = !completed
    setCompleted(next)
    startTransition(async () => { await updateBlockCompletion(block.id, next) })
  }

  return (
    <div className={cn(
      'bg-white rounded-xl border shadow-sm transition-opacity',
      completed && 'opacity-60'
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={toggleComplete}
            disabled={pending}
            className={cn(
              'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
              completed
                ? `${config.border} bg-${capacityState === 'green' ? 'emerald' : capacityState === 'yellow' ? 'amber' : 'red'}-500`
                : 'border-gray-300 hover:border-gray-400'
            )}
          >
            {completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={cn('font-medium text-gray-900 text-sm', completed && 'line-through text-gray-400')}>
                {block.name}
              </p>
              <Badge variant="outline" className="text-xs">{BLOCK_TYPE_LABELS[block.block_type]}</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(block.start_time)} – {formatTime(block.end_time)} · {formatDuration(duration)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded(e => !e)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button onClick={() => onDelete(block.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {(block.tasks ?? []).length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Tasks in this block</p>
                <div className="space-y-1">
                  {block.tasks!.map(task => (
                    <div key={task.id} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                      <span>{task.name}</span>
                      {task.time_estimate && (
                        <span className="text-gray-400">({formatDuration(task.time_estimate)})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {block.notes && (
              <p className="text-xs text-gray-500 italic">{block.notes}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Add block form ─────────────────────────────────────────────────────────

function AddBlockForm({
  logId,
  matchedTasks,
  onCancel,
  onSaved,
}: {
  logId: string
  matchedTasks: Task[]
  onCancel: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [blockType, setBlockType] = useState<BlockType>('admin')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  function toggleTask(id: string) {
    setSelectedTasks(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    const form = new FormData()
    form.set('daily_log_id', logId)
    form.set('name', name)
    form.set('block_type', blockType)
    form.set('start_time', startTime)
    form.set('end_time', endTime)
    form.set('notes', notes)
    selectedTasks.forEach(id => form.append('task_ids', id))
    await createBlock(form)
    setSaving(false)
    onSaved()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Add Time Block</h3>

      <div className="space-y-1.5">
        <Label>Block name *</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Morning admin sprint" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={blockType} onValueChange={v => setBlockType(v as BlockType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(BLOCK_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div /> {/* spacer */}
        <div className="space-y-1.5">
          <Label>Start time</Label>
          <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>End time</Label>
          <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
      </div>

      {matchedTasks.length > 0 && (
        <div className="space-y-1.5">
          <Label>Add tasks from your matched pool</Label>
          <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2">
            {matchedTasks.map(task => (
              <label key={task.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-1">
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => toggleTask(task.id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 flex-1">{task.name}</span>
                {task.time_estimate && (
                  <span className="text-xs text-gray-400">{formatDuration(task.time_estimate)}</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any context for this block..." />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving || !name.trim()} className="flex-1">
          {saving ? 'Saving...' : 'Save Block'}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

// ── Main plan view ─────────────────────────────────────────────────────────

export function PlanView({ log, allTasks, blocks: initialBlocks }: {
  log: DailyLog
  allTasks: Task[]
  blocks: Block[]
}) {
  const [blocks, setBlocks] = useState(initialBlocks)
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [mvw, setMvw] = useState(log.minimum_viable_win ?? '')
  const [savingMvw, setSavingMvw] = useState(false)
  const [pending, startTransition] = useTransition()

  const config = CAPACITY_CONFIG[log.capacity_state as CapacityState]
  const matchedTasks = getTasksForCapacity(log.capacity_state as CapacityState, allTasks)

  async function handleSaveMvw() {
    setSavingMvw(true)
    await updateMinimumViableWin(log.id, mvw)
    setSavingMvw(false)
  }

  async function handleDeleteBlock(id: string) {
    if (!confirm('Remove this block?')) return
    startTransition(async () => { await deleteBlock(id) })
    setBlocks(b => b.filter(x => x.id !== id))
  }

  const dateStr = format(parseISO(log.date), 'EEEE, MMMM d')

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <CapacityBadge state={log.capacity_state as CapacityState} score={log.capacity_score} />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{dateStr}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{config.description}</p>
      </div>

      {/* Minimum viable win */}
      <div className={cn('rounded-xl border p-4 mb-6', config.bg, config.border)}>
        <p className="text-sm font-semibold text-gray-700 mb-2">🎯 Minimum Viable Win</p>
        <div className="flex gap-2">
          <Input
            value={mvw}
            onChange={e => setMvw(e.target.value)}
            placeholder="If you do one thing today, what would matter most?"
            className="flex-1 bg-white/80"
          />
          <Button
            size="sm"
            onClick={handleSaveMvw}
            disabled={savingMvw}
            variant={log.capacity_state === 'green' ? 'green' : log.capacity_state === 'yellow' ? 'yellow' : 'red'}
          >
            {savingMvw ? '...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Matched tasks summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Available tasks for a {config.label} ({matchedTasks.length})
        </p>
        {matchedTasks.length === 0 ? (
          <p className="text-sm text-gray-400">
            No tasks tagged for this capacity level yet.{' '}
            <a href="/tasks" className="underline text-gray-600">Add tasks →</a>
          </p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {matchedTasks.slice(0, 6).map(t => (
              <span key={t.id} className={cn('text-xs px-2 py-0.5 rounded-full', config.badge)}>
                {t.name}
              </span>
            ))}
            {matchedTasks.length > 6 && (
              <span className="text-xs text-gray-400 px-2 py-0.5">+{matchedTasks.length - 6} more</span>
            )}
          </div>
        )}
      </div>

      {/* Time blocks */}
      <div className="space-y-3 mb-4">
        {blocks.length === 0 && !showAddBlock && (
          <div className={cn('rounded-xl border-2 border-dashed p-8 text-center', config.border, config.bg)}>
            <p className="text-sm text-gray-500">No time blocks yet</p>
            <p className="text-xs text-gray-400 mt-1">Add your first block to build your plan</p>
          </div>
        )}
        {blocks.map(block => (
          <BlockCard
            key={block.id}
            block={block}
            capacityState={log.capacity_state as CapacityState}
            onDelete={handleDeleteBlock}
          />
        ))}

        {showAddBlock && (
          <AddBlockForm
            logId={log.id}
            matchedTasks={matchedTasks}
            onCancel={() => setShowAddBlock(false)}
            onSaved={() => {
              setShowAddBlock(false)
              window.location.reload()
            }}
          />
        )}
      </div>

      {!showAddBlock && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAddBlock(true)}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Block
        </Button>
      )}

      {/* Evening reflection placeholder */}
      {blocks.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Check off blocks as you complete them. You&apos;ve got this.
          </p>
        </div>
      )}
    </div>
  )
}
