import type { SessionType } from './types'

export const SESSION_COLORS: Record<SessionType, { bg: string; border: string; text: string }> = {
  'Personal Training': { bg: 'rgba(0,174,239,0.15)', border: 'rgba(0,174,239,0.5)', text: '#0284C7' },
  'Group Class': { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.5)', text: '#7C3AED' },
  Assessment: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.5)', text: '#16A34A' },
  Online: { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.5)', text: '#EA580C' },
  Consultation: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.5)', text: '#2563EB' },
}

export const SESSION_TYPE_LABELS: SessionType[] = [
  'Personal Training',
  'Group Class',
  'Assessment',
  'Online',
  'Consultation',
]

export const HK_TIME_SLOTS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

export const HOUR_HEIGHT = 64
export const MS_PER_MINUTE = 60000
export const CALENDAR_START_HOUR = 5
export const CALENDAR_END_HOUR = 22
export const VISIBLE_HOURS = CALENDAR_END_HOUR - CALENDAR_START_HOUR
export const SCROLL_TO_HOUR = 7

/* ─── Store ↔ Page session adapters ─── */
export const STORE_TO_PAGE_TYPE: Record<string, SessionType> = {
  session: 'Personal Training',
  group: 'Group Class',
  assessment: 'Assessment',
  personal: 'Online',
  'follow-up': 'Consultation',
}

export const PAGE_TO_STORE_TYPE: Record<SessionType, string> = {
  'Personal Training': 'session',
  'Group Class': 'group',
  Assessment: 'assessment',
  Online: 'personal',
  Consultation: 'follow-up',
}
