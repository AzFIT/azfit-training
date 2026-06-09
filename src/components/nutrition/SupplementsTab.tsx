import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Pill, Check } from 'lucide-react'
import type { Supplement } from './types'

export default function SupplementsTab() {
  const [supplements, setSupplements] = useState<Supplement[]>([
    { id: '1', name: 'Whey Protein', dosage: '1 scoop (30g)', timing: 'Post-workout', frequency: 'Daily', taken: true },
    { id: '2', name: 'Creatine Monohydrate', dosage: '5g', timing: 'Morning', frequency: 'Daily', taken: true },
    { id: '3', name: 'BCAAs', dosage: '10g', timing: 'Pre-workout', frequency: 'Training days', taken: false },
    { id: '4', name: 'Omega-3 Fish Oil', dosage: '2 capsules (1000mg)', timing: 'With meals', frequency: 'Daily', taken: true },
    { id: '5', name: 'Multivitamin', dosage: '1 tablet', timing: 'Morning', frequency: 'Daily', taken: true },
    { id: '6', name: 'Vitamin D3', dosage: '2000 IU', timing: 'Morning', frequency: 'Daily', taken: false },
    { id: '7', name: 'Magnesium', dosage: '400mg', timing: 'Before bed', frequency: 'Daily', taken: false },
    { id: '8', name: 'Zinc', dosage: '15mg', timing: 'Morning', frequency: 'Daily', taken: true },
  ])

  const toggleTaken = (id: string) => {
    setSupplements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, taken: !s.taken } : s))
    )
  }

  const timingOrder = ['Morning', 'Pre-workout', 'Post-workout', 'With meals', 'Evening', 'Before bed']

  const supplementsByTiming = useMemo(() => {
    const groups: Record<string, Supplement[]> = {}
    supplements.forEach((s) => {
      if (!groups[s.timing]) groups[s.timing] = []
      groups[s.timing].push(s)
    })
    return timingOrder
      .filter((t) => groups[t]?.length > 0)
      .map((t) => ({ timing: t, items: groups[t] }))
  }, [supplements])

  const takenCount = supplements.filter((s) => s.taken).length

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between bg-[az-black-card] border border-dark-border rounded-xl p-4">
        <div>
          <p className="text-dark-primary font-semibold text-sm">Today&apos;s Supplements</p>
          <p className="text-dark-muted text-xs mt-0.5">
            {takenCount}/{supplements.length} taken
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-[az-black-elevated] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: takenCount === supplements.length ? 'success' : 'cyan',
              }}
              animate={{ width: `${(takenCount / supplements.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-dark-secondary text-xs font-mono">
            {Math.round((takenCount / supplements.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {supplementsByTiming.map(({ timing, items }) => (
          <div key={timing}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-cyan" />
              <h4 className="text-cyan text-xs font-semibold uppercase">{timing}</h4>
              <div className="flex-1 h-px bg-dark-border" />
            </div>

            <div className="space-y-2 ml-4">
              {items.map((supp) => (
                <motion.div
                  key={supp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center justify-between bg-[az-black-card] border rounded-xl p-4 transition-colors ${
                    supp.taken ? 'border-[rgba(34,197,94,0.3)]' : 'border-dark-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTaken(supp.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        supp.taken
                          ? 'bg-success border-success'
                          : 'border-dark-border hover:border-cyan'
                      }`}
                    >
                      {supp.taken && <Check size={14} className="text-white" />}
                    </button>
                    <div>
                      <p className={`text-sm font-medium ${supp.taken ? 'text-dark-muted line-through' : 'text-dark-primary'}`}>
                        {supp.name}
                      </p>
                      <p className="text-dark-muted text-xs">
                        {supp.dosage} · {supp.frequency}
                      </p>
                    </div>
                  </div>
                  <Pill size={16} className={supp.taken ? 'text-success' : 'text-dark-border'} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
