import { cn } from '../../../lib/utils'

interface WeekTimelineProps {
  phaseName: string
  durationWeeks: number
  startDate: string
  className?: string
}

export function WeekTimeline({ phaseName, durationWeeks, startDate, className }: WeekTimelineProps) {
  const start = startDate ? new Date(startDate) : new Date()

  const weeks = Array.from({ length: durationWeeks }, (_, i) => {
    const weekStart = new Date(start)
    weekStart.setDate(start.getDate() + i * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    return {
      number: i + 1,
      label: `W${i + 1}`,
      dateRange: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    }
  })

  return (
    <div className={cn('rounded-xl border bg-card p-5 space-y-3', className)}>
      <h3 className="text-sm font-semibold text-[light-primary]">Program Timeline</h3>

      <div className="space-y-2">
        {weeks.map((week) => (
          <div
            key={week.number}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{week.label}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[light-primary] truncate">
                {phaseName}
              </div>
              <div className="text-xs text-muted-foreground">{week.dateRange}</div>
            </div>
            <div className="w-24 h-1.5 rounded-full bg-background overflow-hidden shrink-0">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${(week.number / durationWeeks) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
