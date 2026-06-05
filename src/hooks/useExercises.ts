import { useQuery } from '@tanstack/react-query'
import { searchExercises, getExerciseById } from '../services/workoutApi'
import type { ExerciseFilters } from '../types/workout'

export function useExercises(query: string, filters?: ExerciseFilters) {
  return useQuery({
    queryKey: ['exercises', query, filters],
    queryFn: () => searchExercises(query, filters),
    enabled: query.length >= 0, // Always fetch, but debounce at component level
  })
}

export function useExercise(exerciseId: number | null) {
  return useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => getExerciseById(exerciseId!),
    enabled: !!exerciseId,
  })
}
