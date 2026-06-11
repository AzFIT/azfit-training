/**
 * BottomBar — Sticky finish bar for mobile workout view
 */

import { Clock, Weight, TrendingUp, Flag } from 'lucide-react'

interface BottomBarProps {
  elapsedSeconds: number
  totalLoad: number
  progressionPercent: number
  setsCompleted: number
  onFinish: () => void
  canFinish: boolean
}

export default function BottomBar({
  elapsedSeconds,
  totalLoad,
  progressionPercent,
  setsCompleted,
  onFinish,
  canFinish,
}: BottomBarProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progressionColor =
    progressionPercent < 50 ? '#EF4444' : progressionPercent < 80 ? '#F59E0B' : '#22C55E'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t px-4 py-3"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        {/* Timer */}
        <button className="flex items-center gap-1.5 text-[var(--text-primary)]">
          <Clock className="w-4 h-4 text-cyan" />
          <span className="font-mono font-semibold text-sm tabular-nums">
            {formatTime(elapsedSeconds)}
          </span>
        </button>

        {/* Volume */}
        <div className="flex items-center gap-1.5 text-sm">
          <Weight className="w-4 h-4 text-purple" />
          <span className="font-semibold text-[var(--text-primary)] tabular-nums">
            {totalLoad.toLocaleString()}kg
          </span>
        </div>

        {/* Progression */}
        <div className="flex items-center gap-1.5 text-sm">
          <TrendingUp className="w-4 h-4" style={{ color: progressionColor }} />
          <span className="font-semibold tabular-nums" style={{ color: progressionColor }}>
            {Math.round(progressionPercent)}%
          </span>
        </div>

        {/* Finish button */}
        <button
          onClick={onFinish}
          disabled={!canFinish}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-bold text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          style={{
            background: canFinish
              ? 'linear-gradient(135deg, #00AEEF, #8B5CF6)'
              : 'linear-gradient(135deg, #94A3B8, #64748B)',
          }}
        >
          <Flag className="w-4 h-4" />
          <span className="hidden sm:inline">Finish</span>
        </button>
      </div>
    </div>
  )
}
