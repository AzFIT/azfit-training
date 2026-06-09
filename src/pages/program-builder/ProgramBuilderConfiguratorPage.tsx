import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { getPhaseByCode } from '../../data/azfitPhases'
import { useProgramBuilderV2Store } from '../../stores/useProgramBuilderV2Store'
import { useAppDataStore } from '../../stores/useAppDataStore'
import { ClientContextCard } from '../../components/program-builder-v2/configurator/ClientContextCard'
import { SessionTabs } from '../../components/program-builder-v2/configurator/SessionTabs'
import { ExerciseCard } from '../../components/program-builder-v2/configurator/ExerciseCard'
import { SessionStats } from '../../components/program-builder-v2/configurator/SessionStats'
import { BottomActionBar } from '../../components/program-builder-v2/configurator/BottomActionBar'
import { ExerciseEditModal } from '../../components/program-builder-v2/configurator/ExerciseEditModal'
import { ExerciseSwapModal } from '../../components/program-builder-v2/configurator/ExerciseSwapModal'
import type { SessionExercise } from '../../types/program-builder-v2'

export default function ProgramBuilderConfiguratorPage() {
  const { phaseCode } = useParams<{ phaseCode: string }>()
  const navigate = useNavigate()
  const phase = phaseCode ? getPhaseByCode(phaseCode) : undefined

  // Store
  const {
    setPhase,
    setSessions,
    clientContext,
    setClientContext,
    sessions,
    activeSessionIndex,
    setActiveSessionIndex,
    swapExercise,
    editExercise,
    deleteExercise,
    reset,
    modifications,
  } = useProgramBuilderV2Store()

  // Get clients from app store
  const appClients = useAppDataStore((s) => s.clients)
  const clientsList = useMemo(
    () => Object.values(appClients).map((c) => ({ id: c.id, name: c.name })),
    [appClients]
  )

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<SessionExercise | null>(null)
  const [selectedSessionNumber, setSelectedSessionNumber] = useState(1)
  const [selectedOrderNotation, setSelectedOrderNotation] = useState('')

  // Initialize from phase
  useEffect(() => {
    if (!phase) return

    setPhase(phase.phaseCode, phase.phaseName, phase.method, phase.durationWeeks)

    const builderSessions = phase.sessions.map((s) => ({
      sessionNumber: s.sessionNumber,
      sessionName: s.sessionName,
      focus: s.focus,
      exercises: s.exercises.map((e, idx) => ({
        ...e,
        exerciseId: idx + 1000 * s.sessionNumber,
        isModified: false,
        isSubstituted: false,
        originalExerciseId: idx + 1000 * s.sessionNumber,
        notes: '',
      })),
    }))

    setSessions(builderSessions)
    setActiveSessionIndex(0)
  }, [phase, setPhase, setSessions, setActiveSessionIndex])

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

  const activeSession = sessions[activeSessionIndex]
  const hasModifications =
    modifications.swappedExercises.size > 0 ||
    modifications.editedParameters.size > 0 ||
    modifications.addedExercises.length > 0 ||
    modifications.deletedExercises.length > 0

  const totalExercises = sessions.reduce((sum, s) => sum + s.exercises.length, 0)

  // Handlers
  const handleSwap = (sessionNumber: number, orderNotation: string) => {
    const session = sessions.find((s) => s.sessionNumber === sessionNumber)
    const ex = session?.exercises.find((e) => e.orderNotation === orderNotation)
    if (ex) {
      setSelectedExercise(ex)
      setSelectedSessionNumber(sessionNumber)
      setSelectedOrderNotation(orderNotation)
      setSwapModalOpen(true)
    }
  }

  const handleEdit = (sessionNumber: number, orderNotation: string) => {
    const session = sessions.find((s) => s.sessionNumber === sessionNumber)
    const ex = session?.exercises.find((e) => e.orderNotation === orderNotation)
    if (ex) {
      setSelectedExercise(ex)
      setSelectedSessionNumber(sessionNumber)
      setSelectedOrderNotation(orderNotation)
      setEditModalOpen(true)
    }
  }

  const handleDelete = (sessionNumber: number, orderNotation: string) => {
    if (window.confirm('Remove this exercise from the session?')) {
      deleteExercise(sessionNumber, orderNotation)
    }
  }

  const handleConfirmSwap = (newId: number, newName: string, newCategory: string) => {
    const newExercise: SessionExercise = {
      ...selectedExercise!,
      exerciseId: newId,
      exerciseName: newName,
      motionCategory: newCategory,
      isSubstituted: true,
    }
    swapExercise(selectedSessionNumber, selectedOrderNotation, newExercise)
  }

  const handleConfirmEdit = (updates: Partial<SessionExercise>) => {
    editExercise(selectedSessionNumber, selectedOrderNotation, updates)
  }

  const handleVideo = (exercise: SessionExercise) => {
    // Placeholder: would open video modal or link
    alert(`Video for: ${exercise.exerciseName}\n${exercise.videoLink || 'No video link available'}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              onClick={() => navigate('/program-builder')}
            >
              <ArrowLeft size={16} />
            </Button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-[light-primary] truncate">
                {phase.phaseName}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {phase.method} · {phase.durationWeeks} weeks · {phase.sessions.length} sessions · {totalExercises} exercises
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-xs hidden sm:flex"
              onClick={() => navigate('/program-builder/review')}
            >
              Review &amp; Assign →
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 space-y-4">
        {/* Client Context */}
        <ClientContextCard
          context={clientContext}
          clients={clientsList}
          onChange={setClientContext}
        />

        {/* Session Tabs */}
        {sessions.length > 0 && (
          <SessionTabs
            sessions={sessions}
            activeIndex={activeSessionIndex}
            onChange={setActiveSessionIndex}
          />
        )}

        {/* Active Session */}
        {activeSession && (
          <div className="space-y-3">
            {/* Session header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[light-primary]">
                  {activeSession.sessionName}
                </h2>
                <p className="text-xs text-muted-foreground">{activeSession.focus}</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-8">
                <Plus size={13} className="mr-1" />
                Add Exercise
              </Button>
            </div>

            {/* Exercise list */}
            <div className="space-y-2">
              {activeSession.exercises.map((exercise, idx) => (
                <ExerciseCard
                  key={`${activeSession.sessionNumber}-${exercise.orderNotation}`}
                  exercise={exercise}
                  index={idx}
                  onSwap={() => handleSwap(activeSession.sessionNumber, exercise.orderNotation)}
                  onEdit={() => handleEdit(activeSession.sessionNumber, exercise.orderNotation)}
                  onDelete={() => handleDelete(activeSession.sessionNumber, exercise.orderNotation)}
                  onVideo={() => handleVideo(exercise)}
                />
              ))}
            </div>

            {/* Session stats */}
            <SessionStats session={activeSession} />
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <BottomActionBar
        onSaveDraft={() => alert('Save draft — coming in Phase 3 with Supabase integration')}
        onReview={() => navigate('/program-builder/review')}
        onReset={() => {
          if (window.confirm('Reset all changes to template defaults?')) {
            reset()
            // Re-initialize from phase
            if (phase) {
              setPhase(phase.phaseCode, phase.phaseName, phase.method, phase.durationWeeks)
              const builderSessions = phase.sessions.map((s) => ({
                sessionNumber: s.sessionNumber,
                sessionName: s.sessionName,
                focus: s.focus,
                exercises: s.exercises.map((e, idx) => ({
                  ...e,
                  exerciseId: idx + 1000 * s.sessionNumber,
                  isModified: false,
                  isSubstituted: false,
                  originalExerciseId: idx + 1000 * s.sessionNumber,
                  notes: '',
                })),
              }))
              setSessions(builderSessions)
              setActiveSessionIndex(0)
            }
          }
        }}
        hasModifications={hasModifications}
      />

      {/* Modals */}
      <ExerciseEditModal
        exercise={selectedExercise}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleConfirmEdit}
      />

      <ExerciseSwapModal
        currentExercise={selectedExercise}
        open={swapModalOpen}
        onOpenChange={setSwapModalOpen}
        onConfirm={handleConfirmSwap}
      />
    </div>
  )
}
