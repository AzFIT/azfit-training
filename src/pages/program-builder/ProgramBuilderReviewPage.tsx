import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Rocket, Save, AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useProgramBuilderV2Store } from '../../stores/useProgramBuilderV2Store'
import { ProgramSummaryCard } from '../../components/program-builder-v2/review/ProgramSummaryCard'
import { WeekTimeline } from '../../components/program-builder-v2/review/WeekTimeline'
import { SessionAccordion } from '../../components/program-builder-v2/review/SessionAccordion'
import { TrackingLinksCard } from '../../components/program-builder-v2/review/TrackingLinksCard'
import { AssignConfirmationModal } from '../../components/program-builder-v2/review/AssignConfirmationModal'

export default function ProgramBuilderReviewPage() {
  const navigate = useNavigate()
  const {
    phaseCode,
    phaseName,
    method,
    durationWeeks,
    sessions,
    clientContext,
    modifications,
  } = useProgramBuilderV2Store()

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assigned, setAssigned] = useState(false)

  const totalExercises = sessions.reduce((sum, s) => sum + s.exercises.length, 0)
  const totalSets = sessions.reduce(
    (sum, s) => sum + s.exercises.reduce((es, ex) => es + ex.sets, 0),
    0
  )

  const modificationCount =
    modifications.swappedExercises.size +
    modifications.editedParameters.size +
    modifications.addedExercises.length +
    modifications.deletedExercises.length

  const hasClient = !!clientContext.clientId

  const handleAssign = () => {
    // In production: call Supabase to create client_programs record
    setAssignModalOpen(false)
    setAssigned(true)
    setTimeout(() => {
      if (clientContext.clientId) {
        navigate(`/clients/${clientContext.clientId}`)
      } else {
        navigate('/program-builder')
      }
    }, 1500)
  }

  if (assigned) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Rocket size={28} className="text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-light-primary">Program Assigned!</h2>
        <p className="text-sm text-muted-foreground">
          {phaseName} has been assigned to {clientContext.clientName || 'the client'}.
        </p>
        <p className="text-xs text-muted-foreground">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
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
              <h1 className="text-lg font-bold text-light-primary">Review &amp; Assign</h1>
              <p className="text-xs text-muted-foreground">
                Final check before assigning to client
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Validation warning */}
        {!hasClient && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
            <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                No client selected
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Go back to the configurator and select a client before assigning.
              </p>
            </div>
          </div>
        )}

        {/* Program Summary */}
        <ProgramSummaryCard
          phaseName={phaseName || 'Untitled Program'}
          method={method}
          durationWeeks={durationWeeks}
          clientName={clientContext.clientName}
          startDate={clientContext.startDate}
          sessionCount={sessions.length}
          exerciseCount={totalExercises}
          totalSets={totalSets}
          onEditContext={() => navigate(`/program-builder/phase/${phaseCode || ''}`)}
        />

        {/* Modification summary */}
        {modificationCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {modifications.swappedExercises.size > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {modifications.swappedExercises.size} exercise{modifications.swappedExercises.size !== 1 ? 's' : ''} swapped
              </span>
            )}
            {modifications.editedParameters.size > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {modifications.editedParameters.size} parameter{modifications.editedParameters.size !== 1 ? 's' : ''} edited
              </span>
            )}
            {modifications.deletedExercises.length > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {modifications.deletedExercises.length} exercise{modifications.deletedExercises.length !== 1 ? 's' : ''} removed
              </span>
            )}
            {modifications.addedExercises.length > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                {modifications.addedExercises.length} exercise{modifications.addedExercises.length !== 1 ? 's' : ''} added
              </span>
            )}
          </div>
        )}

        {/* Week Timeline */}
        <WeekTimeline
          phaseName={phaseName}
          durationWeeks={durationWeeks}
          startDate={clientContext.startDate}
        />

        {/* Session Breakdown */}
        <SessionAccordion sessions={sessions} />

        {/* Tracking Links */}
        <TrackingLinksCard />
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-t">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => alert('Save as template — coming with Supabase integration')}
          >
            <Save size={13} className="mr-1" />
            Save as Template
          </Button>

          <Button
            size="sm"
            className="text-xs"
            disabled={!hasClient}
            onClick={() => setAssignModalOpen(true)}
          >
            <Rocket size={13} className="mr-1" />
            Assign Program
          </Button>
        </div>
      </div>

      {/* Assign Confirmation Modal */}
      <AssignConfirmationModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        clientName={clientContext.clientName}
        phaseName={phaseName}
        durationWeeks={durationWeeks}
        sessionCount={sessions.length}
        onConfirm={handleAssign}
      />
    </div>
  )
}
