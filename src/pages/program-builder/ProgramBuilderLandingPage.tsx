import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Wrench } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { QuickStartStrip } from '../../components/program-builder-v2/landing/QuickStartStrip'
import { PhaseFilterBar } from '../../components/program-builder-v2/landing/PhaseFilterBar'
import { PhaseTemplateCard } from '../../components/program-builder-v2/landing/PhaseTemplateCard'
import { CustomProgramList } from '../../components/program-builder-v2/landing/CustomProgramList'
import {
  AZFIT_PHASES,
  getQuickStartPhases,
} from '../../data/azfitPhases'
import type { PhaseFilters, CustomProgram } from '../../types/program-builder-v2'

// Demo custom programs — in production this comes from Supabase
const DEMO_CUSTOM_PROGRAMS: CustomProgram[] = []

export default function ProgramBuilderLandingPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<PhaseFilters>({
    method: 'all',
    duration: 'all',
    difficulty: 'all',
    search: '',
  })

  const quickStartPhases = useMemo(() => getQuickStartPhases(), [])

  const filteredPhases = useMemo(() => {
    return AZFIT_PHASES.filter((phase) => {
      // Method filter
      if (filters.method !== 'all' && phase.method !== filters.method) return false

      // Duration filter
      if (filters.duration !== 'all' && String(phase.durationWeeks) !== filters.duration) return false

      // Difficulty filter
      if (filters.difficulty !== 'all' && phase.difficulty !== filters.difficulty) return false

      // Search filter
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase()
        const haystack = [
          phase.phaseName,
          phase.method,
          phase.focusArea,
          phase.description,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }

      return true
    })
  }, [filters])

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-light-primary">Program Builder</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Select a phase template to customize and assign
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs hidden sm:flex"
              onClick={() => navigate('/programs/new')}
            >
              <Wrench size={13} className="mr-1" />
              From Scratch
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={() => navigate('/program-builder/phase/P1-GBC1')}
            >
              <Plus size={13} className="mr-1" />
              New Program
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Quick Start */}
        <QuickStartStrip phases={quickStartPhases} />

        {/* Divider */}
        <div className="border-t" />

        {/* All Phases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-light-primary">All Phase Templates</h2>
              <p className="text-xs text-muted-foreground">
                12 AzFIT phases — select one to customize
              </p>
            </div>
          </div>

          <PhaseFilterBar
            filters={filters}
            onChange={setFilters}
            resultCount={filteredPhases.length}
          />

          {/* Phase Grid */}
          {filteredPhases.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPhases.map((phase) => (
                <PhaseTemplateCard key={phase.phaseCode} phase={phase} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border border-dashed">
              <p className="text-sm text-muted-foreground">No phases match your filters</p>
              <Button
                variant="link"
                size="sm"
                className="text-xs mt-1"
                onClick={() =>
                  setFilters({ method: 'all', duration: 'all', difficulty: 'all', search: '' })
                }
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* My Custom Programs */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-light-primary">My Custom Programs</h2>
            <p className="text-xs text-muted-foreground">
              Programs you&apos;ve customized and saved
            </p>
          </div>
          <CustomProgramList programs={DEMO_CUSTOM_PROGRAMS} />
        </div>
      </div>
    </div>
  )
}
