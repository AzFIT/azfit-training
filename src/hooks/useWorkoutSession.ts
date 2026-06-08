/**
 * Workout Session Hook — Manages workout session state
 *
 * Handles: exercise data, set completion, rest timers, session timer
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ExerciseBlockData } from '../components/workout/ExerciseBlock'
import type { SetData } from '../components/workout/SetRow'

export interface WorkoutSessionState {
  exercises: ExerciseBlockData[]
  sessionStartTime: Date
  elapsedSeconds: number
  isActive: boolean
}

export function useWorkoutSession(initialExercises: ExerciseBlockData[]) {
  const [exercises, setExercises] = useState<ExerciseBlockData[]>(initialExercises)
  const [isActive, setIsActive] = useState(true)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const sessionStartRef = useRef(new Date())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Session timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000))
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive])

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const updateExerciseSets = useCallback((exerciseId: string, sets: SetData[]) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, sets } : ex))
    )
  }, [])

  const getCompletedSetsCount = useCallback(() => {
    return exercises.reduce((total, ex) => total + ex.sets.filter((s) => s.completed).length, 0)
  }, [exercises])

  const getTotalSetsCount = useCallback(() => {
    return exercises.reduce((total, ex) => total + ex.sets.length, 0)
  }, [exercises])

  const finishSession = useCallback(() => {
    setIsActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    return {
      exercises,
      durationSeconds: elapsedSeconds,
      completedSets: getCompletedSetsCount(),
      totalSets: getTotalSetsCount(),
    }
  }, [exercises, elapsedSeconds, getCompletedSetsCount, getTotalSetsCount])

  return {
    exercises,
    isActive,
    elapsedSeconds,
    elapsedFormatted: formatElapsed(elapsedSeconds),
    updateExerciseSets,
    getCompletedSetsCount,
    getTotalSetsCount,
    finishSession,
  }
}
