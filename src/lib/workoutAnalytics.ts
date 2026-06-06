import type { WorkoutSessionLog } from '../types/entities'

export interface ExerciseSetRecord {
  sessionId: string
  date: string
  programName: string
  dayNumber: number
  weekNumber: number
  exerciseId: string
  exerciseName: string
  setNumber: number
  load: number
  reps: number
  rpe: number
  volume: number
  estimated1RM: number
}

export interface ExerciseHistory {
  exerciseId: string
  exerciseName: string
  records: ExerciseSetRecord[]
  prLoad: number
  prReps: number
  prVolume: number
  bestEstimated1RM: number
  sessionsCount: number
  totalSets: number
  lastDate: string
  lastLoad: number
  lastReps: number
}

export interface ProgressiveOverloadSuggestion {
  exerciseId: string
  exerciseName: string
  lastLoad: number
  lastReps: number
  lastRpe: number
  suggestedLoad: number
  suggestedReps: number
  reason: string
}

// Epley formula: 1RM = weight * (1 + reps / 30)
export function estimate1RM(load: number, reps: number): number {
  if (load <= 0 || reps <= 0) return 0
  return Math.round(load * (1 + reps / 30))
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

export function getSessionsByClient(
  sessions: Record<string, WorkoutSessionLog>,
  clientId: string
): WorkoutSessionLog[] {
  return Object.values(sessions)
    .filter((s) => s.clientId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getSessionVolume(session: WorkoutSessionLog): number {
  return session.exercises.reduce((total, ex) => {
    return (
      total +
      ex.sets.reduce((exTotal, set) => {
        if (set.completed && set.actualLoad && set.actualReps) {
          return exTotal + set.actualLoad * set.actualReps
        }
        return exTotal
      }, 0)
    )
  }, 0)
}

export function getSessionCompletedSets(session: WorkoutSessionLog): number {
  return session.exercises.reduce((total, ex) => {
    return total + ex.sets.filter((s) => s.completed && s.actualLoad && s.actualReps).length
  }, 0)
}

export function getSessionTotalSets(session: WorkoutSessionLog): number {
  return session.exercises.reduce((total, ex) => total + ex.sets.length, 0)
}

export function getExerciseHistory(
  sessions: Record<string, WorkoutSessionLog>,
  clientId: string,
  exerciseId: string
): ExerciseHistory | null {
  const clientSessions = getSessionsByClient(sessions, clientId).filter((s) =>
    s.exercises.some((e) => e.exerciseId === exerciseId)
  )

  if (clientSessions.length === 0) return null

  const records: ExerciseSetRecord[] = []
  let prLoad = 0
  let prReps = 0
  let prVolume = 0
  let bestEstimated1RM = 0
  let totalSets = 0

  for (const session of clientSessions) {
    const exercise = session.exercises.find((e) => e.exerciseId === exerciseId)
    if (!exercise) continue

    for (const set of exercise.sets) {
      totalSets++
      if (!set.completed || !set.actualLoad || !set.actualReps) continue

      const volume = set.actualLoad * set.actualReps
      const estimated = estimate1RM(set.actualLoad, set.actualReps)

      records.push({
        sessionId: session.id,
        date: session.date,
        programName: session.programName,
        dayNumber: session.dayNumber,
        weekNumber: session.weekNumber,
        exerciseId,
        exerciseName: exercise.exerciseName,
        setNumber: set.setNumber,
        load: set.actualLoad,
        reps: set.actualReps,
        rpe: set.actualRpe || 0,
        volume,
        estimated1RM: estimated,
      })

      if (set.actualLoad > prLoad) prLoad = set.actualLoad
      if (set.actualReps > prReps) prReps = set.actualReps
      if (volume > prVolume) prVolume = volume
      if (estimated > bestEstimated1RM) bestEstimated1RM = estimated
    }
  }

  records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const last = records[records.length - 1]

  return {
    exerciseId,
    exerciseName: last?.exerciseName || '',
    records,
    prLoad,
    prReps,
    prVolume,
    bestEstimated1RM,
    sessionsCount: clientSessions.length,
    totalSets,
    lastDate: last?.date || '',
    lastLoad: last?.load || 0,
    lastReps: last?.reps || 0,
  }
}

export function getAllExerciseHistories(
  sessions: Record<string, WorkoutSessionLog>,
  clientId: string
): ExerciseHistory[] {
  const exerciseIds = new Set<string>()
  getSessionsByClient(sessions, clientId).forEach((s) => {
    s.exercises.forEach((e) => exerciseIds.add(e.exerciseId))
  })

  const histories: ExerciseHistory[] = []
  for (const id of exerciseIds) {
    const h = getExerciseHistory(sessions, clientId, id)
    if (h) histories.push(h)
  }

  return histories.sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime())
}

export function getProgressiveOverloadSuggestion(
  sessions: Record<string, WorkoutSessionLog>,
  clientId: string,
  exerciseId: string
): ProgressiveOverloadSuggestion | null {
  const history = getExerciseHistory(sessions, clientId, exerciseId)
  if (!history || history.records.length === 0) return null

  // Get last 3 sessions' best sets by estimated 1RM
  const sessionsMap = new Map<string, ExerciseSetRecord[]>()
  for (const r of history.records) {
    if (!sessionsMap.has(r.sessionId)) sessionsMap.set(r.sessionId, [])
    sessionsMap.get(r.sessionId)!.push(r)
  }

  const sessionBests = Array.from(sessionsMap.values())
    .map((sets) => sets.reduce((best, s) => (s.estimated1RM > best.estimated1RM ? s : best), sets[0]))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const last = sessionBests[sessionBests.length - 1]
  const previous = sessionBests.length > 1 ? sessionBests[sessionBests.length - 2] : null

  let suggestedLoad = last.load
  let suggestedReps = last.reps
  let reason = 'Maintain current load. Aim for clean form.'

  // Progressive overload rules
  if (last.rpe < 7) {
    // Last set was easy — increase load
    const increment = last.load <= 20 ? 2.5 : last.load <= 50 ? 2.5 : 5
    suggestedLoad = Math.round((last.load + increment) * 10) / 10
    reason = `RPE ${last.rpe} was moderate — increase load by ${increment}kg`
  } else if (last.rpe >= 7 && last.rpe < 9) {
    // Moderate — add a rep at same load
    suggestedReps = last.reps + 1
    reason = `RPE ${last.rpe} was challenging — add 1 rep at same load`
  } else {
    // Hard — maintain or slight deload
    reason = `RPE ${last.rpe} was very hard — maintain load and focus on recovery`
  }

  // If previous session had higher estimated 1RM, suggest matching previous best
  if (previous && previous.estimated1RM > last.estimated1RM) {
    suggestedLoad = previous.load
    suggestedReps = previous.reps
    reason = 'Last session dipped — match your previous best'
  }

  return {
    exerciseId,
    exerciseName: history.exerciseName,
    lastLoad: last.load,
    lastReps: last.reps,
    lastRpe: last.rpe,
    suggestedLoad,
    suggestedReps,
    reason,
  }
}

export function getPRs(
  sessions: Record<string, WorkoutSessionLog>,
  clientId: string
): Array<{
  exerciseId: string
  exerciseName: string
  load: number
  reps: number
  date: string
  estimated1RM: number
  previousBest: number
}> {
  const histories = getAllExerciseHistories(sessions, clientId)
  const prs: ReturnType<typeof getPRs> = []

  for (const h of histories) {
    if (h.records.length === 0 || h.prLoad === 0) continue
    const prRecord = h.records
      .filter((r) => r.load === h.prLoad)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    if (!prRecord) continue

    const previousBest = h.records
      .filter((r) => r.load < h.prLoad)
      .reduce((max, r) => (r.load > max ? r.load : max), 0)

    prs.push({
      exerciseId: h.exerciseId,
      exerciseName: h.exerciseName,
      load: h.prLoad,
      reps: prRecord.reps,
      date: prRecord.date,
      estimated1RM: h.bestEstimated1RM,
      previousBest,
    })
  }

  return prs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
