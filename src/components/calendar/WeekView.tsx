import { useRef } from 'react'
import { isSameDay, isToday } from 'date-fns'
import type { CalendarSession, SessionType } from './types'
import { CALENDAR_START_HOUR, VISIBLE_HOURS } from './constants'
import { useCurrentTime } from './hooks/useCurrentTime'
import { useFilteredSessions } from './hooks/useFilteredSessions'
import { useScrollToHour } from './hooks/useScrollToHour'
import { useTimeIndicator } from './hooks/useTimeIndicator'
import { WeekViewHeader } from './WeekViewHeader'
import { TimeGrid } from './TimeGrid'
import { SessionOverlay } from './SessionOverlay'
import { CurrentTimeLine } from './CurrentTimeLine'
import type { WorkoutSessionLog } from '@/types/entities'

interface WeekViewProps {
  days: Date[]
  sessions: CalendarSession[]
  filterType: SessionType | 'All'
  onSlotClick: (date: Date, hour: number, minute: number) => void
  onEventClick: (session: CalendarSession) => void
  getWorkoutForSession: (session: CalendarSession) => WorkoutSessionLog | undefined
}

export function WeekView({
  days,
  sessions,
  filterType,
  onSlotClick,
  onEventClick,
  getWorkoutForSession,
}: WeekViewProps) {
  // void getWorkoutForSession — now wired below
  const now = useCurrentTime()
  const scrollRef = useRef<HTMLDivElement>(null)

  useScrollToHour(scrollRef, 7)

  const filtered = useFilteredSessions(sessions, filterType)

  const { top: timeIndicatorTop, visible: showTimeIndicator } = useTimeIndicator(now)

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto">
      <div className="min-w-[900px]">
        <WeekViewHeader days={days} />
        <div className="relative">
          <TimeGrid>
            {days.map((day) => {
              const today = isToday(day)
              return (
                <div
                  key={day.toISOString()}
                  className={`border-r border-light-border relative ${
                    today ? 'bg-[rgba(0,174,239,0.03)]' : ''
                  }`}
                  style={today ? { borderLeft: '2px solid cyan' } : {}}
                >
                  {Array.from({ length: VISIBLE_HOURS }, (_, i) => {
                    const hour = CALENDAR_START_HOUR + i
                    return (
                      <div
                        key={hour}
                        className="h-16 border-b border-light-border hover:bg-[rgba(0,174,239,0.06)] transition-colors cursor-pointer"
                        onClick={() => onSlotClick(day, hour, 0)}
                      />
                    )
                  })}

                  {filtered
                    .filter((s) => isSameDay(s.startTime, day))
                    .map((session) => (
                      <SessionOverlay
                        key={session.id}
                        session={session}
                        onEventClick={onEventClick}
                        minHeight={32}
                        hasWorkout={!!getWorkoutForSession(session)}
                      />
                    ))}
                </div>
              )
            })}
          </TimeGrid>
          {showTimeIndicator && <CurrentTimeLine top={timeIndicatorTop} />}
        </div>
      </div>
    </div>
  )
}
