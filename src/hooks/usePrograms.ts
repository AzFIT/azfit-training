import { useQuery } from '@tanstack/react-query'
import { getPrograms, getProgramById, getProgramWithExercises } from '../services/workoutApi'
import type { ProgramFilters } from '../types/workout'

export function usePrograms(filters?: ProgramFilters) {
  return useQuery({
    queryKey: ['programs', filters],
    queryFn: () => getPrograms(filters),
  })
}

export function useProgram(programId: number | null) {
  return useQuery({
    queryKey: ['program', programId],
    queryFn: () => getProgramById(programId!),
    enabled: !!programId,
  })
}

export function useProgramDetails(programId: number | null) {
  return useQuery({
    queryKey: ['program-details', programId],
    queryFn: () => getProgramWithExercises(programId!),
    enabled: !!programId,
  })
}
