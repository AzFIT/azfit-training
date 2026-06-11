/**
 * SessionLauncher — Bottom sheet modal to start a workout
 *
 * Spec: Shows session preview, stats, exercise list, Start Workout CTA
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X, Dumbbell, Timer, Layers, Play } from 'lucide-react'
import { useMemo } from 'react'

interface SessionExercise {
  order: string
  name: string
}

interface SessionLauncherProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
  programName: string
  phaseName: string
  sessionName: string
  focus?: string
  method?: string
  exercises: SessionExercise[]
  estimatedDuration?: number // minutes
}

export default function SessionLauncher({
  isOpen,
  onClose,
  onStart,
  programName,
  phaseName,
  sessionName,
  focus,
  method,
  exercises,
  estimatedDuration,
}: SessionLauncherProps) {
  const totalSets = exercises.length * 3 // rough estimate
  const displayExercises = useMemo(() => exercises.slice(0, 4), [exercises])
  const remainingCount = Math.max(0, exercises.length - 4)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full md:max-w-md md:rounded-2xl rounded-t-2xl bg-[var(--card-bg)] shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[var(--text-muted)]/30" />
            </div>

            {/* Header */}
            <div className="px-6 pt-2 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{programName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">{phaseName}</h2>
                    <span className="w-2 h-2 rounded-full bg-cyan" />
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-border)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Session card */}
            <div className="mx-6 p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">{sessionName}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {focus && (
                  <span className="px-2 py-0.5 rounded-md bg-cyan/10 text-cyan text-xs font-medium">
                    {focus}
                  </span>
                )}
                {method && (
                  <span className="px-2 py-0.5 rounded-md bg-purple/10 text-purple text-xs font-medium">
                    {method}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-4 text-sm text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4" />
                  <span>{exercises.length} exercises</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>{totalSets} sets est.</span>
                </div>
                {estimatedDuration && (
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-4 h-4" />
                    <span>~{estimatedDuration} min</span>
                  </div>
                )}
              </div>
            </div>

            {/* Exercise preview */}
            <div className="px-6 py-4">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Exercise Preview
              </p>
              <div className="space-y-2">
                {displayExercises.map((ex) => (
                  <div
                    key={ex.order}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
                  >
                    <span className="text-xs font-mono font-bold text-cyan w-6">{ex.order}</span>
                    <span className="text-sm text-[var(--text-primary)] truncate">{ex.name}</span>
                  </div>
                ))}
                {remainingCount > 0 && (
                  <p className="text-sm text-[var(--text-muted)] text-center py-1">
                    +{remainingCount} more
                  </p>
                )}
              </div>
            </div>

            {/* Start button */}
            <div className="px-6 pb-8 pt-2">
              <button
                onClick={onStart}
                className="w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                style={{ backgroundColor: '#00AEEF' }}
              >
                <Play className="w-5 h-5" fill="white" />
                Start Workout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
