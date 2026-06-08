/**
 * Adjust Workout Drawer — Slide-up panel to modify the workout on the fly
 *
 * Features:
 * - Add/remove sets per exercise
 * - Change rest timer duration
 * - Add note to exercise
 * - Skip exercise (mark as done without logging)
 * - Reorder exercises (future)
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Timer, MessageSquare, SkipForward, GripVertical } from 'lucide-react'
import type { ExerciseBlockData } from './ExerciseBlock'
import type { SetData } from './SetRow'

interface AdjustWorkoutDrawerProps {
  exercises: ExerciseBlockData[]
  onUpdateExercises: (exercises: ExerciseBlockData[]) => void
  onClose: () => void
}

export default function AdjustWorkoutDrawer({
  exercises,
  onUpdateExercises,
  onClose,
}: AdjustWorkoutDrawerProps) {
  const [activeTab, setActiveTab] = useState<'sets' | 'rest' | 'notes'>('sets')
  const [localExercises, setLocalExercises] = useState<ExerciseBlockData[]>(exercises)

  const handleAddSet = (exIndex: number) => {
    const ex = localExercises[exIndex]
    const newSetNum = ex.sets.length + 1
    const newSet: SetData = {
      setNumber: newSetNum,
      targetWeight: ex.sets[ex.sets.length - 1]?.targetWeight ?? ex.target.weight,
      targetReps: ex.target.reps,
      targetRpe: ex.target.rpe,
      completed: false,
    }
    const updated = [...localExercises]
    updated[exIndex] = { ...ex, sets: [...ex.sets, newSet] }
    setLocalExercises(updated)
    onUpdateExercises(updated)
  }

  const handleRemoveSet = (exIndex: number) => {
    const ex = localExercises[exIndex]
    if (ex.sets.length <= 1) return
    const updated = [...localExercises]
    updated[exIndex] = { ...ex, sets: ex.sets.slice(0, -1) }
    setLocalExercises(updated)
    onUpdateExercises(updated)
  }

  const handleSkipExercise = (exIndex: number) => {
    const updated = localExercises.filter((_, i) => i !== exIndex)
    setLocalExercises(updated)
    onUpdateExercises(updated)
  }

  const tabs = [
    { key: 'sets' as const, label: 'Sets', icon: Plus },
    { key: 'rest' as const, label: 'Rest', icon: Timer },
    { key: 'notes' as const, label: 'Notes', icon: MessageSquare },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-light-border">
            <h3 className="text-light-primary font-semibold">Adjust Workout</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-light-muted hover:text-light-primary hover:bg-light-surface transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-light-border">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-cyan border-b-2 border-cyan'
                    : 'text-light-muted hover:text-light-secondary'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === 'sets' && (
              <>
                {localExercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="flex items-center gap-3 p-3 bg-light-surface rounded-xl"
                  >
                    <GripVertical size={14} className="text-light-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan bg-cyan/10 px-1.5 py-0.5 rounded">
                          {ex.notation}
                        </span>
                        <span className="text-sm font-medium text-light-primary truncate">
                          {ex.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRemoveSet(idx)}
                            disabled={ex.sets.length <= 1}
                            className="w-7 h-7 rounded-lg bg-white border border-light-border flex items-center justify-center text-light-muted hover:text-light-primary disabled:opacity-30 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium text-light-primary w-6 text-center">
                            {ex.sets.length}
                          </span>
                          <button
                            onClick={() => handleAddSet(idx)}
                            className="w-7 h-7 rounded-lg bg-white border border-light-border flex items-center justify-center text-light-muted hover:text-cyan transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-xs text-light-muted">sets</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSkipExercise(idx)}
                      className="p-2 rounded-lg text-light-muted hover:text-warning hover:bg-warning/10 transition-colors"
                      title="Skip exercise"
                    >
                      <SkipForward size={14} />
                    </button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'rest' && (
              <div className="space-y-4">
                <p className="text-sm text-light-muted">
                  Rest timer settings apply per exercise. Default is 90 seconds.
                </p>
                {localExercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-3 bg-light-surface rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan bg-cyan/10 px-1.5 py-0.5 rounded">
                        {ex.notation}
                      </span>
                      <span className="text-sm text-light-primary">{ex.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Timer size={14} className="text-light-muted" />
                      <span className="text-sm text-light-primary">90s</span>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-light-muted italic">
                  Per-exercise rest customization coming in a future update.
                </p>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <p className="text-sm text-light-muted">
                  Add session-wide notes. Per-exercise notes coming soon.
                </p>
                <textarea
                  placeholder="How is the client feeling? Any form issues to note?"
                  className="w-full h-32 p-3 rounded-xl border border-light-border bg-light-surface text-sm text-light-primary placeholder:text-light-muted resize-none focus:border-cyan focus:ring-1 focus:ring-cyan/20"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-light-border">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-cyan text-white font-medium hover:bg-cyan-dark transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
