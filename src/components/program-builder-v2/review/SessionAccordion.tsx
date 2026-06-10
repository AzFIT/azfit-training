import { useState } from 'react'
import { ChevronDown, Dumbbell, Hash, Clock } from 'lucide-react'
import { cn } from '../../../lib/utils'
import type { BuilderSession } from '../../../types/program-builder-v2'
import { MotionCategoryBadge } from '../shared/MotionCategoryBadge'

interface SessionAccordionProps {
  sessions: BuilderSession[]
  className?: string
}

export function SessionAccordion({ sessions, className }: SessionAccordionProps) {
  const [openSessions, setOpenSessions] = useState<Set<number>>(new Set([1]))

  const toggle = (sessionNumber: number) => {
    const next = new Set(openSessions)
    if (next.has(sessionNumber)) {
      next.delete(sessionNumber)
    } else {
      next.add(sessionNumber)
    }
    setOpenSessions(next)
  }

  return (
    <div className={cn('rounded-xl border bg-card overflow-hidden', className)}>
      <div className="px-4 py-3 border-b bg-muted/50">
        <h3 className="text-sm font-semibold text-light-primary">Session Breakdown</h3>
        <p className="text-xs text-muted-foreground">
          {sessions.length} sessions · Expand to review exercises
        </p>
      </div>

      <div className="divide-y">
        {sessions.map((session) => {
          const isOpen = openSessions.has(session.sessionNumber)
          const exerciseCount = session.exercises.length
          const totalSets = session.exercises.reduce((sum, e) => sum + e.sets, 0)
          const totalTUT = session.exercises.reduce((sum, e) => sum + (e.tut || 0), 0)

          return (
            <div key={session.sessionNumber}>
              <button
                onClick={() => toggle(session.sessionNumber)}
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">S{session.sessionNumber}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-light-primary">
                      {session.sessionName}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Dumbbell size={10} />
                        {exerciseCount} exercises
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash size={10} />
                        {totalSets} sets
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {totalTUT}s TUT
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={cn(
                    'text-muted-foreground transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-2">
                  {session.exercises.map((ex) => (
                    <div
                      key={ex.orderNotation}
                      className={cn(
                        'flex items-start gap-3 p-2.5 rounded-lg border bg-background',
                        ex.isSubstituted && 'border-amber-300/50 bg-amber-50/20 dark:bg-amber-950/10',
                        ex.isModified && 'border-blue-300/50 bg-blue-50/20 dark:bg-blue-950/10'
                      )}
                    >
                      <span className="text-xs font-bold text-primary min-w-[24px]">
                        {ex.orderNotation}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-light-primary">
                            {ex.exerciseName}
                          </span>
                          {ex.motionCategory && <MotionCategoryBadge category={ex.motionCategory} />}
                          {ex.isSubstituted && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                              Swapped
                            </span>
                          )}
                          {ex.isModified && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              Edited
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span className="font-medium text-light-primary">{ex.sets} sets</span>
                          <span>×</span>
                          <span className="font-medium text-light-primary">{ex.reps} reps</span>
                          <span className="text-border">|</span>
                          <span>Tempo {ex.tempo}</span>
                          {ex.tut && (
                            <>
                              <span className="text-border">|</span>
                              <span>TUT {ex.tut}s</span>
                            </>
                          )}
                          <span className="text-border">|</span>
                          <span>Rest {ex.restDisplay}</span>
                        </div>
                        {ex.notes && (
                          <p className="text-xs text-muted-foreground italic mt-1">{ex.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {session.exercises.length === 0 && (
                    <p className="text-sm text-muted-foreground italic py-2">
                      No exercises in this session.
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
