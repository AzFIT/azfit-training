import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Trophy, Download, Clock, Dumbbell, Calendar } from 'lucide-react'
import { toPng } from 'html-to-image'
import { toast } from 'sonner'

export interface WorkoutShareCardData {
  workoutName: string
  clientName: string
  resultLabel: string
  resultType: 'time' | 'reps' | 'load' | 'rounds'
  duration: string
  date: string
  prBadges: string[]
  isRx: boolean
}

interface WorkoutShareCardProps {
  open: boolean
  data: WorkoutShareCardData
  onClose: () => void
  onShare?: () => void
}

export default function WorkoutShareCard({ open, data, onClose, onShare }: WorkoutShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      setIsCapturing(true)
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: '#0B0C0F' })
      const link = document.createElement('a')
      link.download = `azfit-${data.workoutName.replace(/\s+/g, '-').toLowerCase()}-${data.date}.png`
      link.href = dataUrl
      link.click()
      toast.success('Card saved to downloads')
    } catch {
      toast.error('Could not save card')
    } finally {
      setIsCapturing(false)
    }
  }

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm"
      >
        {/* Shareable Card */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0C0F] to-[#111318] border border-dark-border p-6 text-center"
        >
          {/* Background glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-cyan/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-violet/10 blur-3xl pointer-events-none" />

          {/* Brand */}
          <div className="relative flex items-center justify-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-cyan flex items-center justify-center">
              <Dumbbell size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">AzFIT</span>
          </div>

          {/* Workout */}
          <p className="relative text-xs font-semibold text-cyan uppercase tracking-wider mb-1">
            Workout Complete
          </p>
          <h2 className="relative text-xl font-bold text-white mb-4 leading-tight">
            {data.workoutName}
          </h2>

          {/* Result */}
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
            <p className="text-[11px] text-dark-muted uppercase tracking-wide mb-1">
              {data.resultType === 'time' && 'Time'}
              {data.resultType === 'reps' && 'Reps'}
              {data.resultType === 'load' && 'Top Set'}
              {data.resultType === 'rounds' && 'Rounds'}
            </p>
            <p className="text-3xl font-extrabold text-white mb-2">{data.resultLabel}</p>
            <div className="flex items-center justify-center gap-3 text-[11px] text-dark-muted">
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                {data.duration}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={11} />
                {data.date}
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="relative flex flex-wrap items-center justify-center gap-2 mb-5">
            <span
              className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                data.isRx
                  ? 'bg-success/20 text-success border border-success/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {data.isRx ? 'Rx' : 'Scaled'}
            </span>
            {data.prBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-semibold bg-violet/20 text-violet border border-violet/30"
              >
                <Trophy size={10} />
                {badge}
              </span>
            ))}
          </div>

          {/* Athlete */}
          <p className="relative text-sm text-dark-secondary">
            Crushed by <span className="text-white font-semibold">{data.clientName}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-dark-surface text-dark-secondary text-sm font-medium hover:bg-dark-hover transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={isCapturing}
            className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            <Download size={14} />
            {isCapturing ? 'Saving…' : 'Save'}
          </button>
          {onShare && (
            <button
              onClick={onShare}
              className="flex-1 py-2.5 rounded-xl bg-cyan text-white text-sm font-semibold hover:bg-cyan-dark transition-colors inline-flex items-center justify-center gap-2"
            >
              <Share2 size={14} />
              Share
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
