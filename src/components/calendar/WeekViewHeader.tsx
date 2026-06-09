import { format, isToday } from 'date-fns'

interface WeekViewHeaderProps {
  days: Date[]
}

export function WeekViewHeader({ days }: WeekViewHeaderProps) {
  return (
    <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[light-border] bg-[white] sticky top-0 z-20">
      <div className="h-12 border-r border-[light-border]" />
      {days.map((day) => {
        const today = isToday(day)
        return (
          <div
            key={day.toISOString()}
            className={`h-12 flex flex-col items-center justify-center border-r border-[light-border] ${
              today ? 'bg-[rgba(0,174,239,0.05)]' : ''
            }`}
          >
            <span className="text-[light-muted] text-[10px] uppercase font-medium">{format(day, 'EEE')}</span>
            <span className={`text-sm font-semibold ${today ? 'text-cyan' : 'text-[light-primary]'}`}>
              {format(day, 'd')}
            </span>
            {today && (
              <span className="text-[8px] bg-cyan text-white px-1 rounded-full">Today</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
