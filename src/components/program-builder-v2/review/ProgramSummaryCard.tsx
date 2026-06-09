import { Calendar, Clock, Dumbbell, User, Target, Hash } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Button } from '../../../components/ui/button'

interface ProgramSummaryCardProps {
  phaseName: string
  method: string
  durationWeeks: number
  clientName: string
  startDate: string
  sessionCount: number
  exerciseCount: number
  totalSets: number
  onEditContext: () => void
  className?: string
}

export function ProgramSummaryCard({
  phaseName,
  method,
  durationWeeks,
  clientName,
  startDate,
  sessionCount,
  exerciseCount,
  totalSets,
  onEditContext,
  className,
}: ProgramSummaryCardProps) {
  const start = startDate ? new Date(startDate) : null
  const startDisplay = start
    ? start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not set'

  const stats = [
    { icon: Calendar, label: 'Start', value: startDisplay },
    { icon: Clock, label: 'Duration', value: `${durationWeeks} weeks` },
    { icon: Dumbbell, label: 'Sessions', value: sessionCount },
    { icon: Hash, label: 'Exercises', value: exerciseCount },
    { icon: Target, label: 'Total Sets', value: totalSets },
  ]

  return (
    <div className={cn('rounded-xl border bg-card p-5 space-y-4', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
            📋
          </div>
          <div>
            <h2 className="text-base font-bold text-[light-primary]">{phaseName}</h2>
            <p className="text-xs text-muted-foreground">
              {method} · {durationWeeks} weeks · {sessionCount} sessions
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-8" onClick={onEditContext}>
          Edit Context
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <s.icon size={12} />
              <span className="text-[10px] uppercase tracking-wide">{s.label}</span>
            </div>
            <div className="text-sm font-semibold text-[light-primary]">{s.value}</div>
          </div>
        ))}
      </div>

      {clientName && (
        <div className="flex items-center gap-2 text-sm">
          <User size={14} className="text-primary" />
          <span className="text-muted-foreground">Assigned to</span>
          <span className="font-semibold text-[light-primary]">{clientName}</span>
        </div>
      )}
    </div>
  )
}
