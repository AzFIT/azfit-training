import { useState, useMemo } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { MotionCategoryBadge } from '../shared/MotionCategoryBadge'
import type { SessionExercise } from '../../../types/program-builder-v2'

// Demo exercise database for swaps — in production this comes from Supabase
const DEMO_EXERCISES: Array<{
  id: number
  name: string
  motionCategory: string
  muscleGroup: string
  equipment: string
  videoUrl?: string
}> = [
  { id: 101, name: 'Pull up - Pronated Grip', motionCategory: 'PULLING', muscleGroup: 'Back', equipment: 'Bodyweight' },
  { id: 102, name: 'Chin Up - Supinated', motionCategory: 'PULLING', muscleGroup: 'Back', equipment: 'Bodyweight' },
  { id: 103, name: 'Lat Pulldown - Supinated', motionCategory: 'PULLING', muscleGroup: 'Back', equipment: 'Cable' },
  { id: 104, name: 'Prone DB Row', motionCategory: 'PULLING', muscleGroup: 'Back', equipment: 'Dumbbell' },
  { id: 105, name: 'Chest-Supported Row', motionCategory: 'PULLING', muscleGroup: 'Back', equipment: 'Machine' },
  { id: 106, name: 'Single-Arm DB Row', motionCategory: 'PULLING', muscleGroup: 'Back', equipment: 'Dumbbell' },
  { id: 201, name: 'Barbell Bench Press', motionCategory: 'PRESSING', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: 202, name: 'DB Flat Press', motionCategory: 'PRESSING', muscleGroup: 'Chest', equipment: 'Dumbbell' },
  { id: 203, name: 'Machine Chest Press', motionCategory: 'PRESSING', muscleGroup: 'Chest', equipment: 'Machine' },
  { id: 204, name: 'Push Up', motionCategory: 'PRESSING', muscleGroup: 'Chest', equipment: 'Bodyweight' },
  { id: 301, name: 'Back Squat', motionCategory: 'BILATERAL_QUAD', muscleGroup: 'Quads', equipment: 'Barbell' },
  { id: 302, name: 'Front Squat', motionCategory: 'BILATERAL_QUAD', muscleGroup: 'Quads', equipment: 'Barbell' },
  { id: 303, name: 'Leg Press', motionCategory: 'BILATERAL_QUAD', muscleGroup: 'Quads', equipment: 'Machine' },
  { id: 304, name: 'Goblet Squat', motionCategory: 'BILATERAL_QUAD', muscleGroup: 'Quads', equipment: 'Dumbbell' },
  { id: 401, name: 'Bulgarian Split Squat', motionCategory: 'UNILATERAL_QUAD', muscleGroup: 'Quads', equipment: 'Dumbbell' },
  { id: 402, name: 'Walking Lunge', motionCategory: 'UNILATERAL_QUAD', muscleGroup: 'Quads', equipment: 'Dumbbell' },
  { id: 403, name: 'Step Up', motionCategory: 'UNILATERAL_QUAD', muscleGroup: 'Quads', equipment: 'Dumbbell' },
  { id: 501, name: 'Romanian Deadlift', motionCategory: 'POSTERIOR', muscleGroup: 'Hamstrings', equipment: 'Barbell' },
  { id: 502, name: 'Leg Curl - Lying', motionCategory: 'POSTERIOR', muscleGroup: 'Hamstrings', equipment: 'Machine' },
  { id: 503, name: 'Hip Thrust', motionCategory: 'POSTERIOR', muscleGroup: 'Glutes', equipment: 'Barbell' },
  { id: 504, name: 'Good Morning', motionCategory: 'POSTERIOR', muscleGroup: 'Hamstrings', equipment: 'Barbell' },
  { id: 601, name: 'DB Lateral Raise', motionCategory: 'TARGET_AREAS', muscleGroup: 'Delts', equipment: 'Dumbbell' },
  { id: 602, name: 'Face Pull', motionCategory: 'TARGET_AREAS', muscleGroup: 'Rear Delt', equipment: 'Cable' },
  { id: 603, name: 'Rear Delt Fly', motionCategory: 'TARGET_AREAS', muscleGroup: 'Rear Delt', equipment: 'Dumbbell' },
  { id: 701, name: 'Barbell Curl', motionCategory: 'BICEPS', muscleGroup: 'Biceps', equipment: 'Barbell' },
  { id: 702, name: 'Incline DB Curl', motionCategory: 'BICEPS', muscleGroup: 'Biceps', equipment: 'Dumbbell' },
  { id: 703, name: 'Hammer Curl', motionCategory: 'BICEPS', muscleGroup: 'Biceps', equipment: 'Dumbbell' },
  { id: 801, name: 'Tricep Pushdown', motionCategory: 'TRICEPS', muscleGroup: 'Triceps', equipment: 'Cable' },
  { id: 802, name: 'Overhead DB Extension', motionCategory: 'TRICEPS', muscleGroup: 'Triceps', equipment: 'Dumbbell' },
  { id: 803, name: 'Close-Grip Bench', motionCategory: 'TRICEPS', muscleGroup: 'Triceps', equipment: 'Barbell' },
  { id: 901, name: 'Front Plank', motionCategory: 'METCON_BRACING', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { id: 902, name: 'Dead Bug', motionCategory: 'METCON_BRACING', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { id: 903, name: 'Pallof Press', motionCategory: 'METCON_BRACING', muscleGroup: 'Core', equipment: 'Cable' },
]

interface ExerciseSwapModalProps {
  currentExercise: SessionExercise | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (newExerciseId: number, newExerciseName: string, newMotionCategory: string) => void
}

export function ExerciseSwapModal({
  currentExercise,
  open,
  onOpenChange,
  onConfirm,
}: ExerciseSwapModalProps) {
  const [search, setSearch] = useState('')

  const alternatives = useMemo(() => {
    if (!currentExercise) return []
    const q = search.toLowerCase()
    return DEMO_EXERCISES.filter(
      (ex) =>
        ex.motionCategory === currentExercise.motionCategory &&
        ex.id !== currentExercise.exerciseId &&
        (q === '' || ex.name.toLowerCase().includes(q) || ex.equipment.toLowerCase().includes(q))
    )
  }, [currentExercise, search])

  if (!currentExercise) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <span>🔄 Swap Exercise</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2 flex-1 overflow-hidden flex flex-col">
          {/* Current exercise */}
          <div className="p-3 rounded-lg bg-muted border">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Current</div>
            <div className="text-sm font-semibold text-[light-primary]">{currentExercise.exerciseName}</div>
            <div className="flex items-center gap-2 mt-1">
              <MotionCategoryBadge category={currentExercise.motionCategory || 'OTHER'} />
              <span className="text-xs text-muted-foreground">Motion category locked</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search alternatives..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Alternatives list */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {alternatives.length > 0 ? (
              alternatives.map((alt) => (
                <div
                  key={alt.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[light-primary]">{alt.name}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <MotionCategoryBadge category={alt.motionCategory || 'OTHER'} />
                      <span>{alt.muscleGroup}</span>
                      <span>·</span>
                      <span>{alt.equipment}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="text-xs h-8 shrink-0"
                    onClick={() => {
                      onConfirm(alt.id, alt.name, alt.motionCategory)
                      onOpenChange(false)
                    }}
                  >
                    Select
                    <ArrowRight size={12} className="ml-1" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No alternatives found for {currentExercise.motionCategory}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
