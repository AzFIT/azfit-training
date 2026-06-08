import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Play,
  Pencil,
  Copy,
  Trash2,
  Plus,
  Search,
  SlidersHorizontal,
  Zap,
  Layers,
  Flame,
  Columns,
  Circle,
  Settings,
  Trophy,
  User,
  X,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Archive,
  FolderOpen,
  Grid3X3,
  List,
  ChevronDown,
  Star,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useAppDataStore } from '../stores/useAppDataStore'
import type { Program as EntityProgram } from '../types/entities'

// ── Types ──────────────────────────────────────────────
interface DisplayProgram {
  id: string
  name: string
  goal: string
  method: string
  category: string
  difficulty: string
  durationWeeks: number
  daysPerWeek: number
  totalExercises: number
  totalSets: number
  equipment: string
  structure: string
  timesAssigned: number
  activeClients: number
  lastAssigned: string
  archived: boolean
  createdAt: string
  colorBanner: string
  periodizationPhase?: string
  template?: string
  trainingMethod?: string
  isPublic?: boolean
  authorName?: string
}

function toDisplayProgram(p: EntityProgram): DisplayProgram {
  const goalMap: Record<string, string> = {
    'lose-fat': 'Lose Fat',
    'build-muscle': 'Build Muscle',
    'strength': 'Strength',
    'endurance': 'Endurance',
    'maintenance': 'General Fitness',
  }
  const methodMap: Record<string, string> = {
    'Upper/Lower': 'Upper/Lower',
    'Push/Pull/Legs': 'Push/Pull/Legs',
    'Full Body': 'Full Body',
    'Bro Split': 'Bro Split',
  }
  const diffMap: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    elite: 'Elite',
  }
  const goalKey = normalizeGoal(p.goal)
  const goalColor = GOAL_COLOR_MAP[goalKey] || GOAL_COLOR_MAP['general']
  const daysAgo = p.lastAssigned
    ? Math.floor((Date.now() - new Date(p.lastAssigned).getTime()) / 86400000)
    : 30

  // Derive template from tags or training split
  const template = deriveTemplate(p)

  return {
    id: p.id,
    name: p.name,
    goal: goalMap[p.goal] || p.goal,
    method: methodMap[p.trainingSplit || ''] || p.trainingSplit || 'Other',
    category: p.categoryName || p.goal,
    difficulty: diffMap[p.difficulty] || p.difficulty,
    durationWeeks: p.durationWeeks,
    daysPerWeek: p.daysPerWeek,
    totalExercises: p.totalExercises || 0,
    totalSets: p.totalWorkouts || p.durationWeeks * p.daysPerWeek * 4,
    equipment: p.tags?.join(', ') || 'Various',
    structure: p.trainingSplit || 'Full Body',
    timesAssigned: p.timesUsed,
    activeClients: Math.floor(p.timesUsed * 0.4),
    lastAssigned: daysAgo <= 1 ? '1 day ago' : `${daysAgo} days ago`,
    archived: !p.isActive,
    createdAt: p.createdAt,
    colorBanner: goalColor,
    periodizationPhase: p.periodizationPhase,
    template,
    trainingMethod: p.trainingSplit,
    isPublic: p.isPublic,
    authorName: p.authorName,
  }
}

function deriveTemplate(p: EntityProgram): string {
  const tags = (p.tags || []).map(t => t.toLowerCase())
  const name = p.name.toLowerCase()
  const split = (p.trainingSplit || '').toLowerCase()
  if (tags.includes('gvt') || name.includes('gvt') || name.includes('german volume')) return 'GVT'
  if (tags.includes('gbc') || name.includes('gbc') || name.includes('german body')) return 'GBC'
  if (tags.includes('hiit') || name.includes('hiit')) return 'HIIT'
  if (split.includes('push') || split.includes('pull') || tags.includes('ppl')) return 'PPL'
  if (split.includes('full body') || tags.includes('full body')) return 'Full Body'
  if (tags.includes('strength') || name.includes('strength') || name.includes('power')) return 'Strength'
  return 'Custom'
}

// ── Template Definitions ────────────────────────────────────────
interface TemplateDef {
  key: string
  label: string
  icon: React.ReactNode
  color: string
  bg: string
  border: string
  gradient: string
  focus: string
  description: string
}

