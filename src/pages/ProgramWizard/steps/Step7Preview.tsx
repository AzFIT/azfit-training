import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar, Dumbbell, Target } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { DAYS_OF_WEEK } from '../constants'
import type { WizardState } from '../types'

interface Step7PreviewProps {
  state: WizardState
  onNameChange: (name: string) => void
  onDescChange: (desc: string) => void
}

export default function Step7Preview({ state, onNameChange, onDescChange }: Step7PreviewProps) {
  const [weekView, setWeekView] = useState(false)

  const activeDays = state.weeklySplit.filter(d => !d.isRest)
  const totalExercises = activeDays.reduce((s, d) => s + d.exercises.length, 0)
  const totalSets = activeDays.reduce((s, d) => s + d.exercises.reduce((es, ex) => es + ex.sets, 0), 0)
  const totalWeeks = state.phases.reduce((s, p) => s + p.durationWeeks, 0)
  const totalSessions = activeDays.length * totalWeeks

  const muscleDist = useMemo(() => {
    const dist: Record<string, number> = {}
    activeDays.forEach(d => d.exercises.forEach(ex => {
      const mg = ex.muscleGroup || 'Other'
      dist[mg] = (dist[mg] || 0) + ex.sets
    }))
    return Object.entries(dist).sort((a, b) => b[1] - a[1])
  }, [activeDays])

  const colors = ['cyan', 'violet', 'success', 'orange', 'trainer-accent', 'warning', 'silver']

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-dark-primary text-3xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Program Preview
        </h2>
      </div>

      {/* Program Name */}
      <div className="max-w-lg mx-auto mb-8">
        <label className="block text-dark-muted text-xs mb-2 font-semibold uppercase tracking-wider">Program Name</label>
        <input
          value={state.programName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Hypertrophy Phase 1"
          className="w-full bg-az-black-elevated border border-dark-border focus:border-cyan text-dark-primary text-lg px-4 py-3 rounded-xl outline-none transition-colors"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Duration', value: `${totalWeeks} weeks`, sub: `${state.phases.length} phases`, icon: Clock },
          { label: 'Frequency', value: `${activeDays.length} days/wk`, sub: `${DAYS_OF_WEEK.filter(d => activeDays.some(ad => ad.day === d)).length} day split`, icon: Calendar },
          { label: 'Total Exercises', value: `${totalExercises} unique`, sub: `${totalSets} sets/wk`, icon: Dumbbell },
          { label: 'Est. Session Time', value: '60-75 min', sub: `${totalSessions} total sessions`, icon: Target },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-az-black-card border border-dark-border rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} className="text-cyan" />
              <span className="text-dark-muted text-xs">{card.label}</span>
            </div>
            <p className="text-dark-primary text-xl font-semibold font-mono">{card.value}</p>
            <p className="text-dark-muted text-[10px] mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Schedule Preview */}
      <div className="bg-az-black-card border border-dark-border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-dark-primary font-semibold text-base">Weekly Schedule</h3>
          <button
            onClick={() => setWeekView(!weekView)}
            className="text-xs text-cyan hover:underline"
          >
            {weekView ? 'Show summary' : 'Show details'}
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {state.weeklySplit.map((day) => (
            <div
              key={day.day}
              className={cn(
                'rounded-lg p-2 min-h-[80px] border',
                day.isRest
                  ? 'bg-az-black border-dashed border-dark-divider'
                  : 'bg-az-black-elevated border-dark-border'
              )}
            >
              <p className={cn('text-[10px] font-semibold mb-1', day.isRest ? 'text-dark-muted' : 'text-cyan')}>
                {day.day.slice(0, 3)}
              </p>
              {!day.isRest && (
                <div>
                  <p className="text-dark-primary text-[10px] font-medium leading-tight truncate">{day.focus}</p>
                  {weekView && day.exercises.slice(0, 3).map((ex, i) => (
                    <p key={ex.id} className="text-dark-muted text-[9px] truncate mt-0.5">{i + 1}. {ex.name}</p>
                  ))}
                  {weekView && day.exercises.length > 3 && (
                    <p className="text-cyan text-[9px]">+{day.exercises.length - 3} more</p>
                  )}
                  {!weekView && <p className="text-dark-muted text-[9px]">{day.exercises.length} exercises</p>}
                </div>
              )}
              {day.isRest && <p className="text-dark-muted text-[9px]">Rest</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="bg-az-black-card border border-dark-border rounded-xl p-6 mb-8">
        <h3 className="text-dark-primary font-semibold text-base mb-4">Phase Timeline</h3>
        <div className="h-12 flex rounded-xl overflow-hidden">
          {state.phases.map((phase, i) => (
            <div
              key={phase.id}
              className="flex flex-col items-center justify-center text-white relative group cursor-default"
              style={{
                backgroundColor: colors[i % colors.length],
                width: `${(phase.durationWeeks / totalWeeks) * 100}%`,
              }}
            >
              <span className="text-xs font-bold">{phase.name}</span>
              <span className="text-[9px] opacity-75">{phase.durationWeeks}w</span>
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-az-black-elevated border border-dark-border rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap shadow-lg">
                <p className="text-dark-primary text-xs font-semibold">{phase.name}</p>
                <p className="text-dark-secondary text-[10px]">{phase.focus} — {phase.intensityMin}-{phase.intensityMax}% 1RM</p>
                <p className="text-dark-muted text-[10px]">{phase.repRange} reps — {phase.volume} volume</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Muscle Distribution */}
      {muscleDist.length > 0 && (
        <div className="bg-az-black-card border border-dark-border rounded-xl p-6 mb-8">
          <h3 className="text-dark-primary font-semibold text-base mb-4">Muscle Group Distribution</h3>
          <div className="flex flex-wrap gap-3">
            {muscleDist.map(([muscle, sets], i) => (
              <div
                key={muscle}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border"
                style={{
                  borderColor: colors[i % colors.length],
                  backgroundColor: `${colors[i % colors.length]}15`,
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                <span className="text-dark-primary font-medium">{muscle}</span>
                <span className="text-dark-muted font-mono">{sets}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="bg-az-black-card border border-dark-border rounded-xl p-6">
        <label className="block text-dark-muted text-xs mb-2 font-semibold uppercase tracking-wider">Notes / Description</label>
        <textarea
          value={state.description}
          onChange={(e) => onDescChange(e.target.value)}
          placeholder="Add any notes about this program..."
          rows={4}
          className="w-full bg-az-black-elevated border border-dark-border focus:border-cyan text-dark-primary text-sm placeholder:text-dark-muted px-4 py-3 rounded-xl outline-none resize-none transition-colors"
        />
      </div>
    </div>
  )
}
