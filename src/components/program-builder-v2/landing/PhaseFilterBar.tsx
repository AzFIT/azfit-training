import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Input } from '../../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import type { PhaseFilters } from '../../../types/program-builder-v2'
import { METHOD_OPTIONS, DURATION_OPTIONS, DIFFICULTY_OPTIONS } from '../../../data/azfitPhases'

interface PhaseFilterBarProps {
  filters: PhaseFilters
  onChange: (filters: PhaseFilters) => void
  resultCount: number
  className?: string
}

export function PhaseFilterBar({ filters, onChange, resultCount, className }: PhaseFilterBarProps) {
  const activeCount =
    (filters.method !== 'all' ? 1 : 0) +
    (filters.duration !== 'all' ? 1 : 0) +
    (filters.difficulty !== 'all' ? 1 : 0) +
    (filters.search.trim() ? 1 : 0)

  const update = (partial: Partial<PhaseFilters>) => {
    onChange({ ...filters, ...partial })
  }

  const clearAll = () => {
    onChange({ method: 'all', duration: 'all', difficulty: 'all', search: '' })
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search phases..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-9 h-9 text-sm"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-light-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Method filter */}
        <Select value={filters.method} onValueChange={(v) => update({ method: v as PhaseFilters['method'] })}>
          <SelectTrigger className="w-[170px] h-9 text-xs">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            {METHOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Duration filter */}
        <Select value={filters.duration} onValueChange={(v) => update({ duration: v as PhaseFilters['duration'] })}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Difficulty filter */}
        <Select value={filters.difficulty} onValueChange={(v) => update({ difficulty: v as PhaseFilters['difficulty'] })}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear + count */}
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-light-primary transition-colors"
          >
            <X size={12} />
            Clear ({activeCount})
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal size={12} />
          <span>{resultCount} phase{resultCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}
