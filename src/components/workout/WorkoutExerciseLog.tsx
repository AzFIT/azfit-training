import { useState } from 'react'

import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { ProgramExercise } from '../../types/workout'
import LetterPill from '../program-builder/LetterPill'


interface WorkoutExerciseLogProps {
  exercise: ProgramExercise
  notation: string
  onLogSet: (setNumber: number, data: { load?: number; reps?: number; rpe?: number; completed: boolean }) => void
  loggedSets: Record<number, { load?: number; reps?: number; rpe?: number; completed: boolean }>
}

export default function WorkoutExerciseLog({ exercise, notation, onLogSet, loggedSets }: WorkoutExerciseLogProps) {
  const [expanded, setExpanded] = useState(true)

  const allCompleted = Array.from({ length: exercise.sets }).every((_, i) => loggedSets[i + 1]?.completed)

  return (
    <div className={cn(
      'bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden transition-colors',
      allCompleted ? 'border-emerald-200 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-700'
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <LetterPill notation={notation} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
            {exercise.exercise_name}
          </p>
          <p className="text-xs text-slate-400">
            Target: {exercise.sets}×{exercise.reps} @ RPE {exercise.rpe_target || '-'}
          </p>
        </div>
        {allCompleted && (
          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        )}
      </button>

      {/* Set rows */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {Array.from({ length: exercise.sets }).map((_, setIdx) => {
            const setNumber = setIdx + 1
            const log = loggedSets[setNumber] || { completed: false }

            return (
              <div
                key={setNumber}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-xl transition-colors',
                  log.completed
                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                    : 'bg-slate-50 dark:bg-slate-700/30'
                )}
              >
                <span className="text-xs font-bold text-slate-400 w-6">{setNumber}</span>

                <input
                  type="number"
                  placeholder="Load"
                  value={log.load ?? ''}
                  onChange={(e) => onLogSet(setNumber, { ...log, load: parseFloat(e.target.value) || undefined })}
                  className={cn(
                    'w-16 px-2 py-1.5 rounded-lg text-sm text-center',
                    'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600',
                    'focus:outline-none focus:border-[#0EA5E9]'
                  )}
                />
                <span className="text-xs text-slate-400">kg</span>

                <input
                  type="number"
                  placeholder="Reps"
                  value={log.reps ?? ''}
                  onChange={(e) => onLogSet(setNumber, { ...log, reps: parseInt(e.target.value) || undefined })}
                  className={cn(
                    'w-14 px-2 py-1.5 rounded-lg text-sm text-center',
                    'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600',
                    'focus:outline-none focus:border-[#0EA5E9]'
                  )}
                />

                <input
                  type="number"
                  placeholder="RPE"
                  min={1}
                  max={10}
                  step={0.5}
                  value={log.rpe ?? ''}
                  onChange={(e) => onLogSet(setNumber, { ...log, rpe: parseFloat(e.target.value) || undefined })}
                  className={cn(
                    'w-14 px-2 py-1.5 rounded-lg text-sm text-center',
                    'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600',
                    'focus:outline-none focus:border-[#0EA5E9]'
                  )}
                />

                <button
                  onClick={() => onLogSet(setNumber, { ...log, completed: !log.completed })}
                  className={cn(
                    'ml-auto w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                    log.completed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-400 hover:bg-slate-300'
                  )}
                >
                  <Check size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
