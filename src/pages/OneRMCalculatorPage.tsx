import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, RotateCcw } from 'lucide-react'
import { cn } from '../lib/utils'
import { calculateAllOneRMs, getAverageOneRM, type OneRMFormula } from '../utils/oneRmCalculator'

const FORMULA_LABELS: Record<OneRMFormula, string> = {
  epley: 'Epley',
  brzycki: 'Brzycki',
  lombardi: 'Lombardi',
  mayhew: 'Mayhew',
}

export default function OneRMCalculatorPage() {
  const [weight, setWeight] = useState<string>('')
  const [reps, setReps] = useState<string>('')

  const w = parseFloat(weight) || 0
  const r = parseInt(reps) || 0

  const results = useMemo(() => {
    if (w <= 0 || r <= 0) return null
    return calculateAllOneRMs(w, r)
  }, [w, r])

  const averageOneRM = useMemo(() => {
    if (w <= 0 || r <= 0) return 0
    return getAverageOneRM(w, r)
  }, [w, r])

  const reset = () => {
    setWeight('')
    setReps('')
  }

  return (
    <div className="min-h-[100dvh] bg-[off-white] dark:bg-[az-black]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Calculator size={28} className="text-[cyan]" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              1RM Calculator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Estimate your one-rep max from any weight × reps
            </p>
          </div>
        </div>

        {/* Input card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Weight Lifted
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0"
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700',
                    'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-lg font-semibold',
                    'focus:outline-none focus:border-[cyan] transition-colors'
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  kg
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Reps Performed
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="0"
                min={1}
                max={20}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700',
                  'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-lg font-semibold',
                  'focus:outline-none focus:border-[cyan] transition-colors'
                )}
              />
            </div>
          </div>

          <button
            onClick={reset}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {/* Results */}
        {results && averageOneRM > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Average 1RM highlight */}
            <div className="bg-gradient-to-r from-[cyan] to-[indigo] rounded-2xl p-6 text-white text-center">
              <p className="text-sm opacity-90">Estimated 1RM (Average)</p>
              <p className="text-5xl font-bold mt-1">{averageOneRM}</p>
              <p className="text-sm opacity-90">kg</p>
            </div>

            {/* Formula breakdown */}
            <div className="grid grid-cols-2 gap-3">
              {results.map((result) => (
                <div
                  key={result.formula}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                    {result.formulaName}
                  </p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                    {result.oneRM} <span className="text-sm font-normal text-slate-400">kg</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Percentage table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  Working Percentages
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Based on {FORMULA_LABELS.epley} estimate ({results[0].oneRM} kg)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                      <th className="text-left py-2 px-4 font-medium">%</th>
                      <th className="text-left py-2 px-4 font-medium">Weight</th>
                      <th className="text-left py-2 px-4 font-medium hidden sm:table-cell">Typical Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results[0].percentages.map((p) => (
                      <tr
                        key={p.percent}
                        className="border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {p.percent}%
                        </td>
                        <td className="py-2.5 px-4 font-bold text-[cyan]">
                          {p.weight} kg
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                          {getTypicalUse(p.percent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function getTypicalUse(percent: number): string {
  if (percent <= 55) return 'Warm-up / Technique'
  if (percent <= 65) return 'Hypertrophy (high reps)'
  if (percent <= 75) return 'Strength (moderate reps)'
  if (percent <= 85) return 'Strength (low reps)'
  if (percent <= 95) return 'Peak strength / singles'
  return 'Max attempt'
}
