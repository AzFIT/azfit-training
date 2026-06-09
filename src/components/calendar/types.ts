export type ViewMode = 'week' | 'day' | 'month' | 'agenda'

export type SessionType = 'Personal Training' | 'Group Class' | 'Assessment' | 'Online' | 'Consultation'

export interface CalendarSession {
  id: string
  clientName: string
  type: SessionType
  startTime: Date
  duration: number // minutes
  notes?: string
}
