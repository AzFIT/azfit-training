import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../lib/utils'
import { useProgramDetails } from '../hooks/usePrograms'
import { useLogWorkout } from '../hooks/useWorkoutLog'
import { computeLetterNotation } from '../utils/notation'
import WorkoutExerciseLog from '../components/workout/WorkoutExerciseLog'

export default function WorkoutSessionPage() {
  const { clientId, programId: programIdParam } = useParams<{
    clientId: string
    programId: string
  }>()
  const programId = programIdParam ? parseInt(programIdParam, 10) : null

  const { data: programData, isLoading } = useProgramDetails(programId)
  const { sessionMutation, setsMutation } = useLogWorkout()

  const [activeDay, setActiveDay] = useState(1)
  const [loggedSets, setLoggedSets] = useState<Record<string, Record<number, { load?: number; reps?: number; rpe?: number; completed: boolean }>>>({})

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

  const handleSaveWorkout = async () => {
    if (!clientId || !programId || !programData) return

    try {
      const session = await sessionMutation.mutateAsync({
        client_id: clientId,
        client_program_id: 1, // Would come from actual assignment
        program_id: programId,
        day_number: activeDay,
        week_number: 1,
        completed_at: new Date().toISOString(),
      })

      const allSets: Array<{
        session_id: number
        program_exercise_id: number
        exercise_id: number
        set_number: number
        prescribed_sets: number
        prescribed_reps: string
        prescribed_tempo?: string
        prescribed_rest_seconds: number
        prescribed_rpe_target?: number
        actual_load?: number
        actual_reps?: number
        actual_rpe?: number
        is_completed: boolean
      }> = []

      currentDayExercises.forEach((ex) => {
        const exLogs = loggedSets[ex.program_exercise_id] || {}
        Object.entries(exLogs).forEach(([setNum, log]) => {
          allSets.push({
            session_id: session.session_id!,
            program_exercise_id: ex.program_exercise_id,
            exercise_id: ex.exercise_id,
            set_number: parseInt(setNum),
            prescribed_sets: ex.sets,
            prescribed_reps: ex.reps,
            prescribed_tempo: ex.tempo,
            prescribed_rest_seconds: ex.rest_seconds,
            prescribed_rpe_target: ex.rpe_target,
            actual_load: log.load,
            actual_reps: log.reps,
            actual_rpe: log.rpe,
            is_completed: log.completed,
          })
        })
      })

      if (allSets.length > 0) {
        await setsMutation.mutateAsync(allSets)
      }

      toast.success('Workout saved successfully!')
    } catch (error) {
      toast.error('Failed to save workout. Please try again.')
    }
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

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedExercises / currentDayExercises.length) * 100}%` }}
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
            />
          ))}
        </div>

        {/* Save button */}
        <div className="sticky bottom-4 z-10">
          <button
            onClick={handleSaveWorkout}
            disabled={sessionMutation.isPending}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-white text-lg',
              'bg-gradient-to-r from-[#0EA5E9] to-[#6366F1]',
              'hover:shadow-lg transition-all',
              'flex items-center justify-center gap-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {sessionMutation.isPending ? (
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
