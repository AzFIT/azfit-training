import { useState } from 'react'
import { ClipboardList, CalendarDays, Ruler, Target, Check } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface TrackingOption {
  id: string
  label: string
  description: string
  icon: React.ElementType
  defaultChecked: boolean
}

const TRACKING_OPTIONS: TrackingOption[] = [
  {
    id: 'daily-log',
    label: 'Daily Log',
    description: 'Bodyweight, nutrition, activity tracking',
    icon: ClipboardList,
    defaultChecked: true,
  },
  {
    id: 'weekly-checkin',
    label: 'Weekly Check-In',
    description: 'Sundays — energy, sleep, adherence review',
    icon: CalendarDays,
    defaultChecked: true,
  },
  {
    id: 'measurements',
    label: 'Measurements',
    description: 'Start + every 4 weeks',
    icon: Ruler,
    defaultChecked: true,
  },
  {
    id: 'strength-targets',
    label: 'Strength Targets',
    description: 'Week 4 retest for key lifts',
    icon: Target,
    defaultChecked: true,
  },
]

interface TrackingLinksCardProps {
  onToggle?: (id: string, checked: boolean) => void
  className?: string
}

export function TrackingLinksCard({ onToggle, className }: TrackingLinksCardProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(TRACKING_OPTIONS.filter((o) => o.defaultChecked).map((o) => o.id))
  )

  const toggle = (id: string) => {
    const next = new Set(selected)
    const willCheck = !next.has(id)
    if (willCheck) {
      next.add(id)
    } else {
      next.delete(id)
    }
    setSelected(next)
    onToggle?.(id, willCheck)
  }

  return (
    <div className={cn('rounded-xl border bg-card p-5 space-y-4', className)}>
      <div>
        <h3 className="text-sm font-semibold text-[light-primary]">Linked Tracking</h3>
        <p className="text-xs text-muted-foreground">
          What the client will see and be asked to complete
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TRACKING_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isChecked = selected.has(opt.id)

          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                isChecked
                  ? 'bg-primary/5 border-primary'
                  : 'bg-card border-border hover:border-primary/30'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5',
                  isChecked
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground/30'
                )}
              >
                {isChecked && <Check size={12} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-primary" />
                  <span className="text-sm font-medium text-[light-primary]">{opt.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
