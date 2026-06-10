import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { saveMealLog, getMealLogs } from '../services/nutritionApi'
import type { DailyLog } from '../components/nutrition/DailyNutritionLog'

export function useMealLogs(clientId: string | undefined, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['meal-logs', clientId, startDate, endDate],
    queryFn: () => getMealLogs(clientId!, startDate, endDate),
    enabled: !!clientId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useSaveMealLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ log, clientId }: { log: DailyLog; clientId: string }) =>
      saveMealLog(log, clientId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['meal-logs', variables.clientId],
      })
    },
  })
}
