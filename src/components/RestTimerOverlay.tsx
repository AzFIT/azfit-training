/**
 * RestTimerOverlay — Full-screen rest timer between sets
 *
 * Spec: Full-screen overlay, massive countdown, gradient progress bar,
 * +15s/+30s buttons, skip rest, next exercise preview
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, SkipForward, ChevronDown } from 'lucide-react'

interface RestTimerOverlayProps {
  isOpen: boolean
  duration: number // seconds
  nextExercise: string
  nextSetNumber: number
  onComplete: () => void
  onAddTime: (seconds: number) => void
  onSkip: () => void
}

export default function RestTimerOverlay({
  isOpen,
  duration,
  nextExercise,
  nextSetNumber,
  onComplete,
  onAddTime,
  onSkip,
}: RestTimerOverlayProps) {
  const [remaining, setRemaining] = useState(duration)
  const [baseDuration, setBaseDuration] = useState(duration)

  // Reset when opened with new duration
  useEffect(() => {
    if (isOpen) {
      setBaseDuration(duration)
      setRemaining(duration)
    }
  }, [isOpen, duration])

  // Countdown
  useEffect(() => {
    if (!isOpen || remaining <= 0) return

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          // Auto-dismiss after 1s at zero
          setTimeout(() => onComplete(), 1000)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, remaining, onComplete])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleAddTime = useCallback(
    (seconds: number) => {
      setRemaining((prev) => prev + seconds)
      setBaseDuration((prev) => prev + seconds)
      onAddTime(seconds)
    },
    [onAddTime]
  )

  const progress = baseDuration > 0 ? ((baseDuration - remaining) / baseDuration) * 100 : 0

  // Color based on remaining time
  const getTimeColor = () => {
    if (remaining >= 30) return '#00AEEF' // cyan
    if (remaining >= 15) return '#F59E0B' // amber
    return '#EF4444' // red
  }

  const timeColor = getTimeColor()

  // Swipe down to dismiss (mobile)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart == null) return
    const diff = e.changedTouches[0].clientY - touchStart
    if (diff > 100) onSkip() // Swipe down > 100px
    setTouchStart(null)
  }

  // ESC key to dismiss
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onSkip()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onSkip])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backgroundColor: 'rgba(11, 17, 32, 0.95)' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle (mobile) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <ChevronDown className="w-6 h-6 text-white/30" />
            <span className="text-xs text-white/30">Swipe down to skip</span>
          </div>

          {/* REST TIMER label */}
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/50 text-sm font-medium tracking-widest uppercase mb-8"
          >
            Rest Timer
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="relative"
          >
            <span
              className="text-[96px] md:text-[120px] font-bold font-mono leading-none tabular-nums"
              style={{
                color: timeColor,
                textShadow: `0 0 40px ${timeColor}40`,
              }}
            >
              {formatTime(remaining)}
            </span>
            {/* Pulse animation when < 15s */}
            {remaining < 15 && remaining > 0 && (
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: `0 0 60px ${timeColor}30`,
                }}
              />
            )}
          </motion.div>

          {/* Progress bar */}
          <div className="w-full max-w-md mx-8 mt-10 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, #00AEEF 0%, ${timeColor} 100%)`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Add time buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 mt-10"
          >
            <button
              onClick={() => handleAddTime(15)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-cyan/40 text-cyan hover:bg-cyan/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">15s</span>
            </button>
            <button
              onClick={() => handleAddTime(30)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-cyan/40 text-cyan hover:bg-cyan/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">30s</span>
            </button>
          </motion.div>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onSkip}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            <span className="font-medium">Skip Rest</span>
          </motion.button>

          {/* Next exercise preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 left-0 right-0 text-center"
          >
            <p className="text-white/40 text-sm mb-1">Up next</p>
            <p className="text-white font-semibold text-lg">
              {nextExercise}
              <span className="text-cyan ml-2">— Set {nextSetNumber}</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
