import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pencil, Copy, Trash2, User, Archive } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { DisplayProgram } from './types'
import { getTemplateDef, getGoalBg } from './utils'
import { GOAL_OPTIONS } from './constants'

export function ProgramCard({
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
  const tmpl = getTemplateDef(program.template)
  const progressPct = Math.min(program.timesAssigned > 0 ? Math.round((program.activeClients / program.timesAssigned) * 100) : 0, 100)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      whileHover={{ y: -2 }}
      className="group relative rounded-xl border border-light-border bg-white overflow-hidden hover:border-light-muted transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Color banner */}
      <div className="h-1.5 w-full" style={{ background: program.colorBanner }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="text-light-primary font-semibold text-sm truncate">
              {program.name || 'Untitled Program'}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ backgroundColor: getGoalBg(program.goal), color: '#0F172A' }}
              >
                {goalLabel}
              </span>
              {tmpl && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: {
                      'text-violet': 'rgba(139,92,246,0.15)',
                      'text-orange': 'rgba(249,115,22,0.15)',
                      'text-danger': 'rgba(239,68,68,0.15)',
                      'text-cyan': 'rgba(0,174,239,0.15)',
                      'text-success': 'rgba(34,197,94,0.15)',
                      'text-warning': 'rgba(234,179,8,0.15)',
                      'text-light-muted': 'rgba(192,192,192,0.15)',
                    }[tmpl.color] || 'rgba(192,192,192,0.15)',
                    color: {
                      'text-violet': '#8B5CF6',
                      'text-orange': '#F97316',
                      'text-danger': '#EF4444',
                      'text-cyan': '#00AEEF',
                      'text-success': '#22C55E',
                      'text-warning': '#EAB308',
                      'text-light-muted': '#94A3B8',
                    }[tmpl.color] || '#94A3B8',
                  }}
                >
                  {tmpl.label}
                </span>
              )}
              {program.trainingMethod && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-light-surface text-light-muted font-medium">
                  {program.trainingMethod}
                </span>
              )}
              {program.isPublic && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-light-surface text-light-muted font-medium">
                  Built-in
                </span>
              )}
            </div>
          </div>
          {!program.isPublic && (
            <button
              onClick={() => onAction('delete', program)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-light-muted hover:text-danger hover:bg-danger-light transition-all"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-light-surface rounded-lg p-2 text-center border border-light-border">
            <div className="text-light-primary font-mono font-bold text-sm">{program.durationWeeks}w</div>
            <div className="text-light-muted text-[10px]">Duration</div>
          </div>
          <div className="bg-light-surface rounded-lg p-2 text-center border border-light-border">
            <div className="text-cyan font-mono font-bold text-sm">{program.daysPerWeek}<span className="text-light-muted text-[10px]">/wk</span></div>
            <div className="text-light-muted text-[10px]">Days</div>
          </div>
          <div className="bg-light-surface rounded-lg p-2 text-center border border-light-border">
            <div className="text-light-primary font-mono font-bold text-sm">{program.totalExercises}</div>
            <div className="text-light-muted text-[10px]">Exercises</div>
          </div>
          <div className="bg-light-surface rounded-lg p-2 text-center border border-light-border">
            <div className="text-light-primary font-mono font-bold text-sm">{program.totalSets}</div>
            <div className="text-light-muted text-[10px]">Sets</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-light-muted">Session Progress</span>
            <span className="text-light-secondary font-mono">{program.activeClients}/{program.timesAssigned} clients</span>
          </div>
          <div className="h-1.5 bg-light-surface rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPct, 100)}%`, background: program.colorBanner }}
            />
          </div>
        </div>

        {/* Phase pills */}
        {program.periodizationPhase && (
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-cyan/10 text-cyan">
              {program.periodizationPhase}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-light-border">
          <button
            onClick={() => window.location.hash = `/workout/live?program=${program.id}`}
            className="flex-1 h-8 text-xs font-semibold text-white hover:opacity-90 rounded-lg flex items-center justify-center gap-1 transition-opacity"
            style={{ background: program.colorBanner }}
          >
            <Play size={13} />
            {progressPct > 0 ? 'Resume Session' : 'Start Session'}
          </button>
          {!program.isPublic && (
            <>
              <button
                onClick={() => onAction('edit', program)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-light-border text-light-muted hover:text-cyan hover:border-cyan/30 transition-colors"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onAction('duplicate', program)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-light-border text-light-muted hover:text-violet hover:border-violet/30 transition-colors"
                title="Duplicate"
              >
                <Copy size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hover Overlay Actions */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="absolute inset-x-0 bottom-0 bg-[rgba(10,10,10,0.88)] backdrop-blur-sm border-t border-light-border p-4 flex items-center justify-center gap-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { icon: Pencil, label: 'Edit', action: 'edit', primary: false },
              { icon: Copy, label: 'Dup', action: 'duplicate', primary: false },
              { icon: User, label: 'Assign', action: 'assign', primary: true },
              { icon: Archive, label: 'Archive', action: 'archive', primary: false },
              { icon: Trash2, label: 'Del', action: 'delete', primary: false },
            ].map((btn, i) => (
              <motion.button
                key={btn.action}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onAction(btn.action, program)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                  btn.primary
                    ? 'bg-cyan text-white hover:bg-cyan-hover'
                    : 'text-light-secondary hover:text-light-primary hover:bg-light-hover'
                )}
              >
                <btn.icon size={16} />
                {btn.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
