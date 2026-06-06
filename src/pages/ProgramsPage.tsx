import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen,
  CheckCircle,
  TrendingUp,
  Archive,
  Search,
  Clock,
  Calendar,
  Users,
  Edit,
  Copy,
  UserPlus,
  ArchiveIcon,
  MoreVertical,
  Grid3X3,
  List,
  Star,
  Filter,
  X,
  Dumbbell,
  Zap,
  Wind,
  HeartPulse,
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
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
  duration: string
  frequency: string
  equipment: string
  structure: string
  timesAssigned: number
  activeClients: number
  lastAssigned: string
  archived: boolean
  createdAt: string
  colorBanner: string
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

  return {
    id: p.id,
    name: p.name,
    goal: goalMap[p.goal] || p.goal,
    method: methodMap[p.trainingSplit || ''] || p.trainingSplit || 'Other',
    category: p.categoryName || p.goal,
    difficulty: diffMap[p.difficulty] || p.difficulty,
    duration: `${p.durationWeeks} wk`,
    frequency: `${p.daysPerWeek}x/wk`,
    equipment: p.tags?.join(', ') || 'Various',
    structure: p.trainingSplit || 'Full Body',
    timesAssigned: p.timesUsed,
    activeClients: Math.floor(p.timesUsed * 0.4),
    lastAssigned: daysAgo <= 1 ? '1 day ago' : `${daysAgo} days ago`,
    archived: !p.isActive,
    createdAt: p.createdAt,
    colorBanner: goalColor,
  }
}

// ── Constants ──────────────────────────────────────────
const GOAL_OPTIONS = [
  { label: 'Lose Fat', value: 'fat loss' },
  { label: 'Build Muscle', value: 'muscle' },
  { label: 'Strength', value: 'strength' },
  { label: 'Endurance', value: 'endurance' },
  { label: 'Rehabilitation', value: 'rehab' },
  { label: 'General Fitness', value: 'general' },
]

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Elite']

