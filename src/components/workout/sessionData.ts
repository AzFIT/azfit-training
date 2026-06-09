/**
 * Session Data Converter — Bridge program data to workout session UI
 *
 * Converts ProgramWithExercises → ExerciseBlockData[] for the session logger.
 * Handles offline mode by generating synthetic exercises from program metadata.
 */

import type { ProgramWithExercises, ProgramExercise } from '../../types/workout'
import type { ExerciseBlockData } from './ExerciseBlock'
import type { SetData } from './SetRow'
import type { WorkoutSet } from '../../types/entities'
import type { WorkoutSessionLog } from '../../types/entities'
import { computeLetterNotation, isPlainLetter, getBaseLetter } from '../../utils/notation'

// ── Synthetic exercise generators for offline mode ────────────────

interface ExerciseTemplate {
  name: string
  sets: number
  reps: string
  rpe: number
  rest: number
  setTypeId: number
}

const UPPER_EXERCISES: ExerciseTemplate[] = [
  { name: 'Bench Press', sets: 3, reps: '10', rpe: 8, rest: 90, setTypeId: 1 },
  { name: 'Barbell Row', sets: 3, reps: '10', rpe: 8, rest: 90, setTypeId: 2 },
  { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', rpe: 8, rest: 90, setTypeId: 2 },
  { name: 'Lateral Raise', sets: 3, reps: '12', rpe: 9, rest: 60, setTypeId: 2 },
  { name: 'Bicep Curl', sets: 3, reps: '12', rpe: 9, rest: 60, setTypeId: 1 },
  { name: 'Tricep Pushdown', sets: 3, reps: '12', rpe: 9, rest: 60, setTypeId: 1 },
]

const LOWER_EXERCISES: ExerciseTemplate[] = [
  { name: 'Back Squat', sets: 3, reps: '8', rpe: 8, rest: 120, setTypeId: 1 },
  { name: 'Romanian Deadlift', sets: 3, reps: '10', rpe: 8, rest: 120, setTypeId: 1 },
  { name: 'Leg Press', sets: 3, reps: '12', rpe: 9, rest: 90, setTypeId: 1 },
  { name: 'Walking Lunge', sets: 3, reps: '10', rpe: 8, rest: 90, setTypeId: 1 },
  { name: 'Leg Curl', sets: 3, reps: '12', rpe: 9, rest: 60, setTypeId: 1 },
  { name: 'Calf Raise', sets: 4, reps: '15', rpe: 9, rest: 60, setTypeId: 1 },
]

const PUSH_EXERCISES: ExerciseTemplate[] = [
  { name: 'Bench Press', sets: 3, reps: '10', rpe: 8, rest: 90, setTypeId: 1 },
  { name: 'Incline Dumbbell Press', sets: 3, reps: '10', rpe: 8, rest: 90, setTypeId: 1 },
  { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', rpe: 8, rest: 90, setTypeId: 2 },
  { name: 'Lateral Raise', sets: 3, reps: '12', rpe: 9, rest: 60, setTypeId: 2 },
  { name: 'Tricep Dip', sets: 3, reps: '10', rpe: 9, rest: 60, setTypeId: 1 },
  { name: 'Tricep Pushdown', sets: 3, reps: '12', rpe: 9, rest: 60, setTypeId: 1 },
]

const PULL_EXERCISES: ExerciseTemplate[] = [
  { name: 'Barbell Row', sets: 3, reps: '10', rpe: 8, rest: 90, setTypeId: 1 },
  { name: 'Pull-Up', sets: 3, reps: '8', rpe: 8, rest: 90, setTypeId: 1 },
  { name: 'Seated Cable Row', sets: 3, reps: '10', rpe: 8, rest: 90, setTypeId: 1 },
  { name: 'Face Pull', sets: 3, reps: '15', rpe: 9, rest: 60, setTypeId: 1 },
  { name: 'Bicep Curl', sets: 3, reps: '12', rpe: 9, rest: 60, setTypeId: 1 },
  { name: 'Hammer Curl', sets: 3, reps: '12', rpe: 9, rest: 60, setTypeId: 1 },
]

const LEGS_EXERCISES: ExerciseTemplate[] = [
  { name: 'Back Squat', sets: 3, reps: '8', rpe: 8, rest: 120, setTypeId: 1 },
  { name: 'Leg Press', sets: 3, reps: '12', rpe: 9, rest: 90, setTypeId: 1 },
  { name: 'Romanian Deadlift', sets: 3, reps: '10', rpe: 8, rest: 120, setTypeId: 1 },
  { name: 'Leg Extension', sets: 3, reps: '12', rpe: 9, rest: 60, setTypeId: 1 },
  { name: 'Leg Curl', sets: 3, reps: '12', rpe: 9, rest: 60, setTypeId: 1 },
  { name: 'Calf Raise', sets: 4, reps: '15', rpe: 9, rest: 60, setTypeId: 1 },
]

const FULL_BODY_EXERCISES: ExerciseTemplate[] = [
  { name: 'Back Squat', sets: 3, reps: '8', rpe: 8, rest: 120, setTypeId: 1 },
  { name: 'Bench Press', sets: 3, reps: '10', rpe: 8, rest: 90, setTypeId: 1 },
  { name: 'Barbell Row', sets: 3, reps: '10', rpe: 8, rest: 90, setTypeId: 1 },
  { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', rpe: 8, rest: 90, setTypeId: 1 },
  { name: 'Bicep Curl', sets: 3, reps: '12', rpe: 9, rest: 60, setTypeId: 1 },
  { name: 'Plank', sets: 3, reps: '30s', rpe: 7, rest: 60, setTypeId: 1 },
]

function getSyntheticExercises(split: string, dayNumber: number): ProgramExercise[] {
  const normalized = split.toLowerCase().trim()

  let templates: ExerciseTemplate[]
  if (normalized.includes('upper/lower')) {
    templates = dayNumber % 2 === 1 ? UPPER_EXERCISES : LOWER_EXERCISES
  } else if (normalized.includes('push/pull') || normalized.includes('ppl')) {
    const mod = ((dayNumber - 1) % 3) + 1
    if (mod === 1) templates = PUSH_EXERCISES
    else if (mod === 2) templates = PULL_EXERCISES
    else templates = LEGS_EXERCISES
  } else if (normalized.includes('full body')) {
    templates = FULL_BODY_EXERCISES
  } else if (normalized.includes('upper')) {
    templates = UPPER_EXERCISES
  } else if (normalized.includes('lower') || normalized.includes('leg')) {
    templates = LOWER_EXERCISES
  } else {
    // Default: rotate through templates
    const all = [UPPER_EXERCISES, LOWER_EXERCISES, PUSH_EXERCISES]
    templates = all[(dayNumber - 1) % all.length]
  }

  return templates.map((t, idx): ProgramExercise => ({
    program_exercise_id: 1000 + idx,
    program_id: 0,
    day_number: dayNumber,
    exercise_order: idx + 1,
    exercise_id: 1000 + idx,
    set_type_id: t.setTypeId,
    sets: t.sets,
    reps: t.reps,
    rest_seconds: t.rest,
    rpe_target: t.rpe,
    exercise_name: t.name,
    equipment_primary: 'Barbell',
    set_type_name: t.setTypeId === 1 ? 'Straight Set' : 'Superset',
    set_type_code: t.setTypeId === 1 ? 'STRAIGHT' : 'SUPERSET',
  }))
}

// ── Previous session lookup ───────────────────────────────────────

function workoutSetToSetData(s: WorkoutSet, fallbackRpe: number): SetData {
  return {
    setNumber: s.setNumber,
    targetWeight: s.prescribedLoad ?? 0,
    targetReps: parseInt(s.prescribedReps, 10) || 0,
    targetRpe: s.prescribedRpe ?? fallbackRpe,
    actualWeight: s.actualLoad,
    actualReps: s.actualReps,
    actualRpe: s.actualRpe,
    completed: s.completed,
  }
}

function getPreviousSessionData(
  exerciseId: number,
  previousSession: WorkoutSessionLog | null
): ExerciseBlockData['previousSession'] | undefined {
  if (!previousSession) return undefined

  const prevEx = previousSession.exercises.find(
    (e) => e.exerciseId === String(exerciseId)
  )
  if (!prevEx) return undefined

  const completedSets = prevEx.sets.filter((s) => s.completed && s.actualLoad !== undefined)
  if (completedSets.length === 0) return undefined

  return {
    weight: completedSets[0].actualLoad!,
    reps: completedSets.map((s) => s.actualReps ?? 0),
    rpe: completedSets[0].actualRpe ?? prevEx.sets[0]?.prescribedRpe ?? 8,
  }
}

function getPreviousSets(
  exerciseId: number,
  previousSession: WorkoutSessionLog | null
): SetData[] | undefined {
  if (!previousSession) return undefined

  const prevEx = previousSession.exercises.find(
    (e) => e.exerciseId === String(exerciseId)
  )
  if (!prevEx) return undefined

  const fallbackRpe = prevEx.sets[0]?.prescribedRpe ?? 8
  return prevEx.sets.map((s) => workoutSetToSetData(s, fallbackRpe))
}

// ── Main converter ────────────────────────────────────────────────

export interface SessionBuildOptions {
  programData: ProgramWithExercises
  dayNumber: number
  previousSession?: WorkoutSessionLog | null
  clientName?: string
}

export interface SessionInfo {
  programName: string
  clientName: string
  phase: string
  weekNumber: number
  dayNumber: number
  exercises: ExerciseBlockData[]
}

export function buildSessionFromProgram(options: SessionBuildOptions): SessionInfo {
  const { programData, dayNumber, previousSession, clientName } = options
  const { program, days } = programData

  // Find the requested day
  let dayExercises = days.find((d) => d.day_number === dayNumber)?.exercises

  // If offline/empty, generate synthetic exercises
  if (!dayExercises || dayExercises.length === 0) {
    dayExercises = getSyntheticExercises(program.training_split || 'Full Body', dayNumber)
  }

  // Compute CoachRx notation
  const notations = computeLetterNotation(
    dayExercises.map((ex) => ({
      exercise_order: ex.exercise_order,
      set_type_id: ex.set_type_id,
    }))
  )

  // Build ExerciseBlockData
  const exercises: ExerciseBlockData[] = dayExercises.map((ex, idx): ExerciseBlockData => {
    const notation = notations[idx]
    const isPlain = isPlainLetter(notation)

    // Determine superset partner
    let supersetWith: string | undefined
    if (!isPlain) {
      const base = getBaseLetter(notation)
      const partnerIdx = notations.findIndex(
        (n, i) => i !== idx && getBaseLetter(n) === base
      )
      if (partnerIdx !== -1) {
        supersetWith = notations[partnerIdx]
      }
    }

    // Parse reps (handle "8-12" → take max)
    const repsStr = ex.reps || '10'
    const repsNum = parseInt(repsStr.split('-').pop() || '10') || 10

    // Build previous session data
    const previousData = getPreviousSessionData(ex.exercise_id, previousSession || null)
    const previousSets = getPreviousSets(ex.exercise_id, previousSession || null)

    // Determine target weight: previous session + 2.5kg progression, or default
    const targetWeight = previousData ? previousData.weight + 2.5 : 0

    // Build sets
    const sets: SetData[] = Array.from({ length: ex.sets }, (_, i) => ({
      setNumber: i + 1,
      targetWeight,
      targetReps: repsNum,
      targetRpe: ex.rpe_target ?? 8,
      completed: false,
    }))

    return {
      id: `ex-${ex.program_exercise_id || idx}`,
      notation,
      name: ex.exercise_name || `Exercise ${ex.exercise_id}`,
      supersetWith,
      previousSession: previousData,
      previousSets,
      target: {
        weight: targetWeight,
        reps: repsNum,
        sets: ex.sets,
        rpe: ex.rpe_target ?? 8,
      },
      sets,
      videoUrl: undefined,
    }
  })

  return {
    programName: program.program_name,
    clientName: clientName || 'Client',
    phase: program.periodization_phase || 'Foundation',
    weekNumber: 1,
    dayNumber,
    exercises,
  }
}

// ── Fallback demo session (when no program data available) ────────

export function createDemoSessionInfo(): SessionInfo {
  return {
    programName: 'Upper Body A',
    clientName: 'Sarah Chen',
    phase: 'Intensification',
    weekNumber: 6,
    dayNumber: 2,
    exercises: [
      {
        id: 'ex-1',
        notation: 'A1',
        name: 'Bench Press',
        previousSession: { weight: 60, reps: [10, 10, 9], rpe: 8 },
        previousSets: [
          { setNumber: 1, targetWeight: 60, targetReps: 10, targetRpe: 8, completed: true, actualWeight: 60, actualReps: 10, actualRpe: 8 },
          { setNumber: 2, targetWeight: 60, targetReps: 10, targetRpe: 8, completed: true, actualWeight: 60, actualReps: 10, actualRpe: 8 },
          { setNumber: 3, targetWeight: 60, targetReps: 10, targetRpe: 8, completed: true, actualWeight: 60, actualReps: 9, actualRpe: 8 },
        ],
        target: { weight: 62.5, reps: 10, sets: 3, rpe: 8 },
        sets: [
          { setNumber: 1, targetWeight: 62.5, targetReps: 10, targetRpe: 8, completed: true, actualWeight: 62.5, actualReps: 10, actualRpe: 8 },
          { setNumber: 2, targetWeight: 62.5, targetReps: 10, targetRpe: 8, completed: true, actualWeight: 62.5, actualReps: 10, actualRpe: 8 },
          { setNumber: 3, targetWeight: 62.5, targetReps: 10, targetRpe: 8, completed: false },
        ],
        videoUrl: 'https://youtube.com/vthMCtgVtFw',
      },
      {
        id: 'ex-2',
        notation: 'A2',
        name: 'Barbell Row',
        supersetWith: 'A1',
        previousSession: { weight: 55, reps: [10, 10, 10], rpe: 7 },
        previousSets: [
          { setNumber: 1, targetWeight: 55, targetReps: 10, targetRpe: 7, completed: true, actualWeight: 55, actualReps: 10, actualRpe: 7 },
          { setNumber: 2, targetWeight: 55, targetReps: 10, targetRpe: 7, completed: true, actualWeight: 55, actualReps: 10, actualRpe: 7 },
          { setNumber: 3, targetWeight: 55, targetReps: 10, targetRpe: 7, completed: true, actualWeight: 55, actualReps: 10, actualRpe: 7 },
        ],
        target: { weight: 57.5, reps: 10, sets: 3, rpe: 8 },
        sets: [
          { setNumber: 1, targetWeight: 57.5, targetReps: 10, targetRpe: 8, completed: false },
          { setNumber: 2, targetWeight: 57.5, targetReps: 10, targetRpe: 8, completed: false },
          { setNumber: 3, targetWeight: 57.5, targetReps: 10, targetRpe: 8, completed: false },
        ],
      },
      {
        id: 'ex-3',
        notation: 'B1',
        name: 'Dumbbell Shoulder Press',
        previousSession: { weight: 20, reps: [10, 10, 9], rpe: 7 },
        previousSets: [
          { setNumber: 1, targetWeight: 20, targetReps: 10, targetRpe: 7, completed: true, actualWeight: 20, actualReps: 10, actualRpe: 7 },
          { setNumber: 2, targetWeight: 20, targetReps: 10, targetRpe: 7, completed: true, actualWeight: 20, actualReps: 10, actualRpe: 7 },
          { setNumber: 3, targetWeight: 20, targetReps: 10, targetRpe: 7, completed: true, actualWeight: 20, actualReps: 9, actualRpe: 7 },
        ],
        target: { weight: 22.5, reps: 10, sets: 3, rpe: 8 },
        sets: [
          { setNumber: 1, targetWeight: 22.5, targetReps: 10, targetRpe: 8, completed: false },
          { setNumber: 2, targetWeight: 22.5, targetReps: 10, targetRpe: 8, completed: false },
          { setNumber: 3, targetWeight: 22.5, targetReps: 10, targetRpe: 8, completed: false },
        ],
      },
      {
        id: 'ex-4',
        notation: 'B2',
        name: 'Lateral Raise',
        supersetWith: 'B1',
        target: { weight: 12, reps: 12, sets: 3, rpe: 9 },
        sets: [
          { setNumber: 1, targetWeight: 12, targetReps: 12, targetRpe: 9, completed: false },
          { setNumber: 2, targetWeight: 12, targetReps: 12, targetRpe: 9, completed: false },
          { setNumber: 3, targetWeight: 12, targetReps: 12, targetRpe: 9, completed: false },
        ],
      },
    ],
  }
}
