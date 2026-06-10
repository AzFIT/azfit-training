import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, isToday, isSameDay, addDays } from 'date-fns'
import type { CalendarSession, SessionType } from './types'
import { SESSION_COLORS } from './constants'
import { useFilteredSessions } from './hooks/useFilteredSessions'
import { addMinutes } from './utils'

interface AgendaViewProps {
  sessions: CalendarSession[]
  filterType: SessionType | 'All'
  onEventClick: (session: CalendarSession) => void
}

export function AgendaView({
  sessions,
  filterType,
  onEventClick,
}: AgendaViewProps) {
  const filtered = useFilteredSessions(sessions, filterType)

  const grouped = useMemo(() => {
    const groups: Record<string, CalendarSession[]> = {}
    filtered.forEach((s) => {
      const key = format(s.startTime, 'yyyy-MM-dd')
      if (!groups[key]) groups[key] = []
      groups[key].push(s)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const now = new Date()

  const getGroupLabel = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isToday(d)) return 'Today'
    if (isSameDay(d, addDays(now, 1))) return 'Tomorrow'
    if (d < now) return 'Past'
    return format(d, 'EEEE, d MMMM yyyy')
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="max-w-[900px] mx-auto space-y-4">
        {grouped.length === 0 && (
          <div className="text-center py-16">
            <p className="text-light-muted text-sm">No sessions found</p>
          </div>
        )}

        {grouped.map(([dateStr, daySessions]) => (
          <div key={dateStr}>
            <h3 className="text-light-primary font-semibold text-sm mb-2 px-1">
              {getGroupLabel(dateStr)}
              <span className="text-light-muted font-normal ml-2">
                {format(new Date(dateStr), 'dd/MM/yyyy')}
              </span>
            </h3>

            <div className="space-y-1">
              {daySessions.map((session, idx) => {
                const colors = SESSION_COLORS[session.type]
                const endTime = addMinutes(session.startTime, session.duration)

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-4 bg-white border border-light-border rounded-xl px-4 py-3 cursor-pointer hover:bg-light-border transition-colors"
                    onClick={() => onEventClick(session)}
                  >
                    {/* Time */}
                    <div className="w-20 flex-shrink-0">
                      <p className="text-light-primary text-sm font-mono font-medium">
                        {format(session.startTime, 'HH:mm')}
                      </p>
                      <p className="text-light-muted text-xs font-mono">
                        {format(endTime, 'HH:mm')}
                      </p>
                    </div>

                    {/* Color indicator */}
                    <div
                      className="w-1 h-10 rounded-full flex-shrink-0"
                      style={{ background: colors.text }}
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-light-primary text-sm font-semibold truncate">
                        {session.clientName}
                      </p>
                      <p className="text-light-muted text-xs">{session.duration} min</p>
                    </div>

                    {/* Type badge */}
                    <div
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
                      style={{
                        background: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {session.type}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
