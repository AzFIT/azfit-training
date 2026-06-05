import { useQuery } from '@tanstack/react-query'
import { getReferenceData } from '../services/workoutApi'

export function useReferenceData() {
  return useQuery({
    queryKey: ['reference'],
    queryFn: getReferenceData,
    staleTime: Infinity, // Reference data rarely changes
  })
}
