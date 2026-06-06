import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Save, Timer } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../lib/utils'
import { useAppDataStore } from '../stores/useAppDataStore'
import { useProgramDetails } from '../hooks/usePrograms'
import { computeLetterNotation } from '../utils/notation'
import WorkoutExerciseLog from '../components/workout/WorkoutExerciseLog'
import type { WorkoutSessionLog } from '../types/entities'

export default function WorkoutSessionPage() {
  const { clientId, programId: programIdParam } = useParams<{
    clientId: string
    programId: string
  }>()
  const programId = programIdParam ? parseInt(programIdParam, 10) : null

  const { data: programData, isLoading } = useProgramDetails(programId)
  const { addWorkoutSession, workoutSessions } = useAppDataStore()

  const [activeDay, setActiveDay] = useState(1)
  const [loggedSets, setLoggedSets] = useState<Record<string, Record<number, { load?: number; reps?: number; rpe?: number; completed: boolean }>>>({})
  const [sessionStartTime] = useState(Date.now())
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionStartTime])

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const currentDayExercises = useMemo(() => {
    if (!programData) return []
    const day = programData.days.find((d) => d.day_number === activeDay)
    return day?.exercises || []
  }, [programData, activeDay])

  const notationMap = useMemo(() => {
    return computeLetterNotation(
      currentDayExercises.map((e) => ({ exercise_order: e.exercise_order, set_type_id: e.set_type_id }))
    )
  }, [currentDayExercises])

  const handleLogSet = (exerciseId: number, setNumber: number, data: { load?: number; reps?: number; rpe?: number; completed: boolean }) => {
    setLoggedSets((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [setNumber]: data,
      },
    }))
  }

  // Find previous session for this program/day
  const previousSession = useMemo(() => {
    const sessions = Object.values(workoutSessions)
      .filter((s) => s.programId === String(programId) && s.dayNumber === activeDay)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return sessions[0] || null
  }, [workoutSessions, programId, activeDay])

  const previousSetsByExercise = useMemo(() => {
    const map: Record<string, Record<number, { load: number; reps: number; rpe: number }>> = {}
    if (!previousSession) return map
    previousSession.exercises.forEach((ex) => {
      map[ex.exerciseId] = {}
      ex.sets.forEach((set) => {
        if (set.actualLoad !== undefined && set.actualReps !== undefined) {
          map[ex.exerciseId][set.setNumber] = {
            load: set.actualLoad,
            reps: set.actualReps,
            rpe: set.actualRpe || 0,
          }
        }
      })
    })
    return map
  }, [previousSession])

  const handleSaveWorkout = () => {
    if (!clientId || !programId || !programData) return
    setIsSaving(true)

    const session: WorkoutSessionLog = {
      id: `ws_${Date.now()}`,
      clientId,
      programId: String(programId),
      programName: programData.program.program_name,
      dayNumber: activeDay,
      weekNumber: 1,
      date: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      exercises: currentDayExercises.map((ex, idx) => ({
        exerciseId: String(ex.exercise_id),
        exerciseName: ex.exercise_name || '',
        notation: notationMap[idx] || String.fromCharCode(65 + idx),
        sets: Array.from({ length: ex.sets }).map((_, setIdx) => {
          const setNumber = setIdx + 1
          const log = loggedSets[ex.program_exercise_id]?.[setNumber] || { completed: false }
          return {
            setNumber,
            prescribedSets: ex.sets,
            prescribedReps: ex.reps,
            prescribedLoad: undefined,
            prescribedRpe: ex.rpe_target,
            actualLoad: log.load,
            actualReps: log.reps,
            actualRpe: log.rpe,
            completed: log.completed,
          }
        }),
      })),
    }

    addWorkoutSession(session)
    toast.success('Workout saved!')
    setIsSaving(false)
  }

  const completedExercises = currentDayExercises.filter((ex) => {
    const exLogs = loggedSets[ex.program_exercise_id] || {}
    return Array.from({ length: ex.sets }).every((_, i) => exLogs[i + 1]?.completed)
  }).length

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#F5F7FA] dark:bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0EA5E9]" />
      </div>
    )
  }

  if (!programData) {
    return (
      <div className="min-h-[100dvh] bg-[#F5F7FA] dark:bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Program not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#F5F7FA] dark:bg-[#0A0A0A]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Today's Workout
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {programData.program.program_name} • Week 1 • Day {activeDay}
          </p>

          {/* Session timer + Progress */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <Timer size={12} />
              <span className="font-mono">{formatElapsed(elapsedSeconds)}</span>
            </div>
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${currentDayExercises.length > 0 ? (completedExercises / currentDayExercises.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {completedExercises}/{currentDayExercises.length}
            </span>
          </div>
        </div>

        {/* Day selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {programData.days.map((day) => (
            <button
              key={day.day_number}
              onClick={() => setActiveDay(day.day_number)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                activeDay === day.day_number
                  ? 'bg-[#0EA5E9] text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              )}
            >
              Day {day.day_number}
            </button>
          ))}
        </div>

        {/* Exercise logs */}
        <div className="space-y-4">
          {currentDayExercises.map((exercise, idx) => (
            <WorkoutExerciseLog
              key={exercise.program_exercise_id}
              exercise={exercise}
              notation={notationMap[idx] || String.fromCharCode(65 + idx)}
              onLogSet={(setNum, data) => handleLogSet(exercise.program_exercise_id, setNum, data)}
              loggedSets={loggedSets[exercise.program_exercise_id] || {}}
              previousSets={previousSetsByExercise[String(exercise.exercise_id)]}
              restSeconds={exercise.rest_seconds}
            />
          ))}
        </div>

        {/* Save button */}
        <div className="sticky bottom-4 z-10">
          <button
            onClick={handleSaveWorkout}
            disabled={isSaving}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-white text-lg',
              'bg-gradient-to-r from-[#0EA5E9] to-[#6366F1]',
              'hover:shadow-lg transition-all',
              'flex items-center justify-center gap-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Workout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
