import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  subDays,
  addMonths,
  subMonths,
  setHours,
  setMinutes,
} from 'date-fns'
import { useAppDataStore } from '@/stores/useAppDataStore'
import { useSessionList, useClientList } from '@/stores/useAppDataStore.selectors'
import {
  WeekView,
  DayView,
  MonthView,
  AgendaView,
  NewSessionModal,
  CalendarToolbar,
  SessionDetailModal,
  storeSessionToPage,
  pageSessionToStore,
} from '@/components/calendar'
import type { CalendarSession, ViewMode, SessionType } from '@/components/calendar'

/* ─── Motion helper ─── */
function motionEnter<T extends Record<string, unknown>>(
  reduce: boolean | null,
  initial: T,
  transition?: import('framer-motion').Transition
): { initial: T | false; transition?: import('framer-motion').Transition } {
  if (reduce) return { initial: false }
  return { initial, transition }
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
  const updateSession = useAppDataStore((s) => s.updateSession)
  const deleteSession = useAppDataStore((s) => s.deleteSession)
  const workoutSessions = useAppDataStore((s) => s.workoutSessions)

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

  const handleUpdateSession = useCallback(
    (session: CalendarSession) => {
      const client = clients.find((c) => c.name === session.clientName)
      const storeSession = pageSessionToStore(session, client?.id)
      updateSession(session.id, storeSession)
    },
    [updateSession, clients]
  )

  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSession(id)
      setSelectedSession(null)
    },
    [deleteSession]
  )

  // Check if a calendar session has a completed workout
  const getWorkoutForSession = useCallback(
    (session: CalendarSession) => {
      const sessionDate = format(session.startTime, 'yyyy-MM-dd')
      return Object.values(workoutSessions).find(
        (ws) =>
          ws.clientId ===
            (clients.find((c) => c.name === session.clientName)?.id || '') &&
          ws.date.startsWith(sessionDate)
      )
    },
    [workoutSessions, clients]
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
      className="flex flex-col h-[calc(100dvh-64px)] bg-light-surface"
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
                getWorkoutForSession={getWorkoutForSession}
              />
            )}
            {view === 'day' && (
              <DayView
                date={currentDate}
                sessions={sessions}
                filterType={filterType}
                onSlotClick={handleSlotClick}
                onEventClick={handleEventClick}
                getWorkoutForSession={getWorkoutForSession}
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

      <SessionDetailModal
        session={selectedSession}
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        onDelete={handleDeleteSession}
        onEdit={handleUpdateSession}
        hasWorkout={selectedSession ? !!getWorkoutForSession(selectedSession) : false}
      />
    </motion.div>
  )
}

// Need to import eachDayOfInterval for weekDays calculation
import { eachDayOfInterval } from 'date-fns'
