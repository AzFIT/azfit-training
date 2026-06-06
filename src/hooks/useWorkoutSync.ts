import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getWorkoutHistory } from '../services/workoutApi'
import { useAppDataStore } from '../stores/useAppDataStore'

export function useSyncWorkoutSessions(clientId: string | undefined) {
  const setWorkoutSessions = useAppDataStore((s) => s.setWorkoutSessions)

  const { data, isSuccess } = useQuery({
    queryKey: ['workout-history', clientId],
    queryFn: () => getWorkoutHistory(clientId!),
    enabled: !!clientId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  useEffect(() => {
    if (isSuccess && data) {
      setWorkoutSessions(data)
    }
  }, [isSuccess, data, setWorkoutSessions])

  return { isLoading: !isSuccess && !!clientId }
}
