/**
 * SheetsPage — Workout session view (orchestrates modular components)
 *
 * Route: /sheets and /sheets?session={id}
 *
 * This page wraps the existing workout session functionality with
 * the new modular components from the KIMI_CODE_PROMPT spec:
 * - StickyHeader, StatsBar, BottomBar
 * - RestTimerOverlay (full-screen)
 * - WorkoutSummary (completion modal)
 * - SessionLauncher (start workout bottom sheet)
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// New modular components from spec
import StickyHeader from '@/components/sheets/StickyHeader'
import StatsBar from '@/components/sheets/StatsBar'
import BottomBar from '@/components/sheets/BottomBar'
import RestTimerOverlay from '@/components/RestTimerOverlay'
import WorkoutSummary from '@/components/WorkoutSummary'
import SessionLauncher from '@/components/SessionLauncher'

// Existing workout components
import ExerciseBlock from '@/components/workout/ExerciseBlock'
import { useWorkoutSession } from '@/hooks/useWorkoutSession'
import { useProgramDetails } from '@/hooks/usePrograms'
import { useAppDataStore } from '@/stores/useAppDataStore'
import {
  buildSessionFromProgram,
  createDemoSessionInfo,
  type SessionInfo,
} from '@/components/workout/sessionData'
// import type { ExerciseBlockData } from '@/components/workout/ExerciseBlock'
import type { SetData } from '@/components/workout/SetRow'
import { PRCelebrationModal } from '@/components/workout/pr/PRCelebrationModal'
import { detectPersonalRecords, type PersonalRecord } from '@/components/workout/pr/prDetection'
import WorkoutShareCard, { type WorkoutShareCardData } from '@/components/workout/WorkoutShareCard'
import { saveWorkoutSessionLog, saveWorkoutResult } from '@/services/workoutApi'

export default function SheetsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session')
  const clientId = searchParams.get('client')
  const programIdParam = searchParams.get('program')

  const programId = programIdParam ? parseInt(programIdParam, 10) : null
  const dayNumber = sessionId ? parseInt(sessionId, 10) || 1 : 1

  // Fetch program data
  const { data: programData, isLoading } = useProgramDetails(programId)
  const { clients, workoutSessions, addWorkoutSession } = useAppDataStore()
  const client = clientId ? clients[clientId] : null

  // Find previous session for progression
  const previousSession = useMemo(() => {
    if (!clientId || !programId) return null
    const sessions = Object.values(workoutSessions)
      .filter(
        (s) =>
          s.clientId === clientId &&
          s.programId === String(programId) &&
          s.dayNumber === dayNumber
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return sessions[0] || null
  }, [workoutSessions, clientId, programId, dayNumber])

  // Build session info
  const sessionInfo: SessionInfo = useMemo(() => {
    if (programData && programData.days.length > 0) {
      const hasExercises = programData.days.some((d) => d.exercises.length > 0)
      if (hasExercises || programData.program.days_per_week > 0) {
        return buildSessionFromProgram({
          programData,
          dayNumber,
          previousSession,
          clientName: client?.name,
        })
      }
    }
    return createDemoSessionInfo()
  }, [programData, dayNumber, previousSession, client?.name])

  // Workout session hook
  const {
    exercises,
    elapsedFormatted,
    elapsedSeconds,
    updateExerciseSets,
    getCompletedSetsCount,
    getTotalSetsCount,
    finishSession,
  } = useWorkoutSession(sessionInfo.exercises)

  // UI state
  const [showLauncher, setShowLauncher] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [restTimerConfig, setRestTimerConfig] = useState({
    duration: 45,
    nextExercise: '',
    nextSetNumber: 1,
  })
  const [prRecords, setPrRecords] = useState<PersonalRecord[]>([])
  const [showPrModal, setShowPrModal] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const [shareCardData, setShareCardData] = useState<WorkoutShareCardData | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  const completedSets = getCompletedSetsCount()
  const totalSets = getTotalSetsCount()

  // Total load calculation
  const totalLoad = useMemo(() => {
    return exercises.reduce((sum, ex) => {
      return (
        sum +
        ex.sets.reduce((setSum, s) => {
          return s.completed ? setSum + (s.actualWeight || 0) * (s.actualReps || 0) : setSum
        }, 0)
      )
    }, 0)
  }, [exercises])

  // Progression %
  const progressionPercent = useMemo(() => {
    const prescribedVolume = exercises.reduce((sum, ex) => {
      return sum + ex.target.sets * ex.target.reps * ex.target.weight
    }, 0)
    return prescribedVolume > 0 ? (totalLoad / prescribedVolume) * 100 : 0
  }, [exercises, totalLoad])

  // Avg RPE
  const avgRpe = useMemo(() => {
    const doneSets = exercises.flatMap((e) => e.sets).filter((s) => s.completed && s.actualRpe)
    if (doneSets.length === 0) return 0
    return doneSets.reduce((sum, s) => sum + (s.actualRpe || 0), 0) / doneSets.length
  }, [exercises])

  // Exercise summary for WorkoutSummary
  const exerciseSummary = useMemo(() => {
    return exercises.map((ex) => ({
      name: ex.name,
      setsCompleted: ex.sets.filter((s) => s.completed).length,
      totalSets: ex.sets.length,
      volume: ex.sets.reduce(
        (sum, s) => (s.completed ? sum + (s.actualWeight || 0) * (s.actualReps || 0) : sum),
        0
      ),
    }))
  }, [exercises])

  // Show launcher on mount if no active session
  useEffect(() => {
    const timer = setTimeout(() => setShowLauncher(true), 500)
    return () => clearTimeout(timer)
  }, [])

  // Handle exercise set updates
  const handleExerciseUpdate = useCallback(
    (exerciseId: string, sets: SetData[]) => {
      updateExerciseSets(exerciseId, sets)
    },
    [updateExerciseSets]
  )

  // Finish workout
  const handleFinish = useCallback(() => {
    const result = finishSession()

    const sessionLog = {
      id: `ws_${Date.now()}`,
      clientId: clientId || 'demo-client',
      programId: String(programId || 'demo'),
      programName: sessionInfo.programName,
      dayNumber,
      weekNumber: sessionInfo.weekNumber,
      date: new Date().toISOString(),
      durationSeconds: result.durationSeconds,
      exercises: exercises.map((ex) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        notation: ex.notation,
        sets: ex.sets.map((s) => ({
          setNumber: s.setNumber,
          prescribedSets: ex.target.sets,
          prescribedReps: String(ex.target.reps),
          prescribedLoad: ex.target.weight,
          prescribedRpe: ex.target.rpe,
          actualLoad: s.actualWeight,
          actualReps: s.actualReps,
          actualRpe: s.actualRpe,
          completed: s.completed,
        })),
      })),
    }

    addWorkoutSession(sessionLog)

    // Persist to Supabase
    saveWorkoutSessionLog(sessionLog).catch(() => {})

    // Build share card
    const topSet = sessionLog.exercises
      .flatMap((ex) => ex.sets.map((s) => ({ ...s, exerciseName: ex.exerciseName })))
      .filter((s) => s.completed && s.actualLoad != null && s.actualReps != null)
      .sort((a, b) => (b.actualLoad || 0) - (a.actualLoad || 0))[0]

    const shareData: WorkoutShareCardData = {
      workoutName: sessionLog.programName,
      clientName: client?.name || sessionInfo.clientName || 'You',
      resultLabel: topSet
        ? `${topSet.actualLoad} kg × ${topSet.actualReps}`
        : `${completedSets}/${totalSets} sets`,
      resultType: topSet ? 'load' : 'reps',
      duration: elapsedFormatted,
      date: new Date().toLocaleDateString(),
      prBadges: [],
      isRx: true,
    }
    setShareCardData(shareData)

    // Detect PRs
    const allHistory = Object.values(workoutSessions)
    const records = detectPersonalRecords(sessionLog, allHistory)
    if (records.length > 0) {
      setPrRecords(records)
      setShareCardData((prev) =>
        prev
          ? {
              ...prev,
              prBadges: records.map(
                (r) => `${r.exerciseName} ${r.metric === 'load' ? 'Load' : 'Volume'} PR`
              ),
            }
          : prev
      )
      setShowPrModal(true)
    } else {
      setShowSummary(true)
    }

    // Save leaderboard
    saveWorkoutResult({
      client_id: sessionLog.clientId,
      program_id: Number(sessionLog.programId) || 0,
      day_number: sessionLog.dayNumber,
      week_number: sessionLog.weekNumber,
      result_value: topSet ? topSet.actualLoad || 0 : completedSets,
      result_type: (topSet ? 'load' : 'reps') as 'load' | 'reps' | 'time' | 'rounds',
      result_label: topSet
        ? `${topSet.actualLoad} kg × ${topSet.actualReps}`
        : `${completedSets}/${totalSets} sets`,
      is_rx: true,
      duration_seconds: sessionLog.durationSeconds,
      completed_sets: completedSets,
      total_sets: totalSets,
      pr_badges: records.map((r) => `${r.exerciseName} ${r.metric === 'load' ? 'Load' : 'Volume'} PR`),
      likes: 0,
      liked_by: [] as string[],
      date: new Date().toISOString().split('T')[0],
    }).catch(() => {})
  }, [
    finishSession,
    clientId,
    programId,
    sessionInfo,
    dayNumber,
    exercises,
    addWorkoutSession,
    client?.name,
    completedSets,
    totalSets,
    elapsedFormatted,
    workoutSessions,
  ])

  // Handle PR modal close → show summary
  const handlePrModalClose = useCallback(() => {
    setShowPrModal(false)
    setShowSummary(true)
  }, [])

  // Handle summary done
  const handleSummaryDone = useCallback(() => {
    setShowSummary(false)
    navigate('/dashboard')
  }, [navigate])

  // Launcher exercises
  const launcherExercises = useMemo(
    () =>
      exercises.map((ex) => ({
        order: ex.notation,
        name: ex.name,
      })),
    [exercises]
  )

  if (isLoading) {
    return (
      <div className="min-h-[calc(100dvh-64px)] bg-light-surface flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyan border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-light-surface pb-24">
      {/* Sticky Header */}
      <StickyHeader
        programName={sessionInfo.programName}
        phaseName={sessionInfo.phase}
        clientName={client?.name || sessionInfo.clientName}
        elapsedSeconds={elapsedSeconds}
        onPause={() => setIsPaused(!isPaused)}
        onCancel={() => navigate('/dashboard')}
      />

      {/* Stats Bar */}
      <StatsBar
        totalLoad={totalLoad}
        progressionPercent={progressionPercent}
        setsCompleted={completedSets}
        setsTotal={totalSets}
        exerciseCount={exercises.length}
        elapsedSeconds={elapsedSeconds}
      />

      {/* Exercise Blocks */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {exercises.map((ex) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ExerciseBlock
                exercise={ex}
                onUpdateSets={(sets) => handleExerciseUpdate(ex.id, sets)}
                restTimerDuration={ex.sets[0]?.targetRpe ? 60 : 90}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Bar */}
      <BottomBar
        elapsedSeconds={elapsedSeconds}
        totalLoad={totalLoad}
        progressionPercent={progressionPercent}
        setsCompleted={completedSets}
        onFinish={handleFinish}
        canFinish={completedSets > 0}
      />

      {/* Session Launcher */}
      <SessionLauncher
        isOpen={showLauncher}
        onClose={() => setShowLauncher(false)}
        onStart={() => setShowLauncher(false)}
        programName={sessionInfo.programName}
        phaseName={sessionInfo.phase || 'Current Phase'}
        sessionName={`Day ${sessionInfo.dayNumber}`}
        focus={sessionInfo.programName}
        method="Straight Sets"
        exercises={launcherExercises}
        estimatedDuration={45}
      />

      {/* Rest Timer Overlay */}
      <RestTimerOverlay
        isOpen={showRestTimer}
        duration={restTimerConfig.duration}
        nextExercise={restTimerConfig.nextExercise}
        nextSetNumber={restTimerConfig.nextSetNumber}
        onComplete={() => setShowRestTimer(false)}
        onAddTime={(s) =>
          setRestTimerConfig((prev) => ({ ...prev, duration: prev.duration + s }))
        }
        onSkip={() => setShowRestTimer(false)}
      />

      {/* Workout Summary */}
      <WorkoutSummary
        isOpen={showSummary}
        duration={elapsedFormatted}
        totalVolume={totalLoad}
        setsCompleted={completedSets}
        setsTotal={totalSets}
        avgRpe={avgRpe}
        exercises={exerciseSummary}
        onDone={handleSummaryDone}
        onClose={() => setShowSummary(false)}
      />

      {/* PR Celebration */}
      <PRCelebrationModal
        records={prRecords}
        open={showPrModal}
        onClose={handlePrModalClose}
      />

      {/* Share Card */}
      {shareCardData && (
        <WorkoutShareCard
          data={shareCardData}
          open={showShareCard}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </div>
  )
}


