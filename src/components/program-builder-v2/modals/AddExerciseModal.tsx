import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Loader2 } from 'lucide-react'
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
import { searchAllExercises, type MotionExercise } from '../../../services/workoutApi'

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'PRESSING', label: 'Pressing' },
  { value: 'PULLING', label: 'Pulling' },
  { value: 'BILATERAL_QUAD', label: 'Bilateral Quad' },
  { value: 'UNILATERAL_QUAD', label: 'Unilateral Quad' },
  { value: 'POSTERIOR', label: 'Posterior' },
  { value: 'TARGET_AREAS', label: 'Target Areas' },
  { value: 'BICEPS', label: 'Biceps' },
  { value: 'TRICEPS', label: 'Triceps' },
  { value: 'METCON_BRACING', label: 'Core / Bracing' },
]

interface AddExerciseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (exercise: SessionExercise) => void
  existingOrderNotations: string[]
}

export function AddExerciseModal({
  open,
  onOpenChange,
  onAdd,
  existingOrderNotations,
}: AddExerciseModalProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [exercises, setExercises] = useState<MotionExercise[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced fetch from Supabase
  useEffect(() => {
    if (!open) {
      setExercises([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const motionCategory = categoryFilter === 'all' ? undefined : categoryFilter
    const searchTerm = search || undefined

    searchAllExercises(searchTerm, motionCategory)
      .then((data) => {
        if (!cancelled) setExercises(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load exercises')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [open, search, categoryFilter])

  // Generate next order notation based on existing ones
  const getNextOrderNotation = useCallback((): string => {
    const prefixes = Array.from(new Set(existingOrderNotations.map((n) => n[0]))).sort()
    const lastPrefix = prefixes[prefixes.length - 1] || '@'
    const lastNum = Math.max(
      0,
      ...existingOrderNotations
        .filter((n) => n[0] === lastPrefix)
        .map((n) => parseInt(n.slice(1)) || 0)
    )
    return `${lastPrefix}${lastNum + 1}`
  }, [existingOrderNotations])

  const handleAdd = (ex: MotionExercise) => {
    const orderNotation = getNextOrderNotation()
    const newExercise: SessionExercise = {
      orderNotation,
      exerciseId: ex.exercise_id,
      exerciseName: ex.exercise_name,
      motionCategory: ex.motion_category || 'OTHER',
      sets: 3,
      reps: '10',
      tempo: '3-1-1-1',
      tut: null,
      restSeconds: 60,
      restDisplay: '60s',
      videoLink: ex.video_url,
      isModified: false,
      isSubstituted: false,
      originalExerciseId: ex.exercise_id,
      notes: '',
    }
    onAdd(newExercise)
    onOpenChange(false)
    setSearch('')
    setCategoryFilter('all')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Plus size={16} className="text-primary" />
            Add Exercise
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2 flex-1 overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-2 rounded-md border bg-background text-xs"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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

          {/* List */}
          {!loading && !error && (
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {exercises.map((ex) => (
                <div
                  key={ex.exercise_id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-light-primary">{ex.exercise_name}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <MotionCategoryBadge category={ex.motion_category || 'OTHER'} />
                      <span>{ex.muscle_group}</span>
                      <span>·</span>
                      <span>{ex.equipment_primary}</span>
                    </div>
                  </div>
                  <Button size="sm" className="text-xs h-8 shrink-0" onClick={() => handleAdd(ex)}>
                    Add
                  </Button>
                </div>
              ))}
              {exercises.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No exercises match your search.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
