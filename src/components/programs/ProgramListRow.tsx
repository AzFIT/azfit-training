import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Copy, Trash2, User, Archive, Star } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { DisplayProgram } from './types'
import { getGoalBg } from './utils'
import { GOAL_OPTIONS } from './constants'
import { DifficultyBadge } from './DifficultyBadge'

export function ProgramListRow({
  program,
  index,
  onAction,
}: {
  program: DisplayProgram
  index: number
  onAction: (action: string, program: DisplayProgram) => void
}) {
  const [hovered, setHovered] = useState(false)
  const goalLabel = GOAL_OPTIONS.find((g: { value: string; label: string }) => program.goal.toLowerCase().includes(g.value))?.label || program.goal

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        'border-b border-light-border transition-colors duration-150',
        index % 2 === 0 ? 'bg-light-surface' : 'bg-white',
        hovered && 'bg-light-hover'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: program.colorBanner }} />
          <div>
            <p className="text-light-primary text-sm font-medium">{program.name}</p>
            {program.timesAssigned >= 15 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-warning font-semibold">
                <Star size={10} /> Most Used
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: getGoalBg(program.goal), color: '#0F172A' }}
        >
          {goalLabel}
        </span>
      </td>
      <td className="px-4 py-3.5 text-light-secondary text-xs">{program.method}</td>
      <td className="px-4 py-3.5">
        <DifficultyBadge difficulty={program.difficulty} />
      </td>
      <td className="px-4 py-3.5 text-light-secondary text-xs">{program.durationWeeks} wk</td>
      <td className="px-4 py-3.5 text-light-secondary text-xs">{program.daysPerWeek}x/wk</td>
      <td className="px-4 py-3.5 text-light-secondary text-xs">{program.timesAssigned}x</td>
      <td className="px-4 py-3.5 text-light-muted text-xs">{program.lastAssigned}</td>
      <td className="px-4 py-3.5">
        <div className={cn('flex items-center gap-1 transition-opacity', hovered ? 'opacity-100' : 'opacity-40')}>
          {[
            { icon: Pencil, action: 'edit' },
            { icon: Copy, action: 'duplicate' },
            { icon: User, action: 'assign' },
            { icon: Archive, action: 'archive' },
            { icon: Trash2, action: 'delete' },
          ].map((btn) => (
            <button
              key={btn.action}
              onClick={() => onAction(btn.action, program)}
              className="text-light-secondary hover:text-light-primary p-1.5 rounded hover:bg-light-hover transition-colors"
              aria-label={btn.action}
            >
              <btn.icon size={14} />
            </button>
          ))}
        </div>
      </td>
    </motion.tr>
  )
}
