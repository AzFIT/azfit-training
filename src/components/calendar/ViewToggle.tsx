import { CalendarDays, Clock, LayoutGrid, List } from 'lucide-react'
import type { ViewMode } from './types'

interface ViewToggleProps {
  view: ViewMode
  setView: (v: ViewMode) => void
}

export function ViewToggle({
  view,
  setView,
}: ViewToggleProps) {
  const views: { key: ViewMode; label: string; icon: typeof CalendarDays }[] = [
    { key: 'week', label: 'Week', icon: CalendarDays },
    { key: 'day', label: 'Day', icon: Clock },
    { key: 'month', label: 'Month', icon: LayoutGrid },
    { key: 'agenda', label: 'Agenda', icon: List },
  ]

  return (
    <div className="flex items-center gap-1 bg-light-surface rounded-lg p-1 border border-light-border">
      {views.map((v) => {
        const active = view === v.key
        const Icon = v.icon
        return (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              active
                ? 'bg-light-hover text-light-primary border border-light-border'
                : 'text-light-muted hover:text-light-secondary hover:bg-light-border'
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        )
      })}
    </div>
  )
}
