import { CALENDAR_START_HOUR, VISIBLE_HOURS } from './constants'

interface TimeGridProps {
  children: React.ReactNode
}

export function TimeGrid({ children }: TimeGridProps) {
  return (
    <div className="grid grid-cols-[60px_repeat(7,1fr)]">
      <div className="border-r border-light-border">
        {Array.from({ length: VISIBLE_HOURS }, (_, i) => {
          const hour = CALENDAR_START_HOUR + i
          return (
            <div
              key={hour}
              className="h-16 border-b border-light-border flex items-start justify-end pr-2 pt-1"
            >
              <span className="text-[10px] text-light-muted font-mono">{String(hour).padStart(2, '0')}:00</span>
            </div>
          )
        })}
      </div>
      {children}
    </div>
  )
}
