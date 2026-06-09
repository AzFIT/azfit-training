import { getHours, getMinutes } from 'date-fns'
import type { CalendarSession, SessionType } from './types'
import type { CalendarSession as StoreSession } from '@/types/entities'
import {
  MS_PER_MINUTE,
  CALENDAR_START_HOUR,
  HOUR_HEIGHT,
  STORE_TO_PAGE_TYPE,
  PAGE_TO_STORE_TYPE,
} from './constants'

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MS_PER_MINUTE)
}

export function getSessionPosition(session: CalendarSession, minHeight: number) {
  const start = session.startTime
  const h = getHours(start)
  const m = getMinutes(start)
  const top = (h - CALENDAR_START_HOUR) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT
  const height = Math.max((session.duration / 60) * HOUR_HEIGHT, minHeight)
  return { top, height }
}

export function parseTimeToDate(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}`)
}

export function storeSessionToPage(s: StoreSession): CalendarSession {
  const startTime = parseTimeToDate(s.date, s.startTime)
  const endTime = parseTimeToDate(s.date, s.endTime)
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / MS_PER_MINUTE)
  return {
    id: s.id,
    clientName: s.clientName,
    type: (STORE_TO_PAGE_TYPE[s.type] ?? 'Personal Training') as SessionType,
    startTime,
    duration: Math.max(duration, 15),
    notes: s.notes,
  }
}

export function pageSessionToStore(s: CalendarSession, clientId?: string): StoreSession {
  const date = format(s.startTime, 'yyyy-MM-dd')
  const startTime = format(s.startTime, 'HH:mm')
  const end = addMinutes(s.startTime, s.duration)
  const endTime = format(end, 'HH:mm')
  return {
    id: s.id,
    clientId: clientId ?? '',
    clientName: s.clientName,
    title: s.type,
    date,
    startTime,
    endTime,
    type: (PAGE_TO_STORE_TYPE[s.type] ?? 'session') as import('@/types/entities').SessionType,
    status: 'confirmed',
    notes: s.notes,
  }
}

// Need to import format here to avoid circular dependency issues
import { format } from 'date-fns'
