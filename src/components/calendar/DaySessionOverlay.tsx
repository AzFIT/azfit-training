import { motion } from 'framer-motion'
import { User, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import type { CalendarSession } from './types'
import { SESSION_COLORS } from './constants'
import { getSessionPosition } from './utils'

interface DaySessionOverlayProps {
  session: CalendarSession
  onEventClick: (session: CalendarSession) => void
  hasWorkout?: boolean
}

export function DaySessionOverlay({
  session,
  onEventClick,
  hasWorkout,
}: DaySessionOverlayProps) {
  const { top, height } = getSessionPosition(session, 40)
  const colors = SESSION_COLORS[session.type]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="absolute left-2 right-2 rounded-lg p-2.5 cursor-pointer overflow-hidden group"
      style={{ top: `${top}px`, height: `${height}px`, background: colors.bg, border: `1px solid ${colors.border}`, zIndex: 10 }}
      onClick={(e) => { e.stopPropagation(); onEventClick(session) }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: colors.border }}>
          <User size={14} style={{ color: colors.text }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-white text-sm font-semibold truncate">{session.clientName}</p>
            {hasWorkout && <CheckCircle2 size={10} className="text-success flex-shrink-0" />}
          </div>
          <p className="text-[10px] opacity-80" style={{ color: colors.text }}>{session.type}</p>
        </div>
        <span className="text-[10px] text-light-muted font-mono">{format(session.startTime, 'HH:mm')}</span>
      </div>
      <p className="text-[10px] text-light-muted mt-1">Duration: {session.duration} min</p>
      <div className="absolute bottom-1.5 left-2.5 right-2.5 h-[3px] rounded-full opacity-30" style={{ background: colors.text }} />
    </motion.div>
  )
}
