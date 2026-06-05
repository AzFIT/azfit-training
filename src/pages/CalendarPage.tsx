import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  LayoutGrid,
  List,
  Plus,
  Filter,
  User,
} from 'lucide-react'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addMonths,
  subMonths,
  isToday,
  isSameDay,
  isSameMonth,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
} from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAppDataStore } from '@/stores/useAppDataStore'
import { useSessionList, useClientList } from '@/stores/useAppDataStore.selectors'
import type { CalendarSession as StoreSession } from '@/types/entities'

type ViewMode = 'week' | 'day' | 'month' | 'agenda'

type SessionType = 'Personal Training' | 'Group Class' | 'Assessment' | 'Online' | 'Consultation'

interface CalendarSession {
  id: string
  clientName: string
  type: SessionType
  startTime: Date
  duration: number // minutes
  notes?: string
}

/* ─── Motion helper ─── */
function motionEnter<T extends Record<string, unknown>>(
  reduce: boolean | null,
  initial: T,
  transition?: import('framer-motion').Transition
): { initial: T | false; transition?: import('framer-motion').Transition } {
  if (reduce) return { initial: false }
  return { initial, transition }
}

const SESSION_COLORS: Record<SessionType, { bg: string; border: string; text: string }> = {
  'Personal Training': { bg: 'rgba(0,174,239,0.2)', border: 'rgba(0,174,239,0.5)', text: '#00AEEF' },
  'Group Class': { bg: 'rgba(139,92,246,0.2)', border: 'rgba(139,92,246,0.5)', text: '#8B5CF6' },
  'Assessment': { bg: 'rgba(34,197,94,0.2)', border: 'rgba(34,197,94,0.5)', text: '#22C55E' },
  'Online': { bg: 'rgba(249,115,22,0.2)', border: 'rgba(249,115,22,0.5)', text: '#F97316' },
  'Consultation': { bg: 'rgba(59,130,246,0.2)', border: 'rgba(59,130,246,0.5)', text: '#3B82F6' },
}

const SESSION_TYPE_LABELS: SessionType[] = [
  'Personal Training',
  'Group Class',
  'Assessment',
  'Online',
  'Consultation',
]

const HK_TIME_SLOTS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]

const HOUR_HEIGHT = 64
const MS_PER_MINUTE = 60000
const HOURS_IN_DAY = 24
const SCROLL_TO_HOUR = 7

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MS_PER_MINUTE)
}

function getSessionPosition(session: CalendarSession, minHeight: number) {
  const start = session.startTime
  const h = getHours(start)
  const m = getMinutes(start)
  const top = h * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT
  const height = Math.max((session.duration / 60) * HOUR_HEIGHT, minHeight)
  return { top, height }
}

/* ─── Store ↔ Page session adapters ─── */
const STORE_TO_PAGE_TYPE: Record<string, SessionType> = {
  session: 'Personal Training',
  group: 'Group Class',
  assessment: 'Assessment',
  personal: 'Online',
  'follow-up': 'Consultation',
}

const PAGE_TO_STORE_TYPE: Record<SessionType, string> = {
  'Personal Training': 'session',
  'Group Class': 'group',
  Assessment: 'assessment',
  Online: 'personal',
  Consultation: 'follow-up',
}

