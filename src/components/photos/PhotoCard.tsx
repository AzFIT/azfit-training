import { motion } from 'framer-motion'
import { Check, Columns2, Download, Trash2, Star, Trophy } from 'lucide-react'
import type { ProgressPhoto } from './types'
import { ease } from './types'
import { fmtDate } from './utils'

export default function PhotoCard({
  photo,
  index,
  compareMode,
  selected,
  onSelect,
  onClick,
}: {
  photo: ProgressPhoto
  index: number
  compareMode: boolean
  selected: boolean
  onSelect: () => void
  onClick: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease }}
      className={`group relative bg-[az-black-card] border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
        selected ? 'border-cyan ring-2 ring-[rgba(0,174,239,0.3)]' : 'border-dark-border hover:border-[rgba(0,174,239,0.3)]'
      }`}
      onClick={() => {
        if (compareMode) {
          onSelect()
        } else {
          onClick()
        }
      }}
    >
      {/* Image */}
      <div className="relative h-[240px] overflow-hidden">
        <img
          src={photo.thumbnailUrl}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Compare checkbox */}
        {compareMode && (
          <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
              selected ? 'bg-cyan border-cyan' : 'bg-black/50 border-white/50'
            }`}>
              {selected && <Check size={14} className="text-white" />}
            </div>
          </div>
        )}

        {/* Milestone badges */}
        {(photo.isMilestone || photo.isGoalAchieved) && (
          <div className="absolute top-3 right-3 flex gap-1 z-10">
            {photo.isMilestone && <Star size={14} className="text-warning fill-[warning]" />}
            {photo.isGoalAchieved && <Trophy size={14} className="text-success fill-[success]" />}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.9)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-xs font-mono">{fmtDate(photo.date)}</p>
              {photo.weight && <p className="text-white/80 text-[10px] font-mono">{photo.weight} kg · {photo.bodyFatPercentage}% BF</p>}
            </div>
            {!compareMode && (
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Columns2 size={12} />
                </button>
                <button className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Download size={12} />
                </button>
                <button className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:text-danger hover:bg-white/20 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="p-3 flex items-center justify-between">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-glow text-cyan">
          {photo.category}
        </span>
        {photo.notes && (
          <span className="text-dark-muted text-[10px] truncate max-w-[120px]">{photo.notes}</span>
        )}
      </div>
    </motion.div>
  )
}
