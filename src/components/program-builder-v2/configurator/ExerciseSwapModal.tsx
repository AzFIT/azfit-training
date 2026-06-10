import { useState, useMemo, useEffect } from 'react'
import { Search, ArrowRight, Loader2 } from 'lucide-react'
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
import { searchExercisesByMotion, type MotionExercise } from '../../../services/workoutApi'

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
  const [exercises, setExercises] = useState<MotionExercise[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch alternatives from Supabase when modal opens
  useEffect(() => {
    if (!open || !currentExercise?.motionCategory) {
      setExercises([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    searchExercisesByMotion(currentExercise.motionCategory, search || undefined)
      .then((data) => {
        if (!cancelled) {
          // Exclude current exercise
          setExercises(
            data.filter((ex) => ex.exercise_id !== currentExercise.exerciseId)
          )
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load exercises')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [open, currentExercise?.motionCategory, currentExercise?.exerciseId])

  // Client-side search filter
  const alternatives = useMemo(() => {
    if (!search) return exercises
    const q = search.toLowerCase()
    return exercises.filter(
      (ex) =>
        ex.exercise_name.toLowerCase().includes(q) ||
        (ex.equipment_primary || '').toLowerCase().includes(q)
    )
  }, [exercises, search])

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
            <div className="text-sm font-semibold text-light-primary">{currentExercise.exerciseName}</div>
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

          {/* Loading / Error */}
          {loading && (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin mr-2" />
              Loading exercises...
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Alternatives list */}
          {!loading && !error && (
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {alternatives.length > 0 ? (
                alternatives.map((alt) => (
                  <div
                    key={alt.exercise_id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-light-primary">{alt.exercise_name}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MotionCategoryBadge category={alt.motion_category || 'OTHER'} />
                        <span>{alt.muscle_group}</span>
                        <span>·</span>
                        <span>{alt.equipment_primary}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="text-xs h-8 shrink-0"
                      onClick={() => {
                        onConfirm(alt.exercise_id, alt.exercise_name, alt.motion_category || 'OTHER')
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
