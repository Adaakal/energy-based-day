import { cn } from '@/lib/utils'
import { CAPACITY_CONFIG } from '@/lib/types'
import type { CapacityState } from '@/lib/types'

interface CapacityBadgeProps {
  state: CapacityState
  score?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CapacityBadge({ state, score, size = 'md', className }: CapacityBadgeProps) {
  const config = CAPACITY_CONFIG[state]

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded-full',
    md: 'text-sm px-3 py-1 rounded-full font-medium',
    lg: 'text-base px-4 py-1.5 rounded-full font-semibold',
  }

  return (
    <span
      className={cn(
        config.badge,
        sizeClasses[size],
        'inline-flex items-center gap-1',
        className
      )}
    >
      {config.emoji} {config.label}
      {score !== undefined && <span className="opacity-70">({score})</span>}
    </span>
  )
}
