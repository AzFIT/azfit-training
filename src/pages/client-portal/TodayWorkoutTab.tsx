import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, CheckCircle2, Circle, Play, Clock, Calendar, Zap } from 'lucide-react'
import { useAppDataStore } from '../../stores/useAppDataStore'
import type { WorkoutSessionLog } from '../../types/entities'

interface TodayWorkoutTabProps {
  clientId: string
}

export default function TodayWorkoutTab({ clientId }: TodayWorkoutTabProps) {
  const [started, setStarted] = useState(false)
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())

  const assignments = useAppDataStore((s) => s.assignments)
  const programs = useAppDataStore((s) => s.programs)
  const workoutSessions = useAppDataStore((s) => s.workoutSessions)
  const exercises = useAppDataStore((s) => s.exercises)

  const today = new Date().toISOString().split('T')[0]
  const dayOfWeek = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.

  // Find active assignment for this client
  const activeAssignment = useMemo(() => {
    return Object.values(assignments).find(
      (a) => a.clientId === clientId && a.status === 'active'
    )
  }, [assignments, clientId])

  const activeProgram = useMemo(() => {
    if (!activeAssignment) return undefined
    return programs[activeAssignment.programId]
  }, [programs, activeAssignment])

  // Check if there's a workout scheduled for today
  // For demo: use day of week to determine if it's a workout day
  const isWorkoutDay = useMemo(() => {
    if (!activeProgram) return false
    // Rest on Sunday, workout other days (simplified logic)
    return dayOfWeek !== 0
  }, [activeProgram, dayOfWeek])

  // Get today's workout from history or generate from program
  const todayWorkout = useMemo(() => {
    // Check if already logged today
    const loggedToday = Object.values(workoutSessions).find(
      (ws) => ws.clientId === clientId && ws.date === today
    )
    if (loggedToday) return loggedToday

    if (!activeProgram || !isWorkoutDay) return undefined

    // Generate a demo workout for today based on program
    const demoExercises = Object.values(exercises).slice(0, 5)
    const workout: WorkoutSessionLog = {
      id: `today-${clientId}`,
      clientId,
      programId: activeProgram.id,
      programName: activeProgram.name,
      dayNumber: activeAssignment?.currentDay ?? 1,
      weekNumber: activeAssignment?.currentWeek ?? 1,
      date: today,
      durationSeconds: 0,
      exercises: demoExercises.map((ex, i) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        notation: `${3 + (i % 2)} x ${8 + (i % 4)}`,
        sets: Array.from({ length: 3 + (i % 2) }, (_, si) => ({
          setNumber: si + 1,
          prescribedSets: 3 + (i % 2),
          prescribedReps: `${8 + (i % 4)}`,
          prescribedLoad: 40 + i * 10,
          completed: false,
        })),
      })),
      notes: '',
    }
    return workout
  }, [workoutSessions, clientId, today, activeProgram, isWorkoutDay, activeAssignment, exercises])

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises((prev) => {
      const next = new Set(prev)
      if (next.has(exerciseId)) {
        next.delete(exerciseId)
      } else {
        next.add(exerciseId)
      }
      return next
    })
  }

  const allCompleted = todayWorkout
    ? todayWorkout.exercises.every((ex) => completedExercises.has(ex.exerciseId))
    : false

  const completionPercent = todayWorkout
    ? Math.round((completedExercises.size / todayWorkout.exercises.length) * 100)
    : 0

  // Rest day card
  if (!isWorkoutDay || !todayWorkout) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-az-black-card border border-dark-border rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-dark-hover flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-cyan" />
          </div>
          <h2 className="text-xl font-semibold text-dark-primary mb-2">Rest Day</h2>
          <p className="text-dark-secondary mb-6">
            No workout scheduled for today. Take time to recover — your muscles grow during rest.
          </p>
          {activeProgram && (
            <div className="bg-az-black rounded-xl p-4 border border-dark-border">
              <p className="text-sm text-dark-muted mb-1">Active Program</p>
              <p className="text-lg font-semibold text-dark-primary">{activeProgram.name}</p>
              <p className="text-sm text-dark-secondary mt-1">
                Week {activeAssignment?.currentWeek ?? 1}, Day {activeAssignment?.currentDay ?? 1}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-az-black-card border border-dark-border rounded-2xl p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell size={18} className="text-cyan" />
              <span className="text-sm font-medium text-cyan">Today&apos;s Workout</span>
            </div>
            <h2 className="text-xl font-semibold text-dark-primary">{todayWorkout.programName}</h2>
            <p className="text-sm text-dark-secondary mt-1">
              Week {todayWorkout.weekNumber}, Day {todayWorkout.dayNumber} · {todayWorkout.exercises.length} exercises
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan">{completionPercent}%</div>
            <p className="text-xs text-dark-muted">completed</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-dark-hover rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-cyan rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {!started && (
          <button
            onClick={() => setStarted(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <Play size={18} />
            Start Workout
          </button>
        )}

        {started && allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 bg-success/10 border border-success/30 rounded-xl p-4 text-center"
          >
            <Zap size={24} className="text-success mx-auto mb-2" />
            <p className="text-success font-semibold">Workout Complete!</p>
            <p className="text-dark-secondary text-sm mt-1">Great job finishing all exercises.</p>
          </motion.div>
        )}
      </motion.div>

      {/* Exercise List */}
      <div className="space-y-3">
        {todayWorkout.exercises.map((ex, index) => {
          const isCompleted = completedExercises.has(ex.exerciseId)
          return (
            <motion.div
              key={ex.exerciseId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-az-black-card border rounded-xl p-4 transition-all ${
                isCompleted ? 'border-success/30 bg-success/5' : 'border-dark-border'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleExercise(ex.exerciseId)}
                  className="flex-shrink-0"
                  disabled={!started}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={24} className="text-success" />
                  ) : (
                    <Circle
                      size={24}
                      className={started ? 'text-dark-muted hover:text-cyan' : 'text-dark-hover'}
                    />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold ${
                      isCompleted ? 'text-success line-through' : 'text-dark-primary'
                    }`}
                  >
                    {ex.exerciseName}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-dark-secondary">
                    <span className="flex items-center gap-1">
                      <Zap size={12} />
                      {ex.notation}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {ex.sets.length} sets
                    </span>
                  </div>
                </div>

                <div className="text-right text-sm">
                  <p className="text-dark-muted">Load</p>
                  <p className="text-dark-primary font-medium">
                    {ex.sets[0]?.prescribedLoad ?? '-'} kg
                  </p>
                </div>
              </div>

              {/* Sets detail */}
              {started && (
                <div className="mt-3 pl-10 flex gap-2">
                  {ex.sets.map((set) => (
                    <div
                      key={set.setNumber}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium border ${
                        isCompleted
                          ? 'bg-success/20 border-success/40 text-success'
                          : 'bg-dark-hover border-dark-border text-dark-secondary'
                      }`}
                    >
                      {set.prescribedReps}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
