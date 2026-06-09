import { ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ViewToggle } from './ViewToggle'
import type { ViewMode, SessionType } from './types'
import { SESSION_TYPE_LABELS } from './constants'

interface CalendarToolbarProps {
  view: ViewMode
  setView: (v: ViewMode) => void
  filterType: SessionType | 'All'
  setFilterType: (v: SessionType | 'All') => void
  dateDisplay: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onNewSession: () => void
}

export function CalendarToolbar({
  view,
  setView,
  filterType,
  setFilterType,
  dateDisplay,
  onPrev,
  onNext,
  onToday,
  onNewSession,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 lg:px-6 py-3 bg-[white] border-b border-[light-border] flex-shrink-0">
      <ViewToggle view={view} setView={setView} />
      <div className="flex items-center gap-2">
        <button onClick={onPrev} className="w-8 h-8 flex items-center justify-center rounded-lg text-[light-secondary] hover:text-[light-primary] hover:bg-[light-hover] transition-colors" aria-label="Previous"><ChevronLeft size={16} /></button>
        <h2 className="text-[light-primary] font-semibold text-sm min-w-[160px] text-center">{dateDisplay}</h2>
        <button onClick={onNext} className="w-8 h-8 flex items-center justify-center rounded-lg text-[light-secondary] hover:text-[light-primary] hover:bg-[light-hover] transition-colors" aria-label="Next"><ChevronRight size={16} /></button>
        <button onClick={onToday} className="ml-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[light-secondary] hover:text-[light-primary] hover:bg-[light-hover] transition-colors border border-[light-border]">Today</button>
      </div>
      <div className="flex items-center gap-2">
        <Select value={filterType} onValueChange={(v) => setFilterType(v as SessionType | 'All')}>
          <SelectTrigger className="w-[150px] h-8 bg-[light-surface] border-[light-border] text-[light-primary] text-xs"><Filter size={12} className="mr-1 text-[light-muted]" /><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[light-surface] border-[light-border]">
            <SelectItem value="All" className="text-[light-primary]">All Types</SelectItem>
            {SESSION_TYPE_LABELS.map((t) => <SelectItem key={t} value={t} className="text-[light-primary]">{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <button onClick={onNewSession} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan hover:bg-cyan-hover text-white rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"><Plus size={14} /><span className="hidden sm:inline">New Session</span></button>
      </div>
    </div>
  )
}