function parseTimeToDate(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}`)
}

function storeSessionToPage(s: StoreSession): CalendarSession {
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

function pageSessionToStore(s: CalendarSession, clientId?: string): StoreSession {
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

/* ─── Time indicator hook ─── */
function useCurrentTime() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), MS_PER_MINUTE)
    return () => clearInterval(timer)
  }, [])
  return now
}

/* ─── Filter hook ─── */
function useFilteredSessions(sessions: CalendarSession[], filterType: SessionType | 'All') {
  return useMemo(
    () => (filterType === 'All' ? sessions : sessions.filter((session) => session.type === filterType)),
    [sessions, filterType]
  )
}

/* ─── Scroll-to-hour hook ─── */
function useScrollToHour(
  ref: React.RefObject<HTMLDivElement | null>,
  hour: number,
  trigger?: unknown
) {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = hour * HOUR_HEIGHT
    }
  }, [ref, hour, trigger])
}

/* ─── Time indicator hook ─── */
function useTimeIndicator(now: Date) {
  const top = useMemo(() => {
    const h = getHours(now)
    const m = getMinutes(now)
    return (h + m / 60) * HOUR_HEIGHT
  }, [now])

  const visible = useMemo(() => {
    const h = getHours(now)
    return h >= 0 && h < HOURS_IN_DAY
  }, [now])

  return { top, visible }
}

/* ─── Week View sub-components ─── */

function WeekViewHeader({ days }: { days: Date[] }) {
  return (
    <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#E2E8F0] bg-[#FFFFFF] sticky top-0 z-20">
      <div className="h-12 border-r border-[#E2E8F0]" />
      {days.map((day) => {
        const today = isToday(day)
        return (
          <div
            key={day.toISOString()}
            className={`h-12 flex flex-col items-center justify-center border-r border-[#E2E8F0] ${
              today ? 'bg-[rgba(0,174,239,0.05)]' : ''
            }`}
          >
            <span className="text-[#94A3B8] text-[10px] uppercase font-medium">{format(day, 'EEE')}</span>
            <span className={`text-sm font-semibold ${today ? 'text-[#00AEEF]' : 'text-[#0F172A]'}`}>
              {format(day, 'd')}
            </span>
            {today && (
              <span className="text-[8px] bg-[#00AEEF] text-white px-1 rounded-full">Today</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TimeGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[60px_repeat(7,1fr)]">
      <div className="border-r border-[#E2E8F0]">
        {Array.from({ length: HOURS_IN_DAY }, (_, i) => (
          <div
            key={i}
            className="h-16 border-b border-[#E2E8F0] flex items-start justify-end pr-2 pt-1"
          >
            <span className="text-[10px] text-[#94A3B8] font-mono">{String(i).padStart(2, '0')}:00</span>
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}

function SessionOverlay({
  session,
  onEventClick,
  minHeight,
}: {
  session: CalendarSession
  onEventClick: (session: CalendarSession) => void
  minHeight: number
}) {
  const { top, height } = getSessionPosition(session, minHeight)
  const colors = SESSION_COLORS[session.type]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
      className="absolute left-1 right-1 rounded-lg p-1.5 cursor-pointer overflow-hidden group"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        zIndex: 10,
      }}
      onClick={(e) => { e.stopPropagation(); onEventClick(session) }}
    >
      <p className="text-white text-[11px] font-semibold truncate leading-tight">{session.clientName}</p>
      <p className="text-[9px] opacity-80 truncate" style={{ color: colors.text }}>{session.type}</p>
      <p className="text-[9px] text-[#94A3B8] font-mono truncate">
        {format(session.startTime, 'HH:mm')} - {format(addMinutes(session.startTime, session.duration), 'HH:mm')}
      </p>
      <div
        className="absolute bottom-1 left-1.5 right-1.5 h-[2px] rounded-full opacity-30"
        style={{ background: colors.text }}
      />
    </motion.div>
  )
}

function CurrentTimeLine({ top }: { top: number }) {
  return (
    <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: `${top}px` }}>
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse flex-shrink-0" />
        <div className="h-[2px] bg-[#EF4444] flex-1" />
      </div>
    </div>
  )
}

/* ─── Week View ─── */
function WeekView({
  days,
  sessions,
  filterType,
  onSlotClick,
  onEventClick,
}: {
  days: Date[]
  sessions: CalendarSession[]
  filterType: SessionType | 'All'
  onSlotClick: (date: Date, hour: number, minute: number) => void
  onEventClick: (session: CalendarSession) => void
}) {
  const now = useCurrentTime()
  const scrollRef = useRef<HTMLDivElement>(null)

  useScrollToHour(scrollRef, SCROLL_TO_HOUR)

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
                  className={`border-r border-[#E2E8F0] relative ${
                    today ? 'bg-[rgba(0,174,239,0.03)]' : ''
                  }`}
                  style={today ? { borderLeft: '2px solid #00AEEF' } : {}}
                >
                  {Array.from({ length: HOURS_IN_DAY }, (_, i) => (
                    <div
                      key={i}
                      className="h-16 border-b border-[#E2E8F0] hover:bg-[rgba(0,174,239,0.06)] transition-colors cursor-pointer"
                      onClick={() => onSlotClick(day, i, 0)}
                    />
                  ))}

                  {filtered
                    .filter((s) => isSameDay(s.startTime, day))
                    .map((session) => (
                      <SessionOverlay
                        key={session.id}
                        session={session}
                        onEventClick={onEventClick}
                        minHeight={32}
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

/* ─── Day View sub-components ─── */

function DayViewHeader({ date }: { date: Date }) {
  return (
    <div className="grid grid-cols-[80px_1fr] border-b border-[#E2E8F0] bg-[#FFFFFF] sticky top-0 z-20">
      <div className="h-14 border-r border-[#E2E8F0]" />
      <div className="h-14 flex items-center px-4">
        <span className="text-[#0F172A] font-semibold text-sm">{format(date, 'EEEE, d MMMM yyyy')}</span>
        {isToday(date) && (
          <span className="ml-2 text-[10px] bg-[#00AEEF] text-white px-2 py-0.5 rounded-full">Today</span>
        )}
      </div>
    </div>
  )
}

function DayTimeGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[80px_1fr]">
      <div className="border-r border-[#E2E8F0]">
        {Array.from({ length: HOURS_IN_DAY }, (_, i) => (
          <div key={i} className="h-16 border-b border-[#E2E8F0] flex items-start justify-end pr-3 pt-1">
            <span className="text-[11px] text-[#94A3B8] font-mono">{String(i).padStart(2, '0')}:00</span>
          </div>
        ))}
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}

function DaySessionOverlay({
  session,
  onEventClick,
}: {
  session: CalendarSession
  onEventClick: (session: CalendarSession) => void
}) {
  const { top, height } = getSessionPosition(session, 40)
  const colors = SESSION_COLORS[session.type]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="absolute left-2 right-2 rounded-lg p-2.5 cursor-pointer overflow-hidden group"
      style={{ top: `${top}px`, height: `${height}px`, background: colors.bg, border: `1px solid ${colors.border}`, zIndex: 10 }}
      onClick={(e) => { e.stopPropagation(); onEventClick(session) }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: colors.border }}>
          <User size={14} style={{ color: colors.text }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{session.clientName}</p>
          <p className="text-[10px] opacity-80" style={{ color: colors.text }}>{session.type}</p>
        </div>
        <span className="text-[10px] text-[#94A3B8] font-mono">{format(session.startTime, 'HH:mm')}</span>
      </div>
      <p className="text-[10px] text-[#94A3B8] mt-1">Duration: {session.duration} min</p>
      <div className="absolute bottom-1.5 left-2.5 right-2.5 h-[3px] rounded-full opacity-30" style={{ background: colors.text }} />
    </motion.div>
  )
}

function DailySummaryPanel({ sessions }: { sessions: CalendarSession[] }) {
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0)
  const uniqueClients = [...new Set(sessions.map((s) => s.clientName))].length

  return (
    <div className="hidden xl:block w-80 border-l border-[#E2E8F0] bg-[#FFFFFF] p-5 overflow-auto">
      <h3 className="text-[#0F172A] font-semibold text-base mb-4">Daily Summary</h3>

      <div className="space-y-3 mb-6">
        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
          <p className="text-[#94A3B8] text-xs mb-1">Total Sessions</p>
          <p className="text-[#0F172A] text-2xl font-bold font-mono">{sessions.length}</p>
        </div>
        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
          <p className="text-[#94A3B8] text-xs mb-1">Total Duration</p>
          <p className="text-[#0F172A] text-2xl font-bold font-mono">{totalDuration} min</p>
        </div>
        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
          <p className="text-[#94A3B8] text-xs mb-1">Clients Seen</p>
          <p className="text-[#0F172A] text-2xl font-bold font-mono">{uniqueClients}</p>
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] pt-4">
        <h4 className="text-[#64748B] text-sm font-medium mb-3">Session Breakdown</h4>
        {SESSION_TYPE_LABELS.map((type) => {
          const count = sessions.filter((s) => s.type === type).length
          if (count === 0) return null
          return (
            <div key={type} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: SESSION_COLORS[type].text }} />
                <span className="text-[#64748B] text-xs">{type}</span>
              </div>
              <span className="text-[#0F172A] text-xs font-semibold">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Day View ─── */
function DayView({
  date,
  sessions,
  filterType,
  onSlotClick,
  onEventClick,
}: {
  date: Date
  sessions: CalendarSession[]
  filterType: SessionType | 'All'
  onSlotClick: (date: Date, hour: number, minute: number) => void
  onEventClick: (session: CalendarSession) => void
}) {
  const now = useCurrentTime()
  const scrollRef = useRef<HTMLDivElement>(null)

  useScrollToHour(scrollRef, SCROLL_TO_HOUR, date)

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
              {Array.from({ length: HOURS_IN_DAY }, (_, i) => (
                <div
                  key={i}
                  className="h-16 border-b border-[#E2E8F0] hover:bg-[rgba(0,174,239,0.04)] transition-colors cursor-pointer"
                  onClick={() => onSlotClick(date, i, 0)}
                />
              ))}
              {filtered.map((session) => (
                <DaySessionOverlay key={session.id} session={session} onEventClick={onEventClick} />
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

/* ─── Month View ─── */
function MonthView({
  currentDate,
  sessions,
  filterType,
  onDayClick,
}: {
  currentDate: Date
  sessions: CalendarSession[]
  filterType: SessionType | 'All'
  onDayClick: (date: Date) => void
}) {
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
              <span className="text-[11px] text-[#94A3B8] uppercase font-semibold">{d}</span>
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
                  inMonth ? 'bg-[#FFFFFF]' : 'bg-[#F8FAFC] opacity-50'
                } ${today ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.05)]' : 'border-[#E2E8F0]'}`}
                onClick={() => onDayClick(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      today ? 'text-[#00AEEF]' : inMonth ? 'text-[#0F172A]' : 'text-[#E2E8F0]'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {today && (
                    <span className="text-[8px] bg-[#00AEEF] text-white px-1 rounded-full">Today</span>
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
                    <span className="text-[9px] text-[#94A3B8]">+{daySessions.length - 4}</span>
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

/* ─── Agenda View ─── */
function AgendaView({
  sessions,
  filterType,
  onEventClick,
}: {
  sessions: CalendarSession[]
  filterType: SessionType | 'All'
  onEventClick: (session: CalendarSession) => void
}) {
  const filtered = useFilteredSessions(sessions, filterType)

  const grouped = useMemo(() => {
    const groups: Record<string, CalendarSession[]> = {}
    filtered.forEach((s) => {
      const key = format(s.startTime, 'yyyy-MM-dd')
      if (!groups[key]) groups[key] = []
      groups[key].push(s)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const now = new Date()

  const getGroupLabel = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isToday(d)) return 'Today'
    if (isSameDay(d, addDays(now, 1))) return 'Tomorrow'
    if (d < now) return 'Past'
    return format(d, 'EEEE, d MMMM yyyy')
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="max-w-[900px] mx-auto space-y-4">
        {grouped.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#94A3B8] text-sm">No sessions found</p>
          </div>
        )}

        {grouped.map(([dateStr, daySessions]) => (
          <div key={dateStr}>
            <h3 className="text-[#0F172A] font-semibold text-sm mb-2 px-1">
              {getGroupLabel(dateStr)}
              <span className="text-[#94A3B8] font-normal ml-2">
                {format(new Date(dateStr), 'dd/MM/yyyy')}
              </span>
            </h3>

            <div className="space-y-1">
              {daySessions.map((session, idx) => {
                const colors = SESSION_COLORS[session.type]
                const endTime = addMinutes(session.startTime, session.duration)

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-4 py-3 cursor-pointer hover:bg-[#E2E8F0] transition-colors"
                    onClick={() => onEventClick(session)}
                  >
                    {/* Time */}
                    <div className="w-20 flex-shrink-0">
                      <p className="text-[#0F172A] text-sm font-mono font-medium">
                        {format(session.startTime, 'HH:mm')}
                      </p>
                      <p className="text-[#94A3B8] text-xs font-mono">
                        {format(endTime, 'HH:mm')}
                      </p>
                    </div>

                    {/* Color indicator */}
                    <div
                      className="w-1 h-10 rounded-full flex-shrink-0"
                      style={{ background: colors.text }}
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0F172A] text-sm font-semibold truncate">
                        {session.clientName}
                      </p>
                      <p className="text-[#94A3B8] text-xs">{session.duration} min</p>
                    </div>

                    {/* Type badge */}
                    <div
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
                      style={{
                        background: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {session.type}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── New Session Modal ─── */
function NewSessionModal({
  isOpen,
  onClose,
  selectedSlot,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  selectedSlot?: Date
  onSubmit?: (session: CalendarSession) => void
}) {
  const clients = useClientList()
  const [client, setClient] = useState('')
  const [type, setType] = useState<SessionType>('Personal Training')
  const [duration, setDuration] = useState('60')
  const [dateStr, setDateStr] = useState('')
  const [timeStr, setTimeStr] = useState('09:00')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (selectedSlot) {
      setDateStr(format(selectedSlot, 'yyyy-MM-dd'))
      const h = getHours(selectedSlot)
      const m = getMinutes(selectedSlot)
      setTimeStr(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    } else {
      setDateStr(format(new Date(), 'yyyy-MM-dd'))
    }
  }, [selectedSlot, isOpen])

  const handleSubmit = () => {
    if (!client || !dateStr || !timeStr) return
    const startTime = new Date(`${dateStr}T${timeStr}`)
    const session: CalendarSession = {
      id: `session-${Date.now()}`,
      clientName: client,
      type,
      startTime,
      duration: Number(duration),
      notes: notes || undefined,
    }
    onSubmit?.(session)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#FFFFFF] border-[#E2E8F0] text-[#0F172A] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Book New Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Client</label>
            <Select value={client} onValueChange={setClient}>
              <SelectTrigger className="bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent className="bg-[#F8FAFC] border-[#E2E8F0]">
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.name} className="text-[#0F172A]">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#64748B] mb-1 block">Date</label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full h-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 text-[#0F172A] text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748B] mb-1 block">Time</label>
              <select
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full h-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 text-[#0F172A] text-sm"
              >
                {HK_TIME_SLOTS.map((h) =>
                  [0, 30].map((m) => (
                    <option key={`${h}-${m}`} value={`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`}>
                      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#64748B] mb-1 block">Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#F8FAFC] border-[#E2E8F0]">
                  {['30', '45', '60', '90', '120'].map((d) => (
                    <SelectItem key={d} value={d} className="text-[#0F172A]">
                      {d} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-[#64748B] mb-1 block">Session Type</label>
              <Select value={type} onValueChange={(v) => setType(v as SessionType)}>
                <SelectTrigger className="bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#F8FAFC] border-[#E2E8F0]">
                  {SESSION_TYPE_LABELS.map((t) => (
                    <SelectItem key={t} value={t} className="text-[#0F172A]">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Notes (optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add session notes..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#0F172A] text-sm placeholder:text-[#CBD5E1] resize-none focus:outline-none focus:border-[#00AEEF]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-[#00AEEF] hover:bg-[#009BD6] text-white">
            Book Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── View Toggle Button ─── */
function ViewToggle({
  view,
  setView,
}: {
  view: ViewMode
  setView: (v: ViewMode) => void
}) {
  const views: { key: ViewMode; label: string; icon: typeof CalendarDays }[] = [
    { key: 'week', label: 'Week', icon: CalendarDays },
    { key: 'day', label: 'Day', icon: Clock },
    { key: 'month', label: 'Month', icon: LayoutGrid },
    { key: 'agenda', label: 'Agenda', icon: List },
  ]

  return (
    <div className="flex items-center gap-1 bg-[#F8FAFC] rounded-lg p-1 border border-[#E2E8F0]">
      {views.map((v) => {
        const active = view === v.key
        const Icon = v.icon
        return (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              active
                ? 'bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0]'
                : 'text-[#94A3B8] hover:text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ─── Calendar Toolbar ─── */
function CalendarToolbar({
  view,
  setView,
  filterType,
  setFilterType,
  dateDisplay,
  onPrev,
  onNext,
  onToday,
  onNewSession,
}: {
  view: ViewMode
  setView: (v: ViewMode) => void
  filterType: SessionType | 'All'
  setFilterType: (v: SessionType | 'All') => void
  dateDisplay: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onNewSession: () => void
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 lg:px-6 py-3 bg-[#FFFFFF] border-b border-[#E2E8F0] flex-shrink-0">
      <ViewToggle view={view} setView={setView} />
      <div className="flex items-center gap-2">
        <button onClick={onPrev} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors" aria-label="Previous"><ChevronLeft size={16} /></button>
        <h2 className="text-[#0F172A] font-semibold text-sm min-w-[160px] text-center">{dateDisplay}</h2>
        <button onClick={onNext} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors" aria-label="Next"><ChevronRight size={16} /></button>
        <button onClick={onToday} className="ml-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors border border-[#E2E8F0]">Today</button>
      </div>
      <div className="flex items-center gap-2">
        <Select value={filterType} onValueChange={(v) => setFilterType(v as SessionType | 'All')}>
          <SelectTrigger className="w-[150px] h-8 bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] text-xs"><Filter size={12} className="mr-1 text-[#94A3B8]" /><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[#F8FAFC] border-[#E2E8F0]">
            <SelectItem value="All" className="text-[#0F172A]">All Types</SelectItem>
            {SESSION_TYPE_LABELS.map((t) => <SelectItem key={t} value={t} className="text-[#0F172A]">{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <button onClick={onNewSession} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00AEEF] hover:bg-[#009BD6] text-white rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"><Plus size={14} /><span className="hidden sm:inline">New Session</span></button>
      </div>
    </div>
  )
}

/* ─── Session Detail Modal ─── */
function SessionDetailModal({
  session,
  isOpen,
  onClose,
}: {
  session: CalendarSession | null
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#FFFFFF] border-[#E2E8F0] text-[#0F172A] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Session Details</DialogTitle>
        </DialogHeader>
        {session && (
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: SESSION_COLORS[session.type].border }}>
                <User size={18} style={{ color: SESSION_COLORS[session.type].text }} />
              </div>
              <div>
                <p className="text-[#0F172A] font-semibold">{session.clientName}</p>
                <p className="text-[#94A3B8] text-xs">{session.type}</p>
              </div>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#94A3B8] text-xs">Date</span>
                <span className="text-[#0F172A] text-xs font-medium">{format(session.startTime, 'EEEE, d MMMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8] text-xs">Time</span>
                <span className="text-[#0F172A] text-xs font-medium font-mono">
                  {format(session.startTime, 'HH:mm')} - {format(addMinutes(session.startTime, session.duration), 'HH:mm')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8] text-xs">Duration</span>
                <span className="text-[#0F172A] text-xs font-medium">{session.duration} minutes</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose} className="text-[#64748B] hover:text-[#0F172A]">Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ═══════════════════════════════════════════
   MAIN CALENDAR PAGE
   ═══════════════════════════════════════════ */
export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterType, setFilterType] = useState<SessionType | 'All'>('All')
  const reduceMotion = useReducedMotion()

  const storeSessions = useSessionList()
  const clients = useClientList()
  const addSession = useAppDataStore((s) => s.addSession)

  // Seed demo data if store is empty
  useEffect(() => {
    const seed = useAppDataStore.getState().seedDemoData
    if (storeSessions.length === 0) {
      seed()
    }
  }, [storeSessions.length])

  const sessions = useMemo(
    () => storeSessions.map(storeSessionToPage).sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    [storeSessions]
  )
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSessionDate, setNewSessionDate] = useState<Date | undefined>()
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null)

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end: addDays(start, 6) })
  }, [currentDate])

  const handlePrev = useCallback(() => {
    switch (view) {
      case 'week':
        setCurrentDate((d) => subWeeks(d, 1))
        break
      case 'day':
        setCurrentDate((d) => subDays(d, 1))
        break
      case 'month':
        setCurrentDate((d) => subMonths(d, 1))
        break
      case 'agenda':
        setCurrentDate((d) => subWeeks(d, 1))
        break
    }
  }, [view])

  const handleNext = useCallback(() => {
    switch (view) {
      case 'week':
        setCurrentDate((d) => addWeeks(d, 1))
        break
      case 'day':
        setCurrentDate((d) => addDays(d, 1))
        break
      case 'month':
        setCurrentDate((d) => addMonths(d, 1))
        break
      case 'agenda':
        setCurrentDate((d) => addWeeks(d, 1))
        break
    }
  }, [view])

  const handleToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const handleSlotClick = useCallback(
    (date: Date, hour: number, minute: number) => {
      const d = setMinutes(setHours(date, hour), minute)
      setNewSessionDate(d)
      setShowNewSession(true)
    },
    []
  )

  const handleEventClick = useCallback((session: CalendarSession) => {
    setSelectedSession(session)
  }, [])

  const handleDayClick = useCallback(
    (date: Date) => {
      setCurrentDate(date)
      setView('day')
    },
    []
  )

  const handleCreateSession = useCallback(
    (session: CalendarSession) => {
      const client = clients.find((c) => c.name === session.clientName)
      addSession(pageSessionToStore(session, client?.id))
    },
    [addSession, clients]
  )

  const dateDisplay = useMemo(() => {
    switch (view) {
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 })
        const end = addDays(start, 6)
        return `${format(start, 'd')} - ${format(end, 'd MMM yyyy')}`
      }
      case 'day':
        return format(currentDate, 'd MMM yyyy')
      case 'month':
        return format(currentDate, 'MMMM yyyy')
      case 'agenda':
        return 'Upcoming Sessions'
      default:
        return ''
    }
  }, [view, currentDate])

  return (
    <motion.div
      {...motionEnter(reduceMotion, { opacity: 0 }, { duration: 0.3 })}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100dvh-64px)] bg-[#F8FAFC]"
    >
      <CalendarToolbar
        view={view}
        setView={setView}
        filterType={filterType}
        setFilterType={setFilterType}
        dateDisplay={dateDisplay}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onNewSession={() => {
          setNewSessionDate(undefined)
          setShowNewSession(true)
        }}
      />

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${currentDate.toISOString()}`}
            {...motionEnter(reduceMotion, { opacity: 0, x: 20 }, { duration: 0.2 })}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {view === 'week' && (
              <WeekView
                days={weekDays}
                sessions={sessions}
                filterType={filterType}
                onSlotClick={handleSlotClick}
                onEventClick={handleEventClick}
              />
            )}
            {view === 'day' && (
              <DayView
                date={currentDate}
                sessions={sessions}
                filterType={filterType}
                onSlotClick={handleSlotClick}
                onEventClick={handleEventClick}
              />
            )}
            {view === 'month' && (
              <MonthView
                currentDate={currentDate}
                sessions={sessions}
                filterType={filterType}
                onDayClick={handleDayClick}
              />
            )}
            {view === 'agenda' && (
              <AgendaView
                sessions={sessions}
                filterType={filterType}
                onEventClick={handleEventClick}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* New Session Modal */}
      <NewSessionModal isOpen={showNewSession} onClose={() => setShowNewSession(false)} selectedSlot={newSessionDate} onSubmit={handleCreateSession} />

      <SessionDetailModal session={selectedSession} isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} />
    </motion.div>
  )
}
