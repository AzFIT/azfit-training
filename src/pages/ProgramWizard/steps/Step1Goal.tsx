import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { GOAL_CARDS } from '../constants'

interface Step1GoalProps {
  selectedGoal: string
  onSelect: (goal: string) => void
}

export default function Step1Goal({ selectedGoal, onSelect }: Step1GoalProps) {
  return (
    <div className="max-w-[900px] mx-auto">
      <div className="text-center mb-10">
        <h2
          className="text-dark-primary text-3xl md:text-4xl font-semibold mb-3 tracking-tight"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          What&apos;s the primary goal?
        </h2>
        <p className="text-dark-secondary text-sm md:text-base">
          This determines exercise selection, volume, and progression strategy.
        </p>
      </div>

      {/* Quick select */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className="text-dark-muted text-sm">Quick select:</span>
        <select
          value={selectedGoal}
          onChange={(e) => onSelect(e.target.value)}
          className="bg-[#1A1A1A] border border-dark-border text-dark-primary text-sm px-4 py-2 rounded-lg focus:border-cyan outline-none"
        >
          <option value="">Choose a goal...</option>
          {GOAL_CARDS.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {GOAL_CARDS.map((goal, i) => {
          const Icon = goal.icon
          const selected = selectedGoal === goal.id
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              onClick={() => onSelect(goal.id)}
              className={cn(
                'relative text-left bg-[#141414] border-2 rounded-2xl p-8 min-h-[180px] transition-all duration-200',
                selected
                  ? 'border-cyan bg-[rgba(0,174,239,0.08)] shadow-[0_0_20px_rgba(0,174,239,0.15)]'
                  : 'border-dark-border hover:border-[rgba(0,174,239,0.3)] hover:-translate-y-0.5'
              )}
            >
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-cyan rounded-full flex items-center justify-center"
                >
                  <Check size={14} className="text-white" />
                </motion.div>
              )}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: `${goal.gradient}20` }}
              >
                <Icon size={28} style={{ color: goal.gradient.includes('8B5CF6') ? '#8B5CF6' : goal.gradient.includes('F97316') ? '#F97316' : goal.gradient.includes('00AEEF') ? '#00AEEF' : goal.gradient.includes('22C55E') ? '#22C55E' : goal.gradient.includes('EAB308') ? '#EAB308' : '#C0C0C0' }} />
              </div>
              <h3 className="text-dark-primary font-semibold text-lg mb-1">{goal.label}</h3>
              <p className="text-dark-secondary text-xs mb-3">{goal.description}</p>
              <div className="flex flex-wrap gap-1">
                {goal.methods.slice(0, 3).map((m) => (
                  <span key={m} className="text-[10px] text-dark-muted bg-[#1A1A1A] px-2 py-0.5 rounded-full">{m}</span>
                ))}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
