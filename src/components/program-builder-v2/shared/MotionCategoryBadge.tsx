import { cn } from '../../../lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  PRESSING: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  PULLING: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  BILATERAL_QUAD: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  UNILATERAL_QUAD: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  POSTERIOR: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  TARGET_AREAS: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  METCON_BRACING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  BRACING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  BICEPS: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  TRICEPS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  DELT_SCAP_CONTROL: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

interface MotionCategoryBadgeProps {
  category: string
  className?: string
}

export function MotionCategoryBadge({ category, className }: MotionCategoryBadgeProps) {
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide',
        colorClass,
        className
      )}
    >
      {category.replace(/_/g, ' ')}
    </span>
  )
}
