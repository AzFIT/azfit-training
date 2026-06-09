import { motion } from 'framer-motion'
import { Heart, Trophy, Medal, Award } from 'lucide-react'
import type { LeaderboardEntry } from './types'

interface LeaderboardRowProps {
  entry: LeaderboardEntry
  isCurrentClient: boolean
  onLike: (id: string) => void
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={18} className="text-yellow-400" />
  if (rank === 2) return <Medal size={18} className="text-slate-300" />
  if (rank === 3) return <Award size={18} className="text-amber-600" />
  return <span className="text-sm font-bold text-dark-muted w-5 text-center">{rank}</span>
}

export default function LeaderboardRow({ entry, isCurrentClient, onLike }: LeaderboardRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
        isCurrentClient
          ? 'bg-cyan/10 border-cyan/40'
          : 'bg-[az-black-card] border-dark-border hover:border-dark-divider'
      }`}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        <RankIcon rank={entry.rank} />
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-dark-surface flex items-center justify-center flex-shrink-0 text-xs font-bold text-dark-primary">
        {entry.avatar ? (
          <img src={entry.avatar} alt={entry.clientName} className="w-full h-full rounded-full object-cover" />
        ) : (
          entry.clientInitials
        )}
      </div>

      {/* Name + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold truncate ${isCurrentClient ? 'text-cyan' : 'text-dark-primary'}`}>
            {entry.clientName}
          </span>
          {isCurrentClient && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan/20 text-cyan font-medium">You</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              entry.isRx ? 'bg-success/15 text-success' : 'bg-amber-500/15 text-amber-500'
            }`}
          >
            {entry.isRx ? 'Rx' : 'Scaled'}
          </span>
          {entry.prBadges.map((badge) => (
            <span key={badge} className="text-[10px] px-1.5 py-0.5 rounded bg-violet/15 text-violet font-medium">
              {badge}
            </span>
          ))}
          <span className="text-[10px] text-dark-muted">{entry.date}</span>
        </div>
      </div>

      {/* Result */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-dark-primary">{entry.resultLabel}</p>
        <p className="text-[10px] text-dark-muted capitalize">{entry.resultType}</p>
      </div>

      {/* Likes */}
      <button
        onClick={() => onLike(entry.id)}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          entry.likedByMe
            ? 'bg-rose-500/15 text-rose-400'
            : 'bg-dark-surface text-dark-muted hover:bg-dark-hover'
        }`}
        aria-label={entry.likedByMe ? 'Unlike' : 'Like'}
      >
        <Heart size={14} className={entry.likedByMe ? 'fill-current' : ''} />
        {entry.likes}
      </button>
    </motion.div>
  )
}
