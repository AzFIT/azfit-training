import { cn } from '../../lib/utils'
import type { Category } from '../../types/workout'
import {
  Scale,
  Dumbbell,
  Zap,
  Flame,
  Wind,
  HeartPulse,
  Activity,
  Trophy,
} from 'lucide-react'

const categoryIcons: Record<number, React.ElementType> = {
  1: Scale,        // Lose Weight
  2: Dumbbell,     // Build Muscle
  3: Zap,          // Strength
  4: Flame,        // Hypertrophy
  5: Wind,         // Endurance
  6: HeartPulse,   // Fat Loss
  7: Activity,     // General Fitness
  8: Trophy,       // Sports Performance
}

interface CategoryGridProps {
  categories: Category[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export default function CategoryGrid({ categories, selectedId, onSelect }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat) => {
        const Icon = categoryIcons[cat.category_id] || Activity
        const isSelected = selectedId === cat.category_id

        return (
          <button
            key={cat.category_id}
            onClick={() => onSelect(cat.category_id)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
              'min-h-[100px]',
              isSelected
                ? 'border-[#0EA5E9] bg-[#0EA5E9]/10 text-[#0EA5E9]'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
              'dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300',
              isSelected && 'dark:border-sky-500 dark:bg-sky-900/20 dark:text-sky-400'
            )}
          >
            <Icon size={24} strokeWidth={1.5} />
            <span className="text-sm font-semibold text-center leading-tight">
              {cat.category_name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
