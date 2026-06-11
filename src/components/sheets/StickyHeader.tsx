/**
 * StickyHeader — Elapsed timer + session name for workout view
 */

import { Clock, MoreVertical } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface StickyHeaderProps {
  programName: string
  phaseName?: string
  clientName?: string
  elapsedSeconds: number
  onPause?: () => void
  onCancel?: () => void
  onEditName?: () => void
}

export default function StickyHeader({
  programName,
  phaseName,
  clientName,
  elapsedSeconds,
  onPause,
  onCancel,
  onEditName,
}: StickyHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[var(--card-border)]">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Timer */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan" />
          <span className="text-lg font-mono font-bold text-[var(--text-primary)] tabular-nums">
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        {/* Center: Session info */}
        <div className="flex-1 text-center px-4">
          <h1 className="text-sm font-semibold text-[var(--text-primary)] truncate">{programName}</h1>
          {phaseName && (
            <p className="text-xs text-[var(--text-muted)]">
              {phaseName}
              {clientName && ` • ${clientName}`}
            </p>
          )}
        </div>

        {/* Right: Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-border)] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-44 rounded-xl shadow-lg border py-1 z-40"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              {onPause && (
                <button
                  onClick={() => { onPause(); setShowMenu(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-border)] transition-colors"
                >
                  Pause workout
                </button>
              )}
              {onEditName && (
                <button
                  onClick={() => { onEditName(); setShowMenu(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-border)] transition-colors"
                >
                  Edit session name
                </button>
              )}
              {onCancel && (
                <button
                  onClick={() => { onCancel(); setShowMenu(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Cancel workout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
