/**
 * Plate Calculator — Visual plate loading helper
 *
 * Strong-inspired: tap weight field to see which plates to load
 * Olympic bar = 20kg. Shows plates per side.
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus } from 'lucide-react'

interface PlateCalculatorProps {
  targetWeight: number
  barWeight?: number
  onSelect: (weight: number) => void
  onClose: () => void
}

const STANDARD_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5]

function calculatePlates(targetWeight: number, barWeight: number): number[] {
  let remaining = (targetWeight - barWeight) / 2
  if (remaining <= 0) return []

  const plates: number[] = []
  for (const plate of STANDARD_PLATES) {
    while (remaining >= plate - 0.001) {
      plates.push(plate)
      remaining -= plate
    }
  }
  return plates
}

export default function PlateCalculator({
  targetWeight,
  barWeight = 20,
  onSelect,
  onClose,
}: PlateCalculatorProps) {
  const [weight, setWeight] = useState(targetWeight)

  const platesPerSide = useMemo(() => calculatePlates(weight, barWeight), [weight, barWeight])
  const actualWeight = barWeight + platesPerSide.reduce((s, p) => s + p * 2, 0)
  const isExact = Math.abs(actualWeight - weight) < 0.01

  const plateColor = (plate: number): string => {
    if (plate >= 25) return 'bg-red-500'
    if (plate >= 20) return 'bg-blue-500'
    if (plate >= 15) return 'bg-yellow-500'
    if (plate >= 10) return 'bg-green-500'
    if (plate >= 5) return 'bg-white border-2 border-slate-300'
    if (plate >= 2.5) return 'bg-slate-800'
    return 'bg-slate-400'
  }

  const plateHeight = (plate: number): string => {
    if (plate >= 25) return 'h-16'
    if (plate >= 20) return 'h-14'
    if (plate >= 15) return 'h-12'
    if (plate >= 10) return 'h-10'
    if (plate >= 5) return 'h-8'
    if (plate >= 2.5) return 'h-6'
    return 'h-4'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-light-primary font-semibold">Plate Calculator</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-light-muted hover:text-light-primary hover:bg-light-surface transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Weight selector */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setWeight((w) => Math.max(barWeight, w - 2.5))}
              className="w-10 h-10 rounded-xl bg-light-surface flex items-center justify-center text-light-secondary hover:bg-light-hover transition-colors"
            >
              <Minus size={16} />
            </button>
            <div className="text-center">
              <div className="text-3xl font-bold text-light-primary tabular-nums">
                {weight.toFixed(1)}
              </div>
              <div className="text-xs text-light-muted">kg</div>
            </div>
            <button
              onClick={() => setWeight((w) => w + 2.5)}
              className="w-10 h-10 rounded-xl bg-light-surface flex items-center justify-center text-light-secondary hover:bg-light-hover transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Bar visualization */}
          <div className="bg-light-surface rounded-xl p-4">
            <div className="flex items-center justify-center gap-8">
              {/* Left side */}
              <div className="flex flex-col items-end gap-0.5">
                {platesPerSide.map((plate, i) => (
                  <div
                    key={`left-${i}`}
                    className={`${plateHeight(plate)} w-3 rounded-sm ${plateColor(plate)}`}
                    title={`${plate}kg`}
                  />
                ))}
              </div>

              {/* Bar */}
              <div className="relative">
                <div className="w-32 h-2 bg-slate-400 rounded-full" />
                <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-4 h-4 bg-slate-500 rounded-full" />
              </div>

              {/* Right side */}
              <div className="flex flex-col items-start gap-0.5">
                {platesPerSide.map((plate, i) => (
                  <div
                    key={`right-${i}`}
                    className={`${plateHeight(plate)} w-3 rounded-sm ${plateColor(plate)}`}
                    title={`${plate}kg`}
                  />
                ))}
              </div>
            </div>

            {/* Plate breakdown text */}
            <div className="mt-3 text-center">
              {platesPerSide.length > 0 ? (
                <p className="text-xs text-light-muted">
                  Each side: {platesPerSide.join(' + ')} ={' '}
                  <span className="font-semibold text-light-primary">
                    {platesPerSide.reduce((s, p) => s + p, 0)}kg
                  </span>
                </p>
              ) : (
                <p className="text-xs text-light-muted">Bar only ({barWeight}kg)</p>
              )}
              <p className="text-xs text-light-muted mt-0.5">
                Total: ({platesPerSide.reduce((s, p) => s + p, 0)} × 2) + {barWeight} bar ={' '}
                <span className={`font-semibold ${isExact ? 'text-cyan' : 'text-warning'}`}>
                  {actualWeight.toFixed(1)}kg
                </span>
                {!isExact && (
                  <span className="text-[10px] text-light-muted ml-1">
                    (closest to {weight}kg)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick plate buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            {STANDARD_PLATES.filter((p) => p >= 1.25).map((plate) => (
              <button
                key={plate}
                onClick={() => setWeight((w) => w + plate * 2)}
                className="px-2.5 py-1 rounded-lg bg-light-surface text-light-secondary text-xs font-medium hover:bg-cyan/10 hover:text-cyan transition-colors"
              >
                +{plate * 2}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-light-surface text-light-secondary font-medium hover:bg-light-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSelect(actualWeight)}
              className="flex-1 py-2.5 rounded-xl bg-cyan text-white font-medium hover:bg-cyan-dark transition-colors"
            >
              Use {actualWeight.toFixed(1)}kg
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
