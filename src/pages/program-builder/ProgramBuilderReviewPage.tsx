import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Rocket } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useProgramBuilderV2Store } from '../../stores/useProgramBuilderV2Store'

export default function ProgramBuilderReviewPage() {
  const navigate = useNavigate()
  const { phaseName, method, durationWeeks, sessions, clientContext } = useProgramBuilderV2Store()

  const totalExercises = sessions.reduce(
    (sum, s) => sum + s.exercises.length,
    0
  )

  const totalSets = sessions.reduce(
    (sum, s) => sum + s.exercises.reduce((es, ex) => es + ex.sets, 0),
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
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-[light-primary]">Review &amp; Assign</h1>
              <p className="text-xs text-muted-foreground">
                Final check before assigning to client
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Program Summary Card */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-sm">📋</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[light-primary]">
                {phaseName || 'Untitled Program'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {method} · {durationWeeks} weeks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-muted p-3 text-center">
              <div className="text-lg font-bold text-[light-primary]">{sessions.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Sessions</div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <div className="text-lg font-bold text-[light-primary]">{totalExercises}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Exercises</div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <div className="text-lg font-bold text-[light-primary]">{totalSets}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Sets</div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <div className="text-lg font-bold text-[light-primary]">{clientContext.clientName || '—'}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Client</div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-[light-primary]">Sessions</h3>
          {sessions.map((s) => (
            <div
              key={s.sessionNumber}
              className="rounded-lg border bg-card p-3 flex items-center justify-between"
            >
              <div>
                <span className="text-sm font-medium">{s.sessionName}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {s.exercises.length} exercises · {s.exercises.reduce((sum, e) => sum + e.sets, 0)} sets
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder CTA */}
        <div className="rounded-xl border border-dashed p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            The full review &amp; assign workflow is coming in Phase 3.
          </p>
          <Button
            size="sm"
            className="text-xs"
            onClick={() => alert('Assignment feature coming in Phase 3!')}
          >
            <Rocket size={13} className="mr-1" />
            Assign Program
          </Button>
        </div>
      </div>
    </div>
  )
}
