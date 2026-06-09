import { Dumbbell, Timer, Hash, Flame } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { BuilderSession } from '../../../types/program-builder-v2'

interface SessionStatsProps {
  session: BuilderSession
  className?: string
}

export function SessionStats({ session, className }: SessionStatsProps) {
  const exerciseCount = session.exercises.length
  const totalSets = session.exercises.reduce((sum, e) => sum + e.sets, 0)

  // Estimate time: ~2 min per set (including rest) + 5 min warmup
  const avgRestSeconds = session.exercises.reduce((sum, e) => sum + e.restSeconds, 0) / (exerciseCount || 1)
  const estimatedSeconds = totalSets * (avgRestSeconds + 45) + 300 // 45s per set work + rest avg
  const estimatedMinutes = Math.round(estimatedSeconds / 60)

  // Total TUT
  const totalTUT = session.exercises.reduce((sum, e) => sum + (e.tut || 0), 0)

  const stats = [
    { icon: Dumbbell, label: 'Exercises', value: exerciseCount },
    { icon: Hash, label: 'Total Sets', value: totalSets },
    { icon: Timer, label: 'Est. Time', value: `~${estimatedMinutes} min` },
    { icon: Flame, label: 'Total TUT', value: `${totalTUT}s` },
  ]

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border"
        >
          <stat.icon size={14} className="text-primary" />
          <div>
            <div className="text-xs font-semibold text-[light-primary]">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
