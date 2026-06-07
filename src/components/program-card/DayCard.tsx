import { useState, useCallback } from 'react'
import { ChevronDown, Clock } from 'lucide-react'
import type { ProgramExercise } from '../../types/workout'
import { computeLetterNotation } from '../../utils/notation'
import ExerciseCard from './ExerciseCard'

interface DayCardProps {
  dayNumber: number
  dayLabel?: string
  exercises: ProgramExercise[]
}

export default function DayCard({ dayNumber, dayLabel = `Day ${dayNumber}`, exercises: initialExercises }: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(dayNumber === 1)
  const [exercises, setExercises] = useState<ProgramExercise[]>(initialExercises)

  // Recompute Poliquin notation whenever exercises change (type changes affect grouping)
  const notationMap = computeLetterNotation(
    exercises.map((e) => ({ exercise_order: e.exercise_order, set_type_id: e.set_type_id }))
  )

  const totalSets = exercises.reduce((sum, e) => sum + e.sets, 0)
  const estimatedMinutes = Math.round(totalSets * 3)

  const handleUpdateExercise = useCallback((updated: ProgramExercise) => {
    setExercises((prev) => {
      const next = prev.map((ex) =>
        ex.program_exercise_id === updated.program_exercise_id ? updated : ex
      )
      return next
    })
  }, [])

  return (
    <div className="rounded-xl border border-dark-border/30 bg-[#141414] overflow-hidden">
      {/* Day header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-[#1A1A1A]"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold bg-cyan/10 text-cyan">
            {dayNumber}
          </div>
          <div>
            <h3 className="text-dark-primary font-semibold text-[15px]">{dayLabel}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-dark-muted">
                {exercises.length} exercises
              </span>
              <span className="text-dark-border">·</span>
              <span className="text-[11px] text-dark-muted">
                {totalSets} sets
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-dark-muted">
            <Clock size={12} />
            <span>~{estimatedMinutes} min</span>
          </div>
          <div
            className={`w-8 h-8 flex items-center justify-center text-dark-muted hover:text-cyan transition-all duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <ChevronDown size={18} />
          </div>
        </div>
      </button>

      {/* Exercise cards */}
      <div
        className="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
        style={{
          maxHeight: isExpanded ? '8000px' : '0px',
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div className="px-3 pb-3 space-y-2.5">
          {exercises.map((exercise, idx) => {
            const notation = notationMap[idx] || String.fromCharCode(65 + idx)
            return (
              <ExerciseCard
                key={exercise.program_exercise_id}
                exercise={exercise}
                notation={notation}
                index={idx}
                onUpdate={handleUpdateExercise}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
