import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logWorkoutSession, logWorkoutSets, getWorkoutHistory } from '../services/workoutApi'
import type { WorkoutSession, WorkoutSetLog } from '../types/workout'

export function useWorkoutHistory(clientId: string, programId?: number) {
  return useQuery({
    queryKey: ['workout-history', clientId, programId],
    queryFn: () => getWorkoutHistory(clientId, programId),
    enabled: !!clientId,
  })
}

export function useLogWorkout() {
  const queryClient = useQueryClient()

  const sessionMutation = useMutation({
    mutationFn: (session: Omit<WorkoutSession, 'session_id'>) => logWorkoutSession(session),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workout-history', variables.client_id] })
    },
  })

  const setsMutation = useMutation({
    mutationFn: (sets: Omit<WorkoutSetLog, 'set_log_id'>[]) => logWorkoutSets(sets),
  })

  return { sessionMutation, setsMutation }
}
