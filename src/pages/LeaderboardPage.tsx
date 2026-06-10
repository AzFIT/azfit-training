import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Dumbbell, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LeaderboardFilter from '../components/leaderboard/LeaderboardFilter'
import LeaderboardRow from '../components/leaderboard/LeaderboardRow'
import { mockLeaderboardEntries, MOCK_WORKOUT_NAME, MOCK_PROGRAM_ID } from '../components/leaderboard/mockData'
import type { LeaderboardFilterState, LeaderboardEntry } from '../components/leaderboard/types'

const CURRENT_CLIENT_ID = 'c-current'

function isWithinDateRange(date: string, range: LeaderboardFilterState['dateRange']): boolean {
  if (range === 'all') return true
  const entryDate = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - entryDate.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  if (range === 'week') return diffDays <= 7
  if (range === 'month') return diffDays <= 30
  if (range === 'year') return diffDays <= 365
  return true
}

function sortEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  // For load/reps/rounds: higher is better
  // For time: lower is better (mock data uses load for now)
  return [...entries].sort((a, b) => {
    if (a.resultType === 'time') return a.resultValue - b.resultValue
    return b.resultValue - a.resultValue
  })
}

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const programId = searchParams.get('program') || MOCK_PROGRAM_ID

  const [filters, setFilters] = useState<LeaderboardFilterState>({
    rxOnly: 'all',
    gender: 'all',
    dateRange: 'week',
  })

  const [entries, setEntries] = useState<LeaderboardEntry[]>(mockLeaderboardEntries)

  const filtered = useMemo(() => {
    let result = entries.filter((e) => {
      if (filters.rxOnly === 'rx' && !e.isRx) return false
      if (filters.rxOnly === 'scaled' && e.isRx) return false
      if (filters.gender !== 'all' && e.gender !== filters.gender) return false
      if (!isWithinDateRange(e.date, filters.dateRange)) return false
      return true
    })
    result = sortEntries(result)
    // Re-rank after filtering/sorting
    return result.map((e, idx) => ({ ...e, rank: idx + 1 }))
  }, [entries, filters])

  const handleLike = (id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              likedByMe: !e.likedByMe,
              likes: e.likedByMe ? e.likes - 1 : e.likes + 1,
            }
          : e
      )
    )
  }

  const rxCount = filtered.filter((e) => e.isRx).length
  const scaledCount = filtered.filter((e) => !e.isRx).length

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-az-black-card/80 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-dark-muted hover:text-dark-primary hover:bg-dark-surface transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="text-dark-primary font-semibold text-sm truncate">{MOCK_WORKOUT_NAME}</h1>
              <p className="text-dark-muted text-xs">Leaderboard · Program #{programId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-az-black-card border border-dark-border rounded-2xl p-4 text-center">
            <Users size={18} className="mx-auto text-cyan mb-1" />
            <p className="text-xl font-bold text-dark-primary">{filtered.length}</p>
            <p className="text-[10px] text-dark-muted uppercase tracking-wide">Athletes</p>
          </div>
          <div className="bg-az-black-card border border-dark-border rounded-2xl p-4 text-center">
            <Dumbbell size={18} className="mx-auto text-success mb-1" />
            <p className="text-xl font-bold text-dark-primary">{rxCount}</p>
            <p className="text-[10px] text-dark-muted uppercase tracking-wide">Rx</p>
          </div>
          <div className="bg-az-black-card border border-dark-border rounded-2xl p-4 text-center">
            <Dumbbell size={18} className="mx-auto text-amber-500 mb-1" />
            <p className="text-xl font-bold text-dark-primary">{scaledCount}</p>
            <p className="text-[10px] text-dark-muted uppercase tracking-wide">Scaled</p>
          </div>
        </div>

        {/* Filters */}
        <LeaderboardFilter filters={filters} onChange={setFilters} />

        {/* List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-dark-primary">Results</h2>
            <span className="text-xs text-dark-muted">
              Sorted by {filtered[0]?.resultType === 'time' ? 'fastest' : 'best'} result
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-az-black-card border border-dark-border rounded-2xl">
              <p className="text-dark-secondary text-sm">No results match your filters.</p>
              <p className="text-dark-muted text-xs mt-1">Try adjusting filters to see more athletes.</p>
            </div>
          ) : (
            filtered.map((entry) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                isCurrentClient={entry.clientId === CURRENT_CLIENT_ID}
                onLike={handleLike}
              />
            ))
          )}
        </div>

        {/* Current client callout */}
        {filtered.some((e) => e.clientId === CURRENT_CLIENT_ID) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-dark-muted"
          >
            Your row is highlighted in cyan.
          </motion.div>
        )}
      </div>
    </div>
  )
}
