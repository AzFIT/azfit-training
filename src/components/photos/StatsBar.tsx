import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, CalendarDays, Clock, Folder } from 'lucide-react'
import type { ProgressPhoto } from './types'
import { ease } from './types'
import { fmtDate, daysBetween } from './utils'

export default function StatsBar({ photos }: { photos: ProgressPhoto[] }) {
  const stats = useMemo(() => {
    const first = photos.length > 0 ? photos[photos.length - 1].date : ''
    const latest = photos.length > 0 ? photos[0].date : ''
    const cats = new Set(photos.map((p) => p.category))
    return {
      total: photos.length,
      first: first ? fmtDate(first) : '-',
      firstRaw: first,
      latest: latest ? fmtDate(latest) : '-',
      days: first ? daysBetween(first, new Date().toISOString().slice(0, 10)) : 0,
      categories: `${cats.size}/4`,
    }
  }, [photos])

  const items = [
    { label: 'Total Photos', value: String(stats.total), icon: Camera },
    { label: 'Tracking Since', value: stats.first, icon: CalendarDays },
    { label: 'Days Tracked', value: `${stats.days} days`, icon: Clock },
    { label: 'Latest Upload', value: stats.latest, icon: Upload },
    { label: 'Categories', value: stats.categories, icon: Folder },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {items.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease }}
          className="bg-az-black-card border border-dark-border rounded-xl px-5 py-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <s.icon size={16} className="text-cyan" />
            <span className="text-dark-muted text-xs">{s.label}</span>
          </div>
          <p className="text-dark-primary font-semibold text-lg font-mono">{s.value}</p>
        </motion.div>
      ))}
    </div>
  )
}
