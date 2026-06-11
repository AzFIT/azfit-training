/**
 * WorkoutSummary — Post-workout completion modal
 *
 * Spec: Celebration icon, gradient headline, stats cards, exercise breakdown, Done button
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Clock, Weight, CheckCircle, TrendingUp, Dumbbell, X } from 'lucide-react'
import { useMemo } from 'react'

interface ExerciseSummary {
  name: string
  setsCompleted: number
  totalSets: number
  volume: number
}

interface WorkoutSummaryProps {
  isOpen: boolean
  duration: string // "MM:SS"
  totalVolume: number
  setsCompleted: number
  setsTotal: number
  avgRpe: number
  exercises: ExerciseSummary[]
  vsLastWeek?: number // percentage change, e.g. +12 for +12%
  onDone: () => void
  onClose?: () => void
}

export default function WorkoutSummary({
  isOpen,
  duration,
  totalVolume,
  setsCompleted,
  setsTotal,
  avgRpe,
  exercises,
  vsLastWeek,
  onDone,
  onClose,
}: WorkoutSummaryProps) {
  const progressPercent = setsTotal > 0 ? Math.round((setsCompleted / setsTotal) * 100) : 0

  const stats = useMemo(
    () => [
      { icon: Clock, label: 'Duration', value: duration, color: '#00AEEF' },
      { icon: Weight, label: 'Volume', value: `${totalVolume.toLocaleString()} kg`, color: '#8B5CF6' },
      { icon: CheckCircle, label: 'Sets', value: `${setsCompleted}/${setsTotal}`, color: '#22C55E' },
      { icon: TrendingUp, label: 'Avg RPE', value: avgRpe.toFixed(1), color: '#F59E0B' },
    ],
    [duration, totalVolume, setsCompleted, setsTotal, avgRpe]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full md:max-w-lg md:rounded-2xl rounded-t-2xl bg-[var(--card-bg)] shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            {/* Header */}
            <div className="relative px-6 pt-8 pb-4 text-center">
              {onClose && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-border)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Trophy icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  background: 'linear-gradient(135deg, #00AEEF20, #8B5CF620)',
                  border: '1px solid #00AEEF30',
                }}
              >
                <Trophy className="w-8 h-8" style={{ color: '#00AEEF' }} />
              </motion.div>

              {/* Headline with gradient */}
              <h2
                className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #00AEEF, #8B5CF6)',
                }}
              >
                Workout Complete!
              </h2>

              {/* vs last week */}
              {vsLastWeek != null && (
                <p className={`mt-2 text-sm font-medium ${vsLastWeek >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {vsLastWeek >= 0 ? '+' : ''}
                  {vsLastWeek}% vs last week
                </p>
              )}
            </div>

            {/* Stats grid */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex flex-col items-center p-3 rounded-xl"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
                  >
                    <stat.icon className="w-5 h-5 mb-1" style={{ color: stat.color }} />
                    <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">
                      {stat.value}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-6 py-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-[var(--text-muted)]">Completion</span>
                <span className="font-semibold text-[var(--text-primary)]">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #00AEEF, #8B5CF6)',
                  }}
                />
              </div>
            </div>

            {/* Exercise breakdown */}
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                Exercise Breakdown
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {exercises.map((ex, i) => (
                  <motion.div
                    key={ex.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Dumbbell className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      <span className="text-sm text-[var(--text-primary)] truncate">{ex.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] shrink-0">
                      <span>
                        {ex.setsCompleted}/{ex.totalSets} sets
                      </span>
                      <span className="text-cyan font-medium tabular-nums">
                        {ex.volume.toLocaleString()}kg
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Done button */}
            <div className="px-6 pb-8 pt-2">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={onDone}
                className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-xl transition-shadow"
                style={{
                  background: 'linear-gradient(135deg, #00AEEF, #8B5CF6)',
                }}
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
