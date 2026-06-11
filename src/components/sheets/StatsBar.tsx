/**
 * StatsBar — Load / Progression / Sets / Timer for workout view
 */

import { Weight, TrendingUp, Layers, Clock } from 'lucide-react'

interface StatsBarProps {
  totalLoad: number
  progressionPercent: number
  setsCompleted: number
  setsTotal: number
  exerciseCount: number
  elapsedSeconds: number
}

export default function StatsBar({
  totalLoad,
  progressionPercent,
  setsCompleted,
  setsTotal,
  exerciseCount,
  elapsedSeconds,
}: StatsBarProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progressionColor =
    progressionPercent < 50 ? '#EF4444' : progressionPercent < 80 ? '#F59E0B' : '#22C55E'

  return (
    <div className="sticky top-[57px] z-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-b border-[var(--card-border)]">
      <div className="max-w-3xl mx-auto px-4 py-2">
        {/* Row 1: Load | Progression | Sets */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Weight className="w-3.5 h-3.5 text-cyan" />
            <span className="text-[var(--text-muted)]">Load:</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              {totalLoad.toLocaleString()}kg
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: progressionColor }} />
            <span className="text-[var(--text-muted)]">Prog:</span>
            <span className="font-semibold tabular-nums" style={{ color: progressionColor }}>
              {Math.round(progressionPercent)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple" />
            <span className="text-[var(--text-muted)]">Sets:</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              {setsCompleted}/{setsTotal}
            </span>
          </div>
        </div>

        {/* Row 2: Exercises | Timer */}
        <div className="flex items-center justify-between text-xs mt-1 text-[var(--text-muted)]">
          <span>{exerciseCount} exercises</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="tabular-nums">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1 bg-[var(--card-border)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${setsTotal > 0 ? (setsCompleted / setsTotal) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #00AEEF, #8B5CF6)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
