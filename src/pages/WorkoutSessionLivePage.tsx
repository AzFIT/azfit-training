/**
 * Workout Session Live Page — In-workout logging screen
 *
 * Strong-inspired: live timer, exercise blocks with set/rep/RPE,
 * previous session data, rest timer, finish session
 */

import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Camera,
  SlidersHorizontal,
  Clock,
  ChevronLeft,
  Flag,
} from 'lucide-react'
import ExerciseBlock from '../components/workout/ExerciseBlock'
import { useWorkoutSession } from '../hooks/useWorkoutSession'
import type { ExerciseBlockData } from '../components/workout/ExerciseBlock'


// ── Demo workout data ─────────────────────────────────────────────

function createDemoWorkout(): ExerciseBlockData[] {
  return [
    {
      id: 'ex-1',
      notation: 'A1',
      name: 'Bench Press',
      previousSession: { weight: 60, reps: [10, 10, 9], rpe: 8 },
      target: { weight: 62.5, reps: 10, sets: 3, rpe: 8 },
      sets: [
        { setNumber: 1, targetWeight: 62.5, targetReps: 10, targetRpe: 8, completed: true, actualWeight: 62.5, actualReps: 10, actualRpe: 8 },
        { setNumber: 2, targetWeight: 62.5, targetReps: 10, targetRpe: 8, completed: true, actualWeight: 62.5, actualReps: 10, actualRpe: 8 },
        { setNumber: 3, targetWeight: 62.5, targetReps: 10, targetRpe: 8, completed: false },
      ],
      videoUrl: 'https://youtube.com/vthMCtgVtFw',
    },
    {
      id: 'ex-2',
      notation: 'A2',
      name: 'Barbell Row',
      supersetWith: 'A1',
      previousSession: { weight: 55, reps: [10, 10, 10], rpe: 7 },
      target: { weight: 57.5, reps: 10, sets: 3, rpe: 8 },
      sets: [
        { setNumber: 1, targetWeight: 57.5, targetReps: 10, targetRpe: 8, completed: false },
        { setNumber: 2, targetWeight: 57.5, targetReps: 10, targetRpe: 8, completed: false },
        { setNumber: 3, targetWeight: 57.5, targetReps: 10, targetRpe: 8, completed: false },
      ],
    },
    {
      id: 'ex-3',
      notation: 'B1',
      name: 'Dumbbell Shoulder Press',
      previousSession: { weight: 20, reps: [10, 10, 9], rpe: 7 },
      target: { weight: 22.5, reps: 10, sets: 3, rpe: 8 },
      sets: [
        { setNumber: 1, targetWeight: 22.5, targetReps: 10, targetRpe: 8, completed: false },
        { setNumber: 2, targetWeight: 22.5, targetReps: 10, targetRpe: 8, completed: false },
        { setNumber: 3, targetWeight: 22.5, targetReps: 10, targetRpe: 8, completed: false },
      ],
    },
    {
      id: 'ex-4',
      notation: 'B2',
      name: 'Lateral Raise',
      supersetWith: 'B1',
      target: { weight: 12, reps: 12, sets: 3, rpe: 9 },
      sets: [
        { setNumber: 1, targetWeight: 12, targetReps: 12, targetRpe: 9, completed: false },
        { setNumber: 2, targetWeight: 12, targetReps: 12, targetRpe: 9, completed: false },
        { setNumber: 3, targetWeight: 12, targetReps: 12, targetRpe: 9, completed: false },
      ],
    },
  ]
}

// ── Main Page ─────────────────────────────────────────────────────

export default function WorkoutSessionLivePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const programId = searchParams.get('program')
  const clientId = searchParams.get('client')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void programId; void clientId

  const [showFinishConfirm, setShowFinishConfirm] = useState(false)

  const initialExercises = useMemo(() => createDemoWorkout(), [])
  const {
    exercises,
    elapsedFormatted,
    updateExerciseSets,
    getCompletedSetsCount,
    getTotalSetsCount,
    finishSession,
  } = useWorkoutSession(initialExercises)

  const completedSets = getCompletedSetsCount()
  const totalSets = getTotalSetsCount()
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  const handleFinish = () => {
    const result = finishSession()
    console.log('Session finished:', result)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-light-surface">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-light-border">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg text-light-muted hover:text-light-primary hover:bg-light-surface transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <h1 className="text-light-primary font-semibold text-sm">Upper Body A</h1>
                <p className="text-light-muted text-xs">Sarah Chen</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Live timer */}
              <div className="flex items-center gap-1.5 bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg">
                <Clock size={14} />
                <span className="text-sm font-semibold" style={{ fontFamily: '"Space Mono", monospace' }}>
                  {elapsedFormatted}
                </span>
              </div>

              {/* Phase badge */}
              <span className="text-xs bg-violet/10 text-violet px-2 py-1 rounded-lg font-medium">
                Phase: Intensification
              </span>
            </div>
          </div>

          {/* Week/Day + Progress */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-light-muted">Week 6, Day 2</span>
            <div className="flex-1 h-1.5 bg-light-surface rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full rounded-full bg-cyan"
              />
            </div>
            <span className="text-xs text-light-muted">{Math.round(progressPercent)}%</span>
          </div>
        </div>
      </div>

      {/* Exercise Blocks */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {exercises.map((exercise) => (
          <ExerciseBlock
            key={exercise.id}
            exercise={exercise}
            onUpdateSets={(sets) => updateExerciseSets(exercise.id, sets)}
            restTimerDuration={90}
          />
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 z-30 bg-white/80 backdrop-blur-md border-t border-light-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFinishConfirm(true)}
            className="flex-1 bg-cyan text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-dark transition-colors"
          >
            <Flag size={16} />
            Finish Session
          </motion.button>
          <button className="px-4 py-2.5 rounded-xl bg-light-surface text-light-secondary text-sm font-medium hover:bg-light-hover transition-colors">
            <Camera size={16} />
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-light-surface text-light-secondary text-sm font-medium hover:bg-light-hover transition-colors">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowFinishConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-light-primary font-semibold text-lg mb-2">Finish Session?</h3>
            <p className="text-light-muted text-sm mb-4">
              {completedSets} of {totalSets} sets completed. Duration: {elapsedFormatted}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-light-surface text-light-secondary font-medium hover:bg-light-hover transition-colors"
              >
                Continue
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-2.5 rounded-xl bg-cyan text-white font-medium hover:bg-cyan-dark transition-colors"
              >
                Finish
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
