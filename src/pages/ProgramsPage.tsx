import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Plus,
  Search,
  SlidersHorizontal,
  // Zap,
  ChevronDown,
  CheckCircle,
  Archive,
  FolderOpen,
  Grid3X3,
  List,
  TrendingUp,
  X,
  Sparkles,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useAppDataStore } from '../stores/useAppDataStore'
import type { DisplayProgram } from '../components/programs'
import {
  StatCard,
  TemplateFeatureCard,
  ProgramCard,
  ProgramListRow,
  Pagination,
  EmptyState,
  toDisplayPrograms,
  TEMPLATES,
  TEMPLATE_KEYS,
  GOAL_OPTIONS,
  DIFFICULTY_OPTIONS,
  normalizeGoal,
} from '../components/programs'

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
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
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

  const equipmentOptions = useMemo(() => {
    const eq = new Set<string>()
    programs.forEach((p) => {
      p.equipment.split(',').forEach((e) => {
        const trimmed = e.trim()
        if (trimmed) eq.add(trimmed)
      })
    })
    return Array.from(eq).sort()
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

    // Equipment filter
    if (selectedEquipment.length > 0) {
      result = result.filter(p => {
        const progEq = p.equipment.split(',').map(e => e.trim().toLowerCase())
        return selectedEquipment.some(se => progEq.includes(se.toLowerCase()))
      })
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
  }, [programs, searchQuery, selectedGoals, selectedMethod, selectedDifficulties, selectedEquipment, showArchived, templateFilter, sortBy])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1) }, [searchQuery, selectedGoals, selectedMethod, selectedDifficulties, selectedEquipment, showArchived, templateFilter, sortBy])

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
  const activeFilterCount = selectedGoals.length + (selectedMethod ? 1 : 0) + selectedDifficulties.length + selectedEquipment.length + (showArchived ? 1 : 0) + (templateFilter ? 1 : 0)

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGoals([])
    setSelectedMethod('')
    setSelectedDifficulties([])
    setSelectedEquipment([])
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
  const toggleEquipment = (eq: string) => {
    setSelectedEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq])
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

          {/* Equipment Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-light-surface border border-light-border hover:border-cyan text-light-secondary text-sm px-4 py-2 rounded-lg transition-colors">
              <SlidersHorizontal size={14} />
              Equipment
              {selectedEquipment.length > 0 && (
                <span className="bg-cyan text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {selectedEquipment.length}
                </span>
              )}
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-2 w-56 bg-light-surface border border-light-border rounded-lg shadow-glass opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-30 py-1 max-h-60 overflow-y-auto">
              <button
                onClick={() => setSelectedEquipment([])}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  selectedEquipment.length === 0 ? 'text-cyan bg-cyan/10' : 'text-light-secondary hover:text-light-primary hover:bg-light-hover'
                )}
              >
                All Equipment
              </button>
              {equipmentOptions.map((eq) => (
                <button
                  key={eq}
                  onClick={() => toggleEquipment(eq)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                    selectedEquipment.includes(eq)
                      ? 'text-cyan bg-cyan/10'
                      : 'text-light-secondary hover:text-light-primary hover:bg-light-hover'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                    selectedEquipment.includes(eq) ? 'bg-cyan border-cyan' : 'border-light-muted'
                  )}>
                    {selectedEquipment.includes(eq) && <CheckCircle size={10} className="text-white" />}
                  </div>
                  {eq}
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

        {/* Selected filter pills */}
        {(selectedGoals.length > 0 || selectedEquipment.length > 0) && (
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
            {selectedEquipment.map((eq) => (
              <span key={eq} className="inline-flex items-center gap-1 bg-cyan/10 text-cyan text-xs px-2.5 py-1 rounded-full">
                {eq}
                <button onClick={() => toggleEquipment(eq)} className="hover:text-white"><X size={10} /></button>
              </span>
            ))}
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
