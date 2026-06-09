import { useMemo } from 'react'
import { getHours, getMinutes } from 'date-fns'
import { CALENDAR_START_HOUR, CALENDAR_END_HOUR, HOUR_HEIGHT } from '../constants'

export function useTimeIndicator(now: Date) {
  const top = useMemo(() => {
    const h = getHours(now)
    const m = getMinutes(now)
    return (h - CALENDAR_START_HOUR + m / 60) * HOUR_HEIGHT
  }, [now])

  const visible = useMemo(() => {
    const h = getHours(now)
    return h >= CALENDAR_START_HOUR && h < CALENDAR_END_HOUR
  }, [now])

  return { top, visible }
}
