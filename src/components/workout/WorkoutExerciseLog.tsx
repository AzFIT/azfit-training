import { useState, useEffect, useCallback, useRef } from 'react'
import { Check, ChevronDown, ChevronUp, Timer, History } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { ProgramExercise } from '../../types/workout'
import LetterPill from '../program-builder/LetterPill'

interface LoggedSet {
  load?: number
  reps?: number
  rpe?: number
  completed: boolean
}

interface WorkoutExerciseLogProps {
  exercise: ProgramExercise
  notation: string
  onLogSet: (setNumber: number, data: LoggedSet) => void
  loggedSets: Record<number, LoggedSet>
  previousSets?: Record<number, { load: number; reps: number; rpe: number }>
  restSeconds?: number
  onRestStart?: () => void
}

export default function WorkoutExerciseLog({
  exercise,
  notation,
  onLogSet,
  loggedSets,
  previousSets,
  restSeconds = 60,
  onRestStart,
}: WorkoutExerciseLogProps) {
  const [expanded, setExpanded] = useState(true)
  const [restTimer, setRestTimer] = useState(0)
  const [showPrevious, setShowPrevious] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const allCompleted = Array.from({ length: exercise.sets }).every((_, i) => loggedSets[i + 1]?.completed)

  // Rest timer
  const startRest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setRestTimer(restSeconds)
    onRestStart?.()
    timerRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [restSeconds, onRestStart])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleComplete = (setNumber: number, log: LoggedSet) => {
    const newLog = { ...log, completed: !log.completed }
    onLogSet(setNumber, newLog)
    if (!log.completed && newLog.completed) {
      startRest()
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className={cn(
      'bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden transition-colors',
      allCompleted ? 'border-emerald-200 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-700'
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <LetterPill notation={notation} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
            {exercise.exercise_name}
          </p>
          <p className="text-xs text-slate-400">
            Target: {exercise.sets}×{exercise.reps} @ RPE {exercise.rpe_target || '-'} · Rest {restSeconds}s
          </p>
        </div>
        {restTimer > 0 && (
          <div className="flex items-center gap-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-lg">
            <Timer size={12} />
            <span className="text-xs font-mono font-bold">{formatTime(restTimer)}</span>
          </div>
        )}
        {allCompleted && (
          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        )}
        {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {/* Previous session toggle */}
      {previousSets && Object.keys(previousSets).length > 0 && (
        <button
          onClick={() => setShowPrevious(!showPrevious)}
          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors border-t border-slate-100 dark:border-slate-700"
        >
          <History size={12} />
          {showPrevious ? 'Hide' : 'Show'} last session
        </button>
      )}

      {/* Set rows */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {/* Previous session data */}
          {showPrevious && previousSets && (
            <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-700/20 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Last Session</p>
              <div className="flex gap-2">
                {Object.entries(previousSets).map(([setNum, data]) => (
                  <div key={setNum} className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">
                    {setNum}: {data.load}kg × {data.reps} @ RPE{data.rpe}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.from({ length: exercise.sets }).map((_, setIdx) => {
            const setNumber = setIdx + 1
            const log = loggedSets[setNumber] || { completed: false }
            const prev = previousSets?.[setNumber]

            return (
              <div
                key={setNumber}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-xl transition-colors',
                  log.completed
                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                    : 'bg-slate-50 dark:bg-slate-700/30'
                )}
              >
                <span className="text-xs font-bold text-slate-400 w-6">{setNumber}</span>

                <div className="flex flex-col">
                  <input
                    type="number"
                    placeholder={prev ? `${prev.load}` : 'Load'}
                    value={log.load ?? ''}
                    onChange={(e) => onLogSet(setNumber, { ...log, load: parseFloat(e.target.value) || undefined })}
                    className={cn(
                      'w-16 px-2 py-1.5 rounded-lg text-sm text-center',
                      'bg-white dark:bg-slate-800 border',
                      log.completed ? 'border-emerald-200 dark:border-emerald-700' : 'border-slate-200 dark:border-slate-600',
                      'focus:outline-none focus:border-[#0EA5E9]'
                    )}
                  />
                  {prev && log.load !== undefined && (
                    <span className={cn(
                      'text-[9px] text-center',
                      log.load > prev.load ? 'text-emerald-500' : log.load < prev.load ? 'text-red-400' : 'text-slate-400'
                    )}>
                      {log.load > prev.load ? '↑' : log.load < prev.load ? '↓' : '='} {prev.load}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">kg</span>

                <input
                  type="number"
                  placeholder={prev ? `${prev.reps}` : 'Reps'}
                  value={log.reps ?? ''}
                  onChange={(e) => onLogSet(setNumber, { ...log, reps: parseInt(e.target.value) || undefined })}
                  className={cn(
                    'w-14 px-2 py-1.5 rounded-lg text-sm text-center',
                    'bg-white dark:bg-slate-800 border',
                    log.completed ? 'border-emerald-200 dark:border-emerald-700' : 'border-slate-200 dark:border-slate-600',
                    'focus:outline-none focus:border-[#0EA5E9]'
                  )}
                />

                <input
                  type="number"
                  placeholder="RPE"
                  min={1}
                  max={10}
                  step={0.5}
                  value={log.rpe ?? ''}
                  onChange={(e) => onLogSet(setNumber, { ...log, rpe: parseFloat(e.target.value) || undefined })}
                  className={cn(
                    'w-14 px-2 py-1.5 rounded-lg text-sm text-center',
                    'bg-white dark:bg-slate-800 border',
                    log.completed ? 'border-emerald-200 dark:border-emerald-700' : 'border-slate-200 dark:border-slate-600',
                    'focus:outline-none focus:border-[#0EA5E9]'
                  )}
                />

                <button
                  onClick={() => handleComplete(setNumber, log)}
                  className={cn(
                    'ml-auto w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                    log.completed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-400 hover:bg-slate-300'
                  )}
                >
                  <Check size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
