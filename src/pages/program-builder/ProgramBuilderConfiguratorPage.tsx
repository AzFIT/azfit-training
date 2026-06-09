import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { getPhaseByCode } from '../../data/azfitPhases'
import { useProgramBuilderV2Store } from '../../stores/useProgramBuilderV2Store'

export default function ProgramBuilderConfiguratorPage() {
  const { phaseCode } = useParams<{ phaseCode: string }>()
  const navigate = useNavigate()
  const { setPhase, setSessions } = useProgramBuilderV2Store()

  const phase = phaseCode ? getPhaseByCode(phaseCode) : undefined

  useEffect(() => {
    if (!phase) return

    // Initialize store with phase data
    setPhase(phase.phaseCode, phase.phaseName, phase.method, phase.durationWeeks)

    // Transform sessions into builder format with generated IDs
    const builderSessions = phase.sessions.map((s) => ({
      sessionNumber: s.sessionNumber,
      sessionName: s.sessionName,
      focus: s.focus,
      exercises: s.exercises.map((e, idx) => ({
        ...e,
        exerciseId: idx + 1, // temporary IDs
        isModified: false,
        isSubstituted: false,
        originalExerciseId: idx + 1,
        notes: '',
      })),
    }))

    setSessions(builderSessions)

    return () => {
      // Optional: reset on unmount if not saved
      // reset()
    }
  }, [phase, setPhase, setSessions])

  if (!phase) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Phase not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/program-builder')}>
          <ArrowLeft size={14} className="mr-1" />
          Back to Builder
        </Button>
      </div>
    )
  }

  const totalExercises = phase.sessions.reduce(
    (sum, s) => sum + s.exercises.length,
    0
  )

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
              onClick={() => navigate('/program-builder')}
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-[light-primary]">{phase.phaseName}</h1>
              <p className="text-xs text-muted-foreground">
                {phase.method} · {phase.durationWeeks} weeks · {phase.sessions.length} sessions · {totalExercises} exercises
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => navigate('/program-builder/review')}
            >
              Review &amp; Assign →
            </Button>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Loader2 size={24} className="text-primary animate-spin" />
        </div>
        <h2 className="text-lg font-semibold text-[light-primary] mb-2">
          Phase Configurator
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          The configurator is being built in Phase 2. For now, this page loads the phase data into the builder store.
        </p>

        <div className="text-left max-w-lg mx-auto space-y-3">
          <h3 className="text-sm font-medium text-[light-primary]">Loaded Sessions:</h3>
          {phase.sessions.map((s) => (
            <div
              key={s.sessionNumber}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div>
                <span className="text-sm font-medium">{s.sessionName}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {s.exercises.length} exercises
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{s.focus}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
