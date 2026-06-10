import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { saveNutritionPlan, getNutritionPlan } from '../services/nutritionApi'
import type { DailyMealPlan } from '../components/nutrition/mealPlanGenerator'

export function useNutritionPlan(clientId: string | undefined, date: string) {
  return useQuery({
    queryKey: ['nutrition-plan', clientId, date],
    queryFn: () => getNutritionPlan(clientId!, date),
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useSaveNutritionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ plan, clientId }: { plan: DailyMealPlan; clientId: string }) =>
      saveNutritionPlan(plan, clientId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['nutrition-plan', variables.clientId, variables.plan.date],
      })
    },
  })
}
