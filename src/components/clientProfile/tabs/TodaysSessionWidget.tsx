import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dumbbell, Play, CalendarCheck, Clock } from 'lucide-react'
import { useAppDataStore } from '@/stores/useAppDataStore'
import type { Client } from '@/types/entities'

interface TodaysSessionWidgetProps {
  client: Client
}

export default function TodaysSessionWidget({ client }: TodaysSessionWidgetProps) {
  const navigate = useNavigate()
  const { assignments, programs, sessions } = useAppDataStore()

  const todayIso = new Date().toISOString().split('T')[0]

  const todaysCalendarSession = useMemo(() => {
    return Object.values(sessions)
      .filter(
        (s) =>
          s.clientId === client.id &&
          s.date === todayIso &&
          s.title.toLowerCase().includes('workout')
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime))[0]
  }, [sessions, client.id, todayIso])

  const activeAssignment = useMemo(() => {
    return Object.values(assignments).find(
      (a) => a.clientId === client.id && a.status === 'active'
    )
  }, [assignments, client.id])

  const program = useMemo(() => {
    if (!activeAssignment) return undefined
    return programs[activeAssignment.programId]
  }, [programs, activeAssignment])

  const dayNumber = activeAssignment?.currentDay ?? 1
  const weekNumber = activeAssignment?.currentWeek ?? 1

  const handleStart = () => {
    if (!program) return
    navigate(`/workout/${program.id}/${dayNumber}?client=${client.id}`)
  }

  // Rest day state
  if (!program && !todaysCalendarSession) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dark-border bg-az-black-card p-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-dark-surface flex items-center justify-center">
            <CalendarCheck size={22} className="text-dark-muted" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-dark-primary">Rest Day</h3>
            <p className="text-xs text-dark-muted">No workout scheduled for today.</p>
          </div>
        </div>
      </motion.div>
    )
  }

  const sessionTitle = todaysCalendarSession?.title || program?.name || 'Today\'s Workout'
  const durationText = program?.sessionDurationMinutes
    ? `${program.sessionDurationMinutes} min`
    : todaysCalendarSession
      ? `${Math.max(
          30,
          (parseInt(todaysCalendarSession.endTime.split(':')[0]) -
            parseInt(todaysCalendarSession.startTime.split(':')[0])) *
            60
        )} min`
      : '45 min'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-dark-border bg-gradient-to-br from-cyan-900/30 to-az-black-card p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-cyan-glow flex items-center justify-center flex-shrink-0">
            <Dumbbell size={22} className="text-cyan" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-dark-primary truncate">
              {sessionTitle}
            </h3>
            <p className="text-xs text-dark-secondary mt-0.5">
              Week {weekNumber} · Day {dayNumber}
              {program?.daysPerWeek ? ` · ${program.daysPerWeek}x / week` : ''}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] text-dark-muted">
                <Clock size={11} />
                {durationText}
              </span>
              {todaysCalendarSession && (
                <span className="inline-flex items-center gap-1 text-[11px] text-dark-muted">
                  <CalendarCheck size={11} />
                  Scheduled {todaysCalendarSession.startTime}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan text-white text-sm font-semibold hover:bg-cyan-dark transition-colors"
        >
          <Play size={14} fill="currentColor" />
          Start
        </button>
      </div>

      {program && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] text-dark-muted mb-1">
            <span>Program progress</span>
            <span>{client.programProgress || 0}%</span>
          </div>
          <div className="h-1.5 bg-dark-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, client.programProgress || 0)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-cyan"
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}
