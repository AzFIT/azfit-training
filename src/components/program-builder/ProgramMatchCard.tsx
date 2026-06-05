import { cn } from '../../lib/utils'
import { Clock, Calendar, BarChart3, ChevronRight } from 'lucide-react'
import type { Program } from '../../types/workout'
import { formatDuration, formatDaysPerWeek } from '../../utils/dateUtils'

interface ProgramMatchCardProps {
  program: Program
  rank: number
  isTopMatch?: boolean
  onClick: () => void
}

export default function ProgramMatchCard({ program, rank, isTopMatch, onClick }: ProgramMatchCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200',
        'bg-white hover:shadow-md',
        isTopMatch
          ? 'border-[#0EA5E9] shadow-sm'
          : 'border-slate-200 hover:border-slate-300',
        'dark:bg-slate-800/50 dark:border-slate-700',
        isTopMatch && 'dark:border-sky-500'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Rank badge */}
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
            isTopMatch
              ? 'bg-[#0EA5E9] text-white'
              : 'bg-slate-100 text-slate-500',
            'dark:bg-slate-700 dark:text-slate-300',
            isTopMatch && 'dark:bg-sky-600'
          )}
        >
          {rank}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
            {program.program_name}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDuration(program.duration_weeks)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDaysPerWeek(program.days_per_week)}
            </span>
            {program.training_split && (
              <span>{program.training_split}</span>
            )}
            {program.periodization_phase && (
              <span>{program.periodization_phase}</span>
            )}
          </div>

          {/* Difficulty meter */}
          <div className="flex items-center gap-2 mt-2">
            <BarChart3 size={12} className="text-slate-400" />
            <div className="flex gap-0.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-3 h-1.5 rounded-full',
                    i < program.difficulty_rating
                      ? 'bg-[#0EA5E9]'
                      : 'bg-slate-200 dark:bg-slate-600'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400">
              {program.difficulty_rating}/10
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight size={18} className="text-slate-300 dark:text-slate-500 flex-shrink-0 mt-1" />
      </div>
    </button>
  )
}