const GOAL_COLOR_MAP: Record<string, string> = {
  'fat loss': 'linear-gradient(135deg, #22C55E, #16A34A)',
  'lose fat': 'linear-gradient(135deg, #22C55E, #16A34A)',
  'weight loss': 'linear-gradient(135deg, #22C55E, #16A34A)',
  'muscle': 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  'hypertrophy': 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  'build muscle': 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  'strength': 'linear-gradient(135deg, #00AEEF, #0077B6)',
  'endurance': 'linear-gradient(135deg, #F97316, #EA580C)',
  'rehab': 'linear-gradient(135deg, #EAB308, #CA8A04)',
  'rehabilitation': 'linear-gradient(135deg, #EAB308, #CA8A04)',
  'general': 'linear-gradient(135deg, #C0C0C0, #9CA3AF)',
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

const DIFFICULTY_COLOR: Record<string, { text: string; bg: string }> = {
  Beginner: { text: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  Intermediate: { text: '#EAB308', bg: 'rgba(234,179,8,0.15)' },
  Advanced: { text: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  Elite: { text: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
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

function getGoalIcon(goal: string) {
  const g = normalizeGoal(goal)
  switch (g) {
    case 'fat loss': return <Zap size={32} className="text-white" />
    case 'muscle': return <Dumbbell size={32} className="text-white" />
    case 'strength': return <Zap size={32} className="text-white" />
    case 'endurance': return <Wind size={32} className="text-white" />
    case 'rehab': return <HeartPulse size={32} className="text-white" />
    default: return <Activity size={32} className="text-white" />
  }
}

function toDisplayPrograms(programs: Record<string, EntityProgram>): DisplayProgram[] {
  return Object.values(programs).map(toDisplayProgram)
}

// ── Components ─────────────────────────────────────────

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
        <p className="text-[#0F172A] font-semibold text-lg leading-tight truncate" style={{ fontFamily: 'Space Mono, monospace' }}>
          {value}
        </p>
        <p className="text-[#94A3B8] text-xs truncate">{label}</p>
      </div>
    </motion.div>
  )
}

/** Program Card */
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
  const [menuOpen, setMenuOpen] = useState(false)
  const diffColor = getDifficultyColor(program.difficulty)
  const goalLabel = GOAL_OPTIONS.find(g => program.goal.toLowerCase().includes(g.value))?.label || program.goal

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      layout
      className="relative bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden min-h-[280px] flex flex-col group cursor-pointer transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,174,239,0.1)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
    >
      {/* Color Banner */}
      <div
        className="h-20 relative flex-shrink-0 transition-all duration-300"
        style={{ background: program.colorBanner }}
      >
        <div className="absolute bottom-3 left-4">
          {getGoalIcon(program.goal)}
        </div>
        {program.timesAssigned >= 15 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[rgba(234,179,8,0.2)] border border-[rgba(234,179,8,0.4)] text-[#EAB308] text-xs font-semibold px-2 py-0.5 rounded-full">
            <Star size={10} />
            Most Used
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-[#0F172A] font-semibold text-base leading-snug flex-1 min-w-0">
            {program.name}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
              className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded transition-colors"
              aria-label="More actions"
            >
              <MoreVertical size={18} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-8 w-48 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-50 py-1"
                  >
                    {[
                      { label: 'Edit Program', icon: Edit, action: 'edit' },
                      { label: 'Duplicate', icon: Copy, action: 'duplicate' },
                      { label: 'Assign to Client', icon: UserPlus, action: 'assign' },
                      { label: program.archived ? 'Restore' : 'Archive', icon: ArchiveIcon, action: 'archive' },
                      { label: 'Delete', icon: Trash2, action: 'delete' },
                    ].map((item) => (
                      <button
                        key={item.action}
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onAction(item.action, program) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] text-sm transition-colors"
                      >
                        <item.icon size={14} />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Meta Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: getGoalBg(program.goal), color: '#0F172A' }}
          >
            {goalLabel}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[rgba(192,192,192,0.1)] text-[#C0C0C0]">
            {program.method}
          </span>
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: diffColor.bg, color: diffColor.text }}
          >
            {program.difficulty}
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <Clock size={13} className="flex-shrink-0" />
            <span className="text-xs font-medium">{program.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <Calendar size={13} className="flex-shrink-0" />
            <span className="text-xs font-medium">{program.frequency}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <Users size={13} className="flex-shrink-0" />
            <span className="text-xs font-medium">{program.timesAssigned}x</span>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-auto pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#94A3B8]">
          <span>Last: {program.lastAssigned}</span>
          <span className="text-[#64748B]">{program.activeClients} active</span>
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
            className="absolute inset-x-0 bottom-0 bg-[rgba(10,10,10,0.88)] backdrop-blur-sm border-t border-[#E2E8F0] p-4 flex items-center justify-center gap-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { icon: Edit, label: 'Edit', action: 'edit', primary: false },
              { icon: Copy, label: 'Dup', action: 'duplicate', primary: false },
              { icon: UserPlus, label: 'Assign', action: 'assign', primary: true },
              { icon: ArchiveIcon, label: 'Archive', action: 'archive', primary: false },
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
                    ? 'bg-[#00AEEF] text-white hover:bg-[#009BD6]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
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
  const diffColor = getDifficultyColor(program.difficulty)
  const goalLabel = GOAL_OPTIONS.find(g => program.goal.toLowerCase().includes(g.value))?.label || program.goal

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        'border-b border-[#E2E8F0] transition-colors duration-150',
        index % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-[#FFFFFF]',
        hovered && 'bg-[#F1F5F9]'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: program.colorBanner }} />
          <div>
            <p className="text-[#0F172A] text-sm font-medium">{program.name}</p>
            {program.timesAssigned >= 15 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#EAB308] font-semibold">
                <Star size={10} /> Most Used
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: getGoalBg(program.goal), color: '#0F172A' }}>
          {goalLabel}
        </span>
      </td>
      <td className="px-4 py-3.5 text-[#64748B] text-xs">{program.method}</td>
      <td className="px-4 py-3.5">
        <span className="text-xs font-semibold" style={{ color: diffColor.text }}>{program.difficulty}</span>
      </td>
      <td className="px-4 py-3.5 text-[#64748B] text-xs">{program.duration}</td>
      <td className="px-4 py-3.5 text-[#64748B] text-xs">{program.frequency}</td>
      <td className="px-4 py-3.5 text-[#64748B] text-xs">{program.timesAssigned}x</td>
      <td className="px-4 py-3.5 text-[#94A3B8] text-xs">{program.lastAssigned}</td>
      <td className="px-4 py-3.5">
        <div className={cn('flex items-center gap-1 transition-opacity', hovered ? 'opacity-100' : 'opacity-40')}>
          {[
            { icon: Edit, action: 'edit' },
            { icon: Copy, action: 'duplicate' },
            { icon: UserPlus, action: 'assign' },
            { icon: ArchiveIcon, action: 'archive' },
            { icon: Trash2, action: 'delete' },
          ].map((btn) => (
            <button
              key={btn.action}
              onClick={() => onAction(btn.action, program)}
              className="text-[#64748B] hover:text-[#0F172A] p-1.5 rounded hover:bg-[#F1F5F9] transition-colors"
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
        className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) => (
        typeof p === 'string' ? (
          <span key={`dots-${i}`} className="text-[#94A3B8] px-1">{p}</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
              p === currentPage
                ? 'bg-[#00AEEF] text-white'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
            )}
          >
            {p}
          </button>
        )
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
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
        p.equipment.toLowerCase().includes(q)
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
  }, [programs, searchQuery, selectedGoals, selectedMethod, selectedDifficulties, showArchived, sortBy])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1) }, [searchQuery, selectedGoals, selectedMethod, selectedDifficulties, showArchived, sortBy])

  // Actions
  const handleAction = useCallback((action: string, program: DisplayProgram) => {
    switch (action) {
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
  const activeFilterCount = selectedGoals.length + (selectedMethod ? 1 : 0) + selectedDifficulties.length + (showArchived ? 1 : 0)

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGoals([])
    setSelectedMethod('')
    setSelectedDifficulties([])
    setShowArchived(false)
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
      className="max-w-[1440px] mx-auto bg-[#F8FAFC] min-h-[calc(100dvh-64px)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#0F172A] text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Program Library
          </h1>
          <p className="text-[#64748B] text-sm mt-0.5">{filtered.length} program{filtered.length !== 1 ? 's' : ''} available</p>
        </div>
        <button
          onClick={() => navigate('/programs/new')}
          className="bg-[#00AEEF] hover:bg-[#009BD6] text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] text-sm flex items-center gap-2"
        >
          <Dumbbell size={16} />
          New Program
        </button>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-6 py-5 mb-6">
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

      {/* Filter Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-5 py-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center bg-[#F8FAFC] rounded-full border border-[#E2E8F0] focus-within:border-[#00AEEF] transition-colors w-full sm:w-72">
            <Search size={16} className="text-[#94A3B8] ml-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[#0F172A] text-sm placeholder-[#94A3B8] px-3 py-2 w-full outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#94A3B8] hover:text-[#0F172A] mr-3">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Goal Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#00AEEF] text-[#64748B] text-sm px-4 py-2 rounded-lg transition-colors">
              <Filter size={14} />
              Goal
              {selectedGoals.length > 0 && (
                <span className="bg-[#00AEEF] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {selectedGoals.length}
                </span>
              )}
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-2 w-52 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-30 py-1">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => toggleGoal(goal.value)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                    selectedGoals.includes(goal.value)
                      ? 'text-[#00AEEF] bg-[rgba(0,174,239,0.1)]'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    selectedGoals.includes(goal.value) ? 'bg-[#00AEEF] border-[#00AEEF]' : 'border-[#94A3B8]'
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
            <button className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#00AEEF] text-[#64748B] text-sm px-4 py-2 rounded-lg transition-colors">
              <Dumbbell size={14} />
              Method
              {selectedMethod && (
                <span className="bg-[#00AEEF] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">1</span>
              )}
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-30 py-1">
              <button
                onClick={() => setSelectedMethod('')}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  !selectedMethod ? 'text-[#00AEEF] bg-[rgba(0,174,239,0.1)]' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
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
                    selectedMethod === m ? 'text-[#00AEEF] bg-[rgba(0,174,239,0.1)]' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
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
                    ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.15)] text-[#00AEEF]'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8] hover:text-[#64748B] hover:border-[#E2E8F0]'
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
              className="text-[#EF4444] hover:text-[#DC2626] text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <X size={14} />
              Clear all
            </button>
          )}
        </div>

        {/* Selected goal pills */}
        {selectedGoals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#E2E8F0]">
            {selectedGoals.map((goal) => {
              const label = GOAL_OPTIONS.find(g => g.value === goal)?.label || goal
              return (
                <span key={goal} className="inline-flex items-center gap-1 bg-[rgba(0,174,239,0.1)] text-[#00AEEF] text-xs px-2.5 py-1 rounded-full">
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
          <span className="text-[#94A3B8] text-sm">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-sm px-3 py-1.5 pr-8 rounded-lg focus:border-[#00AEEF] outline-none cursor-pointer"
            >
              <option value="mostUsed">Most Used</option>
              <option value="newest">Newest First</option>
              <option value="alpha">Name A-Z</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-[#F1F5F9] text-[#0F172A]' : 'text-[#94A3B8] hover:text-[#64748B]'
            )}
            aria-label="Grid view"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'list' ? 'bg-[#F1F5F9] text-[#0F172A]' : 'text-[#94A3B8] hover:text-[#64748B]'
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
            <div key={i} className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden animate-pulse">
              <div className="h-20 bg-[#F8FAFC]" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-[#F8FAFC] rounded w-3/4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-[#F8FAFC] rounded w-16" />
                  <div className="h-5 bg-[#F8FAFC] rounded w-14" />
                </div>
                <div className="h-3 bg-[#F8FAFC] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Search size={48} className="text-[#94A3B8] mb-4 opacity-50" />
          <h3 className="text-[#0F172A] font-semibold text-base mb-1">No programs found</h3>
          <p className="text-[#64748B] text-sm mb-4">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="border border-[#00AEEF] text-[#00AEEF] hover:bg-[rgba(0,174,239,0.1)] font-medium px-4 py-2 rounded-lg text-sm transition-colors"
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
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FFFFFF] border-b border-[#E2E8F0]">
                {['Name', 'Goal', 'Method', 'Difficulty', 'Duration', 'Frequency', 'Used', 'Last', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">
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