const TEMPLATES: TemplateDef[] = [
  {
    key: 'GVT',
    label: 'GVT',
    icon: <Layers size={20} />,
    color: 'text-violet',
    bg: 'bg-violet/10',
    border: 'border-violet/30',
    gradient: 'from-violet to-violet-light',
    focus: 'Hypertrophy',
    description: '10×10 high-volume German Volume Training',
  },
  {
    key: 'GBC',
    label: 'GBC',
    icon: <Flame size={20} />,
    color: 'text-orange',
    bg: 'bg-orange/10',
    border: 'border-orange/30',
    gradient: 'from-orange to-orange-light',
    focus: 'Fat Loss',
    description: 'Superset-driven German Body Composition',
  },
  {
    key: 'HIIT',
    label: 'HIIT',
    icon: <Zap size={20} />,
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    gradient: 'from-danger to-rose',
    focus: 'Conditioning',
    description: 'High-intensity interval metabolic training',
  },
  {
    key: 'PPL',
    label: 'PPL',
    icon: <Columns size={20} />,
    color: 'text-cyan',
    bg: 'bg-cyan/10',
    border: 'border-cyan/30',
    gradient: 'from-cyan to-cyan-light',
    focus: 'Hypertrophy',
    description: 'Push Pull Legs — 3 to 6 day split',
  },
  {
    key: 'Full Body',
    label: 'Full Body',
    icon: <Circle size={20} />,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    gradient: 'from-success to-emerald-light',
    focus: 'Strength',
    description: 'Complete body training every session',
  },
  {
    key: 'Strength',
    label: 'Strength',
    icon: <Trophy size={20} />,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    gradient: 'from-warning to-amber-light',
    focus: 'Power',
    description: 'Low-rep, high-load powerlifting style',
  },
  {
    key: 'Custom',
    label: 'Custom',
    icon: <Settings size={20} />,
    color: 'text-light-muted',
    bg: 'bg-light-surface',
    border: 'border-light-border',
    gradient: 'from-silver to-silver-dark',
    focus: 'Flexible',
    description: 'User-defined template — any configuration',
  },
]

const TEMPLATE_KEYS = TEMPLATES.map(t => t.key)

function getTemplateDef(key?: string): TemplateDef | undefined {
  return TEMPLATES.find(t => t.key === key) || TEMPLATES.find(t => t.key === 'Custom')
}

// ── Goal Colors ─────────────────────────────────────────────────
const GOAL_COLOR_MAP: Record<string, string> = {
  'fat loss': 'linear-gradient(135deg, #22C55E, #16A34A)',
  'lose fat': 'linear-gradient(135deg, #22C55E, #16A34A)',
  'weight loss': 'linear-gradient(135deg, #22C55E, #16A34A)',
  'muscle': 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  'hypertrophy': 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  'build muscle': 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  'strength': 'linear-gradient(135deg, #00AEEF, #0077B6)',
  'endurance': 'linear-gradient(135deg, #F97316, #EA580C)',
  'rehab': 'linear-gradient(135deg, #EAB308, #CA8A04)',
  'rehabilitation': 'linear-gradient(135deg, #EAB308, #CA8A04)',
  'general': 'linear-gradient(135deg, #C0C0C0, #9A9A9A)',
  'athletic': 'linear-gradient(135deg, #EC4899, #DB2777)',
}

const GOAL_BG_MAP: Record<string, string> = {
  'fat loss': 'rgba(34,197,94,0.15)',
  'lose fat': 'rgba(34,197,94,0.15)',
  'weight loss': 'rgba(34,197,94,0.15)',
  'muscle': 'rgba(139,92,246,0.15)',
  'hypertrophy': 'rgba(139,92,246,0.15)',
  'build muscle': 'rgba(139,92,246,0.15)',
  'strength': 'rgba(0,174,239,0.15)',
  'endurance': 'rgba(249,115,22,0.15)',
  'rehab': 'rgba(234,179,8,0.15)',
  'rehabilitation': 'rgba(234,179,8,0.15)',
  'general': 'rgba(192,192,192,0.15)',
  'athletic': 'rgba(236,72,153,0.15)',
}

