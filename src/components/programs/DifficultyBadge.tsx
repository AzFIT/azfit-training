import { getDifficultyColor } from './utils'

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const diffColor = getDifficultyColor(difficulty)
  const colorMap: Record<string, string> = {
    'text-success': '#22C55E',
    'text-warning': '#EAB308',
    'text-orange': '#F97316',
    'text-danger': '#EF4444',
  }
  const color = colorMap[diffColor.text] || '#64748B'
  return <span className="text-xs font-semibold" style={{ color }}>{difficulty}</span>
}
