import { useState } from 'react'
import { X, Users, Check, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useClientList } from '../../stores/useAppDataStore.selectors'
import { useAssignProgram } from '../../hooks/useClientPrograms'
import type { Program } from '../../types/workout'

interface AssignClientModalProps {
  program: Program
  isOpen: boolean
  onClose: () => void
  onAssigned: () => void
}

export default function AssignClientModal({ program, isOpen, onClose, onAssigned }: AssignClientModalProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const clients = useClientList()
  const assignMutation = useAssignProgram()

  if (!isOpen) return null

  const handleAssign = async () => {
    if (!selectedClientId) return
    const today = new Date().toISOString().split('T')[0]
    await assignMutation.mutateAsync({
      clientId: selectedClientId,
      programId: program.program_id,
      startDate: today,
    })
    onAssigned()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Assign Program</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {program.program_name} • {program.duration_weeks} weeks
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Client list */}
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <Users size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No clients found. Enable demo mode to see sample clients.
              </p>
            </div>
          ) : (
            clients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                  selectedClientId === client.id
                    ? 'bg-sky-50 dark:bg-sky-900/20 border-2 border-[cyan]'
                    : 'bg-white dark:bg-slate-800 border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'
                )}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[cyan] to-[indigo] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate">
                    {client.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{client.email}</p>
                </div>
                {selectedClientId === client.id && (
                  <Check size={18} className="text-[cyan] flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handleAssign}
            disabled={!selectedClientId || assignMutation.isPending}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-white transition-all',
              'bg-gradient-to-r from-[cyan] to-[indigo]',
              'hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Assigning...
              </>
            ) : (
              <>Assign to Client</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
