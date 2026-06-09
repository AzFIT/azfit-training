import { Dumbbell, Plus } from 'lucide-react'
import { Button } from '../../../components/ui/button'

interface EmptySessionStateProps {
  onAdd: () => void
}

export function EmptySessionState({ onAdd }: EmptySessionStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed bg-muted/30">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Dumbbell size={20} className="text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-[light-primary] mb-1">
        No exercises in this session
      </h3>
      <p className="text-xs text-muted-foreground mb-3 max-w-xs text-center">
        Add exercises to build out this session. You can swap or edit them anytime.
      </p>
      <Button variant="outline" size="sm" className="text-xs" onClick={onAdd}>
        <Plus size={13} className="mr-1" />
        Add Exercise
      </Button>
    </div>
  )
}
