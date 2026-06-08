/**
 * Rest Timer — Circular countdown timer between sets
 *
 * Strong-inspired: auto-starts on set completion, circular progress, +15s/Skip
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Plus, SkipForward } from 'lucide-react'

interface RestTimerProps {
  durationSeconds: number
  isRunning: boolean
  onComplete: () => void
  onAddTime?: (seconds: number) => void
  onSkip: () => void
}

export default function RestTimer({
  durationSeconds,
  isRunning,
  onComplete,
  onAddTime,
  onSkip,
}: RestTimerProps) {
  const [baseDuration, setBaseDuration] = useState(durationSeconds)
  const [remaining, setRemaining] = useState(durationSeconds)
  const [paused, setPaused] = useState(false)

  // Reset when a new rest period starts (isRunning flips from false -> true)
  // or when durationSeconds prop changes meaningfully
  useEffect(() => {
    if (isRunning) {
      setBaseDuration(durationSeconds)
      setRemaining(durationSeconds)
      setPaused(false)
    }
  }, [isRunning, durationSeconds])

  useEffect(() => {
    if (!isRunning || paused || remaining <= 0) return

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, paused, remaining, onComplete])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleAddTime = (seconds: number) => {
    setRemaining((prev) => prev + seconds)
    setBaseDuration((prev) => prev + seconds)
    onAddTime?.(seconds)
  }

  const progress = baseDuration > 0 ? ((baseDuration - remaining) / baseDuration) * 100 : 0
  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference - (progress / 100) * circumference

  if (!isRunning && remaining === baseDuration) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 bg-cyan/5 border border-cyan/20 rounded-xl px-4 py-2.5"
    >
      {/* Circular progress */}
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="#00AEEF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <button
          onClick={() => setPaused(!paused)}
          className="absolute inset-0 flex items-center justify-center text-cyan hover:text-cyan-dark"
        >
          {paused ? <Play size={12} fill="currentColor" /> : <Pause size={12} />}
        </button>
      </div>

      {/* Time display */}
      <div className="flex-1">
        <span className="text-sm font-semibold text-light-primary">
          {formatTime(remaining)}
        </span>
        <span className="text-xs text-light-muted ml-1">remaining</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleAddTime(15)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-light-surface hover:bg-light-hover text-light-secondary text-xs transition-colors"
        >
          <Plus size={10} />
          15s
        </button>
        <button
          onClick={onSkip}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-light-surface hover:bg-light-hover text-light-secondary text-xs transition-colors"
        >
          <SkipForward size={10} />
          Skip
        </button>
      </div>
    </motion.div>
  )
}
