import { useRef, useMemo } from 'react'
import { isSameDay, isToday } from 'date-fns'
import type { CalendarSession, SessionType } from './types'
import { CALENDAR_START_HOUR, VISIBLE_HOURS } from './constants'
import { useCurrentTime } from './hooks/useCurrentTime'
import { useFilteredSessions } from './hooks/useFilteredSessions'
import { useScrollToHour } from './hooks/useScrollToHour'
import { useTimeIndicator } from './hooks/useTimeIndicator'
import { DayViewHeader } from './DayViewHeader'
import { DayTimeGrid } from './DayTimeGrid'
import { DaySessionOverlay } from './DaySessionOverlay'
import { CurrentTimeLine } from './CurrentTimeLine'
import { DailySummaryPanel } from './DailySummaryPanel'
import type { WorkoutSessionLog } from '@/types/entities'

interface DayViewProps {
  date: Date
  sessions: CalendarSession[]
  filterType: SessionType | 'All'
  onSlotClick: (date: Date, hour: number, minute: number) => void
  onEventClick: (session: CalendarSession) => void
  getWorkoutForSession?: (session: CalendarSession) => WorkoutSessionLog | undefined
}

export function DayView({
  date,
  sessions,
  filterType,
  onSlotClick,
  onEventClick,
  getWorkoutForSession,
}: DayViewProps) {
  const _getWorkout = getWorkoutForSession
  const now = useCurrentTime()
  const scrollRef = useRef<HTMLDivElement>(null)

  useScrollToHour(scrollRef, 7, date)

  const typeFiltered = useFilteredSessions(sessions, filterType)
  const filtered = useMemo(
    () => typeFiltered.filter((session) => isSameDay(session.startTime, date)),
    [typeFiltered, date]
  )

  const { top: timeIndicatorTop } = useTimeIndicator(now)
  const isTodayDate = isToday(date)

  return (
    <div className="flex flex-1 overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="min-w-[400px]">
          <DayViewHeader date={date} />
          <div className="relative">
            <DayTimeGrid>
              {Array.from({ length: VISIBLE_HOURS }, (_, i) => {
                const hour = CALENDAR_START_HOUR + i
                return (
                  <div
                    key={hour}
                    className="h-16 border-b border-light-border hover:bg-cyan-glow transition-colors cursor-pointer"
                    onClick={() => onSlotClick(date, hour, 0)}
                  />
                )
              })}
              {filtered.map((session) => (
                <DaySessionOverlay
                  key={session.id}
                  session={session}
                  onEventClick={onEventClick}
                  hasWorkout={!!_getWorkout?.(session)}
                />
              ))}
            </DayTimeGrid>
            {isTodayDate && <CurrentTimeLine top={timeIndicatorTop} />}
          </div>
        </div>
      </div>
      <DailySummaryPanel sessions={filtered} />
    </div>
  )
}
