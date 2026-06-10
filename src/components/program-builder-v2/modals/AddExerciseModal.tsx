import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
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

// Demo exercise database for adds — in production this comes from Supabase
const DEMO_EXERCISES: Array<{
  id: number
  name: string
  motionCategory: string
  muscleGroup: string
  equipment: string
  defaultSets: number
  defaultReps: string
  defaultTempo: string
  defaultRest: number
}> = [
  { id: 1001, name: 'Barbell Bench Press', motionCategory: 'PRESSING', muscleGroup: 'Chest', equipment: 'Barbell', defaultSets: 3, defaultReps: '8', defaultTempo: '3-1-1-1', defaultRest: 90 },
  { id: 1002, name: 'DB Flat Press', motionCategory: 'PRESSING', muscleGroup: 'Chest', equipment: 'Dumbbell', defaultSets: 3, defaultReps: '10', defaultTempo: '3-2-1-2', defaultRest: 75 },
  { id: 1003, name: 'Pull up - Pronated', motionCategory: 'PULLING', muscleGroup: 'Back', equipment: 'Bodyweight', defaultSets: 3, defaultReps: '8', defaultTempo: '3-2-1-2', defaultRest: 90 },
  { id: 1004, name: 'Chin Up - Supinated', motionCategory: 'PULLING', muscleGroup: 'Back', equipment: 'Bodyweight', defaultSets: 3, defaultReps: '8', defaultTempo: '3-2-1-2', defaultRest: 90 },
  { id: 1005, name: 'Lat Pulldown - Wide', motionCategory: 'PULLING', muscleGroup: 'Back', equipment: 'Cable', defaultSets: 3, defaultReps: '10', defaultTempo: '3-2-1-2', defaultRest: 75 },
  { id: 1006, name: 'Back Squat', motionCategory: 'BILATERAL_QUAD', muscleGroup: 'Quads', equipment: 'Barbell', defaultSets: 3, defaultReps: '6', defaultTempo: '3-2-1-1', defaultRest: 120 },
  { id: 1007, name: 'Leg Press', motionCategory: 'BILATERAL_QUAD', muscleGroup: 'Quads', equipment: 'Machine', defaultSets: 3, defaultReps: '10', defaultTempo: '3-2-1-2', defaultRest: 90 },
  { id: 1008, name: 'Bulgarian Split Squat', motionCategory: 'UNILATERAL_QUAD', muscleGroup: 'Quads', equipment: 'Dumbbell', defaultSets: 3, defaultReps: '10', defaultTempo: '3-2-1-2', defaultRest: 75 },
  { id: 1009, name: 'Romanian Deadlift', motionCategory: 'POSTERIOR', muscleGroup: 'Hamstrings', equipment: 'Barbell', defaultSets: 3, defaultReps: '8', defaultTempo: '3-2-1-2', defaultRest: 90 },
  { id: 1010, name: 'Hip Thrust', motionCategory: 'POSTERIOR', muscleGroup: 'Glutes', equipment: 'Barbell', defaultSets: 3, defaultReps: '10', defaultTempo: '3-2-1-2', defaultRest: 75 },
  { id: 1011, name: 'DB Lateral Raise', motionCategory: 'TARGET_AREAS', muscleGroup: 'Delts', equipment: 'Dumbbell', defaultSets: 3, defaultReps: '12', defaultTempo: '2-1-2-1', defaultRest: 60 },
  { id: 1012, name: 'Face Pull', motionCategory: 'TARGET_AREAS', muscleGroup: 'Rear Delt', equipment: 'Cable', defaultSets: 3, defaultReps: '15', defaultTempo: '2-1-2-1', defaultRest: 60 },
  { id: 1013, name: 'Barbell Curl', motionCategory: 'BICEPS', muscleGroup: 'Biceps', equipment: 'Barbell', defaultSets: 3, defaultReps: '10', defaultTempo: '3-1-1-1', defaultRest: 60 },
  { id: 1014, name: 'Tricep Pushdown', motionCategory: 'TRICEPS', muscleGroup: 'Triceps', equipment: 'Cable', defaultSets: 3, defaultReps: '12', defaultTempo: '2-1-2-1', defaultRest: 60 },
  { id: 1015, name: 'Front Plank', motionCategory: 'METCON_BRACING', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, defaultReps: '30s', defaultTempo: 'n/a', defaultRest: 45 },
  { id: 1016, name: 'Dead Bug', motionCategory: 'METCON_BRACING', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, defaultReps: '10', defaultTempo: '3-2-1-2', defaultRest: 45 },
]

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

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return DEMO_EXERCISES.filter((ex) => {
      if (categoryFilter !== 'all' && ex.motionCategory !== categoryFilter) return false
      if (q && !ex.name.toLowerCase().includes(q) && !ex.muscleGroup.toLowerCase().includes(q)) return false
      return true
    })
  }, [search, categoryFilter])

  // Generate next order notation based on existing ones
  const getNextOrderNotation = (): string => {
    const prefixes = Array.from(new Set(existingOrderNotations.map((n) => n[0]))).sort()
    const lastPrefix = prefixes[prefixes.length - 1] || '@'
    const lastNum = Math.max(
      0,
      ...existingOrderNotations
        .filter((n) => n[0] === lastPrefix)
        .map((n) => parseInt(n.slice(1)) || 0)
    )
    return `${lastPrefix}${lastNum + 1}`
  }

  const handleAdd = (ex: typeof DEMO_EXERCISES[number]) => {
    const orderNotation = getNextOrderNotation()
    const newExercise: SessionExercise = {
      orderNotation,
      exerciseId: ex.id,
      exerciseName: ex.name,
      motionCategory: ex.motionCategory,
      sets: ex.defaultSets,
      reps: ex.defaultReps,
      tempo: ex.defaultTempo,
      tut: null,
      restSeconds: ex.defaultRest,
      restDisplay: `${ex.defaultRest}s`,
      videoLink: null,
      isModified: false,
      isSubstituted: false,
      originalExerciseId: ex.id,
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

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {filtered.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-light-primary">{ex.name}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MotionCategoryBadge category={ex.motionCategory} />
                    <span>{ex.muscleGroup}</span>
                    <span>·</span>
                    <span>{ex.equipment}</span>
                    <span>·</span>
                    <span>{ex.defaultSets}×{ex.defaultReps}</span>
                  </div>
                </div>
                <Button size="sm" className="text-xs h-8 shrink-0" onClick={() => handleAdd(ex)}>
                  Add
                </Button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No exercises match your search.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
