import { SESSION_COLORS, SESSION_TYPE_LABELS } from './constants'
import type { CalendarSession } from './types'

interface DailySummaryPanelProps {
  sessions: CalendarSession[]
}

export function DailySummaryPanel({ sessions }: DailySummaryPanelProps) {
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0)
  const uniqueClients = [...new Set(sessions.map((s) => s.clientName))].length

  return (
    <div className="hidden xl:block w-80 border-l border-light-border bg-white p-5 overflow-auto">
      <h3 className="text-light-primary font-semibold text-base mb-4">Daily Summary</h3>

      <div className="space-y-3 mb-6">
        <div className="bg-light-surface rounded-xl p-4 border border-light-border">
          <p className="text-light-muted text-xs mb-1">Total Sessions</p>
          <p className="text-light-primary text-2xl font-bold font-mono">{sessions.length}</p>
        </div>
        <div className="bg-light-surface rounded-xl p-4 border border-light-border">
          <p className="text-light-muted text-xs mb-1">Total Duration</p>
          <p className="text-light-primary text-2xl font-bold font-mono">{totalDuration} min</p>
        </div>
        <div className="bg-light-surface rounded-xl p-4 border border-light-border">
          <p className="text-light-muted text-xs mb-1">Clients Seen</p>
          <p className="text-light-primary text-2xl font-bold font-mono">{uniqueClients}</p>
        </div>
      </div>

      <div className="border-t border-light-border pt-4">
        <h4 className="text-light-secondary text-sm font-medium mb-3">Session Breakdown</h4>
        {SESSION_TYPE_LABELS.map((type) => {
          const count = sessions.filter((s) => s.type === type).length
          if (count === 0) return null
          return (
            <div key={type} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: SESSION_COLORS[type].text }} />
                <span className="text-light-secondary text-xs">{type}</span>
              </div>
              <span className="text-light-primary text-xs font-semibold">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
