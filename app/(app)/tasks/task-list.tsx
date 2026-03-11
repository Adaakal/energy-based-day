'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { createTask, updateTask, deleteTask } from '@/app/actions/tasks'
import {
  CAPACITY_BAND_LABELS, TASK_TYPE_LABELS, EFFORT_LABELS, PRIORITY_LABELS,
  type Task, type TaskCapacityBand, type TaskType, type EffortLevel,
  type BrainPower, type Priority
} from '@/lib/types'
import { cn, formatDuration } from '@/lib/utils'

const bandColors: Record<TaskCapacityBand, string> = {
  green_only: 'green',
  yellow_green: 'yellow',
  red_yellow_green: 'red',
}

interface TaskFormData {
  name: string
  capacity_band: TaskCapacityBand
  task_type: TaskType
  effort_level: EffortLevel
  brain_power: BrainPower
  priority: Priority | ''
  time_estimate: string
  notes: string
}

const defaultForm: TaskFormData = {
  name: '',
  capacity_band: 'yellow_green',
  task_type: 'admin',
  effort_level: 'medium',
  brain_power: 'light',
  priority: 'should_do',
  time_estimate: '',
  notes: '',
}

function TaskForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: TaskFormData
  onSave: (data: TaskFormData) => Promise<void>
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<TaskFormData>(initial ?? defaultForm)

  function set<K extends keyof TaskFormData>(key: K, val: TaskFormData[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="space-y-1.5">
        <Label>Task name *</Label>
        <Input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="What do you need to do?"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Capacity band *</Label>
          <Select value={form.capacity_band} onValueChange={v => set('capacity_band', v as TaskCapacityBand)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="green_only">🟢 Green Only</SelectItem>
              <SelectItem value="yellow_green">🟡 Yellow + Green</SelectItem>
              <SelectItem value="red_yellow_green">🔴 Any Day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Type *</Label>
          <Select value={form.task_type} onValueChange={v => set('task_type', v as TaskType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TASK_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Effort *</Label>
          <Select value={form.effort_level} onValueChange={v => set('effort_level', v as EffortLevel)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Brain power *</Label>
          <Select value={form.brain_power} onValueChange={v => set('brain_power', v as BrainPower)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="deep">Deep</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="autopilot">Autopilot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={v => set('priority', v as Priority)}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="must_do">Must Do</SelectItem>
              <SelectItem value="should_do">Should Do</SelectItem>
              <SelectItem value="nice_to_do">Nice to Do</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Time estimate (min)</Label>
          <Input
            type="number"
            min={1}
            value={form.time_estimate}
            onChange={e => set('time_estimate', e.target.value)}
            placeholder="30"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Any additional context..."
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onSave(form)}
          disabled={saving || !form.name.trim()}
          className="flex-1"
        >
          {saving ? 'Saving...' : 'Save Task'}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

function TaskCard({ task, onDelete }: { task: Task; onDelete: () => void }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const bandVariant = bandColors[task.capacity_band] as 'green' | 'yellow' | 'red'

  async function handleSave(data: TaskFormData) {
    setSaving(true)
    const form = new FormData()
    Object.entries(data).forEach(([k, v]) => { if (v) form.set(k, String(v)) })
    await updateTask(task.id, form)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Delete this task?')) return
    setDeleting(true)
    await deleteTask(task.id)
    onDelete()
    router.refresh()
  }

  if (editing) {
    return (
      <TaskForm
        initial={{
          name: task.name,
          capacity_band: task.capacity_band,
          task_type: task.task_type,
          effort_level: task.effort_level,
          brain_power: task.brain_power,
          priority: task.priority ?? '',
          time_estimate: task.time_estimate ? String(task.time_estimate) : '',
          notes: task.notes ?? '',
        }}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
        saving={saving}
      />
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm leading-snug">{task.name}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge variant={bandVariant}>{CAPACITY_BAND_LABELS[task.capacity_band]}</Badge>
              <Badge variant="outline">{TASK_TYPE_LABELS[task.task_type]}</Badge>
              {task.time_estimate && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {formatDuration(task.time_estimate)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-xs text-gray-500">
            <div><span className="font-medium text-gray-700">Effort:</span> {EFFORT_LABELS[task.effort_level]}</div>
            <div><span className="font-medium text-gray-700">Brain:</span> {task.brain_power}</div>
            <div><span className="font-medium text-gray-700">Priority:</span> {task.priority ? PRIORITY_LABELS[task.priority] : '—'}</div>
            {task.notes && <div className="col-span-3 mt-1"><span className="font-medium text-gray-700">Notes:</span> {task.notes}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

const bandOrder: TaskCapacityBand[] = ['green_only', 'yellow_green', 'red_yellow_green']
const bandGroupLabels = {
  green_only: '🟢 Green Only',
  yellow_green: '🟡 Yellow + Green',
  red_yellow_green: '🔴 Any Day',
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<TaskCapacityBand | 'all'>('all')
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const visibleTasks = tasks.filter(t =>
    !deletedIds.has(t.id) && (filter === 'all' || t.capacity_band === filter)
  )

  const grouped = bandOrder.reduce((acc, band) => {
    const bandTasks = visibleTasks.filter(t => t.capacity_band === band)
    if (bandTasks.length > 0) acc[band] = bandTasks
    return acc
  }, {} as Partial<Record<TaskCapacityBand, Task[]>>)

  async function handleCreate(data: TaskFormData) {
    setSaving(true)
    const form = new FormData()
    Object.entries(data).forEach(([k, v]) => { if (v) form.set(k, String(v)) })
    const result = await createTask(form)
    setSaving(false)
    if (result?.error) {
      alert(result.error)
      return
    }
    setShowForm(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', ...bandOrder] as const).map(b => (
            <button
              key={b}
              onClick={() => setFilter(b)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                filter === b ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {b === 'all' ? 'All' : b === 'green_only' ? '🟢' : b === 'yellow_green' ? '🟡' : '🔴'}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <TaskForm
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
          saving={saving}
        />
      )}

      {/* Task groups */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-1">No tasks yet</p>
          <p className="text-sm">Add your first task to build your pool</p>
        </div>
      ) : (
        Object.entries(grouped).map(([band, bandTasks]) => (
          <div key={band}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {bandGroupLabels[band as TaskCapacityBand]}
            </p>
            <div className="space-y-2">
              {bandTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={() => setDeletedIds(s => new Set([...s, task.id]))}
                />
              ))}
            </div>
          </div>
        ))
      )}

      <p className="text-center text-xs text-gray-400 pt-2">
        {visibleTasks.length} task{visibleTasks.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
