export type CapacityState = 'green' | 'yellow' | 'red'

export type TaskCapacityBand = 'green_only' | 'yellow_green' | 'red_yellow_green'

export type TaskType =
  | 'deep_work'
  | 'admin'
  | 'creative'
  | 'errands'
  | 'social'
  | 'maintenance'
  | 'self_care'

export type EffortLevel = 'low' | 'medium' | 'high'

export type BrainPower = 'deep' | 'light' | 'autopilot'

export type Priority = 'must_do' | 'should_do' | 'nice_to_do'

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'archived'

export type BlockType =
  | 'deep_work'
  | 'admin'
  | 'movement'
  | 'recovery'
  | 'social'
  | 'flex'
  | 'transition'

export interface DailyLog {
  id: string
  user_id: string
  date: string
  energy_level: number
  focus_level: number
  pain_level: number
  capacity_score: number
  capacity_state: CapacityState
  day_tags: string[] | null
  morning_notes: string | null
  minimum_viable_win: string | null
  evening_reflection: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  name: string
  capacity_band: TaskCapacityBand
  task_type: TaskType
  effort_level: EffortLevel
  brain_power: BrainPower
  time_estimate: number | null
  priority: Priority | null
  status: TaskStatus
  notes: string | null
  external_link: string | null
  due_date: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface Block {
  id: string
  user_id: string
  daily_log_id: string
  name: string
  block_type: BlockType
  start_time: string
  end_time: string
  notes: string | null
  completed: boolean
  created_at: string
  updated_at: string
  tasks?: Task[]
}

export interface UserPreferences {
  user_id: string
  green_threshold: number
  yellow_threshold: number
  timezone: string
  start_of_day: string
  setup_complete: boolean
  onboarding_step: number
  created_at: string
  updated_at: string
}

// Capacity calculation
export function calculateCapacity(
  energy: number,
  focus: number,
  pain: number,
  greenThreshold = 8,
  yellowThreshold = 5
): { score: number; state: CapacityState } {
  const score = energy + focus - pain
  if (score >= greenThreshold) return { score, state: 'green' }
  if (score >= yellowThreshold) return { score, state: 'yellow' }
  return { score, state: 'red' }
}

// Task filtering by capacity
export function getTasksForCapacity(
  capacityState: CapacityState,
  tasks: Task[]
): Task[] {
  switch (capacityState) {
    case 'green':
      return tasks.filter(
        t =>
          t.capacity_band === 'green_only' ||
          t.capacity_band === 'yellow_green' ||
          t.capacity_band === 'red_yellow_green'
      )
    case 'yellow':
      return tasks.filter(
        t =>
          t.capacity_band === 'yellow_green' ||
          t.capacity_band === 'red_yellow_green'
      )
    case 'red':
      return tasks.filter(t => t.capacity_band === 'red_yellow_green')
  }
}

export const CAPACITY_CONFIG = {
  green: {
    label: 'Green Day',
    emoji: '🟢',
    color: 'green',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800',
    description: 'High capacity — tackle your most demanding work.',
    tips: [
      '4–5 time blocks',
      'Deep focus sessions',
      'High-effort tasks',
      'Creative and strategic work',
    ],
  },
  yellow: {
    label: 'Yellow Day',
    emoji: '🟡',
    color: 'yellow',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    description: 'Medium capacity — keep it manageable and realistic.',
    tips: [
      '3–4 moderate blocks',
      'Shorter focus sessions',
      'More frequent breaks',
      'Manageable, realistic goals',
    ],
  },
  red: {
    label: 'Red Day',
    emoji: '🔴',
    color: 'red',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    badge: 'bg-red-100 text-red-800',
    description: 'Low capacity — rest is productive. You are enough.',
    tips: [
      '1–2 gentle tasks',
      'Lots of recovery time',
      'Autopilot tasks only',
      'Rest is not laziness',
    ],
  },
} as const

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  deep_work: 'Deep Work',
  admin: 'Admin',
  creative: 'Creative',
  errands: 'Errands',
  social: 'Social',
  maintenance: 'Maintenance',
  self_care: 'Self Care',
}

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  deep_work: 'Deep Work',
  admin: 'Admin',
  movement: 'Movement',
  recovery: 'Recovery',
  social: 'Social',
  flex: 'Flex',
  transition: 'Transition',
}

export const CAPACITY_BAND_LABELS: Record<TaskCapacityBand, string> = {
  green_only: 'Green Only',
  yellow_green: 'Yellow + Green',
  red_yellow_green: 'Any Day',
}

export const EFFORT_LABELS: Record<EffortLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  must_do: 'Must Do',
  should_do: 'Should Do',
  nice_to_do: 'Nice to Do',
}
