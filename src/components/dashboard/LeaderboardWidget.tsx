import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, ArrowRight, Medal, Award } from 'lucide-react'
import { mockLeaderboardEntries, MOCK_PROGRAM_ID } from '../leaderboard/mockData'

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={14} className="text-yellow-400" />
  if (rank === 2) return <Medal size={14} className="text-slate-300" />
  if (rank === 3) return <Award size={14} className="text-amber-600" />
  return <span className="text-xs font-bold text-dark-muted w-4 text-center">{rank}</span>
}

export default function LeaderboardWidget() {
  const navigate = useNavigate()

  const topThree = useMemo(() => {
    return [...mockLeaderboardEntries]
      .sort((a, b) => b.resultValue - a.resultValue)
      .slice(0, 3)
      .map((e, idx) => ({ ...e, rank: idx + 1 }))
  }, [])

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

      <div className="space-y-2">
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
      </div>
    </div>
  )
}
