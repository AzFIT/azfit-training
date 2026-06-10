import { cn } from '../../../lib/utils'
import type { BuilderSession } from '../../../types/program-builder-v2'

interface SessionTabsProps {
  sessions: BuilderSession[]
  activeIndex: number
  onChange: (index: number) => void
  className?: string
}

export function SessionTabs({ sessions, activeIndex, onChange, className }: SessionTabsProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2 scrollbar-thin', className)}>
      {sessions.map((session, idx) => {
        const isActive = idx === activeIndex
        const exerciseCount = session.exercises.length
        const setCount = session.exercises.reduce((sum, e) => sum + e.sets, 0)

        return (
          <button
            key={session.sessionNumber}
            onClick={() => onChange(idx)}
            className={cn(
              'flex flex-col items-start min-w-[140px] max-w-[160px] px-3 py-2.5 rounded-xl border transition-all duration-200 text-left',
              isActive
                ? 'bg-primary/5 border-primary shadow-sm'
                : 'bg-card border-border hover:border-primary/30 hover:bg-muted/30'
            )}
          >
            <span
              className={cn(
                'text-xs font-semibold',
                isActive ? 'text-primary' : 'text-light-primary'
              )}
            >
              S{session.sessionNumber}
            </span>
            <span className="text-[11px] text-muted-foreground truncate w-full">
              {session.sessionName}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {exerciseCount} ex · {setCount} sets
            </span>
          </button>
        )
      })}
    </div>
  )
}
