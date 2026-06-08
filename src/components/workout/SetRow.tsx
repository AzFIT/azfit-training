/**
 * Set Row — Individual set input row for workout logging
 *
 * Strong-inspired: weight, reps, RPE inputs with checkmark completion
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export interface SetData {
  setNumber: number
  targetWeight: number
  targetReps: number
  targetRpe: number
  actualWeight?: number
  actualReps?: number
  actualRpe?: number
  completed: boolean
}

interface SetRowProps {
  set: SetData
  onUpdate: (set: SetData) => void
  previousSet?: SetData
}

export default function SetRow({ set, onUpdate, previousSet: _previousSet }: SetRowProps) {
  const [weight, setWeight] = useState(set.actualWeight?.toString() || '')
  const [reps, setReps] = useState(set.actualReps?.toString() || '')
  const [rpe, setRpe] = useState(set.actualRpe?.toString() || '')

  const handleComplete = () => {
    onUpdate({
      ...set,
      actualWeight: parseFloat(weight) || set.targetWeight,
      actualReps: parseInt(reps) || set.targetReps,
      actualRpe: parseInt(rpe) || set.targetRpe,
      completed: !set.completed,
    })
  }

  const handleWeightChange = (v: string) => {
    setWeight(v)
    if (v && reps) {
      onUpdate({
        ...set,
        actualWeight: parseFloat(v) || 0,
        actualReps: parseInt(reps) || 0,
        actualRpe: parseInt(rpe) || set.targetRpe,
      })
    }
  }

  const handleRepsChange = (v: string) => {
    setReps(v)
    if (weight && v) {
      onUpdate({
        ...set,
        actualWeight: parseFloat(weight) || 0,
        actualReps: parseInt(v) || 0,
        actualRpe: parseInt(rpe) || set.targetRpe,
      })
    }
  }

  const handleRpeChange = (v: string) => {
    setRpe(v)
    if (weight && reps) {
      onUpdate({
        ...set,
        actualWeight: parseFloat(weight) || 0,
        actualReps: parseInt(reps) || 0,
        actualRpe: parseInt(v) || set.targetRpe,
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 py-1.5"
    >
      <span className="text-xs text-light-muted w-10 text-right flex-shrink-0">
        Set {set.setNumber}
      </span>

      {/* Weight input */}
      <div className="relative flex-1 max-w-[90px]">
        <input
          type="number"
          step="0.5"
          placeholder={String(set.targetWeight)}
          value={weight}
          onChange={(e) => handleWeightChange(e.target.value)}
          className={`w-full text-center text-sm py-1.5 px-2 rounded-lg border transition-all ${
            set.completed
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-light-surface border-light-border text-light-primary focus:border-cyan focus:ring-1 focus:ring-cyan/20'
          }`}
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-light-muted">kg</span>
      </div>

      {/* Reps input */}
      <div className="relative flex-1 max-w-[80px]">
        <input
          type="number"
          placeholder={String(set.targetReps)}
          value={reps}
          onChange={(e) => handleRepsChange(e.target.value)}
          className={`w-full text-center text-sm py-1.5 px-2 rounded-lg border transition-all ${
            set.completed
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-light-surface border-light-border text-light-primary focus:border-cyan focus:ring-1 focus:ring-cyan/20'
          }`}
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-light-muted">reps</span>
      </div>

      {/* RPE input */}
      <div className="relative flex-1 max-w-[70px]">
        <input
          type="number"
          min="1"
          max="10"
          placeholder={`RPE ${set.targetRpe}`}
          value={rpe}
          onChange={(e) => handleRpeChange(e.target.value)}
          className={`w-full text-center text-sm py-1.5 px-2 rounded-lg border transition-all ${
            set.completed
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-light-surface border-light-border text-light-primary focus:border-cyan focus:ring-1 focus:ring-cyan/20'
          }`}
        />
      </div>

      {/* Complete checkmark */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleComplete}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
          set.completed
            ? 'bg-success text-white shadow-sm shadow-success/30'
            : 'bg-light-surface border border-light-border text-light-muted hover:border-cyan hover:text-cyan'
        }`}
      >
        <Check size={14} strokeWidth={3} />
      </motion.button>
    </motion.div>
  )
}
