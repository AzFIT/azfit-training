import { useMemo } from 'react'
import type { CalendarSession, SessionType } from '../types'

export function useFilteredSessions(sessions: CalendarSession[], filterType: SessionType | 'All') {
  return useMemo(
    () => (filterType === 'All' ? sessions : sessions.filter((session) => session.type === filterType)),
    [sessions, filterType]
  )
}
