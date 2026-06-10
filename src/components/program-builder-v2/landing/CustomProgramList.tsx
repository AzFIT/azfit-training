import { useNavigate } from 'react-router-dom'
import { FileEdit, ClipboardList, Clock, Plus } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Button } from '../../../components/ui/button'
import type { CustomProgram } from '../../../types/program-builder-v2'

interface CustomProgramListProps {
  programs: CustomProgram[]
  className?: string
}

export function CustomProgramList({ programs, className }: CustomProgramListProps) {
  const navigate = useNavigate()

  if (programs.length === 0) {
    return (
      <div className={cn('rounded-xl border border-dashed p-6 text-center', className)}>
        <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
          <ClipboardList size={18} className="text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium text-light-primary mb-1">No Custom Programs Yet</h3>
        <p className="text-xs text-muted-foreground mb-3 max-w-xs mx-auto">
          Select a phase template above and customize it to create your first custom program.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => navigate('/program-builder/phase/P1-GBC1')}
        >
          <Plus size={13} className="mr-1" />
          Start with GBC Block 1
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {programs.map((program) => (
        <div
          key={program.id}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border bg-card',
            'hover:border-primary/30 transition-colors'
          )}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-light-primary truncate">
                {program.name}
              </span>
              {program.clientName && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {program.clientName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>Based on {program.basedOnPhaseName}</span>
              <span>·</span>
              <span>{program.sessionCount} sessions</span>
              <span>·</span>
              <span>{program.exerciseCount} exercises</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {program.modifiedAt}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => navigate(`/program-builder/phase/${program.basedOnPhaseCode}?edit=${program.id}`)}
            >
              <FileEdit size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => navigate(`/program-builder/review?program=${program.id}`)}
            >
              <ClipboardList size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