const GOAL_OPTIONS = [
  { label: 'Lose Fat', value: 'fat loss' },
  { label: 'Build Muscle', value: 'muscle' },
  { label: 'Strength', value: 'strength' },
  { label: 'Endurance', value: 'endurance' },
  { label: 'Rehabilitation', value: 'rehab' },
  { label: 'General Fitness', value: 'general' },
]

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Elite']

const DIFFICULTY_COLOR: Record<string, { text: string; bg: string }> = {
  Beginner: { text: 'text-success', bg: 'rgba(34,197,94,0.15)' },
  Intermediate: { text: 'text-warning', bg: 'rgba(234,179,8,0.15)' },
  Advanced: { text: 'text-orange', bg: 'rgba(249,115,22,0.15)' },
  Elite: { text: 'text-danger', bg: 'rgba(239,68,68,0.15)' },
}

// ── Helpers ────────────────────────────────────────────
function normalizeGoal(goal: string): string {
  const g = goal.toLowerCase()
  if (g.includes('fat') || g.includes('loss')) return 'fat loss'
  if (g.includes('muscle') || g.includes('hypertrophy')) return 'muscle'
  if (g.includes('strength')) return 'strength'
  if (g.includes('endurance')) return 'endurance'
  if (g.includes('rehab')) return 'rehab'
  if (g.includes('athletic')) return 'athletic'
  return 'general'
}

function getGoalBg(goal: string): string {
  return GOAL_BG_MAP[normalizeGoal(goal)] || GOAL_BG_MAP['general']
}

function getDifficultyColor(diff: string) {
  return DIFFICULTY_COLOR[diff] || DIFFICULTY_COLOR['Intermediate']
}

function toDisplayPrograms(programs: Record<string, EntityProgram>): DisplayProgram[] {
  return Object.values(programs).map(toDisplayProgram)
}

// ── Components ─────────────────────────────────────────

/** Difficulty Badge */
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const diffColor = getDifficultyColor(difficulty)
  const colorMap: Record<string, string> = {
    'text-success': '#22C55E',
    'text-warning': '#EAB308',
    'text-orange': '#F97316',
    'text-danger': '#EF4444',
  }
  const color = colorMap[diffColor.text] || '#64748B'
  return <span className="text-xs font-semibold" style={{ color }}>{difficulty}</span>
}

/** Stat Card */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="flex items-center gap-3"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-light-primary font-semibold text-lg leading-tight truncate font-mono">
          {value}
        </p>
        <p className="text-light-muted text-xs truncate">{label}</p>
      </div>
    </motion.div>
  )
}

