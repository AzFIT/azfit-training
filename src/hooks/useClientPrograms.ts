import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assignProgramToClient, getClientPrograms } from '../services/workoutApi'

export function useClientPrograms(clientId: string | null) {
  return useQuery({
    queryKey: ['client-programs', clientId],
    queryFn: () => getClientPrograms(clientId!),
    enabled: !!clientId,
  })
}

export function useAssignProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      clientId,
      programId,
      startDate,
    }: {
      clientId: string
      programId: number
      startDate: string
    }) => assignProgramToClient(clientId, programId, startDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-programs', variables.clientId] })
    },
  })
}
