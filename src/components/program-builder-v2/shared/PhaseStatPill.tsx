import { Clock, Dumbbell, Calendar, Layers } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface PhaseStatPillProps {
  icon: 'duration' | 'exercises' | 'sessions' | 'method'
  value: string
  className?: string
}

const ICON_MAP = {
  duration: Clock,
  exercises: Dumbbell,
  sessions: Calendar,
  method: Layers,
}

export function PhaseStatPill({ icon, value, className }: PhaseStatPillProps) {
  const Icon = ICON_MAP[icon]
  return (
    <div className={cn('flex items-center gap-1 text-xs text-muted-foreground', className)}>
      <Icon size={12} />
      <span>{value}</span>
    </div>
  )
}