/** Template Feature Card */
function TemplateFeatureCard({
  template,
  isActive,
  onClick,
  count,
}: {
  template: TemplateDef
  isActive: boolean
  onClick: () => void
  count: number
}) {
  const colorHex = {
    'text-violet': '#8B5CF6',
    'text-orange': '#F97316',
    'text-danger': '#EF4444',
    'text-cyan': '#00AEEF',
    'text-success': '#22C55E',
    'text-warning': '#EAB308',
    'text-light-muted': '#94A3B8',
  }[template.color] || '#94A3B8'

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative flex-shrink-0 w-[180px] rounded-xl border p-4 text-left transition-all',
        isActive
          ? `${template.bg} ${template.border} ring-1 ring-[${colorHex}]/40`
          : 'bg-white border-light-border hover:border-light-muted'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${colorHex}20`, color: colorHex }}
        >
          {template.icon}
        </div>
        <span className="text-light-primary font-semibold text-sm">{template.label}</span>
      </div>
      <p className="text-light-muted text-[11px] leading-relaxed mb-2">{template.description}</p>
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
        >
          {template.focus}
        </span>
        <span className="text-light-muted text-[10px] font-mono">{count} programs</span>
      </div>
      {isActive && (
        <div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: colorHex }}
        />
      )}
    </motion.button>
  )
}

/** Program Card (redesigned to match portal) */
function ProgramCard({
  program,
  index,
  onAction,
}: {
  program: DisplayProgram
  index: number
  onAction: (action: string, program: DisplayProgram) => void
}) {
  const [hovered, setHovered] = useState(false)
  const goalLabel = GOAL_OPTIONS.find(g => program.goal.toLowerCase().includes(g.value))?.label || program.goal
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

/** Program List Row */
function ProgramListRow({
  program,
  index,
  onAction,
}: {
  program: DisplayProgram
  index: number
  onAction: (action: string, program: DisplayProgram) => void
}) {
  const [hovered, setHovered] = useState(false)
  const goalLabel = GOAL_OPTIONS.find(g => program.goal.toLowerCase().includes(g.value))?.label || program.goal

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

/** Pagination */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const pages: (number | string)[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-light-secondary hover:text-light-primary hover:bg-light-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronDown size={16} className="rotate-90" />
      </button>
      {pages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`dots-${i}`} className="text-light-muted px-1">{p}</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
              p === currentPage
                ? 'bg-cyan text-white'
                : 'text-light-secondary hover:text-light-primary hover:bg-light-hover'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-light-secondary hover:text-light-primary hover:bg-light-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronDown size={16} className="-rotate-90" />
      </button>
    </div>
  )
}

/** Empty State */
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan/20 to-violet/10 flex items-center justify-center mb-4 border border-cyan/20">
        <Dumbbell size={28} className="text-cyan" />
      </div>
      <h3 className="text-light-primary font-semibold text-lg mb-1">No Active Programs</h3>
      <p className="text-light-muted text-sm max-w-sm mb-6">
        Create your first program using the All-in-One Program Creator and assign it to a client.
      </p>
      <button
        onClick={onCreate}
        className="bg-gradient-to-r from-cyan to-violet text-white font-semibold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <Zap size={16} />
        Create New Program
      </button>
    </motion.div>
  )
}

// ── Main Page ──────────────────────────────────────────
export default function ProgramsPage() {
  const navigate = useNavigate()
  const { programs: entityPrograms, programIds, deleteProgram, seedDemoData } = useAppDataStore()
  const [programs, setPrograms] = useState<DisplayProgram[]>([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [templateFilter, setTemplateFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Sort & view
  const [sortBy, setSortBy] = useState<'mostUsed' | 'newest' | 'alpha'>('mostUsed')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // Seed demo data if empty, then load from store
  useEffect(() => {
    if (programIds.length === 0) {
      seedDemoData()
    }
    const progs = toDisplayPrograms(entityPrograms)
    setPrograms(progs)
    setLoading(false)
  }, [entityPrograms, programIds, seedDemoData])

  // Derive filter options from data
  const methodOptions = useMemo(() => {
    const methods = new Set<string>()
    programs.forEach((p) => methods.add(p.method))
    return Array.from(methods).sort()
  }, [programs])

  // Stats
  const stats = useMemo(() => {
    const total = programs.length
    const active = programs.filter(p => !p.archived).length
    const archived = programs.filter(p => p.archived).length
    const mostUsed = programs.reduce((a, b) => (a.timesAssigned > b.timesAssigned ? a : b), programs[0])
    return { total, active, archived, mostUsedName: mostUsed?.name || '—' }
  }, [programs])

  // Template counts
  const templateCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    TEMPLATE_KEYS.forEach(k => counts[k] = 0)
    programs.forEach(p => {
      const t = p.template || 'Custom'
      counts[t] = (counts[t] || 0) + 1
    })
    return counts
  }, [programs])

  // Filtered & sorted programs
  const filtered = useMemo(() => {
    let result = programs

    // Archive filter
    if (!showArchived) {
      result = result.filter(p => !p.archived)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.goal.toLowerCase().includes(q) ||
        p.method.toLowerCase().includes(q) ||
        p.equipment.toLowerCase().includes(q) ||
        (p.template || '').toLowerCase().includes(q)
      )
    }

    // Goal filter
    if (selectedGoals.length > 0) {
      result = result.filter(p => {
        const pg = normalizeGoal(p.goal)
        return selectedGoals.some(sg => pg.includes(sg))
      })
    }

    // Method filter
    if (selectedMethod) {
      result = result.filter(p => p.method === selectedMethod)
    }

    // Difficulty filter
    if (selectedDifficulties.length > 0) {
      result = result.filter(p => selectedDifficulties.includes(p.difficulty))
    }

    // Template filter
    if (templateFilter) {
      result = result.filter(p => (p.template || 'Custom') === templateFilter)
    }

    // Sort
    switch (sortBy) {
      case 'mostUsed':
        result = [...result].sort((a, b) => b.timesAssigned - a.timesAssigned)
        break
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'alpha':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [programs, searchQuery, selectedGoals, selectedMethod, selectedDifficulties, showArchived, templateFilter, sortBy])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1) }, [searchQuery, selectedGoals, selectedMethod, selectedDifficulties, showArchived, templateFilter, sortBy])

  // Actions
  const handleAction = useCallback((action: string, program: DisplayProgram) => {
    switch (action) {
      case 'start':
        navigate(`/workout?program=${program.id}`)
        break
      case 'edit':
        navigate(`/program-builder`)
        break
      case 'duplicate':
        alert(`Duplicated: ${program.name} (Copy)`)
        break
      case 'assign':
        alert(`Assign "${program.name}" to client`)
        break
      case 'archive':
        setPrograms(prev => prev.map(p => p.id === program.id ? { ...p, archived: !p.archived } : p))
        break
      case 'delete':
        if (confirm(`Delete "${program.name}"? This cannot be undone.`)) {
          deleteProgram(program.id)
        }
        break
    }
  }, [navigate, deleteProgram])

  // Active filter count
  const activeFilterCount = selectedGoals.length + (selectedMethod ? 1 : 0) + selectedDifficulties.length + (showArchived ? 1 : 0) + (templateFilter ? 1 : 0)

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGoals([])
    setSelectedMethod('')
    setSelectedDifficulties([])
    setShowArchived(false)
    setTemplateFilter(null)
  }

  // Toggle helpers
  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal])
  }
  const toggleDifficulty = (diff: string) => {
    setSelectedDifficulties(prev => prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="max-w-[1440px] mx-auto bg-light-surface min-h-[calc(100dvh-64px)]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-light-primary text-xl font-semibold flex items-center gap-2">
            <Dumbbell size={22} className="text-cyan" />
            Active Programs
          </h1>
          <p className="text-light-muted text-sm mt-0.5">
            {programs.filter(p => !p.archived).length} active program{programs.filter(p => !p.archived).length !== 1 ? 's' : ''}
            {stats.archived > 0 && ` · ${stats.archived} archived`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/programs/match')}
            className="bg-gradient-to-r from-success to-cyan text-white font-semibold text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Sparkles size={16} />
            Smart Match
          </button>
          <button
            onClick={() => navigate('/programs/new')}
            className="bg-gradient-to-r from-cyan to-violet text-white font-semibold text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            New Program
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border border-light-border rounded-xl px-6 py-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FolderOpen} label="Total Programs" value={String(stats.total)} color="#0F172A" delay={0} />
          <StatCard icon={CheckCircle} label="Active" value={String(stats.active)} color="#22C55E" delay={0.06} />
          <StatCard icon={TrendingUp} label="Most Used This Month" value={stats.mostUsedName} color="#00AEEF" delay={0.12} />
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-left"
          >
            <StatCard icon={Archive} label={showArchived ? 'Showing Archived' : 'Archived'} value={String(stats.archived)} color="#94A3B8" delay={0.18} />
          </button>
        </div>
      </div>

      {/* Featured Templates */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-light-secondary text-xs font-semibold uppercase tracking-wider">
            Program Templates
          </h2>
          {templateFilter && (
            <button
              onClick={() => setTemplateFilter(null)}
              className="text-[10px] text-light-muted hover:text-light-primary flex items-center gap-1 transition-colors"
            >
              <X size={10} />
              Clear filter
            </button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-light-border scrollbar-track-transparent">
          {TEMPLATES.map((tmpl) => (
            <TemplateFeatureCard
              key={tmpl.key}
              template={tmpl}
              isActive={templateFilter === tmpl.key}
              onClick={() => setTemplateFilter(templateFilter === tmpl.key ? null : tmpl.key)}
              count={templateCounts[tmpl.key] || 0}
            />
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-light-border rounded-xl px-5 py-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-light-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs, goals, templates..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-light-surface border border-light-border text-light-primary text-sm placeholder:text-light-muted focus:outline-none focus:border-cyan/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted hover:text-light-primary">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'h-10 px-3 rounded-lg border text-sm flex items-center gap-2 transition-colors',
              showFilters
                ? 'border-cyan text-cyan bg-cyan/5'
                : 'border-light-border text-light-secondary hover:border-light-muted'
            )}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-cyan text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Goal Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-light-surface border border-light-border hover:border-cyan text-light-secondary text-sm px-4 py-2 rounded-lg transition-colors">
              <SlidersHorizontal size={14} />
              Goal
              {selectedGoals.length > 0 && (
                <span className="bg-cyan text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {selectedGoals.length}
                </span>
              )}
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-2 w-52 bg-light-surface border border-light-border rounded-lg shadow-glass opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-30 py-1">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => toggleGoal(goal.value)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                    selectedGoals.includes(goal.value)
                      ? 'text-cyan bg-cyan/10'
                      : 'text-light-secondary hover:text-light-primary hover:bg-light-hover'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    selectedGoals.includes(goal.value) ? 'bg-cyan border-cyan' : 'border-light-muted'
                  )}>
                    {selectedGoals.includes(goal.value) && <CheckCircle size={10} className="text-white" />}
                  </div>
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Method Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-light-surface border border-light-border hover:border-cyan text-light-secondary text-sm px-4 py-2 rounded-lg transition-colors">
              <Dumbbell size={14} />
              Method
              {selectedMethod && (
                <span className="bg-cyan text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">1</span>
              )}
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-light-surface border border-light-border rounded-lg shadow-glass opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-30 py-1">
              <button
                onClick={() => setSelectedMethod('')}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  !selectedMethod ? 'text-cyan bg-cyan/10' : 'text-light-secondary hover:text-light-primary hover:bg-light-hover'
                )}
              >
                All Methods
              </button>
              {methodOptions.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMethod(m === selectedMethod ? '' : m)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm transition-colors',
                    selectedMethod === m ? 'text-cyan bg-cyan/10' : 'text-light-secondary hover:text-light-primary hover:bg-light-hover'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {DIFFICULTY_OPTIONS.map((diff) => (
              <button
                key={diff}
                onClick={() => toggleDifficulty(diff)}
                className={cn(
                  'text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200',
                  selectedDifficulties.includes(diff)
                    ? 'border-cyan bg-cyan-glow text-cyan'
                    : 'border-light-border bg-light-surface text-light-muted hover:text-light-secondary hover:border-light-border'
                )}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-danger hover:text-danger text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <X size={14} />
              Clear all
            </button>
          )}
        </div>

        {/* Selected goal pills */}
        {selectedGoals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-light-border">
            {selectedGoals.map((goal) => {
              const label = GOAL_OPTIONS.find(g => g.value === goal)?.label || goal
              return (
                <span key={goal} className="inline-flex items-center gap-1 bg-cyan/10 text-cyan text-xs px-2.5 py-1 rounded-full">
                  {label}
                  <button onClick={() => toggleGoal(goal)} className="hover:text-white"><X size={10} /></button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Sort & View Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-light-muted text-sm">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none bg-light-surface border border-light-border text-light-secondary text-sm px-3 py-1.5 pr-8 rounded-lg focus:border-cyan outline-none cursor-pointer"
            >
              <option value="mostUsed">Most Used</option>
              <option value="newest">Newest First</option>
              <option value="alpha">Name A-Z</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-light-muted pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center bg-light-surface border border-light-border rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-light-hover text-light-primary' : 'text-light-muted hover:text-light-secondary'
            )}
            aria-label="Grid view"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'list' ? 'bg-light-hover text-light-primary' : 'text-light-muted hover:text-light-secondary'
            )}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-light-border rounded-xl overflow-hidden animate-pulse">
              <div className="h-20 bg-light-surface" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-light-surface rounded w-3/4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-light-surface rounded w-16" />
                  <div className="h-5 bg-light-surface rounded w-14" />
                </div>
                <div className="h-3 bg-light-surface rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : programs.length === 0 ? (
        <EmptyState onCreate={() => navigate('/programs/new')} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Search size={48} className="text-light-muted mb-4 opacity-50" />
          <h3 className="text-light-primary font-semibold text-base mb-1">No programs found</h3>
          <p className="text-light-secondary text-sm mb-4">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="border border-cyan text-cyan hover:bg-cyan/10 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {paginated.map((program, i) => (
              <ProgramCard key={program.id} program={program} index={i} onAction={handleAction} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="bg-white border border-light-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-light-border">
                {['Name', 'Goal', 'Method', 'Difficulty', 'Duration', 'Frequency', 'Used', 'Last', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-light-muted text-xs font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginated.map((program, i) => (
                  <ProgramListRow key={program.id} program={program} index={i} onAction={handleAction} />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </motion.div>
  )
}
