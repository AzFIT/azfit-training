import { motion } from 'framer-motion'
import { X, Download, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProgressPhoto } from './types'
import { ease } from './types'
import { fmtDate, daysBetween } from './utils'

export default function ComparisonView({
  left,
  right,
  onClose,
}: {
  left: ProgressPhoto
  right: ProgressPhoto
  onClose: () => void
}) {
  const weightDelta = right.weight && left.weight ? right.weight - left.weight : null
  const bfDelta = right.bodyFatPercentage && left.bodyFatPercentage ? right.bodyFatPercentage - left.bodyFatPercentage : null
  const days = daysBetween(left.date, right.date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease }}
      className="space-y-4"
    >
      {/* Header Bar */}
      <div className="bg-az-black-card border border-dark-border rounded-xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left info */}
        <div className="text-center lg:text-left">
          <p className="text-dark-muted text-xs mb-1">Before</p>
          <p className="text-dark-primary font-mono text-sm font-semibold">{fmtDate(left.date)}</p>
          <p className="text-dark-secondary text-xs font-mono">{left.weight} kg · {left.bodyFatPercentage}% BF</p>
        </div>

        {/* Delta */}
        <div className="text-center">
          <p className="text-dark-muted text-xs mb-1">{days} days between photos</p>
          <div className="flex items-center gap-4 justify-center">
            {weightDelta !== null && (
              <p className={`font-semibold font-mono text-lg ${weightDelta < 0 ? 'text-success' : weightDelta > 0 ? 'text-danger' : 'text-dark-secondary'}`}>
                {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
              </p>
            )}
            {bfDelta !== null && (
              <p className={`font-semibold font-mono text-lg ${bfDelta < 0 ? 'text-success' : bfDelta > 0 ? 'text-danger' : 'text-dark-secondary'}`}>
                {bfDelta > 0 ? '+' : ''}{bfDelta.toFixed(1)}% BF
              </p>
            )}
          </div>
          {weightDelta !== null && weightDelta < 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(34,197,94,0.15)] text-success">
              Progress!
            </span>
          )}
        </div>

        {/* Right info */}
        <div className="text-center lg:text-right">
          <p className="text-dark-muted text-xs mb-1">After</p>
          <p className="text-dark-primary font-mono text-sm font-semibold">{fmtDate(right.date)}</p>
          <p className="text-dark-secondary text-xs font-mono">{right.weight} kg · {right.bodyFatPercentage}% BF</p>
        </div>

        {/* Close */}
        <Button variant="ghost" size="sm" className="text-dark-secondary hover:text-dark-primary" onClick={onClose}>
          <X size={16} className="mr-1" />
          Close
        </Button>
      </div>

      {/* Photo Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-az-black border border-dark-border rounded-xl overflow-hidden">
          <div className="relative">
            <img src={left.url} alt="" className="w-full h-[400px] lg:h-[500px] object-contain bg-az-black" />
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded-md text-xs text-white font-medium">
              {left.category} · {fmtDate(left.date)}
            </div>
          </div>
        </div>
        <div className="bg-az-black border border-dark-border rounded-xl overflow-hidden">
          <div className="relative">
            <img src={right.url} alt="" className="w-full h-[400px] lg:h-[500px] object-contain bg-az-black" />
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded-md text-xs text-white font-medium">
              {right.category} · {fmtDate(right.date)}
            </div>
            {right.isGoalAchieved && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-[rgba(34,197,94,0.9)] rounded-md text-xs text-white font-medium flex items-center gap-1">
                <Trophy size={12} /> Goal!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" className="border-dark-border text-dark-secondary">
          <Download size={16} className="mr-2" />
          Download Comparison
        </Button>
      </div>
    </motion.div>
  )
}
