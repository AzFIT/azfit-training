import { useState, useEffect } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { MotionCategoryBadge } from '../shared/MotionCategoryBadge'
import type { SessionExercise } from '../../../types/program-builder-v2'

interface ExerciseEditModalProps {
  exercise: SessionExercise | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: Partial<SessionExercise>) => void
}

export function ExerciseEditModal({
  exercise,
  open,
  onOpenChange,
  onSave,
}: ExerciseEditModalProps) {
  const [sets, setSets] = useState(2)
  const [reps, setReps] = useState('10')
  const [tempo, setTempo] = useState('3-2-1-2-1')
  const [restSeconds, setRestSeconds] = useState(45)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (exercise) {
      setSets(exercise.sets)
      setReps(exercise.reps)
      setTempo(exercise.tempo)
      setRestSeconds(exercise.restSeconds)
      setNotes(exercise.notes)
    }
  }, [exercise])

  if (!exercise) return null

  const handleSave = () => {
    onSave({
      sets,
      reps,
      tempo,
      restSeconds,
      restDisplay: `${restSeconds}s`,
      notes,
    })
    onOpenChange(false)
  }

  // Auto-calculate TUT
  const tempoSum = tempo.split('-').reduce((sum, t) => sum + (parseInt(t) || 0), 0)
  const repNum = parseInt(reps) || 0
  const calculatedTUT = repNum * tempoSum

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <span>✏️ Edit Exercise</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Exercise info */}
          <div className="p-3 rounded-lg bg-muted">
            <div className="text-sm font-semibold text-light-primary">{exercise.exerciseName}</div>
            {exercise.motionCategory && (
              <div className="mt-1">
                <MotionCategoryBadge category={exercise.motionCategory} />
              </div>
            )}
          </div>

          {/* Sets */}
          <div className="space-y-1.5">
            <Label className="text-xs">Sets</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setSets(Math.max(1, sets - 1))}
              >
                −
              </Button>
              <Input
                type="number"
                min={1}
                max={20}
                value={sets}
                onChange={(e) => setSets(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="h-8 w-16 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setSets(Math.min(20, sets + 1))}
              >
                +
              </Button>
            </div>
          </div>

          {/* Reps */}
          <div className="space-y-1.5">
            <Label className="text-xs">Reps</Label>
            <Input
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="10 or 8-12"
              className="h-9 text-sm"
            />
          </div>

          {/* Tempo */}
          <div className="space-y-1.5">
            <Label className="text-xs">Tempo (Ecc-Pause-Con-Pause-?)</Label>
            <Input
              value={tempo}
              onChange={(e) => setTempo(e.target.value)}
              placeholder="3-2-1-2-1"
              className="h-9 text-sm font-mono"
            />
          </div>

          {/* Rest */}
          <div className="space-y-1.5">
            <Label className="text-xs">Rest (seconds)</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setRestSeconds(Math.max(0, restSeconds - 15))}
              >
                −
              </Button>
              <Input
                type="number"
                min={0}
                max={600}
                step={15}
                value={restSeconds}
                onChange={(e) => setRestSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                className="h-8 w-20 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setRestSeconds(Math.min(600, restSeconds + 15))}
              >
                +
              </Button>
              <span className="text-xs text-muted-foreground ml-1">seconds</span>
            </div>
          </div>

          {/* Auto TUT */}
          <div className="flex items-center justify-between p-2 rounded bg-muted">
            <span className="text-xs text-muted-foreground">Auto-calculated TUT</span>
            <span className="text-sm font-mono font-medium">{calculatedTUT}s</span>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add coaching cues, substitutions, etc."
              className="w-full min-h-[60px] px-3 py-2 rounded-md border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 text-xs" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1 text-xs" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
