import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, Clock, Calendar, BarChart3 } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { GOAL_CARDS } from '../constants'
import { normalizeGoal, goalMatches } from '../helpers'
import type { TrainingMethod } from '../types'

interface Step2MethodProps {
  methods: TrainingMethod[]
  selectedGoal: string
  selectedMethod: TrainingMethod | null
  onSelect: (method: TrainingMethod) => void
}

export default function Step2Method({ methods, selectedGoal, selectedMethod, onSelect }: Step2MethodProps) {
  const [filterExp, setFilterExp] = useState('')
  const [filterEquip, setFilterEquip] = useState('')
  const [sortMode, setSortMode] = useState<'match' | 'popular' | 'newest'>('match')

  const filtered = useMemo(() => {
    let result = methods.filter((m) => goalMatches(selectedGoal, m.Goal))
    if (filterExp) {
      result = result.filter((m) => m.TargetAudience.toLowerCase().includes(filterExp.toLowerCase()))
    }
    if (filterEquip) {
      result = result.filter((m) => m.Equipment.toLowerCase().includes(filterEquip.toLowerCase()))
    }

    if (sortMode === 'match') {
      // Already filtered by goal match
    } else if (sortMode === 'popular') {
      result = [...result].sort((a, b) => a.Name.localeCompare(b.Name))
    }

    return result
  }, [methods, selectedGoal, filterExp, filterEquip, sortMode])

  const bestMatch = filtered[0]

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-dark-primary text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Choose a training method
        </h2>
        <p className="text-dark-secondary text-sm">
          Based on {GOAL_CARDS.find(g => g.id === selectedGoal)?.label || 'your'} goal — {filtered.length} methods available
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <button
          onClick={() => setSortMode('match')}
          className={cn('text-xs px-3 py-1.5 rounded-full border transition-colors', sortMode === 'match' ? 'border-cyan bg-[rgba(0,174,239,0.1)] text-cyan' : 'border-dark-border text-dark-secondary hover:border-dark-subtle')}
        >
          Recommended
        </button>
        <button
          onClick={() => setSortMode('popular')}
          className={cn('text-xs px-3 py-1.5 rounded-full border transition-colors', sortMode === 'popular' ? 'border-cyan bg-[rgba(0,174,239,0.1)] text-cyan' : 'border-dark-border text-dark-secondary hover:border-dark-subtle')}
        >
          A-Z
        </button>
        <div className="w-px h-4 bg-dark-border mx-1" />
        <select
          value={filterExp}
          onChange={(e) => setFilterExp(e.target.value)}
          className="bg-[#1A1A1A] border border-dark-border text-dark-secondary text-xs px-3 py-1.5 rounded-full outline-none focus:border-cyan"
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <select
          value={filterEquip}
          onChange={(e) => setFilterEquip(e.target.value)}
          className="bg-[#1A1A1A] border border-dark-border text-dark-secondary text-xs px-3 py-1.5 rounded-full outline-none focus:border-cyan"
        >
          <option value="">All Equipment</option>
          <option value="Barbell">Barbell</option>
          <option value="Dumbbell">Dumbbell</option>
          <option value="Bodyweight">Bodyweight</option>
          <option value="Machine">Machine</option>
        </select>
      </div>

      {/* Method Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((method, i) => {
          const selected = selectedMethod?.Name === method.Name
          const isBest = sortMode === 'match' && bestMatch?.Name === method.Name
          const goalNorm = normalizeGoal(method.Goal)

          return (
            <motion.button
              key={method.Name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.5), ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              onClick={() => onSelect(method)}
              className={cn(
                'relative text-left bg-[#141414] border rounded-xl p-6 transition-all duration-200 w-full',
                selected
                  ? 'border-cyan bg-[rgba(0,174,239,0.05)] shadow-[0_0_16px_rgba(0,174,239,0.1)]'
                  : 'border-dark-border hover:border-[rgba(0,174,239,0.3)]'
              )}
            >
              {isBest && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00AEEF] to-[#8B5CF6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                  <Star size={10} />
                  Best Match
                </div>
              )}
              {selected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-cyan rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-dark-primary font-semibold text-base mb-1">{method.Name}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: goalNorm === 'muscle' ? 'rgba(139,92,246,0.15)' : goalNorm === 'fat-loss' ? 'rgba(34,197,94,0.15)' : goalNorm === 'strength' ? 'rgba(0,174,239,0.15)' : 'rgba(192,192,192,0.15)', color: '#F0F0F0' }}
                    >
                      {method.Goal}
                    </span>
                    <span className="text-[10px] text-dark-muted bg-[#1A1A1A] px-2 py-0.5 rounded-full">{method.Category}</span>
                  </div>
                  <p className="text-dark-secondary text-xs leading-relaxed mb-3 line-clamp-2">{method.Structure}</p>
                  <div className="flex flex-wrap gap-1">
                    {method.Equipment.split(',').slice(0, 3).map((eq) => (
                      <span key={eq} className="text-[10px] text-dark-muted border border-dark-border px-1.5 py-0.5 rounded">{eq.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 space-y-2 text-right">
                  <div className="flex items-center gap-1.5 text-dark-secondary justify-end">
                    <Clock size={12} />
                    <span className="text-xs font-medium">{method.Duration} wk</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-dark-secondary justify-end">
                    <Calendar size={12} />
                    <span className="text-xs font-medium">{method.Frequency}x/wk</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-dark-secondary justify-end">
                    <BarChart3 size={12} />
                    <span className="text-xs font-medium">{method.TargetAudience}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
