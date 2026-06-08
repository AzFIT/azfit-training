/**
 * Exercise Block — Exercise section in workout session
 *
 * Shows: exercise name, previous session data, target, set rows
 * Strong-inspired with CoachRx notation (A1, A2, B1, B2)
 */

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Info, Video, BarChart3 } from 'lucide-react'
import SetRow, { type SetData } from './SetRow'
import RestTimer from './RestTimer'

export interface ExerciseBlockData {
  id: string
  notation: string // A1, A2, B1, etc.
  name: string
  supersetWith?: string // If part of a superset
  previousSession?: {
    weight: number
    reps: number[]
    rpe: number
  }
  target: {
    weight: number
    reps: number
    sets: number
    rpe: number
  }
  sets: SetData[]
  videoUrl?: string
}

interface ExerciseBlockProps {
  exercise: ExerciseBlockData
  onUpdateSets: (sets: SetData[]) => void
  restTimerDuration?: number
}

export default function ExerciseBlock({
  exercise,
  onUpdateSets,
  restTimerDuration = 90,
}: ExerciseBlockProps) {
  const [activeRestSet, setActiveRestSet] = useState<number | null>(null)

  const handleSetUpdate = useCallback(
    (updatedSet: SetData) => {
      const newSets = exercise.sets.map((s) =>
        s.setNumber === updatedSet.setNumber ? updatedSet : s
      )
      onUpdateSets(newSets)

      // Start rest timer when set is completed
      if (updatedSet.completed && !activeRestSet) {
        setActiveRestSet(updatedSet.setNumber)
      }
    },
    [exercise.sets, onUpdateSets, activeRestSet]
  )

  const handleRestComplete = useCallback(() => {
    setActiveRestSet(null)
  }, [])

  const handleAddTime = useCallback(
    (_seconds: number) => {
      // Timer component handles its own state
    },
    []
  )

  const handleSkipRest = useCallback(() => {
    setActiveRestSet(null)
  }, [])

  const completedSets = exercise.sets.filter((s) => s.completed).length
  const progressPercent = exercise.sets.length > 0 ? (completedSets / exercise.sets.length) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-light-border rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-cyan bg-cyan/10 px-1.5 py-0.5 rounded">
                {exercise.notation}
              </span>
              {exercise.supersetWith && (
                <span className="text-[10px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                  SS {exercise.supersetWith}
                </span>
              )}
              <h3 className="text-light-primary font-semibold text-sm">{exercise.name}</h3>
            </div>

            {/* Previous session */}
            {exercise.previousSession && (
              <p className="text-xs text-light-muted mt-1">
                Previous: {exercise.previousSession.weight}kg x{' '}
                {exercise.previousSession.reps.join(', ')} (RPE {exercise.previousSession.rpe})
              </p>
            )}

            {/* Target */}
            <p className="text-xs text-cyan font-medium mt-0.5">
              Target: {exercise.target.weight}kg x {exercise.target.reps},{' '}
              {exercise.target.sets} sets (RPE {exercise.target.rpe})
            </p>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="p-1.5 rounded-lg text-light-muted hover:text-light-primary hover:bg-light-surface transition-colors">
              <Info size={14} />
            </button>
            {exercise.videoUrl && (
              <button className="p-1.5 rounded-lg text-light-muted hover:text-cyan hover:bg-cyan/5 transition-colors">
                <Video size={14} />
              </button>
            )}
            <button className="p-1.5 rounded-lg text-light-muted hover:text-light-primary hover:bg-light-surface transition-colors">
              <BarChart3 size={14} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-light-muted">
              {completedSets}/{exercise.sets.length} sets
            </span>
            <span className="text-[10px] text-light-muted">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1 bg-light-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-full bg-cyan"
            />
          </div>
        </div>
      </div>

      {/* Rest Timer */}
      <div className="px-4">
        <RestTimer
          durationSeconds={restTimerDuration}
          isRunning={activeRestSet !== null}
          onComplete={handleRestComplete}
          onAddTime={handleAddTime}
          onSkip={handleSkipRest}
        />
      </div>

      {/* Set Rows */}
      <div className="px-4 py-2">
        {exercise.sets.map((set) => (
          <SetRow
            key={set.setNumber}
            set={set}
            onUpdate={handleSetUpdate}
            previousSet={
              exercise.previousSession
                ? {
                    ...set,
                    targetWeight: exercise.previousSession.weight,
                    targetReps: exercise.previousSession.reps[set.setNumber - 1] || exercise.target.reps,
                    targetRpe: exercise.previousSession.rpe,
                  }
                : undefined
            }
          />
        ))}
      </div>
    </motion.div>
  )
}
