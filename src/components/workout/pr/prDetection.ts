import type { WorkoutSessionLog, WorkoutSet } from '../../../types/entities'

export interface PersonalRecord {
  exerciseId: string
  exerciseName: string
  metric: 'volume' | 'load'
  previousBest: number
  newBest: number
  unit: string
  set: WorkoutSet
}

function getBestSetVolume(sets: WorkoutSet[]): number {
  return Math.max(
    0,
    ...sets
      .filter((s) => s.completed && s.actualLoad != null && s.actualReps != null)
      .map((s) => (s.actualLoad || 0) * (s.actualReps || 0))
  )
}

function getBestSetLoad(sets: WorkoutSet[]): number {
  return Math.max(
    0,
    ...sets
      .filter((s) => s.completed && s.actualLoad != null)
      .map((s) => s.actualLoad || 0)
  )
}

export function detectPersonalRecords(
  current: WorkoutSessionLog,
  history: WorkoutSessionLog[],
  clientId?: string
): PersonalRecord[] {
  const targetClientId = clientId || current.clientId
  const records: PersonalRecord[] = []

  for (const ex of current.exercises) {
    const completedSets = ex.sets.filter(
      (s) => s.completed && s.actualLoad != null && s.actualReps != null
    )
    if (completedSets.length === 0) continue

    const historical = history.filter(
      (h) =>
        h.id !== current.id &&
        h.clientId === targetClientId &&
        h.exercises.some((e) => e.exerciseId === ex.exerciseId)
    )

    const historicalSets = historical.flatMap((h) =>
      h.exercises
        .filter((e) => e.exerciseId === ex.exerciseId)
        .flatMap((e) => e.sets)
    )

    const prevBestVolume = getBestSetVolume(historicalSets)
    const newBestVolume = getBestSetVolume(completedSets)

    if (newBestVolume > 0 && newBestVolume > prevBestVolume) {
      const bestSet =
        completedSets.find(
          (s) => (s.actualLoad || 0) * (s.actualReps || 0) === newBestVolume
        ) || completedSets[0]
      records.push({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        metric: 'volume',
        previousBest: prevBestVolume,
        newBest: newBestVolume,
        unit: 'kg',
        set: bestSet,
      })
    }

    const prevBestLoad = getBestSetLoad(historicalSets)
    const newBestLoad = getBestSetLoad(completedSets)

    if (newBestLoad > 0 && newBestLoad > prevBestLoad) {
      const bestSet =
        completedSets.find((s) => (s.actualLoad || 0) === newBestLoad) ||
        completedSets[0]
      records.push({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        metric: 'load',
        previousBest: prevBestLoad,
        newBest: newBestLoad,
        unit: 'kg',
        set: bestSet,
      })
    }
  }

  // De-duplicate: prefer volume PR if both exist for same exercise
  const byExercise = new Map<string, PersonalRecord[]>()
  for (const r of records) {
    const list = byExercise.get(r.exerciseId) || []
    list.push(r)
    byExercise.set(r.exerciseId, list)
  }

  const deduped: PersonalRecord[] = []
  for (const list of byExercise.values()) {
    const volume = list.find((r) => r.metric === 'volume')
    const load = list.find((r) => r.metric === 'load')
    if (volume) deduped.push(volume)
    else if (load) deduped.push(load)
  }

  return deduped
}
