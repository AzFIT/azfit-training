import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { CheckCircle2 } from 'lucide-react'
import type { CalendarSession } from './types'
import { SESSION_COLORS } from './constants'
import { getSessionPosition, addMinutes } from './utils'

interface SessionOverlayProps {
  session: CalendarSession
  onEventClick: (session: CalendarSession) => void
  minHeight: number
  hasWorkout?: boolean
}

export function SessionOverlay({
  session,
  onEventClick,
  minHeight,
  hasWorkout,
}: SessionOverlayProps) {
  const { top, height } = getSessionPosition(session, minHeight)
  const colors = SESSION_COLORS[session.type]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
      className="absolute left-1 right-1 rounded-lg p-1.5 cursor-pointer overflow-hidden group"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        zIndex: 10,
      }}
      onClick={(e) => { e.stopPropagation(); onEventClick(session) }}
    >
      <div className="flex items-start justify-between">
        <p className="text-white text-[11px] font-semibold truncate leading-tight flex-1">{session.clientName}</p>
        {hasWorkout && (
          <CheckCircle2 size={10} className="text-success flex-shrink-0 ml-1" />
        )}
      </div>
      <p className="text-[9px] opacity-80 truncate" style={{ color: colors.text }}>{session.type}</p>
      <p className="text-[9px] text-[light-muted] font-mono truncate">
        {format(session.startTime, 'HH:mm')} - {format(addMinutes(session.startTime, session.duration), 'HH:mm')}
      </p>
      <div
        className="absolute bottom-1 left-1.5 right-1.5 h-[2px] rounded-full opacity-30"
        style={{ background: colors.text }}
      />
    </motion.div>
  )
}
