import { Play, RefreshCw, Pencil, Trash2, GripVertical } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Button } from '../../../components/ui/button'
import { MotionCategoryBadge } from '../shared/MotionCategoryBadge'
import type { SessionExercise } from '../../../types/program-builder-v2'

interface ExerciseCardProps {
  exercise: SessionExercise
  index: number
  onSwap: () => void
  onEdit: () => void
  onDelete: () => void
  onVideo: () => void
  className?: string
}

export function ExerciseCard({
  exercise,
  onSwap,
  onEdit,
  onDelete,
  onVideo,
  className,
}: ExerciseCardProps) {
  // Calculate TUT display
  const tutDisplay = exercise.tut ? `${exercise.tut}s TUT` : null

  // Parse tempo for display
  const tempoParts = exercise.tempo.split('-')
  const tempoShort = tempoParts.length >= 4
    ? `${tempoParts[0]}-${tempoParts[1]}-${tempoParts[2]}-${tempoParts[3]}`
    : exercise.tempo

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-3 rounded-xl border bg-card transition-all',
        'hover:border-primary/30 hover:shadow-sm',
        exercise.isSubstituted && 'border-amber-300/50 bg-amber-50/30 dark:bg-amber-950/10',
        exercise.isModified && 'border-blue-300/50 bg-blue-50/30 dark:bg-blue-950/10',
        className
      )}
    >
      {/* Drag handle */}
      <div className="pt-1 text-muted-foreground/30 group-hover:text-muted-foreground/60 cursor-grab">
        <GripVertical size={14} />
      </div>

      {/* Order notation */}
      <div className="flex flex-col items-center pt-0.5">
        <span className="text-xs font-bold text-primary min-w-[24px] text-center">
          {exercise.orderNotation}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Name + badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-light-primary">
            {exercise.exerciseName}
          </span>
          {exercise.motionCategory && (
            <MotionCategoryBadge category={exercise.motionCategory} />
          )}
          {exercise.isSubstituted && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium">
              Swapped
            </span>
          )}
          {exercise.isModified && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
              Edited
            </span>
          )}
        </div>

        {/* Parameters row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-light-primary">{exercise.sets} sets</span>
          <span>×</span>
          <span className="font-medium text-light-primary">{exercise.reps} reps</span>
          <span className="text-border">|</span>
          <span>Tempo {tempoShort}</span>
          {tutDisplay && (
            <>
              <span className="text-border">|</span>
              <span>{tutDisplay}</span>
            </>
          )}
          <span className="text-border">|</span>
          <span>Rest {exercise.restDisplay}</span>
        </div>

        {/* Notes */}
        {exercise.notes && (
          <p className="text-xs text-muted-foreground italic">{exercise.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {exercise.videoLink && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
            onClick={onVideo}
            title="Watch video"
          >
            <Play size={13} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-600"
          onClick={onSwap}
          title="Swap exercise"
        >
          <RefreshCw size={13} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-600"
          onClick={onEdit}
          title="Edit parameters"
        >
          <Pencil size={13} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
          onClick={onDelete}
          title="Remove exercise"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  )
}
