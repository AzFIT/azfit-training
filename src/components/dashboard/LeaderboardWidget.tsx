import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, ArrowRight, Medal, Award, Loader2 } from 'lucide-react'
import { mockLeaderboardEntries, MOCK_PROGRAM_ID } from '../leaderboard/mockData'
import type { LeaderboardEntry } from '../leaderboard/types'
import { getLeaderboard, type WorkoutResult } from '../../services/workoutApi'

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={14} className="text-yellow-400" />
  if (rank === 2) return <Medal size={14} className="text-slate-300" />
  if (rank === 3) return <Award size={14} className="text-amber-600" />
  return <span className="text-xs font-bold text-dark-muted w-4 text-center">{rank}</span>
}

function resultToEntry(r: WorkoutResult, idx: number): LeaderboardEntry {
  return {
    id: r.result_id,
    rank: idx + 1,
    clientId: r.client_id,
    clientName: r.client_id === 'c-current' ? 'You' : `Athlete ${r.client_id.slice(0, 6)}`,
    clientInitials: r.client_id === 'c-current' ? 'YU' : r.client_id.slice(0, 2).toUpperCase(),
    gender: 'other',
    resultValue: Number(r.result_value),
    resultType: r.result_type,
    resultLabel: r.result_label,
    isRx: r.is_rx,
    date: r.date,
    likes: r.likes || 0,
    likedByMe: (r.liked_by || []).includes('c-current'),
    prBadges: r.pr_badges || [],
  }
}

export default function LeaderboardWidget() {
  const navigate = useNavigate()
  const [dbResults, setDbResults] = useState<WorkoutResult[]>([])
  const [loading, setLoading] = useState(false)
  const [useMock, setUseMock] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getLeaderboard({ programId: Number(MOCK_PROGRAM_ID) || undefined, dateRange: 'week', limit: 3 })
      .then((data) => {
        if (!cancelled) {
          if (data.length === 0) {
            setUseMock(true)
          } else {
            setUseMock(false)
            setDbResults(data)
          }
        }
      })
      .catch(() => {
        if (!cancelled) setUseMock(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const topThree = useMemo(() => {
    const source = useMock ? mockLeaderboardEntries : dbResults.map((r, i) => resultToEntry(r, i))
    return source
      .sort((a, b) => b.resultValue - a.resultValue)
      .slice(0, 3)
      .map((e, idx) => ({ ...e, rank: idx + 1 }))
  }, [useMock, dbResults])

  return (
    <div className="rounded-2xl border border-dark-border bg-az-black-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-cyan" />
          <h3 className="text-base font-semibold text-dark-primary">This Week&apos;s Leaders</h3>
        </div>
        <button
          onClick={() => navigate(`/leaderboard?program=${MOCK_PROGRAM_ID}`)}
          className="inline-flex items-center gap-1 text-xs font-medium text-cyan hover:text-cyan-light transition-colors"
        >
          View Full Leaderboard
          <ArrowRight size={12} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6 text-xs text-dark-muted">
          <Loader2 size={14} className="animate-spin mr-2" />
          Loading...
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {useMock && topThree.length > 0 && (
            <div className="text-center mb-2">
              <span className="text-[10px] text-dark-muted bg-dark-surface px-2 py-0.5 rounded">Demo data</span>
            </div>
          )}
          {topThree.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-surface/50 hover:bg-dark-surface transition-colors"
            >
              <div className="w-6 flex items-center justify-center flex-shrink-0">
                <RankIcon rank={entry.rank} />
              </div>
              <div className="w-8 h-8 rounded-full bg-dark-surface flex items-center justify-center text-[10px] font-bold text-dark-primary flex-shrink-0">
                {entry.clientInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-primary truncate">{entry.clientName}</p>
                <p className="text-[10px] text-dark-muted">{entry.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-dark-primary">{entry.resultLabel}</p>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    entry.isRx ? 'bg-success/15 text-success' : 'bg-amber-500/15 text-amber-500'
                  }`}
                >
                  {entry.isRx ? 'Rx' : 'Scaled'}
                </span>
              </div>
            </motion.div>
          ))}
          {topThree.length === 0 && (
            <div className="text-center py-6 text-xs text-dark-muted">
              No leaderboard data yet. Complete a workout to see results!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
