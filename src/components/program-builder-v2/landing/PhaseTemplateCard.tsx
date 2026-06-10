import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, ArrowRight } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Button } from '../../../components/ui/button'
import type { PhaseTemplate } from '../../../types/program-builder-v2'
import { MotionCategoryBadge } from '../shared/MotionCategoryBadge'
import { PhaseStatPill } from '../shared/PhaseStatPill'

interface PhaseTemplateCardProps {
  phase: PhaseTemplate
  className?: string
}

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  intermediate: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
  advanced: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800',
}

const METHOD_COLORS: Record<string, string> = {
  GBC: 'bg-blue-500',
  'Structural Balance': 'bg-purple-500',
  'Relative Strength': 'bg-red-500',
  'Functional Hypertrophy': 'bg-green-500',
  Hypertrophy: 'bg-pink-500',
  Metabolic: 'bg-orange-500',
  Maintenance: 'bg-gray-500',
}

export function PhaseTemplateCard({ phase, className }: PhaseTemplateCardProps) {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  const totalExercises = phase.sessions.reduce(
    (sum, s) => sum + s.exercises.length,
    0
  )

  const totalSets = phase.sessions.reduce(
    (sum, s) => sum + s.exercises.reduce((es, ex) => es + ex.sets, 0),
    0
  )

  const handleSelect = () => {
    navigate(`/program-builder/phase/${phase.phaseCode}`)
  }

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Preview modal would open here — for now, navigate to configurator
    navigate(`/program-builder/phase/${phase.phaseCode}`)
  }

  // Collect unique motion categories
  const motionCategories = Array.from(
    new Set(
      phase.sessions.flatMap((s) =>
        s.exercises.map((e) => e.motionCategory).filter((c): c is string => !!c)
      )
    )
  ).slice(0, 4)

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border bg-card transition-all duration-200',
        'hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5',
        'cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
    >
      {/* Method color strip */}
      <div
        className={cn(
          'h-1.5 w-full rounded-t-xl',
          METHOD_COLORS[phase.method] || 'bg-gray-400'
        )}
      />

      <div className="flex flex-col flex-1 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-tight text-white truncate">
              {phase.phaseName}
            </h3>
            <p className="text-xs text-gray-300 mt-0.5">{phase.method}</p>
          </div>
          <span
            className={cn(
              'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium border',
              DIFFICULTY_COLORS[phase.difficulty || 'intermediate']
            )}
          >
            {phase.difficulty || 'intermediate'}
          </span>
        </div>

        {/* Focus area */}
        <p className="text-xs text-gray-300 mb-3 line-clamp-2">
          {phase.focusArea}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
          <PhaseStatPill icon="duration" value={`${phase.durationWeeks} weeks`} />
          <PhaseStatPill icon="sessions" value={`${phase.sessions.length} sessions`} />
          <PhaseStatPill icon="exercises" value={`${totalExercises} ex / ${totalSets} sets`} />
        </div>

        {/* Motion categories */}
        <div className="flex flex-wrap gap-1 mt-auto mb-3">
          {motionCategories.map((cat) => (
            <MotionCategoryBadge key={cat} category={cat} />
          ))}
          {motionCategories.length === 4 && (
            <span className="text-[10px] text-gray-300 self-center">+more</span>
          )}
        </div>

        {/* Actions */}
        <div
          className={cn(
            'flex gap-2 transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'
          )}
        >
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={handlePreview}
          >
            <Eye size={13} className="mr-1" />
            Preview
          </Button>
          <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleSelect}>
            Select
            <ArrowRight size={13} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
