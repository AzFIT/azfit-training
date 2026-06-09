import { useNavigate } from 'react-router-dom'
import { Zap, ArrowRight } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { PhaseTemplate } from '../../../types/program-builder-v2'

interface QuickStartStripProps {
  phases: PhaseTemplate[]
  className?: string
}

const METHOD_COLORS: Record<string, string> = {
  GBC: 'from-blue-500 to-blue-600',
  'Structural Balance': 'from-purple-500 to-purple-600',
  'Relative Strength': 'from-red-500 to-red-600',
  'Functional Hypertrophy': 'from-green-500 to-green-600',
  Hypertrophy: 'from-pink-500 to-pink-600',
  Metabolic: 'from-orange-500 to-orange-600',
  Maintenance: 'from-gray-500 to-gray-600',
}

export function QuickStartStrip({ phases, className }: QuickStartStripProps) {
  const navigate = useNavigate()

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-amber-500" />
        <h2 className="text-sm font-semibold text-[light-primary]">Quick Start</h2>
        <span className="text-xs text-muted-foreground">— Most used phases</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {phases.map((phase) => {
          const totalExercises = phase.sessions.reduce(
            (sum, s) => sum + s.exercises.length,
            0
          )
          const gradient = METHOD_COLORS[phase.method] || 'from-gray-500 to-gray-600'

          return (
            <button
              key={phase.phaseCode}
              onClick={() => navigate(`/program-builder/phase/${phase.phaseCode}`)}
              className={cn(
                'relative flex flex-col items-start min-w-[160px] max-w-[180px] p-3 rounded-xl',
                'bg-gradient-to-br text-white transition-all duration-200',
                'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5',
                'active:scale-[0.98]',
                gradient
              )}
            >
              <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">
                {phase.method}
              </span>
              <span className="text-sm font-bold leading-tight mt-1">
                {phase.phaseName.replace('Phase ', '').replace(/:.*$/, '')}
              </span>
              <span className="text-xs opacity-90 mt-0.5">
                {phase.durationWeeks}w · {phase.sessions.length}s · {totalExercises}ex
              </span>
              <ArrowRight
                size={14}
                className="absolute top-3 right-3 opacity-60"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
