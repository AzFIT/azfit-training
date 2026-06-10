import { format, isToday } from 'date-fns'

interface DayViewHeaderProps {
  date: Date
}

export function DayViewHeader({ date }: DayViewHeaderProps) {
  return (
    <div className="grid grid-cols-[80px_1fr] border-b border-light-border bg-white sticky top-0 z-20">
      <div className="h-14 border-r border-light-border" />
      <div className="h-14 flex items-center px-4">
        <span className="text-light-primary font-semibold text-sm">{format(date, 'EEEE, d MMMM yyyy')}</span>
        {isToday(date) && (
          <span className="ml-2 text-[10px] bg-cyan text-white px-2 py-0.5 rounded-full">Today</span>
        )}
      </div>
    </div>
  )
}
