import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameDay,
  isSameMonth,
} from 'date-fns'
import type { CalendarSession, SessionType } from './types'
import { SESSION_COLORS } from './constants'
import { useFilteredSessions } from './hooks/useFilteredSessions'

interface MonthViewProps {
  currentDate: Date
  sessions: CalendarSession[]
  filterType: SessionType | 'All'
  onDayClick: (date: Date) => void
}

export function MonthView({
  currentDate,
  sessions,
  filterType,
  onDayClick,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calendarDays = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart, calendarEnd]
  )

  const filtered = useFilteredSessions(sessions, filterType)

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center py-2">
              <span className="text-[11px] text-[light-muted] uppercase font-semibold">{d}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 auto-rows-fr gap-1">
          {calendarDays.map((day, idx) => {
            const inMonth = isSameMonth(day, currentDate)
            const today = isToday(day)
            const daySessions = filtered.filter((s) => isSameDay(s.startTime, day))

            return (
              <motion.div
                key={day.toISOString()}
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.005 }}
                className={`min-h-[110px] rounded-lg p-2 cursor-pointer transition-colors border ${
                  inMonth ? 'bg-[white]' : 'bg-[light-surface] opacity-50'
                } ${today ? 'border-cyan bg-[rgba(0,174,239,0.05)]' : 'border-[light-border]'}`}
                onClick={() => onDayClick(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      today ? 'text-cyan' : inMonth ? 'text-[light-primary]' : 'text-[light-border]'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {today && (
                    <span className="text-[8px] bg-cyan text-white px-1 rounded-full">Today</span>
                  )}
                </div>

                {/* Session dots */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {daySessions.slice(0, 4).map((s) => (
                    <div
                      key={s.id}
                      className="w-2 h-2 rounded-full"
                      style={{ background: SESSION_COLORS[s.type].text }}
                      title={`${s.clientName} - ${s.type}`}
                    />
                  ))}
                  {daySessions.length > 4 && (
                    <span className="text-[9px] text-[light-muted]">+{daySessions.length - 4}</span>
                  )}
                </div>

                {/* Mini session labels */}
                <div className="mt-1 space-y-0.5">
                  {daySessions.slice(0, 2).map((s) => (
                    <div
                      key={s.id}
                      className="text-[9px] truncate px-1 py-0.5 rounded"
                      style={{
                        background: SESSION_COLORS[s.type].bg,
                        color: SESSION_COLORS[s.type].text,
                      }}
                    >
                      {format(s.startTime, 'HH:mm')} {s.clientName}
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
