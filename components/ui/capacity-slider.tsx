'use client'

import { cn } from '@/lib/utils'

interface CapacitySliderProps {
  label: string
  emoji: string
  value: number
  onChange: (value: number) => void
  description?: string
  colorClass?: string
}

const dotColors = [
  'bg-red-400',
  'bg-orange-400',
  'bg-amber-400',
  'bg-lime-500',
  'bg-emerald-500',
]

export function CapacitySlider({
  label,
  emoji,
  value,
  onChange,
  description,
  colorClass = 'bg-gray-400',
}: CapacitySliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-gray-800">
            {emoji} {label}
          </span>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <span className="text-2xl font-bold text-gray-900 tabular-nums w-8 text-right">
          {value}
        </span>
      </div>

      {/* Dot indicators */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(dot => (
          <button
            key={dot}
            type="button"
            onClick={() => onChange(dot)}
            className={cn(
              'flex-1 h-3 rounded-full transition-all duration-150',
              dot <= value ? dotColors[dot - 1] : 'bg-gray-200 hover:bg-gray-300'
            )}
            aria-label={`Set ${label} to ${dot}`}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>Very low</span>
        <span>Very high</span>
      </div>
    </div>
  )
}
