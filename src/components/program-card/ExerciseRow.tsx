import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { ProgramExercise } from '../../types/workout'
import LetterPill from '../program-builder/LetterPill'
import { formatRestTime } from '../../utils/dateUtils'

interface ExerciseRowProps {
  exercise: ProgramExercise
  notation: string
  isExpanded: boolean
  onToggle: () => void
}

export default function ExerciseRow({ exercise, notation, isExpanded, onToggle }: ExerciseRowProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-slate-50 dark:hover:bg-slate-700/30',
        isExpanded && 'bg-slate-50 dark:bg-slate-700/30'
      )}
    >
      <LetterPill notation={notation} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
          {exercise.exercise_name}
        </p>
        {exercise.equipment_primary && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {exercise.equipment_primary}
          </p>
        )}
      </div>

      {/* Stats - hidden on very small screens */}
      <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium">
          {exercise.sets}×{exercise.reps}
        </span>
        {exercise.tempo && exercise.tempo !== 'Hold' && (
          <span>{exercise.tempo}</span>
        )}
        <span>{formatRestTime(exercise.rest_seconds)}</span>
        {exercise.rpe_target && (
          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
            RPE {exercise.rpe_target}
          </span>
        )}
      </div>

      {isExpanded ? (
        <ChevronUp size={16} className="text-slate-400" />
      ) : (
        <ChevronDown size={16} className="text-slate-400" />
      )}
    </button>
  )
}
