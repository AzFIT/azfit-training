import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Check } from 'lucide-react'
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
import { VideoPreviewModal } from '../../components/program-builder-v2/modals/VideoPreviewModal'
import { AddExerciseModal } from '../../components/program-builder-v2/modals/AddExerciseModal'
import { EmptySessionState } from '../../components/program-builder-v2/configurator/EmptySessionState'
import { KeyboardShortcutsHint } from '../../components/program-builder-v2/configurator/KeyboardShortcutsHint'
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
    addExercise,
    reset,
    saveDraft,
    loadDraft,
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
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<SessionExercise | null>(null)
  const [selectedSessionNumber, setSelectedSessionNumber] = useState(1)
  const [selectedOrderNotation, setSelectedOrderNotation] = useState('')
  const [savedToast, setSavedToast] = useState(false)

  // Initialize from phase
  useEffect(() => {
    if (!phase) return

    // Try to load draft only if phase matches
    const loaded = loadDraft()
    const currentPhase = useProgramBuilderV2Store.getState().phaseCode
    if (loaded && currentPhase === phase.phaseCode) {
      return
    }

    // Otherwise initialize fresh from phase
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
  }, [phase, setPhase, setSessions, setActiveSessionIndex, loadDraft])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      const activeSession = sessions[activeSessionIndex]
      if (!activeSession || activeSession.exercises.length === 0) return

      // Number keys 1-9 to select exercise
      const num = parseInt(e.key)
      if (!isNaN(num) && num >= 1 && num <= activeSession.exercises.length) {
        const ex = activeSession.exercises[num - 1]
        setSelectedExercise(ex)
        setSelectedSessionNumber(activeSession.sessionNumber)
        setSelectedOrderNotation(ex.orderNotation)
        return
      }

      if (!selectedExercise) return

      switch (e.key.toLowerCase()) {
        case 's':
          setSwapModalOpen(true)
          break
        case 'e':
          setEditModalOpen(true)
          break
        case 'delete':
        case 'backspace':
          if (window.confirm(`Remove ${selectedExercise.exerciseName}?`)) {
            deleteExercise(selectedSessionNumber, selectedOrderNotation)
            setSelectedExercise(null)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sessions, activeSessionIndex, selectedExercise, selectedSessionNumber, selectedOrderNotation, deleteExercise])

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
      if (selectedExercise?.orderNotation === orderNotation) {
        setSelectedExercise(null)
      }
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
    setSelectedExercise(exercise)
    setVideoModalOpen(true)
  }

  const handleAdd = (exercise: SessionExercise) => {
    if (!activeSession) return
    addExercise(activeSession.sessionNumber, exercise)
  }

  const handleSaveDraft = useCallback(() => {
    saveDraft()
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
  }, [saveDraft])

  const handleReset = () => {
    if (window.confirm('Reset all changes to template defaults?')) {
      reset()
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
            <KeyboardShortcutsHint />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[light-primary]">
                  {activeSession.sessionName}
                </h2>
                <p className="text-xs text-muted-foreground">{activeSession.focus}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 w-full sm:w-auto"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus size={13} className="mr-1" />
                Add Exercise
              </Button>
            </div>

            {/* Exercise list */}
            {activeSession.exercises.length > 0 ? (
              <div className="space-y-2">
                {activeSession.exercises.map((exercise, idx) => (
                  <div
                    key={`${activeSession.sessionNumber}-${exercise.orderNotation}`}
                    onClick={() => {
                      setSelectedExercise(exercise)
                      setSelectedSessionNumber(activeSession.sessionNumber)
                      setSelectedOrderNotation(exercise.orderNotation)
                    }}
                    className={`cursor-pointer rounded-lg transition-all ${
                      selectedExercise?.orderNotation === exercise.orderNotation
                        ? 'ring-2 ring-primary/50'
                        : ''
                    }`}
                  >
                    <ExerciseCard
                      exercise={exercise}
                      index={idx}
                      onSwap={() => handleSwap(activeSession.sessionNumber, exercise.orderNotation)}
                      onEdit={() => handleEdit(activeSession.sessionNumber, exercise.orderNotation)}
                      onDelete={() => handleDelete(activeSession.sessionNumber, exercise.orderNotation)}
                      onVideo={() => handleVideo(exercise)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptySessionState onAdd={() => setAddModalOpen(true)} />
            )}

            {/* Session stats */}
            <SessionStats session={activeSession} />
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <BottomActionBar
        onSaveDraft={handleSaveDraft}
        onReview={() => navigate('/program-builder/review')}
        onReset={handleReset}
        hasModifications={hasModifications}
      />

      {/* Saved toast */}
      {savedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white text-xs font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <Check size={14} />
          Draft saved
        </div>
      )}

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

      <VideoPreviewModal
        exerciseName={selectedExercise?.exerciseName || ''}
        motionCategory={selectedExercise?.motionCategory}
        videoLink={selectedExercise?.videoLink || null}
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
      />

      <AddExerciseModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdd={handleAdd}
        existingOrderNotations={activeSession?.exercises.map((e) => e.orderNotation) || []}
      />
    </div>
  )
}
