import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy, X, TrendingUp } from 'lucide-react'
import type { PersonalRecord } from './prDetection'

interface PRCelebrationModalProps {
  open: boolean
  records: PersonalRecord[]
  onClose: () => void
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function triggerConfetti() {
  const duration = 2500
  const end = Date.now() + duration
  const colors = ['#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      disableForReducedMotion: true,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  requestAnimationFrame(frame)
}

export function PRCelebrationModal({
  open,
  records,
  onClose,
}: PRCelebrationModalProps) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (open && !firedRef.current) {
      firedRef.current = true
      triggerConfetti()
    }
    if (!open) {
      firedRef.current = false
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pr-title"
        >
          <motion.div
            initial={{ scale: 0.85, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 16, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gradient-to-br from-cyan-600 to-cyan-800 text-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl overflow-hidden"
          >
            {/* Background burst */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/30 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-yellow-300/30 blur-2xl" />
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="relative text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/10">
                <Trophy size={32} className="text-yellow-300" />
              </div>
              <h2
                id="pr-title"
                className="text-2xl sm:text-3xl font-extrabold mb-1"
              >
                New PR!
              </h2>
              <p className="text-cyan-100 text-sm sm:text-base mb-6">
                You crushed your previous best on {records.length} exercise
                {records.length > 1 ? 's' : ''}.
              </p>

              <div className="space-y-3 mb-6">
                {records.map((record) => (
                  <div
                    key={`${record.exerciseId}-${record.metric}`}
                    className="bg-white/10 rounded-2xl p-4 text-left flex items-start gap-4"
                  >
                    <div className="mt-0.5 p-2 rounded-xl bg-white/10">
                      <TrendingUp size={18} className="text-yellow-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {record.exerciseName}
                      </p>
                      <p className="text-cyan-100 text-sm">
                        {record.metric === 'volume' ? 'Top set volume' : 'Top set load'}
                      </p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                          {formatNumber(record.newBest)} {record.unit}
                        </span>
                        {record.previousBest > 0 && (
                          <span className="text-xs text-cyan-100">
                            was {formatNumber(record.previousBest)} {record.unit}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cyan-100 mt-1">
                        {record.set.actualLoad} kg × {record.set.actualReps} reps
                        {record.set.actualRpe ? ` @ RPE ${record.set.actualRpe}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white text-cyan-700 font-semibold hover:bg-cyan-50 transition-colors"
              >
                Keep Going
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
