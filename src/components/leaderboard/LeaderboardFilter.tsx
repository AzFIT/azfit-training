import { Filter } from 'lucide-react'
import type { LeaderboardFilterState } from './types'

interface LeaderboardFilterProps {
  filters: LeaderboardFilterState
  onChange: (filters: LeaderboardFilterState) => void
}

const rxOptions: { value: LeaderboardFilterState['rxOnly']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'rx', label: 'Rx Only' },
  { value: 'scaled', label: 'Scaled Only' },
]

const genderOptions: { value: LeaderboardFilterState['gender']; label: string }[] = [
  { value: 'all', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const dateOptions: { value: LeaderboardFilterState['dateRange']; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
]

export default function LeaderboardFilter({ filters, onChange }: LeaderboardFilterProps) {
  const update = <K extends keyof LeaderboardFilterState>(key: K, value: LeaderboardFilterState[K]) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-az-black-card border border-dark-border rounded-2xl">
      <div className="flex items-center gap-2 text-dark-secondary">
        <Filter size={16} />
        <span className="text-sm font-medium">Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        {rxOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => update('rxOnly', opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filters.rxOnly === opt.value
                ? 'bg-cyan text-white'
                : 'bg-dark-surface text-dark-secondary hover:bg-dark-hover'
            }`}
          >
            {opt.label}
          </button>
        ))}

        <div className="w-px h-5 bg-dark-border hidden sm:block" />

        <select
          value={filters.gender}
          onChange={(e) => update('gender', e.target.value as LeaderboardFilterState['gender'])}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-surface text-dark-secondary border border-dark-border focus:outline-none focus:ring-2 focus:ring-cyan/30"
        >
          {genderOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.dateRange}
          onChange={(e) => update('dateRange', e.target.value as LeaderboardFilterState['dateRange'])}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-surface text-dark-secondary border border-dark-border focus:outline-none focus:ring-2 focus:ring-cyan/30"
        >
          {dateOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
