import { cn } from '../../lib/utils'
import type { Level } from '../../types/workout'

interface LevelPillGroupProps {
  levels: Level[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export default function LevelPillGroup({ levels, selectedId, onSelect }: LevelPillGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {levels.map((level) => {
        const isSelected = selectedId === level.level_id

        return (
          <button
            key={level.level_id}
            onClick={() => onSelect(level.level_id)}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200',
              'border-2',
              isSelected
                ? 'border-[#0EA5E9] bg-[#0EA5E9] text-white shadow-md shadow-sky-200'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
              'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
              isSelected && 'dark:bg-sky-600 dark:border-sky-500 dark:text-white dark:shadow-none'
            )}
          >
            {level.level_name}
          </button>
        )
      })}
    </div>
  )
}
